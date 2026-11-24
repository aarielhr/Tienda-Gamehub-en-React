// Mis órdenes junta tres microservicios: la orden (order-service), las reseñas del cliente (review-service)
// y sus garantías (warranty-service). Estas funciones deciden, línea por línea, qué puede hacer el cliente.
// Son las mismas reglas que vuelven a revisar review-service y warranty-service al recibir la solicitud.
import { aFechaISO, fecha } from './formato.js'

export const MESES_GARANTIA = 6
const GARANTIA_CERRADA = ['RESUELTA', 'RECHAZADA']

// Fecha de entrega + 6 meses, en formato aaaa-mm-dd. Si el mes no tiene ese día, usa el último día del mes.
export function plazoGarantia(entregadaEn) {
  if (!entregadaEn) return null
  const d = new Date(entregadaEn)
  const dia = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + MESES_GARANTIA)
  const ultimoDia = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(dia, ultimoDia))
  return aFechaISO(d)
}

// Agrega a cada línea de la orden lo que necesita la vista: si ya se reseñó, si se puede pedir garantía y por qué no.
export function conPostventa(orden, resenas, garantias, hoy = new Date()) {
  const entregada = orden.estado === 'ENTREGADA'
  const plazo = plazoGarantia(orden.entregadaEn)
  const vencida = plazo !== null && aFechaISO(hoy) > plazo
  const resenadas = new Set(resenas.filter((r) => r.ordenId === orden.id).map((r) => r.productoId))
  const ultimaGarantia = new Map()
  for (const g of garantias.filter((x) => x.ordenId === orden.id)) {
    const previa = ultimaGarantia.get(g.productoId)
    if (!previa || g.creadaEn > previa.creadaEn) ultimaGarantia.set(g.productoId, g)
  }

  const lineas = orden.lineas.map((linea) => {
    const resenada = resenadas.has(linea.productoId)
    const garantia = ultimaGarantia.get(linea.productoId)
    let motivoSinGarantia = null
    if (!entregada) motivoSinGarantia = 'La garantía se puede pedir desde que recibes el producto.'
    else if (!plazo || vencida) motivoSinGarantia = `El plazo de garantía venció${plazo ? ` el ${fecha(plazo)}` : ''}.`
    else if (garantia && !GARANTIA_CERRADA.includes(garantia.estado)) motivoSinGarantia = 'Ya hay una solicitud abierta para este producto.'
    return {
      ...linea,
      resenada,
      puedeResenar: entregada && !resenada,
      motivoSinResena: entregada ? null : 'Podrás reseñar cuando recibas el producto.',
      garantia: garantia ? { codigo: garantia.codigo, estado: garantia.estado } : null,
      puedeSolicitarGarantia: motivoSinGarantia === null,
      plazoGarantia: plazo,
      motivoSinGarantia,
    }
  })
  return { ...orden, lineas }
}
