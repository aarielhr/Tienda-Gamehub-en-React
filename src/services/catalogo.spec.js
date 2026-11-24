// Pruebas adicionales: services/catalogo.js arma cada producto con tres microservicios: sus datos y precio
// (product-service), su stock (inventory-service) y su puntaje (review-service).
// spyOn(window, 'fetch') reemplaza a la red y responde según la ruta, como lo haría el API Gateway.
import { listarCategorias, listarProductos, listarResenas, obtenerProducto } from './catalogo.js'

const API = 'http://api.prueba'

// Respuesta falsa con la forma mínima que usa solicitar(): ok, status y json()
function respuesta(status, cuerpo) {
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(cuerpo) }
}

// Doble del API Gateway: cada ruta tiene su respuesta; una ruta que la prueba no espera responde 404
function gateway(rutas) {
  spyOn(window, 'fetch').and.callFake((url) =>
    Promise.resolve(rutas[url.replace(API, '')] ?? respuesta(404, { mensaje: 'Ruta sin respuesta en la prueba.' })),
  )
}

// Las rutas que pidió el frontend, en orden
const rutasPedidas = () => window.fetch.calls.allArgs().map(([url]) => url.replace(API, ''))

// Lo que responde product-service (sin stock ni puntaje)
const TECLADO = { id: 4, sku: 'KB-NIM-TKL', nombre: 'Teclado mecánico Nimbo TKL', precio: 59990, precioNormal: null, imagen: 'teclado' }
const AUDIFONOS = { id: 6, sku: 'HS-AND-P71', nombre: 'Audífonos Andesia Pulse 7.1', precio: 49990, precioNormal: 54990, imagen: 'audifonos' }

describe('services/catalogo.js', () => {
  it('listarProductos junta en cada producto su stock (inventory-service) y su puntaje (review-service)', async () => {
    gateway({
      '/api/productos': respuesta(200, [TECLADO, AUDIFONOS]),
      '/api/inventario/stock?productos=4,6': respuesta(200, [
        { productoId: 4, stock: 24 },
        { productoId: 6, stock: 3 },
      ]),
      '/api/resenas/resumen?productos=4,6': respuesta(200, [{ productoId: 4, puntuacion: 4.5, cantidad: 2 }]),
    })

    const [teclado, audifonos] = await listarProductos()

    expect(teclado).toEqual({ ...TECLADO, imagen: '/images/Teclado Ajazz AK820.avif', stock: 24, puntuacion: 4.5, cantidadResenas: 2 })
    // Los audífonos no tienen reseñas: puntaje 0, así que la tarjeta muestra «Sin reseñas todavía»
    expect(audifonos).toEqual({ ...AUDIFONOS, imagen: '/images/audifonos-andesia.jpg', stock: 3, puntuacion: 0, cantidadResenas: 0 })
  })

  it('si review-service no responde, el catálogo se muestra igual, sin estrellas', async () => {
    gateway({
      '/api/productos': respuesta(200, [TECLADO]),
      '/api/inventario/stock?productos=4': respuesta(200, [{ productoId: 4, stock: 24 }]),
      '/api/resenas/resumen?productos=4': respuesta(503, { mensaje: 'El servicio de reseñas no está disponible.' }),
    })

    const [teclado] = await listarProductos()

    expect(teclado.stock).toBe(24)
    expect(teclado.puntuacion).toBe(0)
    expect(teclado.cantidadResenas).toBe(0)
  })

  it('un producto sin registro de stock queda en 0, y una categoría vacía no consulta a los otros servicios', async () => {
    gateway({
      '/api/productos?categoria=perifericos': respuesta(200, [TECLADO, AUDIFONOS]),
      '/api/inventario/stock?productos=4,6': respuesta(200, [{ productoId: 4, stock: 24 }]),
      '/api/resenas/resumen?productos=4,6': respuesta(200, []),
      '/api/productos?categoria=sillas': respuesta(200, []),
    })

    const [, audifonos] = await listarProductos('perifericos')
    expect(audifonos.stock).toBe(0)

    const antes = window.fetch.calls.count()
    expect(await listarProductos('sillas')).toEqual([])
    // Una sola petición más: sin productos no hay a quién buscarle stock ni puntaje
    expect(window.fetch.calls.count() - antes).toBe(1)
  })

  it('obtenerProducto completa un solo producto con su stock y su puntaje', async () => {
    gateway({
      '/api/productos/6': respuesta(200, AUDIFONOS),
      '/api/inventario/stock?productos=6': respuesta(200, [{ productoId: 6, stock: 3 }]),
      '/api/resenas/resumen?productos=6': respuesta(200, [{ productoId: 6, puntuacion: 5, cantidad: 1 }]),
    })

    expect(await obtenerProducto(6)).toEqual({ ...AUDIFONOS, imagen: '/images/audifonos-andesia.jpg', stock: 3, puntuacion: 5, cantidadResenas: 1 })
  })

  it('listarResenas y listarCategorias piden la ruta de su microservicio', async () => {
    const resena = { id: 1, productoId: 4, autor: 'Diego P.', puntuacion: 5, comentario: 'Llegó rápido y funciona perfecto.' }
    const categoria = { id: 4, nombre: 'Periféricos', slug: 'perifericos' }
    gateway({
      '/api/productos/4/resenas': respuesta(200, [resena]),
      '/api/categorias': respuesta(200, [categoria]),
    })

    expect(await listarResenas(4)).toEqual([resena])
    expect(await listarCategorias()).toEqual([categoria])
    expect(rutasPedidas()).toEqual(['/api/productos/4/resenas', '/api/categorias'])
  })
})
