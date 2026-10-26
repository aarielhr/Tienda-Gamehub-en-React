import { Link } from 'react-router-dom';
import TarjetaProducto from '../componentes/TarjetaProducto.jsx';
import { usarCarrito } from '../contexto/ProveedorCarrito.jsx';
import { productosDestacados } from '../datos/productos.js';

export default function Inicio() {
  const { agregarProducto } = usarCarrito();
  return (
    <>
      <section className="panel-portada text-center rounded-4 p-4 p-md-5 mb-5">
        <img className="logo-portada mb-3" src="/images/logo.svg" alt="GameHub Store" />
        <h1 className="display-5 fw-bold">Bienvenido a GameHub Store</h1>
        <p className="lead text-secondary">El mejor hardware y periféricos para tu setup.</p>
        <Link className="btn btn-primary btn-lg" to="/catalogo.html">Ver catálogo</Link>
      </section>
      <section aria-labelledby="titulo-destacados">
        <h2 className="titulo-seccion mb-4" id="titulo-destacados">Productos destacados</h2>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
          {productosDestacados.map((producto) => <TarjetaProducto key={producto.id} producto={producto} alAgregar={agregarProducto} />)}
        </div>
      </section>
      <section className="mt-5">
        <h2 className="titulo-seccion mb-3">Video relacionado</h2>
        <a className="vista-previa-video d-block rounded-3 overflow-hidden" href="https://youtu.be/dQw4w9WgXcQ" target="_blank" rel="noreferrer" aria-label="Abrir video tecnológico">
          <img src="/images/yt-thumbnail.jpg" alt="Vista previa del video tecnológico" loading="lazy" />
          <span aria-hidden="true">▶</span>
        </a>
      </section>
    </>
  );
}
