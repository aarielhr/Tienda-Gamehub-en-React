import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Cargando, MensajeError, Vacio } from '../components/Estado.jsx'
import FormularioCheckout from '../components/FormularioCheckout.jsx'
import Icono from '../components/Icono.jsx'
import ImagenProducto from '../components/ImagenProducto.jsx'
import Migas from '../components/Migas.jsx'
import { useCarrito } from '../context/useCarrito.js'
import { useCarga } from '../hooks/useCarga.js'
import { clp } from '../logica/formato.js'
import { obtenerPerfil } from '../services/autenticacion.js'
import { crearOrden } from '../services/ordenes.js'

function Pasos() {
  return (
    <ol className="list-unstyled m-0 d-flex flex-wrap align-items-center gap-2 small" aria-label="Pasos de la compra">
      <li className="d-flex align-items-center gap-2 texto-secundario">
        <span className="paso-hecho">
          <span className="paso-circulo" aria-hidden="true">
            <Icono nombre="check" tamano={13} grosor={3} />
          </span>
        </span>
        Carrito <span className="visualmente-oculto">(listo)</span>
      </li>
      <li aria-hidden="true" style={{ width: 28, height: 2, background: 'var(--color-acento)' }} />
      <li className="d-flex align-items-center gap-2 fw-semibold" aria-current="step">
        <span className="paso-circulo" style={{ borderColor: 'var(--color-primario)', color: 'var(--color-primario-hover)' }} aria-hidden="true">
          2
        </span>
        Despacho y pago
      </li>
      <li aria-hidden="true" style={{ width: 28, height: 2, background: 'var(--color-borde)' }} />
      <li className="d-flex align-items-center gap-2 texto-secundario">
        <span className="paso-circulo" style={{ color: 'var(--color-texto-secundario)' }} aria-hidden="true">
          3
        </span>
        Confirmación
      </li>
    </ol>
  )
}

export default function Checkout() {
  const { lineas, cupon, subtotal, descuento, total, vaciar } = useCarrito()
  const perfil = useCarga(() => obtenerPerfil(), [])
  const navegar = useNavigate()
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  async function confirmar(datos) {
    setEnviando(true)
    setError(null)
    try {
      const orden = await crearOrden({
        lineas: lineas.map((l) => ({ productoId: l.productoId, cantidad: l.cantidad })),
        cupon: cupon?.codigo ?? null,
        metodoPago: datos.metodoPago,
        despacho: {
          nombre: datos.nombre,
          correo: datos.correo,
          telefono: datos.telefono,
          region: datos.region,
          comuna: datos.comuna,
          direccion: datos.direccion,
          depto: datos.depto,
          indicaciones: datos.indicaciones,
        },
      })
      // Si el pago se rechazó, el carrito se conserva para intentar de nuevo
      if (orden.pago.estado !== 'RECHAZADO') vaciar()
      navegar(`/ordenes/${orden.id}/confirmacion`, { state: { orden } })
    } catch (e) {
      setError(e)
      window.scrollTo(0, 0)
    } finally {
      setEnviando(false)
    }
  }

  if (!lineas.length) {
    return (
      <div className="contenedor py-5">
        <Vacio icono="carrito" titulo="No hay productos para pagar" texto="Tu carrito está vacío: agrega productos antes de ir al checkout.">
          <Link to="/catalogo" className="btn btn-primary">
            Ir al catálogo
          </Link>
        </Vacio>
      </div>
    )
  }

  const p = perfil.datos
  const datosIniciales = p
    ? {
        nombre: p.nombre ?? '',
        correo: p.email ?? '',
        telefono: p.telefono ?? '',
        region: p.region ?? '',
        comuna: p.comuna ?? '',
        direccion: p.direccion ?? '',
        depto: '',
      }
    : {}

  return (
    <div className="contenedor py-4">
      <Migas pasos={[{ texto: 'Inicio', a: '/' }, { texto: 'Carrito', a: '/carrito' }, { texto: 'Checkout' }]} />
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mt-2 mb-4">
        <h1 className="m-0" style={{ fontSize: 40 }}>
          Checkout
        </h1>
        <Pasos />
      </div>

      {error && (
        <div className="mb-4 d-flex flex-column gap-2">
          <MensajeError error={error} />
          {error.estado === 409 && (
            <Link to="/carrito" className="fw-semibold">
              Volver al carrito para ajustar las cantidades
            </Link>
          )}
        </div>
      )}

      <div className="row g-4 align-items-start">
        <div className="col-lg-8">
          {perfil.cargando ? (
            <Cargando texto="Cargando tus datos de despacho…" />
          ) : (
            <>
              {perfil.error && <div className="mb-3"><MensajeError error={perfil.error} /></div>}
              <FormularioCheckout datosIniciales={datosIniciales} total={total} carritoVacio={!lineas.length} enviando={enviando} onConfirmar={confirmar} />
            </>
          )}
        </div>
        <aside className="col-lg-4" aria-labelledby="orden-titulo">
          <div className="tarjeta p-4 d-flex flex-column gap-3">
            <h2 id="orden-titulo" className="h5 m-0">
              Tu orden
            </h2>
            <ul className="list-unstyled m-0 d-flex flex-column gap-3">
              {lineas.map((l) => (
                <li key={l.productoId} className="d-flex align-items-center gap-3">
                  <span className="panel-imagen p-2" style={{ flex: '0 0 64px' }}>
                    <ImagenProducto imagen={l.imagen} alt="" />
                  </span>
                  <span className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
                    <span className="small fw-semibold">{l.nombre}</span>
                    <span className="small texto-secundario">
                      {l.cantidad} × {clp(l.precio)}
                    </span>
                  </span>
                  <span className="small fw-semibold text-nowrap">{clp(l.precio * l.cantidad)}</span>
                </li>
              ))}
            </ul>
            <dl className="m-0 pt-3 border-top d-flex flex-column gap-2">
              <div className="d-flex justify-content-between">
                <dt className="fw-normal texto-secundario">Subtotal</dt>
                <dd className="m-0">{clp(subtotal)}</dd>
              </div>
              {descuento > 0 && (
                <div className="d-flex justify-content-between">
                  <dt className="fw-normal texto-secundario d-flex align-items-center gap-1">
                    <Icono nombre="etiqueta" tamano={14} className="text-success" />
                    Cupón {cupon.codigo}
                  </dt>
                  <dd className="m-0 fw-semibold text-success">−{clp(descuento)}</dd>
                </div>
              )}
              <div className="d-flex justify-content-between">
                <dt className="fw-normal texto-secundario">Despacho</dt>
                <dd className="m-0">Gratis</dd>
              </div>
              <div className="d-flex justify-content-between align-items-baseline pt-2 border-top">
                <dt>Total</dt>
                <dd className="m-0 precio" style={{ fontSize: 28 }}>
                  {clp(total)}
                </dd>
              </div>
            </dl>
            <p className="m-0 small texto-secundario">
              Al confirmar se crea la orden y se registra el pago. El stock se descuenta cuando el pago queda aprobado.
            </p>
            <Link to="/carrito" className="small fw-semibold d-inline-flex align-items-center gap-1">
              <Icono nombre="volver" tamano={16} />
              Volver al carrito
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
