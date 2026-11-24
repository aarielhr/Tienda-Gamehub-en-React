// Pruebas adicionales: useCarga entrega los tres estados de una vista que carga datos: cargando, error y datos.
// Se prueba con un componente mínimo y un servicio falso: un espía, o promesas que la prueba resuelve cuando quiere.
import { esperarRespuestas, hacerClic, montar } from '../pruebas/montar.js'
import { useCarga } from './useCarga.js'

// Una vista mínima: pide los productos de una categoría y muestra en qué estado está
function Lista({ cargar, categoria = 'todas' }) {
  const { datos, cargando, error, recargar } = useCarga(() => cargar(categoria), [categoria])
  return (
    <>
      <p id="estado">{cargando ? 'Cargando…' : error ? `Error: ${error.message}` : `Productos: ${datos.join(', ')}`}</p>
      <p id="anteriores">{cargando && datos ? `Mientras tanto: ${datos.join(', ')}` : ''}</p>
      <button type="button" onClick={recargar}>
        Recargar
      </button>
    </>
  )
}

describe('hooks/useCarga.js', () => {
  let vista
  const estado = () => vista.contenedor.querySelector('#estado').textContent
  const anteriores = () => vista.contenedor.querySelector('#anteriores').textContent
  const recargar = () => hacerClic(vista.contenedor.querySelector('button'))

  afterEach(() => vista.desmontar())

  it('primero está cargando y después entrega los datos', async () => {
    const cargar = jasmine.createSpy('cargar').and.resolveTo(['Teclado', 'Mouse'])
    vista = montar(<Lista cargar={cargar} />)
    expect(estado()).toBe('Cargando…')

    await esperarRespuestas()

    expect(estado()).toBe('Productos: Teclado, Mouse')
    expect(cargar).toHaveBeenCalledOnceWith('todas')
  })

  it('si el servicio falla entrega el error; al recargar pide de nuevo y conserva los datos anteriores mientras carga', async () => {
    // Primera vez sin conexión, segunda vez responde y la tercera queda esperando
    let intentos = 0
    const cargar = jasmine.createSpy('cargar').and.callFake(() => {
      intentos += 1
      if (intentos === 1) return Promise.reject(new Error('Sin conexión con la API'))
      if (intentos === 2) return Promise.resolve(['Teclado'])
      return new Promise(() => {})
    })
    vista = montar(<Lista cargar={cargar} />)
    await esperarRespuestas()
    expect(estado()).toBe('Error: Sin conexión con la API')

    recargar()
    await esperarRespuestas()
    expect(estado()).toBe('Productos: Teclado')

    // Mientras llega la tercera respuesta, la vista no parpadea: sigue teniendo los datos de antes
    recargar()
    expect(estado()).toBe('Cargando…')
    expect(anteriores()).toBe('Mientras tanto: Teclado')
    expect(cargar).toHaveBeenCalledTimes(3)
  })

  it('si cambia la categoría antes de que llegue la respuesta anterior, descarta esa respuesta vieja', async () => {
    // Cada pedido queda pendiente hasta que la prueba lo resuelve
    const pendientes = {}
    const cargar = (categoria) =>
      new Promise((resolver) => {
        pendientes[categoria] = resolver
      })
    vista = montar(<Lista cargar={cargar} categoria="consolas" />)
    vista.actualizar(<Lista cargar={cargar} categoria="perifericos" />)

    pendientes.perifericos(['Teclado', 'Mouse'])
    await esperarRespuestas()
    expect(estado()).toBe('Productos: Teclado, Mouse')

    // La respuesta de consolas llega tarde: ya no corresponde a la categoría que se ve
    pendientes.consolas(['Consola portátil Austral Go'])
    await esperarRespuestas()
    expect(estado()).toBe('Productos: Teclado, Mouse')
  })
})
