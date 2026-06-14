// ── turnos.api.js ── Funciones de la API de turnos ──

import axiosInstance from './axiosInstance.js';

/**
 * Crea un nuevo turno con estado "solicitado".
 * @param {Object} datos - { tutorId, fecha, horaInicio, horaFin, tema, modalidad, observaciones }
 * @returns {Promise<Object>} El turno recién creado.
 */
export const crearTurno = async (datos) => {
    const response = await axiosInstance.post('/turnos', datos);
    return response.data;
};

/**
 * Edita un turno existente. El backend revalida las reglas de negocio.
 * @param {number|string} id - ID del turno a editar.
 * @param {Object} datos - Campos a actualizar.
 * @returns {Promise<Object>} El turno actualizado.
 */
export const editarTurno = async (id, datos) => {
    const response = await axiosInstance.put(`/turnos/${id}`, datos);
    return response.data;
};

/**
 * Obtiene la lista de turnos con filtros aplicados.
 * @param {Object} filtros - Filtros de consulta (fecha, estado, tutorId, especialidad, page, limit, etc.).
 * @returns {Promise<Object>} Listado paginado de turnos { data, total, page, limit }.
 */
export const getTurnos = async (filtros = {}) => {
    const response = await axiosInstance.get('/turnos', { params: filtros });
    return response.data;
};

/**
 * Obtiene el detalle de un turno específico.
 * @param {number|string} id - ID del turno.
 * @returns {Promise<Object>} Detalle del turno.
 */
export const getTurno = async (id) => {
    const response = await axiosInstance.get(`/turnos/${id}`);
    return response.data;
};

/**
 * Obtiene el historial de cambios de un turno específico.
 * @param {number|string} id - ID del turno.
 * @returns {Promise<Array>} Listado del historial de cambios.
 */
export const getHistorial = async (id) => {
    const response = await axiosInstance.get(`/turnos/${id}/historial`);
    return response.data;
};

/**
 * Cancela un turno solicitado o confirmado.
 * @param {number|string} id - ID del turno.
 * @returns {Promise<Object>} El turno actualizado.
 */
export const cancelarTurno = async (id) => {
    const response = await axiosInstance.patch(`/turnos/${id}/cancelar`);
    return response.data;
};

/**
 * Confirma un turno solicitado.
 * @param {number|string} id - ID del turno.
 * @returns {Promise<Object>} El turno actualizado.
 */
export const confirmarTurno = async (id) => {
    const response = await axiosInstance.patch(`/turnos/${id}/confirmar`);
    return response.data;
};

/**
 * Marca un turno confirmado como realizado.
 * @param {number|string} id - ID del turno.
 * @returns {Promise<Object>} El turno actualizado.
 */
export const realizarTurno = async (id) => {
    const response = await axiosInstance.patch(`/turnos/${id}/realizar`);
    return response.data;
};
/**
 * Obtiene las métricas del panel administrativo (solo admin).
 * @returns {Promise<Object>} { turnosDelDia, pendientesConfirmacion, turnosPorTutor, temasMasSolicitados }
 */
export const getResumen = async () => {
    const response = await axiosInstance.get('/turnos/resumen');
    return response.data;
};