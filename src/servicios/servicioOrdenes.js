import { CLAVES_ALMACENAMIENTO, leerAlmacenamiento, guardarAlmacenamiento } from './almacenamiento.js';

export function crearOrden(total, fechaActual = new Date()) {
  const orden = {
    numero: `GH-${fechaActual.getTime().toString().slice(-6)}`,
    fecha: fechaActual.toLocaleDateString('es-CL'),
    total,
    estado: 'Pendiente'
  };
  const ordenes = leerAlmacenamiento(CLAVES_ALMACENAMIENTO.ordenes, []);
  guardarAlmacenamiento(CLAVES_ALMACENAMIENTO.ordenes, [...ordenes, orden]);
  return orden;
}
