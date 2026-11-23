import { createContext, useContext } from 'react'

// Contexto de la sesión: usuario, rol y las acciones entrar y salir
export const AuthContext = createContext(null)

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return contexto
}
