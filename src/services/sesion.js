// La sesión se guarda en localStorage con la clave "sesion" = { token, usuario }.
// Riesgo conocido: un ataque XSS podría leerla. Por eso nunca se usa innerHTML con datos del usuario.
const CLAVE = 'sesion'

// El JWT tiene tres partes separadas por puntos; la segunda (payload) es JSON en base64url.
// Aquí solo se lee para conocer el vencimiento: la firma la verifica el backend en cada petición.
export function leerPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return null
  }
}

// Devuelve la sesión guardada o null. Si el token ya venció, la borra.
// Los parámetros permiten usar un almacén y una hora falsos en las pruebas.
export function leerSesion(almacen = localStorage, ahora = Date.now()) {
  try {
    let sesion = JSON.parse(almacen.getItem(CLAVE))
    if (!sesion && almacen.getItem('sesion')) sesion = JSON.parse(almacen.getItem('sesion'))
    if (!sesion?.token) return null
    const payload = leerPayload(sesion.token)
    if (!payload?.exp || payload.exp * 1000 <= ahora) {
      almacen.removeItem(CLAVE)
      return null
    }
    return { ...sesion, expira: payload.exp * 1000, emitido: (payload.iat ?? payload.exp) * 1000 }
  } catch {
    return null
  }
}

export function guardarSesion({ token, usuario }, almacen = localStorage) {
  almacen.setItem(CLAVE, JSON.stringify({ token, usuario }))
}

export function borrarSesion(almacen = localStorage) {
  almacen.removeItem(CLAVE)
}
