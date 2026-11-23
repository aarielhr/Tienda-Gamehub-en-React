import { useCallback, useState } from 'react'
import { Link } from 'react-router'
import BotonCopiar from '../components/BotonCopiar.jsx'
import { Cargando, MensajeError } from '../components/Estado.jsx'
import Icono from '../components/Icono.jsx'
import Ilustracion from '../components/Ilustracion.jsx'
import ImagenProducto from '../components/ImagenProducto.jsx'
import IndicadorStock from '../components/IndicadorStock.jsx'
import Insignia from '../components/Insignia.jsx'
import ListaProductos from '../components/ListaProductos.jsx'
import Notificacion from '../components/Notificacion.jsx'
import Precio from '../components/Precio.jsx'
import { useCarrito } from '../context/useCarrito.js'
import { CUPON_BIENVENIDA, ILUSTRACION_CATEGORIA, VIDEO_DESTACADO } from '../data/contenido.js'
import { porcentajeDescuento } from '../logica/formato.js'
import { useCarga } from '../hooks/useCarga.js'
import { listarCategorias, listarProductos } from '../services/catalogo.js'

function Encabezado({ eyebrow, titulo, id, enlace }) {
  return (
    <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-4">
      <div className="d-flex flex-column gap-1">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className="m-0" style={{ fontSize: 32 }}>
          {titulo}
        </h2>
      </div>
      {enlace && (
        <Link to={enlace.a} className="fw-semibold d-inline-flex align-items-center gap-1">
          {enlace.texto}
          <Icono nombre="flecha" tamano={16} />
        </Link>
      )}
    </div>
  )
}

