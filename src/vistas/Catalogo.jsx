import { useEffect, useMemo, useState } from 'react';
import TarjetaProducto from '../componentes/TarjetaProducto.jsx';
import { usarCarrito } from '../contexto/ProveedorCarrito.jsx';
import { productos } from '../datos/productos.js';

const articulosPorPagina = 4;

export default function Catalogo() {
  const { agregarProducto } = usarCarrito();
  const [filtros, establecerFiltros] = useState({ categoria: 'todas', marca: 'todas', minimo: '', maximo: '', orden: 'nombre-asc' });
  const [filtrosAplicados, establecerFiltrosAplicados] = useState(filtros);
  const [hayFiltrosAplicados, establecerHayFiltrosAplicados] = useState(false);
  const [errorPrecio, establecerErrorPrecio] = useState(false);
  const [cantidadVisible, establecerCantidadVisible] = useState(articulosPorPagina);

  const productosFiltrados = useMemo(() => {
    const filtrados = productos.filter((producto) =>
      (filtrosAplicados.categoria === 'todas' || producto.categoria === filtrosAplicados.categoria)
      && (filtrosAplicados.marca === 'todas' || producto.marca === filtrosAplicados.marca)
      && producto.precio >= (Number(filtrosAplicados.minimo) || 0)
      && producto.precio <= (filtrosAplicados.maximo === '' ? Infinity : Number(filtrosAplicados.maximo))
    );
    if (!hayFiltrosAplicados) return filtrados;
    return filtrados.sort((primero, segundo) => {
      switch (filtrosAplicados.orden) {
        case 'nombre-desc': return segundo.nombre.localeCompare(primero.nombre);
        case 'precio-asc': return primero.precio - segundo.precio;
        case 'precio-desc': return segundo.precio - primero.precio;
        default: return primero.nombre.localeCompare(segundo.nombre);
      }
    });
  }, [filtrosAplicados, hayFiltrosAplicados]);

  useEffect(() => establecerCantidadVisible(articulosPorPagina), [filtrosAplicados]);

  const actualizarFiltro = (evento) => establecerFiltros((actuales) => ({ ...actuales, [evento.target.name]: evento.target.value }));
  const aplicarFiltros = (evento) => {
    evento.preventDefault();
    const minimo = filtros.minimo === '' ? 0 : Number(filtros.minimo);
    const maximo = filtros.maximo === '' ? Infinity : Number(filtros.maximo);
    if (minimo > maximo) {
      establecerErrorPrecio(true);
      return;
    }
    establecerErrorPrecio(false);
    establecerHayFiltrosAplicados(true);
    establecerFiltrosAplicados(filtros);
    establecerCantidadVisible(articulosPorPagina);
  };

  return (
    <div className="row g-4">
      <aside className="col-12 col-lg-3">
        <form className="panel-filtros card" onSubmit={aplicarFiltros}>
          <div className="card-body">
            <h2 className="h4 mb-4">Filtros</h2>
            <div className="mb-3">
              <label className="form-label" htmlFor="orden">Ordenar por</label>
              <select className="form-select" id="orden" name="orden" value={filtros.orden} onChange={actualizarFiltro}>
                <option value="nombre-asc">Nombre (A-Z)</option><option value="nombre-desc">Nombre (Z-A)</option>
                <option value="precio-asc">Precio (Menor a Mayor)</option><option value="precio-desc">Precio (Mayor a Menor)</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="categoria">Categoría</label>
              <select className="form-select" id="categoria" name="categoria" value={filtros.categoria} onChange={actualizarFiltro}>
                <option value="todas">Todas</option><option value="perifericos">Periféricos</option><option value="componentes">Componentes</option><option value="monitores">Monitores</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="marca">Marca</label>
              <select className="form-select" id="marca" name="marca" value={filtros.marca} onChange={actualizarFiltro}>
                <option value="todas">Todas</option><option value="ajazz">Ajazz</option><option value="atk">ATK</option><option value="asus">ASUS</option>
              </select>
            </div>
            <fieldset className="mb-3">
              <legend className="form-label">Rango de precio</legend>
              <div className="row g-2">
                <div className="col-6"><label className="visually-hidden" htmlFor="precio-minimo">Mínimo</label><input className="form-control" id="precio-minimo" name="minimo" type="number" min="0" placeholder="Mínimo" value={filtros.minimo} onChange={actualizarFiltro} /></div>
                <div className="col-6"><label className="visually-hidden" htmlFor="precio-maximo">Máximo</label><input className="form-control" id="precio-maximo" name="maximo" type="number" min="0" placeholder="Máximo" value={filtros.maximo} onChange={actualizarFiltro} /></div>
              </div>
            </fieldset>
            {errorPrecio && <p className="text-danger" role="alert">El mínimo no puede ser mayor al máximo.</p>}
            <button className="btn btn-primary w-100" type="submit">Aplicar filtros</button>
          </div>
        </form>
      </aside>
      <section className="col-12 col-lg-9" aria-labelledby="titulo-catalogo">
        <h1 className="titulo-seccion mb-4" id="titulo-catalogo">Catálogo de productos</h1>
        {productosFiltrados.length === 0
          ? <p>No se encontraron productos con esos filtros.</p>
          : <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-4">
            {productosFiltrados.slice(0, cantidadVisible).map((producto) => <TarjetaProducto key={producto.id} producto={producto} alAgregar={agregarProducto} />)}
          </div>}
        {productosFiltrados.length > cantidadVisible && <div className="text-center mt-4"><button className="btn btn-outline-primary" type="button" onClick={() => establecerCantidadVisible((cantidad) => cantidad + articulosPorPagina)}>Cargar más productos</button></div>}
      </section>
    </div>
  );
}
