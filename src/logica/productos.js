// Las especificaciones se editan como texto, una por línea: "Memoria: 16 GB DDR5"

// Texto → [{ clave, valor }]. Si una línea no tiene el formato, devuelve el error con su número.
export function leerEspecificaciones(texto = '') {
  const lineas = texto
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const especificaciones = []
  for (const [i, linea] of lineas.entries()) {
    const corte = linea.indexOf(':')
    const clave = linea.slice(0, corte).trim()
    const valor = linea.slice(corte + 1).trim()
    if (corte < 1 || !clave || !valor) {
      return { especificaciones: [], error: `La línea ${i + 1} no tiene el formato «Clave: Valor».` }
    }
    especificaciones.push({ clave, valor })
  }
  return { especificaciones, error: '' }
}

// [{ clave, valor }] → texto para el área de edición
export function escribirEspecificaciones(especificaciones = []) {
  return especificaciones.map((e) => `${e.clave}: ${e.valor}`).join('\n')
}

// Nivel de stock para la tabla de administración
export function textoStock(stock) {
  if (stock <= 0) return { texto: 'sin stock', clase: 'stock-error' }
  if (stock <= 3) return { texto: 'bajo', clase: 'stock-aviso' }
  return null
}
