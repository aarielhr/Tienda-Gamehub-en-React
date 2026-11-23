import { useState } from 'react'
import { useCarga } from '../../hooks/useCarga.js'
import { fechaCorta, plural } from '../../logica/formato.js'
import { validarMovimiento } from '../../logica/validaciones.js'
import { listarMovimientos, listarStock, registrarMovimiento } from '../../services/operador.js'
import Campo from '../Campo.jsx'
import { Cargando, MensajeError } from '../Estado.jsx'
import Icono from '../Icono.jsx'

const TIPOS = [
  { id: 'INGRESO', nombre: 'Ingreso', ayuda: 'Unidades que entran a bodega.' },
  { id: 'SALIDA', nombre: 'Salida', ayuda: 'Unidades que salen de bodega.' },
  { id: 'AJUSTE', nombre: 'Ajuste por conteo', ayuda: 'Escribe el stock contado: reemplaza al actual.' },
]

// Motivos que tienen sentido para cada tipo de movimiento
const MOTIVOS = {
  INGRESO: ['Recepción de proveedor', 'Devolución de cliente'],
  SALIDA: ['Venta en tienda', 'Merma o daño', 'Préstamo para demostración'],
  AJUSTE: ['Conteo de inventario'],
}

const NOMBRE_TIPO = { INGRESO: 'Ingreso', SALIDA: 'Salida', AJUSTE: 'Ajuste' }

