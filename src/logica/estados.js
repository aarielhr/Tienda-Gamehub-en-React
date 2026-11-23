// Texto, tono e icono de cada estado que llega desde la API. El tono define el color de la insignia.
import { fecha, fechaCorta } from './formato.js'

export const ESTADO_ORDEN = {
  PENDIENTE_PAGO: { texto: 'Pago pendiente', tono: 'aviso', icono: 'reloj' },
  PAGADA: { texto: 'Pagada · por despachar', tono: 'info', icono: 'caja' },
  EN_PREPARACION: { texto: 'Preparando despacho', tono: 'info', icono: 'caja' },
  DESPACHADA: { texto: 'Despachada', tono: 'info', icono: 'camion' },
  EN_TRANSITO: { texto: 'En tránsito', tono: 'info', icono: 'camion' },
  ENTREGADA: { texto: 'Entregada', tono: 'ok', icono: 'check' },
  RECHAZADA: { texto: 'Pago rechazado', tono: 'error', icono: 'x' },
  ANULADA: { texto: 'Anulada', tono: 'neutro', icono: 'x' },
}

export const ESTADO_PAGO = {
  PENDIENTE: { texto: 'Pago pendiente', tono: 'aviso', icono: 'reloj' },
  APROBADO: { texto: 'Pago aprobado', tono: 'ok', icono: 'check' },
  RECHAZADO: { texto: 'Pago rechazado', tono: 'error', icono: 'x' },
  ANULADO: { texto: 'Pago anulado', tono: 'neutro', icono: 'x' },
}

export const ESTADO_DESPACHO = {
  PREPARANDO: { texto: 'Preparando', tono: 'info', icono: 'caja' },
  DESPACHADO: { texto: 'Despachado', tono: 'info', icono: 'camion' },
  EN_TRANSITO: { texto: 'En tránsito', tono: 'info', icono: 'camion' },
  ENTREGADO: { texto: 'Entregado', tono: 'ok', icono: 'check' },
}

export const SIGUIENTE_DESPACHO = { PREPARANDO: 'DESPACHADO', DESPACHADO: 'EN_TRANSITO', EN_TRANSITO: 'ENTREGADO' }

export const ESTADO_GARANTIA = {
  ABIERTA: { texto: 'Abierta', tono: 'aviso', icono: 'escudo' },
  EN_REVISION: { texto: 'En revisión', tono: 'info', icono: 'reloj' },
  RESUELTA: { texto: 'Resuelta', tono: 'ok', icono: 'check' },
  RECHAZADA: { texto: 'Rechazada', tono: 'error', icono: 'x' },
}

export const ESTADO_RESENA = {
  PENDIENTE: { texto: 'En moderación', tono: 'aviso', icono: 'reloj' },
  APROBADA: { texto: 'Publicada', tono: 'ok', icono: 'check' },
  OCULTA: { texto: 'Oculta', tono: 'neutro', icono: 'x' },
}

export const ESTADO_PROMOCION = {
  VIGENTE: { texto: 'Vigente', tono: 'ok', icono: 'check' },
  PROGRAMADA: { texto: 'Programada', tono: 'info', icono: 'reloj' },
  VENCIDA: { texto: 'Vencida', tono: 'neutro', icono: 'x' },
  AGOTADA: { texto: 'Agotada', tono: 'aviso', icono: 'alerta' },
  INACTIVA: { texto: 'Inactiva', tono: 'neutro', icono: 'x' },
}

export const METODOS_PAGO = [
  { id: 'DEBITO', nombre: 'Tarjeta de débito', detalle: 'Aprobación inmediata (simulada)' },
  { id: 'CREDITO', nombre: 'Tarjeta de crédito', detalle: 'Cupo simulado de $1.000.000: sobre ese total se rechaza' },
  { id: 'TRANSFERENCIA', nombre: 'Transferencia bancaria', detalle: 'Queda pendiente hasta que el operador la confirme' },
]

export const NOMBRE_METODO = Object.fromEntries(METODOS_PAGO.map((m) => [m.id, m.nombre]))

export const MOTIVOS_GARANTIA = [
  { id: 'FALLA', nombre: 'Falla de funcionamiento' },
  { id: 'DANIO', nombre: 'Daño de fábrica' },
  { id: 'INCOMPLETO', nombre: 'Faltan piezas o accesorios' },
  { id: 'OTRO', nombre: 'Otro motivo' },
]

export const NOMBRE_ROL = { ADMIN: 'Administrador', OPERADOR: 'Operador', CLIENTE: 'Cliente' }

// Cinco pasos del despacho. Los hechos van en verde y el que está en curso, en violeta.
export function pasosDespacho(orden) {
  const nombres = ['Pago aprobado', 'En preparación', 'Despachado', 'En tránsito', 'Entregado']
  const eventos = Object.fromEntries((orden.despacho?.eventos ?? []).map((e) => [e.estado, e.fecha]))
  const fechas = [orden.pago?.fecha, eventos.PREPARANDO, eventos.DESPACHADO, eventos.EN_TRANSITO, eventos.ENTREGADO]
  const estadoPorOrden = {
    PAGADA: ['hecho', 'actual', 'pendiente', 'pendiente', 'pendiente'],
    EN_PREPARACION: ['hecho', 'actual', 'pendiente', 'pendiente', 'pendiente'],
    DESPACHADA: ['hecho', 'hecho', 'hecho', 'actual', 'pendiente'],
    EN_TRANSITO: ['hecho', 'hecho', 'hecho', 'actual', 'pendiente'],
    ENTREGADA: ['hecho', 'hecho', 'hecho', 'hecho', 'hecho'],
  }
  const estados = estadoPorOrden[orden.estado] ?? ['pendiente', 'pendiente', 'pendiente', 'pendiente', 'pendiente']
  return nombres.map((nombre, i) => {
    let detalle = fechas[i] ? fechaCorta(fechas[i]) : estados[i] === 'actual' ? 'En curso' : 'Pendiente'
    if (i === 4 && !fechas[i] && orden.despacho?.fechaEstimada) detalle = `Estimado ${fecha(orden.despacho.fechaEstimada)}`
    return { nombre, estado: estados[i], detalle }
  })
}
