import { clp } from '../logica/formato.js'

// Precio vigente en verde cuando hay oferta, con el precio normal tachado al lado
export default function Precio({ precio, precioNormal, tamano = 22, className = '' }) {
  const oferta = precioNormal > precio
  return (
    <p className={`m-0 d-flex flex-wrap align-items-baseline gap-2 ${className}`}>
      <span className={`precio ${oferta ? 'precio-oferta' : ''}`} style={{ fontSize: tamano }}>
        {clp(precio)}
      </span>
      {oferta && (
        <span className="precio-antes">
          <span className="visualmente-oculto">Precio normal: </span>
          {clp(precioNormal)}
        </span>
      )}
    </p>
  )
}
