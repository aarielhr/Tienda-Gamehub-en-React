// Pruebas adicionales: AuthProvider guarda la sesión, la renueva antes de que venza y la cierra al vencer.
// Una «sonda» entrega a la prueba el valor del contexto. spyOn(window, 'fetch') reemplaza a la API y
// jasmine.clock() adelanta el tiempo sin esperar de verdad. Entre pruebas se limpia la clave "sesion".
import { useEffect } from 'react'
import { ejecutar, esperarRespuestas, montar } from '../pruebas/montar.js'
import AuthProvider from './AuthProvider.jsx'
import { useAuth } from './useAuth.js'

const MINUTO = 60 * 1000
const USUARIO = { id: 3, nombre: 'Camila Rojas', email: 'camila@gamehub.test', rol: 'CLIENTE' }

// Un JWT de prueba: solo importa el payload (iat y exp, en segundos); la firma la verifica el backend
function token(iat, exp) {
  const payload = btoa(JSON.stringify({ sub: USUARIO.email, iat, exp })).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `cabecera.${payload}.firma`
}

// Respuesta falsa con la forma mínima que usa solicitar(): ok, status y json()
function respuesta(status, cuerpo) {
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(cuerpo) }
}

const guardar = (tokenGuardado) => localStorage.setItem('sesion', JSON.stringify({ token: tokenGuardado, usuario: USUARIO }))

// Igual que en CarritoProvider.spec.jsx: después de cada render le entrega a la prueba el valor del contexto
function Sonda({ alActualizar }) {
  const valor = useAuth()
  useEffect(() => {
    alActualizar(valor)
  })
  return null
}

describe('context/AuthProvider', () => {
  let vista
  let auth

  function montarProveedor() {
    vista = montar(
      <AuthProvider>
        <Sonda
          alActualizar={(valor) => {
            auth = valor
          }}
        />
      </AuthProvider>,
    )
  }

  beforeEach(() => localStorage.removeItem('sesion'))

  afterEach(() => {
    vista.desmontar()
    localStorage.removeItem('sesion')
  })

  it('lee la sesión guardada al montar: por eso sobrevive a una recarga', () => {
    const ahora = Math.floor(Date.now() / 1000)
    guardar(token(ahora, ahora + 3600))

    montarProveedor()

    expect(auth.usuario).toEqual(USUARIO)
    expect(auth.rol).toBe('CLIENTE')
  })

  it('entrar guarda la sesión en localStorage y salir la borra', () => {
    montarProveedor()
    expect(auth.usuario).toBeNull()

    const ahora = Math.floor(Date.now() / 1000)
    ejecutar(() => auth.entrar({ token: token(ahora, ahora + 3600), usuario: USUARIO }))
    expect(auth.usuario.nombre).toBe('Camila Rojas')
    expect(JSON.parse(localStorage.getItem('sesion')).usuario).toEqual(USUARIO)

    ejecutar(() => auth.salir())
    expect(auth.usuario).toBeNull()
    expect(localStorage.getItem('sesion')).toBeNull()
  })

  it('renueva el token con POST /api/auth/renovar antes de que venza', async () => {
    // Un token de 60 minutos al que le quedan 2 segundos: ya entró en los últimos 15 minutos, así que se renueva de inmediato
    const ahora = Math.floor(Date.now() / 1000)
    const viejo = token(ahora - 3598, ahora + 2)
    const nuevo = token(ahora, ahora + 3600)
    guardar(viejo)
    spyOn(window, 'fetch').and.resolveTo(respuesta(200, { token: nuevo, usuario: USUARIO }))

    montarProveedor()
    await esperarRespuestas()

    const [url, opciones] = window.fetch.calls.mostRecent().args
    expect(url).toBe('http://api.prueba/api/auth/renovar')
    expect(opciones.method).toBe('POST')
    expect(opciones.headers.Authorization).toBe(`Bearer ${viejo}`)
    expect(JSON.parse(localStorage.getItem('sesion')).token).toBe(nuevo)
    expect(auth.usuario).toEqual(USUARIO)
  })

  it('un 401 con token (evento sesion-expirada) cierra la sesión en toda la app, y cerrarAviso oculta el aviso', () => {
    const ahora = Math.floor(Date.now() / 1000)
    guardar(token(ahora, ahora + 3600))
    montarProveedor()

    // Es el evento que emite solicitar() cuando la API responde 401 a una petición que llevaba token
    ejecutar(() => window.dispatchEvent(new CustomEvent('sesion-expirada')))
    expect(auth.usuario).toBeNull()
    expect(auth.expirada).toBeTrue()

    ejecutar(() => auth.cerrarAviso())
    expect(auth.expirada).toBeFalse()
  })

  describe('con el reloj de Jasmine', () => {
    const AHORA = Date.UTC(2026, 10, 12, 12, 0, 0)

    beforeEach(() => {
      jasmine.clock().install()
      jasmine.clock().mockDate(new Date(AHORA))
    })

    afterEach(() => jasmine.clock().uninstall())

    it('si no logra renovar, cierra la sesión justo al vencer y avisa que expiró', () => {
      const ahora = AHORA / 1000
      guardar(token(ahora, ahora + 3600))
      spyOn(window, 'fetch').and.rejectWith(new TypeError('Failed to fetch'))
      montarProveedor()

      // Con un token de 60 minutos, el intento de renovar llega a los 45: 15 minutos antes de que venza
      ejecutar(() => jasmine.clock().tick(45 * MINUTO - 1))
      expect(window.fetch).not.toHaveBeenCalled()
      ejecutar(() => jasmine.clock().tick(1))
      expect(window.fetch).toHaveBeenCalledTimes(1)
      expect(auth.usuario).toEqual(USUARIO)

      // Sin conexión no se renovó: al minuto 60 la sesión se cierra y queda el aviso «Tu sesión expiró»
      ejecutar(() => jasmine.clock().tick(15 * MINUTO))
      expect(auth.usuario).toBeNull()
      expect(auth.expirada).toBeTrue()
      expect(localStorage.getItem('sesion')).toBeNull()
    })
  })
})
