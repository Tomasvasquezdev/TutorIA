// ── App.jsx ── Componente raíz de la aplicación ──
// Define el enrutamiento principal y dos layouts:
//   • AuthLayout  → pantallas centradas sin sidebar (login / registro).
//   • MainLayout  → sidebar oscuro + área de contenido (resto de la app).

import './App.css';
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar.jsx';
import { RutaProtegida } from './components/RutaProtegida';

// Páginas
import Login from './pages/Login';
import Registro from './pages/Registro';
import TurnoForm from './pages/TurnoForm.jsx';
import TurnoDetalle from './pages/TurnoDetalle.jsx';
import Turnos from './pages/Turnos.jsx';
import Resumen from './pages/Resumen.jsx';
import NotFound from './pages/NotFound.jsx';

// Layout de la app autenticada: sidebar + contenido.
function MainLayout() {
    return (
        <div className="app-shell">
            <Sidebar />
            <main className="app-main">
                <Outlet />
            </main>
        </div>
    );
}

// Layout de pantallas transaccionales (login/registro): sin sidebar.
// Cada página usa su propio contenedor .auth-screen a pantalla completa.
function AuthLayout() {
    return <Outlet />;
}

// Página de inicio (hero público).
function Home() {
    return (
        <div className="app-hero p-4 p-md-5">
            <div className="py-5">
                <span className="app-hero__eyebrow">Tutorías académicas</span>
                <h1 className="display-4 mb-3">Aprendé con el <em>tutor indicado</em></h1>
                <p className="col-lg-7 fs-5 mb-4">
                    Solicitá, confirmá y hacé seguimiento de tus turnos de tutoría en un solo lugar:
                    simple, ordenado y a tu ritmo.
                </p>
                <div className="d-flex flex-wrap gap-3">
                    <Link to="/turnos" className="btn btn-light btn-lg px-4">Ver mis turnos</Link>
                    <Link to="/login" className="btn btn-outline-light btn-lg px-4">Iniciar sesión</Link>
                </div>
            </div>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Pantallas centradas sin sidebar */}
                    <Route element={<AuthLayout />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/registro" element={<Registro />} />
                    </Route>

                    {/* App con sidebar */}
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<Home />} />

                        <Route path="/turnos" element={
                            <RutaProtegida>
                                <Turnos />
                            </RutaProtegida>
                        } />

                        <Route path="/turnos/nuevo" element={
                            <RutaProtegida>
                                <TurnoForm />
                            </RutaProtegida>
                        } />

                        <Route path="/turnos/:id/editar" element={
                            <RutaProtegida>
                                <TurnoForm />
                            </RutaProtegida>
                        } />

                        <Route path="/turnos/:id" element={
                            <RutaProtegida>
                                <TurnoDetalle />
                            </RutaProtegida>
                        } />

                        <Route path="/resumen" element={
                            <RutaProtegida rolesPermitidos={['admin']}>
                                <Resumen />
                            </RutaProtegida>
                        } />

                        {/* 404 — ruta comodín */}
                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
