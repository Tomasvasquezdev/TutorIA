import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cancelarTurno, confirmarTurno, realizarTurno } from '../api/turnos.api.js';

export default function AccionesTurno({ turno, usuario, onEstadoCambiado }) {
    const navigate = useNavigate();
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    if (!turno || !usuario) return null;

    const esAdmin = usuario.rol === 'admin';
    const esEstudianteDueño = usuario.rol === 'estudiante' && turno.estudianteId === usuario.id;
    const esTutorAsignado = usuario.rol === 'tutor' && turno.Tutor && turno.Tutor.usuarioId === usuario.id;

    const puedeCancelar = (esAdmin || esEstudianteDueño) && (turno.estado === 'solicitado' || turno.estado === 'confirmado');
    const puedeConfirmar = (esAdmin || esTutorAsignado) && turno.estado === 'solicitado';
    const puedeRealizar = (esAdmin || esTutorAsignado) && turno.estado === 'confirmado';
    const puedeEditar = (esAdmin || esEstudianteDueño) && turno.estado !== 'cancelado';

    const handleAccion = async (accionFn) => {
        if (!window.confirm('¿Estás seguro de realizar esta acción?')) return;
        setCargando(true);
        setError(null);
        try {
            await accionFn(turno.id);
            onEstadoCambiado();
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Error al procesar la acción');
        } finally {
            setCargando(false);
        }
    };

    // No renderiza wrapper de card: solo el grupo de botones (+ error).
    // Pensado para vivir al pie de la card de detalle.
    const hayAcciones = puedeConfirmar || puedeRealizar || puedeEditar || puedeCancelar;

    if (!hayAcciones) return null;

    return (
        <div className="d-flex flex-column gap-2">
            <div className="d-flex flex-wrap gap-2">
                {puedeConfirmar && (
                    <button
                        className="btn btn-primary d-flex align-items-center gap-2"
                        onClick={() => handleAccion(confirmarTurno)}
                        disabled={cargando}
                    >
                        <span className="material-symbols-outlined">check</span>
                        {cargando ? 'Confirmando...' : 'Confirmar'}
                    </button>
                )}

                {puedeRealizar && (
                    <button
                        className="btn btn-success d-flex align-items-center gap-2"
                        onClick={() => handleAccion(realizarTurno)}
                        disabled={cargando}
                    >
                        <span className="material-symbols-outlined">task_alt</span>
                        {cargando ? 'Guardando...' : 'Marcar Realizado'}
                    </button>
                )}

                {puedeEditar && (
                    <button
                        className="btn btn-outline-secondary d-flex align-items-center gap-2"
                        onClick={() => navigate(`/turnos/${turno.id}/editar`)}
                        disabled={cargando}
                    >
                        <span className="material-symbols-outlined">edit</span>
                        Modificar
                    </button>
                )}

                {puedeCancelar && (
                    <button
                        className="btn btn-outline-danger d-flex align-items-center gap-2"
                        onClick={() => handleAccion(cancelarTurno)}
                        disabled={cargando}
                    >
                        <span className="material-symbols-outlined">close</span>
                        {cargando ? 'Cancelando...' : 'Cancelar'}
                    </button>
                )}
            </div>

            {error && <div className="alert alert-danger py-2 px-3 mb-0 w-100">⚠️ {error}</div>}
        </div>
    );
}
