// ── RutaProtegida.jsx ── Componente de guardia para rutas privadas ──
// Envuelve las rutas que requieren autenticación. Si no hay token,
// redirige al login. Si se especifican roles, verifica que el usuario
// tenga permiso antes de renderizar el contenido.

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export const RutaProtegida = ({ children, rolesPermitidos }) => {
    const { token, usuario, loading } = useContext(AuthContext);

    // Esperar a que el AuthProvider termine de leer localStorage
    if (loading) return <div>Cargando...</div>;

    // Sin token → redirigir al login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Si la ruta exige roles específicos y el usuario no los cumple → redirigir al inicio
    if (rolesPermitidos && !rolesPermitidos.includes(usuario?.rol)) {
        return <Navigate to="/" replace />;
    }

    // Autenticado y autorizado → renderizar el contenido protegido
    return children;
};