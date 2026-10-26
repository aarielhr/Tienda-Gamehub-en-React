const formateadorMoneda = new Intl.NumberFormat('es-CL');

export function formatearMoneda(monto) {
  return `$${formateadorMoneda.format(monto)}`;
}

export function calcularTotales(articulos, descuento = 0) {
  const subtotal = articulos.reduce((suma, articulo) => suma + articulo.precio * articulo.cantidad, 0);
  const montoDescuento = Math.min(subtotal * descuento, subtotal);
  return { subtotal, descuento: montoDescuento, total: subtotal - montoDescuento };
}
