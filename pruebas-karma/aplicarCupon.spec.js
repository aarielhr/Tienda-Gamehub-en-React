
import { aplicarCupon } from '../src/servicios/servicioCarrito.js';

describe('Cupones de descuento - Jasmine', () => {

  beforeEach(() => {
    localStorage.clear();
  });

  it('calcula el descuento respetando el tope máximo', () => {

    // Crear el espía DENTRO de la prueba
    const espiaAlmacenamiento = spyOn(
      Storage.prototype,
      'setItem'
    ).and.callThrough();

    // Prueba 1: descuento del 15% con tope de $10.000
    const resultado = aplicarCupon('SETUP2026', 100000);

    expect(resultado.montoDescuento).toBe(10000);

    // Prueba 2: descuento del 10% sobre $20.000
    const segundo = aplicarCupon('DUOC10', 20000);

    expect(segundo.montoDescuento).toBe(2000);

    // Verificar que se guardó el cupón en localStorage
    expect(espiaAlmacenamiento).toHaveBeenCalledWith(
      'gamehub_cupon',
      jasmine.any(String)
    );

  });

});
