import { estadoStock } from '../logica/stock.js'
import Icono from './Icono.jsx'

// Cinco segmentos tipo LED más una frase: el color nunca es el único indicador
export default function IndicadorStock({ stock, className = '' }) {
  const estado = estadoStock(stock)
  const encendido = estado.tono === 'aviso' ? 'led-aviso' : 'led-ok'
  return (
    <span className={`stock stock-${estado.tono} ${className}`}>
      <span className="leds" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={i < estado.nivel ? encendido : ''} />
        ))}
      </span>
      <span className="d-inline-flex align-items-center gap-1">
        <Icono nombre={estado.icono} tamano={14} grosor={2.4} className={estado.tono === 'ok' ? 'text-success' : ''} />
        {estado.texto}
      </span>
    </span>
  )
}
