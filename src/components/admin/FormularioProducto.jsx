import { useState } from 'react'
import { ILUSTRACION_CATEGORIA, NOMBRE_ILUSTRACION } from '../../data/contenido.js'
import { escribirEspecificaciones, leerEspecificaciones } from '../../logica/productos.js'
import { validarProducto } from '../../logica/validaciones.js'
import { actualizarProducto, crearProducto } from '../../services/admin.js'
import Campo from '../Campo.jsx'
import { MensajeError } from '../Estado.jsx'
import Icono from '../Icono.jsx'
import ImagenProducto from '../ImagenProducto.jsx'

const ETIQUETAS = {
  sku: 'SKU',
  nombre: 'nombre',
  marca: 'marca',
  categoriaId: 'categoría',
  precio: 'precio',
  precioNormal: 'precio normal',
  imagenUrl: 'URL de la foto',
  especificaciones: 'especificaciones',
}

const esUrl = (texto) => /^(https?:)?\/\//.test(texto)

function datosIniciales(producto, categorias) {
  if (!producto) {
    return {
      sku: '',
      nombre: '',
      marca: '',
      categoriaId: String(categorias[0]?.id ?? ''),
      precio: '',
      precioNormal: '',
      ofertaHasta: '',
      stock: '0',
      resumen: '',
      descripcion: '',
      ilustracion: ILUSTRACION_CATEGORIA[categorias[0]?.slug] ?? 'gpu',
      imagenUrl: '',
      especificaciones: '',
    }
  }
  const foto = esUrl(producto.imagen ?? '')
  return {
    sku: producto.sku,
    nombre: producto.nombre,
    marca: producto.marca,
    categoriaId: String(producto.categoriaId),
    precio: String(producto.precio),
    precioNormal: producto.precioNormal == null ? '' : String(producto.precioNormal),
    ofertaHasta: producto.ofertaHasta ?? '',
    stock: String(producto.stock),
    resumen: producto.resumen ?? '',
    descripcion: producto.descripcion ?? '',
    ilustracion: foto ? 'gpu' : (producto.imagen ?? 'gpu'),
    imagenUrl: foto ? producto.imagen : '',
    especificaciones: escribirEspecificaciones(producto.especificaciones),
  }
}

