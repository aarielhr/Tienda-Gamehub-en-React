import { useState } from 'react'
import { aplicarCupon, calcularSubtotal, calcularTotal, contarUnidades, cuponVigente } from '../logica/carrito.js'
import { clp, plural } from '../logica/formato.js'
import Icono from './Icono.jsx'

// Totales del carrito y campo de cupón. Recibe las líneas por props y calcula con logica/carrito.js.
export default function ResumenCarrito({ lineas, cupon, mensajeCupon, cargandoCupon = false, onAplicarCupon, onQuitarCupon, children }) {
  const [codigo, setCodigo] = useState('')

  if (!lineas.length) {
    return (
      <section className="tarjeta p-4 d-flex flex-column gap-2" aria-labelledby="resumen-titulo">
        <h2 id="resumen-titulo" className="h5 m-0">
          Resumen
        </h2>
        <p className="m-0 texto-secundario">Tu carrito está vacío.</p>
      </section>
    )
  }

  const subtotal = calcularSubtotal(lineas)
  const vigente = cuponVigente(cupon)
  const descuento = vigente ? aplicarCupon(subtotal, cupon) : 0
  const total = calcularTotal(subtotal, descuento)
  const bruto = vigente ? Math.round((subtotal * cupon.porcentaje) / 100) : 0

  function enviar(e) {
    e.preventDefault()
    onAplicarCupon?.(codigo.trim().toUpperCase())
  }

  return (
    <section className="tarjeta p-4 d-flex flex-column gap-3" aria-labelledby="resumen-titulo">
      <h2 id="resumen-titulo" className="h5 m-0">
        Resumen
      </h2>

      <form onSubmit={enviar} noValidate className="d-flex flex-column gap-2">
        <label htmlFor="cupon" className="form-label m-0">
          Cupón de descuento
        </label>
        <div className="d-flex gap-2">
          <input
            id="cupon"
            className={`form-control texto-mono text-uppercase ${mensajeCupon?.tipo === 'error' ? 'is-invalid' : ''}`}
            placeholder="Ej.: GAMER10"
            autoComplete="off"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            aria-describedby="cupon-mensaje"
            aria-invalid={mensajeCupon?.tipo === 'error' ? 'true' : undefined}
          />
          <button type="submit" className="btn btn-outline-secondary" disabled={cargandoCupon || !codigo.trim()}>
            {cargandoCupon ? 'Validando…' : 'Aplicar'}
          </button>
        </div>
        <p id="cupon-mensaje" className={`mensaje mensaje-${mensajeCupon?.tipo ?? 'ayuda'}`} role={mensajeCupon?.tipo === 'error' ? 'alert' : 'status'}>
          {mensajeCupon && <Icono nombre={mensajeCupon.tipo === 'error' ? 'alerta' : 'check'} tamano={15} grosor={2.4} />}
          {mensajeCupon?.texto ?? 'Prueba GAMER10 (vigente), CYBER25 (vencido) o SETUP15 (aún no comienza).'}
        </p>
      </form>

      {cupon && (
        <div className="d-flex align-items-center justify-content-between gap-2 insignia insignia-ok py-2 px-3" style={{ whiteSpace: 'normal' }}>
          <span className="d-inline-flex align-items-center gap-2 texto-mono">
            <Icono nombre="etiqueta" tamano={15} />
            {cupon.codigo} · {cupon.porcentaje} % · tope {clp(cupon.tope)}
          </span>
          <button type="button" className="btn btn-link p-0 text-success" style={{ minHeight: 'auto' }} onClick={onQuitarCupon} aria-label={`Quitar el cupón ${cupon.codigo}`}>
            <Icono nombre="x" tamano={16} />
          </button>
        </div>
      )}

      <dl className="m-0 d-flex flex-column gap-2">
        <div className="d-flex justify-content-between gap-3">
          <dt className="fw-normal texto-secundario">Subtotal ({plural(contarUnidades(lineas), 'unidad', 'unidades')})</dt>
          <dd className="m-0">{clp(subtotal)}</dd>
        </div>
        <div className="d-flex justify-content-between gap-3">
          <dt className="fw-normal texto-secundario">Descuento</dt>
          <dd className={`m-0 fw-semibold ${descuento > 0 ? 'text-success' : 'texto-secundario'}`}>
            {descuento > 0 ? `−${clp(descuento)}` : clp(0)}
          </dd>
        </div>
        {vigente && bruto > cupon.tope && (
          <dd className="m-0 small texto-secundario">
            El {cupon.porcentaje} % sería {clp(bruto)}; se aplica el tope de {clp(cupon.tope)}.
          </dd>
        )}
        <div className="d-flex justify-content-between gap-3">
          <dt className="fw-normal texto-secundario">Despacho</dt>
          <dd className="m-0">Gratis</dd>
        </div>
        <div className="d-flex justify-content-between align-items-baseline gap-3 border-top pt-3 mt-1">
          <dt className="fw-semibold">Total</dt>
          <dd className="m-0 precio" style={{ fontSize: 30 }} aria-live="polite">
            {clp(total)}
          </dd>
        </div>
      </dl>

      {children}
      <p className="m-0 small texto-secundario">
        El descuento nunca supera el subtotal. Antes de pagar se vuelven a validar el stock y el cupón.
      </p>
    </section>
  )
}
