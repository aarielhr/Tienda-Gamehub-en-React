// Pruebas 1 a 6 del listado obligatorio (sección 9 del caso): reglas del carrito como funciones puras
import {
  agregarAlCarrito,
  aplicarCupon,
  calcularSubtotal,
  calcularTotal,
  cambiarCantidad,
  cuponVigente,
  quitarLinea,
  validarStock,
} from './carrito.js'

const audifonos = { id: 6, nombre: 'Audífonos Andesia Pulse 7.1', marca: 'Andesia', sku: 'HS-AND-P71', imagen: 'audifonos', precio: 44990, stock: 3 }
const teclado = { id: 4, nombre: 'Teclado mecánico Nimbo TKL', marca: 'Nimbo', sku: 'KB-NIM-TKL', imagen: 'teclado', precio: 59990, stock: 24 }

const GAMER10 = { codigo: 'GAMER10', porcentaje: 10, tope: 50000, inicio: '2026-11-01', termino: '2026-11-30' }

describe('logica/carrito.js', () => {
  // 1
  it('(1) calcularSubtotal suma precio por cantidad de todas las líneas del carrito', () => {
    const lineas = [
      { productoId: 6, precio: 44990, cantidad: 2 },
      { productoId: 4, precio: 59990, cantidad: 1 },
    ]
    expect(calcularSubtotal(lineas)).toBe(44990 * 2 + 59990)
    expect(calcularSubtotal([])).toBe(0)
  })

  // 2
  it('(2) agregarAlCarrito incrementa la cantidad si el producto ya está, en vez de duplicar la línea', () => {
    const primera = agregarAlCarrito([], teclado, 1)
    const segunda = agregarAlCarrito(primera.lineas, teclado, 2)

    expect(segunda.valido).toBeTrue()
    expect(segunda.lineas.length).toBe(1)
    expect(segunda.lineas[0].cantidad).toBe(3)
    // La función es pura: el arreglo anterior no cambia
    expect(primera.lineas[0].cantidad).toBe(1)
  })

  // 3
  describe('(3) validarStock', () => {
    it('impide una cantidad mayor al stock disponible del producto', () => {
      const resultado = validarStock(4, audifonos.stock)
      expect(resultado.valido).toBeFalse()
      expect(resultado.mensaje).toBe('Solo quedan 3 unidades disponibles.')
      expect(validarStock(3, audifonos.stock).valido).toBeTrue()
    })

    it('hace que agregarAlCarrito rechace superar el stock sumando lo que ya había', () => {
      const conDos = agregarAlCarrito([], audifonos, 2)
      const intento = agregarAlCarrito(conDos.lineas, audifonos, 2)
      expect(intento.valido).toBeFalse()
      expect(intento.lineas).toBe(conDos.lineas)
    })

    it('rechaza cantidades que no son enteros positivos', () => {
      expect(validarStock(0, 10).valido).toBeFalse()
      expect(validarStock(1.5, 10).valido).toBeFalse()
    })
  })

  // 4
  describe('(4) aplicarCupon', () => {
    it('calcula el descuento por porcentaje', () => {
      expect(aplicarCupon(59990, GAMER10)).toBe(5999)
    })

    it('respeta el tope definido en el cupón', () => {
      // 10 % de $1.149.990 sería $114.999, pero el tope es $50.000
      expect(aplicarCupon(1149990, GAMER10)).toBe(50000)
    })
  })

  // 5
  describe('(5) cuponVigente', () => {
    it('rechaza un cupón fuera de su rango de fechas', () => {
      expect(cuponVigente(GAMER10, new Date(2026, 9, 31))).toBeFalse() // 31-10, antes del inicio
      expect(cuponVigente(GAMER10, new Date(2026, 11, 1))).toBeFalse() // 01-12, después del término
    })

    it('acepta el cupón dentro del rango, con ambas fechas incluidas', () => {
      expect(cuponVigente(GAMER10, new Date(2026, 10, 1))).toBeTrue()
      expect(cuponVigente(GAMER10, new Date(2026, 10, 30, 23, 59))).toBeTrue()
    })
  })

  // 6
  describe('(6) calcularTotal', () => {
    it('resta el descuento al subtotal', () => {
      expect(calcularTotal(59990, 5999)).toBe(53991)
    })

    it('nunca retorna un total negativo', () => {
      expect(calcularTotal(10000, 15000)).toBe(0)
    })
  })
})

// Pruebas adicionales: el carrito valida el stock en cada cambio de cantidad (flujo integrador 2 del caso)
describe('logica/carrito.js · cambiarCantidad y quitarLinea', () => {
  const lineas = [
    { productoId: 6, nombre: 'Audífonos Andesia Pulse 7.1', precio: 44990, stock: 3, cantidad: 1 },
    { productoId: 4, nombre: 'Teclado mecánico Nimbo TKL', precio: 59990, stock: 24, cantidad: 2 },
  ]

  it('cambiarCantidad rechaza una cantidad mayor al stock y deja las líneas como estaban', () => {
    const resultado = cambiarCantidad(lineas, 6, 4)

    expect(resultado.valido).toBeFalse()
    expect(resultado.mensaje).toBe('Solo quedan 3 unidades disponibles.')
    expect(resultado.lineas).toBe(lineas)
  })

  it('cambiarCantidad cambia solo la línea indicada, sin modificar el arreglo anterior', () => {
    const resultado = cambiarCantidad(lineas, 6, 3)

    expect(resultado.valido).toBeTrue()
    expect(resultado.lineas.map((l) => l.cantidad)).toEqual([3, 2])
    expect(lineas[0].cantidad).toBe(1)
  })

  it('cambiarCantidad avisa si el producto no está en el carrito', () => {
    expect(cambiarCantidad(lineas, 99, 1)).toEqual(
      jasmine.objectContaining({ valido: false, mensaje: 'El producto no está en el carrito.' }),
    )
  })

  it('quitarLinea quita solo ese producto', () => {
    expect(quitarLinea(lineas, 6).map((l) => l.productoId)).toEqual([4])
    expect(lineas.length).toBe(2)
  })
})
