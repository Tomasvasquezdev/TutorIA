// ── Login.jsx ── Pantalla de inicio de sesión ──
// Formulario con validación client-side (react-hook-form).
// Al enviar, llama a loginAPI() y guarda la sesión en el AuthContext.

import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { loginAPI } from '../api/auth.api';
import { AuthContext } from '../context/AuthContext';
import Logo from '../components/Logo.jsx';

const Login = () => {
  const { loginGlobal } = useContext(AuthContext);
  const navigate = useNavigate();
  const [errorAPI, setErrorAPI] = useState(null);
  const [cargando, setCargando] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setErrorAPI(null);
    setCargando(true);
    try {
      const respuesta = await loginAPI(data.email, data.password);
      loginGlobal(respuesta);
      navigate('/turnos');
    } catch (error) {
      const mensaje = error.response?.data?.error || 'Error al conectar con el servidor';
      setErrorAPI(mensaje);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card" style={{ maxWidth: '420px' }}>
        {/* Encabezado con logo */}
        <div className="text-center mb-4">
          <div className="auth-logo-box">
            <Logo size={40} />
          </div>
          <h1 className="h3 mb-1">Bienvenido de nuevo</h1>
          <p className="text-muted mb-0" style={{ fontSize: '.95rem' }}>
            Iniciá sesión en tu cuenta de TutorIA para gestionar tus tutorías.
          </p>
        </div>

        {errorAPI && (
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <span className="material-symbols-outlined me-2">error</span>
            <div>{errorAPI}</div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* CAMPO EMAIL */}
          <div className="mb-3">
            <label className="form-label">Correo Electrónico</label>
            <div className="input-icon">
              <span className="material-symbols-outlined">mail</span>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="tu@correo.edu"
                {...register('email', {
                  required: 'El correo electrónico es obligatorio',
                  pattern: { value: /^\S+@\S+$/i, message: 'Formato de correo inválido' }
                })}
              />
            </div>
            {errors.email && <div className="text-danger small mt-1">{errors.email.message}</div>}
          </div>

          {/* CAMPO CONTRASEÑA */}
          <div className="mb-4">
            <label className="form-label">Contraseña</label>
            <div className="input-icon">
              <span className="material-symbols-outlined">lock</span>
              <input
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="••••••••"
                {...register('password', { required: 'La contraseña es obligatoria' })}
              />
            </div>
            {errors.password && <div className="text-danger small mt-1">{errors.password.message}</div>}
          </div>

          {/* BOTÓN DE ACCIÓN */}
          <button
            type="submit"
            disabled={cargando}
            className="btn btn-primary w-100 py-2 d-flex justify-content-center align-items-center"
          >
            {cargando ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Ingresando...
              </>
            ) : 'Ingresar a mi cuenta'}
          </button>
        </form>

        <div className="text-center mt-4 pt-3 border-top">
          <p className="mb-0 text-muted" style={{ fontSize: '.9rem' }}>
            ¿No tenés cuenta? <Link to="/registro" className="fw-semibold text-decoration-none">Registrate acá</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;