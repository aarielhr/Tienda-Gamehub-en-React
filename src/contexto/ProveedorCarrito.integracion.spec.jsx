import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ProveedorCarrito, usarCarrito } from './ProveedorCarrito.jsx';

const PRODUCTO = {
  id: 2,
  nombre: 'Tarjeta gráfica Voltra X70 OC 12 GB',
  marca: 'Voltra',
  sku: 'GPU-VOL-X70',
  categoria: 'Tarjetas gráficas',
  imagen: 'gpu',
  precio: 649990,
  stock: 12,
};

function PruebaCarrito() {
  const { carrito, agregarProducto } = usarCarrito();
  return (
    <>
      <button type="button" onClick={() => agregarProducto(PRODUCTO, 2)}>Agregar producto backend</button>
      <output data-testid="lineas">{JSON.stringify(carrito)}</output>
    </>
  );
}

describe('integración del carrito EV2 con los productos del backend', () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  it('agrega el producto recibido de la API sin buscar su id en el catálogo simulado', () => {
    localStorage.setItem('gamehub_carrito', JSON.stringify({ lineas: [], cupon: null }));
    render(<ProveedorCarrito><PruebaCarrito /></ProveedorCarrito>);

    act(() => fireEvent.click(screen.getByRole('button', { name: 'Agregar producto backend' })));

    const carrito = JSON.parse(screen.getByTestId('lineas').textContent);
    expect(carrito).toEqual([jasmine.objectContaining({
      id: PRODUCTO.id,
      productoId: PRODUCTO.id,
      nombre: PRODUCTO.nombre,
      precio: PRODUCTO.precio,
      cantidad: 2,
      stock: PRODUCTO.stock,
      stockMaximo: PRODUCTO.stock,
    })]);
    expect(JSON.parse(localStorage.getItem('gamehub_carrito'))).toEqual(carrito);
  });
});
