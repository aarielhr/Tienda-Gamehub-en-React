import { calcularTotales, formatearMoneda } from './formato.js';

describe('formato y totales de la orden', () => {
  it('calcula subtotal, descuento del cupón y total', () => {
    expect(calcularTotales([
      { precio: 1000, cantidad: 2 },
      { precio: 500, cantidad: 1 }
    ], 0.1)).toEqual({ subtotal: 2500, descuento: 250, total: 2250 });
  });

  it('no aplica un descuento mayor que el subtotal', () => {
    expect(calcularTotales([{ precio: 100, cantidad: 1 }], 2)).toEqual({ subtotal: 100, descuento: 100, total: 0 });
  });

  it('formatea los montos en moneda chilena', () => {
    expect(formatearMoneda(45000)).toBe('$45.000');
  });

  it('calcula el total sin descuento cuando no se especifica uno', () => {
    expect(calcularTotales([{ precio: 800, cantidad: 3 }])).toEqual({
      subtotal: 2400,
      descuento: 0,
      total: 2400
    });
  });

  it('devuelve totales en cero cuando no hay artículos', () => {
    expect(calcularTotales([])).toEqual({ subtotal: 0, descuento: 0, total: 0 });
  });

  it('formatea correctamente el monto cero', () => {
    expect(formatearMoneda(0)).toBe('$0');
  });
});
