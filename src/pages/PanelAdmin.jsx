import { useCallback, useState } from 'react'
import AdminCategorias from '../components/admin/AdminCategorias.jsx'
import AdminProductos from '../components/admin/AdminProductos.jsx'
import AdminPromociones from '../components/admin/AdminPromociones.jsx'
import AdminResenas from '../components/admin/AdminResenas.jsx'
import AdminUsuarios from '../components/admin/AdminUsuarios.jsx'
import Icono from '../components/Icono.jsx'
import Notificacion from '../components/Notificacion.jsx'
import { useAuth } from '../context/useAuth.js'
import { useCarga } from '../hooks/useCarga.js'
import { listarCategoriasAdmin, listarResenasAdmin } from '../services/admin.js'

const SECCIONES = [
  { id: 'productos', nombre: 'Productos', icono: 'cuadricula' },
  { id: 'categorias', nombre: 'Categorías', icono: 'capas' },
  { id: 'promociones', nombre: 'Promociones', icono: 'etiqueta' },
  { id: 'resenas', nombre: 'Reseñas', icono: 'mensaje' },
  { id: 'usuarios', nombre: 'Usuarios', icono: 'usuarios' },
]

// Panel de administración: solo el rol ADMIN llega aquí (RutaProtegida) y el backend
// responde 403 a cualquier otro rol que llame a /api/admin.
export default function PanelAdmin() {
  const { usuario } = useAuth()
  const categorias = useCarga(() => listarCategoriasAdmin(), [])
  const pendientes = useCarga(() => listarResenasAdmin('PENDIENTE'), [])
  const [aviso, setAviso] = useState(null)
  const cerrarAviso = useCallback(() => setAviso(null), [])

  const porRevisar = pendientes.datos?.length ?? 0

  return (
    <div className="contenedor py-4">
      <div className="row g-4">
        <aside className="col-lg-3">
          <div className="panel-lateral d-flex flex-column gap-3">
            <nav className="menu-panel tarjeta p-2" aria-label="Secciones del panel de administración">
              <p className="eyebrow px-2 pt-2 mb-1">Configuración comercial</p>
              {SECCIONES.map((s) => (
                <a key={s.id} href={`#${s.id}`}>
                  <Icono nombre={s.icono} />
                  {s.nombre}
                  {s.id === 'resenas' && porRevisar > 0 && <span className="contador ms-auto">{porRevisar}</span>}
                </a>
              ))}
            </nav>
            <p className="small texto-secundario m-0 d-flex gap-2">
              <Icono nombre="candado" tamano={16} />
              Solo rol Administrador. Para otros roles estas acciones no se muestran y el backend rechaza la llamada con 403.
            </p>
          </div>
        </aside>

        <div className="col-lg-9 d-flex flex-column gap-5">
          <header className="d-flex flex-column gap-1">
            <p className="eyebrow">{usuario.nombre} · Administración</p>
            <h1 className="m-0" style={{ fontSize: 40 }}>
              Panel de administración
            </h1>
            <p className="m-0 texto-secundario">Catálogo, promociones, moderación de reseñas y cuentas de usuario.</p>
          </header>

          <section id="productos" aria-labelledby="titulo-productos" className="d-flex flex-column gap-3 seccion-panel">
            <h2 id="titulo-productos" className="h3 m-0">
              Productos
            </h2>
            <AdminProductos categorias={categorias.datos ?? []} avisar={setAviso} onCambio={categorias.recargar} />
          </section>

          <div className="row g-4">
            <section id="categorias" aria-labelledby="titulo-categorias" className="col-xl-5 d-flex flex-column gap-3 seccion-panel">
              <h2 id="titulo-categorias" className="h3 m-0">
                Categorías
              </h2>
              <AdminCategorias categorias={categorias} avisar={setAviso} onCambio={categorias.recargar} />
            </section>
            <section id="promociones" aria-labelledby="titulo-promociones" className="col-xl-7 d-flex flex-column gap-3 seccion-panel">
              <h2 id="titulo-promociones" className="h3 m-0">
                Promociones
              </h2>
              <AdminPromociones avisar={setAviso} />
            </section>
          </div>

          <section id="resenas" aria-labelledby="titulo-resenas" className="d-flex flex-column gap-3 seccion-panel">
            <h2 id="titulo-resenas" className="h3 m-0">
              Moderación de reseñas
            </h2>
            <AdminResenas pendientes={porRevisar} avisar={setAviso} onCambio={pendientes.recargar} />
          </section>

          <section id="usuarios" aria-labelledby="titulo-usuarios" className="d-flex flex-column gap-3 seccion-panel">
            <h2 id="titulo-usuarios" className="h3 m-0">
              Usuarios
            </h2>
            <AdminUsuarios yo={usuario} avisar={setAviso} />
          </section>
        </div>
      </div>
      <Notificacion aviso={aviso} alCerrar={cerrarAviso} />
    </div>
  )
}
