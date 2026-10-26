import { formatearMoneda } from '../utilidades/formato.js';

export default function ResumenOrden({ articulos, totales, titulo = 'Resumen de la orden' }) {
  return (
    <aside className="panel-resumen card">
      <div className="card-body">
        <h2 className="h4">{titulo}</h2>
        {articulos.map((articulo) => (
          <p className="linea-resumen" key={articulo.id}>
            <span>{articulo.nombre} x{articulo.cantidad}</span>
            <span>{formatearMoneda(articulo.precio * articulo.cantidad)}</span>
          </p>
        ))}
        <hr />
        <p className="d-flex justify-content-between"><span>Subtotal</span><span>{formatearMoneda(totales.subtotal)}</span></p>
        <p className="d-flex justify-content-between"><span>Descuento</span><span>-{formatearMoneda(totales.descuento)}</span></p>
        <p className="d-flex justify-content-between fw-bold fs-5 mb-0"><span>Total</span><span className="precio">{formatearMoneda(totales.total)}</span></p>
      </div>
    </aside>
  );
}
