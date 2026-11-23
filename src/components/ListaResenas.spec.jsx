// Prueba 10 del listado obligatorio
import { montar } from '../pruebas/montar.js'
import ListaResenas from './ListaResenas.jsx'

const RESENAS = [
  { id: 1, autor: 'Martina C.', puntuacion: 5, comentario: 'Llegó rápido y funciona perfecto.', fecha: '2026-10-01T10:00:00' },
  { id: 2, autor: 'Diego P.', puntuacion: 3, comentario: 'Buen sonido, el micrófono es justo.', fecha: '2026-11-05T09:00:00' },
  { id: 3, autor: 'Sofía V.', puntuacion: 4, comentario: 'Cómodos para jugar varias horas.', fecha: '2026-10-20T18:30:00' },
]

describe('ListaResenas', () => {
  let vista

  afterEach(() => vista.desmontar())

  it('(10) ordena las reseñas por fecha descendente y calcula el promedio de puntuación', () => {
    vista = montar(<ListaResenas resenas={RESENAS} />)

    const autores = [...vista.contenedor.querySelectorAll('.resena-autor')].map((el) => el.textContent)
    expect(autores).toEqual(['Diego P.', 'Sofía V.', 'Martina C.'])

    // (5 + 3 + 4) / 3 = 4,0
    expect(vista.contenedor.querySelector('.resena-promedio').textContent).toBe('4,0')
  })

  it('sin reseñas muestra el mensaje correspondiente', () => {
    vista = montar(<ListaResenas resenas={[]} />)
    expect(vista.texto()).toContain('Todavía no hay reseñas de este producto.')
  })
})
