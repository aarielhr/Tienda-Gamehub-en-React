import { Link } from 'react-router'
import { Vacio } from '../components/Estado.jsx'

// Ruta comodín (*): cualquier dirección que no existe en App.jsx llega aquí
export default function NoEncontrado() {
  return (
    <div className="contenedor py-5">
      <p className="texto-mono texto-secundario text-center mb-3" aria-hidden="true" style={{ fontSize: 56, lineHeight: 1 }}>
        404
      </p>
      <Vacio icono="buscar" titulo="No encontramos esta página" texto="La dirección no existe o el enlace cambió. Revisa la URL o vuelve a la tienda.">
        <div className="d-flex flex-wrap justify-content-center gap-2">
          <Link to="/" className="btn btn-primary">
            Volver al inicio
          </Link>
          <Link to="/catalogo" className="btn btn-outline-secondary">
            Ir al catálogo
          </Link>
        </div>
      </Vacio>
    </div>
  )
}
