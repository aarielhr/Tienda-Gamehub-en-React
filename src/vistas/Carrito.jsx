import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ElementoCarrito from '../componentes/ElementoCarrito.jsx';
import ResumenCarrito from '../componentes/ResumenCarrito.jsx';
import { usarCarrito } from '../contexto/ProveedorCarrito.jsx';
import { aplicarCupon } from '../servicios/servicioCarrito.js';
import { obtenerCupon } from '../servicios/almacenamiento.js';
import { calcularTotales } from '../utilidades/formato.js';

export default function Carrito() {
  const { carrito, actualizarCantidad, quitarProducto, vaciarCarrito } = usarCarrito();
  const [codigo, establecerCodigo] = useState(() => obtenerCupon()?.codigo ?? '');
  const [cupon, establecerCupon] = useState(obtenerCupon);
  const [mensajeCupon, establecerMensajeCupon] = useState('');
  const [errorCupon, establecerErrorCupon] = useState(false);
  const [totales, establecerTotales] = useState(() => calcularTotales(carrito, obtenerCupon()?.descuento ?? 0));

  useEffect(() => establecerTotales(calcularTotales(carrito, cupon?.descuento ?? 0)), [carrito, cupon]);

  const manejarCupon = (evento) => {
    evento.preventDefault();
    const resultado = aplicarCupon(codigo);
    establecerCupon(resultado.cupon);
    establecerMensajeCupon(resultado.mensaje ?? resultado.error);
    establecerErrorCupon(Boolean(resultado.error));
  };

  const manejarVaciado = () => {
    vaciarCarrito();
    establecerCupon(null);
    establecerCodigo('');
    establecerMensajeCupon('');
  };

  if (carrito.length === 0) {
    return <section className="text-center py-5"><h1 className="titulo-seccion">Tu carrito de compras</h1><p className="lead mt-4">Carrito vacío, llénalo en el <Link to="/catalogo.html">catálogo</Link>.</p></section>;
  }

  return (
    <section>
      <h1 className="titulo-seccion mb-4">Tu carrito de compras</h1>
      <div className="row g-4 align-items-start">
        <div className="col-12 col-lg-8 d-grid gap-3">
          {carrito.map((articulo) => <ElementoCarrito key={articulo.id} articulo={articulo} alCambiarCantidad={actualizarCantidad} alQuitar={quitarProducto} />)}
        </div>
        <div className="col-12 col-lg-4">
          <div className="panel-resumen card mb-3">
            <div className="card-body">
              <h2 className="h4">Código de descuento</h2>
              <form className="d-flex gap-2" onSubmit={manejarCupon}>
                <label className="visually-hidden" htmlFor="codigo-cupon">Código de descuento</label>
                <input className="form-control" id="codigo-cupon" value={codigo} onChange={(evento) => establecerCodigo(evento.target.value)} placeholder="Ej: SETUP2026" />
                <button className="btn btn-outline-primary flex-shrink-0" type="submit">Aplicar</button>
              </form>
              {mensajeCupon && <p className={`mt-2 mb-0 ${errorCupon ? 'text-danger' : 'text-success'}`} role="status">{mensajeCupon}</p>}
            </div>
          </div>
          <ResumenCarrito articulos={carrito} totales={totales} />
          <div className="d-grid gap-2 mt-3">
            <button className="btn btn-outline-danger" type="button" onClick={manejarVaciado}>Vaciar carrito</button>
            <Link className="btn btn-primary" to="/checkout.html">Ir a pagar</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
