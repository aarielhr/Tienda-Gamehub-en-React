import { useState } from 'react'
import { useCarga } from '../../hooks/useCarga.js'
import { ESTADO_PROMOCION } from '../../logica/estados.js'
import { aFechaISO, clp, fecha } from '../../logica/formato.js'
import { validarPromocion } from '../../logica/validaciones.js'
import { cambiarActivoPromocion, crearPromocion, listarPromociones } from '../../services/admin.js'
import Campo from '../Campo.jsx'
import { Cargando, MensajeError } from '../Estado.jsx'
import Icono from '../Icono.jsx'
import { InsigniaEstado } from '../Insignia.jsx'

const VACIA = { codigo: '', porcentaje: '', tope: '', usosMaximos: '', inicio: aFechaISO(), termino: '' }

function FormularioPromocion({ avisar, onCreada }) {
  const [datos, setDatos] = useState(VACIA)
  const [tocados, setTocados] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [errorCodigo, setErrorCodigo] = useState('')

  const errores = { ...validarPromocion(datos), ...(errorCodigo ? { codigo: errorCodigo } : {}) }
  const mostrar = (campo) => (tocados[campo] ? errores[campo] : '')
  const tocar = (campo) => () => setTocados((t) => ({ ...t, [campo]: true }))
  const cambiar = (campo) => (valor) => {
    setDatos((d) => ({ ...d, [campo]: campo === 'codigo' ? valor.toUpperCase() : valor }))
    if (campo === 'codigo') setErrorCodigo('')
    if (campo === 'inicio' || campo === 'termino') setTocados((t) => ({ ...t, [campo]: true }))
  }

  async function enviar(e) {
    e.preventDefault()
    setTocados(Object.fromEntries(Object.keys(VACIA).map((c) => [c, true])))
    if (Object.keys(errores).length > 0 || enviando) return
    setEnviando(true)
    try {
      const promocion = await crearPromocion({
        codigo: datos.codigo.trim(),
        porcentaje: Number(datos.porcentaje),
        tope: Number(datos.tope),
        usosMaximos: Number(datos.usosMaximos),
        inicio: datos.inicio,
        termino: datos.termino,
      })
      avisar({ tipo: 'ok', texto: `Cupón ${promocion.codigo} creado (${ESTADO_PROMOCION[promocion.estado].texto.toLowerCase()}).` })
      setDatos(VACIA)
      setTocados({})
      onCreada()
    } catch (err) {
      if (err.estado === 409) setErrorCodigo(err.message)
      else avisar({ tipo: 'error', texto: err.message })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="d-flex flex-column gap-3 pt-3 border-top" aria-labelledby="titulo-nueva-promocion">
      <h3 id="titulo-nueva-promocion" className="h6 m-0">
        Nueva promoción
      </h3>
      <div className="row g-3">
        <Campo
          className="col-md-4"
          id="promo-codigo"
          etiqueta="Código"
          requerido
          maxLength={20}
          valor={datos.codigo}
          alCambiar={cambiar('codigo')}
          onBlur={tocar('codigo')}
          error={mostrar('codigo')}
          ayuda="De 4 a 20 letras o números."
        />
        <Campo
          className="col-6 col-md-4"
          id="promo-porcentaje"
          tipo="number"
          etiqueta="Descuento (%)"
          requerido
          min={1}
          max={90}
          valor={datos.porcentaje}
          alCambiar={cambiar('porcentaje')}
          onBlur={tocar('porcentaje')}
          error={mostrar('porcentaje')}
        />
        <Campo
          className="col-6 col-md-4"
          id="promo-tope"
          tipo="number"
          etiqueta="Tope de descuento"
          requerido
          min={1}
          valor={datos.tope}
          alCambiar={cambiar('tope')}
          onBlur={tocar('tope')}
          error={mostrar('tope')}
          ayuda="Monto máximo en CLP."
        />
        <Campo
          className="col-md-4"
          id="promo-usos"
          tipo="number"
          etiqueta="Tope de usos"
          requerido
          min={1}
          valor={datos.usosMaximos}
          alCambiar={cambiar('usosMaximos')}
          onBlur={tocar('usosMaximos')}
          error={mostrar('usosMaximos')}
        />
        <Campo
          className="col-6 col-md-4"
          id="promo-inicio"
          tipo="date"
          etiqueta="Inicio"
          requerido
          valor={datos.inicio}
          alCambiar={cambiar('inicio')}
          error={mostrar('inicio')}
        />
        <Campo
          className="col-6 col-md-4"
          id="promo-termino"
          tipo="date"
          etiqueta="Término"
          requerido
          min={datos.inicio || undefined}
          valor={datos.termino}
          alCambiar={cambiar('termino')}
          error={mostrar('termino')}
        />
      </div>
      <div>
        <button type="submit" className="btn btn-primary" disabled={enviando}>
          <Icono nombre="etiqueta" />
          {enviando ? 'Creando…' : 'Crear promoción'}
        </button>
      </div>
    </form>
  )
}

// Cupones con vigencia, tope de descuento y tope de usos. El estado (vigente, programada, vencida,
// agotada o inactiva) lo calcula el backend con la fecha del día.
export default function AdminPromociones({ avisar }) {
  const promociones = useCarga(() => listarPromociones(), [])
  const [cambiando, setCambiando] = useState(null)

  async function alternar(p) {
    setCambiando(p.id)
    try {
      await cambiarActivoPromocion(p.id, !p.activa)
      avisar({ tipo: 'ok', texto: `Cupón ${p.codigo} ${p.activa ? 'desactivado' : 'activado'}.` })
      promociones.recargar()
    } catch (e) {
      avisar({ tipo: 'error', texto: e.message })
    } finally {
      setCambiando(null)
    }
  }

  if (promociones.cargando && !promociones.datos) return <Cargando texto="Cargando promociones…" />
  if (promociones.error) return <MensajeError error={promociones.error} alReintentar={promociones.recargar} />

  return (
    <div className="tarjeta p-4 d-flex flex-column gap-3">
      <ul className="list-unstyled m-0 d-flex flex-column">
        {promociones.datos.map((p) => (
          <li key={p.id} className="d-flex flex-wrap align-items-center gap-3 py-3 border-bottom">
            <code className="codigo-cupon" style={{ fontSize: '0.9375rem', padding: '0.375rem 0.75rem' }}>
              {p.codigo}
            </code>
            <span className="flex-grow-1" style={{ minWidth: 200 }}>
              <span className="d-flex flex-wrap align-items-center gap-2">
                <InsigniaEstado estado={ESTADO_PROMOCION[p.estado]} />
                <span className="small">
                  {p.porcentaje} % · tope {clp(p.tope)}
                </span>
              </span>
              <span className="d-block small texto-secundario mt-1">
                {fecha(p.inicio)} al {fecha(p.termino)} ·{' '}
                <span className="texto-mono">
                  {p.usos}/{p.usosMaximos}
                </span>{' '}
                usos
              </span>
            </span>
            <button
              type="button"
              className={`btn btn-sm ${p.activa ? 'btn-outline-danger' : 'btn-tonal'}`}
              disabled={cambiando === p.id}
              onClick={() => alternar(p)}
              aria-label={`${p.activa ? 'Desactivar' : 'Activar'} el cupón ${p.codigo}`}
            >
              {p.activa ? 'Desactivar' : 'Activar'}
            </button>
          </li>
        ))}
      </ul>
      <FormularioPromocion avisar={avisar} onCreada={promociones.recargar} />
    </div>
  )
}
