// ── TurnoForm.jsx ── Formulario de alta y edición de turnos ──
// Si la URL tiene un :id, opera en modo edición; si no, en modo creación.
// Carga los tutores activos al montar y envía los datos al backend
// usando las funciones de turnos.api.js.

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { getTutores } from '../api/tutores.api.js';
import { crearTurno, editarTurno, getTurno } from '../api/turnos.api.js';
import CalendarioDisponibilidad from '../components/CalendarioDisponibilidad.jsx';
import SelectorBloquesHorarios from '../components/SelectorBloquesHorarios.jsx';

export default function TurnoForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdicion = Boolean(id);

    const [tutores, setTutores] = useState([]);
    const [apiError, setApiError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [turnoEstado, setTurnoEstado] = useState(null); // Para deshabilitar campos en turnos realizados

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            tutorId: '',
            fecha: '',
            horaInicio: '',
            horaFin: '',
            tema: '',
            modalidad: 'presencial',
            observaciones: ''
        }
    });

    const tutorId = watch('tutorId');
    const fechaSeleccionada = watch('fecha');
    
    const selectedTutorObj = tutores.find(t => String(t.id) === String(tutorId));

    // Si el turno está realizado, solo se pueden editar las observaciones
    const esRealizado = turnoEstado === 'realizado';

    // Cargar tutores activos para el <select> al montar el componente
    useEffect(() => {
        getTutores()
            .then(data => setTutores(data))
            .catch(err => setApiError('Error al cargar tutores: ' + (err.response?.data?.error || err.message)));

        // En modo edición, cargar los datos existentes del turno para precargar el formulario
        if (isEdicion) {
            getTurno(id)
                .then(turno => {
                    setTurnoEstado(turno.estado);
                    reset({
                        tutorId: turno.tutorId || turno.Tutor?.id || '',
                        fecha: turno.fecha || '',
                        horaInicio: turno.horaInicio || '',
                        horaFin: turno.horaFin || '',
                        tema: turno.tema || '',
                        modalidad: turno.modalidad || 'presencial',
                        observaciones: turno.observaciones || ''
                    });
                })
                .catch(err => setApiError('Error al cargar el turno: ' + (err.response?.data?.error || err.message)));
        }
    }, [id, isEdicion, reset]);

    const onSubmit = async (data) => {
        setApiError(null);
        setIsSubmitting(true);

        let payload;
        
        if (esRealizado) {
            // Si el turno está realizado, el backend SOLO permite enviar observaciones
            payload = { observaciones: data.observaciones };
        } else {
            // Si no está realizado, mandamos todo (y casteamos el tutorId a número)
            payload = {
                ...data,
                tutorId: Number(data.tutorId)
            };
        }

        try {
            if (isEdicion) {
                await editarTurno(id, payload);
                alert('¡Turno editado con éxito!');
            } else {
                await crearTurno(payload);
                alert('¡Turno solicitado con éxito!');
            }
            navigate('/turnos');
        } catch (error) {
            const msg = error.response?.data?.error || error.message || 'Error inesperado';
            setApiError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="row justify-content-center">
            <div className="col-12 col-xl-11">
                <div className="page-header">
                    <h1 className="h3">{isEdicion ? 'Editar Turno' : 'Solicitar Nuevo Turno'}</h1>
                    <p>Completá los datos de la sesión de tutoría.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row g-4">

                        {/* ── Columna izquierda: datos de la solicitud ── */}
                        <div className="col-12 col-lg-5">
                            <div className="card shadow-sm h-100">
                                <div className="card-body p-4 d-flex flex-column">
                                    <h2 className="h6 fw-bold text-secondary border-bottom pb-2 mb-3 d-flex align-items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">edit_note</span>
                                        Datos de la solicitud
                                    </h2>

                                    {/* Selector de tutor */}
                                    <div className="mb-3">
                                        <label className="form-label">Tutor asignado</label>
                                        <select
                                            className={`form-select ${errors.tutorId ? 'is-invalid' : ''}`}
                                            disabled={esRealizado}
                                            {...register('tutorId', { required: 'Debe seleccionar un tutor' })}
                                        >
                                            <option value="">-- Seleccione un tutor --</option>
                                            {tutores.map(t => (
                                                <option key={t.id} value={t.id}>{t.nombre} ({t.especialidad})</option>
                                            ))}
                                        </select>
                                        {errors.tutorId && <div className="invalid-feedback">{errors.tutorId.message}</div>}
                                    </div>

                                    {/* Tema */}
                                    <div className="mb-3">
                                        <label className="form-label">Tema de la tutoría</label>
                                        <input
                                            type="text"
                                            maxLength="100"
                                            className={`form-control ${errors.tema ? 'is-invalid' : ''}`}
                                            placeholder="Ej. Dudas sobre Middlewares"
                                            disabled={esRealizado}
                                            {...register('tema', {
                                                required: 'El tema es obligatorio',
                                                maxLength: { value: 100, message: 'El tema no puede exceder los 100 caracteres' }
                                            })}
                                        />
                                        {errors.tema && <div className="invalid-feedback">{errors.tema.message}</div>}
                                    </div>

                                    {/* Modalidad */}
                                    <div className="mb-3">
                                        <label className="form-label">Modalidad</label>
                                        <select
                                            className={`form-select ${errors.modalidad ? 'is-invalid' : ''}`}
                                            disabled={esRealizado}
                                            {...register('modalidad', { required: 'Requerido' })}
                                        >
                                            <option value="presencial">Presencial</option>
                                            <option value="virtual">Virtual</option>
                                        </select>
                                        {errors.modalidad && <div className="invalid-feedback">{errors.modalidad.message}</div>}
                                    </div>

                                    {/* Observaciones */}
                                    <div className="mb-3">
                                        <label className="form-label">Observaciones (opcional)</label>
                                        <textarea
                                            className="form-control"
                                            {...register('observaciones')}
                                            rows="3"
                                        ></textarea>
                                    </div>

                                    {/* Error de la API */}
                                    {apiError && (
                                        <div className="alert alert-danger" role="alert">
                                            <strong>Error:</strong> {apiError}
                                        </div>
                                    )}

                                    {/* Botón de envío */}
                                    <div className="d-grid mt-auto">
                                        <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
                                            {isSubmitting ? 'Procesando...' : (isEdicion ? 'Actualizar Turno' : 'Confirmar Solicitud')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Columna derecha: fecha y horario ── */}
                        <div className="col-12 col-lg-7">
                            {esRealizado ? (
                                <div className="card shadow-sm h-100">
                                    <div className="card-body p-4">
                                        <h2 className="h6 fw-bold text-secondary border-bottom pb-2 mb-3 d-flex align-items-center gap-2">
                                            <span className="material-symbols-outlined text-primary">event_available</span>
                                            Fecha y horario
                                        </h2>
                                        <div className="alert alert-secondary mb-0">
                                            El turno ya fue realizado en la fecha {watch('fecha')}. Solo podés editar las observaciones.
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <CalendarioDisponibilidad
                                        tutor={selectedTutorObj}
                                        selectedDate={fechaSeleccionada}
                                        onDateSelect={(dateStr) => {
                                            // eslint-disable-next-line
                                            reset({ ...watch(), fecha: dateStr, horaInicio: '', horaFin: '' });
                                        }}
                                    />
                                    <input type="hidden" {...register('fecha', { required: 'La fecha es obligatoria' })} />
                                    {errors.fecha && <div className="text-danger small mt-1 mb-3">{errors.fecha.message}</div>}

                                    {fechaSeleccionada && (
                                        <>
                                            <SelectorBloquesHorarios
                                                tutor={selectedTutorObj}
                                                fecha={fechaSeleccionada}
                                                onRangoSelect={(hInicio, hFin) => {
                                                    reset({ ...watch(), horaInicio: hInicio || '', horaFin: hFin || '' });
                                                }}
                                            />
                                            <input type="hidden" {...register('horaInicio', { required: 'Debe seleccionar un horario' })} />
                                            <input type="hidden" {...register('horaFin', { required: 'Debe seleccionar un horario' })} />
                                            {(errors.horaInicio || errors.horaFin) && (
                                                <div className="text-danger small mt-1">Por favor, seleccione un bloque horario válido.</div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
