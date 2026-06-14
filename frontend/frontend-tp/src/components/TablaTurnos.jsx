// components/TablaTurnos.jsx — tabla del listado de turnos. (P3)
// Componente de presentación: recibe los turnos por props y SOLO los muestra.
// No llama a la API ni filtra (eso lo resuelve el backend).

import { useNavigate } from 'react-router-dom';

// Clase de color del badge según el estado del turno.
const colorEstado = (estado) => {
    switch (estado) {
        case 'solicitado': return 'text-bg-warning';
        case 'confirmado': return 'text-bg-success';
        case 'realizado': return 'text-bg-secondary';
        case 'cancelado': return 'text-bg-danger';
        default: return 'text-bg-secondary';
    }
};

// Iniciales para el avatar del tutor.
const iniciales = (nombre = '') =>
    nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';

// Ícono de modalidad.
const iconoModalidad = (modalidad) => (modalidad === 'virtual' ? 'videocam' : 'location_on');

export default function TablaTurnos({ turnos }) {
    const navigate = useNavigate();

    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                    <tr>
                        <th>Fecha y Hora</th>
                        <th>Tutor</th>
                        <th>Tema / Especialidad</th>
                        <th>Modalidad</th>
                        <th>Estado</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {turnos.map((turno) => (
                        <tr
                            key={turno.id}
                            className="row-clickable"
                            onClick={() => navigate(`/turnos/${turno.id}`)}
                        >
                            <td>
                                <div className="fw-semibold">{turno.fecha}</div>
                                <small className="text-muted">{turno.horaInicio} - {turno.horaFin}</small>
                            </td>
                            <td>
                                <div className="d-flex align-items-center gap-2">
                                    <span className="avatar-circle avatar-circle--sm">{iniciales(turno.Tutor?.nombre)}</span>
                                    <span className="fw-medium">{turno.Tutor?.nombre || '—'}</span>
                                </div>
                            </td>
                            <td>
                                <div className="fw-medium">{turno.tema}</div>
                                <small className="text-muted">{turno.Tutor?.especialidad || '—'}</small>
                            </td>
                            <td>
                                <span className="d-inline-flex align-items-center gap-1 text-capitalize">
                                    <span className="material-symbols-outlined text-muted" style={{ fontSize: '18px' }}>
                                        {iconoModalidad(turno.modalidad)}
                                    </span>
                                    {turno.modalidad}
                                </span>
                            </td>
                            <td>
                                <span className={`badge ${colorEstado(turno.estado)}`}>
                                    {turno.estado}
                                </span>
                            </td>
                            <td className="text-end">
                                <span className="material-symbols-outlined text-muted">chevron_right</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
