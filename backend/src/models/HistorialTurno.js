// ── HistorialTurno.js ── Modelo Sequelize para la tabla "historial_turnos" ──

import { DataTypes } from 'sequelize';
import sequelize from '../data/db.js';

// Tabla de auditoría: registra cada cambio relevante sobre un turno.
// Se escribe automáticamente desde turnos.service.js cada vez que un
// turno se crea, edita, confirma, cancela, realiza o reasigna tutor.
const HistorialTurno = sequelize.define('historial_turnos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    turnoId: {
        // FK → turnos.id — turno afectado por el cambio.
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: { args: true, msg: 'turnoId es requerido' },
        },
    },
    usuarioId: {
        // FK → usuarios.id — usuario que ejecutó la acción.
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: { args: true, msg: 'usuarioId es requerido' },
        },
    },
    accion: {
        // Tipo de operación realizada sobre el turno.
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: {
                args: [
                    [
                        'creacion',
                        'edicion',
                        'confirmacion',
                        'cancelacion',
                        'realizacion',
                        'reasignacion',
                    ],
                ],
                msg: 'Acción de historial inválida',
            },
        },
    },
    fechaHora: {
        // Momento exacto en que ocurrió la acción (por defecto, ahora).
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    valorAnterior: {
        // Snapshot de los datos antes del cambio (JSON, opcional).
        type: DataTypes.JSON,
        allowNull: true,
    },
    valorNuevo: {
        // Snapshot de los datos después del cambio (JSON, opcional).
        type: DataTypes.JSON,
        allowNull: true,
    },
});

export default HistorialTurno;
