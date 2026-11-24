// Prueba adicional: un temporizador controlado con jasmine.clock() y un espía en lugar del portapapeles
import { act } from 'react'
import { montar } from '../pruebas/montar.js'
import BotonCopiar from './BotonCopiar.jsx'

describe('BotonCopiar', () => {
  let vista

  beforeEach(() => jasmine.clock().install())

  afterEach(() => {
    vista.desmontar()
    jasmine.clock().uninstall()
  })

  it('copia el código, muestra «¡Copiado!» y vuelve al texto original a los dos segundos', async () => {
    const copiar = jasmine.createSpy('copiar').and.resolveTo()
    vista = montar(<BotonCopiar texto="GAMER10" copiar={copiar} />)
    const boton = vista.contenedor.querySelector('button')

    await act(async () => boton.click())
    expect(copiar).toHaveBeenCalledOnceWith('GAMER10')
    expect(boton.textContent).toContain('¡Copiado!')

    // El reloj falso adelanta el tiempo sin esperar de verdad
    act(() => jasmine.clock().tick(1999))
    expect(boton.textContent).toContain('¡Copiado!')
    act(() => jasmine.clock().tick(1))
    expect(boton.textContent).toContain('Copiar código')
  })

  it('si el navegador no deja copiar, el botón no cambia', async () => {
    const copiar = jasmine.createSpy('copiar').and.rejectWith(new Error('Sin permiso'))
    vista = montar(<BotonCopiar texto="GAMER10" copiar={copiar} />)
    const boton = vista.contenedor.querySelector('button')

    await act(async () => boton.click())
    expect(boton.textContent).toContain('Copiar código')
  })
})
