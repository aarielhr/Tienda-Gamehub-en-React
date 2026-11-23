import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TarjetaProducto from '../componentes/TarjetaProducto.jsx';
import { usarCarrito } from '../contexto/ProveedorCarrito.jsx';
import { Cargando, MensajeError, Vacio } from '../components/Estado.jsx';
import { listarProductos } from '../services/catalogo.js';

const porPagina = 9;
const normalizar = (texto = '') => texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

export default function Catalogo() {
  const [params] = useSearchParams();
  const categoria = params.get('categoria') ?? '';
  const busqueda = params.get('q') ?? '';
  const { agregarProducto } = usarCarrito();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({ marca: 'todas', minimo: '', maximo: '', orden: 'nombre-asc' });
  const [errorRango, setErrorRango] = useState(false);
  const [visibles, setVisibles] = useState(porPagina);
  useEffect(() => {
    let vigente = true;
    setCargando(true); setError(null);
    listarProductos(categoria).then((datos) => { if (vigente) setProductos(datos); }).catch((e) => { if (vigente) setError(e); }).finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [categoria]);
  const marcas = [...new Set(productos.map((p) => p.marca))].sort((a, b) => a.localeCompare(b, 'es'));
  const filtrados = useMemo(() => {
    let lista = productos.filter((p) => (!busqueda || normalizar(`${p.nombre} ${p.marca} ${p.categoria}`).includes(normalizar(busqueda))) && (filtros.marca === 'todas' || p.marca === filtros.marca) && (!filtros.minimo || p.precio >= Number(filtros.minimo)) && (!filtros.maximo || p.precio <= Number(filtros.maximo)));
    lista = [...lista];
    if (filtros.orden === 'precio-asc') lista.sort((a, b) => a.precio - b.precio);
    if (filtros.orden === 'precio-desc') lista.sort((a, b) => b.precio - a.precio);
    if (filtros.orden === 'nombre-desc') lista.sort((a, b) => b.nombre.localeCompare(a.nombre, 'es'));
    if (filtros.orden === 'nombre-asc') lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    return lista;
  }, [productos, filtros, busqueda]);
  function cambio(campo, valor) { setFiltros((f) => ({ ...f, [campo]: valor })); setVisibles(porPagina); if (campo === 'minimo' || campo === 'maximo') setErrorRango(false); }
  function aplicar(e) { e.preventDefault(); if (filtros.minimo !== '' && filtros.maximo !== '' && Number(filtros.minimo) > Number(filtros.maximo)) { setErrorRango(true); return; } setErrorRango(false); }
  return <div className="row g-4"><aside className="col-12 col-lg-3"><form className="panel-filtros card" onSubmit={aplicar}><div className="card-body"><h2 className="h4 mb-4">Filtros</h2><div className="mb-3"><label className="form-label" htmlFor="orden">Ordenar por</label><select className="form-select" id="orden" value={filtros.orden} onChange={(e) => cambio('orden', e.target.value)}><option value="nombre-asc">Nombre (A-Z)</option><option value="nombre-desc">Nombre (Z-A)</option><option value="precio-asc">Precio (menor a mayor)</option><option value="precio-desc">Precio (mayor a menor)</option></select></div><div className="mb-3"><label className="form-label" htmlFor="marca">Marca</label><select className="form-select" id="marca" value={filtros.marca} onChange={(e) => cambio('marca', e.target.value)}><option value="todas">Todas</option>{marcas.map((marca) => <option key={marca} value={marca}>{marca}</option>)}</select></div><fieldset className="mb-3"><legend className="form-label">Rango de precio</legend><div className="row g-2"><div className="col-6"><label className="visually-hidden" htmlFor="precio-minimo">Mínimo</label><input className="form-control" id="precio-minimo" type="number" min="0" placeholder="Mínimo" value={filtros.minimo} onChange={(e) => cambio('minimo', e.target.value)} /></div><div className="col-6"><label className="visually-hidden" htmlFor="precio-maximo">Máximo</label><input className="form-control" id="precio-maximo" type="number" min="0" placeholder="Máximo" value={filtros.maximo} onChange={(e) => cambio('maximo', e.target.value)} /></div></div></fieldset>{errorRango && <p className="text-danger" role="alert">El mínimo no puede ser mayor al máximo.</p>}<button className="btn btn-primary w-100" type="submit">Aplicar filtros</button></div></form></aside><section className="col-12 col-lg-9" aria-labelledby="titulo-catalogo"><h1 className="titulo-seccion mb-4" id="titulo-catalogo">{categoria ? productos[0]?.categoria ?? 'Catálogo por categoría' : 'Catálogo de productos'}</h1>{cargando && <Cargando texto="Cargando productos y stock del Gateway…" />}{error && <MensajeError error={error} alReintentar={() => { setCargando(true); listarProductos(categoria).then(setProductos).catch(setError).finally(() => setCargando(false)); }} />}{!cargando && !error && !filtrados.length && <Vacio titulo="No se encontraron productos" texto="Prueba con otros filtros o revisa otra categoría." />}{!cargando && !error && filtrados.length > 0 && <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-4">{filtrados.slice(0, visibles).map((p) => <TarjetaProducto key={p.id} producto={p} alAgregar={agregarProducto} />)}</div>}{filtrados.length > visibles && <div className="text-center mt-4"><button className="btn btn-outline-primary" type="button" onClick={() => setVisibles((n) => n + porPagina)}>Cargar más productos</button></div>}</section></div>;
}
