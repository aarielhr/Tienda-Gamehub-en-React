import { useCallback, useState } from 'react'
import Icono from '../components/Icono.jsx'
import Notificacion from '../components/Notificacion.jsx'
import AjusteStock from '../components/operador/AjusteStock.jsx'
import BandejaOrdenes from '../components/operador/BandejaOrdenes.jsx'
import FormularioDespacho from '../components/operador/FormularioDespacho.jsx'
import ListaGarantias from '../components/operador/ListaGarantias.jsx'
import { useAuth } from '../context/useAuth.js'
import { useCarga } from '../hooks/useCarga.js'
import { ESTADO_DESPACHO, ESTADO_GARANTIA } from '../logica/estados.js'
import { aFechaISO, fecha } from '../logica/formato.js'
import { anularPago, confirmarPago, listarGarantias, listarOrdenesOperador, obtenerResumen } from '../services/operador.js'

const CIFRAS = [
  { clave: 'pagosPorConfirmar', texto: 'Pagos por confirmar', icono: 'reloj', fondo: 'var(--color-tinte-aviso)', color: 'var(--color-aviso)' },
  { clave: 'despachosPorGenerar', texto: 'Despachos por generar', icono: 'caja', fondo: 'var(--color-tinte-primario)', color: 'var(--color-primario-hover)' },
  { clave: 'enCurso', texto: 'En preparación o tránsito', icono: 'camion', fondo: 'var(--color-tinte-acento)', color: 'var(--color-acento)' },
  { clave: 'garantiasAbiertas', texto: 'Garantías sin cerrar', icono: 'escudo', fondo: 'var(--color-tinte-error)', color: 'var(--color-error)' },
]

