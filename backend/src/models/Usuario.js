// ── Usuario.js ── Modelo Sequelize para la tabla "usuarios" ──

import { DataTypes } from "sequelize";
import sequelize from "../data/db.js";
import bcrypt from "bcryptjs";

// Representa a cualquier persona que opera el sistema.
// Según su campo "rol" puede ser estudiante, tutor o admin.
// La contraseña se almacena como hash bcrypt (ver hook beforeCreate).
const Usuario = sequelize.define(
    'usuarios',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { args: true, msg: 'El nombre es requerido' },
            },
        },
        email: {
            // Credencial de acceso: debe ser único en toda la tabla.
            type: DataTypes.STRING,
            allowNull: false,
            unique: { args: true, msg: 'Ya existe un usuario con ese email' },
            validate: {
                notEmpty: { args: true, msg: 'El email es requerido' },
                isEmail: { args: true, msg: 'El email no tiene un formato válido' },
            },
        },
        passwordHash: {
            // Se recibe como texto plano y el hook beforeCreate lo convierte a hash.
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { args: true, msg: 'La contraseña es requerida' },
            },
        },
        rol: {
            // Determina los permisos del usuario en todo el sistema.
            // "estudiante" puede solicitar turnos, "tutor" puede confirmarlos,
            // "admin" tiene acceso completo.
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'estudiante',
            validate: {
                isIn: {
                    args: [['estudiante', 'tutor', 'admin']],
                    msg: 'El rol debe ser estudiante, tutor o admin',
                },
            },
        },
        activo: {
            // Permite bloquear el acceso de un usuario sin eliminarlo de la base.
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        hooks: {
            // Normaliza email y nombre antes de validar para evitar duplicados
            // por diferencias de mayúsculas o espacios extra.
            beforeValidate: (usuario) => {
                if (typeof usuario.email === 'string') {
                    usuario.email = usuario.email.trim().toLowerCase();
                }
                if (typeof usuario.nombre === 'string') {
                    usuario.nombre = usuario.nombre.trim();
                }
            },
            // Encripta la contraseña con bcrypt (10 rondas de sal) antes de
            // persistirla. En el login se compara con bcrypt.compare().
            beforeCreate: async (usuario) => {
                // Encriptar la contraseña si se está creando
                usuario.passwordHash = await bcrypt.hash(usuario.passwordHash, 10);
            },
        },
    }
);

export default Usuario;