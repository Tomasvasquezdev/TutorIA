// ── seed.js ── Script para poblar la base de datos con datos de prueba ──
// Ejecutar con: npm run seed
// Recrea todas las tablas (force: true) e inserta usuarios, tutores,
// turnos de ejemplo y su historial de auditoría.

import { sequelize, Usuario, Tutor, Turno, HistorialTurno } from '../models/index.js';

// Cambie runSeed por cargarSeed y la exporte para los tests
export const cargarSeed = async () => {
    try {
        console.log('Iniciando carga de datos semilla...');


        // Recrear todas las tablas desde cero
        await sequelize.sync({ force: true });
        console.log('Tablas recreadas con éxito.');

        // ── Usuarios ──

        const adminUser = await Usuario.create({
            nombre: 'Administrador',
            email: 'admin@dds.com',
            passwordHash: 'admin123', // El hook beforeCreate lo hashea con bcrypt
            rol: 'admin',
            activo: true
        });

        const est1 = await Usuario.create({
            nombre: 'Lucas Pérez',
            email: 'lucas@dds.com',
            passwordHash: 'estudiante123',
            rol: 'estudiante',
            activo: true
        });

        const est2 = await Usuario.create({
            nombre: 'Sofía Ruiz',
            email: 'sofia@dds.com',
            passwordHash: 'estudiante123',
            rol: 'estudiante',
            activo: true
        });

        const est3 = await Usuario.create({
            nombre: 'Mateo Díaz',
            email: 'mateo@dds.com',
            passwordHash: 'estudiante123',
            rol: 'estudiante',
            activo: true
        });

        // ── Tutores (usuario + perfil) ──

        const ut1 = await Usuario.create({
            nombre: 'Marina López',
            email: 'marina@dds.com',
            passwordHash: 'tutor123',
            rol: 'tutor',
            activo: true
        });
        const t1 = await Tutor.create({
            usuarioId: ut1.id,
            nombre: 'Marina López',
            email: 'marina@dds.com',
            especialidad: 'Backend',
            diasDisponibles: ['lunes', 'miercoles'],
            activo: true
        });

        const ut2 = await Usuario.create({
            nombre: 'Juan Gómez',
            email: 'juan@dds.com',
            passwordHash: 'tutor123',
            rol: 'tutor',
            activo: true
        });
        const t2 = await Tutor.create({
            usuarioId: ut2.id,
            nombre: 'Juan Gómez',
            email: 'juan@dds.com',
            especialidad: 'Frontend',
            diasDisponibles: ['martes', 'jueves'],
            activo: true
        });

        const ut3 = await Usuario.create({
            nombre: 'Carlos Rodríguez',
            email: 'carlos@dds.com',
            passwordHash: 'tutor123',
            rol: 'tutor',
            activo: true
        });
        const t3 = await Tutor.create({
            usuarioId: ut3.id,
            nombre: 'Carlos Rodríguez',
            email: 'carlos@dds.com',
            especialidad: 'Testing',
            diasDisponibles: ['miercoles', 'viernes'],
            activo: true
        });

        // Tutor inactivo (no debería aparecer en el selector del frontend)
        const ut4 = await Usuario.create({
            nombre: 'Ana Martínez',
            email: 'ana@dds.com',
            passwordHash: 'tutor123',
            rol: 'tutor',
            activo: true
        });
        const t4 = await Tutor.create({
            usuarioId: ut4.id,
            nombre: 'Ana Martínez',
            email: 'ana@dds.com',
            especialidad: 'Seguridad',
            diasDisponibles: ['lunes'],
            activo: false
        });

        // Tutor limpio (sin turnos, útil para pruebas de alta)
        const ut5 = await Usuario.create({
            nombre: 'Luis Torres',
            email: 'luis@dds.com',
            passwordHash: 'tutor123',
            rol: 'tutor',
            activo: true
        });
        const t5 = await Tutor.create({
            usuarioId: ut5.id,
            nombre: 'Luis Torres',
            email: 'luis@dds.com',
            especialidad: 'Backend',
            diasDisponibles: ['miercoles'],
            activo: true
        });

        console.log('Usuarios y Tutores creados.');

        // ── Turnos (12 turnos en distintos estados para testing) ──
        // Fechas fijas de la semana del 15/06/2026:
        // lunes=15, martes=16, miercoles=17, jueves=18, viernes=19

        const turnosData = [
            // Marina López — backend — lunes y miércoles
            { tutorId: t1.id, estudianteId: est1.id, fecha: '2026-06-15', horaInicio: '09:00', horaFin: '10:00', tema: 'Sequelize y asociaciones', modalidad: 'virtual', estado: 'solicitado' },
            { tutorId: t1.id, estudianteId: est2.id, fecha: '2026-06-15', horaInicio: '10:00', horaFin: '11:00', tema: 'Express Routing', modalidad: 'presencial', estado: 'confirmado' },
            { tutorId: t1.id, estudianteId: est3.id, fecha: '2026-06-17', horaInicio: '14:00', horaFin: '15:00', tema: 'Middlewares personalizados', modalidad: 'virtual', estado: 'realizado', observaciones: 'Se resolvieron dudas de pasaje de parámetros' },
            { tutorId: t1.id, estudianteId: est1.id, fecha: '2026-06-17', horaInicio: '15:30', horaFin: '16:30', tema: 'CORS y cookies', modalidad: 'virtual', estado: 'cancelado' },

            // Juan Gómez — frontend — martes y jueves
            { tutorId: t2.id, estudianteId: est2.id, fecha: '2026-06-16', horaInicio: '09:00', horaFin: '10:00', tema: 'React Hooks', modalidad: 'virtual', estado: 'solicitado' },
            { tutorId: t2.id, estudianteId: est3.id, fecha: '2026-06-16', horaInicio: '10:30', horaFin: '11:30', tema: 'React Router v6', modalidad: 'presencial', estado: 'confirmado' },
            { tutorId: t2.id, estudianteId: est1.id, fecha: '2026-06-18', horaInicio: '15:00', horaFin: '16:00', tema: 'Context API', modalidad: 'virtual', estado: 'realizado', observaciones: 'Excelente comprensión del tema' },
            { tutorId: t2.id, estudianteId: est2.id, fecha: '2026-06-18', horaInicio: '16:00', horaFin: '17:00', tema: 'Axios interceptors', modalidad: 'presencial', estado: 'cancelado' },

            // Carlos Rodríguez — testing — miércoles y viernes
            { tutorId: t3.id, estudianteId: est3.id, fecha: '2026-06-19', horaInicio: '09:00', horaFin: '10:00', tema: 'Pruebas con Jest', modalidad: 'virtual', estado: 'solicitado' },
            { tutorId: t3.id, estudianteId: est1.id, fecha: '2026-06-19', horaInicio: '10:00', horaFin: '11:00', tema: 'Supertest API testing', modalidad: 'virtual', estado: 'confirmado' },
            { tutorId: t3.id, estudianteId: est2.id, fecha: '2026-06-17', horaInicio: '16:00', horaFin: '17:00', tema: 'TDD basic', modalidad: 'presencial', estado: 'realizado', observaciones: 'Se crearon los tests unitarios' },
            { tutorId: t3.id, estudianteId: est3.id, fecha: '2026-06-17', horaInicio: '17:00', horaFin: '18:00', tema: 'Mocking en Jest', modalidad: 'virtual', estado: 'cancelado' }
        ];

        for (const data of turnosData) {
            const turno = await Turno.create(data);

            // Registrar creación en el historial
            await HistorialTurno.create({
                turnoId: turno.id,
                usuarioId: data.estudianteId,
                accion: 'creacion',
                valorNuevo: turno.toJSON()
            });

            // Simular confirmación (por el admin) si corresponde
            if (data.estado === 'confirmado' || data.estado === 'realizado') {
                await HistorialTurno.create({
                    turnoId: turno.id,
                    usuarioId: adminUser.id,
                    accion: 'confirmacion',
                    valorAnterior: { estado: 'solicitado' },
                    valorNuevo: { estado: 'confirmado' }
                });
            }

            // Simular realización (por el tutor) si corresponde
            if (data.estado === 'realizado') {
                await HistorialTurno.create({
                    turnoId: turno.id,
                    usuarioId: data.tutorId,
                    accion: 'realizacion',
                    valorAnterior: { estado: 'confirmado' },
                    valorNuevo: { estado: 'realizado' }
                });
            }

            // Simular cancelación (por el estudiante) si corresponde
            if (data.estado === 'cancelado') {
                await HistorialTurno.create({
                    turnoId: turno.id,
                    usuarioId: data.estudianteId,
                    accion: 'cancelacion',
                    valorAnterior: { estado: 'solicitado' },
                    valorNuevo: { estado: 'cancelado' }
                });
            }
        }

        console.log('Turnos e Historial creados.');
        console.log('Carga de datos semilla completada con éxito.');
        // Quitamos el process.exit(0) de aquí adentro.
        // Si lo dejamos, cerrará Jest cuando se importe en los tests.
    } catch (error) {
        console.error('Error al cargar datos semilla:', error);
        // Lanzamos el error en vez de hacer process.exit(1)
        throw error;
    }
};

// Este bloque se encarga de iniciar la carga cuando se ejecuta manualmente.
if (process.argv[1] && (process.argv[1].endsWith('seed.js') || process.argv[1].endsWith('seed'))) {
    cargarSeed()
        .then(() => {
            console.log('Seed cargado con éxito para desarrollo.');
            process.exit(0); // Aquí sí cerramos el proceso porque se ejecutó manualmente
        })
        .catch((err) => {
            console.error('Fallo en la carga del seed de desarrollo:', err);
            process.exit(1);
        });
}