// Pruebas adicionales: formatos chilenos de montos, fechas y nombres. Son funciones puras,
// así que se prueban sin montar componentes.
import { aFechaISO, clp, fecha, fechaCorta, fechaHora, iniciales, plural, porcentajeDescuento } from './formato.js'

describe('logica/formato.js', () => {
  it('clp usa punto de miles, redondea y muestra $0 si el valor no es un número', () => {
    expect(clp(1149990)).toBe('$1.149.990')
    expect(clp(999.6)).toBe('$1.000')
    expect(clp(-5000)).toBe('−$5.000')
    expect(clp('abc')).toBe('$0')
  })

  it('fecha, fechaHora y fechaCorta pasan del formato ISO al chileno; sin fecha devuelven texto vacío', () => {
    expect(fecha('2026-11-10T09:42:00')).toBe('10-11-2026')
    expect(fechaHora('2026-11-10T09:42:00')).toBe('10-11-2026 · 09:42')
    expect(fechaCorta('2026-11-10T09:42:00')).toBe('10-11 · 09:42')
    expect(fecha('')).toBe('')
    expect(fechaHora(null)).toBe('')
    expect(fechaCorta('')).toBe('')
  })

  it('aFechaISO usa la fecha local, con dos dígitos para el mes y el día', () => {
    expect(aFechaISO(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('porcentajeDescuento calcula el % de una oferta y da 0 si no hay un precio normal mayor', () => {
    // Audífonos Andesia Pulse 7.1: $49.990 en oferta; su precio normal es $54.990
    expect(porcentajeDescuento(49990, 54990)).toBe(9)
    expect(porcentajeDescuento(59990, null)).toBe(0)
    expect(porcentajeDescuento(59990, 59990)).toBe(0)
  })

  it('iniciales toma la primera letra de las dos primeras palabras, en mayúscula', () => {
    expect(iniciales('camila rojas pérez')).toBe('CR')
    expect(iniciales('  Ana  ')).toBe('A')
    expect(iniciales()).toBe('')
  })

  it('plural elige la palabra según la cantidad', () => {
    expect(plural(1, 'unidad', 'unidades')).toBe('1 unidad')
    expect(plural(3, 'unidad', 'unidades')).toBe('3 unidades')
  })
})
