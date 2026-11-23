import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { MensajeError, Vacio } from '../components/Estado.jsx'
import Icono from '../components/Icono.jsx'
import LineaCarrito from '../components/LineaCarrito.jsx'
import Migas from '../components/Migas.jsx'
import ResumenCarrito from '../components/ResumenCarrito.jsx'
import { useAuth } from '../context/useAuth.js'
import { useCarrito } from '../context/useCarrito.js'
import { clp, plural } from '../logica/formato.js'
import { validarCarrito, validarCupon } from '../services/catalogo.js'

// Vista central del caso: concentra la selección antes de pagar
export default function Carrito() {
  const carrito = useCarrito()
  const { lineas, cupon, unidades, total, sincronizar } = carrito
  const { usuario, rol } = useAuth()
  const navegar = useNavigate()
  const [avisos, setAvisos] = useState({})
  const [mensajeCupon, setMensajeCupon] = useState(null)
  const [validandoCupon, setValidandoCupon] = useState(false)
  const [avanzando, setAvanzando] = useState(false)
  const [error, setError] = useState(null)
  const [confirmarVaciar, setConfirmarVaciar] = useState(false)

  // Al abrir el carrito se revisa contra el inventario: el stock o el precio pudieron cambiar
  useEffect(() => {
    if (!carrito.lineas.length) return
    validarCarrito(carrito.lineas, carrito.cupon)
      .then((validacion) => {
        sincronizar(validacion)
        setAvisos(Object.fromEntries(validacion.lineas.filter((l) => !l.disponible).map((l) => [l.productoId, l.mensaje])))
        if (validacion.mensajeCupon) setMensajeCupon({ tipo: 'error', texto: validacion.mensajeCupon })
      })
      .catch(() => {})
    // Solo al entrar a la vista
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function aplicarCupon(codigo) {
    if (!codigo) return
    setValidandoCupon(true)
    try {
      const nuevo = await validarCupon(codigo)
      carrito.guardarCupon(nuevo)
      setMensajeCupon({ tipo: 'ok', texto: `Cupón ${nuevo.codigo} aplicado: ${nuevo.porcentaje} % de descuento con tope de ${clp(nuevo.tope)}.` })
    } catch (e) {
      setMensajeCupon({ tipo: 'error', texto: e.message })
    } finally {
      setValidandoCupon(false)
    }
  }

  function quitarCupon() {
    carrito.quitarCupon()
    setMensajeCupon(null)
  }

  function cambiarCantidad(productoId, cantidad) {
    setAvisos((a) => ({ ...a, [productoId]: undefined }))
    return carrito.actualizarCantidad(productoId, cantidad)
  }

  // Antes de pasar al checkout se vuelve a validar stock y cupón contra el backend
  async function irAPagar() {
    setAvanzando(true)
    setError(null)
    try {
      const validacion = await validarCarrito(lineas, cupon)
      sincronizar(validacion)
      if (!validacion.valido) {
        setAvisos(Object.fromEntries(validacion.lineas.filter((l) => !l.disponible).map((l) => [l.productoId, l.mensaje])))
        setError(new Error('El stock cambió: ajusta las cantidades marcadas antes de pagar.'))
        return
      }
      navegar('/checkout')
    } catch (e) {
      setError(e)
    } finally {
      setAvanzando(false)
    }
  }

  if (!lineas.length) {
    return (
      <div className="contenedor py-4">
        <Migas pasos={[{ texto: 'Inicio', a: '/' }, { texto: 'Carrito' }]} />
        <h1 className="mt-2 mb-4" style={{ fontSize: 40 }}>
          Tu carrito
        </h1>
        <Vacio icono="carrito" titulo="Tu carrito está vacío" texto="Explora el catálogo y agrega productos. Guardamos tu carrito aunque cambies de página.">
          <Link to="/catalogo" className="btn btn-primary">
            Ir al catálogo
          </Link>
        </Vacio>
      </div>
    )
  }

  const accion =
    rol === 'CLIENTE' ? (
      <button type="button" className="btn btn-primary btn-lg w-100" onClick={irAPagar} disabled={avanzando}>
        {avanzando ? 'Revisando stock…' : 'Ir a pagar'}
        <Icono nombre="flecha" />
      </button>
    ) : !usuario ? (
      <div className="d-flex flex-column gap-2">
        <div className="aviso aviso-info small">
          <Icono nombre="candado" tamano={18} />
          <p>Puedes armar tu carrito sin cuenta. Para pagar necesitas iniciar sesión o registrarte.</p>
        </div>
        <Link to="/acceso" state={{ desde: '/checkout' }} className="btn btn-primary btn-lg w-100">
          Iniciar sesión para pagar
        </Link>
      </div>
    ) : (
      <div className="aviso aviso-info small">
        <Icono nombre="info" tamano={18} />
        <p>Las compras se hacen con una cuenta de cliente. Tu rol actual puede revisar el carrito, pero no pagar.</p>
      </div>
    )

  return (
    <div className="contenedor py-4">
      <Migas pasos={[{ texto: 'Inicio', a: '/' }, { texto: 'Carrito' }]} />
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mt-2 mb-4">
        <div>
          <h1 className="m-0" style={{ fontSize: 40 }}>
            Tu carrito
          </h1>
          <p className="m-0 texto-secundario" aria-live="polite">
            {plural(lineas.length, 'producto', 'productos')} · {plural(unidades, 'unidad', 'unidades')}
          </p>
        </div>
        <Link to="/catalogo" className="fw-semibold d-inline-flex align-items-center gap-1">
          <Icono nombre="volver" tamano={16} />
          Seguir comprando
        </Link>
      </div>

      {error && (
        <div className="mb-3">
          <MensajeError error={error} />
        </div>
      )}

      <div className="row g-4 align-items-start">
        <section className="col-lg-8" aria-labelledby="lineas-titulo">
          <div className="tarjeta">
            <h2 id="lineas-titulo" className="h5 m-0 p-3 p-md-4">
              Productos
            </h2>
            <ul className="list-unstyled m-0">
              {lineas.map((linea) => (
                <LineaCarrito key={linea.productoId} linea={linea} aviso={avisos[linea.productoId]} onCambiarCantidad={cambiarCantidad} onQuitar={carrito.quitar} />
              ))}
            </ul>
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 p-md-4 border-top">
              <p className="m-0 small texto-secundario d-flex align-items-center gap-2">
                <Icono nombre="info" tamano={16} />
                Tu carrito se guarda en este navegador aunque cambies de página.
              </p>
              {confirmarVaciar ? (
                <div className="d-flex align-items-center gap-2" role="group" aria-label="Confirmar vaciar carrito">
                  <span className="small">¿Vaciar el carrito?</span>
                  <button type="button" className="btn btn-outline-danger" onClick={carrito.vaciar}>
                    Sí, vaciar
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setConfirmarVaciar(false)}>
                    No
                  </button>
                </div>
              ) : (
                <button type="button" className="btn btn-outline-danger" onClick={() => setConfirmarVaciar(true)}>
                  <Icono nombre="basura" />
                  Vaciar carrito
                </button>
              )}
            </div>
          </div>
        </section>
        <aside className="col-lg-4">
          <ResumenCarrito
            lineas={lineas}
            cupon={cupon}
            mensajeCupon={mensajeCupon}
            cargandoCupon={validandoCupon}
            onAplicarCupon={aplicarCupon}
            onQuitarCupon={quitarCupon}
          >
            {accion}
          </ResumenCarrito>
        </aside>
      </div>

      {rol === 'CLIENTE' && (
        <div className="barra-total-movil mt-3">
          <span className="d-flex flex-column">
            <span className="small texto-secundario">Total</span>
            <span className="precio" style={{ fontSize: 22 }}>
              {clp(total)}
            </span>
          </span>
          <button type="button" className="btn btn-primary" onClick={irAPagar} disabled={avanzando}>
            Ir a pagar
            <Icono nombre="flecha" />
          </button>
        </div>
      )}
    </div>
  )
}
