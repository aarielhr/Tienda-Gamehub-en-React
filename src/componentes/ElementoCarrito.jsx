import { useEffect, useState } from 'react';
import { formatearMoneda } from '../utilidades/formato.js';

export default function ElementoCarrito({ articulo, alCambiarCantidad, alQuitar }) {
  const [cantidad, establecerCantidad] = useState(articulo.cantidad);

  useEffect(() => establecerCantidad(articulo.cantidad), [articulo.cantidad]);

  const manejarCambio = (evento) => {
    const valor = Number(evento.target.value);
    if (!Number.isInteger(valor) || valor < 1) {
      establecerCantidad(articulo.cantidad);
      return;
    }
    const nuevaCantidad = Math.min(valor, articulo.stockMaximo);
    establecerCantidad(nuevaCantidad);
    alCambiarCantidad(articulo.id, nuevaCantidad);
  };

  return (
    <article className="elemento-carrito card">
      <img src={articulo.imagen} alt={articulo.nombre} />
      <div className="informacion-elemento-carrito">
        <h2 className="h5">{articulo.nombre}</h2>
        <p className="text-secondary mb-0">Precio unitario: {formatearMoneda(articulo.precio)}</p>
      </div>
      <div className="cantidad-carrito">
        <label className="form-label" htmlFor={`cantidad-${articulo.id}`}>Cantidad</label>
        <input className="form-control" id={`cantidad-${articulo.id}`} type="number" min="1" max={articulo.stockMaximo} value={cantidad} onChange={manejarCambio} />
        <small className="text-secondary">Stock: {articulo.stockMaximo}</small>
      </div>
      <strong className="precio">{formatearMoneda(articulo.precio * articulo.cantidad)}</strong>
      <button className="btn btn-outline-danger" type="button" onClick={() => alQuitar(articulo.id)} aria-label={`Quitar ${articulo.nombre}`}>Quitar</button>
    </article>
  );
}
