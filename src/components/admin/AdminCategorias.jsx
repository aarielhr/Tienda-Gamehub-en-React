import { useState } from 'react'
import { plural } from '../../logica/formato.js'
import { validarCategoria } from '../../logica/validaciones.js'
import { crearCategoria, eliminarCategoria, renombrarCategoria } from '../../services/admin.js'
import { Cargando, MensajeError } from '../Estado.jsx'
import Icono from '../Icono.jsx'

function FilaCategoria({ categoria, todas, avisar, onCambio }) {
  const [modo, setModo] = useState('ver')
  const [nombre, setNombre] = useState(categoria.nombre)
  const [enviando, setEnviando] = useState(false)
  const error = modo === 'renombrar' ? validarCategoria(nombre, todas, categoria.id) : ''
  const conProductos = categoria.cantidadProductos > 0

  async function ejecutar(accion, texto) {
    setEnviando(true)
    try {
      await accion()
      avisar({ tipo: 'ok', texto })
      setModo('ver')
      onCambio()
    } catch (e) {
      avisar({ tipo: 'error', texto: e.message })
    } finally {
      setEnviando(false)
    }
  }

  if (modo === 'renombrar') {
    return (
      <li className="d-flex flex-column gap-2 py-3 border-top">
        <form
          className="d-flex flex-wrap align-items-start gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (!error && nombre.trim() !== categoria.nombre) {
              ejecutar(() => renombrarCategoria(categoria.id, nombre.trim()), `La categoría ahora se llama «${nombre.trim()}».`)
            }
          }}
        >
          <label htmlFor={`categoria-${categoria.id}`} className="visualmente-oculto">
            Nuevo nombre de {categoria.nombre}
          </label>
          <input
            id={`categoria-${categoria.id}`}
            className={`form-control ${error ? 'is-invalid' : ''}`}
            style={{ flex: '1 1 200px' }}
            value={nombre}
            maxLength={60}
            onChange={(e) => setNombre(e.target.value)}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `categoria-${categoria.id}-mensaje` : undefined}
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={Boolean(error) || enviando}>
            Guardar
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => {
              setModo('ver')
              setNombre(categoria.nombre)
            }}
          >
            Cancelar
          </button>
        </form>
        {error && (
          <p id={`categoria-${categoria.id}-mensaje`} className="mensaje mensaje-error">
            <Icono nombre="alerta" tamano={15} grosor={2.2} />
            {error}
          </p>
        )}
      </li>
    )
  }

  return (
    <li className="d-flex flex-wrap align-items-center gap-2 py-3 border-top">
      <span className="flex-grow-1">
        <span className="fw-semibold">{categoria.nombre}</span>
        <span className="d-block small texto-secundario">
          <span className="texto-mono">/{categoria.slug}</span> · {plural(categoria.cantidadProductos, 'producto', 'productos')}
        </span>
      </span>
      {modo === 'eliminar' ? (
        <span className="d-flex flex-wrap align-items-center gap-2" role="group" aria-label={`Confirmar eliminación de ${categoria.nombre}`}>
          <span className="small">¿Eliminar?</span>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            disabled={enviando}
            onClick={() => ejecutar(() => eliminarCategoria(categoria.id), `La categoría «${categoria.nombre}» fue eliminada.`)}
          >
            Sí, eliminar
          </button>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setModo('ver')}>
            No
          </button>
        </span>
      ) : (
        <span className="d-flex gap-2">
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setModo('renombrar')} aria-label={`Renombrar ${categoria.nombre}`}>
            <Icono nombre="lapiz" tamano={16} />
          </button>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            disabled={conProductos}
            onClick={() => setModo('eliminar')}
            aria-label={`Eliminar ${categoria.nombre}`}
            title={conProductos ? 'Tiene productos: muévelos antes de eliminarla.' : undefined}
          >
            <Icono nombre="basura" tamano={16} />
          </button>
        </span>
      )}
    </li>
  )
}

// Categorías: crear, renombrar y eliminar. El backend responde 409 si el nombre se repite
// o si la categoría todavía tiene productos.
export default function AdminCategorias({ categorias, avisar, onCambio }) {
  const [nombre, setNombre] = useState('')
  const [intentado, setIntentado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const lista = categorias.datos ?? []
  const error = validarCategoria(nombre, lista)

  async function agregar(e) {
    e.preventDefault()
    setIntentado(true)
    if (error || enviando) return
    setEnviando(true)
    try {
      const nueva = await crearCategoria(nombre.trim())
      avisar({ tipo: 'ok', texto: `Categoría «${nueva.nombre}» creada.` })
      setNombre('')
      setIntentado(false)
      onCambio()
    } catch (err) {
      avisar({ tipo: 'error', texto: err.message })
    } finally {
      setEnviando(false)
    }
  }

  if (categorias.cargando && !categorias.datos) return <Cargando texto="Cargando categorías…" />
  if (categorias.error) return <MensajeError error={categorias.error} alReintentar={categorias.recargar} />

  const mostrarError = intentado || (nombre.trim() && error.includes('ya existe'))

  return (
    <div className="tarjeta p-4 d-flex flex-column gap-2">
      <ul className="list-unstyled m-0">
        {lista.map((c) => (
          <FilaCategoria key={c.id} categoria={c} todas={lista} avisar={avisar} onCambio={onCambio} />
        ))}
      </ul>
      <form onSubmit={agregar} noValidate className="d-flex flex-column gap-2 pt-3 border-top">
        <label htmlFor="nueva-categoria" className="form-label m-0">
          Nueva categoría
        </label>
        <div className="d-flex flex-wrap gap-2">
          <input
            id="nueva-categoria"
            className={`form-control ${mostrarError && error ? 'is-invalid' : ''}`}
            style={{ flex: '1 1 200px' }}
            value={nombre}
            maxLength={60}
            placeholder="Por ejemplo: Sillas gamer"
            onChange={(e) => setNombre(e.target.value)}
            aria-invalid={mostrarError && error ? 'true' : undefined}
            aria-describedby={mostrarError && error ? 'nueva-categoria-mensaje' : undefined}
          />
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            <Icono nombre="mas" />
            Agregar
          </button>
        </div>
        {mostrarError && error && (
          <p id="nueva-categoria-mensaje" className="mensaje mensaje-error">
            <Icono nombre="alerta" tamano={15} grosor={2.2} />
            {error}
          </p>
        )}
      </form>
    </div>
  )
}
