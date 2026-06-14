// ── auth.js ── Middlewares de autenticación ──
// Contiene dos middlewares relacionados con la autenticación:
//
// 1. auth (export default): Verifica que la petición incluya un token JWT válido.
//    Si el token es correcto, inyecta { id, rol } en req.usuario.
//    Si falta o es inválido, responde 401 Unauthorized.
//
// 2. loginLimiter (export nombrado): Limita los intentos de login por IP
//    para prevenir ataques de fuerza bruta. Responde 429 Too Many Requests.

import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
    console.error('CRITICAL ERROR: No se encontró JWT_SECRET en las variables de entorno. Asegúrate de configurar el archivo .env');
    process.exit(1);
}

// ── Middleware 1: Verificación de token JWT ──
export default function auth (req, res, next) {
    const authHeader = req.headers['authorization'];

    // El formato esperado es: "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token válido.' });
    }

    // Extraer el token puro (sin la palabra "Bearer")
    const token = authHeader.split(' ')[1];

    try {
        // Verificar firma y vigencia del token
        const payload = jwt.verify(token, SECRET_KEY);

        // Inyectar los datos del usuario en el request
        req.usuario = payload;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado.' }); // Código 401 si falló la verificación
    }
};

// ── Middleware 2: Rate Limiter para login ──
// Previene ataques de fuerza bruta: si alguien intenta adivinar una contraseña
// probando combinaciones, después de 10 intentos desde la misma IP en 15 minutos
// el servidor responde 429 (Too Many Requests) y bloquea temporalmente.
// No se aplica a /register porque ahí ya falla por email duplicado.
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
    max: 10,                   // Máximo 10 intentos por ventana
    message: {
        error: 'Demasiados intentos de inicio de sesión. Intente nuevamente en 15 minutos.'
    },
    standardHeaders: true,     // Devuelve info de rate limit en los headers RateLimit-*
    legacyHeaders: false,      // Desactiva los headers X-RateLimit-* (deprecados)
});
