import { useState } from 'react'
import { Link } from 'react-router'
import { clp } from '../logica/formato.js'
import Icono from './Icono.jsx'
import ImagenProducto from './ImagenProducto.jsx'
import IndicadorStock from './IndicadorStock.jsx'
import SelectorCantidad from './SelectorCantidad.jsx'

// Una línea del carrito: producto, cantidad editable, precio unitario, subtotal y acción para quitar.
// La cantidad respeta el stock: si no alcanza, la línea muestra su propio mensaje.
export default function LineaCarrito({ linea, aviso, onCambiarCantidad, onQuitar }) {
  const [mensaje, setMensaje] = useState('')
  const idCampo = `cantidad-${linea.productoId}`
  const idMensaje = `${idCampo}-mensaje`

  function cambiar(cantidad) {
    const resultado = onCambiarCantidad(linea.productoId, cantidad)
    setMensaje(resultado?.valido === false ? resultado.mensaje : '')
  }

  const alTope = linea.cantidad >= linea.stock
  const texto = mensaje || aviso || (alTope ? `Máximo disponible: ${linea.stock}` : '')
  const tipo = mensaje || aviso ? 'error' : 'aviso'

  return (
    <li className="d-flex flex-wrap align-items-center gap-3 p-3 p-md-4 border-top">
      <Link to={`/producto/${linea.productoId}`} className="panel-imagen p-2" style={{ flex: '0 0 96px' }} aria-label={`Ver ${linea.nombre}`}>
        <ImagenProducto imagen={linea.imagen} alt="" />
      </Link>
      <div className="flex-grow-1 d-flex flex-column gap-1" style={{ flexBasis: 200, minWidth: 0 }}>
        <p className="meta">
          {linea.marca} · SKU {linea.sku}
        </p>
        <h3 className="h6 m-0" style={{ fontFamily: 'var(--fuente-texto)' }}>
          <Link to={`/producto/${linea.productoId}`} className="text-body text-decoration-none">
            {linea.nombre}
          </Link>
        </h3>
        <p className="small texto-secundario m-0">Precio unitario {clp(linea.precio)}</p>
        <IndicadorStock stock={linea.stock} />
      </div>
      <div className="d-flex flex-column gap-1">
        <label htmlFor={idCampo} className="small texto-secundario">
          Cantidad
        </label>
        <SelectorCantidad
          id={idCampo}
          valor={linea.cantidad}
          max={linea.stock}
          onCambiar={cambiar}
          invalido={Boolean(mensaje || aviso)}
          describedBy={texto ? idMensaje : undefined}
          nombre={linea.nombre}
        />
        <p id={idMensaje} className={`mensaje mensaje-${tipo} m-0`} style={{ minHeight: 18 }}>
          {texto && <Icono nombre="alerta" tamano={13} grosor={2.2} />}
          {texto}
        </p>
      </div>
      <div className="d-flex flex-column align-items-end gap-1 text-end" style={{ flex: '0 0 130px' }}>
        <span className="small texto-secundario">Subtotal</span>
        <span className="precio" style={{ fontSize: 20 }}>
          {clp(linea.precio * linea.cantidad)}
        </span>
        <button
          type="button"
          className="btn btn-link text-danger text-decoration-none"
          onClick={() => onQuitar(linea.productoId)}
          aria-label={`Quitar ${linea.nombre} del carrito`}
        >
          <Icono nombre="basura" tamano={16} />
          Quitar
        </button>
      </div>
    </li>
  )
}
