import { useCallback, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Cargando, MensajeError, Vacio } from '../components/Estado.jsx'
import FiltroCatalogo from '../components/FiltroCatalogo.jsx'
import Icono from '../components/Icono.jsx'
import ListaProductos from '../components/ListaProductos.jsx'
import Migas from '../components/Migas.jsx'
import Notificacion from '../components/Notificacion.jsx'
import { useCarrito } from '../context/useCarrito.js'
import { useCarga } from '../hooks/useCarga.js'
import { plural } from '../logica/formato.js'
import { validarRangoPrecio } from '../logica/validaciones.js'
import { listarCategorias, listarProductos } from '../services/catalogo.js'

const POR_PAGINA = 9
const FILTROS_INICIALES = { marcas: [], min: '', max: '', soloStock: false, soloOferta: false }

const normalizar = (texto = '') => texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

export default function Catalogo() {
  const [parametros] = useSearchParams()
  const categoria = parametros.get('categoria') ?? ''
  const busqueda = parametros.get('q') ?? ''
  const { agregar } = useCarrito()

  // Los filtros viven como estado de la vista, como pide el caso
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)
  const [orden, setOrden] = useState('relevancia')
  const [visibles, setVisibles] = useState(POR_PAGINA)
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const [aviso, setAviso] = useState(null)
  const cerrarAviso = useCallback(() => setAviso(null), [])

  const productos = useCarga(() => listarProductos(categoria), [categoria])
  const categorias = useCarga(() => listarCategorias(), [])

  // Al cambiar de categoría o de búsqueda los filtros parten de cero (ajuste durante el render)
  const claveVista = `${categoria}|${busqueda}`
  const [vistaAnterior, setVistaAnterior] = useState(claveVista)
  if (claveVista !== vistaAnterior) {
    setVistaAnterior(claveVista)
    setFiltros(FILTROS_INICIALES)
    setVisibles(POR_PAGINA)
  }

  const errorRango = validarRangoPrecio(filtros.min, filtros.max)

  const { marcas, resultado } = useMemo(() => {
    let lista = productos.datos ?? []
    if (busqueda) {
      const texto = normalizar(busqueda)
      lista = lista.filter((p) => normalizar(`${p.nombre} ${p.marca} ${p.categoria}`).includes(texto))
    }
    const nombres = [...new Set(lista.map((p) => p.marca))].sort((a, b) => a.localeCompare(b, 'es'))
    const marcasConCantidad = nombres.map((nombre) => ({ nombre, cantidad: lista.filter((p) => p.marca === nombre).length }))

    if (filtros.marcas.length) lista = lista.filter((p) => filtros.marcas.includes(p.marca))
    if (!errorRango) {
      if (filtros.min !== '') lista = lista.filter((p) => p.precio >= Number(filtros.min))
      if (filtros.max !== '') lista = lista.filter((p) => p.precio <= Number(filtros.max))
    }
    if (filtros.soloStock) lista = lista.filter((p) => p.stock > 0)
    if (filtros.soloOferta) lista = lista.filter((p) => p.precioNormal > p.precio)

    const ordenada = [...lista]
    if (orden === 'precio-asc') ordenada.sort((a, b) => a.precio - b.precio)
    if (orden === 'precio-desc') ordenada.sort((a, b) => b.precio - a.precio)
    if (orden === 'nombre-asc') ordenada.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    if (orden === 'nombre-desc') ordenada.sort((a, b) => b.nombre.localeCompare(a.nombre, 'es'))
    return { marcas: marcasConCantidad, resultado: ordenada }
  }, [productos.datos, busqueda, filtros, errorRango, orden])

  function cambiarFiltro(campo, valor) {
    setFiltros((f) => ({ ...f, [campo]: valor }))
    setVisibles(POR_PAGINA)
  }

  function limpiar() {
    setFiltros(FILTROS_INICIALES)
    setVisibles(POR_PAGINA)
  }

  function alAgregar(producto) {
    const r = agregar(producto, 1)
    setAviso(
      r.valido
        ? { tipo: 'ok', texto: `${producto.nombre} quedó en tu carrito.`, enlace: { a: '/carrito', texto: 'Ver carrito' } }
        : { tipo: 'error', texto: r.mensaje },
    )
  }

  const listaCategorias = categorias.datos ?? []
  const nombreCategoria = listaCategorias.find((c) => c.slug === categoria)?.nombre
  const totalFiltros = filtros.marcas.length + (filtros.min !== '' || filtros.max !== '' ? 1 : 0) + (filtros.soloStock ? 1 : 0) + (filtros.soloOferta ? 1 : 0)
  const mostrados = resultado.slice(0, visibles)
  const conStock = resultado.filter((p) => p.stock > 0).length
  const totalTodas = listaCategorias.reduce((suma, c) => suma + c.cantidadProductos, 0)

  return (
    <div className="contenedor py-4">
      <Migas pasos={[{ texto: 'Inicio', a: '/' }, { texto: 'Catálogo', a: '/catalogo' }, ...(nombreCategoria ? [{ texto: nombreCategoria }] : [])]} />
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mt-2">
        <h1 className="m-0" style={{ fontSize: 40 }}>
          {nombreCategoria ?? 'Catálogo'}
        </h1>
        {productos.datos && (
          <p className="m-0 texto-secundario">
            {plural(resultado.length, 'producto', 'productos')} · {conStock} con stock
            {busqueda && ` · búsqueda «${busqueda}»`}
          </p>
        )}
      </div>

      <ul className="list-unstyled d-flex flex-wrap gap-2 mt-3 mb-0" aria-label="Categorías">
        <li>
          <Link to="/catalogo" className={`chip ${!categoria ? 'activo' : ''}`} aria-current={!categoria ? 'page' : undefined}>
            {!categoria && <Icono nombre="check" tamano={14} grosor={2.6} />}
            Todas {categorias.datos && <span className="cuenta">{totalTodas}</span>}
          </Link>
        </li>
        {listaCategorias.map((c) => (
          <li key={c.slug}>
            <Link
              to={`/catalogo?categoria=${c.slug}`}
              className={`chip ${categoria === c.slug ? 'activo' : ''}`}
              aria-current={categoria === c.slug ? 'page' : undefined}
            >
              {categoria === c.slug && <Icono nombre="check" tamano={14} grosor={2.6} />}
              {c.nombre} <span className="cuenta">{c.cantidadProductos}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="row g-4 mt-1">
        <div className="col-lg-3">
          <button
            type="button"
            className="btn btn-outline-secondary w-100 d-lg-none mb-3"
            onClick={() => setFiltrosAbiertos((abierto) => !abierto)}
            aria-expanded={filtrosAbiertos}
            aria-controls="panel-filtros"
          >
            <Icono nombre="filtro" />
            {filtrosAbiertos ? 'Ocultar filtros' : 'Mostrar filtros'}
            {totalFiltros > 0 && <span className="contador">{totalFiltros}</span>}
          </button>
          <div id="panel-filtros" className={filtrosAbiertos ? '' : 'd-none d-lg-block'}>
            <FiltroCatalogo
              marcas={marcas}
              filtros={filtros}
              errorRango={errorRango}
              totalFiltros={totalFiltros}
              onCambiar={cambiarFiltro}
              onLimpiar={limpiar}
            />
          </div>
        </div>

        <section className="col-lg-9 d-flex flex-column gap-3" aria-labelledby="resultados-titulo">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <h2 id="resultados-titulo" className="h5 m-0" aria-live="polite">
              {productos.cargando ? 'Buscando productos…' : `${plural(resultado.length, 'producto encontrado', 'productos encontrados')}`}
            </h2>
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="orden" className="small texto-secundario text-nowrap">
                Ordenar por
              </label>
              <select id="orden" className="form-select" value={orden} onChange={(e) => setOrden(e.target.value)}>
                <option value="relevancia">Relevancia</option>
                <option value="precio-asc">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
                <option value="nombre-asc">Nombre: A a Z</option>
                <option value="nombre-desc">Nombre: Z a A</option>
              </select>
            </div>
          </div>

          {productos.cargando && <Cargando texto="Cargando el catálogo…" />}
          {productos.error && <MensajeError error={productos.error} alReintentar={productos.recargar} />}

          {!productos.cargando && !productos.error && resultado.length === 0 && (
            <Vacio titulo="No hay productos con estos filtros" texto="Prueba con otra marca, amplía el rango de precio o quita «Solo con stock».">
              <button type="button" className="btn btn-outline-secondary" onClick={limpiar}>
                Limpiar filtros
              </button>
            </Vacio>
          )}

          {resultado.length > 0 && (
            <>
              <ListaProductos productos={mostrados} onAgregar={alAgregar} />
              <div className="d-flex flex-column align-items-center gap-2 pt-2">
                <p className="m-0 small texto-secundario">
                  Mostrando {mostrados.length} de {resultado.length}
                </p>
                <div className="barra-distribucion" style={{ width: 240, flexGrow: 0 }} aria-hidden="true">
                  <span style={{ width: `${(mostrados.length / resultado.length) * 100}%`, background: 'var(--color-primario)' }} />
                </div>
                {mostrados.length < resultado.length && (
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setVisibles((v) => v + POR_PAGINA)}>
                    Cargar {Math.min(POR_PAGINA, resultado.length - mostrados.length)} productos más
                  </button>
                )}
              </div>
            </>
          )}
        </section>
      </div>
      <Notificacion aviso={aviso} alCerrar={cerrarAviso} />
    </div>
  )
}
