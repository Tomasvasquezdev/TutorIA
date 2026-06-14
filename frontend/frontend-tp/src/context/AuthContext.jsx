// ── AuthContext.jsx ── Contexto global de autenticación ──
// Provee token, datos del usuario, estado de carga y funciones de login/logout
// a toda la aplicación. Persiste la sesión en localStorage para que sobreviva
// a recargas de página.

import { createContext, useState, useEffect } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Inicializar estado desde localStorage (si existe una sesión previa)
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [usuario, setUsuario] = useState(() => {
        const savedUser = localStorage.getItem('usuario');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(true);

    // Sincronizar cambios de token con localStorage
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
        }
        // eslint-disable-next-line
        setLoading(false);
    }, [token]);

    // Guardar sesión tras un login exitoso (recibe { token, usuario } del backend)
    const loginGlobal = (data) => {
        setToken(data.token);
        setUsuario(data.usuario);
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
    };

    // Limpiar sesión completamente
    const logoutGlobal = () => {
        setToken(null);
        setUsuario(null);
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
    };

    return (
        <AuthContext.Provider value={{ token, usuario, loading, loginGlobal, logoutGlobal }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};