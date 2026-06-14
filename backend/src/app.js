// ── app.js ── Configuración central de Express ──
// Registra middlewares globales, monta los routers y el manejador de errores.

import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import turnosRoutes from './routes/turnos.routes.js';
import tutoresRoutes from './routes/tutores.routes.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

// ── Middlewares globales ──

// CORS: permite que el frontend (puerto 5173) haga peticiones al backend (puerto 3000)
app.use(cors());

// Parseo de JSON: interpreta el body de las peticiones como JSON
app.use(express.json());

// ── Montaje de rutas ──

// Autenticación (registro y login) — rutas públicas
app.use('/api/auth', authRoutes);

// Turnos (alta, edición, listado, estados) — requieren autenticación
app.use('/api/turnos', turnosRoutes);

// Tutores (consulta para el formulario) — requiere autenticación
app.use('/api/tutores', tutoresRoutes);

// ── Manejador centralizado de errores ──
// IMPORTANTE: debe ir siempre al final, después de montar todas las rutas.
app.use(errorHandler);

export default app;