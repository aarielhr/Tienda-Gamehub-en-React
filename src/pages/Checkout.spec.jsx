// Prueba adicional de una vista completa: Checkout con el CarritoProvider real, MemoryRouter y un fetch simulado.
// La vista pide el perfil a user-service para precargar el despacho y, al confirmar, crea la orden con
// POST /api/ordenes (order-service coordina el pago y el stock). fetch responde como lo haría el API Gateway.
import { MemoryRouter, Route, Routes, useLocation, useParams } from 'react-router'
import CarritoProvider from '../context/CarritoProvider.jsx'
import { AuthContext } from '../context/useAuth.js'
import { aFechaISO } from '../logica/formato.js'
import { esperarRespuestas, hacerClic, montar } from '../pruebas/montar.js'
import Checkout from './Checkout.jsx'

const API = 'http://api.prueba'
const SESION = { usuario: { id: 3, nombre: 'Camila Rojas', rol: 'CLIENTE' }, rol: 'CLIENTE' }

// Vigente solo hoy: así la prueba no depende de la fecha en que se corra
const HOY = aFechaISO()
const GAMER10 = { codigo: 'GAMER10', porcentaje: 10, tope: 30000, inicio: HOY, termino: HOY }

// El carrito que llega al checkout: 3 teclados de $59.990 con el cupón GAMER10
const TECLADOS = { productoId: 4, nombre: 'Teclado mecánico Nimbo TKL', marca: 'Nimbo', sku: 'KB-NIM-TKL', imagen: 'teclado', precio: 59990, stock: 24, cantidad: 3 }
const CARRITO = { lineas: [TECLADOS], cupon: GAMER10 }

// GET /api/usuarios/perfil (PerfilDto de user-service)
const PERFIL = {
  id: 3,
  nombre: 'Camila Rojas',
  email: 'camila@gamehub.test',
  telefono: '912345678',
  region: 'Región Metropolitana de Santiago',
  comuna: 'Ñuñoa',
  direccion: 'Av. Los Aromos 1450, depto. 32',
  rol: 'CLIENTE',
}

// Respuesta falsa con la forma mínima que usa solicitar(): ok, status y json()
function respuesta(status, cuerpo) {
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(cuerpo) }
}

// POST /api/ordenes (OrdenDetalleDto de order-service) con los campos que usa la vista: el id y el pago
const orden = (pago) => ({ id: 19, numero: 'GH-2026-000019', pago: { ordenId: 19, ...pago } })

// Reemplaza a la vista Confirmacion: muestra el id de la ruta y el pago que llegó en el state de la navegación
function ConfirmacionDePrueba() {
  const { id } = useParams()
  const { state } = useLocation()
  return (
    <p id="confirmacion">
      Orden {id} · pago {state.orden.pago.estado}
    </p>
  )
}

function tienda() {
  return (
    <AuthContext value={SESION}>
      <CarritoProvider>
        <MemoryRouter initialEntries={['/checkout']}>
          <Routes>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/ordenes/:id/confirmacion" element={<ConfirmacionDePrueba />} />
          </Routes>
        </MemoryRouter>
      </CarritoProvider>
    </AuthContext>
  )
}

