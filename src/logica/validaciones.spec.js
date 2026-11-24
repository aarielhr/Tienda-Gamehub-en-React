// Pruebas adicionales: reglas de negocio que el frontend valida antes de llamar al backend
import { rutaDespuesDeIngresar } from './rutas.js'
import {
  validarCategoria,
  validarClave,
  validarDatosDespacho,
  validarDespacho,
  validarGarantia,
  validarLogin,
  validarMovimiento,
  validarProducto,
  validarPromocion,
  validarRangoPrecio,
  validarRegistro,
  validarResena,
  validarResolucion,
} from './validaciones.js'

describe('logica/validaciones.js', () => {
  it('validarDespacho exige la dirección y valida el teléfono chileno', () => {
    const errores = validarDespacho({
      nombre: 'Camila Rojas',
      correo: 'camila@correo.cl',
      telefono: '+56 9 1234',
      region: 'Región Metropolitana de Santiago',
      comuna: 'Ñuñoa',
      direccion: '',
    })
    expect(Object.keys(errores).sort()).toEqual(['direccion', 'telefono'])
  })

  it('validarMovimiento no deja que una salida deje el stock negativo', () => {
    expect(validarMovimiento('SALIDA', '5', 2)).toContain('El stock no puede quedar negativo')
    expect(validarMovimiento('SALIDA', '2', 2)).toBe('')
    expect(validarMovimiento('AJUSTE', '0', 2)).toBe('')
  })

  it('validarPromocion rechaza una fecha de término anterior a la de inicio', () => {
    const errores = validarPromocion({ codigo: 'VERANO26', porcentaje: 15, tope: 30000, usosMaximos: 100, inicio: '2026-12-10', termino: '2026-12-01' })
    expect(errores.termino).toBe('La fecha de término no puede ser anterior a la de inicio.')
  })

  it('una garantía no se cierra sin resolución y pide al menos 20 caracteres de descripción', () => {
    expect(validarResolucion('RESUELTA', '  ')).toBe('Escribe la resolución antes de cerrar la garantía.')
    expect(validarResolucion('EN_REVISION', '')).toBe('')
    expect(validarGarantia({ motivo: 'FALLA', descripcion: 'No enciende.' }).descripcion).toContain('al menos 20 caracteres')
  })

  it('validarDespacho pide el teléfono y la comuna, y que la comuna sea de la región elegida', () => {
    const base = { nombre: 'Camila Rojas', correo: 'camila@correo.cl', region: 'Región Metropolitana de Santiago', direccion: 'Av. Los Aromos 1450' }

    expect(validarDespacho({ ...base, telefono: '', comuna: '' })).toEqual({
      telefono: 'Escribe tu teléfono.',
      comuna: 'Elige una comuna.',
    })
    expect(validarDespacho({ ...base, telefono: '912345678', comuna: 'Viña del Mar' })).toEqual({
      comuna: 'Esa comuna no pertenece a la región elegida.',
    })
  })

  it('validarMovimiento pide una cantidad entera mayor que cero y avisa si el conteo no cambia el stock', () => {
    expect(validarMovimiento('INGRESO', '', 5)).toBe('Escribe una cantidad entera.')
    expect(validarMovimiento('INGRESO', '2.5', 5)).toBe('Escribe una cantidad entera.')
    expect(validarMovimiento('SALIDA', '0', 5)).toBe('La cantidad debe ser mayor que cero.')
    expect(validarMovimiento('AJUSTE', '5', 5)).toBe('El conteo coincide con el stock actual.')
    expect(validarMovimiento('INGRESO', '10', 5)).toBe('')
  })
})

describe('logica/rutas.js', () => {
  it('después de ingresar lleva a cada rol a su vista', () => {
    expect(rutaDespuesDeIngresar('CLIENTE')).toBe('/')
    expect(rutaDespuesDeIngresar('OPERADOR')).toBe('/operador')
    expect(rutaDespuesDeIngresar('ADMIN')).toBe('/admin')
  })

  it('vuelve a la ruta protegida de origen solo si el rol puede abrirla', () => {
    expect(rutaDespuesDeIngresar('CLIENTE', '/checkout')).toBe('/checkout')
    expect(rutaDespuesDeIngresar('OPERADOR', '/checkout')).toBe('/operador')
    expect(rutaDespuesDeIngresar('CLIENTE', '/admin')).toBe('/')
    expect(rutaDespuesDeIngresar('ADMIN', '/operador')).toBe('/operador')
  })
})