function irA(id) {
  // Espera al siguiente cuadro para que la sección ya esté en pantalla
  requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

// Panel del operador: pagos, despachos, stock y garantías. Solo OPERADOR y ADMIN llegan aquí
// (RutaProtegida), y además el backend valida el rol en cada llamada a /api/operador.
export default function PanelOperador() {
  const { usuario } = useAuth()
  const resumen = useCarga(() => obtenerResumen(), [])
  const ordenes = useCarga(() => listarOrdenesOperador(), [])
  const garantias = useCarga(() => listarGarantias(), [])
  const [despachando, setDespachando] = useState(null)
  const [ocupado, setOcupado] = useState(false)
  const [versionStock, setVersionStock] = useState(0)
  const [aviso, setAviso] = useState(null)
  const cerrarAviso = useCallback(() => setAviso(null), [])
  // La fecha del turno se fija al abrir el panel (leer la hora en cada render no es puro)
  const [hoy] = useState(() => new Date())

  const cifras = resumen.datos ?? {}
  const dia = new Intl.DateTimeFormat('es-CL', { weekday: 'long' }).format(hoy)

  function refrescar() {
    resumen.recargar()
    ordenes.recargar()
  }

  async function accionPago(accion, orden, texto) {
    setOcupado(true)
    try {
      await accion(orden.id)
      setAviso({ tipo: 'ok', texto: `${orden.numero}: ${texto}` })
      refrescar()
      // Confirmar un pago descuenta stock: la sección de stock vuelve a cargar
      setVersionStock((v) => v + 1)
    } catch (e) {
      setAviso({ tipo: 'error', texto: e.message })
    } finally {
      setOcupado(false)
    }
  }

  function abrirDespacho(id) {
    setDespachando(id)
    irA('despachos')
  }

  function despachoListo(orden, generado) {
    setDespachando(null)
    setAviso({
      tipo: 'ok',
      texto: generado
        ? `${orden.numero}: despacho generado con seguimiento ${orden.seguimiento}.`
        : `${orden.numero}: el despacho quedó ${ESTADO_DESPACHO[orden.estadoDespacho].texto.toLowerCase()}.`,
    })
    refrescar()
    irA('ordenes')
  }

  function garantiaResuelta(garantia) {
    setAviso({ tipo: 'ok', texto: `${garantia.codigo} quedó ${ESTADO_GARANTIA[garantia.estado].texto.toLowerCase()}.` })
    garantias.recargar()
    resumen.recargar()
  }

  return (
    <div className="contenedor py-4">
      <div className="row g-4">
        <aside className="col-lg-3">
          <div className="panel-lateral d-flex flex-column gap-3">
            <nav className="menu-panel tarjeta p-2" aria-label="Secciones del panel del operador">
              <p className="eyebrow px-2 pt-2 mb-1">Operación</p>
              <a href="#ordenes">
                <Icono nombre="caja" />
                Órdenes y pagos
                {cifras.pagosPorConfirmar > 0 && <span className="contador ms-auto">{cifras.pagosPorConfirmar}</span>}
              </a>
              <a href="#despachos">
                <Icono nombre="camion" />
                Despachos
              </a>
              <a href="#stock">
                <Icono nombre="capas" />
                Stock
              </a>
              <a href="#garantias">
                <Icono nombre="escudo" />
                Garantías
                {cifras.garantiasAbiertas > 0 && <span className="contador ms-auto">{cifras.garantiasAbiertas}</span>}
              </a>
            </nav>
            <p className="small texto-secundario m-0 d-flex gap-2">
              <Icono nombre="candado" tamano={16} />
              Ruta exclusiva de Operador y Administrador. El backend valida el rol en cada llamada.
            </p>
          </div>
        </aside>

        <div className="col-lg-9 d-flex flex-column gap-5">
          <header className="d-flex flex-column gap-1">
            <p className="eyebrow">
              Turno de {usuario.nombre} · {dia} {fecha(aFechaISO(hoy))}
            </p>
            <h1 className="m-0" style={{ fontSize: 40 }}>
              Panel del operador
            </h1>
            <p className="m-0 texto-secundario">Los datos vienen de los servicios de órdenes, pagos, inventario y despachos del backend.</p>
          </header>

          <section aria-label="Resumen del día">
            <ul className="list-unstyled m-0 row g-3">
              {CIFRAS.map((c) => (
                <li key={c.clave} className="col-sm-6 col-xl-3">
                  <div className="tile-cifra h-100">
                    <span className="icono-tile" style={{ background: c.fondo, color: c.color }} aria-hidden="true">
                      <Icono nombre={c.icono} tamano={22} />
                    </span>
                    <span className="d-flex flex-column gap-1">
                      <span className="cifra">{resumen.cargando && !resumen.datos ? '…' : (cifras[c.clave] ?? 0)}</span>
                      <span className="small texto-secundario">{c.texto}</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section id="ordenes" aria-labelledby="titulo-ordenes" className="d-flex flex-column gap-3 seccion-panel">
            <h2 id="titulo-ordenes" className="h3 m-0">
              Bandeja de órdenes
            </h2>
            <BandejaOrdenes
              ordenes={ordenes}
              ocupado={ocupado}
              onConfirmarPago={(o) => accionPago(confirmarPago, o, 'pago confirmado y stock descontado.')}
              onAnularPago={(o) => accionPago(anularPago, o, 'pago anulado.')}
              onDespachar={abrirDespacho}
            />
          </section>

          <section id="despachos" aria-labelledby="titulo-despachos" className="d-flex flex-column gap-3 seccion-panel">
            <h2 id="titulo-despachos" className="h3 m-0">
              Despachos
            </h2>
            <div className="tarjeta p-4">
              {despachando ? (
                <FormularioDespacho key={despachando} ordenId={despachando} onListo={despachoListo} onCerrar={() => setDespachando(null)} />
              ) : (
                <p className="m-0 texto-secundario d-flex align-items-center gap-2">
                  <Icono nombre="info" tamano={18} />
                  Elige «Generar despacho» o «Actualizar despacho» en la bandeja para trabajar una orden pagada.
                </p>
              )}
            </div>
          </section>

          <section id="stock" aria-labelledby="titulo-stock" className="d-flex flex-column gap-3 seccion-panel">
            <h2 id="titulo-stock" className="h3 m-0">
              Stock
            </h2>
            <AjusteStock version={versionStock} onRegistrado={(texto) => setAviso({ tipo: 'ok', texto: `Movimiento registrado: ${texto}` })} />
          </section>

          <section id="garantias" aria-labelledby="titulo-garantias" className="d-flex flex-column gap-3 seccion-panel">
            <h2 id="titulo-garantias" className="h3 m-0">
              Solicitudes de garantía
            </h2>
            <ListaGarantias garantias={garantias} onResuelta={garantiaResuelta} />
          </section>
        </div>
      </div>
      <Notificacion aviso={aviso} alCerrar={cerrarAviso} />
    </div>
  )
}
