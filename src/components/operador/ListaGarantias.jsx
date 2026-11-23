import { useState } from 'react'
import { ESTADO_GARANTIA, MOTIVOS_GARANTIA } from '../../logica/estados.js'
import { fecha } from '../../logica/formato.js'
import { validarResolucion } from '../../logica/validaciones.js'
import { resolverGarantia } from '../../services/operador.js'
import Campo from '../Campo.jsx'
import { Cargando, MensajeError } from '../Estado.jsx'
import Icono from '../Icono.jsx'
import { InsigniaEstado } from '../Insignia.jsx'

const NOMBRE_MOTIVO = Object.fromEntries(MOTIVOS_GARANTIA.map((m) => [m.id, m.nombre.toLowerCase()]))
const CERRADAS = ['RESUELTA', 'RECHAZADA']

const FILTROS = [
  { id: 'ABIERTAS', nombre: 'Sin cerrar', incluye: (g) => !CERRADAS.includes(g.estado) },
  { id: 'CERRADAS', nombre: 'Cerradas', incluye: (g) => CERRADAS.includes(g.estado) },
  { id: 'TODAS', nombre: 'Todas', incluye: () => true },
]

function Garantia({ garantia, onResuelta }) {
  const [resolucion, setResolucion] = useState(garantia.resolucion ?? '')
  const [intento, setIntento] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const cerrada = CERRADAS.includes(garantia.estado)
  const errorResolucion = intento ? validarResolucion(intento, resolucion) : ''

  async function cambiar(estado) {
    setIntento(estado)
    if (validarResolucion(estado, resolucion)) return
    setEnviando(true)
    setError(null)
    try {
      const actualizada = await resolverGarantia(garantia.id, { estado, resolucion: resolucion.trim() || null })
      onResuelta(actualizada)
    } catch (err) {
      setError(err)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <li className="tarjeta p-4 d-flex flex-column gap-3">
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-2">
        <div>
          <h4 className="h6 m-0">
            <span className="texto-mono">{garantia.codigo}</span> · {garantia.producto}
          </h4>
          <p className="m-0 small texto-secundario">
            {garantia.cliente} · orden <span className="texto-mono">{garantia.ordenNumero}</span> · {NOMBRE_MOTIVO[garantia.motivo]} · plazo
            hasta {fecha(garantia.plazo)}
          </p>
        </div>
        <InsigniaEstado estado={ESTADO_GARANTIA[garantia.estado]} />
      </div>
      <blockquote className="m-0 ps-3 border-start small" style={{ borderColor: 'var(--color-borde-control)' }}>
        «{garantia.descripcion}»
      </blockquote>

      {cerrada ? (
        <p className="m-0 small">
          <span className="texto-secundario">Resolución ({fecha(garantia.actualizadaEn)}): </span>
          {garantia.resolucion}
        </p>
      ) : (
        <>
          <MensajeError error={error} />
          <Campo
            id={`resolucion-${garantia.id}`}
            como="textarea"
            etiqueta="Resolución"
            maxLength={600}
            valor={resolucion}
            alCambiar={(v) => {
              setResolucion(v)
              setIntento(null)
            }}
            error={errorResolucion}
            ayuda="Obligatoria para cerrar: qué se hizo (cambio, reparación, devolución o por qué se rechaza)."
          />
          <div className="d-flex flex-wrap gap-2">
            {garantia.estado === 'ABIERTA' && (
              <button type="button" className="btn btn-outline-secondary btn-sm" disabled={enviando} onClick={() => cambiar('EN_REVISION')}>
                <Icono nombre="reloj" tamano={16} />
                Pasar a revisión
              </button>
            )}
            <button type="button" className="btn btn-primary btn-sm" disabled={enviando} onClick={() => cambiar('RESUELTA')}>
              <Icono nombre="check" tamano={16} />
              Cerrar como resuelta
            </button>
            <button type="button" className="btn btn-outline-danger btn-sm" disabled={enviando} onClick={() => cambiar('RECHAZADA')}>
              Rechazar
            </button>
          </div>
        </>
      )}
    </li>
  )
}

// Solicitudes de garantía: primero las que siguen abiertas. Ninguna se cierra sin escribir la resolución.
export default function ListaGarantias({ garantias, onResuelta }) {
  const [filtro, setFiltro] = useState('ABIERTAS')
  const lista = garantias.datos ?? []
  const visibles = lista.filter(FILTROS.find((f) => f.id === filtro).incluye)

  if (garantias.cargando && !garantias.datos) return <Cargando texto="Cargando garantías…" />
  if (garantias.error) return <MensajeError error={garantias.error} alReintentar={garantias.recargar} />

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex flex-wrap gap-2" role="group" aria-label="Filtrar garantías">
        {FILTROS.map((f) => (
          <button key={f.id} type="button" className="chip" aria-pressed={filtro === f.id} onClick={() => setFiltro(f.id)}>
            {f.nombre}
            <span className="cuenta">{lista.filter(f.incluye).length}</span>
          </button>
        ))}
      </div>
      {visibles.length === 0 ? (
        <p className="texto-secundario m-0">No hay solicitudes con este filtro.</p>
      ) : (
        <ul className="list-unstyled m-0 d-flex flex-column gap-3">
          {visibles.map((g) => (
            <Garantia key={g.id} garantia={g} onResuelta={onResuelta} />
          ))}
        </ul>
      )}
    </div>
  )
}
