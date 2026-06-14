// ── turnos.controller.js ── Controlador para alta y edición de turnos ──
// Recibe las peticiones HTTP, extrae el usuario autenticado del token
// y delega la lógica de negocio a turnos.service.js.

import * as turnosService from '../services/turnos.service.js';

/**
 * POST /api/turnos
 * Crea un nuevo turno asociado al estudiante que hizo la petición.
 * El estudianteId se obtiene del JWT (inyectado por el middleware auth).
 */
export const crear = async (req, res, next) => {
    try {
        const estudianteId = req.usuario.id;
        const nuevoTurno = await turnosService.crearTurno(req.body, estudianteId);
        res.status(201).json(nuevoTurno);
    } catch (error) {
        if (error instanceof turnosService.AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        next(error);
    }
};

/**
 * PUT /api/turnos/:id
 * Edita un turno existente. El usuarioId se registra en el historial de auditoría.
 */
export const editar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const usuarioId = req.usuario.id;
        const turnoActualizado = await turnosService.editarTurno(id, req.body, usuarioId);
        res.status(200).json(turnoActualizado);
    } catch (error) {
        if (error instanceof turnosService.AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        next(error);
    }
};

/**
 * GET /api/turnos/:id
 * Muestra el detalle de un turno específico.
 */
export const detalle = async (req, res, next) => {
    try {
        const { id } = req.params;
        const turno = await turnosService.obtenerDetalle(id);
        res.status(200).json(turno);
    } catch (error) {
        if (error instanceof turnosService.AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        next(error);
    }
};

/**
 * GET /api/turnos/:id/historial
 * Muestra el historial de auditoría de un turno específico.
 */
export const historial = async (req, res, next) => {
    try {
        const { id } = req.params;
        const registros = await turnosService.obtenerHistorial(id);
        res.status(200).json(registros);
    } catch (error) {
        if (error instanceof turnosService.AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        next(error);
    }
};

/**
 * PATCH /api/turnos/:id/cancelar
 * Cancela un turno.
 */
export const cancelar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const usuarioId = req.usuario.id;
        const turnoActualizado = await turnosService.cambiarEstado(id, 'cancelado', usuarioId);
        res.status(200).json(turnoActualizado);
    } catch (error) {
        if (error instanceof turnosService.AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        next(error);
    }
};

/**
 * PATCH /api/turnos/:id/confirmar
 * Confirma un turno solicitado.
 */
export const confirmar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const usuarioId = req.usuario.id;
        const turnoActualizado = await turnosService.cambiarEstado(id, 'confirmado', usuarioId);
        res.status(200).json(turnoActualizado);
    } catch (error) {
        if (error instanceof turnosService.AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        next(error);
    }
};

/**
 * PATCH /api/turnos/:id/realizar
 * Marca un turno confirmado como realizado.
 */
export const realizar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const usuarioId = req.usuario.id;
        const turnoActualizado = await turnosService.cambiarEstado(id, 'realizado', usuarioId);
        res.status(200).json(turnoActualizado);
    } catch (error) {
        if (error instanceof turnosService.AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        next(error);
    }
};

/**
 * GET /api/turnos
 * Lista turnos con filtros, paginación, orden y visibilidad por rol.
 * Los filtros llegan por req.query; el usuario sale del JWT (req.usuario).
 */
export const listar = async (req, res, next) => {
    try {
        const resultado = await turnosService.listarTurnos(req.query, req.usuario);
        res.status(200).json(resultado);
    } catch (error) {
        if (error instanceof turnosService.AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        next(error);
    }
};

/**
 * GET /api/turnos/resumen
 * Devuelve las métricas del panel administrativo (solo admin).
 */
export const resumen = async (req, res, next) => {
    try {
        // Llamamos a la función del service que hace las consultas de agregación.
        const datos = await turnosService.obtenerResumen();
        res.status(200).json(datos);
    } catch (error) {
        // Mismo manejo de errores que el resto de los controllers.
        if (error instanceof turnosService.AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        next(error);
    }
};