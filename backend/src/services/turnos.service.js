// ── turnos.service.js ── Lógica de negocio para turnos y tutores ──
// Contiene las reglas de disponibilidad, superposición horaria,
// creación/edición de turnos y el registro automático de historial.

import { Turno, Tutor, HistorialTurno, Usuario } from '../models/index.js';
//  - fn  → permite usar funciones SQL de agregación como COUNT(). Ej: fn('COUNT', ...)
//  - col → referencia una columna de la tabla dentro de esas funciones. Ej: col('id')  PARA RESUMEN ADMIN
import { Op, fn, col } from 'sequelize';

// Error personalizado con statusCode para que el errorHandler responda con el HTTP correcto.
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

/**
 * Convierte una fecha "YYYY-MM-DD" al nombre del día de la semana en español.
 * Se usa para comparar con el campo diasDisponibles del tutor.
 * Se construye con (year, month-1, day) para evitar desfases de timezone.
 */
const getDiaSemana = (fechaString) => {
    const [year, month, day] = fechaString.split('-');
    const date = new Date(year, month - 1, day);
    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    return dias[date.getDay()];
};

/**
 * Convierte un string de hora "HH:mm" a minutos (ej. "08:30" -> 510).
 */
const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours * 60) + (minutes || 0);
};

/**
 * Valida que un tutor pueda atender en la fecha y franja horaria indicadas.
 * Chequea: existencia del tutor, estado activo, día disponible y
 * que no haya superposición con otros turnos vigentes (solicitado/confirmado).
 * @param {number} turnoIdAIgnorar - En edición, excluye el turno actual de la comprobación.
 */
const validarDisponibilidad = async (tutorId, fecha, horaInicio, horaFin, turnoIdAIgnorar = null) => {
    // Regla de negocio: la fecha del turno no puede estar en el pasado.
    const hoy = new Date().toISOString().slice(0, 10);
    if (fecha < hoy) {
        throw new AppError("La fecha no puede estar en el pasado", 400);
    }

    const tutor = await Tutor.findByPk(tutorId);
    
    if (!tutor) {
        throw new AppError("El tutor no existe", 404);
    }
    
    if (!tutor.activo) {
        throw new AppError("El tutor no está activo", 400);
    }

    const diaSemana = getDiaSemana(fecha);
    if (!tutor.diasDisponibles || !tutor.diasDisponibles.includes(diaSemana)) {
        throw new AppError("El tutor no atiende ese día", 400);
    }

    // Buscar turnos vigentes del mismo tutor en la misma fecha
    const whereClause = {
        tutorId,
        fecha,
        estado: {
            [Op.in]: ['solicitado', 'confirmado']
        }
    };
    
    if (turnoIdAIgnorar) {
        whereClause.id = { [Op.ne]: turnoIdAIgnorar };
    }

    const turnosExistentes = await Turno.findAll({ where: whereClause });

    const inicioMin = timeToMinutes(horaInicio);
    const finMin = timeToMinutes(horaFin);

    if (finMin - inicioMin > 120) {
        throw new AppError("Un turno no puede durar más de 2 horas", 400);
    }

    if (inicioMin < 480 || finMin > 1200) {
        throw new AppError("El horario de atención es de 08:00 a 20:00", 400);
    }

    // Verificar superposición usando minutos
    for (const otro of turnosExistentes) {
        const otroInicioMin = timeToMinutes(otro.horaInicio);
        const otroFinMin = timeToMinutes(otro.horaFin);
        
        if (inicioMin < otroFinMin && finMin > otroInicioMin) {
            throw new AppError("El tutor no está disponible en esa franja horaria", 400);
        }
    }
};

/**
 * Crea un nuevo turno con estado "solicitado" y registra la acción en el historial.
 * Antes de persistir, valida disponibilidad completa del tutor.
 */
const crearTurno = async (datosTurno, estudianteId) => {
    const { tutorId, fecha, horaInicio, horaFin, tema, modalidad, observaciones } = datosTurno;

    if (timeToMinutes(horaInicio) >= timeToMinutes(horaFin)) {
        throw new AppError("La hora de inicio debe ser anterior a la hora de fin", 400);
    }

    await validarDisponibilidad(tutorId, fecha, horaInicio, horaFin);

    const nuevoTurno = await Turno.create({
        tutorId,
        estudianteId,
        fecha,
        horaInicio,
        horaFin,
        tema,
        modalidad,
        observaciones,
        estado: 'solicitado'
    });

    // Registrar en historial (auditoría de creación)
    await registrarHistorial(nuevoTurno.id, estudianteId, 'creacion', null, nuevoTurno.toJSON());

    return nuevoTurno;
};

/**
 * Edita un turno existente. Revalida disponibilidad si cambian datos de
 * horario o tutor. Registra el cambio en el historial con valor anterior y nuevo.
 * Restricciones: no se pueden editar turnos cancelados; en turnos realizados
 * solo se permite modificar las observaciones.
 */
