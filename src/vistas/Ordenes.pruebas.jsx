import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CLAVES_ALMACENAMIENTO } from '../servicios/almacenamiento.js';
import Ordenes from './Ordenes.jsx';

afterEach(cleanup);

function mostrarOrdenes(ordenes = []) {
  localStorage.setItem(CLAVES_ALMACENAMIENTO.ordenes, JSON.stringify(ordenes));
  return render(<MemoryRouter><Ordenes /></MemoryRouter>);
}

describe('vista de órdenes', () => {
  it('invita a comprar cuando todavía no hay órdenes', () => {
    mostrarOrdenes();

    expect(screen.getByText(/No tienes órdenes aún/)).not.toBeNull();
    expect(screen.getByRole('link', { name: 'catálogo' }).getAttribute('href')).toBe('/catalogo.html');
  });

  it('muestra encabezados para los datos de las órdenes', () => {
    mostrarOrdenes([{ numero: 'GH-123456', fecha: '26-10-2026', total: 24000, estado: 'Pendiente' }]);

    expect(screen.getByRole('columnheader', { name: 'Número de orden' })).not.toBeNull();
    expect(screen.getByRole('columnheader', { name: 'Fecha' })).not.toBeNull();
    expect(screen.getByRole('columnheader', { name: 'Total' })).not.toBeNull();
    expect(screen.getByRole('columnheader', { name: 'Estado' })).not.toBeNull();
  });

  it('presenta los valores persistidos de la orden', () => {
    mostrarOrdenes([{ numero: 'GH-123456', fecha: '26-10-2026', total: 24000, estado: 'Pendiente' }]);

    expect(screen.getByRole('cell', { name: 'GH-123456' })).not.toBeNull();
    expect(screen.getByRole('cell', { name: '26-10-2026' })).not.toBeNull();
    expect(screen.getByRole('cell', { name: '$24.000' })).not.toBeNull();
    expect(screen.getByRole('cell', { name: 'Pendiente' })).not.toBeNull();
  });
});
