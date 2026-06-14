// ── pages/NotFound.jsx ── Página 404 para rutas no encontradas (P6) ──
//
// Esta página le corresponde al equipo de P6.
// Debe mostrar un mensaje amigable de "página no encontrada" con un link para volver al inicio.
// Se muestra cuando el usuario entra a una URL que no existe.
// La ruta comodín * del Router (en App.jsx) dirige acá.

import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="text-center py-5">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '64px' }}>
                travel_explore
            </span>
            <h1 className="display-2 fw-bold mt-3 mb-0">404</h1>
            <h2 className="h4 mb-3">Página no encontrada</h2>
            <p className="text-muted mb-4">
                La página que estás buscando no existe o fue movida.
            </p>
            <Link to="/" className="btn btn-primary">
                Volver al inicio
            </Link>
        </div>
    );
}
