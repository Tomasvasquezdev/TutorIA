import { useContext, useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { getTurno, getHistorial } from '../api/turnos.api.js';
import Historial from '../components/Historial.jsx';
import AccionesTurno from '../components/AccionesTurno.jsx';

export default function TurnoDetalle() {
    const { id } = useParams();
    const { usuario } = useContext(AuthContext);

    const [turno, setTurno] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const cargarDatos = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            const dataTurno = await getTurno(id);
            setTurno(dataTurno);
            const dataHistorial = await getHistorial(id);
            setHistorial(dataHistorial);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Error al cargar los detalles del turno');
        } finally {
            setCargando(false);
        }
    }, [id]);

    useEffect(() => {
        // eslint-disable-next-line
        cargarDatos();
    }, [cargarDatos]);

    if (cargando) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <span className="ms-3 text-secondary">Cargando detalles del turno...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger text-center shadow-sm p-4 rounded-3">
                    <h5 className="text-danger mb-3 fw-bold">⚠️ {error}</h5>
                    <Link to="/turnos" className="btn btn-outline-danger">Volver al listado</Link>
                </div>
            </div>
        );
    }

    const getEstadoBadgeClass = (estado) => {
        switch (estado) {
            case 'solicitado': return 'text-bg-warning';
            case 'confirmado': return 'text-bg-success';
            case 'realizado': return 'text-bg-secondary';
            case 'cancelado': return 'text-bg-danger';
            default: return 'text-bg-secondary';
        }
    };

    // Iniciales para los avatares.
    const iniciales = (nombre = '') =>
        nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';

    return (
        <div style={{ maxWidth: '1180px' }}>
            {/* ── Barra superior: volver + estado ── */}
            <div className="d-flex justify-content-between align-items-center mb-4 gap-2">
                <Link to="/turnos" className="text-decoration-none text-primary d-inline-flex align-items-center gap-1 fw-semibold">
                    <span className="material-symbols-outlined">arrow_back</span> Volver a Turnos
                </Link>
                <span className={`badge ${getEstadoBadgeClass(turno.estado)}`}>
                    {turno.estado}
                </span>
            </div>

            {/* ── 2 columnas: detalle (izq) / historial (der) ── */}
            <div className="row g-4">
                <div className="col-12 col-lg-8">
                    <div className="card shadow-sm h-100">
                        <div className="card-body p-4 p-md-4 d-flex flex-column">
                            {/* Título + fecha/hora */}
                            <h1 className="h2 fw-bold mb-2">{turno.tema}</h1>
                            <p className="text-muted d-flex align-items-center gap-2 mb-0">
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>schedule</span>
                                {turno.fecha} • {turno.horaInicio} - {turno.horaFin}
                            </p>

                            <hr className="my-4" />

                            {/* Participantes: tutor / estudiante */}
                            <div className="row g-3 mb-4">
                                <div className="col-12 col-md-6">
                                    <div className="detail-label mb-2">Tutor</div>
                                    <div className="detail-subcard">
                                        <span className="avatar-circle">{iniciales(turno.Tutor?.nombre)}</span>
                                        <div>
                                            <div className="fw-semibold">{turno.Tutor?.nombre || '—'}</div>
                                            <small className="text-muted">{turno.Tutor?.especialidad || '—'}</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12 col-md-6">
                                    <div className="detail-label mb-2">Estudiante</div>
                                    <div className="detail-subcard">
                                        <span className="avatar-circle avatar-circle--student">{iniciales(turno.usuario?.nombre)}</span>
                                        <div>
                                            <div className="fw-semibold">{turno.usuario?.nombre || '—'}</div>
                                            <small className="text-muted">{turno.usuario?.email || '—'}</small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Grupo de info: modalidad / observaciones */}
                            <div className="info-group">
                                <div className="info-group__row">
                                    <span className="material-symbols-outlined">videocam</span>
                                    <div>
                                        <div className="detail-label mb-1">Modalidad</div>
                                        <div className="text-capitalize">{turno.modalidad}</div>
                                    </div>
                                </div>
                                <div className="info-group__row">
                                    <span className="material-symbols-outlined">sticky_note_2</span>
                                    <div>
                                        <div className="detail-label mb-1">Observaciones</div>
                                        <div style={{ whiteSpace: 'pre-wrap' }}>
                                            {turno.observaciones || 'Sin observaciones adicionales'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Acciones al pie (según rol/estado) */}
                            <div className="mt-auto pt-4">
                                <AccionesTurno
                                    turno={turno}
                                    usuario={usuario}
                                    onEstadoCambiado={cargarDatos}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-4">
                    {/* Componente de Auditoría de cambios (timeline) */}
                    <Historial registros={historial} />
                </div>
            </div>
        </div>
    );
}
