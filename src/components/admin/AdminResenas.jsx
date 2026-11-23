import { useState } from 'react'
import { Link } from 'react-router'
import { useCarga } from '../../hooks/useCarga.js'
import { ESTADO_RESENA } from '../../logica/estados.js'
import { fecha, plural } from '../../logica/formato.js'
import { listarResenasAdmin, moderarResena } from '../../services/admin.js'
import { Cargando, MensajeError } from '../Estado.jsx'
import Estrellas from '../Estrellas.jsx'
import Icono from '../Icono.jsx'
import { InsigniaEstado } from '../Insignia.jsx'

const FILTROS = [
  { id: 'PENDIENTE', nombre: 'Por revisar' },
  { id: 'APROBADA', nombre: 'Publicadas' },
  { id: 'OCULTA', nombre: 'Ocultas' },
  { id: 'TODAS', nombre: 'Todas' },
]

// Moderación: una reseña nueva queda PENDIENTE y solo se publica cuando el administrador la aprueba.
// Si el texto trae un teléfono o un correo, el backend lo marca en "alerta".
export default function AdminResenas({ pendientes, avisar, onCambio }) {
  const [filtro, setFiltro] = useState('PENDIENTE')
  const resenas = useCarga(() => listarResenasAdmin(filtro === 'TODAS' ? null : filtro), [filtro])
  const [moderando, setModerando] = useState(null)

  async function moderar(resena, estado) {
    setModerando(resena.id)
    try {
      await moderarResena(resena.id, estado)
      avisar({ tipo: 'ok', texto: `Reseña de ${resena.autor} ${estado === 'APROBADA' ? 'publicada' : 'oculta'}.` })
      resenas.recargar()
      onCambio()
    } catch (e) {
      avisar({ tipo: 'error', texto: e.message })
    } finally {
      setModerando(null)
    }
  }

  return (
    <div className="d-flex flex-column gap-3">
      <p className="m-0 texto-secundario" aria-live="polite">
        {pendientes === 0 ? 'No hay reseñas esperando revisión.' : `${plural(pendientes, 'reseña espera', 'reseñas esperan')} revisión.`}
      </p>
      <div className="d-flex flex-wrap gap-2" role="group" aria-label="Filtrar reseñas">
        {FILTROS.map((f) => (
          <button key={f.id} type="button" className="chip" aria-pressed={filtro === f.id} onClick={() => setFiltro(f.id)}>
            {f.nombre}
          </button>
        ))}
      </div>
      {resenas.error && <MensajeError error={resenas.error} alReintentar={resenas.recargar} />}
      {resenas.cargando && <Cargando texto="Cargando reseñas…" />}
      {!resenas.cargando && resenas.datos?.length === 0 && <p className="m-0 texto-secundario">No hay reseñas con este filtro.</p>}
      {!resenas.cargando && resenas.datos?.length > 0 && (
        <ul className="list-unstyled m-0 d-flex flex-column gap-3">
          {resenas.datos.map((r) => (
            <li key={r.id} className="tarjeta p-4 d-flex flex-column gap-2">
              <div className="d-flex flex-wrap align-items-start justify-content-between gap-2">
                <div>
                  <Link to={`/producto/${r.productoId}`} className="fw-semibold">
                    {r.producto}
                  </Link>
                  <p className="m-0 small texto-secundario d-flex flex-wrap align-items-center gap-2">
                    <Estrellas valor={r.puntuacion} />
                    {r.autor} · {fecha(r.fecha)}
                  </p>
                </div>
                <InsigniaEstado estado={ESTADO_RESENA[r.estado]} />
              </div>
              <p className="m-0">{r.comentario}</p>
              {r.alerta && (
                <div className="aviso aviso-alerta small">
                  <Icono nombre="alerta" tamano={18} />
                  <p>{r.alerta}</p>
                </div>
              )}
              <div className="d-flex flex-wrap gap-2">
                {r.estado !== 'APROBADA' && (
                  <button type="button" className="btn btn-primary btn-sm" disabled={moderando === r.id} onClick={() => moderar(r, 'APROBADA')}>
                    <Icono nombre="check" tamano={16} />
                    Aprobar
                  </button>
                )}
                {r.estado !== 'OCULTA' && (
                  <button type="button" className="btn btn-outline-danger btn-sm" disabled={moderando === r.id} onClick={() => moderar(r, 'OCULTA')}>
                    <Icono nombre="ojo" tamano={16} />
                    Ocultar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
