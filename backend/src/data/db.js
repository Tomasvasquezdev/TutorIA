// ── db.js ── Conexión a la base de datos SQLite con Sequelize ──
import { Sequelize } from "sequelize";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Resolvemos la ruta absoluta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Si la variable NODE_ENV es "test" (definida al correr 'npm test'),
// usamos ":memory:" como base de datos en RAM para aislar por completo los tests.
// De lo contrario, persiste en el archivo físico 'db.sqlite' para uso local de desarrollo.
const storage = process.env.NODE_ENV === "test" ? ":memory:" : join(__dirname, "db.sqlite");

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage,
    logging: false, // Desactivar logs SQL en consola para mantener limpia la salida de Jest
});

export default sequelize;
