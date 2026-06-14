// ── tutores.api.js ── Funciones de la API de tutores ──

import axiosInstance from './axiosInstance.js';

/**
 * Obtiene la lista de tutores activos (id, nombre, especialidad).
 * Se usa para poblar el <select> en el formulario de turnos.
 */
export const getTutores = async () => {
    const response = await axiosInstance.get('/tutores');
    return response.data;
};
