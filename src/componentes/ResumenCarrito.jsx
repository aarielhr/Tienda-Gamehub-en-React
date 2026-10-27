
import ResumenOrden from './ResumenOrden.jsx';

export default function ResumenCarrito({
  articulos = [],
  totales
}) {

  // Mostrar mensaje si no hay productos.
  if (articulos.length === 0) {
    return (
      <p role="status">
        Tu carrito está vacío.
      </p>
    );
  }

  // Mostrar resumen si existen productos.
  return (
    <ResumenOrden
      articulos={articulos}
      totales={totales}
    />
  );
}
