import request from 'supertest';
import app from '../src/app.js';
import { setupDB, closeDB, loginComo } from './helpers.js';

describe('POST /api/turnos (Creación de Turnos)', () => {
    let estudiante, tutor, tokenEstudiante;

    beforeAll(async () => {
        const data = await setupDB();
        estudiante = data.estudiante;
        tutor = data.tutor;
        tokenEstudiante = loginComo(estudiante);
    });

    afterAll(async () => {
        await closeDB();
    });

    it('T4: Creación válida de un turno', async () => {
        const response = await request(app)
            .post('/api/turnos')
            .set('Authorization', `Bearer ${tokenEstudiante}`)
            .send({
                tutorId: tutor.id,
                fecha: '2026-06-16', // Lunes a viernes disponible en setupDB
                horaInicio: '08:00',
                horaFin: '09:00',
                tema: 'Validacion correcta',
                modalidad: 'virtual'
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
    });

    it('T5: Creación inválida por horario inconsistente (inicio >= fin)', async () => {
        const response = await request(app)
            .post('/api/turnos')
            .set('Authorization', `Bearer ${tokenEstudiante}`)
            .send({
                tutorId: tutor.id,
                fecha: '2026-06-16',
                horaInicio: '10:00',
                horaFin: '10:00',
                tema: 'Inconsistente',
                modalidad: 'virtual'
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/inicio debe ser anterior/i);
    });

    it('T6: Creación inválida por superposición del tutor', async () => {
        // En setupDB se crea un turno el 2026-06-15 de 10:00 a 11:00
        const response = await request(app)
            .post('/api/turnos')
            .set('Authorization', `Bearer ${tokenEstudiante}`)
            .send({
                tutorId: tutor.id,
                fecha: '2026-06-15',
                horaInicio: '10:30', // Superposición con 10:00 - 11:00
                horaFin: '11:30',
                tema: 'Superpuesto',
                modalidad: 'virtual'
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/no está disponible en esa franja/i);
    });

    it('Nuevo Límite: Creación inválida por duración mayor a 2 horas', async () => {
        const response = await request(app)
            .post('/api/turnos')
            .set('Authorization', `Bearer ${tokenEstudiante}`)
            .send({
                tutorId: tutor.id,
                fecha: '2026-06-16',
                horaInicio: '10:00',
                horaFin: '13:00', // 3 horas
                tema: 'Muy largo',
                modalidad: 'virtual'
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/no puede durar más de 2 horas/i);
    });

    it('Nuevo Límite: Creación inválida fuera del horario de atención (08:00 a 20:00)', async () => {
        const response = await request(app)
            .post('/api/turnos')
            .set('Authorization', `Bearer ${tokenEstudiante}`)
            .send({
                tutorId: tutor.id,
                fecha: '2026-06-16',
                horaInicio: '07:00',
                horaFin: '08:30',
                tema: 'Muy temprano',
                modalidad: 'virtual'
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/horario de atención/i);
    });

    it('T10: Creación inválida en día no disponible para el tutor', async () => {
        // 2026-06-21 es Domingo — el tutor del seed solo atiende lunes y miércoles originalmente.
        // setupDB actualiza al Tutor 1 para todos los días, por eso usamos el Tutor 3 (Carlos - miercoles y viernes)
        const response = await request(app)
            .post('/api/turnos')
            .set('Authorization', `Bearer ${tokenEstudiante}`)
            .send({
                tutorId: tutor.id + 2, // Tutor 3 del seed (Carlos - solo miércoles y viernes)
                fecha: '2026-06-16',   // Martes — Carlos no atiende los martes
                horaInicio: '10:00',
                horaFin: '11:00',
                tema: 'Dia no disponible',
                modalidad: 'virtual'
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/no atiende ese día|no disponible|no trabaja/i);
    });

    it('T9: Edición que reasigna a franja ya ocupada por el tutor devuelve 400', async () => {
        // Primero creamos un turno nuevo en horario limpio
        const turnoNuevo = await request(app)
            .post('/api/turnos')
            .set('Authorization', `Bearer ${tokenEstudiante}`)
            .send({
                tutorId: tutor.id,
                fecha: '2026-06-15',
                horaInicio: '14:00',
                horaFin: '15:00',
                tema: 'Turno para editar',
                modalidad: 'virtual'
            });

        // Luego intentamos moverlo a la franja ya ocupada (10:00 - 11:00 del seed)
        const response = await request(app)
            .put(`/api/turnos/${turnoNuevo.body.id}`)
            .set('Authorization', `Bearer ${tokenEstudiante}`)
            .send({
                tutorId: tutor.id,
                fecha: '2026-06-15',
                horaInicio: '10:30', // Superpone con el turno de 10:00 - 11:00 del seed
                horaFin: '11:30',
                tema: 'Turno editado superpuesto',
                modalidad: 'virtual'
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/no está disponible en esa franja|franja superpos/i);
    });



});