describe('pages/Checkout · vista completa', () => {
  let vista
  // Lo que responde el API Gateway en cada prueba; cada una cambia lo que necesita
  let responder
  const campo = (id) => vista.contenedor.querySelector(`#${id}`)
  const botonPagar = () => vista.contenedor.querySelector('button[type="submit"]')
  const carritoGuardado = () => JSON.parse(localStorage.getItem('carrito'))

  beforeEach(() => {
    localStorage.setItem('carrito', JSON.stringify(CARRITO))
    responder = {
      perfil: () => Promise.resolve(respuesta(200, PERFIL)),
      orden: () => Promise.resolve(respuesta(201, orden({ metodo: 'DEBITO', estado: 'APROBADO', detalle: 'Pago aprobado (simulado).' }))),
    }
    // Doble de fetch: responde según la ruta y el método, sin red ni backend
    spyOn(window, 'fetch').and.callFake((url, opciones) => {
      if (url === `${API}/api/usuarios/perfil`) return responder.perfil()
      if (url === `${API}/api/ordenes` && opciones.method === 'POST') return responder.orden()
      return Promise.reject(new TypeError(`Ruta que la prueba no espera: ${url}`))
    })
  })

  afterEach(() => {
    vista.desmontar()
    localStorage.removeItem('carrito')
  })

  it('mientras carga el perfil muestra «Cargando…» y luego precarga el despacho con los datos de user-service', async () => {
    vista = montar(tienda())
    expect(vista.texto()).toContain('Cargando tus datos de despacho…')

    await esperarRespuestas()

    expect(window.fetch.calls.mostRecent().args[0]).toBe('http://api.prueba/api/usuarios/perfil')
    expect(campo('nombre').value).toBe('Camila Rojas')
    expect(campo('correo').value).toBe('camila@gamehub.test')
    expect(campo('comuna').value).toBe('Ñuñoa')
    expect(campo('direccion').value).toBe('Av. Los Aromos 1450, depto. 32')
    expect(botonPagar().disabled).toBeFalse()
  })

  it('al confirmar crea la orden con POST /api/ordenes, vacía el carrito y lleva a la confirmación', async () => {
    vista = montar(tienda())
    await esperarRespuestas()
    // 3 × $59.990 = $179.970; el 10 % de GAMER10 son $17.997, menos que el tope de $30.000
    expect(vista.texto()).toContain('Cupón GAMER10')
    expect(botonPagar().textContent).toBe('Confirmar compra · $161.973')

    hacerClic(botonPagar())
    await esperarRespuestas()

    const [url, opciones] = window.fetch.calls.mostRecent().args
    expect(url).toBe('http://api.prueba/api/ordenes')
    expect(opciones.method).toBe('POST')
    expect(JSON.parse(opciones.body)).toEqual({
      lineas: [{ productoId: 4, cantidad: 3 }],
      cupon: 'GAMER10',
      metodoPago: 'DEBITO',
      despacho: {
        nombre: 'Camila Rojas',
        correo: 'camila@gamehub.test',
        telefono: '912345678',
        region: 'Región Metropolitana de Santiago',
        comuna: 'Ñuñoa',
        direccion: 'Av. Los Aromos 1450, depto. 32',
        depto: '',
        indicaciones: '',
      },
    })
    expect(campo('confirmacion').textContent).toBe('Orden 19 · pago APROBADO')
    expect(carritoGuardado().lineas).toEqual([])
  })

  it('si el pago se rechaza, conserva el carrito para intentar con otro método', async () => {
    // Un notebook de $1.149.990 supera el cupo simulado de la tarjeta de crédito
    const notebook = { productoId: 1, nombre: 'Notebook gamer Kairo Blade 15', marca: 'Kairo', sku: 'NB-KAI-B15', imagen: 'notebook', precio: 1149990, stock: 7, cantidad: 1 }
    localStorage.setItem('carrito', JSON.stringify({ lineas: [notebook], cupon: null }))
    responder.orden = () =>
      Promise.resolve(respuesta(201, orden({ metodo: 'CREDITO', estado: 'RECHAZADO', detalle: 'Rechazado: el total supera el cupo simulado de $1.000.000.' })))
    vista = montar(tienda())
    await esperarRespuestas()

    hacerClic(vista.contenedor.querySelector('input[value="CREDITO"]'))
    hacerClic(botonPagar())
    await esperarRespuestas()

    expect(JSON.parse(window.fetch.calls.mostRecent().args[1].body).metodoPago).toBe('CREDITO')
    expect(campo('confirmacion').textContent).toBe('Orden 19 · pago RECHAZADO')
    expect(carritoGuardado().lineas).toEqual([notebook])
  })

  it('si ya no hay stock suficiente (409), muestra el motivo, vuelve arriba y ofrece volver al carrito', async () => {
    responder.orden = () => Promise.resolve(respuesta(409, { mensaje: 'No hay stock suficiente de Teclado mecánico Nimbo TKL: quedan 2 unidades.' }))
    // Otro espía: reemplaza el desplazamiento de la ventana mientras dura la prueba
    spyOn(window, 'scrollTo')
    vista = montar(tienda())
    await esperarRespuestas()

    hacerClic(botonPagar())
    await esperarRespuestas()

    expect(vista.contenedor.querySelector('[role="alert"]').textContent).toBe('No hay stock suficiente de Teclado mecánico Nimbo TKL: quedan 2 unidades.')
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
    const enlacesAlCarrito = [...vista.contenedor.querySelectorAll('a[href="/carrito"]')].map((a) => a.textContent)
    expect(enlacesAlCarrito).toContain('Volver al carrito para ajustar las cantidades')
    expect(carritoGuardado().lineas).toEqual([TECLADOS])
  })

  it('con el carrito vacío no muestra el formulario y lleva al catálogo', async () => {
    localStorage.removeItem('carrito')
    vista = montar(tienda())
    await esperarRespuestas()

    expect(vista.texto()).toContain('No hay productos para pagar')
    expect(vista.contenedor.querySelector('form')).toBeNull()
    expect(vista.contenedor.querySelector('a[href="/catalogo"]').textContent).toBe('Ir al catálogo')
  })

  it('si no pudo cargar el perfil, muestra el formulario vacío para completarlo a mano', async () => {
    responder.perfil = () => Promise.reject(new TypeError('Failed to fetch'))
    vista = montar(tienda())
    await esperarRespuestas()

    expect(campo('nombre').value).toBe('')
    expect(campo('direccion').value).toBe('')
    expect(botonPagar().disabled).toBeTrue()
  })
})
