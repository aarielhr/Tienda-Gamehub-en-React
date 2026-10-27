
import { calcularTotales } from '../src/utilidades/formato.js';

describe('Pruebas del carrito - Jasmine', () => {

  it('debe calcular correctamente el subtotal', () => {
    const productos = [
      { precio: 1000, cantidad: 2 },
      { precio: 500, cantidad: 1 }
    ];

    const resultado = calcularTotales(productos);

    expect(resultado.subtotal).toBe(2500);
  });

});
