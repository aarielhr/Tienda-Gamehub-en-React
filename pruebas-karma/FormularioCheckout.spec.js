
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import FormularioCheckout from '../src/componentes/FormularioCheckout.jsx';

describe('FormularioCheckout - Jasmine', () => {

  it('bloquea el envío si falta la dirección', () => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;

    const contenedor = document.createElement('div');
    document.body.appendChild(contenedor);

    const raiz = createRoot(contenedor);

    // Espía para verificar que no se envía el formulario
    const alConfirmar = jasmine.createSpy('alConfirmar');

    try {
      act(() => {
        raiz.render(
          <FormularioCheckout
            direccion=""
            alConfirmar={alConfirmar}
          />
        );
      });

      const boton = contenedor.querySelector('button');

      // Debe estar deshabilitado
      expect(boton.disabled).toBeTrue();

      // Intentamos presionar el botón
      act(() => {
        boton.click();
      });

      // El formulario no debe enviarse
      expect(alConfirmar).not.toHaveBeenCalled();

      // Ahora proporcionamos una dirección
      act(() => {
        raiz.render(
          <FormularioCheckout
            direccion="Calle Central 123"
            alConfirmar={alConfirmar}
          />
        );
      });

      // Ahora se permite presionar el botón
      expect(boton.disabled).toBeFalse();

    } finally {
      act(() => {
        raiz.unmount();
      });

      contenedor.remove();
    }
  });

});
