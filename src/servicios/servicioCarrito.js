
import { productos } from '../datos/productos.js';
import {
  CLAVES_ALMACENAMIENTO,
  guardarAlmacenamiento
} from './almacenamiento.js';

// Cupones disponibles
export const cuponesValidos = {
  SETUP2026: 0.15,
  DUOC10: 0.1
};

// Descuento máximo de cada cupón
export const topesCupon = {
  SETUP2026: 10000,
  DUOC10: 5000
};

// Agregar productos al carrito
export function agregarProductoAlCarrito(carrito, idProducto) {
  const producto = productos.find(
    (articulo) => articulo.id === idProducto
  );

  if (!producto || producto.stock === 0) {
    return {
      carrito,
      error: 'Este producto no tiene stock disponible.'
    };
  }

  const existente = carrito.find(
    (articulo) => articulo.id === idProducto
  );

  if (existente && existente.cantidad >= producto.stock) {
    return {
      carrito,
      error: 'No hay más stock disponible para este producto.'
    };
  }

  const nuevoCarrito = existente
    ? carrito.map((articulo) =>
        articulo.id === idProducto
          ? { ...articulo, cantidad: articulo.cantidad + 1 }
          : articulo
      )
    : [
        ...carrito,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: 1,
          stockMaximo: producto.stock,
          imagen: producto.imagen
        }
      ];

  return {
    carrito: nuevoCarrito,
    mensaje: `${producto.nombre} agregado al carrito.`
  };
}

// Guardar carrito
export function guardarCarrito(carrito) {
  guardarAlmacenamiento(CLAVES_ALMACENAMIENTO.carrito, carrito);
}

// Actualizar cantidad respetando el stock
export function actualizarCantidadCarrito(
  carrito,
  idProducto,
  cantidad
) {
  return carrito.map((articulo) =>
    articulo.id === idProducto
      ? {
          ...articulo,
          cantidad: Math.min(
            Math.max(1, cantidad),
            articulo.stockMaximo
          )
        }
      : articulo
  );
}

// Aplicar cupón con descuento máximo
export function aplicarCupon(codigo, subtotal = 0) {
  const codigoNormalizado = codigo.trim().toUpperCase();
  const descuento = cuponesValidos[codigoNormalizado];

  if (!descuento) {
    localStorage.removeItem(CLAVES_ALMACENAMIENTO.cupon);

    return {
      cupon: null,
      error: 'Cupón vencido o inexistente.'
    };
  }

  const cupon = {
    codigo: codigoNormalizado,
    descuento
  };

  const subtotalSeguro = Math.max(0, subtotal);

  const montoDescuento = Math.min(
    subtotalSeguro * descuento,
    topesCupon[codigoNormalizado],
    subtotalSeguro
  );

  guardarAlmacenamiento(
    CLAVES_ALMACENAMIENTO.cupon,
    cupon
  );

  return {
    cupon,
    montoDescuento,
    mensaje: '¡Cupón aplicado exitosamente!'
  };
}

// Limpiar carrito y cupón
export function limpiarAlmacenamientoCarrito() {
  localStorage.removeItem(CLAVES_ALMACENAMIENTO.carrito);
  localStorage.removeItem(CLAVES_ALMACENAMIENTO.cupon);
}

export function cuponVigente(fechaInicio, fechaFin, fechaActual = new Date()) {
  const inicio = new Date(`${fechaInicio}T00:00:00`);
  const fin = new Date(`${fechaFin}T23:59:59.999`);
  const actual = new Date(fechaActual);

  // Rechaza fechas inválidas o invertidas
  if (
    Number.isNaN(inicio.getTime()) ||
    Number.isNaN(fin.getTime()) ||
    Number.isNaN(actual.getTime()) ||
    inicio > fin
  ) {
    return false;
  }

  // El cupón solo es válido dentro del período
  return actual >= inicio && actual <= fin;
}
