// Prueba 7 del listado obligatorio
import { MemoryRouter } from 'react-router'
import { hacerClic, montar } from '../pruebas/montar.js'
import TarjetaProducto from './TarjetaProducto.jsx'

const mouse = {
  id: 5,
  sku: 'MS-NIM-AERO',
  nombre: 'Mouse inalámbrico Nimbo Aero',
  marca: 'Nimbo',
  categoria: 'Periféricos',
  categoriaSlug: 'perifericos',
  precio: 39990,
  precioNormal: null,
  stock: 0,
  imagen: 'mouse',
  resumen: 'Sensor de 26.000 DPI y 60 g de peso.',
  puntuacion: 4.5,
  cantidadResenas: 2,
}

// TarjetaProducto usa Link, que necesita un router alrededor
const conRouter = (elemento) => <MemoryRouter>{elemento}</MemoryRouter>

describe('TarjetaProducto', () => {
  let vista

  afterEach(() => vista.desmontar())

  it('(7) renderiza nombre, precio y el aviso de producto sin stock', () => {
    const onAgregar = jasmine.createSpy('onAgregar')
    vista = montar(conRouter(<TarjetaProducto producto={mouse} onAgregar={onAgregar} />))

    expect(vista.contenedor.querySelector('h3').textContent).toBe('Mouse inalámbrico Nimbo Aero')
    expect(vista.contenedor.querySelector('.precio').textContent).toBe('$39.990')
    expect(vista.texto()).toContain('Sin stock')

    const boton = vista.contenedor.querySelector('button')
    expect(boton.disabled).toBeTrue()
    hacerClic(boton)
    expect(onAgregar).not.toHaveBeenCalled()
  })

  it('con stock, el botón llama a onAgregar con el producto', () => {
    const onAgregar = jasmine.createSpy('onAgregar')
    const conStock = { ...mouse, stock: 15 }
    vista = montar(conRouter(<TarjetaProducto producto={conStock} onAgregar={onAgregar} />))

    expect(vista.texto()).not.toContain('Sin stock')
    hacerClic(vista.contenedor.querySelector('button'))
    expect(onAgregar).toHaveBeenCalledOnceWith(conStock)
  })

  it('en oferta muestra el precio normal tachado y el porcentaje de descuento', () => {
    // Audífonos Andesia Pulse 7.1: $49.990 en oferta (normal $54.990), 3 unidades y sin reseñas
    const audifonos = { ...mouse, id: 6, nombre: 'Audífonos Andesia Pulse 7.1', precio: 49990, precioNormal: 54990, stock: 3, cantidadResenas: 0 }
    vista = montar(conRouter(<TarjetaProducto producto={audifonos} />))

    expect(vista.contenedor.querySelector('.precio-oferta').textContent).toBe('$49.990')
    expect(vista.contenedor.querySelector('.precio-antes').textContent).toBe('Precio normal: $54.990')
    expect(vista.texto()).toContain('−9 %')
    expect(vista.texto()).toContain('Quedan 3 unidades')
    expect(vista.texto()).toContain('Sin reseñas todavía')
  })
})
