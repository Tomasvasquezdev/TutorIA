// ── validate.js ── Middleware de validación de entrada para turnos ──
// Verifica campos obligatorios (en POST) y formatos (fecha, hora, modalidad)
// antes de que la petición llegue al controlador.
// Si hay errores, responde 400 Bad Request sin tocar la base de datos.

export default function validate(req, res, next) {
    if ((req.method === 'POST' || req.method === 'PUT') && req.originalUrl.includes('/turnos')) {
        const isPost = req.method === 'POST';
        const { tutorId, fecha, horaInicio, horaFin, tema, modalidad } = req.body;

        // En POST todos los campos son obligatorios
        if (isPost) {
            if (!tutorId || !fecha || !horaInicio || !horaFin || !tema || !modalidad) {
                return res.status(400).json({ error: 'Faltan campos obligatorios para el turno' });
            }
        } else {
            // En PUT, al menos un campo debe venir para que tenga sentido la edición
            if (!tutorId && !fecha && !horaInicio && !horaFin && !tema && !modalidad && !req.body.observaciones) {
                return res.status(400).json({ error: 'Debe enviar al menos un campo a modificar' });
            }
        }

        // Validar SOLO el formato de fecha (YYYY-MM-DD).
        // La regla de negocio "la fecha no puede estar en el pasado" vive en el service
        // (turnos.service.js → validarDisponibilidad), como pide la cátedra.
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (fecha && !dateRegex.test(fecha)) {
            return res.status(400).json({ error: 'Formato de fecha inválido. Debe ser YYYY-MM-DD' });
        }

        // Validar formato de hora (HH:mm)
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (horaInicio && !timeRegex.test(horaInicio)) {
            return res.status(400).json({ error: 'Formato de horaInicio inválido. Debe ser HH:mm' });
        }
        if (horaFin && !timeRegex.test(horaFin)) {
            return res.status(400).json({ error: 'Formato de horaFin inválido. Debe ser HH:mm' });
        }

        // Validar valores permitidos de modalidad
        if (modalidad && !['presencial', 'virtual'].includes(modalidad)) {
            return res.status(400).json({ error: 'Modalidad inválida. Debe ser presencial o virtual' });
        }

        // Validar límite de caracteres en el tema
        if (tema && tema.length > 100) {
            return res.status(400).json({ error: 'El tema no puede exceder los 100 caracteres' });
        }
    }

    next();
}
