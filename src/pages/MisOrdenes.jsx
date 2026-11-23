import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Cargando, MensajeError, Vacio } from '../components/Estado.jsx'
import FormularioGarantia from '../components/FormularioGarantia.jsx'
import FormularioResena from '../components/FormularioResena.jsx'
import Icono from '../components/Icono.jsx'
import ImagenProducto from '../components/ImagenProducto.jsx'
import Insignia, { InsigniaEstado } from '../components/Insignia.jsx'
import LineaTiempoDespacho from '../components/LineaTiempoDespacho.jsx'
import Migas from '../components/Migas.jsx'
import { useCarga } from '../hooks/useCarga.js'
import { ESTADO_GARANTIA, ESTADO_ORDEN, ESTADO_PAGO, NOMBRE_METODO, pasosDespacho } from '../logica/estados.js'
import { clp, fecha, fechaHora, plural } from '../logica/formato.js'
import { crearResena, listarMisOrdenes, obtenerOrden, solicitarGarantia } from '../services/ordenes.js'

const EN_CURSO = ['PENDIENTE_PAGO', 'PAGADA', 'EN_PREPARACION', 'DESPACHADA', 'EN_TRANSITO']
const SIN_PAGO = ['RECHAZADA', 'ANULADA']

const FILTROS = [
  { id: 'TODAS', nombre: 'Todas', incluye: () => true },
  { id: 'EN_CURSO', nombre: 'En curso', incluye: (o) => EN_CURSO.includes(o.estado) },
  { id: 'ENTREGADAS', nombre: 'Entregadas', incluye: (o) => o.estado === 'ENTREGADA' },
  { id: 'SIN_PAGO', nombre: 'Rechazadas o anuladas', incluye: (o) => SIN_PAGO.includes(o.estado) },
]

// Acciones de cada producto comprado: una reseña por producto y por orden, y la garantía de 6 meses
function LineaComprada({ orden, linea, onActualizada }) {
  const [abierto, setAbierto] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState(null)
  const sinPago = SIN_PAGO.includes(orden.estado)
  const idBase = `linea-${orden.id}-${linea.productoId}`

  async function enviar(accion, datos) {
    setEnviando(true)
    setAviso(null)
    try {
      const base = { ordenId: orden.id, productoId: linea.productoId, ...datos }
      if (accion === 'resena') {
        await crearResena(base)
        setAviso({ tipo: 'ok', texto: 'Gracias. Tu reseña quedó en moderación: se publica cuando un administrador la apruebe.' })
      } else {
        const garantia = await solicitarGarantia(base)
        setAviso({ tipo: 'ok', texto: `Solicitud ${garantia.codigo} enviada. Verás aquí cuando el operador la revise.` })
      }
      setAbierto(null)
      onActualizada()
    } catch (e) {
      setAviso({ tipo: 'error', texto: e.message })
    } finally {
      setEnviando(false)
    }
  }

  const g = linea.garantia
  const plazoTexto = linea.plazoGarantia ? `garantía hasta ${fecha(linea.plazoGarantia)}` : 'garantía de 6 meses desde la entrega'

  return (
    <li className="d-flex flex-column gap-3 py-3 border-top">
      <div className="d-flex align-items-center gap-3">
        <span className="panel-imagen p-2" style={{ flex: '0 0 72px' }}>
          <ImagenProducto imagen={linea.imagen} alt="" />
        </span>
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <Link to={`/producto/${linea.productoId}`} className="fw-semibold">
            {linea.nombre}
          </Link>
          <p className="m-0 small texto-secundario">
            {linea.cantidad} × {clp(linea.precioUnitario)}
            {!sinPago && ` · ${plazoTexto}`}
          </p>
        </div>
        <span className="fw-semibold text-nowrap">{clp(linea.subtotal)}</span>
      </div>

      {!sinPago && (
        <div className="d-flex flex-wrap align-items-center gap-2">
          {linea.resenada ? (
            <Insignia tono="ok" icono="check">
              Reseña enviada
            </Insignia>
          ) : linea.puedeResenar ? (
            <button
              type="button"
              className="btn btn-tonal btn-sm"
              aria-expanded={abierto === 'resena'}
              onClick={() => setAbierto(abierto === 'resena' ? null : 'resena')}
            >
              <Icono nombre="mensaje" tamano={16} />
              Escribir reseña
            </button>
          ) : (
            <span className="small texto-secundario d-inline-flex align-items-center gap-1">
              <Icono nombre="reloj" tamano={14} />
              {linea.motivoSinResena ?? 'Reseña al recibir'}
            </span>
          )}

          {g && (
            <Insignia tono={ESTADO_GARANTIA[g.estado].tono} icono="escudo">
              Garantía {g.codigo} · {ESTADO_GARANTIA[g.estado].texto.toLowerCase()}
            </Insignia>
          )}
          {linea.puedeSolicitarGarantia ? (
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              aria-expanded={abierto === 'garantia'}
              onClick={() => setAbierto(abierto === 'garantia' ? null : 'garantia')}
            >
              <Icono nombre="escudo" tamano={16} />
              Solicitar garantía
            </button>
          ) : (
            !g &&
            orden.estado === 'ENTREGADA' && <span className="small texto-secundario">{linea.motivoSinGarantia}</span>
          )}
        </div>
      )}

      {abierto === 'resena' && (
        <FormularioResena
          id={idBase}
          producto={linea.nombre}
          enviando={enviando}
          onEnviar={(datos) => enviar('resena', datos)}
          onCancelar={() => setAbierto(null)}
        />
      )}
      {abierto === 'garantia' && (
        <FormularioGarantia
          id={idBase}
          producto={linea.nombre}
          plazo={linea.plazoGarantia}
          enviando={enviando}
          onEnviar={(datos) => enviar('garantia', datos)}
          onCancelar={() => setAbierto(null)}
        />
      )}
      {aviso && (
        <div className={`aviso ${aviso.tipo === 'ok' ? 'aviso-ok' : 'aviso-error'} small`} role={aviso.tipo === 'ok' ? 'status' : 'alert'}>
          <Icono nombre={aviso.tipo === 'ok' ? 'check' : 'alerta'} tamano={18} />
          <p>{aviso.texto}</p>
        </div>
      )}
    </li>
  )
}

