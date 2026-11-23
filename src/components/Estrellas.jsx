import Icono from './Icono.jsx'

export default function Estrellas({ valor, tamano = 14 }) {
  const llenas = Math.round(valor)
  return (
    <span className="estrellas" role="img" aria-label={`${String(valor).replace('.', ',')} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icono key={i} nombre="estrella" tamano={tamano} className={i <= llenas ? '' : 'apagada'} />
      ))}
    </span>
  )
}
