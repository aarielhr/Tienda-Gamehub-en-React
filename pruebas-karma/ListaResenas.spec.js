
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ListaResenas from '../src/componentes/ListaResenas.jsx';

describe('ListaResenas - Jasmine', () => {

  it('ordena las reseñas por fecha y calcula el promedio', () => {

    globalThis.IS_REACT_ACT_ENVIRONMENT = true;

    // Datos simulados
    const resenas = [
      {
        id: 1,
        usuario: 'Juan',
        puntuacion: 5,
        comentario: 'Excelente producto',
        fecha: '2026-10-05'
      },
      {
        id: 2,
        usuario: 'Ana',
        puntuacion: 3,
        comentario: 'Buen producto',
        fecha: '2026-10-20'
      }
    ];

    // Preparar contenedor React
    const contenedor = document.createElement('div');
    document.body.appendChild(contenedor);

    const raiz = createRoot(contenedor);

    try {
      act(() => {
        raiz.render(
          <ListaResenas resenas={resenas} />
        );
      });

      // Verificar que se muestran las dos reseñas
      const elementos = contenedor.querySelectorAll(
        '.resena-item'
      );

      expect(elementos.length).toBe(2);

      // Ana debe aparecer primero porque su reseña es más reciente
      expect(elementos[0].textContent).toContain('Ana');

      // Juan debe aparecer después
      expect(elementos[1].textContent).toContain('Juan');

      // Promedio de 5 y 3 = 4
      expect(contenedor.textContent).toContain(
        'Puntuación promedio: 4.0 / 5'
      );

    } finally {
      // Limpiar el componente
      act(() => {
        raiz.unmount();
      });

      contenedor.remove();
    }

  });

});
