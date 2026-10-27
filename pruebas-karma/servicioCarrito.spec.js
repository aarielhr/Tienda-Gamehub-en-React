
import {
  agregarProductoAlCarrito,
  actualizarCantidadCarrito
} from '../src/servicios/servicioCarrito.js';

describe('Pruebas del carrito - Jasmine', () => {

  // Prueba 2: Incrementar cantidad sin duplicar.
  it('incrementa la cantidad de un producto existente', () => {
    const primero = agregarProductoAlCarrito([], 1);

    const segundo = agregarProductoAlCarrito(
      primero.carrito,
      1
    );

    expect(segundo.carrito.length).toBe(1);
    expect(segundo.carrito[0].cantidad).toBe(2);
  });

  // Prueba 3: Respetar el stock disponible.
  it('no permite superar el stock disponible', () => {
    const carrito = [
      { id: 1, cantidad: 1, stockMaximo: 5 }
    ];

    const resultado = actualizarCantidadCarrito(
      carrito,
      1,
      10
    );

    expect(resultado[0].cantidad).toBe(5);
  });

});