const editarTurno = async (turnoId, datosActualizados, usuarioId) => {
    const turno = await Turno.findByPk(turnoId);
    if (!turno) {
        throw new AppError("El turno no existe", 404);
    }

    if (turno.estado === 'cancelado') {
        throw new AppError("No se puede editar un turno cancelado", 400);
    }

    if (turno.estado === 'realizado') {
        const keys = Object.keys(datosActualizados);
        if (keys.some(k => k !== 'observaciones')) {
            throw new AppError("No se puede modificar turnos realizados salvo observaciones", 400);
        }
    }

    const newTutorId = datosActualizados.tutorId || turno.tutorId;
    const newFecha = datosActualizados.fecha || turno.fecha;
    const newHoraInicio = datosActualizados.horaInicio || turno.horaInicio;
    const newHoraFin = datosActualizados.horaFin || turno.horaFin;

    // Solo revalidar disponibilidad si cambiaron datos que afectan la agenda
    if (
        datosActualizados.tutorId ||
        datosActualizados.fecha ||
        datosActualizados.horaInicio ||
        datosActualizados.horaFin
    ) {
        if (timeToMinutes(newHoraInicio) >= timeToMinutes(newHoraFin)) {
            throw new AppError("La hora de inicio debe ser anterior a la hora de fin", 400);
        }
        await validarDisponibilidad(newTutorId, newFecha, newHoraInicio, newHoraFin, turnoId);
    }

    const valorAnterior = turno.toJSON();
    await turno.update(datosActualizados);

    // Registrar en historial (auditoría de edición)
    await registrarHistorial(turno.id, usuarioId, 'edicion', valorAnterior, turno.toJSON());

    return turno;
};

/**
 * Devuelve la lista de tutores activos con id, nombre y especialidad.
 * Se usa para poblar el <select> del formulario de turnos en el frontend.
 */
const listarTutoresParaSelect = async () => {
    return await Tutor.findAll({
        where: { activo: true },
        attributes: ['id', 'nombre', 'especialidad', 'diasDisponibles']
    });
};

/**
 * Registra una acción en la tabla de auditoría (historial_turnos).
 */
const registrarHistorial = async (turnoId, usuarioId, accion, valorAnterior = null, valorNuevo = null) => {
    await HistorialTurno.create({
        turnoId,
        usuarioId,
        accion,
        valorAnterior,
        valorNuevo
    });
};

/**
 * Cambia el estado de un turno validando el flujo de estados permitido:
 * - solicitado -> confirmado | cancelado
 * - confirmado -> realizado | cancelado
 * Cualquier otra transición lanza un error 400.
 */
const cambiarEstado = async (turnoId, nuevoEstado, usuarioId) => {
    const turno = await Turno.findByPk(turnoId);
    if (!turno) {
        throw new AppError("El turno no existe", 404);
    }

    const estadoActual = turno.estado;

    // Mapeo de estados a verbos en infinitivo para los mensajes de error
    const verbosAccion = {
        confirmado: 'confirmar',
        cancelado: 'cancelar',
        realizado: 'realizar'
    };

    const verbosHistorial = {
        confirmado: 'confirmacion',
        cancelado: 'cancelacion',
        realizado: 'realizacion'
    };

    const accion = verbosAccion[nuevoEstado];
    const accionHistorial = verbosHistorial[nuevoEstado];

    if (!accion) {
        throw new AppError("Estado de destino no válido", 400);
    }

    // Validar la transición permitida
    let transicionValida = false;
    if (estadoActual === 'solicitado') {
        if (nuevoEstado === 'confirmado' || nuevoEstado === 'cancelado') {
            transicionValida = true;
        }
    } else if (estadoActual === 'confirmado') {
        if (nuevoEstado === 'realizado' || nuevoEstado === 'cancelado') {
            transicionValida = true;
        }
    }

    if (!transicionValida) {
        throw new AppError(`No se puede ${accion} un turno ${estadoActual}`, 400);
    }

    const valorAnterior = turno.toJSON();
    await turno.update({ estado: nuevoEstado });
    const valorNuevo = turno.toJSON();

    await registrarHistorial(turno.id, usuarioId, accionHistorial, valorAnterior, valorNuevo);

    return turno;
};

/**
 * Obtiene el detalle de un turno específico, incluyendo la información
 * del tutor y del estudiante.
 * Lanza un error 404 si el turno no existe.
 */
const obtenerDetalle = async (turnoId) => {
    const turno = await Turno.findByPk(turnoId, {
        include: [
            {
                model: Tutor
            },
            {
                model: Usuario,
                attributes: ['id', 'nombre', 'email', 'rol']
            }
        ]
    });

    if (!turno) {
        throw new AppError("El turno no existe", 404);
    }

    return turno;
};

