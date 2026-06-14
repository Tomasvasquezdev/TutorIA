
// components/Filtros.jsx — filtros del listado (fecha, estado, especialidad). (P3)
// SOLO arma params y avisa al padre (Turnos.jsx). No llama a la API.

const ESTADOS = ['solicitado', 'confirmado', 'realizado', 'cancelado'];

export default function Filtros({ filtros, tutores = [], onCambiar, onLimpiar }) {
    const manejarCambio = (evento) => {
        const { name, value } = evento.target;
        onCambiar(name, value);
    };

    // Especialidades únicas derivadas de la lista de tutores (para el desplegable).
    const especialidades = [...new Set(tutores.map((tutor) => tutor.especialidad))].sort();

    return (
        <div className="card shadow-sm mb-4">
            <div className="card-body">
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                    <h2 className="h6 fw-bold mb-0 d-flex align-items-center gap-2">
                        <span className="material-symbols-outlined text-primary">filter_list</span>
                        Filtros de Búsqueda
                    </h2>
                    <button className="btn btn-sm btn-outline-secondary" onClick={onLimpiar}>
                        Limpiar Filtros
                    </button>
                </div>

                <div className="row g-3 align-items-end">
                    <div className="col-12 col-sm-6 col-lg-3">
                        <label className="form-label">Fecha</label>
                        <input type="date" name="fecha" className="form-control"
                            value={filtros.fecha} onChange={manejarCambio} />
                    </div>
                    <div className="col-12 col-sm-6 col-lg-3">
                        <label className="form-label">Estado</label>
                        <select name="estado" className="form-select"
                            value={filtros.estado} onChange={manejarCambio}>
                            <option value="">Todos los estados</option>
                            {ESTADOS.map((estado) => (
                                <option key={estado} value={estado} className="text-capitalize">{estado}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-12 col-sm-6 col-lg-3">
                        <label className="form-label">Tutor</label>
                        <select name="tutorId" className="form-select"
                            value={filtros.tutorId} onChange={manejarCambio}>
                            <option value="">Todos</option>
                            {tutores.map((tutor) => (
                                <option key={tutor.id} value={tutor.id}>{tutor.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-12 col-sm-6 col-lg-3">
                        <label className="form-label">Especialidad</label>
                        <select name="especialidad" className="form-select"
                            value={filtros.especialidad} onChange={manejarCambio}>
                            <option value="">Todas las materias</option>
                            {especialidades.map((esp) => (
                                <option key={esp} value={esp}>{esp}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}

