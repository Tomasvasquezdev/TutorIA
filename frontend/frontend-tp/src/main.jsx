// ── main.jsx ── Punto de entrada del frontend ──
// Monta la aplicación React dentro del AuthProvider para que toda
// la app tenga acceso al contexto de autenticación.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'
import './index.css'
import './theme.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
