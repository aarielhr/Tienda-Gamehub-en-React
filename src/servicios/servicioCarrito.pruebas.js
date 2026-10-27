import {
  agregarProductoAlCarrito,
  aplicarCupon,
  actualizarCantidadCarrito,
  guardarCarrito,
  limpiarAlmacenamientoCarrito
} from './servicioCarrito.js';
import { CLAVES_ALMACENAMIENTO } from './almacenamiento.js';

describe('servicio del carrito', () => {
  beforeEach(() => localStorage.clear());

  it('agrega productos e incrementa la cantidad hasta el stock disponible', () => {
    const resultado = agregarProductoAlCarrito([], 1);
    expect(resultado.carrito.length).toBe(1);
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

  it('guarda el carrito usando el almacenamiento local', () => {
    const carrito = [{ id: 1, cantidad: 2 }];
    const guardar = spyOn(Storage.prototype, 'setItem').and.callThrough();

    guardarCarrito(carrito);

    expect(guardar).toHaveBeenCalledWith(CLAVES_ALMACENAMIENTO.carrito, JSON.stringify(carrito));
  });

  it('rechaza un identificador de producto inexistente sin cambiar el carrito', () => {
    const carrito = [{ id: 1, cantidad: 1 }];

    const resultado = agregarProductoAlCarrito(carrito, 999);

    expect(resultado.carrito).toBe(carrito);
    expect(resultado.error).toBe('Este producto no tiene stock disponible.');
  });

  it('rechaza un producto agotado', () => {
    const resultado = agregarProductoAlCarrito([], 3);

    expect(resultado.error).toBe('Este producto no tiene stock disponible.');
    expect(resultado.carrito).toEqual([]);
  });

  it('incluye la información del producto al agregarlo por primera vez', () => {
    const resultado = agregarProductoAlCarrito([], 1);

    expect(resultado.carrito[0]).toEqual({
      id: 1,
      nombre: 'Mouse Ajazz 139 Pro',
      precio: 45000,
      cantidad: 1,
      stockMaximo: 5,
      imagen: '/images/mouse-ajazz.jpg'
    });
    expect(resultado.mensaje).toContain('agregado al carrito');
  });

  it('no supera el stock disponible al agregar un producto existente', () => {
    const carrito = [{ id: 1, cantidad: 5 }];

    const resultado = agregarProductoAlCarrito(carrito, 1);

    expect(resultado.carrito).toBe(carrito);
    expect(resultado.error).toContain('No hay más stock');
  });

  it('actualiza el producto indicado y conserva los demás artículos', () => {
    const carrito = [
      { id: 1, cantidad: 1, stockMaximo: 5 },
      { id: 2, cantidad: 2, stockMaximo: 3 }
    ];

    const actualizado = actualizarCantidadCarrito(carrito, 1, 4);

    expect(actualizado[0].cantidad).toBe(4);
    expect(actualizado[1]).toEqual(carrito[1]);
    expect(carrito[0].cantidad).toBe(1);
  });

  it('conserva el carrito cuando se actualiza un identificador que no existe', () => {
    const carrito = [{ id: 1, cantidad: 2, stockMaximo: 5 }];

    expect(actualizarCantidadCarrito(carrito, 7, 4)).toEqual(carrito);
  });

  it('aplica el cupón DUOC10 sin distinguir mayúsculas y minúsculas', () => {
    const resultado = aplicarCupon(' duoc10 ');

    expect(resultado.cupon).toEqual({ codigo: 'DUOC10', descuento: 0.1 });
    expect(JSON.parse(localStorage.getItem(CLAVES_ALMACENAMIENTO.cupon))).toEqual(resultado.cupon);
  });

  it('elimina el cupón guardado si se intenta aplicar un código inválido', () => {
    localStorage.setItem(CLAVES_ALMACENAMIENTO.cupon, JSON.stringify({ codigo: 'DUOC10', descuento: 0.1 }));

    aplicarCupon('INVALIDO');

    expect(localStorage.getItem(CLAVES_ALMACENAMIENTO.cupon)).toBeNull();
  });

  it('elimina del almacenamiento el carrito y el cupón al limpiar', () => {
    const quitar = spyOn(Storage.prototype, 'removeItem').and.callThrough();
    localStorage.setItem(CLAVES_ALMACENAMIENTO.carrito, '[]');
    localStorage.setItem(CLAVES_ALMACENAMIENTO.cupon, '{}');

    limpiarAlmacenamientoCarrito();

    expect(quitar).toHaveBeenCalledWith(CLAVES_ALMACENAMIENTO.carrito);
    expect(quitar).toHaveBeenCalledWith(CLAVES_ALMACENAMIENTO.cupon);
    expect(localStorage.getItem(CLAVES_ALMACENAMIENTO.carrito)).toBeNull();
    expect(localStorage.getItem(CLAVES_ALMACENAMIENTO.cupon)).toBeNull();
  });
});
