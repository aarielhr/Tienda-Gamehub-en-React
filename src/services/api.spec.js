// Pruebas adicionales: solicitar() aislado de la red con un espía en lugar de fetch.
// En las pruebas, API_URL vale 'http://api.prueba' (src/pruebas/config.prueba.js).
import { ErrorApi, mensajePorEstado, solicitar } from './api.js'

// Respuesta falsa con la forma mínima que usa solicitar(): ok, status y json()
function respuesta(status, cuerpo) {
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(cuerpo) }
}

describe('services/api.js · solicitar', () => {
  it('arma la URL, agrega el token y envía el cuerpo como JSON', async () => {
    const traer = jasmine.createSpy('fetch').and.resolveTo(respuesta(201, { id: 7 }))

    const datos = await solicitar('/api/ordenes', { metodo: 'POST', cuerpo: { cupon: 'GAMER10' }, sesion: { token: 'abc.def.ghi' } }, traer)

    expect(datos).toEqual({ id: 7 })
    const [url, opciones] = traer.calls.mostRecent().args
    expect(url).toBe('http://api.prueba/api/ordenes')
    expect(opciones.method).toBe('POST')
    expect(opciones.headers.Authorization).toBe('Bearer abc.def.ghi')
    expect(JSON.parse(opciones.body)).toEqual({ cupon: 'GAMER10' })
  })

  it('traduce un error del backend en ErrorApi con el mensaje y los errores por campo', async () => {
    const traer = jasmine
      .createSpy('fetch')
      .and.resolveTo(respuesta(400, { mensaje: 'Revisa los datos del despacho.', errores: { 'despacho.telefono': 'El teléfono debe tener 9 dígitos y empezar con 9.' } }))

    const error = await solicitar('/api/ordenes', { metodo: 'POST', cuerpo: {}, sesion: null }, traer).catch((e) => e)

    expect(error).toBeInstanceOf(ErrorApi)
    expect(error.estado).toBe(400)
    expect(error.message).toBe('Revisa los datos del despacho.')
    expect(error.errores['despacho.telefono']).toContain('9 dígitos')
  })

  it('con un 401 y token avisa a toda la app que la sesión expiró', async () => {
    const traer = jasmine.createSpy('fetch').and.resolveTo(respuesta(401, { mensaje: 'Tu sesión expiró. Vuelve a iniciar sesión.' }))
    // spyOn reemplaza el método real mientras dura la prueba
    spyOn(window, 'dispatchEvent')

    const error = await solicitar('/api/ordenes/mias', { sesion: { token: 'vencido' } }, traer).catch((e) => e)

    expect(error.estado).toBe(401)
    expect(window.dispatchEvent).toHaveBeenCalledTimes(1)
    expect(window.dispatchEvent.calls.mostRecent().args[0].type).toBe('sesion-expirada')
  })

  it('un 401 sin token (credenciales incorrectas) no cierra ninguna sesión', async () => {
    const traer = jasmine.createSpy('fetch').and.resolveTo(respuesta(401, { mensaje: 'Correo o contraseña incorrectos.' }))
    spyOn(window, 'dispatchEvent')

    const error = await solicitar('/api/auth/login', { metodo: 'POST', cuerpo: {}, sesion: null }, traer).catch((e) => e)

    expect(error.message).toBe('Correo o contraseña incorrectos.')
    expect(window.dispatchEvent).not.toHaveBeenCalled()
  })

  it('sin conexión responde con un mensaje entendible (estado 0)', async () => {
    const traer = jasmine.createSpy('fetch').and.rejectWith(new TypeError('Failed to fetch'))

    const error = await solicitar('/api/productos', { sesion: null }, traer).catch((e) => e)

    expect(error.estado).toBe(0)
    expect(error.message).toContain('No pudimos conectar con el servidor')
  })
})

describe('services/api.js · mensajePorEstado', () => {
  it('tiene un mensaje propio para cada código que traduce el caso', () => {
    expect(mensajePorEstado(400)).toBe('Revisa los datos del formulario.')
    expect(mensajePorEstado(401)).toBe('Tu sesión no es válida. Vuelve a iniciar sesión.')
    expect(mensajePorEstado(403)).toBe('Tu rol no tiene permiso para realizar esta acción.')
    expect(mensajePorEstado(404)).toBe('No encontramos lo que buscas.')
    expect(mensajePorEstado(409)).toBe('La operación no se puede hacer con el estado actual.')
    expect(mensajePorEstado(500)).toBe('El servidor tuvo un problema. Intenta de nuevo en unos minutos.')
  })

  it('cualquier 5xx usa el mensaje del 500 y otro código, uno genérico', () => {
    expect(mensajePorEstado(503)).toBe(mensajePorEstado(500))
    expect(mensajePorEstado(418)).toBe('Ocurrió un error inesperado.')
  })

  it('solicitar lo usa cuando el backend responde sin mensaje', async () => {
    const traer = jasmine.createSpy('fetch').and.resolveTo({ ok: false, status: 404, json: () => Promise.reject(new SyntaxError('vacío')) })

    const error = await solicitar('/api/productos/999', { sesion: null }, traer).catch((e) => e)

    expect(error).toBeInstanceOf(ErrorApi)
    expect(error.message).toBe('No encontramos lo que buscas.')
  })
})
