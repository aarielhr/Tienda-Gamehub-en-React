import { useState } from 'react'
import { MensajeError, Cargando } from '../Estado.jsx'
import Icono from '../Icono.jsx'
import { InsigniaEstado } from '../Insignia.jsx'
import { ESTADO_DESPACHO, ESTADO_PAGO, NOMBRE_METODO } from '../../logica/estados.js'
import { clp, fechaCorta, plural } from '../../logica/formato.js'

// Los mismos grupos que acepta GET /api/operador/ordenes?estado=
const FILTROS_ORDENES = [
  { id: 'TODAS', nombre: 'Todas', incluye: () => true },
  { id: 'PENDIENTE_PAGO', nombre: 'Pago pendiente', incluye: (o) => o.estado === 'PENDIENTE_PAGO' },
  { id: 'POR_DESPACHAR', nombre: 'Por despachar', incluye: (o) => o.estado === 'PAGADA' },
  { id: 'EN_CURSO', nombre: 'En curso', incluye: (o) => ['EN_PREPARACION', 'DESPACHADA', 'EN_TRANSITO'].includes(o.estado) },
  { id: 'ENTREGADAS', nombre: 'Entregadas', incluye: (o) => o.estado === 'ENTREGADA' },
  { id: 'CERRADAS', nombre: 'Rechazadas o anuladas', incluye: (o) => o.estado === 'RECHAZADA' || o.estado === 'ANULADA' },
]

function CeldaDespacho({ orden }) {
  if (orden.estadoDespacho) {
    return (
      <>
        <InsigniaEstado estado={ESTADO_DESPACHO[orden.estadoDespacho]} />
        {orden.seguimiento && <span className="d-block small texto-mono texto-secundario mt-1">{orden.seguimiento}</span>}
      </>
    )
  }
  if (orden.estadoPago === 'APROBADO') return <span className="small fw-semibold">Por generar</span>
  if (orden.estadoPago === 'PENDIENTE') return <span className="small texto-secundario">Sin despacho</span>
  return <span className="small texto-secundario">No aplica</span>
}

// Bandeja del operador: confirma o anula transferencias y abre el formulario de despacho.
// Las acciones que el backend rechazaría (despachar sin pago aprobado) se muestran deshabilitadas.
export default function BandejaOrdenes({ ordenes, onConfirmarPago, onAnularPago, onDespachar, ocupado }) {
  const [filtro, setFiltro] = useState('TODAS')
  const [anulando, setAnulando] = useState(null)

  const lista = ordenes.datos ?? []
  const visibles = lista.filter(FILTROS_ORDENES.find((f) => f.id === filtro).incluye)

  function acciones(o) {
    if (o.estadoPago === 'PENDIENTE') {
      if (anulando === o.id) {
        return (
          <div className="d-flex flex-wrap align-items-center gap-2" role="group" aria-label={`Confirmar anulación de ${o.numero}`}>
            <span className="small">¿Anular el pago?</span>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              disabled={ocupado}
              onClick={() => {
                setAnulando(null)
                onAnularPago(o)
              }}
            >
              Sí, anular
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setAnulando(null)}>
              No
            </button>
          </div>
        )
      }
      return (
        <div className="d-flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary btn-sm" disabled={ocupado} onClick={() => onConfirmarPago(o)}>
            <Icono nombre="check" tamano={16} />
            Confirmar pago
          </button>
          <button type="button" className="btn btn-outline-danger btn-sm" disabled={ocupado} onClick={() => setAnulando(o.id)}>
            Anular
          </button>
        </div>
      )
    }
    if (o.estadoPago === 'APROBADO' && !o.estadoDespacho) {
      return (
        <button type="button" className="btn btn-primary btn-sm" onClick={() => onDespachar(o.id)}>
          <Icono nombre="caja" tamano={16} />
          Generar despacho
        </button>
      )
    }
    if (o.estadoDespacho && o.estadoDespacho !== 'ENTREGADO') {
      return (
        <button type="button" className="btn btn-tonal btn-sm" onClick={() => onDespachar(o.id)}>
          <Icono nombre="camion" tamano={16} />
          Actualizar despacho
        </button>
      )
    }
    if (o.estadoDespacho === 'ENTREGADO') return <span className="small texto-secundario">Entregada</span>
    return (
      <div>
        <button type="button" className="btn btn-outline-secondary btn-sm" disabled aria-describedby={`sin-pago-${o.id}`}>
          Generar despacho
        </button>
        <span id={`sin-pago-${o.id}`} className="d-block small texto-secundario mt-1">
          El pago no fue aprobado
        </span>
      </div>
    )
  }

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex flex-wrap gap-2" role="group" aria-label="Filtrar órdenes">
        {FILTROS_ORDENES.map((f) => (
          <button key={f.id} type="button" className="chip" aria-pressed={filtro === f.id} onClick={() => setFiltro(f.id)}>
            {f.nombre}
            <span className="cuenta">{lista.filter(f.incluye).length}</span>
          </button>
        ))}
      </div>

      {ordenes.error && <MensajeError error={ordenes.error} alReintentar={ordenes.recargar} />}
      {ordenes.cargando && !ordenes.datos && <Cargando texto="Cargando órdenes…" />}

      {ordenes.datos && (
        <div className="tabla-contenedor">
          <table className="table align-middle mb-0">
            <caption className="visualmente-oculto">Órdenes de la tienda con su pago y su despacho</caption>
            <thead>
              <tr>
                <th scope="col">N° de orden</th>
                <th scope="col">Cliente</th>
                <th scope="col">Fecha</th>
                <th scope="col">Total</th>
                <th scope="col">Pago</th>
                <th scope="col">Despacho</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center texto-secundario py-4">
                    No hay órdenes con este filtro.
                  </td>
                </tr>
              )}
              {visibles.map((o) => (
                <tr key={o.id}>
                  <td className="texto-mono fw-semibold text-nowrap">{o.numero}</td>
                  <td>
                    {o.cliente}
                    <span className="d-block small texto-secundario">{plural(o.unidades, 'unidad', 'unidades')}</span>
                  </td>
                  <td className="texto-mono small text-nowrap">{fechaCorta(o.creadaEn)}</td>
                  <td className="fw-semibold text-nowrap">{clp(o.total)}</td>
                  <td>
                    <InsigniaEstado estado={ESTADO_PAGO[o.estadoPago]} />
                    <span className="d-block small texto-secundario mt-1">{NOMBRE_METODO[o.metodoPago]}</span>
                  </td>
                  <td>
                    <CeldaDespacho orden={o} />
                  </td>
                  <td>{acciones(o)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="small texto-secundario m-0 d-flex align-items-center gap-2">
        <Icono nombre="info" tamano={16} />
        No se despacha una orden sin pago aprobado: la interfaz deshabilita la acción y el backend la vuelve a validar (409).
      </p>
    </div>
  )
}
