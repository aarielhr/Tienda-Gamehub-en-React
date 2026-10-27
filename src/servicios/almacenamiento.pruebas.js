import {
  CLAVES_ALMACENAMIENTO,
  guardarAlmacenamiento,
  leerAlmacenamiento,
  obtenerCarrito,
  obtenerCupon,
  obtenerOrdenes
} from './almacenamiento.js';

describe('servicio de almacenamiento', () => {
  beforeEach(() => localStorage.clear());

  it('devuelve el valor alternativo cuando la clave no existe', () => {
    expect(leerAlmacenamiento('clave-ausente', 'alternativo')).toBe('alternativo');
  });

  it('interpreta como JSON el valor persistido', () => {
    localStorage.setItem('preferencias', JSON.stringify({ tema: 'oscuro' }));

    expect(leerAlmacenamiento('preferencias', {})).toEqual({ tema: 'oscuro' });
  });

  it('propaga el error si el contenido guardado no es JSON válido', () => {
    localStorage.setItem('preferencias', '{invalido');

    expect(() => leerAlmacenamiento('preferencias', {})).toThrowError(SyntaxError);
  });

  it('serializa los valores antes de guardarlos', () => {
    const guardar = spyOn(Storage.prototype, 'setItem').and.callThrough();
    const valor = { habilitado: true };

    guardarAlmacenamiento('preferencias', valor);

    expect(guardar).toHaveBeenCalledWith('preferencias', JSON.stringify(valor));
    expect(JSON.parse(localStorage.getItem('preferencias'))).toEqual(valor);
  });

  it('devuelve una lista vacía si no hay carrito guardado', () => {
    expect(obtenerCarrito()).toEqual([]);
  });

  it('devuelve nulo si no hay cupón guardado', () => {
    expect(obtenerCupon()).toBeNull();
  });

  it('devuelve una lista vacía si no hay órdenes guardadas', () => {
    expect(obtenerOrdenes()).toEqual([]);
    expect(CLAVES_ALMACENAMIENTO.ordenes).toBe('gamehub_ordenes');
  });
});
