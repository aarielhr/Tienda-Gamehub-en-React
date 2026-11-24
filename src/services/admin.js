import { solicitar } from './api.js'

// La tabla de productos junta el catálogo (product-service) con el stock (inventory-service)
export async function listarProductosAdmin() {
  const [productos, stock] = await Promise.all([solicitar('/api/admin/productos'), solicitar('/api/operador/inventario')])
  const stockPorId = new Map(stock.map((s) => [s.id, s.stock]))
  return productos.map((p) => ({ ...p, stock: stockPorId.get(p.id) ?? 0 }))
}
export const crearProducto = (datos) => solicitar('/api/admin/productos', { metodo: 'POST', cuerpo: datos })
export const actualizarProducto = (id, datos) => solicitar(`/api/admin/productos/${id}`, { metodo: 'PUT', cuerpo: datos })
export const cambiarActivoProducto = (id, activo) =>
  solicitar(`/api/admin/productos/${id}/activo`, { metodo: 'PATCH', cuerpo: { activo } })

export const listarCategoriasAdmin = () => solicitar('/api/admin/categorias')
export const crearCategoria = (nombre) => solicitar('/api/admin/categorias', { metodo: 'POST', cuerpo: { nombre } })
export const renombrarCategoria = (id, nombre) =>
  solicitar(`/api/admin/categorias/${id}`, { metodo: 'PUT', cuerpo: { nombre } })
export const eliminarCategoria = (id) => solicitar(`/api/admin/categorias/${id}`, { metodo: 'DELETE' })

export const listarPromociones = () => solicitar('/api/admin/promociones')
export const crearPromocion = (datos) => solicitar('/api/admin/promociones', { metodo: 'POST', cuerpo: datos })
export const cambiarActivoPromocion = (id, activo) =>
  solicitar(`/api/admin/promociones/${id}/activo`, { metodo: 'PATCH', cuerpo: { activo } })

export const listarResenasAdmin = (estado) =>
  solicitar(estado ? `/api/admin/resenas?estado=${estado}` : '/api/admin/resenas')
export const moderarResena = (id, estado) => solicitar(`/api/admin/resenas/${id}`, { metodo: 'PUT', cuerpo: { estado } })

export const listarUsuarios = () => solicitar('/api/admin/usuarios')
export const cambiarActivoUsuario = (id, activo) =>
  solicitar(`/api/admin/usuarios/${id}/activo`, { metodo: 'PATCH', cuerpo: { activo } })
