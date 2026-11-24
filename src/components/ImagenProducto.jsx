import Ilustracion from './Ilustracion.jsx'

// Si "imagen" es una URL muestra la foto con su texto alternativo; si no, la ilustración del tipo
export default function ImagenProducto({ imagen, alt }) {
  if (imagen && (/^(https?:)?\/\//.test(imagen) || imagen.startsWith('/'))) {
    const claseImagen = imagen.includes('/images/microfono-andesia.jpg') ? ' imagen-microfono' : ''
    return <img src={imagen} alt={alt} loading="lazy" className={`img-fluid d-block mx-auto${claseImagen}`} />
  }
  return <Ilustracion tipo={imagen} etiqueta={alt} />
}
