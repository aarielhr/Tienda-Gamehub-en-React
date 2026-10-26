import { beforeEach, describe, expect, it } from 'vitest';
import { agregarProductoAlCarrito, aplicarCupon, actualizarCantidadCarrito } from './servicioCarrito.js';

describe('servicio del carrito', () => {
  beforeEach(() => localStorage.clear());

  it('agrega productos e incrementa la cantidad hasta el stock disponible', () => {
    const resultado = agregarProductoAlCarrito([], 1);
    expect(resultado.carrito).toHaveLength(1);
    expect(agregarProductoAlCarrito(resultado.carrito, 1).carrito[0].cantidad).toBe(2);
    expect(agregarProductoAlCarrito(resultado.carrito, 3).error).toBeTruthy();
  });

  it('aplica cupones válidos y rechaza los desconocidos', () => {
    expect(aplicarCupon(' setup2026 ').cupon).toEqual({ codigo: 'SETUP2026', descuento: 0.15 });
    expect(aplicarCupon('NOEXISTE').error).toBe('Cupón vencido o inexistente.');
  });

  it('limita la cantidad actualizada al stock del producto', () => {
    const articulo = { id: 1, cantidad: 1, stockMaximo: 5 };
    expect(actualizarCantidadCarrito([articulo], 1, 8)[0].cantidad).toBe(5);
    expect(actualizarCantidadCarrito([articulo], 1, 0)[0].cantidad).toBe(1);
  });
});
