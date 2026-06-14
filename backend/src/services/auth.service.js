// ── auth.service.js ── Lógica de negocio para registro e inicio de sesión ──
// Encapsula la creación de usuarios, la verificación de credenciales
// y la firma de tokens JWT. Los controladores delegan toda la lógica aquí.

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Usuario, Tutor } from '../models/index.js';

// En un entorno real, esta clave solo debería vivir en un archivo .env que no se sube al repositorio.
const SECRET_KEY = process.env.JWT_SECRET;

/**
 * Registra un nuevo usuario. Por defecto es "estudiante".
 * Si esTutor es true, crea el usuario con rol "tutor" y además genera
 * el perfil de Tutor asociado con especialidad y días disponibles.
 * - Verifica que el email no esté duplicado.
 * - La encriptación de la contraseña ocurre en el hook beforeCreate del modelo.
 * - Devuelve un JWT firmado junto con los datos públicos del usuario.
 */
async function registrar({ nombre, email, password, esTutor, especialidad, diasDisponibles }) {
    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
        const error = new Error('El email ya está registrado');
        error.status = 400;
        throw error;
    }

    // Validaciones adicionales si se registra como tutor
    if (esTutor) {
        if (!especialidad || especialidad.trim() === '') {
            const error = new Error('La especialidad es obligatoria para tutores');
            error.status = 400;
            throw error;
        }
        if (!diasDisponibles || !Array.isArray(diasDisponibles) || diasDisponibles.length === 0) {
            const error = new Error('Debe seleccionar al menos un día disponible');
            error.status = 400;
            throw error;
        }
    }

    const rol = esTutor ? 'tutor' : 'estudiante';

    const nuevoUsuario = await Usuario.create({
        nombre,
        email,
        passwordHash: password, // El hook beforeCreate lo hashea automáticamente
        rol,
        activo: true
    });

    // Si es tutor, crear también el perfil de Tutor vinculado al usuario
    if (esTutor) {
        await Tutor.create({
            usuarioId: nuevoUsuario.id,
            nombre: nuevoUsuario.nombre,
            email: nuevoUsuario.email,
            especialidad: especialidad.trim(),
            diasDisponibles,
            activo: true
        });
    }

    const token = jwt.sign(
        { id: nuevoUsuario.id, rol: nuevoUsuario.rol },
        SECRET_KEY,
        { expiresIn: '2h' }
    );

    return {
        token,
        usuario: {
            id: nuevoUsuario.id,
            nombre: nuevoUsuario.nombre,
            email: nuevoUsuario.email,
            rol: nuevoUsuario.rol
        }
    };
}

/**
 * Valida credenciales y genera un nuevo JWT si son correctas.
 * - Busca al usuario por email.
 * - Compara la contraseña en texto plano contra el hash almacenado con bcrypt.
 * - Nunca revela si el error fue por email inexistente o contraseña incorrecta
 *   (mensaje genérico por seguridad).
 */
async function login({ email, password }) {
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario || !usuario.activo) {
        const error = new Error('Credenciales inválidas o usuario inactivo');
        error.status = 401;
        throw error;
    }

    const coinciden = await bcrypt.compare(password, usuario.passwordHash);
    if (!coinciden) {
        const error = new Error('Credenciales inválidas');
        error.status = 401;
        throw error;
    }

    const token = jwt.sign(
        { id: usuario.id, rol: usuario.rol },
        SECRET_KEY,
        { expiresIn: '2h' }
    );

    return {
        token,
        usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
        }
    };
}

export default { registrar, login };
