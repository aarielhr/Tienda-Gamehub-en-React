import { useState } from 'react'
import { useCarga } from '../../hooks/useCarga.js'
import { clp } from '../../logica/formato.js'
import { textoStock } from '../../logica/productos.js'
import { cambiarActivoProducto, listarProductosAdmin } from '../../services/admin.js'
import { Cargando, MensajeError } from '../Estado.jsx'
import Icono from '../Icono.jsx'
import Insignia from '../Insignia.jsx'
import FormularioProducto from './FormularioProducto.jsx'

const POR_PAGINA = 8

function irAlFormulario() {
  requestAnimationFrame(() => document.getElementById('formulario-producto')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

// Productos activos e inactivos: búsqueda, filtro por categoría, paginación y formulario de edición
export default function AdminProductos({ categorias, avisar, onCambio }) {
  const productos = useCarga(() => listarProductosAdmin(), [])
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('')
  const [pagina, setPagina] = useState(1)
  const [editando, setEditando] = useState(null)
  const [cambiando, setCambiando] = useState(null)

  const texto = busqueda.trim().toLowerCase()
  const filtrados = (productos.datos ?? []).filter(
    (p) =>
      (!categoria || String(p.categoriaId) === categoria) &&
      (!texto || [p.nombre, p.sku, p.marca].some((campo) => campo.toLowerCase().includes(texto))),
  )
  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const actual = Math.min(pagina, paginas)
  const visibles = filtrados.slice((actual - 1) * POR_PAGINA, actual * POR_PAGINA)

  function abrir(producto) {
    setEditando(producto ?? 'nuevo')
    irAlFormulario()
  }

  async function alternar(producto) {
    setCambiando(producto.id)
    try {
      await cambiarActivoProducto(producto.id, !producto.activo)
      avisar({ tipo: 'ok', texto: `${producto.nombre} quedó ${producto.activo ? 'inactivo: ya no se muestra en la tienda' : 'activo en la tienda'}.` })
      productos.recargar()
      onCambio()
    } catch (e) {
      avisar({ tipo: 'error', texto: e.message })
    } finally {
      setCambiando(null)
    }
  }

  function guardado(producto, eraEdicion) {
    setEditando(null)
    avisar({ tipo: 'ok', texto: eraEdicion ? `Cambios guardados en ${producto.nombre}.` : `${producto.nombre} quedó creado.` })
    productos.recargar()
    onCambio()
  }

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex flex-wrap align-items-end gap-3">
        <div style={{ flex: '1 1 240px' }}>
          <label htmlFor="admin-buscar" className="form-label">
            Buscar producto
          </label>
          <input
            id="admin-buscar"
            type="search"
            className="form-control"
            placeholder="Nombre, SKU o marca"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value)
              setPagina(1)
            }}
          />
        </div>
        <div style={{ flex: '0 1 220px' }}>
          <label htmlFor="admin-categoria" className="form-label">
            Filtrar por categoría
          </label>
          <select
            id="admin-categoria"
            className="form-select"
            value={categoria}
            onChange={(e) => {
              setCategoria(e.target.value)
              setPagina(1)
            }}
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => abrir(null)}>
          <Icono nombre="mas" />
          Nuevo producto
        </button>
      </div>

      {productos.error && <MensajeError error={productos.error} alReintentar={productos.recargar} />}
      {productos.cargando && !productos.datos && <Cargando texto="Cargando productos…" />}

      {productos.datos && (
        <>
          <div className="tabla-contenedor">
            <table className="table align-middle mb-0">
              <caption className="visualmente-oculto">Productos de la tienda</caption>
              <thead>
                <tr>
                  <th scope="col">Producto</th>
                  <th scope="col">Categoría</th>
                  <th scope="col" className="text-end">
                    Precio
                  </th>
                  <th scope="col" className="text-end">
                    Stock
                  </th>
                  <th scope="col">Estado</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center texto-secundario py-4">
                      Ningún producto coincide con la búsqueda.
                    </td>
                  </tr>
                )}
                {visibles.map((p) => {
                  const nivel = textoStock(p.stock)
                  return (
                    <tr key={p.id}>
                      <td>
                        <span className="fw-semibold">{p.nombre}</span>
                        <span className="d-block small texto-mono texto-secundario">{p.sku}</span>
                      </td>
                      <td className="small">{p.categoria}</td>
                      <td className="text-end text-nowrap">
                        {clp(p.precio)}
                        {p.precioNormal && <span className="d-block small precio-antes">{clp(p.precioNormal)}</span>}
                      </td>
                      <td className="text-end text-nowrap">
                        <span className="texto-mono">{p.stock}</span>
                        {nivel && <span className={`d-block small ${nivel.clase}`}>{nivel.texto}</span>}
                      </td>
                      <td>
                        {p.activo ? (
                          <Insignia tono="ok" icono="check">
                            Activo
                          </Insignia>
                        ) : (
                          <Insignia tono="neutro" icono="x">
                            Inactivo
                          </Insignia>
                        )}
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-2">
                          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => abrir(p)} aria-label={`Editar ${p.nombre}`}>
                            <Icono nombre="lapiz" tamano={16} />
                            Editar
                          </button>
                          <button
                            type="button"
                            className={`btn btn-sm ${p.activo ? 'btn-outline-danger' : 'btn-tonal'}`}
                            disabled={cambiando === p.id}
                            onClick={() => alternar(p)}
                            aria-label={`${p.activo ? 'Desactivar' : 'Reactivar'} ${p.nombre}`}
                          >
                            {p.activo ? 'Desactivar' : 'Reactivar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <p className="m-0 small texto-secundario" aria-live="polite">
              Mostrando {visibles.length} de {filtrados.length} productos
            </p>
            {paginas > 1 && (
              <nav aria-label="Páginas de productos" className="d-flex gap-1">
                {Array.from({ length: paginas }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`btn btn-sm ${n === actual ? 'btn-primary' : 'btn-outline-secondary'}`}
                    aria-current={n === actual ? 'page' : undefined}
                    aria-label={`Página ${n}`}
                    onClick={() => setPagina(n)}
                  >
                    {n}
                  </button>
                ))}
              </nav>
            )}
          </div>
        </>
      )}

      {editando && (
        <div id="formulario-producto" className="seccion-panel">
          <FormularioProducto
            key={editando === 'nuevo' ? 'nuevo' : editando.id}
            producto={editando === 'nuevo' ? null : editando}
            categorias={categorias}
            onGuardado={guardado}
            onCancelar={() => setEditando(null)}
          />
        </div>
      )}
    </div>
  )
}
