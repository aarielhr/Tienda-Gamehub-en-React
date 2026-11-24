import { Link } from 'react-router'
import { plural, porcentajeDescuento } from '../logica/formato.js'
import { promedioTexto } from '../logica/resenas.js'
import Icono from './Icono.jsx'
import ImagenProducto from './ImagenProducto.jsx'
import IndicadorStock from './IndicadorStock.jsx'
import Insignia from './Insignia.jsx'
import Precio from './Precio.jsx'

// Recibe el producto por props y decide qué mostrar: oferta, pocas unidades o sin stock.
// Sin stock, el botón de compra queda deshabilitado.
export default function TarjetaProducto({ producto, onAgregar }) {
  const agotado = producto.stock <= 0
  const descuento = porcentajeDescuento(producto.precio, producto.precioNormal)
  const enlace = `/producto/${producto.id}`

  return (
    <article className="tarjeta-producto" aria-labelledby={`producto-${producto.id}`}>
      {/* La imagen repite el enlace del título: se saca del orden de tabulación para no duplicarlo */}
      <Link to={enlace} className="imagen" tabIndex={-1} aria-hidden="true">
        <ImagenProducto imagen={producto.imagen} alt="" />
        <span className="insignias">
          {descuento > 0 && (
            <Insignia tono="ok" icono="etiqueta">
              −{descuento} %
            </Insignia>
          )}
          {agotado && (
            <Insignia tono="error" icono="x">
              Sin stock
            </Insignia>
          )}
        </span>
      </Link>
      <div className="cuerpo">
        <p className="meta">
          {producto.marca} · {producto.categoria}
        </p>
        <h3 id={`producto-${producto.id}`}>
          <Link to={enlace}>{producto.nombre}</Link>
        </h3>
        {producto.resumen && <p className="resumen small texto-secundario m-0">{producto.resumen}</p>}
        <p className="small texto-secundario m-0 d-flex align-items-center gap-1">
          {producto.cantidadResenas > 0 ? (
            <>
              <Icono nombre="estrella" tamano={14} className="text-body" />
              <span className="fw-semibold text-body">{promedioTexto(producto.puntuacion)}</span>
              <span>· {plural(producto.cantidadResenas, 'reseña', 'reseñas')}</span>
            </>
          ) : (
            'Sin reseñas todavía'
          )}
        </p>
        <Precio precio={producto.precio} precioNormal={producto.precioNormal} className="mt-1" />
        <IndicadorStock stock={producto.stock} />
        <div className="mt-auto pt-2">
          <button type="button" className="btn btn-tonal w-100" disabled={agotado} onClick={() => onAgregar?.(producto)}>
            {agotado ? (
              'Sin stock · no disponible'
            ) : (
              <>
                <Icono nombre="carrito" />
                Agregar al carrito
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  )
}
