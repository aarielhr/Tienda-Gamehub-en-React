import { crearOrden } from './servicioOrdenes.js';
import { CLAVES_ALMACENAMIENTO } from './almacenamiento.js';

describe('servicio de órdenes', () => {
  it('lee las órdenes guardadas y persiste la nueva orden', () => {
    const leer = spyOn(Storage.prototype, 'getItem').and.returnValue(null);
    const guardar = spyOn(Storage.prototype, 'setItem');
    const fechaActual = new Date('2026-01-02T03:04:05.000Z');

    const orden = crearOrden(1200, fechaActual);

    expect(leer).toHaveBeenCalledWith(CLAVES_ALMACENAMIENTO.ordenes);
    expect(guardar).toHaveBeenCalledWith(CLAVES_ALMACENAMIENTO.ordenes, jasmine.any(String));
    expect(orden.total).toBe(1200);
    expect(orden.estado).toBe('Pendiente');
  });

  it('añade la nueva orden sin reemplazar las órdenes existentes', () => {
    const existente = { numero: 'GH-111111', total: 500, estado: 'Pendiente' };
    localStorage.setItem(CLAVES_ALMACENAMIENTO.ordenes, JSON.stringify([existente]));

    crearOrden(900, new Date(123456789));

    const ordenes = JSON.parse(localStorage.getItem(CLAVES_ALMACENAMIENTO.ordenes));
    expect(ordenes.length).toBe(2);
    expect(ordenes[0]).toEqual(existente);
    expect(ordenes[1].numero).toBe('GH-456789');
  });

  it('usa la fecha recibida para completar el número de orden', () => {
    const fechaActual = new Date(987654321);

    const orden = crearOrden(100, fechaActual);

    expect(orden.numero).toBe(`GH-${fechaActual.getTime().toString().slice(-6)}`);
    expect(orden.fecha).toBe(fechaActual.toLocaleDateString('es-CL'));
  });
});
