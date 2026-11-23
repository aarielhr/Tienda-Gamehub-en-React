// Prueba 8 del listado obligatorio
import { montar } from '../pruebas/montar.js'
import ResumenCarrito from './ResumenCarrito.jsx'

describe('ResumenCarrito', () => {
  let vista

  afterEach(() => vista.desmontar())

  it('(8) muestra el mensaje de carrito vacío cuando no hay líneas', () => {
    vista = montar(<ResumenCarrito lineas={[]} cupon={null} />)

    expect(vista.texto()).toContain('Tu carrito está vacío.')
    // Sin líneas no se ofrece el campo de cupón
    expect(vista.contenedor.querySelector('#cupon')).toBeNull()
  })

  it('con líneas, muestra el total calculado con logica/carrito.js', () => {
    const lineas = [{ productoId: 4, nombre: 'Teclado mecánico Nimbo TKL', precio: 59990, stock: 24, cantidad: 2 }]
    vista = montar(<ResumenCarrito lineas={lineas} cupon={null} />)

    expect(vista.texto()).not.toContain('Tu carrito está vacío.')
    expect(vista.texto()).toContain('$119.980')
  })
})