// Crear o editar un producto. validarProducto revisa en el navegador lo mismo que el backend:
// precio mayor que cero, categoría existente y precio normal mayor que el de oferta.
export default function FormularioProducto({ producto, categorias, onGuardado, onCancelar }) {
  const editando = Boolean(producto)
  const [datos, setDatos] = useState(() => datosIniciales(producto, categorias))
  const [erroresServidor, setErroresServidor] = useState({})
  const [tocados, setTocados] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  const specs = leerEspecificaciones(datos.especificaciones)
  const url = datos.imagenUrl.trim()
  const errores = Object.fromEntries(
    Object.entries({
      ...erroresServidor,
      ...validarProducto(datos, categorias),
      imagenUrl: url && !/^https?:\/\/\S+$/.test(url) ? 'La URL debe empezar con http:// o https://.' : '',
      especificaciones: specs.error,
    }).filter(([, m]) => m),
  )
  const pendientes = Object.keys(errores)
  // Al editar se muestran todos los errores; en un producto nuevo, solo los de campos ya visitados
  const ver = (campo) => erroresServidor[campo] || (editando || tocados[campo] ? errores[campo] : '')
  const tocar = (campo) => () => setTocados((t) => ({ ...t, [campo]: true }))
  const marcados = pendientes.filter((c) => ver(c))

  function cambiar(campo) {
    return (valor) => {
      setDatos((d) => ({ ...d, [campo]: valor }))
      setErroresServidor((e) => ({ ...e, [campo]: '' }))
    }
  }

  async function guardar(e) {
    e.preventDefault()
    if (pendientes.length > 0 || enviando) return
    setEnviando(true)
    setError(null)
    const cuerpo = {
      sku: datos.sku.trim().toUpperCase(),
      nombre: datos.nombre.trim(),
      marca: datos.marca.trim(),
      categoriaId: Number(datos.categoriaId),
      precio: Number(datos.precio),
      precioNormal: datos.precioNormal === '' ? null : Number(datos.precioNormal),
      ofertaHasta: datos.precioNormal === '' ? null : datos.ofertaHasta || null,
      stock: Number(datos.stock || 0),
      resumen: datos.resumen.trim(),
      descripcion: datos.descripcion.trim(),
      imagen: url || datos.ilustracion,
      especificaciones: specs.especificaciones,
    }
    try {
      const guardado = editando ? await actualizarProducto(producto.id, cuerpo) : await crearProducto(cuerpo)
      onGuardado(guardado, editando)
    } catch (err) {
      // 409: SKU repetido; 400: mensajes por campo que manda el backend
      const porCampo = Object.fromEntries(Object.entries(err.errores ?? {}).filter(([campo]) => campo in datos))
      if (err.estado === 409) setErroresServidor({ sku: err.message })
      else if (Object.keys(porCampo).length) setErroresServidor(porCampo)
      else setError(err)
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={guardar} noValidate className="tarjeta p-4 d-flex flex-column gap-3" aria-labelledby="titulo-producto-form">
      <div className="d-flex flex-wrap justify-content-between align-items-baseline gap-2">
        <h3 id="titulo-producto-form" className="h5 m-0">
          {editando ? `Editar producto · ${producto.nombre}` : 'Nuevo producto'}
        </h3>
        <p className="m-0 small texto-secundario">
          <span className="text-danger" aria-hidden="true">
            *
          </span>{' '}
          Obligatorio
        </p>
      </div>
      <MensajeError error={error} />

      <div className="row g-3">
        <Campo className="col-md-8" id="producto-nombre" etiqueta="Nombre" requerido valor={datos.nombre} alCambiar={cambiar('nombre')} error={ver('nombre')} onBlur={tocar('nombre')} />
        <Campo
          className="col-md-4"
          id="producto-sku"
          etiqueta="SKU"
          requerido
          maxLength={30}
          valor={datos.sku}
          alCambiar={cambiar('sku')}
          error={ver('sku')} onBlur={tocar('sku')}
          ayuda="Código único, por ejemplo GPU-VOL-X70."
        />
        <Campo className="col-md-4" id="producto-marca" etiqueta="Marca" requerido valor={datos.marca} alCambiar={cambiar('marca')} error={ver('marca')} onBlur={tocar('marca')} />
        <Campo
          className="col-md-4"
          id="producto-categoria"
          como="select"
          etiqueta="Categoría"
          requerido
          opciones={categorias.map((c) => ({ valor: String(c.id), texto: c.nombre }))}
          valor={datos.categoriaId}
          alCambiar={cambiar('categoriaId')}
          error={ver('categoriaId')} onBlur={tocar('categoriaId')}
          ayuda="Solo categorías existentes."
        />
        <Campo
          className="col-md-4"
          id="producto-stock"
          tipo="number"
          etiqueta={editando ? 'Stock' : 'Stock inicial'}
          min={0}
          valor={datos.stock}
          alCambiar={cambiar('stock')}
          disabled={editando}
          ayuda={editando ? 'Se ajusta desde el panel del operador.' : 'Después se ajusta desde el panel del operador.'}
        />
        <Campo
          className="col-md-4"
          id="producto-precio"
          tipo="number"
          etiqueta="Precio (CLP)"
          requerido
          min={1}
          inputMode="numeric"
          valor={datos.precio}
          alCambiar={cambiar('precio')}
          error={ver('precio')} onBlur={tocar('precio')}
          ayuda="El precio debe ser mayor que cero."
        />
        <Campo
          className="col-md-4"
          id="producto-precio-normal"
          tipo="number"
          etiqueta="Precio normal"
          opcional
          min={1}
          inputMode="numeric"
          valor={datos.precioNormal}
          alCambiar={cambiar('precioNormal')}
          error={ver('precioNormal')} onBlur={tocar('precioNormal')}
          ayuda="Si lo completas, el producto se muestra en oferta."
        />
        <Campo
          className="col-md-4"
          id="producto-oferta"
          tipo="date"
          etiqueta="Oferta hasta"
          opcional
          valor={datos.ofertaHasta}
          alCambiar={cambiar('ofertaHasta')}
          disabled={datos.precioNormal === ''}
          ayuda="Sin fecha, la oferta no vence."
        />
        <Campo
          className="col-12"
          id="producto-resumen"
          etiqueta="Resumen"
          opcional
          maxLength={120}
          valor={datos.resumen}
          alCambiar={cambiar('resumen')}
          ayuda="Una línea para la tarjeta del catálogo (hasta 120 caracteres)."
        />
        <Campo
          className="col-12"
          id="producto-descripcion"
          como="textarea"
          etiqueta="Descripción"
          opcional
          maxLength={2000}
          valor={datos.descripcion}
          alCambiar={cambiar('descripcion')}
        />
        <Campo
          className="col-md-7"
          id="producto-especificaciones"
          como="textarea"
          etiqueta="Especificaciones"
          opcional
          rows={5}
          placeholder={'Memoria: 12 GB GDDR6X\nSalidas: HDMI 2.1, 3 × DisplayPort'}
          valor={datos.especificaciones}
          alCambiar={cambiar('especificaciones')}
          error={ver('especificaciones')} onBlur={tocar('especificaciones')}
          ayuda="Una por línea, con el formato «Clave: Valor»."
        />
        <div className="col-md-5 d-flex flex-column gap-3">
          <Campo
            id="producto-ilustracion"
            como="select"
            etiqueta="Ilustración"
            opciones={Object.entries(NOMBRE_ILUSTRACION).map(([valor, texto]) => ({ valor, texto }))}
            valor={datos.ilustracion}
            alCambiar={cambiar('ilustracion')}
            disabled={Boolean(url)}
          />
          <Campo
            id="producto-imagen-url"
            tipo="url"
            etiqueta="URL de la foto"
            opcional
            maxLength={255}
            placeholder="https://"
            valor={datos.imagenUrl}
            alCambiar={cambiar('imagenUrl')}
            error={ver('imagenUrl')} onBlur={tocar('imagenUrl')}
            ayuda="Si la pegas, se usa la foto en vez de la ilustración."
          />
          <div className="panel-imagen p-3" aria-label="Vista previa de la imagen">
            <ImagenProducto imagen={url && !errores.imagenUrl ? url : datos.ilustracion} alt={`Vista previa de ${datos.nombre || 'el producto'}`} />
          </div>
        </div>
      </div>

      <div className="d-flex flex-wrap align-items-center gap-2">
        <button type="submit" className="btn btn-primary" disabled={pendientes.length > 0 || enviando}>
          <Icono nombre="check" />
          {enviando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear producto'}
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={onCancelar}>
          Cancelar
        </button>
        {pendientes.length > 0 && (
          <p className="mensaje mensaje-aviso m-0">
            <Icono nombre="alerta" tamano={15} grosor={2.2} />
            {marcados.length === 0
              ? 'Completa los campos obligatorios (*) para guardar.'
              : marcados.length === 1
                ? `Corrige ${ETIQUETAS[marcados[0]] ?? 'el campo marcado'} para guardar.`
                : `Corrige los ${marcados.length} campos marcados para guardar.`}
          </p>
        )}
      </div>
    </form>
  )
}
