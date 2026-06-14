// ── components/ResumenAdmin.jsx ── Dashboard del panel admin (P6) ──
//
// Componente de PRESENTACIÓN: recibe el resumen ya calculado por props
// (desde Resumen.jsx) y SOLO lo muestra. No pide datos ni calcula reglas
// de negocio; solo agrega/deriva totales a partir de lo que ya vino.

export default function ResumenAdmin({ resumen }) {
    const {
        turnosDelDia,
        pendientesConfirmacion,
        turnosPorTutor = [],
        temasMasSolicitados = []
    } = resumen;

    // Métricas derivadas de los datos provistos (no son inventadas).
    const totalTurnos = turnosPorTutor.reduce((acc, fila) => acc + Number(fila.cantidad || 0), 0);
    const tutoresConTurnos = turnosPorTutor.length;

    // Máximos para escalar las barras de proporción.
    const maxTutor = Math.max(1, ...turnosPorTutor.map((f) => Number(f.cantidad || 0)));
    const maxTema = Math.max(1, ...temasMasSolicitados.map((f) => Number(f.cantidad || 0)));

    const kpis = [
        { label: 'Turnos de hoy', value: turnosDelDia, icon: 'today', color: 'blue' },
        { label: 'Pendientes de confirmar', value: pendientesConfirmacion, icon: 'pending_actions', color: 'orange' },
        { label: 'Total de turnos', value: totalTurnos, icon: 'event_available', color: 'green' },
        { label: 'Tutores con turnos', value: tutoresConTurnos, icon: 'school', color: 'purple' },
    ];

    return (
        <div>
            {/* ── KPIs ── */}
            <div className="row g-3 mb-4">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="col-12 col-sm-6 col-xl-3">
                        <div className="card shadow-sm h-100 kpi-card-wrap">
                            <div className="card-body kpi-card">
                                <div className={`kpi-card__icon kpi-card__icon--${kpi.color}`}>
                                    <span className="material-symbols-outlined">{kpi.icon}</span>
                                </div>
                                <div>
                                    <div className="kpi-card__value">{kpi.value}</div>
                                    <div className="kpi-card__label">{kpi.label}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Rankings ── */}
            <div className="row g-3">
                {/* Turnos por tutor */}
                <div className="col-12 col-lg-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-body p-4">
                            <h2 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
                                <span className="material-symbols-outlined text-primary">groups</span>
                                Turnos por tutor
                            </h2>

                            {turnosPorTutor.length === 0 ? (
                                <p className="text-muted mb-0">Sin datos para mostrar.</p>
                            ) : (
                                turnosPorTutor.map((fila, i) => {
                                    const cantidad = Number(fila.cantidad || 0);
                                    const nombre = fila.Tutor?.nombre || `Tutor #${fila.tutorId}`;
                                    return (
                                        <div key={i} className="rank-row">
                                            <span className="rank-badge">{i + 1}</span>
                                            <div className="rank-info">
                                                <div className="d-flex justify-content-between align-items-center gap-2">
                                                    <span className="fw-medium text-truncate">{nombre}</span>
                                                    <span className="rank-count">{cantidad}</span>
                                                </div>
                                                <div className="rank-bar">
                                                    <div className="rank-bar__fill" style={{ width: `${(cantidad / maxTutor) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Temas más solicitados */}
                <div className="col-12 col-lg-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-body p-4">
                            <h2 className="h6 fw-bold mb-3 d-flex align-items-center gap-2">
                                <span className="material-symbols-outlined text-primary">local_fire_department</span>
                                Temas más solicitados
                            </h2>

                            {temasMasSolicitados.length === 0 ? (
                                <p className="text-muted mb-0">Sin datos para mostrar.</p>
                            ) : (
                                temasMasSolicitados.map((fila, i) => {
                                    const cantidad = Number(fila.cantidad || 0);
                                    return (
                                        <div key={i} className="rank-row">
                                            <span className="rank-badge">{i + 1}</span>
                                            <div className="rank-info">
                                                <div className="d-flex justify-content-between align-items-center gap-2">
                                                    <span className="fw-medium text-truncate">{fila.tema}</span>
                                                    <span className="rank-count">{cantidad}</span>
                                                </div>
                                                <div className="rank-bar">
                                                    <div className="rank-bar__fill" style={{ width: `${(cantidad / maxTema) * 100}%`, background: 'var(--ti-secondary)' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
