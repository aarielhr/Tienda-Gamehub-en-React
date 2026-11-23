import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarMisOrdenes } from '../services/ordenes.js';
import { ESTADO_ORDEN } from '../logica/estados.js';
import { formatearMoneda } from '../utilidades/formato.js';
import { Cargando, MensajeError, Vacio } from '../components/Estado.jsx';

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    let vigente = true;
    listarMisOrdenes().then((datos) => { if (vigente) setOrdenes(datos); }).catch((e) => { if (vigente) setError(e); });
    return () => { vigente = false; };
  }, []);
  if (!ordenes && !error) return <Cargando texto="Cargando tus órdenes desde el backend…" />;
  if (error) return <MensajeError error={error} />;
  return <section><h1 className="titulo-seccion mb-4">Mis órdenes</h1>{!ordenes.length ? <Vacio titulo="Todavía no tienes órdenes" texto="Cuando realices una compra, el pago y seguimiento estarán aquí."><Link className="btn btn-primary" to="/catalogo.html">Ir al catálogo</Link></Vacio> : <div className="table-responsive"><table className="table table-dark table-striped align-middle"><thead><tr><th scope="col">Número de orden</th><th scope="col">Fecha</th><th scope="col">Total</th><th scope="col">Estado</th><th scope="col">Detalle</th></tr></thead><tbody>{ordenes.map((orden) => <tr key={orden.id}><td>{orden.numero}</td><td>{new Date(orden.creadaEn).toLocaleDateString('es-CL')}</td><td>{formatearMoneda(orden.total)}</td><td>{ESTADO_ORDEN[orden.estado]?.texto ?? orden.estado}</td><td><Link to={`/ordenes/${orden.id}/confirmacion`}>Ver pago y despacho</Link></td></tr>)}</tbody></table></div>}</section>;
}
