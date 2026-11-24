// Las fechas ISO (aaaa-mm-ddThh:mm) se pueden comparar como texto: el orden alfabético es el cronológico
export function ordenarPorFecha(resenas) {
  return [...resenas].sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0))
}

// Promedio con un decimal; 0 si todavía no hay reseñas
export function calcularPromedio(resenas) {
  if (!resenas.length) return 0
  const suma = resenas.reduce((total, r) => total + r.puntuacion, 0)
  return Math.round((suma / resenas.length) * 10) / 10
}

// Cuántas reseñas hay de cada puntuación, de 5 a 1 estrellas
export function distribucion(resenas) {
  return [5, 4, 3, 2, 1].map((estrellas) => ({
    estrellas,
    cantidad: resenas.filter((r) => r.puntuacion === estrellas).length,
  }))
}

export function promedioTexto(promedio) {
  return promedio.toFixed(1).replace('.', ',')
}
