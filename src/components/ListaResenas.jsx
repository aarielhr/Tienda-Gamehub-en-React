import { fecha, plural } from '../logica/formato.js'
import { calcularPromedio, distribucion, ordenarPorFecha, promedioTexto } from '../logica/resenas.js'
import Estrellas from './Estrellas.jsx'
import Icono from './Icono.jsx'
import Insignia from './Insignia.jsx'

// Reseñas de un producto: promedio, distribución y la lista de la más reciente a la más antigua
export default function ListaResenas({ resenas }) {
  if (!resenas.length) {
    return <p className="m-0 texto-secundario">Todavía no hay reseñas de este producto.</p>
  }
  const ordenadas = ordenarPorFecha(resenas)
  const promedio = calcularPromedio(resenas)
  const total = resenas.length

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex flex-wrap align-items-center gap-4 pb-4 border-bottom">
        <div className="d-flex flex-column gap-1">
          <span className="precio resena-promedio" style={{ fontSize: 52 }}>
            {promedioTexto(promedio)}
          </span>
          <Estrellas valor={promedio} />
          <span className="small texto-secundario">de 5 · {plural(total, 'reseña', 'reseñas')}</span>
        </div>
        <ul className="list-unstyled m-0 d-flex flex-column gap-1 flex-grow-1" style={{ minWidth: 220 }} aria-label="Distribución de puntuaciones">
          {distribucion(resenas).map((d) => (
            <li key={d.estrellas} className="d-flex align-items-center gap-2 small">
              <span className="texto-secundario" style={{ width: 70 }}>
                {plural(d.estrellas, 'estrella', 'estrellas')}
              </span>
              <span className="barra-distribucion" aria-hidden="true">
                <span style={{ width: `${(d.cantidad / total) * 100}%` }} />
              </span>
              <span className="texto-mono" style={{ width: 22, textAlign: 'right' }}>
                {d.cantidad}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <ol className="list-unstyled m-0 d-flex flex-column gap-4" aria-label="Reseñas, de la más reciente a la más antigua">
        {ordenadas.map((r) => (
          <li key={r.id}>
            <article className="d-flex flex-column gap-2">
              <header className="d-flex flex-wrap align-items-center gap-2">
                <span className="fw-semibold resena-autor">{r.autor}</span>
                <Insignia tono="ok" icono="check">
                  Compra verificada
                </Insignia>
                <time dateTime={r.fecha} className="ms-auto texto-mono small texto-secundario">
                  {fecha(r.fecha)}
                </time>
              </header>
              <Estrellas valor={r.puntuacion} />
              <p className="m-0">{r.comentario}</p>
            </article>
          </li>
        ))}
      </ol>
      <p className="m-0 small texto-secundario d-flex align-items-center gap-2">
        <Icono nombre="info" tamano={15} />
        Solo quienes compraron pueden reseñar, una vez por orden.
      </p>
    </div>
  )
}
