import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProveedorCarrito } from '../contexto/ProveedorCarrito.jsx';
import Pago from './Pago.jsx';

afterEach(cleanup);
const carritoDePrueba = [{ id: 1, nombre: 'Mouse Ajazz 139 Pro', precio: 45000, cantidad: 1, stockMaximo: 5, imagen: '/images/mouse-ajazz.jpg' }];

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('gamehub_carrito', JSON.stringify(carritoDePrueba));
});

describe('vista de pago', () => {
  it('valida los campos obligatorios y no registra una orden inválida', () => {
    render(<MemoryRouter><ProveedorCarrito hijos={<Pago />} /></MemoryRouter>);

  const boton = screen.getByRole('button', { name: 'Confirmar compra' });
  expect(boton.disabled).toBeTrue();

  fireEvent.change(screen.getByLabelText('Dirección'), {
  target: { value: 'Calle Central 123' }
  });

expect(boton.disabled).toBeFalse();
fireEvent.click(boton);

    expect(screen.getByText('Ingresa tu nombre completo (mínimo 3 caracteres).')).not.toBeNull();
    expect(screen.getByText('Selecciona un método de pago.')).not.toBeNull();
    expect(localStorage.getItem('gamehub_ordenes')).toBeNull();
  });

  it('crea una orden con el descuento del cupón y muestra la confirmación', () => {
    localStorage.setItem('gamehub_cupon', JSON.stringify({ codigo: 'SETUP2026', descuento: 0.15 }));
    const guardar = spyOn(Storage.prototype, 'setItem').and.callThrough();
    render(<MemoryRouter><ProveedorCarrito hijos={<Pago />} /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Juan Pérez' } });
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'juan@correo.cl' } });
    fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '912345678' } });
    fireEvent.change(screen.getByLabelText('Región'), { target: { value: 'Valparaíso' } });
    fireEvent.change(screen.getByLabelText('Comuna'), { target: { value: 'Quilpué' } });
    fireEvent.change(screen.getByLabelText('Dirección'), { target: { value: 'Calle Central 123' } });
    fireEvent.click(screen.getByLabelText('Tarjeta de crédito / débito'));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar compra' }));

    expect(screen.getByRole('heading', { name: '¡Compra confirmada!' })).not.toBeNull();
    expect(JSON.parse(localStorage.getItem('gamehub_ordenes'))[0].total).toBe(38250);
    expect(localStorage.getItem('gamehub_carrito')).toBeNull();
    expect(localStorage.getItem('gamehub_cupon')).toBeNull();
    expect(guardar).toHaveBeenCalledWith('gamehub_ordenes', jasmine.any(String));
  });
});
