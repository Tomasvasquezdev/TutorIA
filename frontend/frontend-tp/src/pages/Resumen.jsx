// ── pages/Resumen.jsx ── Panel de resumen para administradores (P6) ──
//
// Esta página le corresponde al equipo de P6.
// Debe mostrar un dashboard (resumenAdim) con estadísticas generales de los turnos.
// Ruta en App.jsx: /resumen — protegida con <RutaProtegida rolesPermitidos={['admin']}>

import { useEffect, useState } from 'react';
import { getResumen } from '../api/turnos.api.js';   // ← función nueva que pega a /turnos/resumen
import ResumenAdmin from '../components/ResumenAdmin.jsx';

export default function Resumen() {
    // 3 estados: los datos del resumen, si está cargando, y un posible error.
    const [resumen, setResumen] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // useEffect con [] → se ejecuta UNA vez, al montar la pantalla.
    // Acá pedimos los datos al backend apenas se abre /resumen.
    useEffect(() => {
        let montado = true; // bandera para no actualizar el estado si el componente se desmontó

        const cargar = async () => {
            setCargando(true);
            setError(null);
            try {
                // Pedimos las métricas al backend (que las calcula con agregación).
                const datos = await getResumen();
                if (montado) setResumen(datos);
            } catch (fallo) {
                // Si el backend devuelve un error (ej. 403, 500), mostramos su mensaje.
                if (montado) {
                    setError(fallo.response?.data?.error || fallo.message || 'Error al cargar el resumen');
                }
            } finally {
                if (montado) setCargando(false);
            }
        };

        cargar();
        return () => { montado = false; }; // limpieza al desmontar
    }, []);

    return (
        <div>
            <div className="page-header">
                <h1 className="h3">Panel de Control Administrativo</h1>
                <p>Vista global de la actividad del sistema de tutorías.</p>
            </div>

            {/* ESTADO 1: cargando → spinner */}
            {cargando && (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <span className="ms-3 text-secondary">Cargando resumen...</span>
                </div>
            )}

            {/* ESTADO 2: error → alerta roja con el mensaje del backend */}
            {!cargando && error && (
                <div className="alert alert-danger">⚠️ {error}</div>
            )}

            {/* ESTADO 3: datos OK → se los pasamos al componente que los muestra */}
            {!cargando && !error && resumen && (
                <ResumenAdmin resumen={resumen} />
            )}
        </div>
    );
}
