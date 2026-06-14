

export default function Historial({ registros }) {
    if (!registros || registros.length === 0) {
        return (
            <div className="card shadow-sm">
                <div className="card-body p-4">
                    <h2 className="h5 mb-3 d-flex align-items-center gap-2">
                        <span className="material-symbols-outlined text-primary">history</span>
                        Historial de Cambios
                    </h2>
                    <p className="text-muted mb-0">No hay historial registrado para este turno.</p>
                </div>
            </div>
        );
    }

    const formatFecha = (fechaString) => {
        const fecha = new Date(fechaString);
        return fecha.toLocaleString('es-AR', {
            dateStyle: 'short',
            timeStyle: 'short'
        });
    };

    const getAccionBadgeClass = (accion) => {
        switch (accion) {
            case 'creacion': return 'text-bg-success';
            case 'edicion': return 'text-bg-warning';
            case 'confirmacion': return 'text-bg-primary';
            case 'cancelacion': return 'text-bg-danger';
            case 'realizacion': return 'text-bg-info';
            case 'reasignacion': return 'text-bg-secondary';
            default: return 'text-bg-dark';
        }
    };

    // Clase del punto del timeline según la acción.
    const getDotClass = (accion) => {
        if (accion === 'cancelacion') return 'is-cancel';
        if (accion === 'confirmacion' || accion === 'realizacion' || accion === 'creacion') return 'is-confirm';
        return '';
    };

    const formatValor = (val) => {
        if (!val) return '—';
        if (typeof val === 'object') {
            const parts = [];
            if (val.estado) parts.push(`Estado: ${val.estado}`);
            if (val.fecha) parts.push(`Fecha: ${val.fecha}`);
            if (val.horaInicio && val.horaFin) parts.push(`Horario: ${val.horaInicio}-${val.horaFin}`);
            if (val.tema) parts.push(`Tema: "${val.tema}"`);
            if (val.modalidad) parts.push(`Mod: ${val.modalidad}`);
            if (val.observaciones) parts.push(`Obs: "${val.observaciones}"`);
            
            return parts.length > 0 ? parts.join(' | ') : JSON.stringify(val);
        }
        return String(val);
    };

    return (
        <div className="card shadow-sm">
            <div className="card-body p-4">
                <h2 className="h5 mb-4 d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined text-primary">history</span>
                    Historial de Cambios
                </h2>

                <div className="timeline">
                    {registros.map((reg) => (
                        <div key={reg.id} className={`timeline-item ${getDotClass(reg.accion)}`}>
                            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                                <span className={`badge ${getAccionBadgeClass(reg.accion)}`}>
                                    {reg.accion}
                                </span>
                                <span className="timeline-time">{formatFecha(reg.fechaHora)}</span>
                            </div>
                            <div className="fw-semibold" style={{ fontSize: '.92rem' }}>
                                {reg.usuario?.nombre || `Usuario #${reg.usuarioId}`}
                                <span className="text-muted fw-normal text-capitalize"> · {reg.usuario?.rol || '—'}</span>
                            </div>
                            <div className="text-muted small mt-1">
                                {formatValor(reg.valorAnterior) !== '—' && (
                                    <div><span className="fw-semibold">Antes:</span> {formatValor(reg.valorAnterior)}</div>
                                )}
                                {formatValor(reg.valorNuevo) !== '—' && (
                                    <div><span className="fw-semibold">Después:</span> {formatValor(reg.valorNuevo)}</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