/**
 * Obtiene el historial de auditoría de un turno específico, ordenado cronológicamente.
 * Lanza un error 404 si el turno no existe.
 */
const obtenerHistorial = async (turnoId) => {
    const turno = await Turno.findByPk(turnoId);
    if (!turno) {
        throw new AppError("El turno no existe", 404);
    }

    return await HistorialTurno.findAll({
        where: { turnoId },
        include: [
            {
                model: Usuario,
                attributes: ['id', 'nombre', 'rol']
            }
        ],
        order: [['fechaHora', 'ASC']]
    });
};


/**
 * Lista turnos resolviendo TODO en el backend: filtros combinables,
 * paginación, orden (con lista blanca) y visibilidad por rol.
 * @param {Object} filtros 
 * @returns {Promise<{data: Turno[], total: number, page: number, limit: number}>}
 */
const listarTurnos = async (filtros = {}, usuario) => {
    const { fecha, estado, tutorId, especialidad, sortBy, order } = filtros;
    const where = {};
    if (fecha) where.fecha = fecha;
    if (estado) where.estado = estado;
    if (tutorId) where.tutorId = tutorId;


    if (usuario.rol === 'estudiante') {
        where.estudianteId = usuario.id;
    } else if (usuario.rol === 'tutor') {
        const tutor = await Tutor.findOne({ where: { usuarioId: usuario.id } });
        if (!tutor) {
            return { data: [], total: 0, page: 1, limit: 10 };
        }
        where.tutorId = tutor.id;
    }
   
    const includeTutor = {
        model: Tutor,
        attributes: ['id', 'nombre', 'especialidad'],
    };
    if (especialidad) {
        includeTutor.where = { especialidad };
        includeTutor.required = true;
    }

    
    const page = parseInt(filtros.page, 10) > 0 ? parseInt(filtros.page, 10) : 1;
    const limit = parseInt(filtros.limit, 10) > 0 ? parseInt(filtros.limit, 10) : 10;
    const offset = (page - 1) * limit;
    const camposPermitidos = ['fecha', 'horaInicio', 'estado', 'createdAt'];
    const campoOrden = camposPermitidos.includes(sortBy) ? sortBy : 'fecha';
    const sentidoOrden = String(order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const { count, rows } = await Turno.findAndCountAll({
        where,
        include: [includeTutor],
        limit,
        offset,
        order: [[campoOrden, sentidoOrden]],
    });

    return { data: rows, total: count, page, limit };
};

/**
 * obtenerResumen — Calcula las 4 métricas del panel administrativo.
 *
 * todo el conteo y la agrupación se resuelven en la BASE DE DATOS usando "consultas de agregación" (count + group), NO en JS.
 * La cátedra marca como error contar/agrupar trayendo todos los datos.
 */
const obtenerResumen = async () => {

    // ── MÉTRICA 1: Turnos del día ──
    // Fecha de HOY en formato "YYYY-MM-DD" (igual a como se guarda en 'fecha').
    // count() le pide a la base que cuente las filas que cumplen la condición.
    const hoy = new Date().toISOString().slice(0, 10);
    const turnosDelDia = await Turno.count({ where: { fecha: hoy } });

    // ── MÉTRICA 2: Pendientes de confirmación ──
    // Turnos que siguen en estado 'solicitado' (nadie los confirmó todavía).
    const pendientesConfirmacion = await Turno.count({
        where: { estado: 'solicitado' }
    });

    // ── MÉTRICA 3: Turnos por tutor ──
    // "GROUP BY tutorId": agrupa por tutor y cuenta cuántos tiene cada uno.
    // include Tutor → join para traer el nombre del tutor (no solo el id).

   const turnosPorTutor = await Turno.findAll({
    attributes: [
        'tutorId',
        [fn('COUNT', col('turnos.id')), 'cantidad']
    ],
    include: [{
        model: Tutor,
        attributes: ['nombre']
    }],
    group: ['turnos.tutorId', 'Tutor.id'],
    raw: true,
    nest: true
    });

    // ── MÉTRICA 4: Temas más solicitados ──
    // Agrupa por 'tema', cuenta, y ordena de mayor a menor (top 5).
    const temasMasSolicitados = await Turno.findAll({
        attributes: [
            'tema',
            [fn('COUNT', col('id')), 'cantidad']
        ],
        group: ['tema'],
        order: [[fn('COUNT', col('id')), 'DESC']],
        limit: 5,
        raw: true
    });

    // Devolvemos las 4 métricas en un solo objeto, listo para el front.
    return {
        turnosDelDia,
        pendientesConfirmacion,
        turnosPorTutor,
        temasMasSolicitados
    };
};

export {
    AppError,
    validarDisponibilidad,
    crearTurno,
    editarTurno,
    listarTutoresParaSelect,
    registrarHistorial,
    cambiarEstado,
    obtenerDetalle,
    obtenerHistorial,
    listarTurnos,
    obtenerResumen
};
