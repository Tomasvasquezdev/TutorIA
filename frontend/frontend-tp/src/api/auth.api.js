// ── auth.api.js ── Funciones de la API de autenticación ──

import axiosInstance from './axiosInstance';

/**
 * Inicia sesión. Devuelve { token, usuario: { id, nombre, email, rol } }.
 */
export const loginAPI = async (email, password) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    return response.data;
};

/**
 * Registra un nuevo usuario. Por defecto es estudiante.
 * Si esTutor es true, también envía especialidad y diasDisponibles
 * para crear el perfil de tutor asociado.
 */
export const registerAPI = async (nombre, email, password, esTutor = false, especialidad = '', diasDisponibles = []) => {
    const body = { nombre, email, password };
    if (esTutor) {
        body.esTutor = true;
        body.especialidad = especialidad;
        body.diasDisponibles = diasDisponibles;
    }
    const response = await axiosInstance.post('/auth/register', body);
    return response.data;
};

/**
 * Obtiene la lista de especialidades permitidas para los tutores.
 */
export const getEspecialidadesAPI = async () => {
    const response = await axiosInstance.get('/tutores/especialidades');
    return response.data;
};