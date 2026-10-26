export const CLAVES_ALMACENAMIENTO = {
  carrito: 'gamehub_carrito',
  cupon: 'gamehub_cupon',
  ordenes: 'gamehub_ordenes'
};

export function leerAlmacenamiento(clave, valorAlternativo) {
  const guardado = localStorage.getItem(clave);
  return guardado ? JSON.parse(guardado) : valorAlternativo;
}

export function guardarAlmacenamiento(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

export function obtenerCarrito() {
  return leerAlmacenamiento(CLAVES_ALMACENAMIENTO.carrito, []);
}

export function obtenerCupon() {
  return leerAlmacenamiento(CLAVES_ALMACENAMIENTO.cupon, null);
}

export function obtenerOrdenes() {
  return leerAlmacenamiento(CLAVES_ALMACENAMIENTO.ordenes, []);
}
