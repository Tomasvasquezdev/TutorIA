// tests/turnos-detalle.test.js — T3 (Detalle de turno). (P4)

//CAMBIADO POR P6
import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';
import { setupDB, loginComo, closeDB } from './helpers.js';

describe('T3 - GET /api/turnos/:id (Detalle de turno)', () => {
    let datosPrueba;
    let tokenEstudiante;

    beforeEach(async () => {
        // EXPLICACIÓN DE P6: Usamos beforeEach para limpiar la DB en memoria antes de cada caso
        datosPrueba = await setupDB();

        // Generamos un token válido para el estudiante asociado al turno
        tokenEstudiante = loginComo(datosPrueba.estudiante);
    });

    afterAll(async () => {
        // Cerrar conexión a la DB
        await closeDB();
    });

    it('Test 1: GET /api/turnos/:id con ID existente -> 200 + contrato de campos de turno', async () => {
        const turnoId = datosPrueba.turno.id;

        const response = await request(app)
            .get(`/api/turnos/${turnoId}`)
            .set('Authorization', `Bearer ${tokenEstudiante}`);

        // EXPLICACIÓN DE P6: Validamos que devuelva 200 OK
        expect(response.status).toBe(200);

        // EXPLICACIÓN DE P6: Validamos la estructura del contrato definida por el enunciado
        expect(response.body).toHaveProperty('id', turnoId);
        expect(response.body).toHaveProperty('tema');
        expect(response.body).toHaveProperty('estado', 'solicitado');
        expect(response.body).toHaveProperty('fecha', '2026-06-15');

        // Verificar que contenga los includes de las relaciones exigidos
        expect(response.body).toHaveProperty('usuario');
        expect(response.body).toHaveProperty('Tutor');
    });

    it('Test 2: GET /api/turnos/99999 -> 404 + { error: "El turno no existe" }', async () => {
        const response = await request(app)
            .get('/api/turnos/99999')
            .set('Authorization', `Bearer ${tokenEstudiante}`);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'El turno no existe');
    });
});
