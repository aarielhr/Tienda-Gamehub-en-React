import { useEffect, useState } from 'react';
import { formatearMoneda } from '../utilidades/formato.js';

export default function TarjetaProducto({ producto, alAgregar }) {
  const [agregado, establecerAgregado] = useState(false);
  const hayExistencias = producto.stock > 0;

  useEffect(() => {
    if (!agregado) return undefined;
    const temporizador = window.setTimeout(() => establecerAgregado(false), 1600);
    return () => window.clearTimeout(temporizador);
  }, [agregado]);

  return (
    <article className="col">
      <div className="card tarjeta-producto h-100">
        <div className="marco-imagen-producto"><span className="indice-producto" aria-hidden="true">GH / {String(producto.id).padStart(3, '0')}</span>
          <img className="card-img-top" src={producto.imagen} alt={producto.nombre} loading="lazy" />
        </div>
        <div className="card-body d-flex flex-column"><p className="categoria-producto">{producto.categoria} / {producto.marca}</p>
          <h2 className="h5 card-title">{producto.nombre}</h2>
          <p className="precio mb-2">{formatearMoneda(producto.precio)}</p>
          <p className={`small estado-stock ${hayExistencias ? 'text-success' : 'text-danger'}`}>
            {hayExistencias ? `Stock: ${producto.stock} uds.` : 'Agotado'}
          </p>
          <button className="btn btn-primary mt-auto" type="button" disabled={!hayExistencias} onClick={() => { if (alAgregar(producto.id)) establecerAgregado(true); }}>
            {agregado ? 'Agregado' : hayExistencias ? 'Agregar al carrito' : 'Sin stock'}
<span className="icono-agregar" aria-hidden="true">+</span>
          </button>
        </div>
      </div>
    </article>
  );
}
