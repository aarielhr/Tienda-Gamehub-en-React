// Prueba 9 del listado obligatorio y, al final, pruebas adicionales de cada campo y de los avisos
import { enviar, escribir, hacerClic, montar, salir } from '../pruebas/montar.js'
import FormularioCheckout from './FormularioCheckout.jsx'

// Todos los datos de despacho listos, salvo la dirección
const SIN_DIRECCION = {
  nombre: 'Camila Rojas',
  correo: 'camila@correo.cl',
  telefono: '912345678',
  region: 'Región Metropolitana de Santiago',
  comuna: 'Ñuñoa',
  direccion: '',
}

describe('FormularioCheckout', () => {
  let vista
  let onConfirmar

  beforeEach(() => {
    // Espía: reemplaza al manejador real y registra si lo llamaron y con qué datos
    onConfirmar = jasmine.createSpy('onConfirmar')
    vista = montar(<FormularioCheckout datosIniciales={SIN_DIRECCION} total={59990} onConfirmar={onConfirmar} />)
  })

  afterEach(() => vista.desmontar())

  it('(9) mantiene deshabilitado el envío mientras falte la dirección de despacho', () => {
    const boton = vista.contenedor.querySelector('button[type="submit"]')
    expect(boton.disabled).toBeTrue()

    // Aunque se fuerce el envío del formulario (por ejemplo con Enter), el manejador no se llama
    enviar(vista.contenedor.querySelector('form'))
    expect(onConfirmar).not.toHaveBeenCalled()
    expect(vista.texto()).toContain('Escribe la dirección de despacho')
  })

  it('al completar la dirección se habilita y envía los datos al manejador', () => {
    escribir(vista.contenedor.querySelector('#direccion'), 'Av. Los Aromos 1450')

    const boton = vista.contenedor.querySelector('button[type="submit"]')
    expect(boton.disabled).toBeFalse()
    hacerClic(boton)

    expect(onConfirmar).toHaveBeenCalledTimes(1)
    expect(onConfirmar).toHaveBeenCalledWith(jasmine.objectContaining({ direccion: 'Av. Los Aromos 1450', comuna: 'Ñuñoa', metodoPago: 'DEBITO' }))
  })
})

describe('FormularioCheckout · cada campo y sus avisos', () => {
  const COMPLETOS = { ...SIN_DIRECCION, direccion: 'Av. Los Aromos 1450' }
  let vista
  let onConfirmar
  const campo = (id) => vista.contenedor.querySelector(`#${id}`)
  const botonPagar = () => vista.contenedor.querySelector('button[type="submit"]')

  beforeEach(() => {
    onConfirmar = jasmine.createSpy('onConfirmar')
  })

  afterEach(() => vista.desmontar())

  it('se completa campo por campo y envía también los opcionales y el método de pago elegido', () => {
    vista = montar(<FormularioCheckout total={59990} onConfirmar={onConfirmar} />)

    escribir(campo('nombre'), 'Camila Rojas')
    escribir(campo('correo'), 'camila@correo.cl')
    escribir(campo('telefono'), '912345678')
    escribir(campo('region'), 'Región de Valparaíso')
    escribir(campo('comuna'), 'Viña del Mar')
    escribir(campo('direccion'), 'Av. Libertad 1020')
    escribir(campo('depto'), 'Depto. 503')
    escribir(campo('indicaciones'), 'Dejar en conserjería')
    hacerClic(vista.contenedor.querySelector('input[value="CREDITO"]'))
    hacerClic(botonPagar())

    expect(onConfirmar).toHaveBeenCalledOnceWith({
      nombre: 'Camila Rojas',
      correo: 'camila@correo.cl',
      telefono: '912345678',
      region: 'Región de Valparaíso',
      comuna: 'Viña del Mar',
      direccion: 'Av. Libertad 1020',
      depto: 'Depto. 503',
      indicaciones: 'Dejar en conserjería',
      metodoPago: 'CREDITO',
    })
  })

  it('al cambiar la región borra la comuna y no deja confirmar hasta elegir una de la nueva región', () => {
    vista = montar(<FormularioCheckout datosIniciales={COMPLETOS} onConfirmar={onConfirmar} />)
    expect(botonPagar().disabled).toBeFalse()

    escribir(campo('region'), 'Región de Valparaíso')
    expect(campo('comuna').value).toBe('')
    expect(botonPagar().disabled).toBeTrue()
    expect(vista.texto()).toContain('Para confirmar, completa o corrige: Comuna.')

    escribir(campo('comuna'), 'Viña del Mar')
    expect(botonPagar().disabled).toBeFalse()
  })

  it('muestra el error de un campo al salir de él, y todos los pendientes al intentar enviar', () => {
    vista = montar(<FormularioCheckout onConfirmar={onConfirmar} />)
    expect(vista.texto()).not.toContain('Escribe un correo válido')

    escribir(campo('correo'), 'camila@')
    salir(campo('correo'))
    expect(campo('correo').getAttribute('aria-invalid')).toBe('true')
    expect(vista.texto()).toContain('Escribe un correo válido, por ejemplo nombre@correo.cl.')

    enviar(vista.contenedor.querySelector('form'))
    expect(vista.texto()).toContain('Revisa 6 campos antes de confirmar')
    expect(onConfirmar).not.toHaveBeenCalled()
  })

  it('con el carrito vacío no deja pagar, y mientras envía muestra «Confirmando…»', () => {
    vista = montar(<FormularioCheckout datosIniciales={COMPLETOS} carritoVacio onConfirmar={onConfirmar} />)
    expect(botonPagar().disabled).toBeTrue()
    expect(vista.texto()).toContain('Tu carrito está vacío: agrega productos antes de pagar.')

    vista.actualizar(<FormularioCheckout datosIniciales={COMPLETOS} enviando onConfirmar={onConfirmar} />)
    expect(botonPagar().disabled).toBeTrue()
    expect(botonPagar().textContent).toBe('Confirmando…')
  })
})