// Ingresos, salidas y ajustes por conteo. validarMovimiento avisa antes de enviar si el stock quedaría negativo;
// el backend aplica la misma regla y responde 400 si alguien se salta la interfaz.
// "version" sube cuando otra sección cambia el stock (por ejemplo, al confirmar un pago) y obliga a recargar.
export default function AjusteStock({ version = 0, onRegistrado }) {
  const stock = useCarga(() => listarStock(), [version])
  const movimientos = useCarga(() => listarMovimientos(), [version])
  const [datos, setDatos] = useState({ productoId: '', tipo: 'INGRESO', cantidad: '', motivo: MOTIVOS.INGRESO[0] })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  const productos = stock.datos ?? []
  const productoId = datos.productoId || String(productos[0]?.id ?? '')
  const producto = productos.find((p) => String(p.id) === productoId)
  const errorCantidad = producto && datos.cantidad !== '' ? validarMovimiento(datos.tipo, datos.cantidad, producto.stock) : ''
  const listo = producto && datos.cantidad !== '' && !errorCantidad
  const bajos = productos.filter((p) => p.activo && p.stock <= 3)
  const cambiar = (campo) => (valor) => setDatos((d) => ({ ...d, [campo]: valor }))

  async function enviar(e) {
    e.preventDefault()
    if (!listo || enviando) return
    setEnviando(true)
    setError(null)
    try {
      const movimiento = await registrarMovimiento({
        productoId: producto.id,
        tipo: datos.tipo,
        cantidad: Number(datos.cantidad),
        motivo: datos.motivo,
      })
      setDatos((d) => ({ ...d, cantidad: '' }))
      stock.recargar()
      movimientos.recargar()
      onRegistrado(`${movimiento.producto} queda con ${plural(movimiento.stockResultante, 'unidad', 'unidades')}.`)
    } catch (err) {
      setError(err)
    } finally {
      setEnviando(false)
    }
  }

  if (stock.cargando && !stock.datos) return <Cargando texto="Cargando el stock…" />
  if (stock.error) return <MensajeError error={stock.error} alReintentar={stock.recargar} />

  return (
    <div className="row g-4">
      <div className="col-xl-5">
        <form onSubmit={enviar} noValidate className="tarjeta p-4 d-flex flex-column gap-3" aria-labelledby="titulo-ajuste">
          <h3 id="titulo-ajuste" className="h5 m-0">
            Ajuste de stock
          </h3>
          {bajos.length > 0 && (
            <div>
              <p className="small texto-secundario mb-2">Stock bajo (3 o menos):</p>
              <div className="d-flex flex-wrap gap-2">
                {bajos.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="chip"
                    aria-pressed={String(p.id) === productoId}
                    onClick={() => cambiar('productoId')(String(p.id))}
                  >
                    {p.sku}
                    <span className="cuenta">{p.stock}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <MensajeError error={error} />
          <Campo
            id="stock-producto"
            como="select"
            etiqueta="Producto"
            requerido
            opciones={productos.map((p) => ({ valor: String(p.id), texto: `${p.nombre}${p.activo ? '' : ' (inactivo)'}` }))}
            valor={productoId}
            alCambiar={cambiar('productoId')}
            ayuda={producto ? `Stock actual: ${plural(producto.stock, 'unidad', 'unidades')}` : undefined}
          />
          <fieldset>
            <legend className="form-label">Tipo de movimiento</legend>
            <div className="d-flex flex-wrap gap-2">
              {TIPOS.map((t) => (
                <span key={t.id}>
                  <input
                    type="radio"
                    className="btn-check"
                    name="stock-tipo"
                    id={`stock-tipo-${t.id}`}
                    value={t.id}
                    checked={datos.tipo === t.id}
                    onChange={() => setDatos((d) => ({ ...d, tipo: t.id, motivo: MOTIVOS[t.id][0] }))}
                  />
                  <label className="btn btn-outline-secondary btn-sm" htmlFor={`stock-tipo-${t.id}`}>
                    {t.nombre}
                  </label>
                </span>
              ))}
            </div>
            <p className="mensaje mensaje-ayuda">{TIPOS.find((t) => t.id === datos.tipo).ayuda}</p>
          </fieldset>
          <div className="row g-3">
            <Campo
              className="col-sm-5"
              id="stock-cantidad"
              tipo="number"
              etiqueta={datos.tipo === 'AJUSTE' ? 'Stock contado' : 'Cantidad'}
              requerido
              min={0}
              step={1}
              inputMode="numeric"
              valor={datos.cantidad}
              alCambiar={cambiar('cantidad')}
              error={errorCantidad}
            />
            <Campo
              className="col-sm-7"
              id="stock-motivo"
              como="select"
              etiqueta="Motivo del movimiento"
              requerido
              opciones={MOTIVOS[datos.tipo].map((m) => ({ valor: m, texto: m }))}
              valor={datos.motivo}
              alCambiar={cambiar('motivo')}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={!listo || enviando}>
            <Icono nombre="capas" />
            {enviando ? 'Registrando…' : 'Registrar movimiento'}
          </button>
          {errorCantidad && <p className="mensaje mensaje-aviso m-0">Corrige la cantidad para registrar.</p>}
        </form>
      </div>

      <div className="col-xl-7">
        <div className="d-flex flex-column gap-3">
          <h3 className="h5 m-0">Movimientos recientes</h3>
          {movimientos.error && <MensajeError error={movimientos.error} alReintentar={movimientos.recargar} />}
          {movimientos.datos && (
            <div className="tabla-contenedor">
              <table className="table align-middle mb-0">
                <caption className="visualmente-oculto">Últimos movimientos de stock</caption>
                <thead>
                  <tr>
                    <th scope="col">Fecha</th>
                    <th scope="col">Producto</th>
                    <th scope="col">Tipo</th>
                    <th scope="col" className="text-end">
                      Cant.
                    </th>
                    <th scope="col">Usuario</th>
                    <th scope="col" className="text-end">
                      Stock final
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.datos.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center texto-secundario py-4">
                        Todavía no hay movimientos.
                      </td>
                    </tr>
                  )}
                  {movimientos.datos.map((m) => (
                    <tr key={m.id}>
                      <td className="texto-mono small text-nowrap">{fechaCorta(m.fecha)}</td>
                      <td className="small">{m.producto}</td>
                      <td className="small">
                        {NOMBRE_TIPO[m.tipo]}
                        <span className="d-block texto-secundario">{m.motivo}</span>
                      </td>
                      <td className={`texto-mono text-end fw-semibold ${m.cantidad > 0 ? 'text-success' : 'text-danger'}`}>
                        {m.cantidad > 0 ? `+${m.cantidad}` : `−${Math.abs(m.cantidad)}`}
                      </td>
                      <td className="small">{m.usuario}</td>
                      <td className="texto-mono text-end">{m.stockResultante}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="small texto-secundario m-0">Cada movimiento queda registrado con usuario, motivo y stock resultante.</p>
        </div>
      </div>
    </div>
  )
}
