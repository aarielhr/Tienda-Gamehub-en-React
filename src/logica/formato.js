// Formatos chilenos: $1.149.990 y fechas dd-mm-aaaa

export function clp(monto) {
  const n = Math.round(Number(monto) || 0)
  const signo = n < 0 ? '−' : ''
  return `${signo}$${String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

// "2026-11-10" o "2026-11-10T09:42:00" → "10-11-2026"
export function fecha(iso) {
  if (!iso) return ''
  const [anio, mes, dia] = iso.slice(0, 10).split('-')
  return `${dia}-${mes}-${anio}`
}

// "2026-11-10T09:42:00" → "10-11-2026 · 09:42"
export function fechaHora(iso) {
  if (!iso) return ''
  return `${fecha(iso)} · ${iso.slice(11, 16)}`
}

// "2026-11-10T09:42:00" → "10-11 · 09:42"
export function fechaCorta(iso) {
  if (!iso) return ''
  const [, mes, dia] = iso.slice(0, 10).split('-')
  return `${dia}-${mes} · ${iso.slice(11, 16)}`
}

// Fecha local en formato ISO (aaaa-mm-dd), sin el desfase de zona horaria de toISOString
export function aFechaISO(dia = new Date()) {
  const mes = String(dia.getMonth() + 1).padStart(2, '0')
  const d = String(dia.getDate()).padStart(2, '0')
  return `${dia.getFullYear()}-${mes}-${d}`
}

export function porcentajeDescuento(precio, precioNormal) {
  if (!precioNormal || precioNormal <= precio) return 0
  return Math.round((1 - precio / precioNormal) * 100)
}

export function plural(cantidad, singular, pluralTexto) {
  return `${cantidad} ${cantidad === 1 ? singular : pluralTexto}`
}

export function iniciales(nombre = '') {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('')
}
