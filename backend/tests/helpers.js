// ── tests/helpers.js ── Herramientas de soporte oficiales (P6) ──
import request from 'supertest';
import app from '../src/app.js';
import { sequelize, Usuario, Tutor, Turno } from '../src/models/index.js';
import { cargarSeed } from '../src/seed/seed.js';
import jwt from 'jsonwebtoken';

// Clave secreta para la generación manual de tokens (debe coincidir con la del middleware de auth)
const SECRET_KEY = process.env.JWT_SECRET;


/**
 * Genera un token JWT de forma síncrona simulando el login de un usuario.
 * Es compatible con los archivos de tests que no utilizan 'await' en sus llamadas.
 */
export const loginComo = (usuario) => {
    return jwt.sign({ id: usuario.id, rol: usuario.rol }, SECRET_KEY);
};

/**
 * Sincroniza la base de datos limpia en memoria e inserta los datos de prueba oficiales.
 * Para no romper los tests de tus compañeros, actualizamos los días disponibles del Tutor 1
 * para que atienda toda la semana, manteniendo compatibilidad con las fechas hardcodeadas de sus pruebas.
 * 
 * @returns {Object} Referencias a registros clave para los tests de creación y detalles.
 */
export const setupDB = async () => {
    // Sincroniza la DB limpiando las tablas en memoria
    await sequelize.sync({ force: true });

    // Siembra los datos semilla del seed oficial
    await cargarSeed();

    // Modificamos dinámicamente al Tutor 1 para habilitarle todos los días.
    // Esto evita que fallen las pruebas T4 y T5 ya programadas en días martes o jueves.
    const tutor = await Tutor.findByPk(1);
    if (tutor) {
        await tutor.update({
            diasDisponibles: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
        });
    }

    // Buscamos las entidades correspondientes para retornarlas con el formato que esperan los tests
    const estudiante = await Usuario.findOne({ where: { email: 'lucas@dds.com' } });
    const uTutor = await Usuario.findOne({ where: { email: 'marina@dds.com' } });
    const turno = await Turno.findOne({ where: { tutorId: 1 } });

    return { estudiante, uTutor, tutor, turno };
};

/**
 * Cierra la conexión de la base de datos al finalizar cada suite de pruebas.
 */
export const closeDB = async () => {
    await sequelize.close();
};
