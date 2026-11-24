import { useState } from 'react'
import { MOTIVOS_GARANTIA } from '../logica/estados.js'
import { fecha } from '../logica/formato.js'
import { validarGarantia } from '../logica/validaciones.js'
import Campo from './Campo.jsx'
import Icono from './Icono.jsx'

const OPCIONES = [{ valor: '', texto: 'Elige un motivo' }, ...MOTIVOS_GARANTIA.map((m) => ({ valor: m.id, texto: m.nombre }))]

// Solicitud de garantía dentro de los 6 meses desde la entrega: un motivo y al menos 20 caracteres
export default function FormularioGarantia({ id, producto, plazo, enviando = false, onEnviar, onCancelar }) {
  const [datos, setDatos] = useState({ motivo: '', descripcion: '' })
  const [tocados, setTocados] = useState({})

  const errores = validarGarantia(datos)
  const mostrar = (campo) => (tocados[campo] ? errores[campo] : '')
  const largo = datos.descripcion.trim().length

  function enviar(e) {
    e.preventDefault()
    setTocados({ motivo: true, descripcion: true })
    if (Object.keys(errores).length > 0 || enviando) return
    onEnviar({ motivo: datos.motivo, descripcion: datos.descripcion.trim() })
  }

  return (
    <form onSubmit={enviar} noValidate className="formulario-linea" aria-label={`Garantía de ${producto}`}>
      <p className="fw-semibold m-0">Solicitud de garantía · {producto}</p>
      <div className="row g-3">
        <Campo
          className="col-md-6"
          id={`${id}-motivo`}
          como="select"
          etiqueta="Motivo"
          requerido
          opciones={OPCIONES}
          valor={datos.motivo}
          alCambiar={(v) => {
            setDatos((d) => ({ ...d, motivo: v }))
            setTocados((t) => ({ ...t, motivo: true }))
          }}
          error={mostrar('motivo')}
        />
        <div className="col-md-6">
          <p className="form-label">Plazo de garantía</p>
          <p className="m-0 d-flex align-items-center gap-2">
            <Icono nombre="check" tamano={16} className="text-success" />
            Dentro del plazo · hasta {fecha(plazo)}
          </p>
        </div>
        <Campo
          className="col-12"
          id={`${id}-descripcion`}
          como="textarea"
          etiqueta="Describe el problema"
          requerido
          maxLength={600}
          valor={datos.descripcion}
          alCambiar={(v) => setDatos((d) => ({ ...d, descripcion: v }))}
          onBlur={() => setTocados((t) => ({ ...t, descripcion: true }))}
          error={mostrar('descripcion')}
          ayuda={`${largo} caracteres (mínimo 20). Cuéntanos qué pasa y desde cuándo.`}
        />
      </div>
      <div className="d-flex flex-wrap gap-2">
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Enviar solicitud'}
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
