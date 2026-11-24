import Icono from './Icono.jsx'

// Seguimiento del despacho en cinco pasos: hecho (verde), en curso (violeta) o pendiente
export default function LineaTiempoDespacho({ pasos }) {
  return (
    <ol className="linea-tiempo">
      {pasos.map((paso) => (
        <li key={paso.nombre} className={`paso paso-${paso.estado}`} aria-current={paso.estado === 'actual' ? 'step' : undefined}>
          <span className="paso-marca">
            <span className="paso-circulo" aria-hidden="true">
              {paso.estado === 'hecho' && <Icono nombre="check" tamano={13} grosor={3} />}
            </span>
            <span className="paso-linea" aria-hidden="true" />
          </span>
          <span className="paso-nombre">
            {paso.nombre}
            <span className="visualmente-oculto">
              {paso.estado === 'hecho' ? ' (listo)' : paso.estado === 'actual' ? ' (en curso)' : ' (pendiente)'}
            </span>
          </span>
          <span className="paso-fecha">{paso.detalle}</span>
        </li>
      ))}
    </ol>
  )
}
