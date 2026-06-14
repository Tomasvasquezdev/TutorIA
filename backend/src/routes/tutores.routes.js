// ── tutores.routes.js ── Rutas del recurso "tutores" ──
// Prefijo: /api/tutores (montado en app.js)

import express from 'express';
import * as tutoresController from '../controllers/tutores.controller.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

// GET /api/tutores/especialidades — Lista estática de especialidades (pública)
router.get('/especialidades', tutoresController.especialidades);

// GET /api/tutores — Lista de tutores activos (requiere autenticación)
router.get('/',
    auth,
    tutoresController.listar
);

export default router;
