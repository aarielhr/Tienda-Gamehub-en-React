
import { calcularTotal } from '../src/utilidades/formato.js';

describe('Cálculo del total - Jasmine', () => {

  it('resta descuentos sin generar totales negativos', () => {

    // Subtotal: 1000, descuento: 200
    expect(calcularTotal(1000, 200)).toBe(800);

    // El descuento supera al subtotal
    expect(calcularTotal(1000, 1200)).toBe(0);

    // Sin descuento
    expect(calcularTotal(1000, 0)).toBe(1000);

  });

});
