import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProveedorCarrito } from '../contexto/ProveedorCarrito.jsx';
import { CLAVES_ALMACENAMIENTO } from '../servicios/almacenamiento.js';
import Carrito from './Carrito.jsx';

const articulo = {
  id: 1,
  nombre: 'Mouse Ajazz 139 Pro',
  precio: 45000,
  cantidad: 1,
  stockMaximo: 5,
  imagen: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
};

function mostrarCarrito({ vacio = false, cupon } = {}) {
  localStorage.clear();
  if (!vacio) localStorage.setItem(CLAVES_ALMACENAMIENTO.carrito, JSON.stringify([articulo]));
  if (cupon) localStorage.setItem(CLAVES_ALMACENAMIENTO.cupon, JSON.stringify(cupon));

  return render(
    <MemoryRouter>
      <ProveedorCarrito hijos={<Carrito />} />
    </MemoryRouter>
  );
}

afterEach(cleanup);

describe('vista del carrito', () => {
  it('muestra un enlace al catálogo cuando el carrito está vacío', () => {
    mostrarCarrito({ vacio: true });

    expect(screen.getByText(/Carrito vacío/)).not.toBeNull();
    expect(screen.getByRole('link', { name: 'catálogo' }).getAttribute('href')).toBe('/catalogo.html');
  });

  it('muestra el artículo y un enlace para continuar al pago', () => {
    mostrarCarrito();

    expect(screen.getByRole('heading', { name: 'Mouse Ajazz 139 Pro' })).not.toBeNull();
    expect(screen.getByRole('link', { name: 'Ir a pagar' }).getAttribute('href')).toBe('/checkout.html');
  });

  it('aplica un cupón válido y muestra el mensaje de confirmación', () => {
    mostrarCarrito();
    fireEvent.change(screen.getByLabelText('Código de descuento'), { target: { value: 'SETUP2026' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(screen.getByRole('status').textContent).toContain('Cupón aplicado exitosamente');
    expect(JSON.parse(localStorage.getItem(CLAVES_ALMACENAMIENTO.cupon))).toEqual({
      codigo: 'SETUP2026',
      descuento: 0.15
    });
  });

  it('muestra un error al aplicar un cupón desconocido', () => {
    mostrarCarrito();
    fireEvent.change(screen.getByLabelText('Código de descuento'), { target: { value: 'NOEXISTE' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));

    expect(screen.getByRole('status').textContent).toContain('Cupón vencido o inexistente');
    expect(localStorage.getItem(CLAVES_ALMACENAMIENTO.cupon)).toBeNull();
  });

  it('inicializa el campo con el cupón que ya estaba guardado', () => {
    mostrarCarrito({ cupon: { codigo: 'DUOC10', descuento: 0.1 } });

    expect(screen.getByLabelText('Código de descuento').value).toBe('DUOC10');
  });

  it('vacía los artículos y elimina el cupón almacenado', () => {
    mostrarCarrito({ cupon: { codigo: 'DUOC10', descuento: 0.1 } });
    fireEvent.click(screen.getByRole('button', { name: 'Vaciar carrito' }));

    expect(screen.getByText(/Carrito vacío/)).not.toBeNull();
    expect(localStorage.getItem(CLAVES_ALMACENAMIENTO.carrito)).toBeNull();
    expect(localStorage.getItem(CLAVES_ALMACENAMIENTO.cupon)).toBeNull();
  });

  it('permite quitar un artículo del carrito', () => {
    mostrarCarrito();
    fireEvent.click(screen.getByRole('button', { name: 'Quitar Mouse Ajazz 139 Pro' }));

    expect(screen.getByText(/Carrito vacío/)).not.toBeNull();
  });

  it('actualiza la cantidad y el contenido persistido al cambiar el control', () => {
    mostrarCarrito();
    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '3' } });

    expect(JSON.parse(localStorage.getItem(CLAVES_ALMACENAMIENTO.carrito))[0].cantidad).toBe(3);
  });
});
