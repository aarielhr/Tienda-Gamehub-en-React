// Reglas del carrito como funciones puras: reciben datos y devuelven datos nuevos.
// No tocan React ni la API, por eso se prueban con Jasmine sin montar componentes.
import { aFechaISO } from './formato.js'

export function calcularSubtotal(lineas) {
  return lineas.reduce((suma, linea) => suma + linea.precio * linea.cantidad, 0)
}

export function contarUnidades(lineas) {
  return lineas.reduce((suma, linea) => suma + linea.cantidad, 0)
}

// La cantidad debe ser un entero positivo que no supere el stock disponible
export function validarStock(cantidad, stock) {
  if (!Number.isInteger(cantidad) || cantidad < 1) {
    return { valido: false, mensaje: 'La cantidad debe ser un número entero mayor que cero.' }
  }
  if (cantidad > stock) {
    return {
      valido: false,
      mensaje: stock <= 0 ? 'Este producto no tiene stock.' : `Solo quedan ${stock} unidades disponibles.`,
    }
  }
  return { valido: true, mensaje: '' }
}

function crearLinea(producto, cantidad) {
  return {
    productoId: producto.id,
    nombre: producto.nombre,
    marca: producto.marca,
    sku: producto.sku,
    imagen: producto.imagen,
    precio: producto.precio,
    stock: producto.stock,
    cantidad,
  }
}

// Si el producto ya está en el carrito suma la cantidad en la misma línea, en vez de duplicarla
export function agregarAlCarrito(lineas, producto, cantidad = 1) {
  const existente = lineas.find((l) => l.productoId === producto.id)
  const nuevaCantidad = (existente?.cantidad ?? 0) + cantidad
  const control = validarStock(nuevaCantidad, producto.stock)
  if (!control.valido) return { lineas, ...control }

  const nuevas = existente
    ? lineas.map((l) =>
        l.productoId === producto.id
          ? { ...l, cantidad: nuevaCantidad, precio: producto.precio, stock: producto.stock }
          : l,
      )
    : [...lineas, crearLinea(producto, cantidad)]
  return { lineas: nuevas, valido: true, mensaje: '' }
}

export function cambiarCantidad(lineas, productoId, cantidad) {
  const linea = lineas.find((l) => l.productoId === productoId)
  if (!linea) return { lineas, valido: false, mensaje: 'El producto no está en el carrito.' }
  const control = validarStock(cantidad, linea.stock)
  if (!control.valido) return { lineas, ...control }
  return { lineas: lineas.map((l) => (l.productoId === productoId ? { ...l, cantidad } : l)), valido: true, mensaje: '' }
}

export function quitarLinea(lineas, productoId) {
  return lineas.filter((l) => l.productoId !== productoId)
}

// Un cupón sirve si hoy está entre su fecha de inicio y la de término (ambas incluidas)
export function cuponVigente(cupon, hoy = new Date()) {
  if (!cupon?.inicio || !cupon?.termino) return false
  const dia = aFechaISO(hoy)
  return cupon.inicio <= dia && dia <= cupon.termino
}

// Descuento por porcentaje que respeta el tope del cupón y nunca supera el subtotal
export function aplicarCupon(subtotal, cupon) {
  if (!cupon || subtotal <= 0) return 0
  const descuento = Math.round((subtotal * cupon.porcentaje) / 100)
  return Math.min(descuento, cupon.tope ?? descuento, subtotal)
}

export function calcularTotal(subtotal, descuento) {
  return Math.max(subtotal - descuento, 0)
}
