// ── models/index.js ── Registro central de modelos y definición de asociaciones ──

import sequelize from "../data/db.js";
import Usuario from "./Usuario.js";
import Tutor from "./Tutor.js";
import HistorialTurno from "./HistorialTurno.js";
import Turno from "./Turno.js";

// ── Asociaciones (Relaciones entre tablas) ──

// definicion de asociaciones (Relaciones)

// Un usuario puede ser tutor
Usuario.hasOne(Tutor, { foreignKey: "usuarioId" });
Tutor.belongsTo(Usuario, { foreignKey: "usuarioId" });

// Un usuario genera entradas de auditoría al operar sobre turnos (1:N)
Usuario.hasMany(HistorialTurno, { foreignKey: "usuarioId" });
HistorialTurno.belongsTo(Usuario, { foreignKey: "usuarioId" });

// Un tutor puede tener muchos turnos asignados (1:N)
Tutor.hasMany(Turno, { foreignKey: "tutorId" });
Turno.belongsTo(Tutor, { foreignKey: "tutorId" });

// Un estudiante (usuario) puede solicitar muchos turnos (1:N)
Usuario.hasMany(Turno, { foreignKey: "estudianteId" });
Turno.belongsTo(Usuario, { foreignKey: "estudianteId" });

// Cada turno acumula un historial de cambios (1:N)
Turno.hasMany(HistorialTurno, { foreignKey: "turnoId" });
HistorialTurno.belongsTo(Turno, { foreignKey: "turnoId" });

export {
    sequelize,
    Usuario,
    Tutor,
    HistorialTurno,
    Turno
}