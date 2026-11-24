// Regiones de Chile con sus comunas principales, para los formularios de despacho y registro.
export const REGIONES = [
  { nombre: 'Región de Arica y Parinacota', comunas: ['Arica', 'Camarones', 'Putre'] },
  { nombre: 'Región de Tarapacá', comunas: ['Iquique', 'Alto Hospicio', 'Pozo Almonte'] },
  { nombre: 'Región de Antofagasta', comunas: ['Antofagasta', 'Calama', 'Mejillones', 'Tocopilla', 'Taltal'] },
  { nombre: 'Región de Atacama', comunas: ['Copiapó', 'Caldera', 'Vallenar', 'Chañaral'] },
  { nombre: 'Región de Coquimbo', comunas: ['La Serena', 'Coquimbo', 'Ovalle', 'Illapel', 'Vicuña'] },
  {
    nombre: 'Región de Valparaíso',
    comunas: ['Valparaíso', 'Viña del Mar', 'Concón', 'Quilpué', 'Villa Alemana', 'San Antonio', 'Los Andes', 'Quillota'],
  },
  {
    nombre: 'Región Metropolitana de Santiago',
    comunas: [
      'Santiago', 'Providencia', 'Ñuñoa', 'Las Condes', 'Vitacura', 'Lo Barnechea', 'La Reina', 'Macul',
      'Peñalolén', 'La Florida', 'Puente Alto', 'San Miguel', 'San Joaquín', 'La Cisterna', 'San Bernardo',
      'Maipú', 'Estación Central', 'Quinta Normal', 'Recoleta', 'Independencia', 'Conchalí', 'Huechuraba',
      'Quilicura', 'Renca', 'Cerrillos', 'Pudahuel', 'Lo Prado', 'Cerro Navia', 'La Granja', 'La Pintana',
      'El Bosque', 'Pedro Aguirre Cerda', 'Lo Espejo', 'San Ramón', 'Colina', 'Lampa', 'Buin', 'Paine',
      'Talagante', 'Peñaflor', 'Melipilla',
    ],
  },
  {
    nombre: "Región del Libertador General Bernardo O'Higgins",
    comunas: ['Rancagua', 'Machalí', 'San Fernando', 'Rengo', 'Santa Cruz', 'Pichilemu'],
  },
  { nombre: 'Región del Maule', comunas: ['Talca', 'Curicó', 'Linares', 'Constitución', 'Cauquenes'] },
  { nombre: 'Región de Ñuble', comunas: ['Chillán', 'Chillán Viejo', 'San Carlos', 'Bulnes'] },
  {
    nombre: 'Región del Biobío',
    comunas: ['Concepción', 'Talcahuano', 'San Pedro de la Paz', 'Chiguayante', 'Hualpén', 'Coronel', 'Los Ángeles'],
  },
  { nombre: 'Región de La Araucanía', comunas: ['Temuco', 'Padre Las Casas', 'Villarrica', 'Pucón', 'Angol'] },
  { nombre: 'Región de Los Ríos', comunas: ['Valdivia', 'La Unión', 'Río Bueno', 'Panguipulli'] },
  { nombre: 'Región de Los Lagos', comunas: ['Puerto Montt', 'Puerto Varas', 'Osorno', 'Castro', 'Ancud'] },
  {
    nombre: 'Región de Aysén del General Carlos Ibáñez del Campo',
    comunas: ['Coyhaique', 'Puerto Aysén', 'Chile Chico'],
  },
  { nombre: 'Región de Magallanes y de la Antártica Chilena', comunas: ['Punta Arenas', 'Puerto Natales', 'Porvenir'] },
]

export function regionPorNombre(nombre) {
  return REGIONES.find((r) => r.nombre === nombre)
}

export function comunasDe(nombreRegion) {
  return regionPorNombre(nombreRegion)?.comunas ?? []
}
