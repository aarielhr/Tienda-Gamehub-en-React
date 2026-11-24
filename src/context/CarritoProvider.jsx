import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  agregarAlCarrito,
  aplicarCupon,
  calcularSubtotal,
  calcularTotal,
  cambiarCantidad,
  contarUnidades,
  cuponVigente,
  quitarLinea,
} from '../logica/carrito.js'
import { CarritoContext } from './carritoContext.js'

const CLAVE = 'carrito'

function leerCarrito() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE))
    return { lineas: Array.isArray(datos?.lineas) ? datos.lineas : [], cupon: datos?.cupon ?? null }
  } catch {
    return { lineas: [], cupon: null }
  }
}

export default function CarritoProvider({ children }) {
  const [estado, setEstado] = useState(leerCarrito)

  // Se guarda en cada cambio: el carrito conserva su contenido al navegar y al recargar
  useEffect(() => {
    localStorage.setItem(CLAVE, JSON.stringify(estado))
  }, [estado])

  // Las acciones devuelven { valido, mensaje } para que la vista muestre el aviso de stock
  const agregar = useCallback(
    (producto, cantidad = 1) => {
      const resultado = agregarAlCarrito(estado.lineas, producto, cantidad)
      if (resultado.valido) setEstado((e) => ({ ...e, lineas: resultado.lineas }))
      return resultado
    },
    [estado.lineas],
  )

  const actualizarCantidad = useCallback(
    (productoId, cantidad) => {
      const resultado = cambiarCantidad(estado.lineas, productoId, cantidad)
      if (resultado.valido) setEstado((e) => ({ ...e, lineas: resultado.lineas }))
      return resultado
    },
    [estado.lineas],
  )

  const quitar = useCallback((productoId) => {
    setEstado((e) => ({ ...e, lineas: quitarLinea(e.lineas, productoId) }))
  }, [])

  const vaciar = useCallback(() => setEstado({ lineas: [], cupon: null }), [])

  const guardarCupon = useCallback((cupon) => setEstado((e) => ({ ...e, cupon })), [])

  const quitarCupon = useCallback(() => setEstado((e) => ({ ...e, cupon: null })), [])

  // Actualiza precio y stock con lo que respondió POST /api/carrito/validar
  const sincronizar = useCallback((validacion) => {
    setEstado((e) => ({
      cupon: validacion.cupon ?? (validacion.mensajeCupon ? null : e.cupon),
      lineas: e.lineas.map((linea) => {
        const datos = validacion.lineas.find((v) => v.productoId === linea.productoId)
        return datos ? { ...linea, nombre: datos.nombre, precio: datos.precio, stock: datos.stock, disponible: datos.disponible, mensajeStock: datos.mensaje, imagen: linea.imagen ?? 'teclado' } : linea
      }),
    }))
  }, [])

  const valor = useMemo(() => {
    const subtotal = calcularSubtotal(estado.lineas)
    const descuento = cuponVigente(estado.cupon) ? aplicarCupon(subtotal, estado.cupon) : 0
    return {
      lineas: estado.lineas,
      cupon: estado.cupon,
      unidades: contarUnidades(estado.lineas),
      subtotal,
      descuento,
      total: calcularTotal(subtotal, descuento),
      agregar,
      actualizarCantidad,
      quitar,
      vaciar,
      guardarCupon,
      quitarCupon,
      sincronizar,
    }
  }, [estado, agregar, actualizarCantidad, quitar, vaciar, guardarCupon, quitarCupon, sincronizar])

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>
}
