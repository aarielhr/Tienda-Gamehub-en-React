import { Link } from 'react-router'

// Ruta de navegación: [{ texto, a }] — el último elemento es la página actual
export default function Migas({ pasos }) {
  return (
    <nav aria-label="Ruta de navegación">
      <ol className="d-flex flex-wrap gap-2 list-unstyled m-0 small texto-secundario">
        {pasos.map((paso, i) => {
          const ultimo = i === pasos.length - 1
          return (
            <li key={paso.texto} className="d-flex gap-2">
              {ultimo ? (
                <span aria-current="page" className="text-body">
                  {paso.texto}
                </span>
              ) : (
                <>
                  <Link to={paso.a} className="texto-secundario">
                    {paso.texto}
                  </Link>
                  <span aria-hidden="true">/</span>
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
