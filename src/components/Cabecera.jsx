import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../context/useAuth.js'
import { useCarrito } from '../context/useCarrito.js'
import { NOMBRE_ROL } from '../logica/estados.js'
import { iniciales } from '../logica/formato.js'
import { listarCategorias } from '../services/catalogo.js'
import Icono from './Icono.jsx'
import Logo from './Logo.jsx'

// Menú común a todas las vistas. Los enlaces de los paneles solo aparecen para el rol que corresponde.
export default function Cabecera() {
  const { usuario, rol, salir } = useAuth()
  const { unidades } = useCarrito()
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const [busqueda, setBusqueda] = useState('')
  const [menuAbiertoEn, setMenuAbiertoEn] = useState(null)
  const [categorias, setCategorias] = useState([])

  useEffect(() => {
    listarCategorias()
      .then(setCategorias)
      .catch(() => setCategorias([]))
  }, [])

  // En teléfonos el menú se cierra al navegar: queda abierto solo en la ruta donde se abrió
  const rutaActual = ubicacion.pathname + ubicacion.search
  const menuAbierto = menuAbiertoEn === rutaActual

  const catalogo = ubicacion.pathname === '/catalogo' || ubicacion.pathname === '/catalogo.html'
  const categoriaActual = catalogo ? new URLSearchParams(ubicacion.search).get('categoria') : null

  function buscar(e) {
    e.preventDefault()
    const texto = busqueda.trim()
    navegar(texto ? `/catalogo?q=${encodeURIComponent(texto)}` : '/catalogo')
  }

  function cerrarSesion() {
    salir()
    navegar('/')
  }

  const claseNav = ({ isActive }) => `enlace-nav ${isActive ? 'active' : ''}`

  return (
    <header className="cabecera">
      <div className="barra-utilidad">
        <div className="contenedor d-flex flex-wrap align-items-center justify-content-between gap-2 py-2">
          <p className="m-0 d-flex flex-wrap gap-3">
            <span className="d-inline-flex align-items-center gap-2">
              <Icono nombre="camion" tamano={16} />
              Envíos a todo Chile con seguimiento
            </span>
            <span className="d-none d-sm-inline-flex align-items-center gap-2">
              <Icono nombre="escudo" tamano={16} />
              Garantía de 6 meses
            </span>
          </p>
          {usuario && (
            <span className="d-inline-flex align-items-center gap-2">
              <Icono nombre="candado" tamano={15} />
              Sesión como {NOMBRE_ROL[rol]}
            </span>
          )}
        </div>
      </div>

      <div className="contenedor d-flex flex-wrap align-items-center gap-3 py-3">
        <Link to="/" className="logo" aria-label="GameHub Store, ir al inicio">
          <Logo />
        </Link>

        <form role="search" onSubmit={buscar} className="buscador d-flex flex-grow-1 order-3 order-lg-2" style={{ minWidth: 240 }}>
          <label htmlFor="buscar-productos" className="visualmente-oculto">
            Buscar productos
          </label>
          <input
            id="buscar-productos"
            type="search"
            className="form-control"
            placeholder="Buscar notebooks, tarjetas gráficas, periféricos…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button type="submit" className="btn" aria-label="Buscar">
            <Icono nombre="buscar" tamano={20} />
          </button>
        </form>

        <div className="d-flex align-items-center gap-1 ms-auto order-2 order-lg-3">
          {!usuario && (
            <NavLink to="/acceso" className="enlace-cuenta">
              <Icono nombre="usuario" tamano={20} />
              Ingresar
            </NavLink>
          )}
          {rol === 'CLIENTE' && (
            <NavLink to="/mis-ordenes" className="enlace-cuenta">
              <Icono nombre="caja" tamano={20} />
              <span className="d-none d-md-inline">Mis órdenes</span>
            </NavLink>
          )}
          {usuario && (
            <>
              <span className="d-none d-md-flex align-items-center gap-2 px-2">
                <span className="avatar" aria-hidden="true">
                  {iniciales(usuario.nombre)}
                </span>
                <span className="d-flex flex-column lh-sm">
                  <span className="small fw-semibold">{usuario.nombre}</span>
                  <span className="small texto-secundario">{NOMBRE_ROL[rol]}</span>
                </span>
              </span>
              <button type="button" className="btn btn-link texto-secundario" onClick={cerrarSesion} aria-label="Cerrar sesión" title="Cerrar sesión">
                <Icono nombre="salir" tamano={20} />
              </button>
            </>
          )}
          <NavLink to="/carrito" className="boton-carrito" aria-label={`Carrito, ${unidades} ${unidades === 1 ? 'unidad' : 'unidades'}`}>
            <Icono nombre="carrito" tamano={20} />
            <span className="d-none d-sm-inline">Carrito</span>
            <span className="contador">{unidades}</span>
          </NavLink>
          <button
            type="button"
            className="btn btn-outline-secondary d-lg-none ms-1"
            onClick={() => setMenuAbiertoEn(menuAbierto ? null : rutaActual)}
            aria-expanded={menuAbierto}
            aria-controls="nav-principal"
            aria-label="Abrir menú de categorías"
          >
            <Icono nombre="menu" tamano={20} />
          </button>
        </div>
      </div>

      <nav id="nav-principal" aria-label="Principal" className={`nav-principal ${menuAbierto ? '' : 'cerrada'}`}>
        <div className="contenedor d-flex flex-column flex-lg-row justify-content-between gap-lg-4">
          <ul className="lista-nav">
            <li>
              <NavLink to="/" end className={claseNav}>
                Inicio
              </NavLink>
            </li>
            <li>
              <Link
                to="/catalogo"
                className={`enlace-nav ${catalogo && !categoriaActual ? 'active' : ''}`}
                aria-current={catalogo && !categoriaActual ? 'page' : undefined}
              >
                Catálogo
              </Link>
            </li>
            {categorias.map((c) => (
              <li key={c.slug}>
                <Link
                  to={`/catalogo.html?categoria=${c.slug}`}
                  className={`enlace-nav ${categoriaActual === c.slug ? 'active' : ''}`}
                  aria-current={categoriaActual === c.slug ? 'page' : undefined}
                >
                  {c.nombre}
                </Link>
              </li>
            ))}
          </ul>
          {(rol === 'OPERADOR' || rol === 'ADMIN') && (
            <ul className="lista-nav">
              <li>
                <NavLink to="/operador" className={claseNav}>
                  <Icono nombre="candado" tamano={16} />
                  Panel del operador
                </NavLink>
              </li>
              {rol === 'ADMIN' && (
                <li>
                  <NavLink to="/admin" className={claseNav}>
                    <Icono nombre="candado" tamano={16} />
                    Administración
                  </NavLink>
                </li>
              )}
            </ul>
          )}
        </div>
      </nav>
    </header>
  )
}
