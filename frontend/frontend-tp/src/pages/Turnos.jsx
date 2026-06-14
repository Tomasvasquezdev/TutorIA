// pages/Turnos.jsx — listado con filtros, paginación y orden. (P3)
// El backend resuelve filtros/paginación/orden/visibilidad; acá solo
// mandamos parámetros y mostramos los estados (carga/vacío/error/datos).

import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTurnos } from '../api/turnos.api.js';
import { getTutores } from '../api/tutores.api.js';
import { AuthContext } from '../context/AuthContext.jsx';
import Filtros from '../components/Filtros.jsx';
import TablaTurnos from '../components/TablaTurnos.jsx';

const FILTROS_INICIALES = { fecha: '', estado: '', tutorId: '', especialidad: '' };

export default function Turnos() {
    const { usuario } = useContext(AuthContext);
    const puedeSolicitar = usuario?.rol === 'estudiante' || usuario?.rol === 'admin';
    const [filtros, setFiltros] = useState(FILTROS_INICIALES);
    const [pagina, setPagina] = useState(1);
    const [ordenarPor, setOrdenarPor] = useState('fecha');
    const [orden, setOrden] = useState('DESC');

    const [resultado, setResultado] = useState({ data: [], total: 0, page: 1, limit: 10 });
    const [tutores, setTutores] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Cargo los tutores una sola vez para poblar el selector de filtro.
    useEffect(() => {
        let montado = true;
        getTutores()
            .then((lista) => { if (montado) setTutores(lista); })
            .catch(() => { if (montado) setTutores([]); }); // si falla, el filtro queda vacío (no rompe el listado)
        return () => { montado = false; };
    }, []);

    useEffect(() => {
        let montado = true; // evita actualizar el estado si el componente se desmontó
        const cargar = async () => {
            setCargando(true);
            setError(null);
            try {
                // Solo mando los parámetros que tienen valor (where dinámico del backend).
                const parametros = { page: pagina, sortBy: ordenarPor, order: orden };
                Object.entries(filtros).forEach(([clave, valor]) => {
                    if (valor) parametros[clave] = valor;
                });
                const respuesta = await getTurnos(parametros);
                if (montado) setResultado(respuesta);
            } catch (fallo) {
                if (montado) setError(fallo.response?.data?.error || fallo.message || 'Error al cargar los turnos');
            } finally {
                if (montado) setCargando(false);
            }
        };
        cargar();
        return () => { montado = false; };
    }, [filtros, pagina, ordenarPor, orden]);

    const manejarCambioFiltro = (campo, valor) => {
        setFiltros((anterior) => ({ ...anterior, [campo]: valor }));
        setPagina(1); // al cambiar un filtro vuelvo a la primera página
    };

    const manejarLimpiar = () => {
        setFiltros(FILTROS_INICIALES);
        setPagina(1);
    };

    const totalPaginas = Math.max(1, Math.ceil(resultado.total / resultado.limit));

    return (
        <div>
            <div className="page-header d-flex flex-wrap justify-content-between align-items-start gap-3">
                <div>
                    <h1 className="h3">Turnos Programados</h1>
                    <p>Consultá tus próximas sesiones de tutoría, solicitudes pendientes y su estado.</p>
                </div>
                {puedeSolicitar && (
                    <Link to="/turnos/nuevo" className="btn btn-primary d-flex align-items-center gap-2">
                        <span className="material-symbols-outlined">add</span> Agendar Nuevo Turno
                    </Link>
                )}
            </div>

            <Filtros filtros={filtros} tutores={tutores} onCambiar={manejarCambioFiltro} onLimpiar={manejarLimpiar} />

            <div className="d-flex flex-wrap justify-content-end gap-2 mb-3">
                <select className="form-select form-select-sm" style={{ width: '180px' }} value={ordenarPor}
                    onChange={(evento) => { setOrdenarPor(evento.target.value); setPagina(1); }}>
                    <option value="fecha">Ordenar por fecha</option>
                    <option value="horaInicio">Hora inicio</option>
                    <option value="estado">Estado</option>
                    <option value="createdAt">Creación</option>
                </select>
                <select className="form-select form-select-sm" style={{ width: '150px' }} value={orden}
                    onChange={(evento) => { setOrden(evento.target.value); setPagina(1); }}>
                    <option value="DESC">Descendente</option>
                    <option value="ASC">Ascendente</option>
                </select>
            </div>

            {cargando && (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <span className="ms-3 text-secondary">Cargando turnos...</span>
                </div>
            )}

            {!cargando && error && (
                <div className="alert alert-danger">⚠️ {error}</div>
            )}

            {!cargando && !error && resultado.data.length === 0 && (
                <div className="alert alert-secondary text-center">No hay turnos para mostrar.</div>
            )}

            {!cargando && !error && resultado.data.length > 0 && (
                <div className="card shadow-sm">
                    <div className="card-body p-0">
                        <TablaTurnos turnos={resultado.data} />
                    </div>
                    <div className="card-footer bg-transparent d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                            {resultado.total} turno(s) — página {resultado.page} de {totalPaginas}
                        </small>
                        <div className="btn-group">
                            <button className="btn btn-outline-secondary btn-sm"
                                disabled={pagina <= 1}
                                onClick={() => setPagina((actual) => actual - 1)}>
                                ← Anterior
                            </button>
                            <button className="btn btn-outline-secondary btn-sm"
                                disabled={pagina >= totalPaginas}
                                onClick={() => setPagina((actual) => actual + 1)}>
                                Siguiente →
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
