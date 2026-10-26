import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Catalogo from './Catalogo.jsx';

afterEach(cleanup);

vi.mock('../contexto/ProveedorCarrito.jsx', () => ({
  usarCarrito: () => ({ agregarProducto: vi.fn() })
}));

describe('vista del catálogo', () => {
  it('muestra los productos y permite cargar el resto de forma incremental', async () => {
    render(<MemoryRouter><Catalogo /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Catálogo de productos' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Mouse Ajazz 139 Pro' })).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Cargar más productos' }));
    expect(await screen.findByRole('heading', { name: 'Mouse ATK Blazing Sky' })).toBeInTheDocument();
  });

  it('muestra un error si el precio mínimo supera el máximo', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Catalogo /></MemoryRouter>);
    await user.type(screen.getByLabelText('Mínimo'), '300000');
    await user.type(screen.getByLabelText('Máximo'), '200000');
    await user.click(screen.getByRole('button', { name: 'Aplicar filtros', exact: true }));
    expect(screen.getByRole('alert')).toHaveTextContent('El mínimo no puede ser mayor al máximo.');
  });
});
