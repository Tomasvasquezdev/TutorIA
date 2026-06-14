// ── Sidebar.jsx ── Barra lateral de navegación (TutorIA) ──
// Reemplaza al Navbar superior por un sidebar azul oscuro (design system Stitch).
// Muestra links según el ROL del usuario y el estado de sesión, reutilizando
// la misma lógica de permisos que tenía el Navbar.
// Usa NavLink para resaltar el link activo y un toggle propio para mobile.

import { useContext, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';

// Iniciales del usuario para el avatar (placeholder).
const iniciales = (nombre = '') =>
    nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'U';

export default function Sidebar() {
    const { token, usuario, logoutGlobal } = useContext(AuthContext);
    const navigate = useNavigate();
    const [abierto, setAbierto] = useState(false); // drawer en mobile

    const cerrar = () => setAbierto(false);

    const handleLogout = () => {
        logoutGlobal();
        cerrar();
        navigate('/login');
    };

    const esEstudianteOAdmin = usuario?.rol === 'estudiante' || usuario?.rol === 'admin';

    return (
        <>
            {/* Barra superior solo visible en mobile */}
            <div className="app-topbar d-lg-none">
                <button className="app-topbar__btn" onClick={() => setAbierto(true)} aria-label="Abrir menú">
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <Link to="/" className="app-sidebar__brand p-0" onClick={cerrar}>
                    <Logo size={24} /> TutorIA
                </Link>
            </div>

            {/* Fondo oscuro al abrir el drawer en mobile */}
            <div className={`app-sidebar__backdrop ${abierto ? 'is-open' : ''}`} onClick={cerrar}></div>

            <aside className={`app-sidebar ${abierto ? 'is-open' : ''}`}>
                <Link to="/" className="app-sidebar__brand" onClick={cerrar}>
                    <Logo size={28} />
                    TutorIA
                </Link>

                {/* Usuario arriba, bajo la marca (como en el mock) */}
                {token && usuario && (
                    <div className="app-sidebar__user app-sidebar__user--top">
                        <div className="app-sidebar__avatar">{iniciales(usuario.nombre)}</div>
                        <div className="text-truncate">
                            <div className="fw-semibold text-truncate" style={{ fontSize: '.9rem' }}>{usuario.nombre}</div>
                            <div className="text-capitalize" style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.6)' }}>{usuario.rol}</div>
                        </div>
                    </div>
                )}

                <nav className="app-sidebar__nav">
                    <NavLink to="/" end className="app-sidebar__link" onClick={cerrar}>
                        <span className="material-symbols-outlined">home</span> Inicio
                    </NavLink>

                    {token && (
                        <>
                            <NavLink to="/turnos" className="app-sidebar__link" onClick={cerrar}>
                                <span className="material-symbols-outlined">calendar_month</span> Turnos
                            </NavLink>

                            {/* "Nuevo Turno": solo estudiante o admin (el tutor no crea turnos). */}
                            {esEstudianteOAdmin && (
                                <NavLink to="/turnos/nuevo" className="app-sidebar__link" onClick={cerrar}>
                                    <span className="material-symbols-outlined">add_circle</span> Nuevo Turno
                                </NavLink>
                            )}

                            {/* Resumen: SOLO admin. */}
                            {usuario?.rol === 'admin' && (
                                <NavLink to="/resumen" className="app-sidebar__link" onClick={cerrar}>
                                    <span className="material-symbols-outlined">monitoring</span> Resumen
                                </NavLink>
                            )}
                        </>
                    )}
                </nav>

                <div className="app-sidebar__footer">
                    {token && usuario ? (
                        <button className="app-sidebar__logout" onClick={handleLogout}>
                            <span className="material-symbols-outlined">logout</span> Cerrar Sesión
                        </button>
                    ) : (
                        <div className="d-grid gap-2">
                            <Link to="/login" className="btn btn-light btn-sm" onClick={cerrar}>Iniciar Sesión</Link>
                            <Link to="/registro" className="btn btn-outline-light btn-sm" onClick={cerrar}>Registrarse</Link>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
