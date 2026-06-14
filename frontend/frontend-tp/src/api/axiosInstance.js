// ── axiosInstance.js ── Instancia centralizada de Axios ──
// Todas las peticiones al backend deben usar esta instancia en lugar de
// importar axios directamente. Esto garantiza que:
// 1. La URL base se configure en un solo lugar.
// 2. El token JWT se adjunte automáticamente a cada request.

import axios from 'axios';

// URL base de la API. Se puede sobreescribir con la variable de entorno VITE_API_URL.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor de peticiones: se ejecuta ANTES de que cada request salga al backend.
// Busca el JWT en localStorage y lo inyecta en el header Authorization.
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de respuestas: se ejecuta DESPUÉS de recibir cada respuesta del backend.
// Si el backend devuelve 401 (token expirado o inválido), limpia la sesión y
// redirige al login. Esto complementa a RutaProtegida, que solo verifica si el
// token existe en localStorage pero no si sigue siendo válido.
// Los tokens JWT se firman con expiración de 2 horas (ver auth.service.js).
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
