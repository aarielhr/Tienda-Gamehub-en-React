// Pruebas adicionales: la línea de seguimiento de Mis órdenes y de la confirmación de compra
import { pasosDespacho } from './estados.js'

const estadosDe = (orden) => pasosDespacho(orden).map((paso) => paso.estado)

describe('logica/estados.js · pasosDespacho', () => {
  it('con el pago aprobado y sin despacho, el paso en curso es la preparación', () => {
    const pasos = pasosDespacho({ estado: 'PAGADA', pago: { fecha: '2026-11-10T10:00:00' }, despacho: null })

    expect(pasos.map((p) => p.estado)).toEqual(['hecho', 'actual', 'pendiente', 'pendiente', 'pendiente'])
    expect(pasos[0].detalle).toBe('10-11 · 10:00')
    expect(pasos[1].detalle).toBe('En curso')
    expect(pasos[4].detalle).toBe('Pendiente')
  })

  it('en tránsito, los tres primeros pasos están hechos y la entrega muestra la fecha estimada', () => {
    const orden = {
      estado: 'EN_TRANSITO',
      pago: { fecha: '2026-11-07T18:15:00' },
      despacho: {
        fechaEstimada: '2026-11-11',
        eventos: [
          { estado: 'PREPARANDO', fecha: '2026-11-07T22:15:00' },
          { estado: 'DESPACHADO', fecha: '2026-11-08T18:15:00' },
          { estado: 'EN_TRANSITO', fecha: '2026-11-09T00:15:00' },
        ],
      },
    }
    const pasos = pasosDespacho(orden)

    expect(pasos.map((p) => p.estado)).toEqual(['hecho', 'hecho', 'hecho', 'actual', 'pendiente'])
    expect(pasos[3].detalle).toBe('09-11 · 00:15')
    expect(pasos[4].detalle).toBe('Estimado 11-11-2026')
  })

  it('una orden entregada tiene los cinco pasos hechos', () => {
    const orden = {
      estado: 'ENTREGADA',
      pago: { fecha: '2026-10-20T17:05:00' },
      despacho: {
        eventos: [
          { estado: 'PREPARANDO', fecha: '2026-10-20T21:05:00' },
          { estado: 'DESPACHADO', fecha: '2026-10-21T17:05:00' },
          { estado: 'EN_TRANSITO', fecha: '2026-10-21T23:05:00' },
          { estado: 'ENTREGADO', fecha: '2026-10-22T19:05:00' },
        ],
      },
    }

    expect(estadosDe(orden)).toEqual(['hecho', 'hecho', 'hecho', 'hecho', 'hecho'])
    expect(pasosDespacho(orden)[4].detalle).toBe('22-10 · 19:05')
  })

  it('con el pago pendiente todos los pasos quedan pendientes', () => {
    expect(estadosDe({ estado: 'PENDIENTE_PAGO', pago: { fecha: null }, despacho: null })).toEqual([
      'pendiente',
      'pendiente',
      'pendiente',
      'pendiente',
      'pendiente',
    ])
  })
})
