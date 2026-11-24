import { useState } from 'react'
import { comunasDe, REGIONES } from '../data/regiones.js'
import { METODOS_PAGO } from '../logica/estados.js'
import { clp } from '../logica/formato.js'
import { validarDespacho } from '../logica/validaciones.js'
import Campo from './Campo.jsx'
import Icono from './Icono.jsx'

const ETIQUETAS = {
  nombre: 'Nombre completo',
  correo: 'Correo electrónico',
  telefono: 'Teléfono móvil',
  region: 'Región',
  comuna: 'Comuna',
  direccion: 'Dirección',
}

const VACIO = { nombre: '', correo: '', telefono: '', region: '', comuna: '', direccion: '', depto: '', indicaciones: '' }

// Formulario controlado de despacho y pago. El botón queda deshabilitado mientras falte un dato
// obligatorio (por ejemplo, la dirección) o el carrito esté vacío.
export default function FormularioCheckout({ datosIniciales, total = 0, carritoVacio = false, enviando = false, onConfirmar }) {
  const [datos, setDatos] = useState({ ...VACIO, metodoPago: 'DEBITO', ...datosIniciales })
  const [tocados, setTocados] = useState({})

  const errores = validarDespacho(datos)
  const pendientes = Object.keys(errores)
  const bloqueado = pendientes.length > 0 || carritoVacio || enviando
  const mostrar = (campo) => (tocados[campo] ? errores[campo] : '')

  function cambiar(campo, valor) {
    setDatos((d) => ({ ...d, [campo]: valor, ...(campo === 'region' ? { comuna: '' } : {}) }))
    if (campo === 'region' || campo === 'comuna') setTocados((t) => ({ ...t, [campo]: true }))
  }

  const tocar = (campo) => () => setTocados((t) => ({ ...t, [campo]: true }))

  function enviar(e) {
    e.preventDefault()
    if (bloqueado) {
      setTocados(Object.fromEntries(Object.keys(ETIQUETAS).map((c) => [c, true])))
      return
    }
    onConfirmar(datos)
  }

  const visibles = pendientes.filter((c) => tocados[c])
  const comunas = comunasDe(datos.region)

  return (
    <form onSubmit={enviar} noValidate className="d-flex flex-column gap-4" aria-label="Datos de despacho y pago">
      {visibles.length > 0 && (
        <div className="aviso aviso-error" role="alert">
          <Icono nombre="alerta" tamano={20} grosor={2.2} />
          <div>
            <p className="fw-semibold">
              {visibles.length === 1 ? 'Revisa 1 campo antes de confirmar' : `Revisa ${visibles.length} campos antes de confirmar`}
            </p>
            <ul className="mb-0 mt-1 ps-3 small">
              {visibles.map((c) => (
                <li key={c}>
                  <a href={`#${c}`} className="text-danger">
                    {ETIQUETAS[c]}: {errores[c]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <section className="tarjeta p-4" aria-labelledby="titulo-despacho">
        <div className="d-flex flex-wrap justify-content-between align-items-baseline gap-2 mb-3">
          <h2 id="titulo-despacho" className="h4 m-0">
            Datos de despacho
          </h2>
          <p className="m-0 small texto-secundario">
            <span className="text-danger" aria-hidden="true">
              *
            </span>{' '}
            Obligatorio
          </p>
        </div>
        <div className="row g-3">
          <Campo
            className="col-12"
            id="nombre"
            etiqueta={ETIQUETAS.nombre}
            requerido
            autoComplete="name"
            valor={datos.nombre}
            alCambiar={(v) => cambiar('nombre', v)}
            onBlur={tocar('nombre')}
            error={mostrar('nombre')}
            ayuda="Quien recibe el pedido."
          />
          <Campo
            className="col-md-6"
            id="correo"
            tipo="email"
            etiqueta={ETIQUETAS.correo}
            requerido
            autoComplete="email"
            valor={datos.correo}
            alCambiar={(v) => cambiar('correo', v)}
            onBlur={tocar('correo')}
            error={mostrar('correo')}
            ayuda="Aquí llega el comprobante."
          />
          <Campo
            className="col-md-6"
            id="telefono"
            tipo="tel"
            etiqueta={ETIQUETAS.telefono}
            requerido
            autoComplete="tel-national"
            inputMode="numeric"
            maxLength={9}
            valor={datos.telefono}
            alCambiar={(v) => cambiar('telefono', v)}
            onBlur={tocar('telefono')}
            error={mostrar('telefono')}
            ayuda="9 dígitos, sin +56 ni espacios."
          />
          <Campo
            className="col-md-6"
            id="region"
            como="select"
            etiqueta={ETIQUETAS.region}
            requerido
            autoComplete="address-level1"
            opciones={[{ valor: '', texto: 'Elige una región' }, ...REGIONES.map((r) => ({ valor: r.nombre, texto: r.nombre }))]}
            valor={datos.region}
            alCambiar={(v) => cambiar('region', v)}
            onBlur={tocar('region')}
            error={mostrar('region')}
          />
          <Campo
            className="col-md-6"
            id="comuna"
            como="select"
            etiqueta={ETIQUETAS.comuna}
            requerido
            autoComplete="address-level2"
            opciones={[
              { valor: '', texto: datos.region ? 'Elige una comuna' : 'Primero elige la región' },
              ...comunas.map((c) => ({ valor: c, texto: c })),
            ]}
            valor={datos.comuna}
            alCambiar={(v) => cambiar('comuna', v)}
            onBlur={tocar('comuna')}
            error={mostrar('comuna')}
            disabled={!datos.region}
          />
          <Campo
            className="col-12"
            id="direccion"
            etiqueta={ETIQUETAS.direccion}
            requerido
            autoComplete="address-line1"
            placeholder="Calle y número, por ejemplo Av. Los Aromos 1450"
            valor={datos.direccion}
            alCambiar={(v) => cambiar('direccion', v)}
            onBlur={tocar('direccion')}
            error={mostrar('direccion')}
            ayuda="Donde entregamos el pedido."
          />
          <Campo
            className="col-md-6"
            id="depto"
            etiqueta="Depto., casa u oficina"
            opcional
            autoComplete="address-line2"
            valor={datos.depto}
            alCambiar={(v) => cambiar('depto', v)}
          />
          <Campo
            className="col-md-6"
            id="indicaciones"
            etiqueta="Indicaciones para la entrega"
            opcional
            placeholder="Ej.: dejar en conserjería"
            valor={datos.indicaciones}
            alCambiar={(v) => cambiar('indicaciones', v)}
          />
        </div>
      </section>

      <section className="tarjeta p-4" aria-labelledby="titulo-pago">
        <h2 id="titulo-pago" className="h4 mb-3">
          Método de pago
        </h2>
        <fieldset className="d-flex flex-column gap-2">
          <legend className="visualmente-oculto">Elige un método de pago</legend>
          {METODOS_PAGO.map((metodo) => {
            const activo = datos.metodoPago === metodo.id
            return (
              <label
                key={metodo.id}
                className="d-flex align-items-center gap-3 p-3 rounded-3"
                style={{ border: `1px solid ${activo ? 'var(--color-primario)' : 'var(--color-borde)'}`, background: activo ? 'var(--color-tinte-primario)' : 'transparent', cursor: 'pointer' }}
              >
                <input className="form-check-input m-0" type="radio" name="metodoPago" value={metodo.id} checked={activo} onChange={() => cambiar('metodoPago', metodo.id)} />
                <span className="panel-imagen d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }} aria-hidden="true">
                  <Icono nombre="tarjeta" />
                </span>
                <span className="d-flex flex-column">
                  <span className="fw-semibold">{metodo.nombre}</span>
                  <span className="small texto-secundario">{metodo.detalle}</span>
                </span>
              </label>
            )
          })}
        </fieldset>
        <p className="mensaje mensaje-ayuda mt-3">
          <Icono nombre="info" tamano={16} />
          Pago simulado: no se cobra dinero real. El despacho se genera solo si el pago queda aprobado.
        </p>
      </section>

      <div className="d-flex flex-column gap-2">
        <button type="submit" className="btn btn-primary btn-lg" disabled={bloqueado} aria-describedby="motivo-bloqueo">
          <Icono nombre="candado" />
          {enviando ? 'Confirmando…' : `Confirmar compra · ${clp(total)}`}
        </button>
        {bloqueado && !enviando && (
          <p id="motivo-bloqueo" className="mensaje mensaje-aviso m-0">
            <Icono nombre="alerta" tamano={15} grosor={2.2} />
            {carritoVacio
              ? 'Tu carrito está vacío: agrega productos antes de pagar.'
              : `Para confirmar, completa o corrige: ${pendientes.map((c) => ETIQUETAS[c]).join(', ')}.`}
          </p>
        )}
      </div>
    </form>
  )
}
