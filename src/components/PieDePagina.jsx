import { Link } from 'react-router'
import Icono from './Icono.jsx'
import { MarcaLogo } from './Logo.jsx'

const CATEGORIAS = [
  ['notebooks', 'Notebooks'],
  ['tarjetas-graficas', 'Tarjetas gráficas'],
  ['procesadores', 'Procesadores'],
  ['perifericos', 'Periféricos'],
  ['consolas', 'Consolas'],
  ['monitores', 'Monitores'],
  ['accesorios', 'Accesorios'],
]

export default function PieDePagina() {
  return (
    <footer className="pie mt-auto">
      <div className="contenedor pt-5">
        <div className="row g-4">
          <div className="col-12 col-md-6 col-lg-3 d-flex flex-column gap-3">
            <Link to="/" className="logo" aria-label="GameHub Store, ir al inicio">
              <MarcaLogo tamano={32} />
              <span className="logo-texto" style={{ fontSize: 20 }}>
                Game<span>Hub</span>
              </span>
            </Link>
            <p className="m-0 small texto-secundario">
              Notebooks, componentes, periféricos y consolas con el stock a la vista y despacho con seguimiento a todo Chile.
            </p>
            <ul className="list-unstyled m-0 d-flex flex-wrap gap-2" aria-label="Medios de pago simulados">
              {['Débito', 'Crédito', 'Transferencia'].map((medio) => (
                <li key={medio} className="small px-2 py-1 rounded-2" style={{ border: '1px solid var(--color-borde-control)' }}>
                  {medio}
                </li>
              ))}
            </ul>
          </div>
          <nav className="col-6 col-lg-3" aria-labelledby="pie-tienda">
            <h2 id="pie-tienda" className="h6 mb-3">
              Tienda
            </h2>
            <ul className="list-unstyled m-0 d-flex flex-column gap-2 small">
              {CATEGORIAS.map(([slug, nombre]) => (
                <li key={slug}>
                  <Link to={`/catalogo?categoria=${slug}`}>{nombre}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav className="col-6 col-lg-3" aria-labelledby="pie-ayuda">
            <h2 id="pie-ayuda" className="h6 mb-3">
              Ayuda
            </h2>
            <ul className="list-unstyled m-0 d-flex flex-column gap-2 small">
              <li>
                <Link to="/mis-ordenes">Seguimiento de despacho</Link>
              </li>
              <li>
                <Link to="/mis-ordenes">Garantías</Link>
              </li>
              <li>
                <Link to="/carrito">Tu carrito</Link>
              </li>
              <li>
                <Link to="/acceso">Crear una cuenta</Link>
              </li>
            </ul>
          </nav>
          <div className="col-12 col-md-6 col-lg-3">
            <h2 className="h6 mb-3">Atención</h2>
            <ul className="list-unstyled m-0 d-flex flex-column gap-2 small texto-secundario">
              <li className="d-flex gap-2">
                <Icono nombre="reloj" tamano={16} />
                Lunes a viernes, 9:00 a 18:00
              </li>
              <li className="d-flex gap-2">
                <Icono nombre="mensaje" tamano={16} />
                [Correo de contacto del equipo]
              </li>
              <li className="d-flex gap-2">
                <Icono nombre="ubicacion" tamano={16} />
                [Dirección de la tienda]
              </li>
            </ul>
          </div>
        </div>
        <div className="d-flex flex-wrap justify-content-between gap-2 py-3 mt-5 border-top small texto-secundario">
          <p className="m-0">© 2026 GameHub Store · Proyecto académico de DSY1104 Desarrollo Fullstack II</p>
          <p className="m-0">Precios en pesos chilenos (CLP), IVA incluido</p>
        </div>
      </div>
    </footer>
  )
}
