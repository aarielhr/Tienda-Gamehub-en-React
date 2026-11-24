import Icono from './Icono.jsx'

// Insignia de estado. tono: ok, aviso, error, info o neutro. Siempre lleva icono y texto.
export default function Insignia({ tono = 'neutro', icono, children, className = '' }) {
  return (
    <span className={`insignia insignia-${tono} ${className}`}>
      {icono && <Icono nombre={icono} tamano={13} grosor={2.4} />}
      {children}
    </span>
  )
}

// Atajo para los estados que vienen de logica/estados.js: { texto, tono, icono }
export function InsigniaEstado({ estado, className }) {
  if (!estado) return null
  return (
    <Insignia tono={estado.tono} icono={estado.icono} className={className}>
      {estado.texto}
    </Insignia>
  )
}
