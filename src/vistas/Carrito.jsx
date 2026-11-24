import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ElementoCarrito from '../componentes/ElementoCarrito.jsx';
import CarritoEV2 from '../components/CarritoEV2.jsx';
import ResumenCarrito from '../componentes/ResumenCarrito.jsx';
import { usarCarrito } from '../contexto/ProveedorCarrito.jsx';
import { useAuth } from '../context/useAuth.js';
import { obtenerCupon, guardarAlmacenamiento, CLAVES_ALMACENAMIENTO } from '../servicios/almacenamiento.js';
import { validarCarrito, validarCupon } from '../services/catalogo.js';
import { calcularTotales } from '../utilidades/formato.js';
import { MensajeError, Cargando } from '../components/Estado.jsx';

export default function Carrito() {
  const carrito = usarCarrito();
  const { usuario, rol } = useAuth();
  const navegar = useNavigate();
  const [codigo, setCodigo] = useState(() => obtenerCupon()?.codigo ?? '');
  const [cupon, setCupon] = useState(obtenerCupon);
  const [mensaje, setMensaje] = useState('');
  const [errorCupon, setErrorCupon] = useState(false);
  const [validando, setValidando] = useState(false);
  const [avanzando, setAvanzando] = useState(false);
  const [error, setError] = useState(null);
  const [validandoStock, setValidandoStock] = useState(false);
  const [avisosStock, setAvisosStock] = useState({});
  const totales = calcularTotales(carrito.carrito, cupon?.porcentaje ? cupon.porcentaje / 100 : cupon?.descuento ?? 0);
  useEffect(() => {
    if (!carrito.carrito.length) return;
    setValidandoStock(true);
    validarCarrito(carrito.carrito.map((l) => ({ productoId: l.id, cantidad: l.cantidad })), cupon).then((r) => {
      carrito.sincronizar?.(r);
      setAvisosStock(Object.fromEntries(r.lineas.filter((l) => !l.disponible).map((l) => [l.productoId, l.mensaje])));
      if (r.mensajeCupon) { setMensaje(r.mensajeCupon); setErrorCupon(true); setCupon(null); }
    }).catch(setError).finally(() => setValidandoStock(false));
  }, []);
  async function aplicar(e) {
    e.preventDefault(); setValidando(true); setMensaje('');
    try {
      const nuevo = await validarCupon(codigo);
      setCupon(nuevo); guardarAlmacenamiento(CLAVES_ALMACENAMIENTO.cupon, nuevo);
      setMensaje(`Cupón ${nuevo.codigo} aplicado: ${nuevo.porcentaje}% de descuento.`); setErrorCupon(false);
    } catch (err) { setCupon(null); localStorage.removeItem(CLAVES_ALMACENAMIENTO.cupon); setMensaje(err.message); setErrorCupon(true); }
    finally { setValidando(false); }
  }
  async function pagar() {
    setAvanzando(true); setError(null);
    try {
      const comprobacion = await validarCarrito(carrito.carrito.map((l) => ({ productoId: l.id, cantidad: l.cantidad })), cupon);
      if (!comprobacion.valido) { setAvisosStock(Object.fromEntries(comprobacion.lineas.filter((l) => !l.disponible).map((l) => [l.productoId, l.mensaje]))); carrito.sincronizar?.(comprobacion); setError(new Error('El stock disponible cambió. Revisa las cantidades de tu carrito.')); return; }
      navegar('/checkout.html');
    } catch (e) { setError(e); } finally { setAvanzando(false); }
  }
  if (!carrito.carrito.length) return <section className="text-center py-5"><h1 className="titulo-seccion">Tu carrito de compras</h1><p className="lead mt-4">Carrito vacío, llénalo en el <Link to="/catalogo.html">catálogo</Link>.</p></section>;
  return <section><h1 className="titulo-seccion mb-4">Tu carrito de compras</h1>{validandoStock && <Cargando texto="Validando precios y stock en el Gateway…" />}{error && <MensajeError error={error} />}
    <div className="row g-4 align-items-start"><div className="col-12 col-lg-8 d-grid gap-3">{carrito.carrito.map((articulo) => <div key={articulo.id}>{avisosStock[articulo.id] && <p className="text-danger mb-1" role="alert">{avisosStock[articulo.id]}</p>}{articulo.productoId !== undefined ? <CarritoEV2 articulo={articulo} alCambiarCantidad={(id, cantidad) => { setAvisosStock((a) => ({ ...a, [id]: undefined })); carrito.actualizarCantidad(id, cantidad); }} alQuitar={carrito.quitarProducto} /> : <ElementoCarrito articulo={articulo} alCambiarCantidad={(id, cantidad) => { setAvisosStock((a) => ({ ...a, [id]: undefined })); carrito.actualizarCantidad(id, cantidad); }} alQuitar={carrito.quitarProducto} />}</div>)}</div><div className="col-12 col-lg-4"><div className="panel-resumen card mb-3"><div className="card-body"><h2 className="h4">Código de descuento</h2><form className="d-flex gap-2" onSubmit={aplicar}><label className="visually-hidden" htmlFor="codigo-cupon">Código de descuento</label><input className="form-control" id="codigo-cupon" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ej: GAMER10" /><button className="btn btn-outline-primary" type="submit" disabled={validando}>{validando ? 'Validando…' : 'Aplicar'}</button></form>{mensaje && <p className={`mt-2 mb-0 ${errorCupon ? 'text-danger' : 'text-success'}`} role={errorCupon ? 'alert' : 'status'}>{mensaje}</p>}</div></div><ResumenCarrito articulos={carrito.carrito} totales={totales} /><div className="d-grid gap-2 mt-3"><button className="btn btn-outline-danger" type="button" onClick={() => { carrito.vaciarCarrito(); setCupon(null); localStorage.removeItem(CLAVES_ALMACENAMIENTO.cupon); }}>Vaciar carrito</button>{rol === 'CLIENTE' ? <button className="btn btn-primary" type="button" disabled={avanzando || validandoStock} onClick={pagar}>{avanzando ? 'Revisando stock…' : 'Ir a pagar'}</button> : !usuario ? <Link className="btn btn-primary" to="/acceso" state={{ desde: '/checkout.html' }}>Iniciar sesión para pagar</Link> : <p className="alert alert-info">Tu rol puede navegar el catálogo, pero las compras requieren una cuenta CLIENTE.</p>}</div></div></div>
  </section>;
}
