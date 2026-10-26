import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerOrdenes } from '../servicios/almacenamiento.js';
import { formatearMoneda } from '../utilidades/formato.js';

export default function Ordenes() {
  const [ordenes, establecerOrdenes] = useState([]);

  useEffect(() => establecerOrdenes(obtenerOrdenes()), []);

  return (
    <section>
      <h1 className="titulo-seccion mb-4">Mis órdenes</h1>
      {ordenes.length === 0
        ? <p className="lead">No tienes órdenes aún. ¡Realiza tu primera compra en el <Link to="/catalogo.html">catálogo</Link>!</p>
        : <div className="table-responsive">
          <table className="table table-dark table-striped align-middle">
            <thead><tr><th scope="col">Número de orden</th><th scope="col">Fecha</th><th scope="col">Total</th><th scope="col">Estado</th></tr></thead>
            <tbody>{ordenes.map((orden) => <tr key={orden.numero}><td>{orden.numero}</td><td>{orden.fecha}</td><td>{formatearMoneda(orden.total)}</td><td>{orden.estado}</td></tr>)}</tbody>
          </table>
        </div>}
    </section>
  );
}