export default function Inicio() {
  const { agregar } = useCarrito()
  const productos = useCarga(() => listarProductos(), [])
  const categorias = useCarga(() => listarCategorias(), [])
  const [aviso, setAviso] = useState(null)
  const cerrarAviso = useCallback(() => setAviso(null), [])

  const lista = productos.datos ?? []
  const ofertas = lista.filter((p) => p.precioNormal > p.precio && p.stock > 0)
  const destacada = [...ofertas].sort((a, b) => b.cantidadResenas - a.cantidadResenas)[0]
  const destacados = [...lista]
    .filter((p) => p.stock > 0)
    .sort((a, b) => b.cantidadResenas - a.cantidadResenas || b.puntuacion - a.puntuacion)
    .slice(0, 4)

  function alAgregar(producto) {
    const resultado = agregar(producto, 1)
    setAviso(
      resultado.valido
        ? { tipo: 'ok', texto: `${producto.nombre} quedó en tu carrito.`, enlace: { a: '/carrito', texto: 'Ver carrito' } }
        : { tipo: 'error', texto: resultado.mensaje },
    )
  }

  return (
    <>
      <section aria-labelledby="hero-titulo" className="fondo-grilla border-bottom">
        <div className="contenedor py-5 d-flex flex-wrap align-items-center gap-5">
          <div className="d-flex flex-column align-items-start gap-4" style={{ flex: '1 1 440px', minWidth: 0 }}>
            <Insignia tono="info" icono="reloj" className="texto-mono">
              OFERTAS DE LA SEMANA
            </Insignia>
            <h1 id="hero-titulo" className="m-0" style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', lineHeight: 1.04 }}>
              Más FPS por cada peso.
            </h1>
            <p className="m-0 fs-5 texto-secundario" style={{ maxWidth: 540 }}>
              Notebooks, tarjetas gráficas y periféricos con el stock a la vista en cada producto. Pagas, despachamos y sigues tu
              pedido desde Mis órdenes.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <Link to="/catalogo" className="btn btn-primary btn-lg">
                Ver el catálogo
                <Icono nombre="flecha" />
              </Link>
              <a href="#destacados-titulo" className="btn btn-outline-secondary btn-lg">
                Lo más buscado
              </a>
            </div>
            <ul className="list-unstyled m-0 d-flex flex-wrap gap-4 small texto-secundario">
              <li className="d-flex align-items-center gap-2">
                <Icono nombre="check" className="text-success" />
                Stock visible antes de comprar
              </li>
              <li className="d-flex align-items-center gap-2">
                <Icono nombre="camion" />
                Seguimiento del despacho
              </li>
              <li className="d-flex align-items-center gap-2">
                <Icono nombre="escudo" />
                Garantía de 6 meses
              </li>
            </ul>
          </div>

          {destacada && (
            <article aria-labelledby="oferta-titulo" className="tarjeta p-4 d-flex flex-column gap-3" style={{ flex: '1 1 400px', minWidth: 0 }}>
              <div className="panel-imagen position-relative p-4">
                <div className="mx-auto" style={{ maxWidth: 360 }}>
                  <ImagenProducto imagen={destacada.imagen} alt={destacada.nombre} />
                </div>
                <Insignia tono="ok" icono="etiqueta" className="position-absolute top-0 start-0 m-3">
                  −{porcentajeDescuento(destacada.precio, destacada.precioNormal)} % · Oferta
                </Insignia>
              </div>
              <div className="d-flex flex-wrap align-items-end justify-content-between gap-3">
                <div className="d-flex flex-column gap-1">
                  <p className="meta">
                    {destacada.marca} · {destacada.categoria}
                  </p>
                  <h2 id="oferta-titulo" className="h4 m-0">
                    {destacada.nombre}
                  </h2>
                  <Precio precio={destacada.precio} precioNormal={destacada.precioNormal} tamano={32} />
                  <IndicadorStock stock={destacada.stock} />
                </div>
                <Link to={`/producto/${destacada.id}`} className="btn btn-outline-secondary">
                  Ver producto
                </Link>
              </div>
            </article>
          )}
        </div>
      </section>

      <section aria-labelledby="categorias-titulo" className="contenedor pt-5">
        <Encabezado eyebrow="Categorías" titulo="Explora por categoría" id="categorias-titulo" enlace={{ a: '/catalogo', texto: 'Ver todo el catálogo' }} />
        {categorias.error && <MensajeError error={categorias.error} alReintentar={categorias.recargar} />}
        <ul className="list-unstyled mb-0 grilla-categorias">
          {(categorias.datos ?? []).map((c) => (
            <li key={c.slug}>
              <Link to={`/catalogo?categoria=${c.slug}`} className="tile-categoria">
                <span className="panel-imagen d-block px-3 py-2">
                  <Ilustracion tipo={ILUSTRACION_CATEGORIA[c.slug]} />
                </span>
                <span className="d-flex justify-content-between align-items-baseline gap-2">
                  <span className="fw-semibold">{c.nombre}</span>
                  <span className="texto-mono small texto-secundario">{c.cantidadProductos}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="destacados-titulo" className="contenedor pt-5">
        <Encabezado eyebrow="Destacados" titulo="Lo más buscado esta semana" id="destacados-titulo" enlace={{ a: '/catalogo', texto: 'Ver más productos' }} />
        {productos.cargando && <Cargando texto="Cargando productos…" />}
        {productos.error && <MensajeError error={productos.error} alReintentar={productos.recargar} />}
        {!productos.cargando && !productos.error && <ListaProductos productos={destacados} onAgregar={alAgregar} columnas={4} />}
      </section>

      <section aria-labelledby="video-titulo" className="contenedor pt-5">
        <div className="tarjeta p-4 d-flex flex-wrap align-items-center gap-4">
          <div className="video" style={{ flex: '1 1 520px', minWidth: 0 }}>
            <iframe
              src={VIDEO_DESTACADO.url}
              title={VIDEO_DESTACADO.titulo}
              loading="lazy"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <div className="d-flex flex-column align-items-start gap-3" style={{ flex: '1 1 320px', minWidth: 0 }}>
            <p className="eyebrow">Video del producto</p>
            <h2 id="video-titulo" className="m-0" style={{ fontSize: 32 }}>
              {VIDEO_DESTACADO.titulo}
            </h2>
            <p className="m-0 texto-secundario">{VIDEO_DESTACADO.descripcion}</p>
            <Link to="/catalogo" className="btn btn-outline-secondary">
              Ir al catálogo
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="cupon-titulo" className="contenedor py-5">
        <div className="banda-cupon p-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3" style={{ minWidth: 0 }}>
            <span className="insignia insignia-ok justify-content-center" style={{ width: 48, height: 48, padding: 0 }} aria-hidden="true">
              <Icono nombre="etiqueta" tamano={24} />
            </span>
            <div className="d-flex flex-column gap-1">
              <h2 id="cupon-titulo" className="h4 m-0">
                {CUPON_BIENVENIDA.titulo}
              </h2>
              <p className="m-0 texto-secundario">{CUPON_BIENVENIDA.detalle}</p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <code className="codigo-cupon">{CUPON_BIENVENIDA.codigo}</code>
            <BotonCopiar texto={CUPON_BIENVENIDA.codigo} />
          </div>
        </div>
      </section>

      <Notificacion aviso={aviso} alCerrar={cerrarAviso} />
    </>
  )
}
