import { useEffect, useState } from 'react';
import { formatearMoneda } from '../utilidades/formato.js';

export default function TarjetaProducto({ producto, alAgregar }) {
  const [agregado, establecerAgregado] = useState(false);
  const hayExistencias = producto.stock > 0;
  const agregar = () => alAgregar?.(producto);

  useEffect(() => {
    if (!agregado) return undefined;
    const temporizador = window.setTimeout(() => establecerAgregado(false), 1600);
    return () => window.clearTimeout(temporizador);
  }, [agregado]);

  return (
    <article className="col">
      <div className="card tarjeta-producto h-100">
        <div className="marco-imagen-producto"><span className="indice-producto" aria-hidden="true">GH / {String(producto.id).padStart(3, '0')}</span>
          {/^(https?:)?\/\//.test(producto.imagen ?? '') || producto.imagen?.startsWith('/')
            ? <img className="card-img-top" src={producto.imagen} alt={producto.nombre} loading="lazy" />
            : <span className="ilustracion-catalogo" role="img" aria-label={producto.nombre}>{({ notebook: '💻', gpu: '🎮', cpu: '⚙️', teclado: '⌨️', mouse: '🖱️', audifonos: '🎧', monitor: '🖥️', consola: '🎮', control: '🎮', ssd: '💾', microfono: '🎙️', mousepad: '🖱️' })[producto.imagen] ?? '🎮'}</span>}
        </div>
        <div className="card-body d-flex flex-column"><p className="categoria-producto">{producto.categoria} / {producto.marca}</p>
          <h2 className="h5 card-title">{producto.nombre}</h2>
          <p className="precio mb-2">{formatearMoneda(producto.precio)}</p>
          <p className={`small estado-stock ${hayExistencias ? 'text-success' : 'text-danger'}`}>
            {hayExistencias ? `Stock: ${producto.stock} uds.` : 'Agotado'}
          </p>
          <button className="btn btn-primary mt-auto" type="button" disabled={!hayExistencias} onClick={() => { const resultado = agregar(); if (resultado !== false && resultado?.valido !== false) establecerAgregado(true); }}>
            {agregado ? 'Agregado' : hayExistencias ? 'Agregar al carrito' : 'Sin stock'}
<span className="icono-agregar" aria-hidden="true">+</span>
          </button>
        </div>
      </div>
    </article>
  );
}
