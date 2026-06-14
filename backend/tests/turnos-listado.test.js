// tests/turnos-listado.test.js — T2 (listado con y sin filtros). (P3)
//
// Prueba el endpoint GET /api/turnos con Jest + Supertest.
// Es autocontenido: arma su propio set de datos conocido en beforeAll
// (no depende de helpers.js, que es de P6). Valida status HTTP y body JSON.
//
// OJO: usa la misma base SQLite que el dev (db.js no es configurable por env),
// así que beforeAll la recrea con force:true. Después de correr los tests,
// volvé a poblar la base con: npm run seed
// tests/turnos-listado.test.js — T2 (listado con y sin filtros). (P3)
// Auditado e integrado por P6 (Tech Lead) para usar base de datos en memoria y helpers unificados.

import { describe, test, expect, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';

import app from '../src/app.js';
import { Usuario, Tutor } from '../src/models/index.js';
import { setupDB, closeDB, loginComo } from './helpers.js';

let tokenAdmin;
let tutorBackendId;

beforeEach(async () => {
    //  Usamos setupDB para recrear la base de datos limpia en memoria.
    await setupDB();

    // Obtenemos el usuario administrador oficial del seed para loguearnos
    const admin = await Usuario.findOne({ where: { email: 'admin@dds.com' } });
    tokenAdmin = await loginComo(admin); // Obtenemos el token JWT real

    // Obtenemos el Tutor 1 (Marina López - backend) para los filtros por ID
    const tutorBackend = await Tutor.findOne({ where: { email: 'marina@dds.com' } });
    tutorBackendId = tutorBackend.id;
});

afterAll(async () => {
    // Cerramos la conexión para evitar warnings de Jest
    await closeDB();
});

describe('GET /api/turnos — listado con y sin filtros', () => {
    test('sin token responde 401', async () => {
        const res = await request(app).get('/api/turnos');
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

    test('sin filtros (admin) responde 200 y el contrato { data, total, page, limit }', async () => {
        const res = await request(app)
            .get('/api/turnos')
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        // El seed oficial contiene 12 turnos en total
        expect(res.body).toHaveProperty('total', 12);
        expect(res.body).toHaveProperty('page', 1);
        expect(res.body).toHaveProperty('limit');
        // El listado paginado por defecto de la cátedra limita a 10 elementos por página
        expect(res.body.data.length).toBe(10);
    });

    test('filtro estado=confirmado devuelve solo confirmados', async () => {
        const res = await request(app)
            .get('/api/turnos?estado=confirmado')
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(res.status).toBe(200);
        // El seed oficial contiene exactamente 3 turnos confirmados
        expect(res.body.total).toBe(3);
        expect(res.body.data.every((t) => t.estado === 'confirmado')).toBe(true);
    });

    test('filtro fecha=2026-06-15 devuelve solo esa fecha', async () => {
        const res = await request(app)
            .get('/api/turnos?fecha=2026-06-15')
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(res.status).toBe(200);
        // El seed oficial tiene 2 turnos el 15/06 (uno solicitado y uno confirmado)
        expect(res.body.total).toBe(2);
        expect(res.body.data.every((t) => t.fecha === '2026-06-15')).toBe(true);
    });

    test('filtro especialidad=Backend incluye los datos del Tutor', async () => {
        const res = await request(app)
            .get('/api/turnos?especialidad=Backend')
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(res.status).toBe(200);
        // El seed tiene 4 turnos vinculados a tutores de especialidad Backend
        expect(res.body.data.length).toBe(4);
        expect(res.body.data.every((t) => t.Tutor?.especialidad === 'Backend')).toBe(true);
    });

    test('filtro tutorId devuelve solo turnos de ese tutor', async () => {
        const res = await request(app)
            .get(`/api/turnos?tutorId=${tutorBackendId}`)
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(res.status).toBe(200);
        expect(res.body.data.every((t) => t.tutorId === tutorBackendId)).toBe(true);
    });

    test('paginación: limit=2 corta a 2 filas pero informa el total real', async () => {
        const res = await request(app)
            .get('/api/turnos?limit=2&page=1')
            .set('Authorization', `Bearer ${tokenAdmin}`);

        expect(res.status).toBe(200);
        // Valida que corte a 2 pero mantenga el total de 12 registros de la semilla
        expect(res.body.total).toBe(12);
        expect(res.body.limit).toBe(2);
        expect(res.body.data.length).toBe(2);
    });
});
