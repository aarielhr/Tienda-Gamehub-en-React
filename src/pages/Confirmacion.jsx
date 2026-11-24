import { Link, useLocation, useParams } from 'react-router'
import { Cargando, MensajeError } from '../components/Estado.jsx'
import Icono from '../components/Icono.jsx'
import ImagenProducto from '../components/ImagenProducto.jsx'
import { InsigniaEstado } from '../components/Insignia.jsx'
import LineaTiempoDespacho from '../components/LineaTiempoDespacho.jsx'
import { useCarga } from '../hooks/useCarga.js'
import { ESTADO_PAGO, NOMBRE_METODO, pasosDespacho } from '../logica/estados.js'
import { clp, fechaHora } from '../logica/formato.js'
import { obtenerOrden } from '../services/ordenes.js'

const VARIANTES = {
  APROBADO: {
    icono: 'check',
    clase: 'insignia-ok',
    titulo: 'Tu compra está confirmada',
    texto: 'El pago quedó aprobado. Te avisaremos cuando el operador despache tu pedido; puedes seguirlo desde Mis órdenes.',
  },
  PENDIENTE: {
    icono: 'reloj',
    clase: 'insignia-aviso',
    titulo: 'Tu orden quedó registrada',
    texto: 'La transferencia queda pendiente hasta que el operador la confirme. Recién entonces se reserva el stock y se prepara el despacho.',
  },
  RECHAZADO: {
    icono: 'x',
    clase: 'insignia-error',
    titulo: 'No pudimos procesar el pago',
    texto: 'No se hizo ningún cobro ni se generó despacho. Tu carrito sigue guardado: puedes elegir otro método de pago.',
  },
  ANULADO: {
    icono: 'x',
    clase: 'insignia-neutro',
    titulo: 'La orden fue anulada',
    texto: 'El pago se anuló y la orden no avanzará.',
  },
}

export default function Confirmacion() {
  const { id } = useParams()
  const ubicacion = useLocation()
  const previa = ubicacion.state?.orden
  const orden = useCarga(() => (previa && String(previa.id) === id ? Promise.resolve(previa) : obtenerOrden(id)), [id])

  if (orden.cargando) return <Cargando texto="Cargando tu orden…" />
  if (orden.error) {
    return (
      <div className="contenedor py-5">
        <MensajeError error={orden.error} alReintentar={orden.recargar} />
      </div>
    )
  }

  const o = orden.datos
  const variante = VARIANTES[o.pago.estado] ?? VARIANTES.PENDIENTE
  const aprobado = o.pago.estado === 'APROBADO'

  return (
    <div className="contenedor py-5">
      <div className="mx-auto d-flex flex-column gap-4" style={{ maxWidth: 880 }}>
        <section className="tarjeta p-4 p-md-5 d-flex flex-column align-items-center text-center gap-3" aria-labelledby="estado-titulo">
          <span className={`insignia ${variante.clase} justify-content-center`} style={{ width: 72, height: 72, borderRadius: '50%', borderWidth: 2 }} aria-hidden="true">
            <Icono nombre={variante.icono} tamano={34} grosor={2.6} />
          </span>
          <InsigniaEstado estado={ESTADO_PAGO[o.pago.estado]} />
          <h1 id="estado-titulo" className="m-0" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
            {variante.titulo}
          </h1>
          <p className="m-0 texto-secundario" style={{ maxWidth: 560 }}>
            {variante.texto}
          </p>
          {o.pago.detalle && <p className="m-0 small texto-secundario">{o.pago.detalle}</p>}
          <dl className="row g-2 w-100 m-0 mt-2 text-start">
            {[
              ['N° de orden', <span key="n" className="texto-mono fw-semibold">{o.numero}</span>],
              ['Fecha', <span key="f" className="texto-mono">{fechaHora(o.creadaEn)}</span>],
              ['Método', NOMBRE_METODO[o.pago.metodo]],
              ['Total', <span key="t" className="precio" style={{ fontSize: 20 }}>{clp(o.total)}</span>],
            ].map(([etiqueta, valor]) => (
              <div key={etiqueta} className="col-6 col-md-3">
                <div className="p-3 rounded-3 h-100" style={{ background: 'var(--color-fondo)', border: '1px solid var(--color-borde)' }}>
                  <dt className="small fw-normal texto-secundario">{etiqueta}</dt>
                  <dd className="m-0 mt-1">{valor}</dd>
                </div>
              </div>
            ))}
          </dl>
        </section>

        {aprobado && (
          <section className="tarjeta p-4" aria-labelledby="seguimiento-titulo">
            <h2 id="seguimiento-titulo" className="h5 mb-3">
              Estado del despacho
            </h2>
            <LineaTiempoDespacho pasos={pasosDespacho(o)} />
          </section>
        )}

        <section className="tarjeta p-4 d-flex flex-column gap-3" aria-labelledby="resumen-orden">
          <h2 id="resumen-orden" className="h5 m-0">
            Resumen de la orden
          </h2>
          <ul className="list-unstyled m-0 d-flex flex-column gap-3">
            {o.lineas.map((l) => (
              <li key={l.productoId} className="d-flex align-items-center gap-3">
                <span className="panel-imagen p-2" style={{ flex: '0 0 72px' }}>
                  <ImagenProducto imagen={l.imagen} alt="" />
                </span>
                <span className="flex-grow-1">
                  <span className="d-block fw-semibold">{l.nombre}</span>
                  <span className="small texto-secundario">
                    {l.cantidad} × {clp(l.precioUnitario)}
                  </span>
                </span>
                <span className="fw-semibold">{clp(l.subtotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="m-0 pt-3 border-top d-flex flex-column gap-2">
            <div className="d-flex justify-content-between">
              <dt className="fw-normal texto-secundario">Subtotal</dt>
              <dd className="m-0">{clp(o.subtotal)}</dd>
            </div>
            {o.descuento > 0 && (
              <div className="d-flex justify-content-between">
                <dt className="fw-normal texto-secundario">Cupón {o.cupon}</dt>
                <dd className="m-0 text-success fw-semibold">−{clp(o.descuento)}</dd>
              </div>
            )}
            <div className="d-flex justify-content-between">
              <dt className="fw-normal texto-secundario">Despacho a {o.despachoDatos.comuna}</dt>
              <dd className="m-0">Gratis</dd>
            </div>
            <div className="d-flex justify-content-between align-items-baseline pt-2 border-top">
              <dt>Total</dt>
              <dd className="m-0 precio" style={{ fontSize: 28 }}>
                {clp(o.total)}
              </dd>
            </div>
          </dl>
        </section>

        <div className="d-flex flex-wrap justify-content-center gap-2">
          {o.pago.estado === 'RECHAZADO' ? (
            <>
              <Link to="/checkout" className="btn btn-primary btn-lg">
                <Icono nombre="recargar" />
                Intentar de nuevo
              </Link>
              <Link to="/carrito" className="btn btn-outline-secondary btn-lg">
                Volver al carrito
              </Link>
            </>
          ) : (
            <>
              <Link to="/mis-ordenes" state={{ seleccion: o.id }} className="btn btn-primary btn-lg">
                <Icono nombre="caja" />
                Ver mis órdenes
              </Link>
              <Link to="/catalogo" className="btn btn-outline-secondary btn-lg">
                Seguir comprando
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
