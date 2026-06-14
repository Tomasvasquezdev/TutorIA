// ── authorize.js ── Middleware de autorización por rol y propiedad ──
// Se ejecuta DESPUÉS de auth.js (que ya inyectó req.usuario).
// Compara el rol del usuario contra una lista de roles permitidos.
// Opcionalmente verifica la propiedad del recurso (ej: estudiante dueño o tutor asignado).
// Si el usuario no cumple los criterios, responde 403 Forbidden.

import { Turno, Tutor } from '../models/index.js';

export default function authorize(opciones = {}) {
    return async (req, res, next) => {
        const usuario = req.usuario;

        if (!usuario) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }

        // El rol 'admin' tiene bypass completo para cualquier acción
        if (usuario.rol === 'admin') {
            return next();
        }

        // Verificar si el rol del usuario está en la lista de roles permitidos
        if (opciones.roles && opciones.roles.length > 0) {
            if (!opciones.roles.includes(usuario.rol)) {
                return res.status(403).json({ error: 'No tienes permisos suficientes para esta acción' });
            }
        }

        // Verificar propiedad del recurso si se requiere
        if (opciones.permitirPropietario) {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'Falta el parámetro ID para verificar propiedad' });
            }

            try {
                const turno = await Turno.findByPk(id);
                if (!turno) {
                    return res.status(404).json({ error: 'El turno no existe' });
                }

                if (opciones.permitirPropietario === 'estudianteDueño') {
                    // El estudiante debe ser el dueño del turno
                    if (turno.estudianteId !== usuario.id) {
                        return res.status(403).json({ error: 'No tienes permisos suficientes para esta acción' });
                    }
                } else if (opciones.permitirPropietario === 'tutorAsignado') {
                    // El tutor asignado en el turno debe pertenecer al usuario autenticado
                    const tutor = await Tutor.findOne({ where: { usuarioId: usuario.id } });
                    if (!tutor || turno.tutorId !== tutor.id) {
                        return res.status(403).json({ error: 'No tienes permisos suficientes para esta acción' });
                    }
                } else if (opciones.permitirPropietario === 'involucrado') {
                    // El usuario debe ser el estudiante dueño o el tutor asignado
                    const esEstudianteDueño = (turno.estudianteId === usuario.id);
                    const tutor = await Tutor.findOne({ where: { usuarioId: usuario.id } });
                    const esTutorAsignado = (tutor && turno.tutorId === tutor.id);
                    if (!esEstudianteDueño && !esTutorAsignado) {
                        return res.status(403).json({ error: 'No tienes permisos suficientes para esta acción' });
                    }
                } else {
                    return res.status(500).json({ error: 'Configuración de propiedad inválida en el middleware' });
                }
            } catch (error) {
                return next(error);
            }
        }

        next();
    };
}
