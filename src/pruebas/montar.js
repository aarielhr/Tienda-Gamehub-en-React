// Utilidades para montar componentes en las pruebas con react-dom/client dentro de act(),
// como permite el caso (sin una librería de testing extra).
import { act } from 'react'
import { createRoot } from 'react-dom/client'

// React necesita esta marca para aceptar act() fuera de una librería de testing
globalThis.IS_REACT_ACT_ENVIRONMENT = true

// Monta el elemento en un div del documento. Devuelve el contenedor y cómo desmontarlo.
export function montar(elemento) {
  const contenedor = document.createElement('div')
  document.body.appendChild(contenedor)
  const raiz = createRoot(contenedor)
  act(() => raiz.render(elemento))
  return {
    contenedor,
    texto: () => contenedor.textContent,
    actualizar: (nuevo) => act(() => raiz.render(nuevo)),
    desmontar() {
      act(() => raiz.unmount())
      contenedor.remove()
    },
  }
}

// Cambia el valor de un campo controlado como lo haría la persona usuaria. React vigila el valor con
// su propio "setter", por eso se usa el del prototipo y luego se dispara el evento que React escucha.
export function escribir(campo, valor) {
  const prototipo =
    campo instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : campo instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype
  const asignar = Object.getOwnPropertyDescriptor(prototipo, 'value').set
  act(() => {
    asignar.call(campo, valor)
    campo.dispatchEvent(new Event(campo instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }))
  })
}

// onBlur de React escucha el evento focusout
export function salir(campo) {
  act(() => campo.dispatchEvent(new FocusEvent('focusout', { bubbles: true })))
}

export function hacerClic(elemento) {
  act(() => elemento.click())
}

// Envía el formulario aunque el botón esté deshabilitado (como al presionar Enter en un campo)
export function enviar(formulario) {
  act(() => formulario.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
}

// Llama a una función que cambia el estado (por ejemplo, una acción del carrito) dentro de act()
// y devuelve lo que ella devuelve
export function ejecutar(accion) {
  let resultado
  act(() => {
    resultado = accion()
  })
  return resultado
}

// Espera a que terminen las promesas pendientes, como la respuesta de un fetch simulado, y aplica
// dentro de act() los cambios de estado que provocan. El setTimeout deja correr todas las promesas antes.
export async function esperarRespuestas() {
  await act(() => new Promise((listo) => setTimeout(listo, 0)))
}
