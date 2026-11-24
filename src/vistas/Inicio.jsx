import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TarjetaProducto from '../componentes/TarjetaProducto.jsx';
import { usarCarrito } from '../contexto/ProveedorCarrito.jsx';
import { Cargando, MensajeError, Vacio } from '../components/Estado.jsx';
import { listarProductos, listarCategorias } from '../services/catalogo.js';

function IlustracionSetup() {
  return <div className="escena-setup" aria-hidden="true"><div className="orbita-setup orbita-uno" /><div className="orbita-setup orbita-dos" /><span className="referencia-setup">GH / SETUP 01</span><div className="teclado-setup">{[14, 14, 13, 12, 8].map((cantidad, fila) => <div className={`fila-teclado fila-${fila}`} key={fila}>{Array.from({ length: cantidad }, (_, tecla) => <span className="tecla-setup" key={tecla}>{fila === 0 ? ['ESC', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '−', '+', '⌫'][tecla] : ''}</span>)}</div>)}</div><div className="leyenda-setup"><span /> DISEÑADO PARA TU PRÓXIMO NIVEL</div></div>;
}

export default function Inicio() {
  const { agregarProducto } = usarCarrito();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [videoActivo, setVideoActivo] = useState(false);
  useEffect(() => {
    let vigente = true;
    Promise.all([listarProductos(), listarCategorias()]).then(([p, c]) => {
      if (vigente) { setProductos(p); setCategorias(c); }
    }).catch((e) => { if (vigente) setError(e); }).finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, []);
  const destacados = productos.filter((p) => p.stock > 0).slice(0, 3);
  return (
    <div className="pagina-inicio">
      <section className="panel-portada"><div className="contenido-portada"><p className="sobrelinea"><span /> EL SIGUIENTE NIVEL EMPIEZA CONTIGO</p><h1 className="titulo-portada">Bienvenido a <span>GameHub Store</span></h1><p className="descripcion-portada">El mejor hardware y periféricos para tu setup, con existencias actualizadas desde nuestra tienda.</p><Link className="btn btn-primary enlace-portada" to="/catalogo.html">Ver catálogo <span aria-hidden="true">↗</span></Link><p className="nota-portada"><span aria-hidden="true">＋</span> STOCK Y PRECIOS ACTUALIZADOS</p></div><IlustracionSetup /><div className="pie-portada"><span>PRECISIÓN. CONTROL. INMERSIÓN.</span><span>ENCUENTRA TU PRÓXIMO NIVEL <span aria-hidden="true">↓</span></span></div></section>
      <section className="py-4" aria-labelledby="titulo-categorias"><h2 className="titulo-seccion" id="titulo-categorias">Compra por categoría</h2>{cargando ? <Cargando texto="Cargando categorías…" /> : error ? <MensajeError error={error} /> : <ul className="list-unstyled d-flex flex-wrap gap-2">{categorias.map((c) => <li key={c.id}><Link className="btn btn-outline-secondary" to={`/catalogo.html?categoria=${encodeURIComponent(c.slug)}`}>{c.nombre} ({c.cantidadProductos})</Link></li>)}</ul>}</section>
      <section className="seccion-destacados" aria-labelledby="titulo-destacados"><div className="encabezado-seccion"><div><p className="sobrelinea">// SELECCIÓN GAMEHUB</p><h2 className="titulo-seccion" id="titulo-destacados">Productos destacados</h2></div><Link className="enlace-editorial" to="/catalogo.html">Ver todo el catálogo <span aria-hidden="true">↗</span></Link></div>{cargando && <Cargando texto="Cargando productos desde el catálogo…" />}{error && <MensajeError error={error} />}{!cargando && !error && (destacados.length ? <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">{destacados.map((p) => <TarjetaProducto key={p.id} producto={p} alAgregar={agregarProducto} />)}</div> : <Vacio titulo="No hay productos destacados disponibles" />)}</section>
      <section className="seccion-video py-5" aria-labelledby="titulo-video"><div className="contenido-video"><p className="sobrelinea">// HAZLO TUYO</p><h2 className="titulo-seccion" id="titulo-video">Video relacionado</h2><p>Cada pieza cuenta.<br />El siguiente movimiento es tuyo.</p></div><div className="vista-previa-video">{videoActivo ? <iframe title="Video destacado de GameHub Store" src="https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ?autoplay=1" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <button className="boton-portada-video" type="button" aria-label="Reproducir video destacado" onClick={() => setVideoActivo(true)}><img src="/images/yt-thumbnail.jpg" alt="Vista previa del video: hardware de élite" /><span className="visualmente-oculto">Reproducir video</span></button>}</div></section>
    </div>
  );
}
