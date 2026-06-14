// ── turnos.routes.js ── Rutas del recurso "turnos" ──
// Prefijo: /api/turnos (montado en app.js)
// Todas las rutas requieren autenticación (middleware auth).

import express from 'express';
import * as turnosController from '../controllers/turnos.controller.js';
import auth from '../middlewares/auth.js';
import authorize from '../middlewares/authorize.js';
import validate from '../middlewares/validate.js';

const router = express.Router();

// IMPORTANTE: Las rutas estáticas (/resumen) van ANTES que las dinámicas (/:id),
// porque Express evalúa en orden y confundiría "resumen" con un ID numérico.

// ── Lectura ──

// GET /api/turnos/resumen — Panel administrativo (solo admin)
// auth → verifica el JWT (401 si no hay token).
// authorize({ roles: ['admin'] }) → solo admin pasa (403 si no lo es).
router.get('/resumen',
    auth,
    authorize({ roles: ['admin'] }),
    turnosController.resumen
);

// GET /api/turnos — Listado con filtros (cada rol ve sus turnos)
router.get('/',
    auth,
    turnosController.listar
);

// GET /api/turnos/:id — Detalle de un turno específico
router.get('/:id',
    auth,
    authorize({ permitirPropietario: 'involucrado' }),
    turnosController.detalle
);

// GET /api/turnos/:id/historial — Auditoría de cambios del turno
router.get('/:id/historial',
    auth,
    authorize({ permitirPropietario: 'involucrado' }),
    turnosController.historial
);

// ── Escritura ──

// POST /api/turnos — Alta de turno (solo estudiantes y admin)
router.post('/',
    auth,
    authorize({ roles: ['estudiante', 'admin'] }),
    validate,
    turnosController.crear
);

// PUT /api/turnos/:id — Edición de turno (requiere autenticación + autorización + validación)
router.put('/:id',
    auth,
    authorize({ permitirPropietario: 'estudianteDueño' }),
    validate,
    turnosController.editar
);

// ── Transiciones de estado ──

// PATCH /api/turnos/:id/cancelar — Pasar a "cancelado" (dueño o admin)
router.patch('/:id/cancelar',
    auth,
    authorize({ roles: ['estudiante', 'admin'], permitirPropietario: 'estudianteDueño' }),
    turnosController.cancelar
);

// PATCH /api/turnos/:id/confirmar — Pasar a "confirmado" (tutor o admin)
router.patch('/:id/confirmar',
    auth,
    authorize({ roles: ['tutor', 'admin'], permitirPropietario: 'tutorAsignado' }),
    turnosController.confirmar
);

// PATCH /api/turnos/:id/realizar — Pasar a "realizado" (tutor o admin)
router.patch('/:id/realizar',
    auth,
    authorize({ roles: ['tutor', 'admin'], permitirPropietario: 'tutorAsignado' }),
    turnosController.realizar
);

export default router;
