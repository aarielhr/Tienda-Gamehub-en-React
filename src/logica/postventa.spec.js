// Pruebas adicionales: qué puede reseñar o pedir en garantía el cliente en Mis órdenes.
// conPostventa junta la orden (order-service) con sus reseñas (review-service) y garantías (warranty-service).
import { conPostventa, plazoGarantia } from './postventa.js'

const ENTREGADA = {
  id: 1,
  estado: 'ENTREGADA',
  entregadaEn: '2026-10-22T19:05:00',
  lineas: [
    { productoId: 3, nombre: 'Procesador Tectra R7 de 8 núcleos' },
    { productoId: 6, nombre: 'Audífonos Andesia Pulse 7.1' },
  ],
}
// Hoy, para las pruebas: 11-11-2026 (el mes de Date empieza en 0)
const HOY = new Date(2026, 10, 11)

describe('logica/postventa.js', () => {
  it('plazoGarantia suma seis meses a la entrega y respeta el último día del mes', () => {
    expect(plazoGarantia('2026-10-22T19:05:00')).toBe('2027-04-22')
    expect(plazoGarantia('2026-08-31T10:00:00')).toBe('2027-02-28')
    expect(plazoGarantia(null)).toBeNull()
  })

  it('marca lo que ya se reseñó en esta orden y deja reseñar lo demás', () => {
    // La reseña del producto 6 es de otra orden: en esta todavía se puede reseñar
    const resenas = [
      { ordenId: 1, productoId: 3 },
      { ordenId: 2, productoId: 6 },
    ]
    const [procesador, audifonos] = conPostventa(ENTREGADA, resenas, [], HOY).lineas

    expect([procesador.resenada, procesador.puedeResenar]).toEqual([true, false])
    expect([audifonos.resenada, audifonos.puedeResenar]).toEqual([false, true])
    expect(procesador.puedeSolicitarGarantia).toBeTrue()
    expect(procesador.plazoGarantia).toBe('2027-04-22')
  })

  it('una garantía abierta impide pedir otra; una cerrada no', () => {
    const garantias = [
      { ordenId: 1, productoId: 3, codigo: 'GAR-0001', estado: 'RESUELTA', creadaEn: '2026-10-25T10:00:00' },
      { ordenId: 1, productoId: 6, codigo: 'GAR-0002', estado: 'EN_REVISION', creadaEn: '2026-10-26T10:00:00' },
    ]
    const [procesador, audifonos] = conPostventa(ENTREGADA, [], garantias, HOY).lineas

    expect(procesador.garantia).toEqual({ codigo: 'GAR-0001', estado: 'RESUELTA' })
    expect(procesador.puedeSolicitarGarantia).toBeTrue()
    expect(audifonos.puedeSolicitarGarantia).toBeFalse()
    expect(audifonos.motivoSinGarantia).toBe('Ya hay una solicitud abierta para este producto.')
  })

  it('si hay varias garantías del mismo producto, muestra la más reciente', () => {
    const garantias = [
      { ordenId: 1, productoId: 3, codigo: 'GAR-0004', estado: 'ABIERTA', creadaEn: '2026-11-05T09:00:00' },
      { ordenId: 1, productoId: 3, codigo: 'GAR-0001', estado: 'RECHAZADA', creadaEn: '2026-10-25T10:00:00' },
    ]

    expect(conPostventa(ENTREGADA, [], garantias, HOY).lineas[0].garantia.codigo).toBe('GAR-0004')
  })

  it('fuera de plazo no se puede pedir garantía', () => {
    const [procesador] = conPostventa(ENTREGADA, [], [], new Date(2027, 3, 23)).lineas

    expect(procesador.puedeSolicitarGarantia).toBeFalse()
    expect(procesador.motivoSinGarantia).toBe('El plazo de garantía venció el 22-04-2027.')
  })

  it('una orden en camino todavía no se puede reseñar ni pedir en garantía', () => {
    const [monitor] = conPostventa({ id: 2, estado: 'EN_TRANSITO', entregadaEn: null, lineas: [{ productoId: 7 }] }, [], [], HOY).lineas

    expect(monitor.puedeResenar).toBeFalse()
    expect(monitor.motivoSinResena).toBe('Podrás reseñar cuando recibas el producto.')
    expect(monitor.motivoSinGarantia).toBe('La garantía se puede pedir desde que recibes el producto.')
  })
})
