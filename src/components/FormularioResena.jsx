import { useState } from 'react'
import { validarResena } from '../logica/validaciones.js'
import Campo from './Campo.jsx'
import Icono from './Icono.jsx'

const NOMBRES = ['Sin elegir', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente']

// Reseña de un producto ya entregado: de 1 a 5 estrellas y un comentario de 10 a 500 caracteres.
// La reseña queda en moderación hasta que un administrador la apruebe.
export default function FormularioResena({ id, producto, enviando = false, onEnviar, onCancelar }) {
  const [datos, setDatos] = useState({ puntuacion: 0, comentario: '' })
  const [intentado, setIntentado] = useState(false)

  const errores = validarResena(datos)
  const largo = datos.comentario.trim().length

  function enviar(e) {
    e.preventDefault()
    setIntentado(true)
    if (Object.keys(errores).length > 0 || enviando) return
    onEnviar({ puntuacion: datos.puntuacion, comentario: datos.comentario.trim() })
  }

  return (
    <form onSubmit={enviar} noValidate className="formulario-linea" aria-label={`Reseña de ${producto}`}>
      <p className="fw-semibold m-0">Reseña · {producto}</p>
      <fieldset>
        <legend className="form-label">
          Puntuación
          <span className="text-danger ms-1" aria-hidden="true">
            *
          </span>
        </legend>
        <div className="selector-estrellas d-flex flex-wrap align-items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={n <= datos.puntuacion ? 'encendida' : ''}
              aria-pressed={n === datos.puntuacion}
              aria-label={`${n} de 5 estrellas`}
              onClick={() => setDatos((d) => ({ ...d, puntuacion: n }))}
            >
              <Icono nombre="estrella" tamano={24} />
            </button>
          ))}
          <span className="small texto-secundario ms-2" aria-live="polite">
            {NOMBRES[datos.puntuacion]}
          </span>
        </div>
        {intentado && errores.puntuacion && (
          <p className="mensaje mensaje-error">
            <Icono nombre="alerta" tamano={15} grosor={2.2} />
            {errores.puntuacion}
          </p>
        )}
      </fieldset>
      <Campo
        id={`${id}-comentario`}
        como="textarea"
        etiqueta="Tu comentario"
        requerido
        maxLength={500}
        valor={datos.comentario}
        alCambiar={(v) => setDatos((d) => ({ ...d, comentario: v }))}
        error={intentado ? errores.comentario : ''}
        ayuda={`${largo}/500 caracteres. No incluyas teléfonos ni correos: la reseña es pública.`}
      />
      <div className="d-flex flex-wrap gap-2">
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Enviar reseña'}
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
