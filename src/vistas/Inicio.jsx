import { Link } from 'react-router-dom';
import TarjetaProducto from '../componentes/TarjetaProducto.jsx';
import { usarCarrito } from '../contexto/ProveedorCarrito.jsx';
import { productosDestacados } from '../datos/productos.js';

function IlustracionSetup() {
  return (
    <div className="escena-setup" aria-hidden="true">
      <div className="orbita-setup orbita-uno" /><div className="orbita-setup orbita-dos" />
      <span className="referencia-setup">GH / SETUP 01</span>
      <div className="teclado-setup">
        {[14, 14, 13, 12, 8].map((cantidad, fila) => (
          <div className={`fila-teclado fila-${fila}`} key={fila}>
            {Array.from({ length: cantidad }, (_, tecla) => (
              <span className="tecla-setup" key={tecla}>{fila === 0 ? ['ESC', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '−', '+', '⌫'][tecla] : ''}</span>
            ))}
          </div>
        ))}
      </div>
      <div className="leyenda-setup"><span /> DISEÑADO PARA TU PRÓXIMO NIVEL</div>
    </div>
  );
}

const categoriasPortada = [
  { numero: '01', titulo: 'Precisión', detalle: 'Mouse', icono: 'mouse' },
  { numero: '02', titulo: 'Control', detalle: 'Mousepads', icono: 'pad' },
  { numero: '03', titulo: 'Inmersión', detalle: 'Monitores', icono: 'monitor' }
];

export default function Inicio() {
  const { agregarProducto } = usarCarrito();
  return (
    <div className="pagina-inicio">
      <section className="panel-portada">
        <div className="contenido-portada">
          <p className="sobrelinea"><span /> EL SIGUIENTE NIVEL EMPIEZA CONTIGO</p>
          <h1 className="titulo-portada">Bienvenido a <span>GameHub Store</span></h1>
          <p className="descripcion-portada">El mejor hardware y periféricos para tu setup.</p>
          <Link className="btn btn-primary enlace-portada" to="/catalogo.html">Ver catálogo <span aria-hidden="true">↗</span></Link>
          <p className="nota-portada"><span aria-hidden="true">＋</span> MENOS DISTRACCIONES. MÁS JUEGO.</p>
        </div>
        <IlustracionSetup />
        <div className="pie-portada"><span>PRECISIÓN. CONTROL. INMERSIÓN.</span><span>ENCUENTRA TU PRÓXIMO NIVEL <span aria-hidden="true">↓</span></span></div>
      </section>
      <div className="categorias-portada">
        {categoriasPortada.map(({ numero, titulo, detalle, icono }) => (
          <Link className="categoria-portada" to="/catalogo.html" key={numero}>
            <span className={`icono-categoria icono-${icono}`} aria-hidden="true" />
            <span className="numero-categoria" aria-hidden="true">{numero}</span>
            <span><strong>{titulo}</strong><small>{detalle}</small></span>
            <span className="flecha-categoria" aria-hidden="true">↗</span>
          </Link>
        ))}
      </div>
      <section className="seccion-destacados" aria-labelledby="titulo-destacados">
        <div className="encabezado-seccion">
          <div><p className="sobrelinea">// SELECCIÓN GAMEHUB</p><h2 className="titulo-seccion" id="titulo-destacados">Productos destacados</h2></div>
          <Link className="enlace-editorial" to="/catalogo.html">Ver todo el catálogo <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
          {productosDestacados.map((producto) => <TarjetaProducto key={producto.id} producto={producto} alAgregar={agregarProducto} />)}
        </div>
        <p className="nota-seleccion">Encuentra tu próxima pieza. Construye tu propio nivel.</p>
      </section>
      <section className="seccion-video" aria-labelledby="titulo-video">
        <div className="contenido-video"><p className="sobrelinea">// HAZLO TUYO</p><h2 className="titulo-seccion" id="titulo-video">Video relacionado</h2><p>Cada pieza cuenta.<br />El siguiente movimiento es tuyo.</p><Link className="enlace-editorial" to="/catalogo.html">Encuentra tu equipo <span aria-hidden="true">↗</span></Link></div>
        <a className="vista-previa-video" href="https://youtu.be/TP8rDXQdjg8" target="_blank" rel="noreferrer" aria-label="Abrir video tecnológico">
          <img src="/images/yt-thumbnail.jpg" alt="Vista previa del video tecnológico" loading="lazy" />
          <span aria-hidden="true">▶</span>
        </a>
      </section>
    </div>
  );
}