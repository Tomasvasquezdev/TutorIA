// ── tutores.controller.js ── Controlador para consulta de tutores ──

import * as turnosService from '../services/turnos.service.js';
import { ESPECIALIDADES_PERMITIDAS } from '../models/Tutor.js';

/**
 * GET /api/tutores/especialidades
 * Devuelve la lista de especialidades permitidas.
 */
export const especialidades = (req, res) => {
    res.status(200).json(ESPECIALIDADES_PERMITIDAS);
};

/**
 * GET /api/tutores
 * Devuelve la lista de tutores activos (id, nombre, especialidad)
 * para poblar el selector del formulario de turnos en el frontend.
 */
export const listar = async (req, res, next) => {
    try {
        const tutores = await turnosService.listarTutoresParaSelect();
        res.status(200).json(tutores);
    } catch (error) {
        next(error);
    }
};
