import { useState, useEffect } from 'react';
import { getTurnos } from '../api/turnos.api.js';

const TIME_SLOT_MINUTES = 30;
const START_HOUR = 8; // 08:00
const END_HOUR = 20; // 20:00

// Convierte "HH:mm" a minutos
const timeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + (m || 0);
};

// Convierte minutos a "HH:mm"
const minutesToTime = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export default function SelectorBloquesHorarios({ tutor, fecha, onRangoSelect }) {
    const [bloquesLibres, setBloquesLibres] = useState([]);
    const [seleccionados, setSeleccionados] = useState([]); // Array de índices de bloques seleccionados
    const [isLoading, setIsLoading] = useState(false);

    const calcularBloques = (turnosOcupados) => {
        const slots = [];
        const startMin = START_HOUR * 60;
        const endMin = END_HOUR * 60;

        for (let current = startMin; current < endMin; current += TIME_SLOT_MINUTES) {
            const blockStart = current;
            const blockEnd = current + TIME_SLOT_MINUTES;

            // Revisar si choca con algún turno ocupado
            const isOcupado = turnosOcupados.some(turno => {
                const tStart = timeToMinutes(turno.horaInicio);
                const tEnd = timeToMinutes(turno.horaFin);
                // Hay choque si el inicio del bloque es antes del fin del turno
                // Y el fin del bloque es después del inicio del turno
                return blockStart < tEnd && blockEnd > tStart;
            });

            slots.push({
                index: slots.length,
                start: minutesToTime(blockStart),
                end: minutesToTime(blockEnd),
                isOcupado
            });
        }
        setBloquesLibres(slots);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!tutor || !fecha) return;
        // eslint-disable-next-line
        setIsLoading(true);
        setSeleccionados([]); // Resetear selección al cambiar fecha
        onRangoSelect(null, null);

        // Buscar turnos de la fecha
        getTurnos({ tutorId: tutor.id, fecha, limit: 100 })
            .then(res => {
                const ocupados = res.data.filter(t => t.estado === 'solicitado' || t.estado === 'confirmado');
                calcularBloques(ocupados);
            })
            .catch(err => console.error("Error al cargar turnos del día:", err))
            .finally(() => setIsLoading(false));
    }, [tutor, fecha]);



    const handleBloqueClick = (index) => {
        if (bloquesLibres[index].isOcupado) return;

        let nuevosSeleccionados = [...seleccionados];

        if (nuevosSeleccionados.includes(index)) {
            // Si ya está, lo quitamos y también quitamos los que estén "después" para mantener consecutividad
            // O simplemente reiniciamos si es el medio. Para simplificar, si deseleccionan, limpiamos todo y empezamos de nuevo
            nuevosSeleccionados = [];
        } else {
            if (nuevosSeleccionados.length === 0) {
                nuevosSeleccionados.push(index);
            } else {
                // Verificar si es consecutivo
                const minIdx = Math.min(...nuevosSeleccionados);
                const maxIdx = Math.max(...nuevosSeleccionados);

                if (index === minIdx - 1 || index === maxIdx + 1) {
                    // Es adyacente
                    nuevosSeleccionados.push(index);
                    nuevosSeleccionados.sort((a, b) => a - b);
                } else {
                    // No es consecutivo, reiniciamos la selección con este nuevo
                    nuevosSeleccionados = [index];
                }
            }
        }

        // Verificar límite de 2 horas (4 bloques de 30 mins)
        if (nuevosSeleccionados.length > 4) {
            alert("No puedes seleccionar más de 2 horas.");
            return;
        }

        setSeleccionados(nuevosSeleccionados);

        if (nuevosSeleccionados.length > 0) {
            const hInicio = bloquesLibres[nuevosSeleccionados[0]].start;
            const hFin = bloquesLibres[nuevosSeleccionados[nuevosSeleccionados.length - 1]].end;
            onRangoSelect(hInicio, hFin);
        } else {
            onRangoSelect(null, null);
        }
    };

    if (!fecha) return null;

    if (isLoading) return <div className="text-center py-3"><div className="spinner-border text-primary" role="status"></div></div>;

    return (
        <div className="card shadow-sm mb-0">
            <div className="card-body p-3">
                <h2 className="h6 fw-bold text-secondary border-bottom pb-2 mb-2 d-flex align-items-center gap-2">
                    <span className="material-symbols-outlined text-primary">schedule</span>
                    Horarios del {fecha.split('-').reverse().join('/')}
                </h2>
                <p className="text-muted small mb-3">
                    Seleccioná uno o varios bloques <strong>consecutivos</strong> (máximo 2 horas).
                </p>
                <div className="d-flex flex-wrap gap-2">
                    {bloquesLibres.map((bloque, idx) => {
                        const isSelected = seleccionados.includes(idx);

                        let btnClass = "btn btn-sm slot-chip ";
                        if (bloque.isOcupado) {
                            btnClass += "btn-secondary opacity-50 pe-none";
                        } else if (isSelected) {
                            btnClass += "btn-primary";
                        } else {
                            btnClass += "btn-outline-primary";
                        }

                        return (
                            <button
                                key={idx}
                                type="button"
                                className={btnClass}
                                onClick={() => handleBloqueClick(idx)}
                            >
                                {bloque.start}
                            </button>
                        );
                    })}
                </div>

                {seleccionados.length > 0 && (
                    <div className="mt-3 p-3 rounded d-flex justify-content-between align-items-center" style={{ background: 'var(--ti-confirmed-bg)', color: 'var(--ti-confirmed-text)' }}>
                        <span>Seleccionaste de <strong>{bloquesLibres[seleccionados[0]].start}</strong> a <strong>{bloquesLibres[seleccionados[seleccionados.length - 1]].end}</strong></span>
                        <span className="badge text-bg-success">{seleccionados.length * TIME_SLOT_MINUTES} min</span>
                    </div>
                )}
            </div>
        </div>
    );
}
