import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { agregarProductoAlCarrito, limpiarAlmacenamientoCarrito, guardarCarrito } from '../servicios/servicioCarrito.js';
import { obtenerCarrito, obtenerCupon, guardarAlmacenamiento, CLAVES_ALMACENAMIENTO } from '../servicios/almacenamiento.js';
import { agregarAlCarrito, cambiarCantidad, quitarLinea } from '../logica/carrito.js';

const ContextoCarrito = createContext(null);

function cargarArticulos() {
  const datos = obtenerCarrito();
  const articulos = Array.isArray(datos) ? datos : Array.isArray(datos?.lineas) ? datos.lineas : [];
  return articulos.map((linea) => ({ ...linea, id: linea.id ?? linea.productoId, stockMaximo: linea.stockMaximo ?? linea.stock }));
}

export function ProveedorCarrito({ hijos, children }) {
  const [carrito, establecerCarrito] = useState(cargarArticulos);
  const [cupon, establecerCupon] = useState(obtenerCupon);
  const [aviso, establecerAviso] = useState('');

  useEffect(() => {
    const sincronizarCarrito = (evento) => {
      if (evento.key === CLAVES_ALMACENAMIENTO.carrito) establecerCarrito(cargarArticulos());
      if (evento.key === CLAVES_ALMACENAMIENTO.cupon) establecerCupon(obtenerCupon());
    };
    window.addEventListener('storage', sincronizarCarrito);
    return () => window.removeEventListener('storage', sincronizarCarrito);
  }, []);

  const agregarProducto = (productoOId, cantidad = 1) => {
    let resultado;
    if (productoOId && typeof productoOId === 'object') {
      const producto = productoOId;
      const base = carrito.map((articulo) => ({ ...articulo, productoId: articulo.id, stock: articulo.stockMaximo ?? articulo.stock }));
      const agregado = agregarAlCarrito(base, producto, cantidad);
      resultado = agregado.valido
        ? { lineas: agregado.lineas, mensaje: `${producto.nombre} agregado al carrito.` }
        : { error: agregado.mensaje };
    } else {
      resultado = agregarProductoAlCarrito(carrito, productoOId);
    }
    if (resultado === false || resultado.error) {
      establecerAviso(resultado.error ?? 'No se pudo agregar el producto.');
      return { valido: false, mensaje: resultado.error ?? 'No se pudo agregar el producto.' };
    }
    const carritoNuevo = resultado.carrito ?? resultado.lineas?.map((linea) => ({ ...linea, id: linea.productoId, stockMaximo: linea.stock })) ?? carrito;
    establecerCarrito(carritoNuevo);
    guardarCarrito(carritoNuevo);
    establecerAviso(resultado.mensaje ?? 'Producto agregado al carrito.');
    return { valido: true, mensaje: resultado.mensaje ?? 'Producto agregado al carrito.' };
  };

  const actualizarCantidad = (idProducto, cantidad) => {
    const articulo = carrito.find((a) => a.id === idProducto);
    if (articulo?.stock !== undefined) {
      const lineas = carrito.map((a) => ({ ...a, productoId: a.id, stock: a.stockMaximo ?? a.stock }));
      const resultado = cambiarCantidad(lineas, idProducto, cantidad);
      if (!resultado.valido) { establecerAviso(resultado.mensaje); return false; }
      const nuevas = resultado.lineas.map(({ productoId, ...linea }) => ({ ...linea, id: productoId, stockMaximo: linea.stock }));
      establecerCarrito(nuevas); guardarCarrito(nuevas); return true;
    }
    const nuevoCarrito = carrito.map((a) => a.id === idProducto
      ? { ...a, cantidad: Math.min(Math.max(1, cantidad), a.stockMaximo ?? a.stock ?? cantidad) }
      : a);
    establecerCarrito(nuevoCarrito); guardarCarrito(nuevoCarrito); return true;
  };

  const quitarProducto = (idProducto) => {
    const nuevoCarrito = carrito.filter((articulo) => articulo.id !== idProducto);
    establecerCarrito(nuevoCarrito); guardarCarrito(nuevoCarrito);
  };

  const vaciarCarrito = () => {
    establecerCarrito([]); establecerCupon(null); limpiarAlmacenamientoCarrito();
  };

  const guardarCupon = (nuevoCupon) => {
    establecerCupon(nuevoCupon);
    if (nuevoCupon) guardarAlmacenamiento(CLAVES_ALMACENAMIENTO.cupon, nuevoCupon);
    else localStorage.removeItem(CLAVES_ALMACENAMIENTO.cupon);
  };
  const quitarCupon = () => guardarCupon(null);

  const sincronizar = (validacion) => {
    if (validacion.cupon) guardarCupon(validacion.cupon);
    else if (validacion.mensajeCupon) guardarCupon(null);
    const nuevas = carrito.map((articulo) => {
      const datos = validacion.lineas.find((v) => v.productoId === articulo.id);
      return datos ? { ...articulo, nombre: datos.nombre, precio: datos.precio, stock: datos.stock, stockMaximo: datos.stock, disponible: datos.disponible, mensajeStock: datos.mensaje } : articulo;
    });
    establecerCarrito(nuevas); guardarCarrito(nuevas);
  };

  const valor = useMemo(() => ({
    carrito,
    cupon,
    cantidadArticulos: carrito.reduce((suma, articulo) => suma + articulo.cantidad, 0),
    aviso,
    limpiarAviso: () => establecerAviso(''),
    agregarProducto,
    actualizarCantidad,
    quitarProducto,
    vaciarCarrito,
    guardarCupon,
    quitarCupon,
    sincronizar,
  }), [carrito, cupon, aviso]);

  return <ContextoCarrito.Provider value={valor}>{hijos ?? children}</ContextoCarrito.Provider>;
}

export function usarCarrito() {
  const contexto = useContext(ContextoCarrito);
  if (!contexto) throw new Error('usarCarrito debe usarse dentro de ProveedorCarrito.');
  return contexto;
}
