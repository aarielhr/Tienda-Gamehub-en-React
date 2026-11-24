import { solicitar } from './api.js'

// sesion: null evita mandar un token viejo y que un 401 de credenciales se lea como sesión vencida
export const iniciarSesion = (email, clave) =>
  solicitar('/api/auth/login', { metodo: 'POST', cuerpo: { email, clave }, sesion: null })

export const registrar = (datos) => solicitar('/api/auth/registro', { metodo: 'POST', cuerpo: datos, sesion: null })

// El perfil (datos de contacto y despacho) vive en user-service
export const obtenerPerfil = () => solicitar('/api/usuarios/perfil')

export const renovarSesion = () => solicitar('/api/auth/renovar', { metodo: 'POST' })
