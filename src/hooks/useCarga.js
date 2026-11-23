import { useCallback, useEffect, useState } from 'react'

// Carga datos con un servicio y entrega los tres estados de la vista: cargando, error y datos.
// "clave" identifica cada pedido (las dependencias más la versión que sube con recargar): mientras la
// respuesta guardada no sea la de la clave actual, la vista está cargando. Así el efecto solo sincroniza
// con la API y no hace setState antes de que llegue la respuesta. "activo" descarta respuestas viejas.
export function useCarga(cargar, dependencias = []) {
  const [version, setVersion] = useState(0)
  const clave = JSON.stringify([...dependencias, version])
  const [estado, setEstado] = useState({ clave: null, datos: null, error: null })

  useEffect(() => {
    let activo = true
    cargar()
      .then((datos) => activo && setEstado({ clave, datos, error: null }))
      .catch((error) => activo && setEstado({ clave, datos: null, error }))
    return () => {
      activo = false
    }
    // cargar cambia en cada render; lo que importa es la clave (dependencias + versión)
  }, [clave]) // eslint-disable-line react-hooks/exhaustive-deps

  const recargar = useCallback(() => setVersion((v) => v + 1), [])
  const cargando = estado.clave !== clave
  // Al recargar se conservan los datos anteriores para que la vista no parpadee
  return { datos: estado.datos, cargando, error: cargando ? null : estado.error, recargar }
}
