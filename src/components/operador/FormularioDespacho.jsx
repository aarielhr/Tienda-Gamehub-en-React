import { useState } from 'react'
import { useCarga } from '../../hooks/useCarga.js'
import { ESTADO_DESPACHO, ESTADO_PAGO, pasosDespacho } from '../../logica/estados.js'
import { aFechaISO, plural } from '../../logica/formato.js'
import { validarDatosDespacho } from '../../logica/validaciones.js'
import { actualizarDespacho, generarDespacho, obtenerOrdenOperador } from '../../services/operador.js'
import Campo from '../Campo.jsx'
import { Cargando, MensajeError } from '../Estado.jsx'
import Icono from '../Icono.jsx'
import { InsigniaEstado } from '../Insignia.jsx'
import LineaTiempoDespacho from '../LineaTiempoDespacho.jsx'

// El despacho solo avanza: Preparando → Despachado → En tránsito → Entregado
const ORDEN_DESPACHO = ['PREPARANDO', 'DESPACHADO', 'EN_TRANSITO', 'ENTREGADO']

function Campos({ orden, onListo, onCerrar }) {
  const despacho = orden.despacho
  const generando = !despacho
  const siguientes = generando ? [] : ORDEN_DESPACHO.slice(ORDEN_DESPACHO.indexOf(despacho.estado) + 1)
  const [datos, setDatos] = useState({
    estado: siguientes[0] ?? '',
    seguimiento: despacho?.seguimiento ?? '',
    fechaEstimada: despacho?.fechaEstimada ?? '',
  })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  const errores = validarDatosDespacho(datos)
  const cambiar = (campo) => (valor) => setDatos((d) => ({ ...d, [campo]: valor }))
  const d = orden.despachoDatos
  const unidades = orden.lineas.reduce((total, l) => total + l.cantidad, 0)

  async function enviar(e) {
    e.preventDefault()
    if (Object.keys(errores).length > 0 || enviando) return
    setEnviando(true)
    setError(null)
    const cuerpo = { seguimiento: datos.seguimiento.trim() || null, fechaEstimada: datos.fechaEstimada || null }
    try {
      const actualizada = generando
        ? await generarDespacho(orden.id, cuerpo)
        : await actualizarDespacho(orden.id, { ...cuerpo, estado: datos.estado })
      onListo(actualizada, generando)
    } catch (err) {
      setError(err)
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="d-flex flex-column gap-3" aria-labelledby="titulo-despacho-form">
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-2">
        <div>
          <h3 id="titulo-despacho-form" className="h5 m-0">
            {generando ? 'Generar despacho' : 'Actualizar despacho'} · <span className="texto-mono">{orden.numero}</span>
          </h3>
          <p className="m-0 small texto-secundario">
            {orden.cliente} · {plural(unidades, 'unidad', 'unidades')} · {d.direccion}
            {d.depto && `, ${d.depto}`}, {d.comuna}
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <InsigniaEstado estado={ESTADO_PAGO[orden.pago.estado]} />
          {despacho && <InsigniaEstado estado={ESTADO_DESPACHO[despacho.estado]} />}
        </div>
      </div>

      {!generando && <LineaTiempoDespacho pasos={pasosDespacho(orden)} />}
      <MensajeError error={error} />

      <div className="row g-3">
        {!generando && (
          <Campo
            className="col-md-4"
            id="despacho-estado"
            como="select"
            etiqueta="Nuevo estado"
            requerido
            opciones={siguientes.map((s) => ({ valor: s, texto: ESTADO_DESPACHO[s].texto }))}
            valor={datos.estado}
            alCambiar={cambiar('estado')}
            ayuda="Solo se ofrecen estados posteriores al actual."
          />
        )}
        <Campo
          className={generando ? 'col-md-6' : 'col-md-4'}
          id="despacho-seguimiento"
          etiqueta="N° de seguimiento"
          opcional
          maxLength={30}
          valor={datos.seguimiento}
          alCambiar={cambiar('seguimiento')}
          error={errores.seguimiento}
          ayuda={generando ? 'Lo entrega el transportista. Si lo dejas vacío, se genera uno.' : 'Lo entrega el transportista al retirar el pedido.'}
        />
        <Campo
          className={generando ? 'col-md-6' : 'col-md-4'}
          id="despacho-fecha"
          tipo="date"
          etiqueta="Entrega estimada"
          opcional
          min={aFechaISO()}
          valor={datos.fechaEstimada}
          alCambiar={cambiar('fechaEstimada')}
          error={errores.fechaEstimada}
          ayuda={generando ? 'Si la dejas vacía, se estiman 3 días.' : undefined}
        />
      </div>
      <div className="d-flex flex-wrap gap-2">
        <button type="submit" className="btn btn-primary" disabled={enviando || Object.keys(errores).length > 0}>
          <Icono nombre={generando ? 'caja' : 'camion'} />
          {enviando ? 'Guardando…' : generando ? 'Generar despacho' : 'Guardar estado'}
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={onCerrar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

// Carga el detalle de la orden (dirección y estado del despacho) y luego muestra el formulario
export default function FormularioDespacho({ ordenId, onListo, onCerrar }) {
  const orden = useCarga(() => obtenerOrdenOperador(ordenId), [ordenId])
  if (orden.cargando) return <Cargando texto="Cargando la orden…" />
  if (orden.error) return <MensajeError error={orden.error} alReintentar={orden.recargar} />
  return <Campos orden={orden.datos} onListo={onListo} onCerrar={onCerrar} />
}
