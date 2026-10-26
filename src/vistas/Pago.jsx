import { useState } from 'react';
import { Link } from 'react-router-dom';
import ResumenOrden from '../componentes/ResumenOrden.jsx';
import { usarCarrito } from '../contexto/ProveedorCarrito.jsx';
import { regiones } from '../datos/productos.js';
import { limpiarAlmacenamientoCarrito } from '../servicios/servicioCarrito.js';
import { obtenerCupon } from '../servicios/almacenamiento.js';
import { crearOrden } from '../servicios/servicioOrdenes.js';
import { calcularTotales } from '../utilidades/formato.js';

const valoresIniciales = { nombre: '', correo: '', telefono: '', region: '', comuna: '', direccion: '', pago: '' };

function validarFormulario(valores) {
  return {
    nombre: valores.nombre.trim().length >= 3,
    correo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valores.correo.trim()),
    telefono: /^\d{9}$/.test(valores.telefono.trim()),
    region: Boolean(valores.region && regiones[valores.region]),
    comuna: Boolean(valores.region && regiones[valores.region]?.includes(valores.comuna)),
    direccion: valores.direccion.trim().length >= 5,
    pago: ['tarjeta', 'transferencia', 'contraentrega'].includes(valores.pago)
  };
}

export default function Pago() {
  const { carrito, vaciarCarrito } = usarCarrito();
  const [valores, establecerValores] = useState(valoresIniciales);
  const [formularioEnviado, establecerFormularioEnviado] = useState(false);
  const [confirmacion, establecerConfirmacion] = useState(null);
  const [errores, establecerErrores] = useState({});
  const totales = calcularTotales(carrito, obtenerCupon()?.descuento ?? 0);
  const comunasDisponibles = regiones[valores.region] ?? [];

  const actualizarValor = (evento) => {
    const { name, value } = evento.target;
    establecerValores((actuales) => ({ ...actuales, [name]: value, ...(name === 'region' ? { comuna: '' } : {}) }));
    if (formularioEnviado) establecerErrores(validarFormulario({ ...valores, [name]: value, ...(name === 'region' ? { comuna: '' } : {}) }));
  };

  const manejarEnvio = (evento) => {
    evento.preventDefault();
    establecerFormularioEnviado(true);
    const validacion = validarFormulario(valores);
    establecerErrores(validacion);
    if (Object.values(validacion).some((valido) => !valido) || carrito.length === 0) return;

    const orden = crearOrden(totales.total);
    establecerConfirmacion({ orden, correo: valores.correo.trim() });
    vaciarCarrito();
    limpiarAlmacenamientoCarrito();
  };

  if (confirmacion) {
    return <section className="panel-confirmacion text-center rounded-4 p-4 p-md-5"><h1 className="titulo-seccion">¡Compra confirmada!</h1><p className="mt-3">Tu número de orden es <strong>{confirmacion.orden.numero}</strong>.</p><p>Te enviaremos el detalle a <strong>{confirmacion.correo}</strong>.</p><Link className="btn btn-primary mt-2" to="/ordenes.html">Ver mis órdenes</Link></section>;
  }

  if (carrito.length === 0) {
    return <section className="text-center py-5"><h1 className="titulo-seccion">Finalizar compra</h1><p className="lead mt-4">Tu carrito está vacío. No puedes continuar con el pago.</p><Link className="btn btn-primary" to="/catalogo.html">Ir al catálogo</Link></section>;
  }

  const campo = (nombre, etiqueta, tipo = 'text', opciones = {}) => (
    <div className="mb-3">
      <label className="form-label" htmlFor={`campo-${nombre}`}>{etiqueta}</label>
      {opciones.esSelector
        ? <select className={`form-select${formularioEnviado && !errores[nombre] ? ' is-invalid' : ''}`} id={`campo-${nombre}`} name={nombre} value={valores[nombre]} onChange={actualizarValor} disabled={opciones.disabled} autoComplete={opciones.autocomplete}>
          <option value="">{opciones.textoIndicador}</option>
          {opciones.opciones.map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}
        </select>
        : <input className={`form-control${formularioEnviado && !errores[nombre] ? ' is-invalid' : ''}`} id={`campo-${nombre}`} name={nombre} type={tipo} value={valores[nombre]} onChange={actualizarValor} maxLength={opciones.longitudMaxima} autoComplete={opciones.autocomplete} placeholder={opciones.textoIndicador} />}
      {formularioEnviado && !errores[nombre] && <div className="invalid-feedback">{opciones.mensajeError}</div>}
      {opciones.textoAyuda && <div className="form-text">{opciones.textoAyuda}</div>}
    </div>
  );

  return (
    <section>
      <h1 className="titulo-seccion mb-4">Finalizar compra</h1>
      <div className="row g-4 align-items-start">
        <form className="col-12 col-lg-7" noValidate onSubmit={manejarEnvio}>
          <fieldset className="panel-formulario card mb-4">
            <div className="card-body">
              <legend className="h4 float-none w-auto px-0">Datos de despacho</legend>
              {campo('nombre', 'Nombre completo', 'text', { autocomplete: 'name', textoIndicador: 'Ej: Juan Pérez', mensajeError: 'Ingresa tu nombre completo (mínimo 3 caracteres).' })}
              {campo('correo', 'Correo electrónico', 'email', { autocomplete: 'email', textoIndicador: 'Ej: juan@correo.cl', mensajeError: 'Ingresa un correo con formato válido.' })}
              {campo('telefono', 'Teléfono', 'tel', { autocomplete: 'tel', textoIndicador: 'Ej: 912345678', longitudMaxima: 9, textoAyuda: '9 dígitos, sin el +56.', mensajeError: 'El teléfono debe tener 9 dígitos numéricos.' })}
              {campo('region', 'Región', 'text', { esSelector: true, textoIndicador: 'Selecciona una región', opciones: Object.keys(regiones), autocomplete: 'address-level1', mensajeError: 'Selecciona una región.' })}
              {campo('comuna', 'Comuna', 'text', { esSelector: true, textoIndicador: valores.region ? 'Selecciona una comuna' : 'Primero selecciona una región', opciones: comunasDisponibles, disabled: !valores.region, autocomplete: 'address-level2', mensajeError: 'Selecciona una comuna válida para esa región.' })}
              {campo('direccion', 'Dirección', 'text', { autocomplete: 'street-address', textoIndicador: 'Calle, número, depto (opcional)', textoAyuda: 'Incluye calle, número y referencias si es necesario.', mensajeError: 'Ingresa una dirección válida (mínimo 5 caracteres).' })}
            </div>
          </fieldset>
          <fieldset className="panel-formulario card mb-4">
            <div className="card-body">
              <legend className="h4 float-none w-auto px-0">Método de pago (simulado)</legend>
              {['tarjeta', 'transferencia', 'contraentrega'].map((metodoPago) => (
                <div className="form-check mb-2" key={metodoPago}>
                  <input className="form-check-input" id={`pago-${metodoPago}`} name="pago" type="radio" value={metodoPago} checked={valores.pago === metodoPago} onChange={actualizarValor} />
                  <label className="form-check-label" htmlFor={`pago-${metodoPago}`}>{metodoPago === 'tarjeta' ? 'Tarjeta de crédito / débito' : metodoPago === 'transferencia' ? 'Transferencia bancaria' : 'Pago contra-entrega'}</label>
                </div>
              ))}
              {formularioEnviado && !errores.pago && <p className="text-danger mb-0" role="alert">Selecciona un método de pago.</p>}
            </div>
          </fieldset>
          <button className="btn btn-primary btn-lg" type="submit">Confirmar compra</button>
        </form>
        <div className="col-12 col-lg-5"><ResumenOrden articulos={carrito} totales={totales} /></div>
      </div>
    </section>
  );
}
