import { describe, expect, it } from 'vitest';
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
});
