// Prueba adicional de una vista completa: Carrito con el CarritoProvider real, MemoryRouter y un fetch simulado.
// Recorre el camino entero: la vista llama a services/catalogo.js, que usa solicitar() de services/api.js,
// que llama a fetch. Solo fetch se reemplaza: responde como lo haría el API Gateway, sin red ni backend.
import { MemoryRouter, Route, Routes } from 'react-router'
import CarritoProvider from '../context/CarritoProvider.jsx'
import { AuthContext } from '../context/useAuth.js'
import { aFechaISO } from '../logica/formato.js'
import { escribir, esperarRespuestas, hacerClic, montar, salir } from '../pruebas/montar.js'
import Carrito from './Carrito.jsx'

const SESION = { usuario: { id: 3, nombre: 'Camila Rojas', rol: 'CLIENTE' }, rol: 'CLIENTE' }

// El carrito que el cliente armó antes de entrar a la vista: CarritoProvider lo lee de localStorage
const GUARDADO = {
  lineas: [
    { productoId: 4, nombre: 'Teclado mecánico Nimbo TKL', marca: 'Nimbo', sku: 'KB-NIM-TKL', imagen: 'teclado', precio: 59990, stock: 24, cantidad: 2 },
    { productoId: 6, nombre: 'Audífonos Andesia Pulse 7.1', marca: 'Andesia', sku: 'HS-AND-P71', imagen: 'audifonos', precio: 49990, stock: 3, cantidad: 3 },
  ],
  cupon: null,
}

// Líneas de la respuesta de POST /api/carrito/validar (LineaValidadaDto de order-service).
// El teclado bajó de $59.990 a $54.990.
const TECLADO = { productoId: 4, nombre: 'Teclado mecánico Nimbo TKL', precio: 54990, stock: 24, cantidad: 2, disponible: true, mensaje: null }
const AUDIFONOS = { productoId: 6, nombre: 'Audífonos Andesia Pulse 7.1', precio: 49990, stock: 3, cantidad: 3, disponible: true, mensaje: null }
const AUDIFONOS_SIN_STOCK = { ...AUDIFONOS, stock: 2, disponible: false, mensaje: 'Solo quedan 2 unidades.' }

// Vigente solo hoy: así la prueba no depende de la fecha en que se corra
const HOY = aFechaISO()
const GAMER10 = { codigo: 'GAMER10', porcentaje: 10, tope: 30000, inicio: HOY, termino: HOY }

// Respuesta falsa con la forma mínima que usa solicitar(): ok, status y json()
function respuesta(status, cuerpo) {
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(cuerpo) }
}

// Cuerpo de POST /api/carrito/validar con los campos que usa la vista (ValidacionCarritoDto de order-service)
function validacion(...lineas) {
  return { lineas, cupon: null, mensajeCupon: null, valido: lineas.every((l) => l.disponible) }
}

function tienda() {
  return (
    <AuthContext value={SESION}>
      <CarritoProvider>
        <MemoryRouter initialEntries={['/carrito']}>
          <Routes>
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/checkout" element={<p>Vista de pago</p>} />
          </Routes>
        </MemoryRouter>
      </CarritoProvider>
    </AuthContext>
  )
}

