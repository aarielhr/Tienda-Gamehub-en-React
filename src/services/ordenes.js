import { solicitar } from './api.js';

export const crearOrden = (datos) => solicitar('/api/ordenes', { metodo: 'POST', cuerpo: datos });
export const listarMisOrdenes = () => solicitar('/api/ordenes/mias');

export async function obtenerOrden(id) {
  const [orden, resenas, garantias] = await Promise.all([
    solicitar(`/api/ordenes/${id}`),
    solicitar('/api/resenas/mias').catch(() => []),
    solicitar('/api/garantias/mias').catch(() => []),
  ]);
  const resenasOrden = resenas.filter((r) => r.ordenId === Number(id));
  const garantiasOrden = garantias.filter((g) => g.ordenId === Number(id));
  return {
    ...orden,
    lineas: orden.lineas.map((linea) => {
      const garantia = garantiasOrden.find((g) => g.productoId === linea.productoId);
      const resenada = resenasOrden.some((r) => r.productoId === linea.productoId);
      const entregada = orden.estado === 'ENTREGADA';
      const meses = entregada && orden.entregadaEn ? new Date(orden.entregadaEn).getTime() + 183 * 24 * 60 * 60 * 1000 : 0;
      return {
        ...linea,
        imagen: resolverImagen(linea.imagen),
        garantia,
        resenada,
        puedeResenar: entregada && !resenada,
        plazoGarantia: garantia?.plazo ?? (entregada && meses >= Date.now() ? new Date(meses).toISOString().slice(0, 10) : null),
        puedeSolicitarGarantia: entregada && !garantia && meses >= Date.now(),
        motivoSinGarantia: entregada && meses < Date.now() ? 'El plazo de garantía venció.' : undefined,
      };
    }),
  };
}

function resolverImagen(imagen) {
  if (imagen && /^(https?:)?\/\//.test(imagen)) return imagen;
  const coincidencia = Object.keys(IMAGENES).find((nombre) => nombre.toLowerCase() === String(imagen).toLowerCase());
  return IMAGENES[imagen] ?? IMAGENES[coincidencia] ?? imagen ?? 'teclado';
}
const IMAGENES = {
  'Tarjeta Gráfica ASUS RTX 4060': '/images/Tarjeta Gráfica ASUS RTX 4060.jpg',
  'Teclado Ajazz AK820': '/images/Teclado Ajazz AK820.avif',
  'Mouse Ajazz 139 Pro': '/images/mouse-ajazz.jpg',
  'Mouse ATK Blazing Sky': '/images/mouse-atk-blazing.jpg',
  'Pad Mouse ATK Sky XSoft': '/images/Pad Mouse ATK Sky XSoft.jpg',
  'Monitor ASUS TUF 24"': '/images/Monitor ASUS TUF 24.jpg',
};

export const crearResena = (datos) => solicitar('/api/resenas', { metodo: 'POST', cuerpo: datos });
export const solicitarGarantia = (datos) => solicitar('/api/garantias', { metodo: 'POST', cuerpo: datos });
