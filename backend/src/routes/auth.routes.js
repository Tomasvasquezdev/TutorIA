// ── auth.routes.js ── Rutas públicas de autenticación ──
// Prefijo: /api/auth (montado en app.js)

import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { loginLimiter } from '../middlewares/auth.js';

const router = express.Router();

// POST /api/auth/register — Registro de nuevos usuarios (público)
router.post('/register', authController.registrar);

// POST /api/auth/login — Inicio de sesión (público)
// Se aplica rate limiting para evitar ataques de fuerza bruta (máx. 10 intentos cada 15 min por IP)
router.post('/login', loginLimiter, authController.login);

export default router;
