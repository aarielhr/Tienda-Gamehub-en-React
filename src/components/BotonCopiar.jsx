import { useEffect, useState } from 'react'
import Icono from './Icono.jsx'

// Copia un texto y muestra "¡Copiado!" por dos segundos. "copiar" se puede reemplazar en las pruebas.
export default function BotonCopiar({ texto, copiar = (t) => navigator.clipboard.writeText(t), duracion = 2000 }) {
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    if (!copiado) return undefined
    const id = setTimeout(() => setCopiado(false), duracion)
    return () => clearTimeout(id)
  }, [copiado, duracion])

  async function alHacerClic() {
    try {
      await copiar(texto)
      setCopiado(true)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <button type="button" className="btn btn-outline-secondary" onClick={alHacerClic} aria-live="polite">
      <Icono nombre={copiado ? 'check' : 'copiar'} tamano={18} />
      {copiado ? '¡Copiado!' : 'Copiar código'}
    </button>
  )
}
