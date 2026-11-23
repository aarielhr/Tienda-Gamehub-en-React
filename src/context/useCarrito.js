import { useContext, useMemo } from 'react';
import { CarritoContext } from './carritoContext.js';
import { usarCarrito } from '../contexto/ProveedorCarrito.jsx';
import { calcularSubtotal, calcularTotal, aplicarCupon as calcularDescuento, cuponVigente, contarUnidades } from '../logica/carrito.js';

export function useCarrito() {
  const contexto = useContext(CarritoContext);
  if (contexto) return contexto;
  const tienda = usarCarrito();
  return useMemo(() => {
    const lineas = tienda.carrito.map((articulo) => ({
      ...articulo,
      productoId: articulo.id,
      stock: articulo.stockMaximo ?? articulo.stock ?? 0,
      imagen: articulo.imagen ?? 'teclado',
    }));
    const cupon = tienda.cupon ?? null;
    const subtotal = calcularSubtotal(lineas);
    const descuento = cuponVigente(cupon) ? calcularDescuento(subtotal, cupon) : 0;
    return {
      lineas,
      cupon,
      unidades: contarUnidades(lineas),
      subtotal,
      descuento,
      total: calcularTotal(subtotal, descuento),
      agregar: (producto, cantidad = 1) => tienda.agregarProducto(producto, cantidad),
      actualizarCantidad: tienda.actualizarCantidad,
      quitar: tienda.quitarProducto,
      vaciar: tienda.vaciarCarrito,
      guardarCupon: tienda.guardarCupon,
      quitarCupon: tienda.quitarCupon,
      sincronizar: tienda.sincronizar,
    };
  }, [tienda]);
}