function DetalleOrden({ orden, onActualizada }) {
  const d = orden.despachoDatos
  const unidades = orden.lineas.reduce((total, l) => total + l.cantidad, 0)
  const pago = orden.pago

  return (
    <article className="tarjeta p-4 d-flex flex-column gap-4" aria-labelledby="detalle-titulo">
      <header className="d-flex flex-wrap align-items-start justify-content-between gap-2">
        <div>
          <p className="eyebrow">Orden</p>
          <h2 id="detalle-titulo" className="h3 m-0 texto-mono" tabIndex={-1}>
            {orden.numero}
          </h2>
          <p className="m-0 small texto-secundario">
            Comprada el {fechaHora(orden.creadaEn)} · {plural(unidades, 'unidad', 'unidades')} · {clp(orden.total)}
          </p>
        </div>
        <InsigniaEstado estado={ESTADO_ORDEN[orden.estado]} />
      </header>

      <section aria-labelledby="seguimiento-orden">
        <div className="d-flex flex-wrap align-items-baseline justify-content-between gap-2 mb-3">
          <h3 id="seguimiento-orden" className="h5 m-0">
            Seguimiento del despacho
          </h3>
          {orden.despacho?.seguimiento && (
            <p className="m-0 small">
              <span className="texto-secundario">N° de seguimiento </span>
              <span className="texto-mono fw-semibold">{orden.despacho.seguimiento}</span>
            </p>
          )}
        </div>
        {pago.estado === 'RECHAZADO' || pago.estado === 'ANULADO' ? (
          <div className="aviso aviso-info small">
            <Icono nombre="info" tamano={18} />
            <p>
              Esta orden no tiene despacho porque el pago fue {pago.estado === 'RECHAZADO' ? 'rechazado' : 'anulado'}. No se realizó
              ningún cobro.
            </p>
          </div>
        ) : pago.estado === 'PENDIENTE' ? (
          <div className="aviso aviso-alerta small">
            <Icono nombre="reloj" tamano={18} />
            <p>El despacho se prepara cuando el operador confirme tu transferencia.</p>
          </div>
        ) : (
          <LineaTiempoDespacho pasos={pasosDespacho(orden)} />
        )}
      </section>

      <div className="row g-3">
        <section className="col-md-6" aria-labelledby="pago-orden">
          <div className="bloque-dato h-100 d-flex flex-column gap-2">
            <h3 id="pago-orden" className="h6 m-0">
              Pago
            </h3>
            <div>
              <InsigniaEstado estado={ESTADO_PAGO[pago.estado]} />
            </div>
            <p className="m-0 small texto-secundario">
              {NOMBRE_METODO[pago.metodo]}
              {pago.fecha && ` · ${fechaHora(pago.fecha)}`}
            </p>
            {pago.detalle && <p className="m-0 small texto-secundario">{pago.detalle}</p>}
          </div>
        </section>
        <section className="col-md-6" aria-labelledby="direccion-orden">
          <div className="bloque-dato h-100 d-flex flex-column gap-2">
            <h3 id="direccion-orden" className="h6 m-0">
              Dirección de despacho
            </h3>
            <p className="m-0 small">
              {d.nombre} · {d.telefono}
            </p>
            <p className="m-0 small texto-secundario">
              {d.direccion}
              {d.depto && `, ${d.depto}`} · {d.comuna}, {d.region}
            </p>
            {d.indicaciones && <p className="m-0 small texto-secundario">Indicaciones: {d.indicaciones}</p>}
          </div>
        </section>
      </div>

      <section aria-labelledby="productos-orden">
        <h3 id="productos-orden" className="h5 m-0">
          Productos comprados
        </h3>
        <p className="small texto-secundario mb-0 mt-1">Una reseña por producto y por orden · garantía de 6 meses desde la entrega</p>
        <ul className="list-unstyled m-0 mt-2">
          {orden.lineas.map((l) => (
            <LineaComprada key={l.productoId} orden={orden} linea={l} onActualizada={onActualizada} />
          ))}
        </ul>
        <dl className="m-0 pt-3 border-top d-flex flex-column gap-2">
          <div className="d-flex justify-content-between">
            <dt className="fw-normal texto-secundario">Subtotal</dt>
            <dd className="m-0">{clp(orden.subtotal)}</dd>
          </div>
          {orden.descuento > 0 && (
            <div className="d-flex justify-content-between">
              <dt className="fw-normal texto-secundario">Cupón {orden.cupon}</dt>
              <dd className="m-0 text-success fw-semibold">−{clp(orden.descuento)}</dd>
            </div>
          )}
          <div className="d-flex justify-content-between align-items-baseline">
            <dt>Total</dt>
            <dd className="m-0 precio" style={{ fontSize: 24 }}>
              {clp(orden.total)}
            </dd>
          </div>
        </dl>
      </section>
    </article>
  )
}

