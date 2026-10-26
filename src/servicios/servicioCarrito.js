import { productos } from '../datos/productos.js';
import { CLAVES_ALMACENAMIENTO, guardarAlmacenamiento } from './almacenamiento.js';

export const cuponesValidos = {
  SETUP2026: 0.15,
  DUOC10: 0.1
};

export function agregarProductoAlCarrito(carrito, idProducto) {
  const producto = productos.find((articulo) => articulo.id === idProducto);
  if (!producto || producto.stock === 0) {
    return { carrito, error: 'Este producto no tiene stock disponible.' };
  }

  const existente = carrito.find((articulo) => articulo.id === idProducto);
  if (existente && existente.cantidad >= producto.stock) {
    return { carrito, error: 'No hay más stock disponible para este producto.' };
  }

  const nuevoCarrito = existente
    ? carrito.map((articulo) => articulo.id === idProducto ? { ...articulo, cantidad: articulo.cantidad + 1 } : articulo)
    : [...carrito, {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1,
        stockMaximo: producto.stock,
        imagen: producto.imagen
      }];

  return { carrito: nuevoCarrito, mensaje: `${producto.nombre} agregado al carrito.` };
}

export function guardarCarrito(carrito) {
  guardarAlmacenamiento(CLAVES_ALMACENAMIENTO.carrito, carrito);
}

export function actualizarCantidadCarrito(carrito, idProducto, cantidad) {
  return carrito.map((articulo) => articulo.id === idProducto
    ? { ...articulo, cantidad: Math.min(Math.max(1, cantidad), articulo.stockMaximo) }
    : articulo);
}

export function aplicarCupon(codigo) {
  const codigoNormalizado = codigo.trim().toUpperCase();
  const descuento = cuponesValidos[codigoNormalizado];
  if (!descuento) {
    localStorage.removeItem(CLAVES_ALMACENAMIENTO.cupon);
    return { cupon: null, error: 'Cupón vencido o inexistente.' };
  }

  const cupon = { codigo: codigoNormalizado, descuento };
  guardarAlmacenamiento(CLAVES_ALMACENAMIENTO.cupon, cupon);
  return { cupon, mensaje: '¡Cupón aplicado exitosamente!' };
}

export function limpiarAlmacenamientoCarrito() {
  localStorage.removeItem(CLAVES_ALMACENAMIENTO.carrito);
  localStorage.removeItem(CLAVES_ALMACENAMIENTO.cupon);
}
