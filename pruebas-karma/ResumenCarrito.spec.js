
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ResumenCarrito from '../src/componentes/ResumenCarrito.jsx';

describe('ResumenCarrito - Jasmine', () => {

  it('muestra un mensaje cuando el carrito está vacío', () => {

    globalThis.IS_REACT_ACT_ENVIRONMENT = true;

    const contenedor = document.createElement('div');
    document.body.appendChild(contenedor);

    const raiz = createRoot(contenedor);

    try {
      act(() => {
        raiz.render(
          <ResumenCarrito
            articulos={[]}
            totales={{
              subtotal: 0,
              descuento: 0,
              total: 0
            }}
          />
        );
      });

      expect(contenedor.textContent).toContain(
        'Tu carrito está vacío.'
      );

    } finally {
      act(() => {
        raiz.unmount();
      });

      contenedor.remove();
    }

  });

});
