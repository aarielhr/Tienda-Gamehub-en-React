import { Link } from 'react-router'
import { useAuth } from '../context/useAuth.js'
import Icono from './Icono.jsx'

// Aparece cuando el token venció o la API respondió 401: la sesión ya se cerró en todas las vistas
export default function AvisoSesion() {
  const { expirada, cerrarAviso } = useAuth()
  if (!expirada) return null
  return (
    <div className="contenedor pt-3">
      <div className="aviso aviso-alerta" role="alert">
        <Icono nombre="reloj" tamano={20} />
        <div className="flex-grow-1">
          <p className="fw-semibold">Tu sesión expiró</p>
          <p className="small">Vuelve a iniciar sesión para seguir. Tu carrito sigue guardado en este navegador.</p>
        </div>
        <Link to="/acceso" className="btn btn-outline-secondary" onClick={cerrarAviso}>
          Iniciar sesión
        </Link>
        <button type="button" className="btn btn-link p-0" style={{ minHeight: 'auto' }} onClick={cerrarAviso} aria-label="Cerrar aviso">
          <Icono nombre="x" tamano={16} />
        </button>
      </div>
    </div>
  )
}
