import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Cargando, MensajeError, Vacio } from '../components/Estado.jsx'
import Estrellas from '../components/Estrellas.jsx'
import Icono from '../components/Icono.jsx'
import ImagenProducto from '../components/ImagenProducto.jsx'
import IndicadorStock from '../components/IndicadorStock.jsx'
import Insignia from '../components/Insignia.jsx'
import ListaProductos from '../components/ListaProductos.jsx'
import ListaResenas from '../components/ListaResenas.jsx'
import Migas from '../components/Migas.jsx'
import Notificacion from '../components/Notificacion.jsx'
import Precio from '../components/Precio.jsx'
import SelectorCantidad from '../components/SelectorCantidad.jsx'
import { useCarrito } from '../context/useCarrito.js'
import { useCarga } from '../hooks/useCarga.js'
import { validarStock } from '../logica/carrito.js'
import { clp, fecha, plural, porcentajeDescuento } from '../logica/formato.js'
import { promedioTexto } from '../logica/resenas.js'
import { listarProductos, listarResenas, obtenerProducto } from '../services/catalogo.js'

// Cuatro vistas de la misma ilustración, como si fueran fotos desde distintos ángulos
const VISTAS = [
  { nombre: 'vista frontal', transform: 'none' },
  { nombre: 'vista lateral', transform: 'scaleX(-1)' },
  { nombre: 'conectores', transform: 'rotate(-8deg) scale(0.92)' },
  { nombre: 'detalle', transform: 'scale(1.3)' },
]

