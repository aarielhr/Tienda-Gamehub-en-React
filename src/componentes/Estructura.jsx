import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { usarCarrito } from '../contexto/ProveedorCarrito.jsx';
import { useAuth } from '../context/useAuth.js';
import { NOMBRE_ROL } from '../logica/estados.js';
import AvisoSesion from '../components/AvisoSesion.jsx';

const enlaces = [
  ['/', 'Inicio'],
  ['/catalogo.html', 'Catálogo'],
  ['/carrito.html', 'Carrito'],
  ['/checkout.html', 'Checkout'],
  ['/ordenes.html', 'Mis Órdenes']
];

function Cabecera() {
  const { cantidadArticulos } = usarCarrito();
  const { usuario, rol, salir } = useAuth();
  const navegar = useNavigate();
  return (
    <>
<div className="cinta-tienda"><div className="container"><span><i aria-hidden="true" /> TU PRÓXIMO NIVEL, AQUÍ.</span><span>HARDWARE / PERIFÉRICOS / SETUP</span></div></div>
<nav className="navbar navbar-expand-lg navbar-dark barra-navegacion-tienda" aria-label="Navegación principal">
      <div className="container">
        <NavLink className="navbar-brand fw-bold" to="/" aria-label="GameHub Store"><span className="simbolo-marca" aria-hidden="true">G</span><span className="texto-marca">GAME<span>HUB</span><small>STORE</small></span></NavLink>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#main-navigation" aria-controls="main-navigation" aria-expanded="false" aria-label="Abrir navegación">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="main-navigation">
          <ul className="navbar-nav ms-auto">
            {enlaces.filter(([ruta]) => ruta !== '/checkout.html' && ruta !== '/ordenes.html').map(([ruta, titulo]) => (
              <li className="nav-item" key={ruta}>
                <NavLink end={ruta === '/'} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to={ruta}>
                  {titulo}{ruta === '/carrito.html' && <span className="ms-1">({cantidadArticulos})</span>}
                </NavLink>
              </li>
            ))}
            {rol === 'CLIENTE' && <li className="nav-item"><NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/mis-ordenes">Mis órdenes</NavLink></li>}
            {(rol === 'OPERADOR' || rol === 'ADMIN') && <li className="nav-item"><NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/operador">Panel operador</NavLink></li>}
            {rol === 'ADMIN' && <li className="nav-item"><NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/admin">Administración</NavLink></li>}
            {!usuario ? <li className="nav-item"><NavLink className="nav-link" to="/acceso">Ingresar / Registrarse</NavLink></li> : <li className="nav-item d-flex align-items-center gap-2"><span className="nav-link">{usuario.nombre} · {NOMBRE_ROL[rol]}</span><button className="btn btn-outline-danger btn-sm" type="button" onClick={() => { salir(); navegar('/'); }}>Cerrar sesión</button></li>}
          </ul>
        </div>
      </div>
    </nav>
</>
  );
}

function PiePagina() {
  return (
    <footer className="pie-tienda mt-auto">
      <div className="container"><div className="cabecera-pie"><span className="marca-pie">GAME<span>HUB</span> <small>STORE</small></span><span className="sobrelinea">HARDWARE PARA TU SIGUIENTE NIVEL.</span></div><div className="contenido-pie">
        <span>© 2026 GameHub Store. Todos los derechos reservados.</span>
        <span>Contacto: <a href="mailto:soporte@gamehubstore.cl">soporte@gamehubstore.cl</a></span>
        <div className="d-flex gap-3">
          <a href="https://twitter.com/gamehubstore" target="_blank" rel="noreferrer">Twitter</a>
          <a href="https://facebook.com/gamehubstore" target="_blank" rel="noreferrer">Facebook</a>
          <a href="https://instagram.com/gamehubstore" target="_blank" rel="noreferrer">Instagram</a>
        </div>
      </div>
    </div></footer>
  );
}

export default function Estructura() {
  const { aviso, limpiarAviso } = usarCarrito();
  const { pathname } = useLocation();

  useEffect(() => {
    const titulos = {
      '/': 'Inicio',
      '/index.html': 'Inicio',
      '/catalogo.html': 'Catálogo',
      '/carrito.html': 'Carrito',
      '/checkout.html': 'Checkout',
      '/ordenes.html': 'Mis Órdenes'
    };
    document.title = `${titulos[pathname] ?? 'Inicio'} - GameHub Store`;
  }, [pathname]);

  useEffect(() => {
    if (!aviso) return undefined;
    const timer = window.setTimeout(limpiarAviso, 3500);
    return () => window.clearTimeout(timer);
  }, [aviso, limpiarAviso]);

  return (
    <div className="contenedor-aplicacion">
      <Cabecera />
      {aviso && <div className="container pt-3"><div className="alert alert-info alert-dismissible mb-0" role="status">{aviso}<button className="btn-close" type="button" aria-label="Cerrar" onClick={limpiarAviso} /></div></div>}
      <AvisoSesion />
      <main className="container py-4 py-lg-5 flex-grow-1">
        <Outlet />
      </main>
      <PiePagina />
    </div>
  );
}