describe('pages/Carrito · vista completa', () => {
  let vista
  const boton = (texto) => [...vista.contenedor.querySelectorAll('button')].find((b) => b.textContent.trim() === texto)
  const total = () => vista.contenedor.querySelector('dd.precio').textContent

  // Abre la vista y espera la revisión del carrito que pide al entrar
  async function entrar(revision) {
    window.fetch.and.resolveTo(respuesta(200, revision))
    vista = montar(tienda())
    await esperarRespuestas()
  }

  beforeEach(() => {
    localStorage.setItem('carrito', JSON.stringify(GUARDADO))
    // Doble de fetch: spyOn lo reemplaza solo mientras dura cada prueba
    spyOn(window, 'fetch')
  })

  afterEach(() => {
    vista.desmontar()
    localStorage.removeItem('carrito')
  })

  it('al entrar revisa el carrito con POST /api/carrito/validar: muestra el precio nuevo y avisa la línea sin stock', async () => {
    await entrar(validacion(TECLADO, AUDIFONOS_SIN_STOCK))

    const [url, opciones] = window.fetch.calls.mostRecent().args
    expect(url).toBe('http://api.prueba/api/carrito/validar')
    expect(opciones.method).toBe('POST')
    expect(JSON.parse(opciones.body)).toEqual({
      lineas: [
        { productoId: 4, cantidad: 2 },
        { productoId: 6, cantidad: 3 },
      ],
      cupon: null,
    })
    expect(vista.texto()).toContain('Precio unitario $54.990')
    expect(vista.texto()).toContain('Solo quedan 2 unidades.')
  })

  it('«Ir a pagar» vuelve a revisar el stock y, si alcanza, lleva al checkout', async () => {
    await entrar(validacion(TECLADO, AUDIFONOS))

    hacerClic(boton('Ir a pagar'))
    await esperarRespuestas()

    expect(window.fetch).toHaveBeenCalledTimes(2) // al entrar y al pagar
    expect(vista.texto()).toContain('Vista de pago')
  })

  it('si al pagar el stock ya no alcanza, se queda en el carrito y explica qué ajustar', async () => {
    await entrar(validacion(TECLADO, AUDIFONOS))

    // Mientras el cliente miraba su carrito, otra persona compró audífonos
    window.fetch.and.resolveTo(respuesta(200, validacion(TECLADO, AUDIFONOS_SIN_STOCK)))
    hacerClic(boton('Ir a pagar'))
    await esperarRespuestas()

    expect(vista.texto()).toContain('El stock cambió: ajusta las cantidades marcadas antes de pagar.')
    expect(vista.texto()).toContain('Solo quedan 2 unidades.')
    expect(vista.texto()).not.toContain('Vista de pago')
  })

  it('sin conexión con la API, «Ir a pagar» muestra el error y no avanza', async () => {
    await entrar(validacion(TECLADO, AUDIFONOS))

    window.fetch.and.rejectWith(new TypeError('Failed to fetch'))
    hacerClic(boton('Ir a pagar'))
    await esperarRespuestas()

    expect(vista.contenedor.querySelector('[role="alert"]').textContent).toContain('No pudimos conectar con el servidor.')
    expect(vista.texto()).not.toContain('Vista de pago')
  })

  it('aplica un cupón con GET /api/promociones/validar, el total baja y vuelve al quitarlo', async () => {
    await entrar(validacion(TECLADO, AUDIFONOS))
    expect(total()).toBe('$259.950') // 2 × $54.990 + 3 × $49.990

    window.fetch.and.resolveTo(respuesta(200, GAMER10))
    escribir(vista.contenedor.querySelector('#cupon'), 'gamer10')
    hacerClic(boton('Aplicar'))
    await esperarRespuestas()

    expect(window.fetch.calls.mostRecent().args[0]).toBe('http://api.prueba/api/promociones/validar?codigo=GAMER10')
    expect(vista.texto()).toContain('Cupón GAMER10 aplicado: 10 % de descuento con tope de $30.000.')
    expect(total()).toBe('$233.955') // el 10 % son $25.995, menos que el tope de $30.000

    hacerClic(vista.contenedor.querySelector('[aria-label="Quitar el cupón GAMER10"]'))
    expect(total()).toBe('$259.950')
  })

  it('un cupón rechazado muestra el motivo que envía el backend y no cambia el total', async () => {
    await entrar(validacion(TECLADO, AUDIFONOS))

    window.fetch.and.resolveTo(respuesta(400, { mensaje: 'El cupón CYBER25 venció el 31-10-2026.' }))
    escribir(vista.contenedor.querySelector('#cupon'), 'CYBER25')
    hacerClic(boton('Aplicar'))
    await esperarRespuestas()

    expect(vista.contenedor.querySelector('#cupon-mensaje').textContent).toBe('El cupón CYBER25 venció el 31-10-2026.')
    expect(vista.contenedor.querySelector('#cupon').getAttribute('aria-invalid')).toBe('true')
    expect(total()).toBe('$259.950')
  })

  it('si se escribe una cantidad mayor al stock, la línea lo explica y al salir vuelve a la cantidad aceptada', async () => {
    await entrar(validacion(TECLADO, AUDIFONOS))
    const cantidad = vista.contenedor.querySelector('#cantidad-6')

    escribir(cantidad, '5')
    expect(vista.texto()).toContain('Solo quedan 3 unidades disponibles.')
    expect(cantidad.getAttribute('aria-invalid')).toBe('true')

    salir(cantidad)
    expect(cantidad.value).toBe('3')
  })

  it('cambia la cantidad, quita una línea y, con confirmación, vacía el carrito', async () => {
    await entrar(validacion(TECLADO, AUDIFONOS))

    hacerClic(vista.contenedor.querySelector('[aria-label="Quitar una unidad de Audífonos Andesia Pulse 7.1"]'))
    expect(vista.texto()).toContain('2 productos · 4 unidades')
    hacerClic(vista.contenedor.querySelector('[aria-label="Agregar una unidad de Teclado mecánico Nimbo TKL"]'))
    expect(vista.texto()).toContain('2 productos · 5 unidades')

    hacerClic(vista.contenedor.querySelector('[aria-label="Quitar Teclado mecánico Nimbo TKL del carrito"]'))
    expect(vista.texto()).toContain('1 producto · 2 unidades')

    // Vaciar pide confirmación: con «No» el carrito sigue igual
    hacerClic(boton('Vaciar carrito'))
    hacerClic(boton('No'))
    expect(vista.texto()).toContain('1 producto · 2 unidades')

    hacerClic(boton('Vaciar carrito'))
    hacerClic(boton('Sí, vaciar'))
    expect(vista.texto()).toContain('Tu carrito está vacío')
    expect(JSON.parse(localStorage.getItem('carrito')).lineas).toEqual([])
  })
})
