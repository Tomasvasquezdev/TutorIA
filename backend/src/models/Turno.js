// ── Turno.js ── Modelo Sequelize para la tabla "turnos" ──

import { DataTypes } from 'sequelize';
import sequelize from '../data/db.js';

// Representa una reserva de tutoría entre un estudiante y un tutor.
// Contiene fecha, franja horaria, tema, modalidad y un estado que
// sigue el flujo: solicitado → confirmado → realizado (o cancelado).
// Las reglas de negocio (superposición, disponibilidad, transiciones)
// se validan en turnos.service.js; el modelo solo garantiza formatos.
const Turno = sequelize.define('turnos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    tutorId: {
        // FK → tutores.id — tutor seleccionado para la tutoría.
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: { args: true, msg: 'tutorId es requerido' },
        },
    },
    estudianteId: {
        // FK → usuarios.id — estudiante que solicita el turno.
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: { args: true, msg: 'estudianteId es requerido' },
        },
    },
    fecha: {
        // Día de la tutoría en formato "YYYY-MM-DD".
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { args: true, msg: 'La fecha es requerida' },
            is: {
                args: /^\d{4}-\d{2}-\d{2}$/,
                msg: 'La fecha debe tener formato YYYY-MM-DD',
            },
        },
    },
    horaInicio: {
        // Inicio de la franja horaria en formato "HH:mm".
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: {
                args: /^([01]\d|2[0-3]):[0-5]\d$/,
                msg: 'horaInicio debe tener formato HH:mm',
            },
        },
    },
    horaFin: {
        // Fin de la franja horaria en formato "HH:mm".
        // La validación horaInicio < horaFin se hace en el service.
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: {
                args: /^([01]\d|2[0-3]):[0-5]\d$/,
                msg: 'horaFin debe tener formato HH:mm',
            },
        },
    },
    tema: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { args: true, msg: 'El tema es requerido' },
        },
    },
    modalidad: {
        // Solo admite "presencial" o "virtual".
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: {
                args: [['presencial', 'virtual']],
                msg: 'La modalidad debe ser presencial o virtual',
            },
        },
    },
    estado: {
        // Flujo de estados:  solicitado → confirmado | cancelado
        //                    confirmado → realizado  | cancelado
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'solicitado',
        validate: {
            isIn: {
                args: [['solicitado', 'confirmado', 'cancelado', 'realizado']],
                msg: 'Estado inválido',
            },
        },
    },
    observaciones: {
        // Comentarios opcionales del tutor o del estudiante.
        type: DataTypes.STRING,
        allowNull: true,
    },
});

export default Turno;