import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ResumenOrden from '../componentes/ResumenOrden.jsx';
import { useCarrito } from '../context/useCarrito.js';
import { useAuth } from '../context/useAuth.js';
import { regiones } from '../datos/productos.js';
import { REGIONES } from '../data/regiones.js';
import { calcularTotales } from '../utilidades/formato.js';
import { obtenerPerfil } from '../services/autenticacion.js';
import { crearOrden } from '../services/ordenes.js';
import { Cargando, MensajeError } from '../components/Estado.jsx';

const inicial = { nombre: '', correo: '', telefono: '', region: '', comuna: '', direccion: '', metodoPago: 'DEBITO' };

export default function Pago() {
  const { lineas: carrito, vaciar: vaciarCarrito, cupon } = useCarrito();
  const { usuario } = useAuth();
  const navegar = useNavigate();
  const [valores, setValores] = useState(inicial);
  const [tocados, setTocados] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  useEffect(() => {
    let vigente = true;
    obtenerPerfil().then((p) => { if (vigente) setValores((v) => ({ ...v, nombre: p.nombre ?? usuario?.nombre ?? '', correo: p.email ?? usuario?.email ?? '', telefono: p.telefono ?? '', region: ({ 'Región de Valparaíso': 'Valparaíso', 'Región Metropolitana de Santiago': 'Metropolitana de Santiago', 'Región del Biobío': 'Biobío' })[p.region] ?? p.region ?? '', comuna: p.comuna ?? '', direccion: p.direccion ?? '' })); }).catch(() => { if (vigente) setValores((v) => ({ ...v, nombre: usuario?.nombre ?? '', correo: usuario?.email ?? '' })); }).finally(() => { if (vigente) setCargandoPerfil(false); });
    return () => { vigente = false; };
  }, [usuario]);
  const regionesValidas = Object.fromEntries(REGIONES.map((r) => [r.nombre, r.comunas]));
  const aliasRegion = { 'Valparaíso': 'Región de Valparaíso', 'Metropolitana de Santiago': 'Región Metropolitana de Santiago', 'Biobío': 'Región del Biobío' };
  const validar = (v) => ({

    nombre: v.nombre.trim().length >= 3 ? '' : 'Ingresa tu nombre completo (mínimo 3 caracteres).',
    correo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.correo.trim()) ? '' : 'Ingresa un correo con formato válido.',
    telefono: /^9\d{8}$/.test(v.telefono.trim()) ? '' : 'El teléfono debe tener 9 dígitos y empezar con 9.',
    region: (regionesValidas[aliasRegion[v.region] ?? v.region] || regiones[v.region]) ? '' : 'Selecciona una región válida.',
    comuna: (regionesValidas[aliasRegion[v.region] ?? v.region] || regiones[v.region])?.includes(v.comuna) ? '' : 'Selecciona una comuna válida para esa región.',
    direccion: v.direccion.trim().length >= 5 ? '' : 'Ingresa una dirección válida (mínimo 5 caracteres).',
    metodoPago: ['DEBITO', 'CREDITO', 'TRANSFERENCIA'].includes(v.metodoPago) ? '' : 'Selecciona un método de pago.',
  });
  const errores = validar(valores);
  const cambiar = (campo, valor) => setValores((v) => ({ ...v, [campo]: valor, ...(campo === 'region' ? { comuna: '' } : {}) }));
  async function enviar(e) {
    e.preventDefault(); setTocados(Object.fromEntries(Object.keys(inicial).map((k) => [k, true])));
    if (Object.values(errores).some(Boolean) || carrito.length === 0 || enviando) return;
    setEnviando(true); setError(null);
    try {
      const orden = await crearOrden({
        lineas: carrito.map((l) => ({ productoId: l.productoId, cantidad: l.cantidad })),
        cupon: cupon?.codigo ?? null,
        metodoPago: valores.metodoPago,
        despacho: { nombre: valores.nombre.trim(), correo: valores.correo.trim(), telefono: valores.telefono.trim(), region: ({ 'Valparaíso': 'Región de Valparaíso', 'Metropolitana de Santiago': 'Región Metropolitana de Santiago', 'Biobío': 'Región del Biobío' })[valores.region] ?? valores.region, comuna: valores.comuna, direccion: valores.direccion.trim(), depto: '', indicaciones: '' },
      });
      if (orden.pago?.estado !== 'RECHAZADO') vaciarCarrito();
      navegar(`/ordenes/${orden.id}/confirmacion`, { state: { orden } });
    } catch (err) { setError(err); }
    finally { setEnviando(false); }
  }
  if (!carrito.length) return <section className="text-center py-5"><h1 className="titulo-seccion">Finalizar compra</h1><p className="lead">Tu carrito está vacío.</p><Link className="btn btn-primary" to="/catalogo.html">Ir al catálogo</Link></section>;
  return <section><h1 className="titulo-seccion mb-4">Finalizar compra</h1><MensajeError error={error} />{cargandoPerfil && <Cargando texto="Cargando tus datos de despacho…" />}<div className="row g-4 align-items-start"><form className="col-12 col-lg-7" noValidate onSubmit={enviar}><fieldset className="panel-formulario card mb-4"><div className="card-body"><legend className="h4">Datos de despacho</legend>{[
    ['nombre', 'Nombre completo', 'text', 'name'], ['correo', 'Correo electrónico', 'email', 'email'], ['telefono', 'Teléfono', 'tel', 'tel'], ['direccion', 'Dirección', 'text', 'street-address'],
  ].map(([campo, etiqueta, tipo, autocomplete]) => <div className="mb-3" key={campo}><label className="form-label" htmlFor={`campo-${campo}`}>{etiqueta}</label><input className={`form-control ${tocados[campo] && errores[campo] ? 'is-invalid' : ''}`} id={`campo-${campo}`} type={tipo} autoComplete={autocomplete} value={valores[campo]} onChange={(e) => cambiar(campo, e.target.value)} onBlur={() => setTocados((t) => ({ ...t, [campo]: true }))} />{tocados[campo] && errores[campo] && <div className="invalid-feedback">{errores[campo]}</div>}</div>)}<div className="row"><div className="col-md-6 mb-3"><label className="form-label" htmlFor="campo-region">Región</label><select id="campo-region" className={`form-select ${tocados.region && errores.region ? 'is-invalid' : ''}`} value={valores.region} onChange={(e) => cambiar('region', e.target.value)} onBlur={() => setTocados((t) => ({ ...t, region: true }))}><option value="">Selecciona una región</option>{Object.keys(regionesValidas).map((r) => <option key={r}>{r}</option>)}</select>{tocados.region && errores.region && <div className="invalid-feedback">{errores.region}</div>}</div><div className="col-md-6 mb-3"><label className="form-label" htmlFor="campo-comuna">Comuna</label><select id="campo-comuna" className={`form-select ${tocados.comuna && errores.comuna ? 'is-invalid' : ''}`} disabled={!valores.region} value={valores.comuna} onChange={(e) => cambiar('comuna', e.target.value)} onBlur={() => setTocados((t) => ({ ...t, comuna: true }))}><option value="">Selecciona una comuna</option>{(regionesValidas[aliasRegion[valores.region] ?? valores.region] ?? regiones[valores.region] ?? []).map((c) => <option key={c}>{c}</option>)}</select>{tocados.comuna && errores.comuna && <div className="invalid-feedback">{errores.comuna}</div>}</div></div></div></fieldset><fieldset className="panel-formulario card mb-4"><div className="card-body"><legend className="h4">Método de pago simulado</legend>{[['DEBITO', 'Tarjeta de débito'], ['CREDITO', 'Tarjeta de crédito'], ['TRANSFERENCIA', 'Transferencia bancaria']].map(([value, label]) => <div className="form-check" key={value}><input className="form-check-input" type="radio" id={`pago-${value}`} name="pago" checked={valores.metodoPago === value} onChange={() => cambiar('metodoPago', value)} /><label className="form-check-label" htmlFor={`pago-${value}`}>{label}</label></div>)}</div></fieldset><button className="btn btn-primary btn-lg" type="submit" disabled={enviando}>{enviando ? 'Procesando orden…' : 'Confirmar compra'}</button></form><aside className="col-12 col-lg-5"><ResumenOrden articulos={carrito} totales={calcularTotales(carrito, cupon?.porcentaje ? cupon.porcentaje / 100 : cupon?.descuento ?? 0)} /></aside></div></section>;
}
