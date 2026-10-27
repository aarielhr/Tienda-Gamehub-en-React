
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import TarjetaProducto from '../src/componentes/TarjetaProducto.jsx';

describe('Componente TarjetaProducto - Jasmine', () => {

  it('muestra nombre, precio y aviso de producto sin stock', () => {

    // Preparar el entorno para probar React
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;

    // Producto simulado sin stock
    const producto = {
      id: 3,
      nombre: 'Monitor ASUS TUF 24"',
      precio: 180000,
      stock: 0,
      imagen: '/images/Monitor ASUS TUF 24.jpg'
    };

    // Espía para comprobar que no se agreguen productos agotados
    const alAgregar = jasmine.createSpy('alAgregar');

    // Crear un contenedor en el DOM
    const contenedor = document.createElement('div');
    document.body.appendChild(contenedor);

    const raiz = createRoot(contenedor);

    try {
      // Renderizar el componente React
      act(() => {
        raiz.render(
          <TarjetaProducto
            producto={producto}
            alAgregar={alAgregar}
          />
        );
      });

      // Verificar nombre del producto
      expect(contenedor.textContent).toContain(
        'Monitor ASUS TUF 24"'
      );

      // Verificar precio
      expect(contenedor.textContent).toContain('$180.000');

      // Verificar aviso de stock
      expect(contenedor.textContent).toContain('Agotado');

      // Verificar que el botón está deshabilitado
      const boton = contenedor.querySelector('button');
      expect(boton.disabled).toBeTrue();

      // No debe permitir agregar el producto
      expect(alAgregar).not.toHaveBeenCalled();

    } finally {
      // Limpiar el componente después de la prueba
      act(() => {
        raiz.unmount();
      });

      contenedor.remove();
    }

  });

});
