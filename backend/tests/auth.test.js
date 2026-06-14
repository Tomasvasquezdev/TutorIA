// tests/auth.test.js — T1 (login ok/inválido), T7 (sin JWT 401), T8 (rol insuficiente 403). (P1)
// tests/auth.test.js — T1 (login ok/inválido), T7 (sin JWT 401), T8 (rol insuficiente 403). (P1)
// Refactorizado e integrado por P6 (Tech Lead) para usar base de datos en memoria,
// helpers de pruebas unificados y los contratos oficiales del Enunciado.

import { describe, test, expect, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';
import { setupDB, closeDB, loginComo } from './helpers.js';
import { Usuario } from '../src/models/index.js';

describe('🧪 Pruebas de Seguridad y Autenticación - Rol P1', () => {

    // Antes de cada test, reseteamos la base de datos en memoria con el seed oficial
    beforeEach(async () => {
        await setupDB();
    });

    afterAll(async () => {
        await closeDB();
    });

    // ──LOGIN  ──
    test('T1 (Feliz): Debería autenticar correctamente con credenciales válidas y devolver un JWT', async () => {
        // Usamos un usuario real de tu seed oficial (Lucas Pérez, estudiante)
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'lucas@dds.com',
                password: 'estudiante123'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('usuario');
        expect(res.body.usuario).toHaveProperty('email', 'lucas@dds.com');
        expect(res.body.usuario).not.toHaveProperty('passwordHash'); // Seguridad: no debe filtrar el hash
    });

    // ── LOGIN INCORRECTO ──
    test('T1 (Fallo): Debería rechazar el inicio de sesión con contraseña incorrecta (401)', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'lucas@dds.com',
                password: 'clave_incorrecta_profe'
            });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

    // ── ACCESO SIN TOKEN (401) ──
    test('T7: Debería denegar el acceso (401) a rutas protegidas si no se envía el token', async () => {
        // GET /api/turnos requiere token obligatorio
        const res = await request(app)
            .get('/api/turnos');

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

    // ── ACCESO CON ROL INSUFICIENTE (403) ──
    test('T8: Debería denegar el acceso (403) si el usuario está autenticado pero no tiene el rol requerido', async () => {
        // Buscamos un estudiante del seed
        const estudiante = await Usuario.findOne({ where: { email: 'lucas@dds.com' } });
        const tokenEstudiante = loginComo(estudiante); // Generamos el token síncrono

        // Un estudiante intenta entrar al resumen administrativo de turnos (reservado para administradores)
        const res = await request(app)
            .get('/api/turnos/resumen')
            .set('Authorization', `Bearer ${tokenEstudiante}`);

        expect(res.statusCode).toBe(403);
        expect(res.body).toHaveProperty('error');
    });
});
