import { useEffect } from 'react'
import { Link } from 'react-router'
import Icono from './Icono.jsx'

// Aviso flotante, por ejemplo "Agregado al carrito". Se cierra solo después de unos segundos.
export default function Notificacion({ aviso, alCerrar, duracion = 4000 }) {
  useEffect(() => {
    if (!aviso) return undefined
    const id = setTimeout(alCerrar, duracion)
    return () => clearTimeout(id)
  }, [aviso, alCerrar, duracion])

  if (!aviso) return null
  const ok = aviso.tipo !== 'error'
  return (
    <div className={`aviso ${ok ? 'aviso-ok' : 'aviso-error'} notificacion`} role="status" aria-live="polite">
      <Icono nombre={ok ? 'check' : 'alerta'} tamano={20} grosor={2.4} />
      <div className="d-flex flex-column gap-1 flex-grow-1">
        <p className="fw-semibold">{aviso.texto}</p>
        {aviso.enlace && (
          <Link to={aviso.enlace.a} className="small fw-semibold">
            {aviso.enlace.texto}
          </Link>
        )}
      </div>
      <button type="button" className="btn btn-link p-0" style={{ minHeight: 'auto' }} onClick={alCerrar} aria-label="Cerrar aviso">
        <Icono nombre="x" tamano={16} />
      </button>
    </div>
  )
}
