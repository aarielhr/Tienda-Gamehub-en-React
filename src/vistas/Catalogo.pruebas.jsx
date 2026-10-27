import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProveedorCarrito } from '../contexto/ProveedorCarrito.jsx';
import Catalogo from './Catalogo.jsx';

afterEach(cleanup);

describe('vista del catálogo', () => {
  it('muestra los productos y permite cargar el resto de forma incremental', () => {
    render(<MemoryRouter><ProveedorCarrito hijos={<Catalogo />} /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Catálogo de productos' })).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'Mouse Ajazz 139 Pro' })).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Cargar más productos' }));
    expect(screen.getByRole('heading', { name: 'Mouse ATK Blazing Sky' })).not.toBeNull();
  });

  it('muestra un error si el precio mínimo supera el máximo', () => {
    render(<MemoryRouter><ProveedorCarrito hijos={<Catalogo />} /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Mínimo'), { target: { value: '300000' } });
    fireEvent.change(screen.getByLabelText('Máximo'), { target: { value: '200000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros', exact: true }));
    expect(screen.getByRole('alert').textContent).toContain('El mínimo no puede ser mayor al máximo.');
  });

  it('ordena los productos por precio descendente al aplicar el filtro', () => {
    render(<MemoryRouter><ProveedorCarrito hijos={<Catalogo />} /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Ordenar por'), { target: { value: 'precio-desc' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros', exact: true }));

    const nombres = screen.getAllByRole('heading', { level: 2 })
      .map((encabezado) => encabezado.textContent)
      .filter((nombre) => nombre !== 'Filtros');
    expect(nombres.slice(0, 3)).toEqual([
      'Tarjeta Gráfica ASUS RTX 4060',
      'Monitor ASUS TUF 24"',
      'Teclado Ajazz AK820'
    ]);
  });

  it('informa cuando los filtros no encuentran productos', () => {
    render(<MemoryRouter><ProveedorCarrito hijos={<Catalogo />} /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Marca'), { target: { value: 'asus' } });
    fireEvent.change(screen.getByLabelText('Mínimo'), { target: { value: '200000' } });
    fireEvent.change(screen.getByLabelText('Máximo'), { target: { value: '300000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros', exact: true }));

    expect(screen.getByText('No se encontraron productos con esos filtros.')).not.toBeNull();
  });

  it('oculta el error después de aplicar un rango de precios válido', () => {
    render(<MemoryRouter><ProveedorCarrito hijos={<Catalogo />} /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Mínimo'), { target: { value: '300000' } });
    fireEvent.change(screen.getByLabelText('Máximo'), { target: { value: '200000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros', exact: true }));
    fireEvent.change(screen.getByLabelText('Máximo'), { target: { value: '400000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros', exact: true }));

    expect(screen.queryByRole('alert')).toBeNull();
  });
});
