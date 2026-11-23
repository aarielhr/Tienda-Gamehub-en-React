// A dónde lleva cada rol después de iniciar sesión
export const INICIO_POR_ROL = { CLIENTE: '/', OPERADOR: '/operador', ADMIN: '/admin' }

// Rutas que solo puede abrir cierto rol (las mismas reglas que App.jsx y SeguridadConfig)
const RUTAS_POR_ROL = [
  { prefijo: '/admin', roles: ['ADMIN'] },
  { prefijo: '/operador', roles: ['OPERADOR', 'ADMIN'] },
  { prefijo: '/checkout', roles: ['CLIENTE'] },
  { prefijo: '/mis-ordenes', roles: ['CLIENTE'] },
  { prefijo: '/ordenes.html', roles: ['CLIENTE'] },
  { prefijo: '/ordenes/', roles: ['CLIENTE'] },
]

// Si la persona venía de una ruta protegida y su rol puede abrirla, vuelve ahí; si no, va al inicio de su rol
export function rutaDespuesDeIngresar(rol, desde) {
  const inicio = INICIO_POR_ROL[rol] ?? '/'
  if (!desde || desde === '/acceso') return inicio
  const regla = RUTAS_POR_ROL.find((r) => desde.startsWith(r.prefijo))
  return !regla || regla.roles.includes(rol) ? desde : inicio
}
