// Textos y enlaces fijos de la tienda que no vienen de la API.

// Video embebido de Inicio. Es un video de muestra con licencia abierta (Big Buck Bunny, Blender
// Foundation, CC BY 3.0): cada equipo lo reemplaza por el video real de su producto.
export const VIDEO_DESTACADO = {
  url: 'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ',
  titulo: 'Video destacado de la semana',
  descripcion: 'Así se ve el contenido de producto que acompaña a las ofertas. Reemplaza este video por el de tu equipo.',
}

export const CUPON_BIENVENIDA = {
  codigo: 'GAMER10',
  titulo: '10 % en tu primera compra',
  detalle: 'Escríbelo en el carrito. Descuento con tope de $30.000 mientras el cupón esté vigente.',
}

// Imagen de la categoría en Inicio (ilustraciones de src/components/Ilustracion.jsx)
export const ILUSTRACION_CATEGORIA = {
  notebooks: 'notebook',
  'tarjetas-graficas': 'gpu',
  procesadores: 'cpu',
  perifericos: 'teclado',
  consolas: 'consola',
  monitores: 'monitor',
  accesorios: 'ssd',
}

// Ilustraciones disponibles (src/components/Ilustracion.jsx) con el nombre que ve el administrador
export const NOMBRE_ILUSTRACION = {
  notebook: 'Notebook',
  gpu: 'Tarjeta gráfica',
  cpu: 'Procesador',
  teclado: 'Teclado',
  mouse: 'Mouse',
  audifonos: 'Audífonos',
  monitor: 'Monitor',
  consola: 'Consola',
  control: 'Control',
  ssd: 'Unidad SSD',
  microfono: 'Micrófono',
  mousepad: 'Mousepad',
}
