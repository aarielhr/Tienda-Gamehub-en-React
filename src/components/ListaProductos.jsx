import TarjetaProducto from './TarjetaProducto.jsx'

// Grilla de Bootstrap: 2 tarjetas por fila en teléfono, 3 en el catálogo y 4 en Inicio desde 992 px
export default function ListaProductos({ productos, onAgregar, columnas = 3 }) {
  const clases = columnas === 4 ? 'row-cols-2 row-cols-lg-4' : 'row-cols-2 row-cols-lg-3'
  return (
    <ul className={`row g-3 list-unstyled mb-0 ${clases}`}>
      {productos.map((producto) => (
        <li key={producto.id} className="col">
          <TarjetaProducto producto={producto} onAgregar={onAgregar} />
        </li>
      ))}
    </ul>
  )
}
