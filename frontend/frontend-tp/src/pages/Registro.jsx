// ── pages/Registro.jsx ── Pantalla de registro de usuario ──
// Permite registrarse como estudiante o tutor. Si elige tutor,
// se muestran campos adicionales de especialidad y días disponibles.

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { registerAPI, getEspecialidadesAPI } from '../api/auth.api';
import Logo from '../components/Logo.jsx';

const DIAS_SEMANA = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

const Registro = () => {
  const navigate = useNavigate();
  const [errorAPI, setErrorAPI] = useState(null);
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [esTutor, setEsTutor] = useState(false);
  const [diasSeleccionados, setDiasSeleccionados] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);

  useEffect(() => {
    getEspecialidadesAPI()
      .then(data => setEspecialidades(data))
      .catch(err => console.error('Error cargando especialidades:', err));
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // eslint-disable-next-line
  const passwordActual = watch('password');

  const toggleDia = (dia) => {
    setDiasSeleccionados((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  const onSubmit = async (data) => {
    setErrorAPI(null);

    // Validación extra en frontend para campos de tutor
    if (esTutor) {
      if (!data.especialidad) {
        setErrorAPI('Debe seleccionar una especialidad');
        return;
      }
      if (diasSeleccionados.length === 0) {
        setErrorAPI('Debe seleccionar al menos un día disponible');
        return;
      }
    }

    setCargando(true);
    try {
      await registerAPI(
        data.nombre,
        data.email,
        data.password,
        esTutor,
        data.especialidad || '',
        diasSeleccionados
      );
      setExito(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      const mensaje = error.response?.data?.error || 'Error al registrar el usuario';
      setErrorAPI(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="text-center mb-4">
          <div className="auth-logo-box">
            <Logo size={40} />
          </div>
          <h1 className="h3 mb-1">Creá tu cuenta</h1>
          <p className="text-muted mb-0" style={{ fontSize: '.95rem' }}>
            Registrate en TutorIA para solicitar o brindar tutorías.
          </p>
        </div>

        {errorAPI && (
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <span className="material-symbols-outlined me-2">error</span>
            <div>{errorAPI}</div>
          </div>
        )}

        {exito && (
          <div className="alert alert-success d-flex align-items-center" role="alert">
            <span className="material-symbols-outlined me-2">check_circle</span>
            <div>¡Registro exitoso! Redirigiendo...</div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* CAMPO NOMBRE */}
          <div className="mb-3">
            <label className="form-label">Nombre y Apellido</label>
            <input
              type="text"
              className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
              placeholder="Juan Pérez"
              {...register('nombre', { required: 'El nombre es obligatorio' })}
            />
            {errors.nombre && <div className="invalid-feedback">{errors.nombre.message}</div>}
          </div>

          {/* CAMPO EMAIL */}
          <div className="mb-3">
            <label className="form-label">Email institucional</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="usuario@alumnos.frc.utn.edu.ar"
              {...register('email', { 
                required: 'El correo electrónico es obligatorio',
                pattern: { value: /^\S+@\S+$/i, message: 'Formato de correo inválido' }
              })}
            />
            {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
          </div>

          {/* CAMPO CONTRASEÑA */}
          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Mínimo 6 caracteres"
              {...register('password', { 
                required: 'La contraseña es obligatoria',
                minLength: { value: 6, message: 'Debe tener al menos 6 caracteres' }
              })}
            />
            {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
          </div>

          {/* CONFIRMAR CONTRASEÑA */}
          <div className="mb-3">
            <label className="form-label">Confirmar Contraseña</label>
            <input
              type="password"
              className={`form-control ${errors.confirmarPassword ? 'is-invalid' : ''}`}
              placeholder="Repetí tu contraseña"
              {...register('confirmarPassword', { 
                required: 'Debe confirmar la contraseña',
                validate: value => value === passwordActual || 'Las contraseñas no coinciden'
              })}
            />
            {errors.confirmarPassword && <div className="invalid-feedback">{errors.confirmarPassword.message}</div>}
          </div>

          {/* ── TOGGLE TUTOR ── */}
          <div className="mb-3">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="toggleTutor"
                checked={esTutor}
                onChange={(e) => setEsTutor(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="toggleTutor">
                ¿Sos tutor?
              </label>
            </div>
            <small className="text-muted">
              {esTutor
                ? 'Te registrarás como tutor y podrás recibir turnos de estudiantes.'
                : 'Te registrarás como estudiante y podrás solicitar turnos.'}
            </small>
          </div>

          {/* ── CAMPOS CONDICIONALES DE TUTOR ── */}
          {esTutor && (
            <div className="border rounded p-3 mb-3 bg-light">
              <h6 className="mb-3">📚 Datos de Tutor</h6>

              {/* ESPECIALIDAD */}
              <div className="mb-3">
                <label className="form-label">Especialidad</label>
                <select
                  className={`form-select ${errors.especialidad ? 'is-invalid' : ''}`}
                  {...register('especialidad', {
                    validate: (value) => !esTutor || (value && value !== '') || 'La especialidad es obligatoria'
                  })}
                >
                  <option value="">Seleccioná una especialidad...</option>
                  {especialidades.map((esp) => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
                {errors.especialidad && <div className="invalid-feedback">{errors.especialidad.message}</div>}
              </div>

              {/* DÍAS DISPONIBLES */}
              <div className="mb-2">
                <label className="form-label">Días disponibles</label>
                <div className="d-flex flex-wrap gap-2">
                  {DIAS_SEMANA.map((dia) => (
                    <button
                      key={dia}
                      type="button"
                      className={`btn btn-sm ${
                        diasSeleccionados.includes(dia) ? 'btn-primary' : 'btn-outline-secondary'
                      }`}
                      onClick={() => toggleDia(dia)}
                    >
                      {dia.charAt(0).toUpperCase() + dia.slice(1)}
                    </button>
                  ))}
                </div>
                {diasSeleccionados.length === 0 && (
                  <small className="text-danger mt-1 d-block">
                    Seleccioná al menos un día
                  </small>
                )}
              </div>
            </div>
          )}

          {/* BOTÓN DE ENVIAR */}
          <button 
            type="submit" 
            disabled={cargando || exito}
            className="btn btn-primary w-100 py-2 d-flex justify-content-center align-items-center"
          >
            {cargando ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Registrando...
              </>
            ) : esTutor ? 'Registrarse como Tutor' : 'Registrarse'}
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-top">
          <p className="mb-0 text-muted" style={{ fontSize: '.9rem' }}>
            ¿Ya tenés cuenta? <Link to="/login" className="fw-semibold text-decoration-none">Iniciá sesión acá</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registro;