describe('logica/validaciones.js · cuenta, catálogo y administración', () => {
  it('validarLogin pide correo y contraseña', () => {
    expect(validarLogin({ email: '', clave: '' })).toEqual({ email: 'Escribe tu correo.', clave: 'Escribe tu contraseña.' })
    expect(validarLogin({ email: 'camila@gamehub.test', clave: 'algo' })).toEqual({})
  })

  it('validarRegistro revisa el correo, la contraseña, la confirmación y los términos', () => {
    const errores = validarRegistro({
      nombre: 'Camila Rojas',
      email: 'camila@',
      telefono: '912345678',
      clave: 'sinnumeros',
      confirmacion: 'otra',
      region: 'Región Metropolitana de Santiago',
      comuna: 'Ñuñoa',
      direccion: 'Av. Los Aromos 1450',
      terminos: false,
    })

    expect(Object.keys(errores).sort()).toEqual(['clave', 'confirmacion', 'email', 'terminos'])
    expect(errores.clave).toBe('La contraseña debe incluir al menos un número.')
    expect(errores.confirmacion).toBe('Las contraseñas no coinciden.')
  })

  it('validarClave exige al menos 8 caracteres', () => {
    expect(validarClave('abc1')).toBe('La contraseña debe tener al menos 8 caracteres.')
    expect(validarClave('clave1234')).toBe('')
  })

  it('validarRangoPrecio no acepta un mínimo mayor que el máximo', () => {
    expect(validarRangoPrecio('50000', '10000')).toBe('El mínimo no puede ser mayor que el máximo.')
    expect(validarRangoPrecio('', '10000')).toBe('')
  })

  it('validarProducto exige una categoría que exista y un precio mayor que cero', () => {
    const categorias = [{ id: 4, nombre: 'Periféricos' }]
    const base = { sku: 'KB-NIM-TKL', nombre: 'Teclado', marca: 'Nimbo', categoriaId: '4', precio: '59990', precioNormal: '' }

    expect(validarProducto(base, categorias)).toEqual({})
    expect(validarProducto({ ...base, categoriaId: '99', precio: '0' }, categorias)).toEqual({
      categoriaId: 'Elige una categoría que exista.',
      precio: 'El precio debe ser mayor que cero.',
    })
    expect(validarProducto({ ...base, precioNormal: '50000' }, categorias).precioNormal).toBe(
      'El precio normal debe ser mayor que el precio de oferta.',
    )
  })

  it('validarResena pide de 1 a 5 estrellas y al menos 10 caracteres', () => {
    expect(validarResena({ puntuacion: 0, comentario: 'Corta' })).toEqual({
      puntuacion: 'Elige de 1 a 5 estrellas.',
      comentario: 'Escribe al menos 10 caracteres.',
    })
    expect(validarResena({ puntuacion: 5, comentario: 'Llegó rápido y funciona perfecto.' })).toEqual({})
  })

  it('validarDatosDespacho limita el seguimiento y no acepta una fecha pasada', () => {
    expect(validarDatosDespacho({ seguimiento: 'X'.repeat(31), fechaEstimada: '2026-01-01' }, '2026-11-11')).toEqual({
      seguimiento: 'El número de seguimiento tiene hasta 30 caracteres.',
      fechaEstimada: 'La fecha estimada no puede estar en el pasado.',
    })
    expect(validarDatosDespacho({ seguimiento: 'GHX-70019', fechaEstimada: '2026-11-14' }, '2026-11-11')).toEqual({})
  })

  it('validarCategoria no repite un nombre, sin importar mayúsculas', () => {
    const categorias = [{ id: 5, nombre: 'Consolas' }]

    expect(validarCategoria('  ', categorias)).toBe('Escribe el nombre de la categoría.')
    expect(validarCategoria('consolas', categorias)).toBe('La categoría «Consolas» ya existe.')
    expect(validarCategoria('Consolas', categorias, 5)).toBe('')
  })

  it('validarCategoria acepta un nombre de hasta 60 caracteres', () => {
    expect(validarCategoria('X'.repeat(61), [])).toBe('El nombre tiene hasta 60 caracteres.')
    expect(validarCategoria('X'.repeat(60), [])).toBe('')
  })
})
