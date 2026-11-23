// Pruebas adicionales: la sesión se lee con un almacén y una hora falsos, sin tocar localStorage
import { guardarSesion, leerSesion } from './sesion.js'

// Doble de localStorage: guarda en un objeto y registra cada llamada
function almacenFalso() {
  const datos = {}
  return {
    getItem: jasmine.createSpy('getItem').and.callFake((clave) => datos[clave] ?? null),
    setItem: jasmine.createSpy('setItem').and.callFake((clave, valor) => {
      datos[clave] = valor
    }),
    removeItem: jasmine.createSpy('removeItem').and.callFake((clave) => {
      delete datos[clave]
    }),
  }
}

// Un JWT de prueba: solo importa el payload, la firma la verifica el backend
function token(payload) {
  const base64url = btoa(JSON.stringify(payload)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `cabecera.${base64url}.firma`
}

const AHORA = Date.UTC(2026, 10, 10, 12, 0, 0)
const USUARIO = { id: 3, nombre: 'Camila Rojas', email: 'camila@gamehub.test', rol: 'CLIENTE' }

describe('services/sesion.js', () => {
  it('lee una sesión vigente y calcula cuándo vence el token', () => {
    const almacen = almacenFalso()
    const exp = AHORA / 1000 + 3600
    guardarSesion({ token: token({ sub: USUARIO.email, iat: AHORA / 1000, exp }), usuario: USUARIO }, almacen)

    const sesion = leerSesion(almacen, AHORA)

    expect(sesion.usuario).toEqual(USUARIO)
    expect(sesion.expira).toBe(exp * 1000)
    expect(almacen.setItem).toHaveBeenCalledWith('sesion', jasmine.any(String))
  })

  it('borra la sesión si el token ya venció (por eso al recargar no queda una sesión inválida)', () => {
    const almacen = almacenFalso()
    guardarSesion({ token: token({ sub: USUARIO.email, exp: AHORA / 1000 - 60 }), usuario: USUARIO }, almacen)

    expect(leerSesion(almacen, AHORA)).toBeNull()
    expect(almacen.removeItem).toHaveBeenCalledWith('sesion')
  })
})