function Detalle({ id }) {
  const { agregar } = useCarrito()
  const producto = useCarga(() => obtenerProducto(id), [id])
  const resenas = useCarga(() => listarResenas(id), [id])
  const relacionados = useCarga(
    () => (producto.datos ? listarProductos(producto.datos.categoriaSlug) : Promise.resolve([])),
    [producto.datos?.categoriaSlug],
  )
  const [vista, setVista] = useState(0)
  const [cantidad, setCantidad] = useState(1)
  const [mensaje, setMensaje] = useState(null)
  const [aviso, setAviso] = useState(null)
  const cerrarAviso = useCallback(() => setAviso(null), [])

  if (producto.cargando) return <Cargando texto="Cargando el producto…" />
  if (producto.error) {
    return (
      <div className="contenedor py-5">
        {producto.error.estado === 404 ? (
          <Vacio titulo="Este producto no está disponible" texto={producto.error.message}>
            <Link to="/catalogo" className="btn btn-outline-secondary">
              Volver al catálogo
            </Link>
          </Vacio>
        ) : (
          <MensajeError error={producto.error} alReintentar={producto.recargar} />
        )}
      </div>
    )
  }

  const p = producto.datos
  const agotado = p.stock <= 0
  const descuento = porcentajeDescuento(p.precio, p.precioNormal)
  const otros = (relacionados.datos ?? []).filter((r) => r.id !== p.id).slice(0, 4)

  // Cada cambio de cantidad se valida contra el stock disponible
  function cambiarCantidad(n) {
    const control = validarStock(n, p.stock)
    if (!control.valido) {
      setMensaje({ tipo: 'error', texto: control.mensaje })
      return
    }
    setCantidad(n)
    setMensaje(n === p.stock ? { tipo: 'aviso', texto: `Alcanzaste el stock disponible: ${p.stock} unidades.` } : null)
  }

  function alAgregar() {
    const resultado = agregar(p, cantidad)
    if (resultado.valido) {
      setAviso({ tipo: 'ok', texto: `Agregaste ${plural(cantidad, 'unidad', 'unidades')} al carrito.`, enlace: { a: '/carrito', texto: 'Ir al carrito' } })
      setMensaje(null)
    } else {
      setMensaje({ tipo: 'error', texto: `${resultado.mensaje} Revisa lo que ya tienes en el carrito.` })
    }
  }

  return (
    <>
      <div className="contenedor pt-4">
        <Migas
          pasos={[
            { texto: 'Inicio', a: '/' },
            { texto: p.categoria, a: `/catalogo?categoria=${p.categoriaSlug}` },
            { texto: p.nombre },
          ]}
        />
      </div>

      <section aria-labelledby="producto-titulo" className="contenedor py-4">
        <div className="row g-5">
          <div className="col-lg-6 d-flex flex-column gap-3">
            <div className="galeria-principal">
              <div className="vista" style={{ transform: VISTAS[vista].transform }}>
                <ImagenProducto imagen={p.imagen} alt={`${p.nombre}, ${VISTAS[vista].nombre}`} />
              </div>
              {descuento > 0 && (
                <Insignia tono="ok" icono="etiqueta" className="position-absolute top-0 start-0 m-3">
                  −{descuento} % · Oferta vigente
                </Insignia>
              )}
              <span className="position-absolute bottom-0 end-0 m-3 texto-mono small texto-secundario">
                {vista + 1} / {VISTAS.length} · {VISTAS[vista].nombre}
              </span>
            </div>
            <div className="row g-2 row-cols-4" role="group" aria-label="Imágenes del producto">
              {VISTAS.map((v, i) => (
                <div key={v.nombre} className="col">
                  <button
                    type="button"
                    className="miniatura w-100"
                    aria-pressed={vista === i}
                    aria-label={`Ver imagen ${i + 1} de ${VISTAS.length}: ${v.nombre}`}
                    onClick={() => setVista(i)}
                  >
                    <span className="d-block" style={{ transform: v.transform }}>
                      <ImagenProducto imagen={p.imagen} alt="" />
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="col-lg-6 d-flex flex-column gap-4">
            <div className="d-flex flex-column gap-2">
              <p className="meta">
                {p.marca} · SKU {p.sku}
              </p>
              <h1 id="producto-titulo" className="m-0" style={{ fontSize: 36 }}>
                {p.nombre}
              </h1>
              <a href="#resenas" className="d-inline-flex align-items-center gap-2 text-body text-decoration-none">
                <Estrellas valor={p.puntuacion} tamano={16} />
                <span className="fw-semibold">{p.cantidadResenas ? promedioTexto(p.puntuacion) : 'Sin reseñas'}</span>
                {p.cantidadResenas > 0 && <span className="text-decoration-underline text-primary">{plural(p.cantidadResenas, 'reseña', 'reseñas')}</span>}
              </a>
            </div>

            <div className="tarjeta p-4 d-flex flex-column gap-3">
              <div className="d-flex flex-wrap align-items-center gap-3">
                <Precio precio={p.precio} precioNormal={p.precioNormal} tamano={40} />
                {descuento > 0 && (
                  <Insignia tono="ok" icono="etiqueta">
                    Ahorras {clp(p.precioNormal - p.precio)}
                  </Insignia>
                )}
              </div>
              <p className="m-0 small texto-secundario">
                {descuento > 0
                  ? `Precio con descuento vigente hasta el ${fecha(p.ofertaHasta)}. Precio normal: ${clp(p.precioNormal)}. IVA incluido.`
                  : 'Precio final con IVA incluido.'}
              </p>
              <div className="p-3 rounded-3" style={{ background: 'var(--color-fondo)', border: '1px solid var(--color-borde)' }}>
                <IndicadorStock stock={p.stock} />
              </div>
              {!agotado && (
                <div className="d-flex flex-wrap align-items-end gap-3">
                  <div className="d-flex flex-column gap-1">
                    <label htmlFor="cantidad" className="form-label m-0">
                      Cantidad
                    </label>
                    <SelectorCantidad
                      id="cantidad"
                      valor={cantidad}
                      max={p.stock}
                      onCambiar={cambiarCantidad}
                      invalido={mensaje?.tipo === 'error'}
                      describedBy="cantidad-mensaje"
                      nombre={p.nombre}
                    />
                  </div>
                  <button type="button" className="btn btn-primary btn-lg flex-grow-1" onClick={alAgregar} disabled={mensaje?.tipo === 'error'}>
                    <Icono nombre="carrito" />
                    Agregar al carrito · {clp(p.precio * cantidad)}
                  </button>
                </div>
              )}
              {agotado ? (
                <button type="button" className="btn btn-primary btn-lg" disabled>
                  Sin stock · no disponible
                </button>
              ) : (
                <p id="cantidad-mensaje" className={`mensaje mensaje-${mensaje?.tipo ?? 'ayuda'} m-0`} aria-live="polite">
                  {mensaje && <Icono nombre="alerta" tamano={15} grosor={2.2} />}
                  {mensaje?.texto ?? `Puedes llevar hasta ${p.stock} unidades, según el stock disponible.`}
                </p>
              )}
            </div>

            <ul className="list-unstyled m-0 d-flex flex-column gap-3 small texto-secundario">
              <li className="d-flex gap-3 align-items-start">
                <Icono nombre="camion" tamano={20} className="text-body" />
                <span>
                  <strong className="text-body">Despacho a domicilio.</strong> Llega en 2 a 4 días hábiles y lo sigues desde Mis órdenes.
                </span>
              </li>
              <li className="d-flex gap-3 align-items-start">
                <Icono nombre="escudo" tamano={20} className="text-body" />
                <span>
                  <strong className="text-body">Garantía de 6 meses.</strong> Se solicita en línea desde la orden, dentro del plazo.
                </span>
              </li>
              <li className="d-flex gap-3 align-items-start">
                <Icono nombre="tarjeta" tamano={20} className="text-body" />
                <span>
                  <strong className="text-body">Pago simulado.</strong> Débito, crédito o transferencia; no se cobra dinero real.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <div className="contenedor pb-5">
        <div className="row g-4">
          <section className="col-lg-5" aria-labelledby="specs-titulo">
            <div className="tarjeta p-4 h-100">
              <h2 id="specs-titulo" className="h4">
                Especificaciones técnicas
              </h2>
              {p.descripcion && <p className="texto-secundario">{p.descripcion}</p>}
              <dl className="m-0">
                {(p.especificaciones ?? []).map((e) => (
                  <div key={e.clave} className="row g-2 py-2 border-top">
                    <dt className="col-5 fw-normal texto-secundario">{e.clave}</dt>
                    <dd className="col-7 m-0 texto-mono small">{e.valor}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
          <section id="resenas" className="col-lg-7" aria-labelledby="resenas-titulo">
            <div className="tarjeta p-4 h-100">
              <h2 id="resenas-titulo" className="h4 mb-3">
                Reseñas
              </h2>
              {resenas.cargando && <Cargando texto="Cargando reseñas…" />}
              {resenas.error && <MensajeError error={resenas.error} alReintentar={resenas.recargar} />}
              {resenas.datos && <ListaResenas resenas={resenas.datos} />}
            </div>
          </section>
        </div>
      </div>

      {otros.length > 0 && (
        <section className="contenedor pb-5" aria-labelledby="relacionados-titulo">
          <h2 id="relacionados-titulo" className="mb-4" style={{ fontSize: 28 }}>
            Más de {p.categoria}
          </h2>
          <ListaProductos
            productos={otros}
            columnas={4}
            onAgregar={(otro) => {
              const r = agregar(otro, 1)
              setAviso(r.valido ? { tipo: 'ok', texto: `${otro.nombre} quedó en tu carrito.`, enlace: { a: '/carrito', texto: 'Ver carrito' } } : { tipo: 'error', texto: r.mensaje })
            }}
          />
        </section>
      )}
      <Notificacion aviso={aviso} alCerrar={cerrarAviso} />
    </>
  )
}

// key={id}: al pasar de un producto a otro (por ejemplo, desde "Relacionados") React monta un Detalle
// nuevo, así la galería, la cantidad y los mensajes parten de cero sin un efecto que los reinicie
export default function DetalleProducto() {
  const { id } = useParams()
  return <Detalle key={id} id={id} />
}
