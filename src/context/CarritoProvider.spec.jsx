// Prueba adicional de la regla del caso: «el carrito conserva su contenido al navegar entre vistas».
// Se montan dos vistas dentro del proveedor real; entre pruebas se limpia la clave "carrito" de localStorage.
// Al final, las acciones que usan las vistas Carrito y Checkout: cantidad, quitar, vaciar, cupón y sincronizar.
import { useEffect } from 'react'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router'
import { aFechaISO } from '../logica/formato.js'
import { ejecutar, hacerClic, montar } from '../pruebas/montar.js'
import CarritoProvider from './CarritoProvider.jsx'
import { useCarrito } from './useCarrito.js'

const TECLADO = { id: 4, nombre: 'Teclado mecánico Nimbo TKL', marca: 'Nimbo', sku: 'KB-NIM-TKL', imagen: 'teclado', precio: 59990, stock: 24 }
const AUDIFONOS = { id: 6, nombre: 'Audífonos Andesia Pulse 7.1', marca: 'Andesia', sku: 'HS-AND-P71', imagen: 'audifonos', precio: 49990, stock: 3 }

// Vigente solo hoy: así la prueba no depende de la fecha en que se corra
const HOY = aFechaISO()
const GAMER10 = { codigo: 'GAMER10', porcentaje: 10, tope: 30000, inicio: HOY, termino: HOY }

function Catalogo() {
  const carrito = useCarrito()
  const navegar = useNavigate()
  return (
    <>
      <button id="agregar" onClick={() => carrito.agregar(TECLADO, 2)}>
        Agregar
      </button>
      <button id="ir" onClick={() => navegar('/carrito')}>
        Ir al carrito
      </button>
    </>
  )
}

function Carrito() {
  const { unidades, total } = useCarrito()
  return (
    <p id="resumen">
      {unidades} unidades · {total}
    </p>
  )
}

const tienda = () => (
  <CarritoProvider>
    <MemoryRouter initialEntries={['/catalogo']}>
      <Routes>
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/carrito" element={<Carrito />} />
      </Routes>
    </MemoryRouter>
  </CarritoProvider>
)

describe('context/CarritoProvider', () => {
  let vista

  beforeEach(() => localStorage.removeItem('carrito'))

  afterEach(() => {
    vista.desmontar()
    localStorage.removeItem('carrito')
  })

  it('el carrito conserva su contenido al navegar entre vistas', () => {
    vista = montar(tienda())
    hacerClic(vista.contenedor.querySelector('#agregar'))
    hacerClic(vista.contenedor.querySelector('#ir'))

    expect(vista.contenedor.querySelector('#resumen').textContent).toBe('2 unidades · 119980')
  })

  it('también al recargar: se guarda en localStorage y se vuelve a leer', () => {
    vista = montar(tienda())
    hacerClic(vista.contenedor.querySelector('#agregar'))
    vista.desmontar()
    expect(JSON.parse(localStorage.getItem('carrito')).lineas[0].cantidad).toBe(2)

    // Montar de nuevo es lo mismo que recargar la página
    vista = montar(tienda())
    hacerClic(vista.contenedor.querySelector('#ir'))
    expect(vista.contenedor.querySelector('#resumen').textContent).toBe('2 unidades · 119980')
  })

  it('un carrito guardado con otro formato no rompe la tienda: parte vacío', () => {
    localStorage.setItem('carrito', '{dañado')
    vista = montar(tienda())
    hacerClic(vista.contenedor.querySelector('#ir'))

    expect(vista.contenedor.querySelector('#resumen').textContent).toBe('0 unidades · 0')
  })
})

// Las acciones se prueban con una «sonda»: un componente que no muestra nada y, después de cada
// render, le entrega a la prueba el valor del contexto. Así la prueba llama a cada acción y lee el carrito que resulta.
function Sonda({ alActualizar }) {
  const valor = useCarrito()
  useEffect(() => {
    alActualizar(valor)
  })
  return null
}

