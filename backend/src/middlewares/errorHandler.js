// ── errorHandler.js ── Middleware centralizado de errores ──
// Captura cualquier error que llegue vía next(error) desde controladores o services.
// Devuelve al frontend un JSON con formato { error: "mensaje" } y el status HTTP apropiado.
// IMPORTANTE: debe registrarse DESPUÉS de todas las rutas en app.js.

export default function errorHandler(err, req, res, next) {
    console.error(err);

    // Si el error tiene statusCode (AppError) o status (auth.service), lo usamos; si no, 500.
    const statusCode = err.statusCode || err.status || 500;
    const mensaje = err.message || 'Error interno del servidor';

    res.status(statusCode).json({ error: mensaje });
}
