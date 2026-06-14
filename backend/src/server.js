// ── server.js ── Punto de entrada del backend ──
// Sincroniza la base de datos y levanta el servidor HTTP.

import 'dotenv/config';
import app from './app.js';
import sequelize from './data/db.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // sync() crea las tablas si no existen (force: false por defecto).
        // Para recrearlas desde cero, usar sequelize.sync({ force: true }) o el script seed.
        await sequelize.sync();
        console.log('Base de datos SQLite sincronizada correctamente');

        app.listen(PORT, () => {
            console.log(`Servidor de tutorías corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error fatal al iniciar el servidor:', error);
    }
};

startServer();
