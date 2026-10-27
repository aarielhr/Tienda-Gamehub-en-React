import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import TarjetaProducto from './TarjetaProducto.jsx';

afterEach(() => {
  cleanup();
  jasmine.clock().uninstall();
});

describe('tarjeta de producto', () => {
  it('espía el manejador de agregar y restablece el botón al vencer el temporizador', () => {
    jasmine.clock().install();
    const alAgregar = jasmine.createSpy('alAgregar').and.returnValue(true);
    const producto = {
      id: 1,
      nombre: 'Mouse de prueba',
      precio: 45000,
      stock: 5,
      imagen: '/images/mouse-ajazz.jpg'
    };

    render(<TarjetaProducto producto={producto} alAgregar={alAgregar} />);
    const boton = screen.getByRole('button', { name: 'Agregar al carrito' });
    fireEvent.click(boton);

    expect(alAgregar).toHaveBeenCalledOnceWith(producto.id);
    expect(screen.getByRole('button', { name: 'Agregado' })).not.toBeNull();

    act(() => jasmine.clock().tick(1600));

    expect(screen.getByRole('button', { name: 'Agregar al carrito' })).not.toBeNull();
  });
});
