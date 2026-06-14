// ── Tutor.js ── Modelo Sequelize para la tabla "tutores" ──

import { DataTypes } from "sequelize";
import sequelize from "../data/db.js";

export const ESPECIALIDADES_PERMITIDAS = [
    'Backend',
    'Frontend',
    'Base de Datos',
    'Testing',
    'Seguridad',
    'DevOps',
    'Arquitectura de Software',
    'Diseño UX/UI'
];

// Perfil profesional vinculado a un Usuario con rol "tutor".
// Almacena la especialidad y los días de la semana en que atiende.
// La relación 1:1 con Usuario se define en models/index.js.
const Tutor = sequelize.define("Tutor", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    usuarioId: {
        // FK → usuarios.id — vincula este perfil con su cuenta de usuario.
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: { args: true, msg: "usuarioId es requerido" },
        },
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { args: true, msg: "El nombre del tutor es requerido" },
        },
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { args: true, msg: "El email del tutor es requerido" },
            isEmail: { args: true, msg: "El email no tiene un formato válido" },
        },
    },
    especialidad: {
        // Área de conocimiento: "backend", "frontend", "testing", "seguridad", etc.
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { args: true, msg: "La especialidad es requerida" },
            isIn: {
                args: [ESPECIALIDADES_PERMITIDAS],
                msg: "La especialidad seleccionada no es válida"
            }
        },
    },
    diasDisponibles: {
        // Días en que el tutor puede recibir turnos. Se persiste como JSON,
        // ej: ["lunes", "miercoles"]. Los nombres deben coincidir con los
        // que calcula getDiaSemana() en turnos.service.js (minúscula, sin tilde).
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    },
    activo: {
        // Si está en false, no aparece en el selector del frontend ni acepta turnos nuevos.
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    tableName: "tutores",
});

export default Tutor;
