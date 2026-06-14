import { useState, useEffect } from 'react';
import { getTurnos } from '../api/turnos.api.js';

// Nombres de los días en la base de datos (0 = domingo en JS, igual que getDiaSemana del backend)
const diasSemanales = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

export default function CalendarioDisponibilidad({ tutor, onDateSelect, selectedDate }) {
    const [mesActual, setMesActual] = useState(new Date().getMonth());
    const [anioActual, setAnioActual] = useState(new Date().getFullYear());
    const [turnosTutor, setTurnosTutor] = useState([]);
    
    useEffect(() => {
        if (!tutor) return;
        // Obtenemos todos los turnos del tutor para ver ocupación
        // Lo ideal sería filtrar por estado, pero para asegurar, traemos todos y filtramos en JS
        getTurnos({ tutorId: tutor.id, limit: 1000 })
            .then(res => {
                const vigentes = res.data.filter(t => t.estado === 'solicitado' || t.estado === 'confirmado');
                setTurnosTutor(vigentes);
            })
            .catch(err => console.error("Error cargando turnos del tutor:", err));
    }, [tutor]);

    if (!tutor) {
        return <div className="text-muted text-center p-4">Seleccione un tutor para ver su disponibilidad.</div>;
    }

    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const nextMonth = () => {
        if (mesActual === 11) {
            setMesActual(0);
            setAnioActual(anioActual + 1);
        } else {
            setMesActual(mesActual + 1);
        }
    };

    const prevMonth = () => {
        if (mesActual === 0) {
            setMesActual(11);
            setAnioActual(anioActual - 1);
        } else {
            setMesActual(mesActual - 1);
        }
    };

    // Validación de límite de 2 meses hacia adelante
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2);
    
    const isPrevDisabled = (anioActual === hoy.getFullYear() && mesActual === hoy.getMonth());
    const isNextDisabled = (anioActual === maxDate.getFullYear() && mesActual === maxDate.getMonth());

    const diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate();
    const primerDiaDelMes = new Date(anioActual, mesActual, 1).getDay();

    const renderDias = () => {
        const dias = [];
        // Espacios vacíos antes del primer día del mes
        for (let i = 0; i < primerDiaDelMes; i++) {
            dias.push(<div key={`empty-${i}`} className="cal-day cal-day--empty"></div>);
        }

        for (let d = 1; d <= diasEnMes; d++) {
            const currentDate = new Date(anioActual, mesActual, d);
            currentDate.setHours(0,0,0,0);
            
            // Format YYYY-MM-DD for value
            const yyyy = currentDate.getFullYear();
            const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
            const dd = String(currentDate.getDate()).padStart(2, '0');
            const dateStr = `${yyyy}-${mm}-${dd}`;

            // Determinar si es un día que el tutor atiende
            const nombreDia = diasSemanales[currentDate.getDay()];
            const atiendeEseDia = tutor.diasDisponibles?.includes(nombreDia);
            
            const isPast = currentDate < hoy;
            const isTooFar = currentDate > maxDate;

            // Verificar si está totalmente ocupado (opcional - heurística rápida)
            const turnosEseDia = turnosTutor.filter(t => t.fecha === dateStr);
            // 12 horas (08:00 a 20:00) son 720 minutos. Sumamos duraciones:
            let minutosOcupados = 0;
            turnosEseDia.forEach(t => {
                const [hI, mI] = t.horaInicio.split(':').map(Number);
                const [hF, mF] = t.horaFin.split(':').map(Number);
                minutosOcupados += (hF * 60 + mF) - (hI * 60 + mI);
            });
            // Si está ocupado más de 11 horas de las 12 disponibles, consideramos "lleno"
            const isFullyBooked = minutosOcupados >= 660; 

            const isAvailable = atiendeEseDia && !isPast && !isTooFar && !isFullyBooked;
            const isSelected = selectedDate === dateStr;

            let dayClasses = "cal-day ";
            if (isSelected) {
                dayClasses += "cal-day--selected";
            } else if (isAvailable) {
                dayClasses += "cal-day--available";
            } else {
                dayClasses += "cal-day--disabled";
            }

            dias.push(
                <div
                    key={d}
                    className={dayClasses}
                    onClick={() => {
                        if (isAvailable) onDateSelect(dateStr);
                    }}
                >
                    {d}
                </div>
            );
        }
        return dias;
    };

    return (
        <div className="card shadow-sm mb-3">
            <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <button type="button" className="btn btn-sm btn-outline-secondary d-flex align-items-center" onClick={prevMonth} disabled={isPrevDisabled} aria-label="Mes anterior">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <h2 className="h6 fw-bold mb-0 text-capitalize">{meses[mesActual]} {anioActual}</h2>
                    <button type="button" className="btn btn-sm btn-outline-secondary d-flex align-items-center" onClick={nextMonth} disabled={isNextDisabled} aria-label="Mes siguiente">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>

                <div className="cal-grid mb-3">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                        <div key={day} className="cal-weekday">{day}</div>
                    ))}
                    {renderDias()}
                </div>

                <div className="cal-legend pt-2 mt-1 border-top">
                    <span className="d-flex align-items-center gap-2"><span className="cal-legend__dot" style={{ background: 'var(--ti-confirmed-bg)', border: '1px solid #b7f0d8' }}></span> Disponible</span>
                    <span className="d-flex align-items-center gap-2"><span className="cal-legend__dot" style={{ background: 'var(--ti-primary)' }}></span> Seleccionado</span>
                    <span className="d-flex align-items-center gap-2"><span className="cal-legend__dot" style={{ background: 'var(--ti-surface-low)', border: '1px solid var(--ti-border)' }}></span> No disponible</span>
                </div>
            </div>
        </div>
    );
}