describe('context/CarritoProvider · acciones', () => {
  let vista
  let carrito

  beforeEach(() => {
    localStorage.removeItem('carrito')
    vista = montar(
      <CarritoProvider>
        <Sonda
          alActualizar={(valor) => {
            carrito = valor
          }}
        />
      </CarritoProvider>,
    )
  })

  afterEach(() => {
    vista.desmontar()
    localStorage.removeItem('carrito')
  })

  it('agregar y actualizarCantidad no pasan del stock: devuelven el mensaje y el carrito no cambia', () => {
    let resultado = ejecutar(() => carrito.agregar(AUDIFONOS, 4))
    expect(resultado).toEqual(jasmine.objectContaining({ valido: false, mensaje: 'Solo quedan 3 unidades disponibles.' }))
    expect(carrito.lineas).toEqual([])

    ejecutar(() => carrito.agregar(AUDIFONOS, 1))
    resultado = ejecutar(() => carrito.actualizarCantidad(6, 3))
    expect(resultado.valido).toBeTrue()
    expect(carrito.unidades).toBe(3)

    resultado = ejecutar(() => carrito.actualizarCantidad(6, 5))
    expect(resultado.mensaje).toBe('Solo quedan 3 unidades disponibles.')
    expect(carrito.unidades).toBe(3)
  })

  it('quitar saca solo esa línea y vaciar deja el carrito sin productos ni cupón', () => {
    ejecutar(() => carrito.agregar(TECLADO, 1))
    ejecutar(() => carrito.agregar(AUDIFONOS, 2))

    ejecutar(() => carrito.quitar(4))
    expect(carrito.lineas.map((l) => l.nombre)).toEqual(['Audífonos Andesia Pulse 7.1'])

    ejecutar(() => carrito.guardarCupon(GAMER10))
    ejecutar(() => carrito.vaciar())
    expect(carrito.lineas).toEqual([])
    expect(carrito.cupon).toBeNull()
    expect(JSON.parse(localStorage.getItem('carrito'))).toEqual({ lineas: [], cupon: null })
  })

  it('guardarCupon descuenta el 10 % y quitarCupon vuelve al total sin descuento', () => {
    ejecutar(() => carrito.agregar(TECLADO, 2)) // subtotal $119.980

    ejecutar(() => carrito.guardarCupon(GAMER10))
    expect(carrito.descuento).toBe(11998)
    expect(carrito.total).toBe(107982)

    ejecutar(() => carrito.quitarCupon())
    expect(carrito.cupon).toBeNull()
    expect(carrito.total).toBe(119980)
  })

  it('sincronizar cambia precio y stock con la respuesta de POST /api/carrito/validar y conserva las cantidades', () => {
    ejecutar(() => carrito.agregar(TECLADO, 2))
    ejecutar(() => carrito.agregar(AUDIFONOS, 1))

    // order-service respondió por el teclado: bajó a $54.990 y quedan 20. Los audífonos se agregaron
    // después de pedir la revisión, así que no vienen en la respuesta y quedan como estaban.
    ejecutar(() =>
      carrito.sincronizar({
        lineas: [{ productoId: 4, nombre: 'Teclado mecánico Nimbo TKL', precio: 54990, stock: 20, cantidad: 2, disponible: true, mensaje: null }],
        cupon: null,
        mensajeCupon: null,
      }),
    )

    const [teclado, audifonos] = carrito.lineas
    expect(teclado).toEqual(jasmine.objectContaining({ precio: 54990, stock: 20, cantidad: 2 }))
    expect(audifonos).toEqual(jasmine.objectContaining({ precio: 49990, stock: 3, cantidad: 1 }))
    expect(carrito.subtotal).toBe(159970)
  })

  it('sincronizar usa el cupón que devuelve el backend y quita el que rechazó', () => {
    ejecutar(() => carrito.agregar(TECLADO, 1))
    ejecutar(() => carrito.guardarCupon(GAMER10))
    const lineas = [{ productoId: 4, nombre: 'Teclado mecánico Nimbo TKL', precio: 59990, stock: 24, cantidad: 1, disponible: true, mensaje: null }]

    // promotion-service devolvió el cupón con un tope menor: manda el del backend
    ejecutar(() => carrito.sincronizar({ lineas, cupon: { ...GAMER10, tope: 5000 }, mensajeCupon: null }))
    expect(carrito.descuento).toBe(5000)

    // Sin cupón ni mensaje (la revisión se pidió antes de guardar el cupón), el carrito conserva el suyo
    ejecutar(() => carrito.sincronizar({ lineas, cupon: null, mensajeCupon: null }))
    expect(carrito.cupon.codigo).toBe('GAMER10')

    // Con mensajeCupon el cupón ya no sirve: se quita y el total vuelve al subtotal
    ejecutar(() => carrito.sincronizar({ lineas, cupon: null, mensajeCupon: 'El cupón GAMER10 ya alcanzó su tope de usos.' }))
    expect(carrito.cupon).toBeNull()
    expect(carrito.total).toBe(59990)
  })
})
