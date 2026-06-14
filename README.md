# TutorIA — Sistema de Gestión de Turnos de Tutorías

Aplicación **full stack** para la gestión de tutorías académicas, desarrollada como TP previo al
Parcial 2 de Desarrollo de Software (DDS) — Curso 3K7, 2026.

El sistema permite que **estudiantes** soliciten turnos, que **tutores** administren su agenda
(confirmar / realizar) y que **administradores** supervisen disponibilidad, estados, conflictos y
métricas. Resuelve el flujo completo de reserva → confirmación → seguimiento, con reglas de horario,
control de superposición y permisos reales.

- **Backend:** Node.js + Express + Sequelize (SQLite).
- **Frontend:** React + Vite + React Router + Axios + React Hook Form + Bootstrap.
- **Auth:** JWT + bcrypt.
- **Testing:** Jest + Supertest.

---

## 📑 Índice

- [Requisitos previos](#-requisitos-previos)
- [Cómo ejecutar el proyecto](#-cómo-ejecutar-el-proyecto)
- [Usuarios de prueba](#-usuarios-de-prueba)
- [Endpoints principales (API)](#-endpoints-principales-api)
- [Rutas del frontend](#-rutas-del-frontend)
- [Reglas de disponibilidad y superposición](#-reglas-de-disponibilidad-y-superposición)
- [JWT, roles y permisos](#-jwt-roles-y-permisos)
- [Cómo ejecutar las pruebas](#-cómo-ejecutar-las-pruebas)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Decisiones de diseño](#-decisiones-de-diseño)
- [Limitaciones conocidas](#-limitaciones-conocidas)
- [Nota sobre el archivo `.env`](#-nota-sobre-el-archivo-env)

---

## ✅ Requisitos previos

- **Node.js 18+** (recomendado 20+) y **npm**.
- No hace falta instalar ninguna base de datos: se usa **SQLite** (archivo local), que se genera solo.

---

## 🚀 Cómo ejecutar el proyecto

El repo tiene dos proyectos independientes: `backend/` y `frontend/frontend-tp/`. Hay que levantar
ambos (en dos terminales).

### 1) Backend (API en `http://localhost:3000`)

```bash
cd backend
npm install
npm run seed     # crea la base SQLite y la puebla con datos de prueba (5 tutores, 3 estudiantes, 1 admin, 12 turnos)
npm start        # levanta la API en http://localhost:3000
```

> Para desarrollo con recarga automática podés usar `npm run dev` en lugar de `npm start`.
> El archivo `.env` ya viene incluido en el repo (ver [nota más abajo](#-nota-sobre-el-archivo-env)),
> así que el backend arranca sin configuración manual.

### 2) Frontend (app en `http://localhost:5173`)

```bash
cd frontend/frontend-tp
npm install
npm run dev      # levanta la app en http://localhost:5173
```

Abrí el navegador en **http://localhost:5173** e iniciá sesión con alguno de los
[usuarios de prueba](#-usuarios-de-prueba).

> El frontend apunta por defecto a `http://localhost:3000/api`. Si cambiás el puerto del backend,
> podés sobreescribir la URL con la variable de entorno `VITE_API_URL` (ver `axiosInstance.js`).

---

## 👤 Usuarios de prueba

Todos se crean al correr `npm run seed`. Las contraseñas se guardan **hasheadas con bcrypt**; abajo
figuran en texto plano solo para poder probar.

| Rol | Email | Contraseña | Notas |
|-----|-------|-----------|-------|
| **Admin** | `admin@dds.com` | `admin123` | Acceso total + panel de resumen |
| **Estudiante** | `lucas@dds.com` | `estudiante123` | Tiene turnos asignados |
| **Estudiante** | `sofia@dds.com` | `estudiante123` | |
| **Estudiante** | `mateo@dds.com` | `estudiante123` | |
| **Tutor** | `marina@dds.com` | `tutor123` | Backend — atiende lunes y miércoles |
| **Tutor** | `juan@dds.com` | `tutor123` | Frontend — atiende martes y jueves |
| **Tutor** | `carlos@dds.com` | `tutor123` | Testing — atiende miércoles y viernes |
| **Tutor** | `ana@dds.com` | `tutor123` | Seguridad — **inactiva** (caso trampa: no debe aceptar turnos) |
| **Tutor** | `luis@dds.com` | `tutor123` | Backend — sin turnos (útil para probar altas) |

> El registro/login es **real desde el frontend**: también podés crear una cuenta nueva (estudiante o
> tutor) desde la pantalla de registro.

---

## 🔌 Endpoints principales (API)

Prefijo base: `/api`. Todas las rutas de turnos requieren JWT (header `Authorization: Bearer <token>`).

### Autenticación (público)
| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Registro de usuario (estudiante por defecto; tutor si `esTutor: true`). Devuelve token. |
| `POST` | `/api/auth/login` | Login. Devuelve `{ token, usuario }` si las credenciales son válidas (401 si no). |

### Tutores
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/tutores` | Lista de tutores **activos** (para el selector del formulario). |
| `GET` | `/api/tutores/especialidades` | Lista de especialidades permitidas. |

### Turnos
| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| `GET` | `/api/turnos?fecha=&estado=&tutorId=&especialidad=&page=&limit=&sortBy=&order=` | Listado con filtros, paginación y orden (resueltos en backend). Visibilidad por rol. | Autenticado |
| `GET` | `/api/turnos/resumen` | Métricas del panel administrativo. | **Solo admin** |
| `GET` | `/api/turnos/:id` | Detalle de un turno (404 si no existe). | Dueño / tutor asignado / admin |
| `GET` | `/api/turnos/:id/historial` | Historial de auditoría del turno. | Dueño / tutor asignado / admin |
| `POST` | `/api/turnos` | Alta de turno (estado inicial `solicitado`; `estudianteId` sale del token). | Estudiante / admin |
| `PUT` | `/api/turnos/:id` | Edición (revalida disponibilidad; `realizado` solo permite editar observaciones). | Dueño / admin |
| `PATCH` | `/api/turnos/:id/cancelar` | Pasa a `cancelado`. | Dueño / admin |
| `PATCH` | `/api/turnos/:id/confirmar` | Pasa a `confirmado`. | Tutor asignado / admin |
| `PATCH` | `/api/turnos/:id/realizar` | Pasa a `realizado`. | Tutor asignado / admin |

**Formato de errores:** todas las respuestas de error tienen la forma `{ "error": "mensaje" }` con un
status HTTP coherente (`400`, `401`, `403`, `404`, `500`).

---

## 🖥️ Rutas del frontend

| Ruta | Pantalla | Protección |
|------|----------|-----------|
| `/` | Inicio (hero público) | Pública |
| `/login` | Inicio de sesión | Pública |
| `/registro` | Registro (estudiante o tutor) | Pública |
| `/turnos` | Listado con filtros, paginación y orden | Autenticado |
| `/turnos/nuevo` | Alta de turno | Autenticado |
| `/turnos/:id` | Detalle del turno + historial (usa `useParams`) | Autenticado |
| `/turnos/:id/editar` | Edición de turno | Autenticado |
| `/resumen` | Panel administrativo | **Solo admin** |
| `*` | Página 404 (ruta comodín) | Pública |

---

## 📅 Reglas de disponibilidad y superposición

La regla central del dominio (validada **en el servicio del backend**, `turnos.service.js`, tanto al
**crear** como al **editar/reasignar**) es que un turno solo es válido si el tutor:

1. **Existe** (si no → `404 "El tutor no existe"`).
2. **Está activo** (si no → `400 "El tutor no está activo"`).
3. **Atiende ese día**: el día de la semana de la `fecha` solicitada debe estar dentro de su
   `diasDisponibles` (si no → `400 "El tutor no atiende ese día"`).
4. **No tiene superposición**: no debe existir otro turno **`solicitado` o `confirmado`** del mismo
   tutor y fecha cuya franja se solape (si no → `400 "El tutor no está disponible en esa franja horaria"`).

Además, `horaInicio` debe ser **menor** que `horaFin`.

**Cálculo de superposición:** dos franjas `[inicioA, finA)` y `[inicioB, finB)` se solapan si
`inicioA < finB && finA > inicioB`. Esto implementa el criterio del enunciado: **si un turno termina a
las 11:00 y otro empieza a las 11:00, NO se consideran superpuestos** (límite exacto permitido).

**En edición/reasignación** se revalida la disponibilidad **ignorando el propio turno** (se excluye su
`id` de la comparación) para no chocar consigo mismo.

> Los **mensajes de error son distintos** para cada caso (tutor inexistente, inactivo, día no
> disponible, superposición y falta de permisos), tal como pide el enunciado.

---

## 🔐 JWT, roles y permisos

### Autenticación (JWT)
- Al hacer login/registro, el backend firma un **JWT** con payload **`{ id, rol }`** — sin
  contraseñas ni datos sensibles — y expiración de 2 horas.
- El frontend guarda el token y los datos del usuario en `localStorage` (vía `AuthContext`), por lo
  que la **sesión persiste** entre recargas.
- En cada request protegida, Axios adjunta automáticamente el header `Authorization: Bearer <token>`
  mediante un **interceptor** (`axiosInstance.js`). Las contraseñas se almacenan **hasheadas con bcrypt**
  y nunca se devuelve el `passwordHash` en las respuestas.

### Middlewares de seguridad (backend)
- `auth`: verifica el JWT. **`401`** si no hay token o es inválido/expirado.
- `authorize`: valida **rol** y, cuando corresponde, **propiedad del recurso** (estudiante dueño /
  tutor asignado / admin). **`403`** si está autenticado pero sin permiso. No alcanza con que el JWT exista.

### Roles
| Rol | Puede |
|-----|-------|
| **estudiante** | Crear turnos, ver **sus** turnos, editar y **cancelar** sus turnos `solicitado`/`confirmado`. |
| **tutor** | Ver sus turnos asignados, **confirmar** y **marcar como realizado**. |
| **admin** | Ver **todos** los turnos, reasignar/editar, confirmar, cancelar, realizar cualquiera y ver el **resumen**. |

> La protección es **real en frontend y backend**: el frontend oculta/redirige según rol
> (`RutaProtegida`, sidebar condicional), pero la verdad la impone el backend con `auth` + `authorize`.

---

## 🧪 Cómo ejecutar las pruebas

Pruebas de **backend** con Jest + Supertest (base de datos SQLite **en memoria**, aislada del entorno
de desarrollo):

```bash
cd backend
npm test
```

Cubre los 10 casos exigidos por el enunciado (y algunos extra), verificando **status HTTP y cuerpo JSON**:

1. Login correcto e inválido.
2. Listado de turnos con y sin filtros.
3. Detalle de turno existente e inexistente (404).
4. Creación válida de un turno.
5. Creación inválida por horario inconsistente (`horaInicio >= horaFin`).
6. Creación inválida por superposición del tutor.
7. Acceso sin JWT a una ruta protegida (401).
8. Acceso con JWT de estudiante a una acción solo de admin (403).
9. Edición inválida que reasigna a un tutor ocupado.
10. Creación inválida por día no disponible para el tutor.

> El frontend incluye además tests opcionales con Vitest (`cd frontend/frontend-tp && npm test`).

---

## 🗂️ Estructura del proyecto

```
tp-dds-p2/
├── backend/
│   ├── src/
│   │   ├── app.js                # Configuración de Express (CORS, JSON, rutas, errorHandler)
│   │   ├── server.js             # Punto de entrada (sync + listen)
│   │   ├── controllers/          # auth, turnos, tutores
│   │   ├── services/             # Reglas de negocio (auth.service, turnos.service)
│   │   ├── routes/               # express.Router() por recurso
│   │   ├── middlewares/          # auth, authorize, validate, errorHandler
│   │   ├── models/               # Sequelize: Usuario, Tutor, Turno, HistorialTurno + asociaciones
│   │   ├── data/db.js            # Conexión SQLite
│   │   └── seed/seed.js          # Datos semilla
│   ├── tests/                    # Jest + Supertest
│   └── .env                      # Variables de entorno (ver nota)
└── frontend/frontend-tp/
    └── src/
        ├── api/                  # Capa Axios (axiosInstance + un archivo por recurso)
        ├── context/              # AuthContext (sesión persistente)
        ├── components/           # Filtros, TablaTurnos, AccionesTurno, Historial, ResumenAdmin, etc.
        ├── pages/                # Login, Registro, Turnos, TurnoDetalle, TurnoForm, Resumen, NotFound
        └── App.jsx               # Router principal
```

**Persistencia:** se eligió **SQLite + Sequelize** por simplicidad de despliegue (no requiere instalar
un motor externo) y por conservar los datos al reiniciar el backend. La base se regenera con
`npm run seed`. **Reglas de negocio** centralizadas en los *services*; **Axios** aislado en la capa
`api/`; **errores** manejados de forma centralizada (`errorHandler`).

---

## 🧩 Decisiones de diseño

- **Reglas de horario adicionales (extensión propia, no exigida por el enunciado):** además de las
  reglas obligatorias, el service rechaza turnos con duración **mayor a 2 horas**, fuera del horario de
  atención **08:00–20:00** y con **fecha en el pasado**. Se documentan acá por transparencia; viven en
  `turnos.service.js → validarDisponibilidad` y pueden ajustarse ahí.
- **Cancelación:** siguiendo el enunciado, el **tutor no cancela** (solo confirma/realiza); cancelan el
  estudiante dueño y el admin.
- **Rate limiting en login:** se agregó un límite de intentos por IP (`express-rate-limit`) como medida
  anti fuerza bruta. No es requisito del TP.

---

## ⚠️ Limitaciones conocidas

- Las contraseñas de los usuarios semilla figuran en este README en texto plano **solo para facilitar
  la corrección**; en la base se guardan hasheadas con bcrypt.
- El listado aplica una **paginación por defecto** de 10 elementos por página.
- No hay refresh token: el JWT expira a las 2 horas y se requiere volver a iniciar sesión.

---

## 🔑 Nota sobre el archivo `.env`

El archivo `backend/.env` (con `PORT` y `JWT_SECRET`) **está incluido en el repositorio de forma
deliberada**, con el único fin de que la cátedra pueda **clonar, ejecutar y corregir el proyecto sin
ninguna configuración manual**.

Somos conscientes de que, como buena práctica de seguridad, **un archivo `.env` no debería versionarse
nunca** —ya que suele contener credenciales y secretos— y normalmente se excluye con `.gitignore` y se
distribuye un `.env.example` en su lugar. Tomamos esta decisión exclusivamente por tratarse de un
trabajo práctico académico con un secreto de uso interno, priorizando la facilidad de evaluación. En un
entorno real, el `.env` se mantendría fuera del control de versiones.
