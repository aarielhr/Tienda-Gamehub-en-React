// Estado del indicador tipo LED: cinco segmentos más un texto, para no depender solo del color
export function estadoStock(stock) {
  if (stock <= 0) return { nivel: 0, tono: 'error', icono: 'x', texto: 'Sin stock' }
  if (stock <= 3) {
    return { nivel: 1, tono: 'aviso', icono: 'alerta', texto: stock === 1 ? 'Queda 1 unidad' : `Quedan ${stock} unidades` }
  }
  return { nivel: stock < 10 ? 3 : 5, tono: 'ok', icono: 'check', texto: `${stock} disponibles` }
}
