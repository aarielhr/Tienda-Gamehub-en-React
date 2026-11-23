import Icono from './Icono.jsx'

// Filtros de marca, precio y disponibilidad. El estado vive en la vista Catalogo y llega por props.
export default function FiltroCatalogo({ marcas, filtros, errorRango, totalFiltros, onCambiar, onLimpiar }) {
  function alternarMarca(nombre) {
    const lista = filtros.marcas.includes(nombre)
      ? filtros.marcas.filter((m) => m !== nombre)
      : [...filtros.marcas, nombre]
    onCambiar('marcas', lista)
  }

  return (
    <aside className="tarjeta p-3 p-lg-4 d-flex flex-column gap-4" aria-labelledby="titulo-filtros">
      <div className="d-flex align-items-center justify-content-between gap-2">
        <h2 id="titulo-filtros" className="h5 m-0 d-flex align-items-center gap-2">
          <Icono nombre="filtro" />
          Filtros
          {totalFiltros > 0 && <span className="contador">{totalFiltros}</span>}
        </h2>
        <button type="button" className="btn btn-link" onClick={onLimpiar}>
          Limpiar
        </button>
      </div>

      <fieldset>
        <legend className="form-label mb-2">Marca</legend>
        {marcas.map((marca) => (
          <div key={marca.nombre} className="form-check d-flex align-items-center gap-2 mb-2">
            <input
              className="form-check-input mt-0"
              type="checkbox"
              id={`marca-${marca.nombre}`}
              checked={filtros.marcas.includes(marca.nombre)}
              onChange={() => alternarMarca(marca.nombre)}
            />
            <label className="form-check-label flex-grow-1" htmlFor={`marca-${marca.nombre}`}>
              {marca.nombre}
            </label>
            <span className="texto-mono small texto-secundario">{marca.cantidad}</span>
          </div>
        ))}
      </fieldset>

      <fieldset className="border-top pt-3">
        <legend className="form-label mb-2">Precio (CLP)</legend>
        <div className="row g-2">
          <div className="col-6">
            <label htmlFor="precio-min" className="small texto-secundario mb-1">
              Mínimo
            </label>
            <input
              id="precio-min"
              type="number"
              inputMode="numeric"
              min="0"
              step="10000"
              placeholder="0"
              className={`form-control ${errorRango ? 'is-invalid' : ''}`}
              value={filtros.min}
              onChange={(e) => onCambiar('min', e.target.value)}
              aria-invalid={errorRango ? 'true' : undefined}
              aria-describedby="precio-mensaje"
            />
          </div>
          <div className="col-6">
            <label htmlFor="precio-max" className="small texto-secundario mb-1">
              Máximo
            </label>
            <input
              id="precio-max"
              type="number"
              inputMode="numeric"
              min="0"
              step="10000"
              placeholder="Sin tope"
              className={`form-control ${errorRango ? 'is-invalid' : ''}`}
              value={filtros.max}
              onChange={(e) => onCambiar('max', e.target.value)}
              aria-invalid={errorRango ? 'true' : undefined}
              aria-describedby="precio-mensaje"
            />
          </div>
        </div>
        {errorRango ? (
          <p id="precio-mensaje" className="mensaje mensaje-error" role="alert">
            <Icono nombre="alerta" tamano={15} grosor={2.2} />
            {errorRango} Mientras tanto no se filtra por precio.
          </p>
        ) : (
          <p id="precio-mensaje" className="mensaje mensaje-ayuda">
            En pesos, sin puntos.
          </p>
        )}
      </fieldset>

      <fieldset className="border-top pt-3">
        <legend className="form-label mb-2">Disponibilidad</legend>
        <div className="form-check d-flex align-items-center gap-2 mb-2">
          <input
            className="form-check-input mt-0"
            type="checkbox"
            id="solo-stock"
            checked={filtros.soloStock}
            onChange={(e) => onCambiar('soloStock', e.target.checked)}
          />
          <label className="form-check-label" htmlFor="solo-stock">
            Solo con stock
          </label>
        </div>
        <div className="form-check d-flex align-items-center gap-2">
          <input
            className="form-check-input mt-0"
            type="checkbox"
            id="solo-oferta"
            checked={filtros.soloOferta}
            onChange={(e) => onCambiar('soloOferta', e.target.checked)}
          />
          <label className="form-check-label" htmlFor="solo-oferta">
            Solo ofertas
          </label>
        </div>
      </fieldset>
    </aside>
  )
}
