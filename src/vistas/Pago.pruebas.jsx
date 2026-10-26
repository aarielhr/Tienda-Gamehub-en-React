import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Pago from './Pago.jsx';

vi.mock('../contexto/ProveedorCarrito.jsx', () => ({
  usarCarrito: () => ({
    carrito: [{ id: 1, nombre: 'Mouse Ajazz 139 Pro', precio: 45000, cantidad: 1, stockMaximo: 5, imagen: '/images/mouse-ajazz.jpg' }],
    vaciarCarrito: vi.fn()
  })
}));

afterEach(cleanup);
beforeEach(() => localStorage.clear());

describe('vista de pago', () => {
  it('valida los campos obligatorios y no registra una orden inválida', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Pago /></MemoryRouter>);

    await user.click(screen.getByRole('button', { name: 'Confirmar compra' }));

    expect(screen.getByText('Ingresa tu nombre completo (mínimo 3 caracteres).')).toBeInTheDocument();
    expect(screen.getByText('Selecciona un método de pago.')).toBeInTheDocument();
    expect(localStorage.getItem('gamehub_ordenes')).toBeNull();
  });

  it('crea una orden con el descuento del cupón y muestra la confirmación', async () => {
    const user = userEvent.setup();
    localStorage.setItem('gamehub_cupon', JSON.stringify({ codigo: 'SETUP2026', descuento: 0.15 }));
    render(<MemoryRouter><Pago /></MemoryRouter>);

    await user.type(screen.getByLabelText('Nombre completo'), 'Juan Pérez');
    await user.type(screen.getByLabelText('Correo electrónico'), 'juan@correo.cl');
    await user.type(screen.getByLabelText('Teléfono'), '912345678');
    await user.selectOptions(screen.getByLabelText('Región'), 'Valparaíso');
    await user.selectOptions(screen.getByLabelText('Comuna'), 'Quilpué');
    await user.type(screen.getByLabelText('Dirección'), 'Calle Central 123');
    await user.click(screen.getByLabelText('Tarjeta de crédito / débito'));
    await user.click(screen.getByRole('button', { name: 'Confirmar compra' }));

    expect(await screen.findByRole('heading', { name: '¡Compra confirmada!' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('gamehub_ordenes'))[0].total).toBe(38250);
    expect(localStorage.getItem('gamehub_carrito')).toBeNull();
    expect(localStorage.getItem('gamehub_cupon')).toBeNull();
  });
});