export default function MisOrdenes() {
  const ubicacion = useLocation()
  const ordenes = useCarga(() => listarMisOrdenes(), [])
  const [filtro, setFiltro] = useState('TODAS')
  const [elegida, setElegida] = useState(ubicacion.state?.seleccion ?? null)

  const lista = ordenes.datos ?? []
  const seleccion = elegida ?? lista[0]?.id ?? null
  const detalle = useCarga(() => (seleccion ? obtenerOrden(seleccion) : Promise.resolve(null)), [seleccion])

  const visibles = lista.filter(FILTROS.find((f) => f.id === filtro).incluye)
  const enCurso = lista.filter((o) => EN_CURSO.includes(o.estado)).length

  function elegir(id) {
    setElegida(id)
    // En teléfonos el detalle queda debajo de la lista: se lleva la vista hasta él
    if (window.matchMedia('(max-width: 991.98px)').matches) {
      document.getElementById('detalle-orden')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  function actualizar() {
    detalle.recargar()
    ordenes.recargar()
  }

  if (ordenes.cargando && !ordenes.datos) return <Cargando texto="Cargando tus órdenes…" />

  return (
    <div className="contenedor py-4">
      <Migas pasos={[{ texto: 'Inicio', a: '/' }, { texto: 'Mis órdenes' }]} />
      <div className="mt-2 mb-4">
        <h1 className="m-0" style={{ fontSize: 40 }}>
          Mis órdenes
        </h1>
        {lista.length > 0 && (
          <p className="m-0 texto-secundario">
            {plural(lista.length, 'orden', 'órdenes')} · {enCurso} en curso
          </p>
        )}
      </div>

      {ordenes.error && <MensajeError error={ordenes.error} alReintentar={ordenes.recargar} />}

      {!ordenes.error && lista.length === 0 && (
        <Vacio icono="caja" titulo="Todavía no tienes órdenes" texto="Cuando compres, aquí verás el pago, el despacho y podrás dejar reseñas.">
          <Link to="/catalogo" className="btn btn-primary">
            Ir al catálogo
          </Link>
        </Vacio>
      )}

      {lista.length > 0 && (
        <div className="row g-4 align-items-start">
          <section className="col-lg-4 d-flex flex-column gap-3" aria-label="Lista de órdenes">
            <div className="d-flex flex-wrap gap-2" role="group" aria-label="Filtrar órdenes">
              {FILTROS.map((f) => (
                <button key={f.id} type="button" className="chip" aria-pressed={filtro === f.id} onClick={() => setFiltro(f.id)}>
                  {f.nombre}
                  <span className="cuenta">{lista.filter(f.incluye).length}</span>
                </button>
              ))}
            </div>
            {visibles.length === 0 ? (
              <p className="texto-secundario m-0">No hay órdenes con este filtro.</p>
            ) : (
              <ul className="list-unstyled m-0 d-flex flex-column gap-2">
                {visibles.map((o) => (
                  <li key={o.id}>
                    <button type="button" className="item-orden" aria-current={o.id === seleccion ? 'true' : undefined} onClick={() => elegir(o.id)}>
                      <span className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                        <span className="texto-mono fw-semibold">{o.numero}</span>
                        <InsigniaEstado estado={ESTADO_ORDEN[o.estado]} />
                      </span>
                      <span className="d-flex justify-content-between gap-2 small">
                        <span className="texto-secundario">
                          {fecha(o.creadaEn)} · {plural(o.unidades, 'unidad', 'unidades')}
                        </span>
                        <span className="fw-semibold">{clp(o.total)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div id="detalle-orden" className="col-lg-8">
            {detalle.datos && detalle.datos.id === seleccion ? (
              <DetalleOrden key={detalle.datos.id} orden={detalle.datos} onActualizada={actualizar} />
            ) : detalle.error ? (
              <MensajeError error={detalle.error} alReintentar={detalle.recargar} />
            ) : (
              <Cargando texto="Cargando el detalle…" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
