export const productos = [
  { id: 1, nombre: 'Mouse Ajazz 139 Pro', categoria: 'perifericos', marca: 'ajazz', precio: 45000, stock: 5, imagen: '/images/mouse-ajazz.jpg' },
  { id: 2, nombre: 'Pad Mouse ATK Sky XSoft', categoria: 'perifericos', marca: 'atk', precio: 32000, stock: 3, imagen: '/images/Pad Mouse ATK Sky XSoft.jpg' },
  { id: 3, nombre: 'Monitor ASUS TUF 24"', categoria: 'monitores', marca: 'asus', precio: 180000, stock: 0, imagen: '/images/Monitor ASUS TUF 24.jpg' },
  { id: 4, nombre: 'Teclado Ajazz AK820', categoria: 'perifericos', marca: 'ajazz', precio: 55000, stock: 10, imagen: '/images/Teclado Ajazz AK820.avif' },
  { id: 5, nombre: 'Tarjeta Gráfica ASUS RTX 4060', categoria: 'componentes', marca: 'asus', precio: 350000, stock: 2, imagen: '/images/Tarjeta Gráfica ASUS RTX 4060.jpg' },
  { id: 6, nombre: 'Mouse ATK Blazing Sky', categoria: 'perifericos', marca: 'atk', precio: 48000, stock: 7, imagen: '/images/mouse-atk-blazing.jpg' }
];

export const productosDestacados = productos.slice(0, 3);

export const regiones = {
  'Valparaíso': ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Concón'],
  'Metropolitana de Santiago': ['Santiago', 'Providencia', 'Las Condes', 'Maipú'],
  'Biobío': ['Concepción', 'Talcahuano', 'Los Ángeles']
};
