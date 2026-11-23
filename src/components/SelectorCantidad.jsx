import { useState } from 'react'
import Icono from './Icono.jsx'

// Selector − n +. El padre valida cada número contra el stock y decide si lo acepta;
// mientras se escribe, el campo muestra el texto tal cual y al salir vuelve al valor aceptado.
export default function SelectorCantidad({ id, valor, max, onCambiar, invalido = false, describedBy, nombre = 'producto' }) {
  const [texto, setTexto] = useState(String(valor))
  const [valorAnterior, setValorAnterior] = useState(valor)

  // Si el padre cambia el valor (botones − y +), el campo vuelve a mostrarlo. Se ajusta durante el
  // render, como recomienda React, en vez de usar un efecto que provocaría un segundo render.
  if (valor !== valorAnterior) {
    setValorAnterior(valor)
    setTexto(String(valor))
  }

  function escribir(e) {
    const nuevo = e.target.value
    setTexto(nuevo)
    if (nuevo !== '') onCambiar(Number(nuevo))
  }

  const alTope = valor >= max
  return (
    <div className={`cantidad ${invalido ? 'invalida' : alTope ? 'al-tope' : ''}`}>
      <button type="button" aria-label={`Quitar una unidad de ${nombre}`} onClick={() => onCambiar(valor - 1)} disabled={valor <= 1}>
        <Icono nombre="menos" />
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min="1"
        max={max}
        step="1"
        value={texto}
        onChange={escribir}
        onBlur={() => setTexto(String(valor))}
        aria-invalid={invalido ? 'true' : undefined}
        aria-describedby={describedBy}
      />
      <button type="button" aria-label={`Agregar una unidad de ${nombre}`} onClick={() => onCambiar(valor + 1)} disabled={alTope}>
        <Icono nombre="mas" />
      </button>
    </div>
  )
}
