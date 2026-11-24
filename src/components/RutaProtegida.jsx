import { Link, Navigate, useLocation } from 'react-router'
import { useAuth } from '../context/useAuth.js'
import { NOMBRE_ROL } from '../logica/estados.js'
import { Vacio } from './Estado.jsx'

// Sin sesión lleva a /acceso y recuerda a dónde se quería ir. Con un rol que no corresponde,
// muestra un aviso. Ocultar es solo la primera barrera: el backend vuelve a validar el rol.
export default function RutaProtegida({ rol, children }) {
  const { usuario } = useAuth()
  const ubicacion = useLocation()

  if (!usuario) {
    return <Navigate to="/acceso" replace state={{ desde: ubicacion.pathname }} />
  }

  const permitidos = rol ? [].concat(rol) : null
  if (permitidos && !permitidos.includes(usuario.rol)) {
    return (
      <div className="contenedor py-5">
        <Vacio
          icono="candado"
          titulo="No tienes acceso a esta sección"
          texto={`Tu rol (${NOMBRE_ROL[usuario.rol]}) no puede entrar aquí. Si intentas la acción igual, el servidor responde 403.`}
        >
          <Link className="btn btn-outline-secondary" to="/">
            Volver al inicio
          </Link>
        </Vacio>
      </div>
    )
  }

  return children
}
