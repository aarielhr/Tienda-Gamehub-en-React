import { act, cleanup, render, screen } from '@testing-library/react';
import { CLAVES_ALMACENAMIENTO } from '../servicios/almacenamiento.js';
import { ProveedorCarrito, usarCarrito } from '../contexto/ProveedorCarrito.jsx';

function ConteoCarrito() {
  const { cantidadArticulos } = usarCarrito();
  return <output>{cantidadArticulos}</output>;
}

afterEach(cleanup);

describe('proveedor del carrito', () => {
  it('registra y retira el manejador de sincronización de almacenamiento', () => {
    const agregarEscucha = spyOn(window, 'addEventListener').and.callThrough();
    const quitarEscucha = spyOn(window, 'removeEventListener').and.callThrough();
    const { unmount } = render(<ProveedorCarrito hijos={<ConteoCarrito />} />);
    const registro = agregarEscucha.calls.allArgs().find(([tipo]) => tipo === 'storage');

    expect(registro).toBeDefined();
    expect(registro[0]).toBe('storage');

    const sincronizarCarrito = registro[1];
    localStorage.setItem(CLAVES_ALMACENAMIENTO.carrito, JSON.stringify([{ id: 1, cantidad: 3 }]));
    act(() => sincronizarCarrito({ key: CLAVES_ALMACENAMIENTO.carrito }));

    expect(screen.getByText('3')).not.toBeNull();

    unmount();
    expect(quitarEscucha).toHaveBeenCalledWith('storage', sincronizarCarrito);
  });
});
