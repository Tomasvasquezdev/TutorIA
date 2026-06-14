// ── auth.controller.js ── Controlador de autenticación (registro y login) ──
// Recibe las peticiones HTTP, las delega al service y devuelve la respuesta.

import authService from '../services/auth.service.js';

/**
 * POST /api/auth/register
 * Registra un nuevo usuario estudiante. Devuelve 201 con token y datos del usuario.
 */
export async function registrar(req, res, next) {
    try {
        const resultado = await authService.registrar(req.body);
        return res.status(201).json(resultado);
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/auth/login
 * Valida credenciales y devuelve 200 con token JWT si son correctas.
 */
export async function login(req, res, next) {
    try {
        const resultado = await authService.login(req.body);
        return res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
}