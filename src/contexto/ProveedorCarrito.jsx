import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { agregarProductoAlCarrito, limpiarAlmacenamientoCarrito, guardarCarrito } from '../servicios/servicioCarrito.js';
import { obtenerCarrito, CLAVES_ALMACENAMIENTO } from '../servicios/almacenamiento.js';

const ContextoCarrito = createContext(null);

export function ProveedorCarrito({ hijos }) {
  const [carrito, establecerCarrito] = useState(obtenerCarrito);
  const [aviso, establecerAviso] = useState('');

  useEffect(() => {
    const sincronizarCarrito = (evento) => {
      if (evento.key === CLAVES_ALMACENAMIENTO.carrito) establecerCarrito(obtenerCarrito());
    };
    window.addEventListener('storage', sincronizarCarrito);
    return () => window.removeEventListener('storage', sincronizarCarrito);
  }, []);

  const agregarProducto = (idProducto) => {
    const resultado = agregarProductoAlCarrito(carrito, idProducto);
    if (resultado.error) {
      establecerAviso(resultado.error);
      return false;
    }
    establecerCarrito(resultado.carrito);
    guardarCarrito(resultado.carrito);
    establecerAviso(resultado.mensaje);
    return true;
  };

  const actualizarCantidad = (idProducto, cantidad) => {
    const nuevoCarrito = carrito.map((articulo) => articulo.id === idProducto
      ? { ...articulo, cantidad: Math.min(Math.max(1, cantidad), articulo.stockMaximo) }
      : articulo);
    establecerCarrito(nuevoCarrito);
    guardarCarrito(nuevoCarrito);
  };

  const quitarProducto = (idProducto) => {
    const nuevoCarrito = carrito.filter((articulo) => articulo.id !== idProducto);
    establecerCarrito(nuevoCarrito);
    guardarCarrito(nuevoCarrito);
  };

  const vaciarCarrito = () => {
    establecerCarrito([]);
    limpiarAlmacenamientoCarrito();
  };

  const valor = useMemo(() => ({
    carrito,
    cantidadArticulos: carrito.reduce((suma, articulo) => suma + articulo.cantidad, 0),
    aviso,
    limpiarAviso: () => establecerAviso(''),
    agregarProducto,
    actualizarCantidad,
    quitarProducto,
    vaciarCarrito
  }), [carrito, aviso]);

  return <ContextoCarrito.Provider value={valor}>{hijos}</ContextoCarrito.Provider>;
}

export function usarCarrito() {
  const contexto = useContext(ContextoCarrito);
  if (!contexto) throw new Error('usarCarrito debe usarse dentro de ProveedorCarrito.');
  return contexto;
}
