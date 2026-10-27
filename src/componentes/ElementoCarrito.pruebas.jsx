import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import ElementoCarrito from './ElementoCarrito.jsx';

const articulo = {
  id: 8,
  nombre: 'Teclado de prueba',
  precio: 12000,
  cantidad: 2,
  stockMaximo: 5,
  imagen: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
};

afterEach(cleanup);

describe('elemento del carrito', () => {
  it('muestra el nombre, precio unitario y subtotal del artículo', () => {
    render(<ElementoCarrito articulo={articulo} alCambiarCantidad={() => {}} alQuitar={() => {}} />);

    expect(screen.getByRole('heading', { name: 'Teclado de prueba' })).not.toBeNull();
    expect(screen.getByText('Precio unitario: $12.000')).not.toBeNull();
    expect(screen.getByText('$24.000')).not.toBeNull();
  });

  it('notifica el cambio de cantidad cuando el valor es un entero válido', () => {
    const alCambiarCantidad = jasmine.createSpy('alCambiarCantidad');
    render(<ElementoCarrito articulo={articulo} alCambiarCantidad={alCambiarCantidad} alQuitar={() => {}} />);

    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '3' } });

    expect(alCambiarCantidad).toHaveBeenCalledOnceWith(articulo.id, 3);
  });

  it('limita la cantidad ingresada al stock máximo', () => {
    const alCambiarCantidad = jasmine.createSpy('alCambiarCantidad');
    render(<ElementoCarrito articulo={articulo} alCambiarCantidad={alCambiarCantidad} alQuitar={() => {}} />);

    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '9' } });

    expect(alCambiarCantidad).toHaveBeenCalledOnceWith(articulo.id, articulo.stockMaximo);
    expect(screen.getByLabelText('Cantidad').value).toBe('5');
  });

  it('restaura la cantidad del artículo si se ingresa un valor no válido', () => {
    const alCambiarCantidad = jasmine.createSpy('alCambiarCantidad');
    render(<ElementoCarrito articulo={articulo} alCambiarCantidad={alCambiarCantidad} alQuitar={() => {}} />);

    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '0' } });

    expect(alCambiarCantidad).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Cantidad').value).toBe('2');
  });

  it('notifica qué artículo debe quitarse', () => {
    const alQuitar = jasmine.createSpy('alQuitar');
    render(<ElementoCarrito articulo={articulo} alCambiarCantidad={() => {}} alQuitar={alQuitar} />);

    fireEvent.click(screen.getByRole('button', { name: 'Quitar Teclado de prueba' }));

    expect(alQuitar).toHaveBeenCalledOnceWith(articulo.id);
  });
});
