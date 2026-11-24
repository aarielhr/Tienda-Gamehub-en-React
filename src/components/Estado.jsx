import Icono from './Icono.jsx'

// Los tres estados de una vista que carga datos: cargando, error y vacío

export function Cargando({ texto = 'Cargando…' }) {
  return (
    <div className="d-flex align-items-center justify-content-center gap-3 py-5 texto-secundario" role="status">
      <span className="spinner-border spinner-border-sm" aria-hidden="true" />
      {texto}
    </div>
  )
}

export function MensajeError({ error, alReintentar }) {
  if (!error) return null
  return (
    <div className="aviso aviso-error" role="alert">
      <Icono nombre="alerta" tamano={20} grosor={2.2} />
      <div className="d-flex flex-column gap-2">
        <p className="fw-semibold">{error.message ?? String(error)}</p>
        {alReintentar && (
          <div>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={alReintentar}>
              <Icono nombre="recargar" tamano={16} />
              Reintentar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function Vacio({ icono = 'buscar', titulo, texto, children }) {
  return (
    <div className="estado-vacio" role="status">
      <span className="icono-circulo" aria-hidden="true">
        <Icono nombre={icono} tamano={28} />
      </span>
      <h2 className="h4 m-0">{titulo}</h2>
      {texto && (
        <p className="m-0 texto-secundario" style={{ maxWidth: 460 }}>
          {texto}
        </p>
      )}
      {children}
    </div>
  )
}
