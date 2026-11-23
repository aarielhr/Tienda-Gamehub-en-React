import { solicitar } from './api.js'

// Las cifras del panel vienen de dos microservicios: órdenes (order-service) y garantías (warranty-service)
export async function obtenerResumen() {
  const [ordenes, garantias] = await Promise.all([
    solicitar('/api/operador/resumen'),
    solicitar('/api/operador/garantias/resumen'),
  ])
  return { ...ordenes, garantiasAbiertas: garantias.abiertas }
}

export const listarOrdenesOperador = (estado) =>
  solicitar(estado ? `/api/operador/ordenes?estado=${estado}` : '/api/operador/ordenes')

export const obtenerOrdenOperador = (id) => solicitar(`/api/operador/ordenes/${id}`)

export const confirmarPago = (id) => solicitar(`/api/operador/ordenes/${id}/pago/confirmar`, { metodo: 'POST' })

export const anularPago = (id) => solicitar(`/api/operador/ordenes/${id}/pago/anular`, { metodo: 'POST' })

export const generarDespacho = (id, datos) =>
  solicitar(`/api/operador/ordenes/${id}/despacho`, { metodo: 'POST', cuerpo: datos })

export const actualizarDespacho = (id, datos) =>
  solicitar(`/api/operador/ordenes/${id}/despacho`, { metodo: 'PUT', cuerpo: datos })

export const listarStock = () => solicitar('/api/operador/inventario')

export const listarMovimientos = () => solicitar('/api/operador/inventario/movimientos')

export const registrarMovimiento = (datos) =>
  solicitar('/api/operador/inventario/movimientos', { metodo: 'POST', cuerpo: datos })

export const listarGarantias = () => solicitar('/api/operador/garantias')

export const resolverGarantia = (id, datos) => solicitar(`/api/operador/garantias/${id}`, { metodo: 'PUT', cuerpo: datos })
