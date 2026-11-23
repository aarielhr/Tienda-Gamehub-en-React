import { solicitar } from './api.js';

async function completar(productos) {
  if (!productos.length) return productos;
  const ids = productos.map((p) => p.id).join(',');
  const [stock, resenas] = await Promise.all([
    solicitar(`/api/inventario/stock?productos=${ids}`),
    solicitar(`/api/resenas/resumen?productos=${ids}`).catch(() => []),
  ]);
  const porStock = new Map(stock.map((fila) => [fila.productoId, fila.stock]));
  const porResenas = new Map(resenas.map((fila) => [fila.productoId, fila]));
  return productos.map((producto) => ({
    ...producto,
    stock: porStock.get(producto.id) ?? 0,
    puntuacion: porResenas.get(producto.id)?.puntuacion ?? 0,
    cantidadResenas: porResenas.get(producto.id)?.cantidad ?? 0,
    imagen: producto.imagen ?? ilustracionPorCategoria(producto.categoriaSlug),
    ...(producto.especificaciones !== undefined ? { especificaciones: producto.especificaciones } : {}),
  }));
}

const IMAGENES = {
  'Tarjeta Gráfica ASUS RTX 4060': '/images/Tarjeta Gráfica ASUS RTX 4060.jpg',
  'Teclado Ajazz AK820': '/images/Teclado Ajazz AK820.avif',
  'Mouse Ajazz 139 Pro': '/images/mouse-ajazz.jpg',
  'Mouse ATK Blazing Sky': '/images/mouse-atk-blazing.jpg',
  'Pad Mouse ATK Sky XSoft': '/images/Pad Mouse ATK Sky XSoft.jpg',
  'Monitor ASUS TUF 24"': '/images/Monitor ASUS TUF 24.jpg',
};

function resolverImagen(imagen, categoria) {
  if (imagen && /^(https?:)?\/\//.test(imagen)) return imagen;
  return IMAGENES[imagen] ?? IMAGENES[Object.keys(IMAGENES).find((nombre) => nombre.toLowerCase() === String(imagen).toLowerCase())] ?? imagen ?? ilustracionPorCategoria(categoria);
}

function ilustracionPorCategoria(slug = '') {
  if (slug.includes('notebook')) return 'notebook';
  if (slug.includes('tarjeta') || slug.includes('grafica')) return 'gpu';
  if (slug.includes('procesador')) return 'cpu';
  if (slug.includes('monitor')) return 'monitor';
  if (slug.includes('consola')) return 'consola';
  if (slug.includes('audio')) return 'audifonos';
  if (slug.includes('mouse')) return 'mouse';
  return 'teclado';
}

export const listarProductos = async (categoria) => completar(await solicitar(categoria ? `/api/productos?categoria=${encodeURIComponent(categoria)}` : '/api/productos'));
export const obtenerProducto = async (id) => {
  const [producto] = await completar([await solicitar(`/api/productos/${id}`)]);
  return producto;
};
export const listarResenas = (id) => solicitar(`/api/productos/${id}/resenas`);
export const listarCategorias = () => solicitar('/api/categorias');
export const validarCupon = (codigo) => solicitar(`/api/promociones/validar?codigo=${encodeURIComponent(codigo)}`);
export const validarCarrito = (lineas, cupon) => solicitar('/api/carrito/validar', {
  metodo: 'POST',
  cuerpo: { lineas: lineas.map((linea) => ({ productoId: linea.productoId, cantidad: linea.cantidad })), cupon: cupon?.codigo ?? null },
});
