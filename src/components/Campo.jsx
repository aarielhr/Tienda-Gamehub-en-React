import Icono from './Icono.jsx'

// Campo de formulario con label asociado (htmlFor) y un mensaje debajo enlazado con aria-describedby.
// El error reemplaza a la ayuda y se muestra con icono y texto propio.
export default function Campo({
  id,
  etiqueta,
  error,
  ayuda,
  opcional = false,
  requerido = false,
  tipo = 'text',
  como = 'input',
  opciones,
  valor,
  alCambiar,
  className = '',
  children,
  ...resto
}) {
  const idMensaje = `${id}-mensaje`
  const props = {
    id,
    name: id,
    value: valor,
    onChange: (e) => alCambiar?.(e.target.value),
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': error || ayuda ? idMensaje : undefined,
    ...resto,
  }
  let control
  if (como === 'select') {
    control = (
      <select className={`form-select ${error ? 'is-invalid' : ''}`} {...props}>
        {opciones?.map((op) => (
          <option key={op.valor} value={op.valor}>
            {op.texto}
          </option>
        ))}
      </select>
    )
  } else if (como === 'textarea') {
    control = <textarea className={`form-control ${error ? 'is-invalid' : ''}`} rows={3} {...props} />
  } else {
    control = <input type={tipo} className={`form-control ${error ? 'is-invalid' : ''}`} {...props} />
  }

  return (
    <div className={className}>
      <label htmlFor={id} className="form-label">
        {etiqueta}
        {requerido && (
          <span className="text-danger ms-1" aria-hidden="true">
            *
          </span>
        )}
        {opcional && <span className="texto-secundario fw-normal ms-1">(opcional)</span>}
      </label>
      {children ?? control}
      {error ? (
        <p id={idMensaje} className="mensaje mensaje-error">
          <Icono nombre="alerta" tamano={15} grosor={2.2} />
          {error}
        </p>
      ) : ayuda ? (
        <p id={idMensaje} className="mensaje mensaje-ayuda">
          {ayuda}
        </p>
      ) : null}
    </div>
  )
}
