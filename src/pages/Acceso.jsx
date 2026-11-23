import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import Campo from '../components/Campo.jsx'
import { MensajeError } from '../components/Estado.jsx'
import Icono from '../components/Icono.jsx'
import { useAuth } from '../context/useAuth.js'
import { comunasDe, REGIONES } from '../data/regiones.js'
import { NOMBRE_ROL } from '../logica/estados.js'
import { INICIO_POR_ROL, rutaDespuesDeIngresar } from '../logica/rutas.js'
import { validarLogin, validarRegistro } from '../logica/validaciones.js'
import { iniciarSesion, registrar } from '../services/autenticacion.js'

// 401 y 403 llevan mensajes distintos: no es lo mismo equivocarse de contraseña que tener la cuenta desactivada
const AVISOS_LOGIN = {
  401: {
    titulo: 'Correo o contraseña incorrectos',
    texto: 'Revisa los datos e inténtalo otra vez.',
  },
  403: {
    titulo: 'Tu cuenta está desactivada',
    texto: 'Los datos son correctos, pero un administrador desactivó la cuenta. Escríbenos desde Ayuda con tu correo para reactivarla.',
  },
}

const DESTINOS = [
  { rol: 'Cliente', destino: 'Inicio' },
  { rol: 'Operador', destino: 'Panel del operador' },
  { rol: 'Administrador', destino: 'Administración' },
]

// Contraseña con botón para mostrarla. Usa el mismo esquema de mensajes que Campo.
function CampoClave({ id, etiqueta, valor, alCambiar, onBlur, error, ayuda, autoComplete }) {
  const [visible, setVisible] = useState(false)
  return (
    <Campo id={id} etiqueta={etiqueta} error={error} ayuda={ayuda} requerido>
      <div className="input-group">
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          className={`form-control ${error ? 'is-invalid' : ''}`}
          value={valor}
          onChange={(e) => alCambiar(e.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error || ayuda ? `${id}-mensaje` : undefined}
        />
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          <Icono nombre="ojo" />
        </button>
      </div>
    </Campo>
  )
}

function FormularioLogin({ onIngresar }) {
  const [datos, setDatos] = useState({ email: '', clave: '' })
  const [tocados, setTocados] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  const errores = validarLogin(datos)
  const mostrar = (campo) => (tocados[campo] ? errores[campo] : '')
  const cambiar = (campo) => (valor) => setDatos((d) => ({ ...d, [campo]: valor }))
  const tocar = (campo) => () => setTocados((t) => ({ ...t, [campo]: true }))

  async function enviar(e) {
    e.preventDefault()
    setTocados({ email: true, clave: true })
    if (Object.keys(errores).length > 0) return
    setEnviando(true)
    setError(null)
    try {
      onIngresar(await iniciarSesion(datos.email.trim(), datos.clave))
    } catch (err) {
      setError(err)
      setEnviando(false)
    }
  }

  const aviso = error && AVISOS_LOGIN[error.estado]

  return (
    <form onSubmit={enviar} noValidate className="d-flex flex-column gap-3" aria-labelledby="titulo-login">
      {aviso ? (
        <div className="aviso aviso-error" role="alert">
          <Icono nombre={error.estado === 403 ? 'prohibido' : 'alerta'} tamano={20} grosor={2.2} />
          <div>
            <p className="fw-semibold">{aviso.titulo}</p>
            <p className="small mt-1">{aviso.texto}</p>
          </div>
        </div>
      ) : (
        <MensajeError error={error} />
      )}
      <Campo
        id="login-email"
        tipo="email"
        etiqueta="Correo electrónico"
        requerido
        autoComplete="email"
        valor={datos.email}
        alCambiar={cambiar('email')}
        onBlur={tocar('email')}
        error={mostrar('email')}
      />
      <CampoClave
        id="login-clave"
        etiqueta="Contraseña"
        autoComplete="current-password"
        valor={datos.clave}
        alCambiar={cambiar('clave')}
        onBlur={tocar('clave')}
        error={mostrar('clave')}
      />
      <button type="submit" className="btn btn-primary btn-lg" disabled={enviando}>
        {enviando ? 'Ingresando…' : 'Ingresar'}
      </button>
    </form>
  )
}

const REGISTRO_VACIO = {
  nombre: '',
  email: '',
  telefono: '',
  clave: '',
  confirmacion: '',
  region: '',
  comuna: '',
  direccion: '',
  terminos: false,
}

function FormularioRegistro({ onIngresar }) {
  const [datos, setDatos] = useState(REGISTRO_VACIO)
  const [tocados, setTocados] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [erroresServidor, setErroresServidor] = useState({})

  // Los errores del backend (correo repetido, por ejemplo) se muestran hasta que se corrige ese campo
  const errores = Object.fromEntries(Object.entries({ ...erroresServidor, ...validarRegistro(datos) }).filter(([, m]) => m))
  const pendientes = Object.keys(errores).length
  const mostrar = (campo) => (tocados[campo] ? errores[campo] : '')
  const tocar = (campo) => () => setTocados((t) => ({ ...t, [campo]: true }))

  function cambiar(campo) {
    return (valor) => {
      setDatos((d) => ({ ...d, [campo]: valor, ...(campo === 'region' ? { comuna: '' } : {}) }))
      setErroresServidor((e) => ({ ...e, [campo]: undefined }))
      if (campo === 'region' || campo === 'comuna') setTocados((t) => ({ ...t, [campo]: true }))
    }
  }

  async function enviar(e) {
    e.preventDefault()
    if (pendientes > 0 || enviando) return
    setEnviando(true)
    setError(null)
    try {
      // La confirmación y los términos se validan aquí; al backend solo viaja lo que guarda
      const cuerpo = {
        nombre: datos.nombre.trim(),
        email: datos.email.trim(),
        clave: datos.clave,
        telefono: datos.telefono,
        region: datos.region,
        comuna: datos.comuna,
        direccion: datos.direccion.trim(),
      }
      onIngresar(await registrar(cuerpo))
    } catch (err) {
      // 409: el correo ya existe; 400: el backend devuelve el mensaje de cada campo
      if (err.estado === 409) {
        setErroresServidor({ email: err.message })
        setTocados((t) => ({ ...t, email: true }))
      } else if (Object.keys(err.errores ?? {}).length) {
        setErroresServidor(err.errores)
        setTocados((t) => ({ ...t, ...Object.fromEntries(Object.keys(err.errores).map((c) => [c, true])) }))
      } else {
        setError(err)
      }
      setEnviando(false)
    }
  }

  const regiones = [{ valor: '', texto: 'Elige una región' }, ...REGIONES.map((r) => ({ valor: r.nombre, texto: r.nombre }))]
  const comunas = [
    { valor: '', texto: datos.region ? 'Elige una comuna' : 'Primero elige la región' },
    ...comunasDe(datos.region).map((c) => ({ valor: c, texto: c })),
  ]

  return (
    <form onSubmit={enviar} noValidate className="d-flex flex-column gap-3" aria-labelledby="titulo-registro">
      <MensajeError error={error} />
      <Campo
        id="registro-nombre"
        etiqueta="Nombre completo"
        requerido
        autoComplete="name"
        valor={datos.nombre}
        alCambiar={cambiar('nombre')}
        onBlur={tocar('nombre')}
        error={mostrar('nombre')}
      />
      <div className="row g-3">
        <Campo
          className="col-md-7"
          id="registro-email"
          tipo="email"
          etiqueta="Correo electrónico"
          requerido
          autoComplete="email"
          valor={datos.email}
          alCambiar={cambiar('email')}
          onBlur={tocar('email')}
          error={mostrar('email')}
        />
        <Campo
          className="col-md-5"
          id="registro-telefono"
          tipo="tel"
          etiqueta="Teléfono móvil"
          requerido
          inputMode="numeric"
          maxLength={9}
          autoComplete="tel-national"
          valor={datos.telefono}
          alCambiar={cambiar('telefono')}
          onBlur={tocar('telefono')}
          error={mostrar('telefono')}
          ayuda="9 dígitos, sin +56 ni espacios."
        />
      </div>
      <div className="row g-3">
        <div className="col-md-6">
          <CampoClave
            id="registro-clave"
            etiqueta="Contraseña"
            autoComplete="new-password"
            valor={datos.clave}
            alCambiar={cambiar('clave')}
            onBlur={tocar('clave')}
            error={mostrar('clave')}
            ayuda="8 caracteres o más, con al menos un número."
          />
        </div>
        <div className="col-md-6">
          <CampoClave
            id="registro-confirmacion"
            etiqueta="Repite la contraseña"
            autoComplete="new-password"
            valor={datos.confirmacion}
            alCambiar={cambiar('confirmacion')}
            onBlur={tocar('confirmacion')}
            error={mostrar('confirmacion')}
          />
        </div>
      </div>

      <fieldset className="d-flex flex-column gap-3 pt-2">
        <legend className="h6 mb-0">Dirección de despacho</legend>
        <div className="row g-3">
          <Campo
            className="col-md-6"
            id="registro-region"
            como="select"
            etiqueta="Región"
            requerido
            opciones={regiones}
            valor={datos.region}
            alCambiar={cambiar('region')}
            error={mostrar('region')}
          />
          <Campo
            className="col-md-6"
            id="registro-comuna"
            como="select"
            etiqueta="Comuna"
            requerido
            opciones={comunas}
            valor={datos.comuna}
            alCambiar={cambiar('comuna')}
            error={mostrar('comuna')}
            disabled={!datos.region}
          />
        </div>
        <Campo
          id="registro-direccion"
          etiqueta="Dirección"
          requerido
          autoComplete="street-address"
          placeholder="Calle y número"
          valor={datos.direccion}
          alCambiar={cambiar('direccion')}
          onBlur={tocar('direccion')}
          error={mostrar('direccion')}
        />
      </fieldset>

      <div>
        <div className="form-check d-flex align-items-start gap-2">
          <input
            id="registro-terminos"
            className={`form-check-input mt-1 ${mostrar('terminos') ? 'is-invalid' : ''}`}
            type="checkbox"
            checked={datos.terminos}
            onChange={(e) => {
              cambiar('terminos')(e.target.checked)
              setTocados((t) => ({ ...t, terminos: true }))
            }}
            aria-describedby={mostrar('terminos') ? 'registro-terminos-mensaje' : undefined}
          />
          <label className="form-check-label" htmlFor="registro-terminos">
            Acepto los términos y condiciones y la política de privacidad.
          </label>
        </div>
        {mostrar('terminos') && (
          <p id="registro-terminos-mensaje" className="mensaje mensaje-error">
            <Icono nombre="alerta" tamano={15} grosor={2.2} />
            {errores.terminos}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-lg"
        disabled={pendientes > 0 || enviando}
        aria-describedby={pendientes > 0 ? 'registro-estado' : undefined}
      >
        {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>
      {pendientes > 0 && (
        <p id="registro-estado" className="mensaje mensaje-ayuda m-0">
          Se habilita cuando todos los campos estén listos{pendientes === 1 ? ' (falta 1)' : ` (faltan ${pendientes})`}.
        </p>
      )}
    </form>
  )
}

export default function Acceso() {
  const { usuario, entrar, salir } = useAuth()
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const desde = ubicacion.state?.desde

  // El rol viene dentro de la respuesta del backend (y del token JWT): con él se decide a dónde ir
  function alIngresar(respuesta) {
    entrar(respuesta)
    navegar(rutaDespuesDeIngresar(respuesta.usuario.rol, desde), { replace: true })
  }

  if (usuario) {
    return (
      <div className="contenedor py-5">
        <div className="tarjeta p-4 p-md-5 mx-auto d-flex flex-column align-items-start gap-3" style={{ maxWidth: 560 }}>
          <span className="avatar" aria-hidden="true">
            <Icono nombre="usuario" tamano={18} />
          </span>
          <h1 className="h3 m-0">Ya iniciaste sesión</h1>
          <p className="m-0 texto-secundario">
            Entraste como {usuario.nombre} ({NOMBRE_ROL[usuario.rol]}).
          </p>
          <div className="d-flex flex-wrap gap-2">
            <Link to={INICIO_POR_ROL[usuario.rol]} className="btn btn-primary">
              Ir a mi vista
            </Link>
            <button type="button" className="btn btn-outline-secondary" onClick={salir}>
              <Icono nombre="salir" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="contenedor py-5">
      {desde && (
        <div className="aviso aviso-info mb-4" role="status">
          <Icono nombre="candado" tamano={20} />
          <p>Inicia sesión o crea una cuenta para continuar. Después te llevamos a donde ibas.</p>
        </div>
      )}
      <div className="row g-4 align-items-start">
        <section className="col-lg-5" aria-labelledby="titulo-login">
          <div className="tarjeta p-4 p-md-5 d-flex flex-column gap-4">
            <div>
              <p className="eyebrow">Ya tengo cuenta</p>
              <h1 id="titulo-login" className="m-0" style={{ fontSize: 32 }}>
                Ingresar
              </h1>
              <p className="m-0 mt-1 texto-secundario">Para pagar y seguir tus órdenes. Al entrar te llevamos a la vista de tu rol.</p>
            </div>
            <FormularioLogin onIngresar={alIngresar} />
            <div className="bloque-dato">
              <p className="small fw-semibold mb-2">Después de ingresar</p>
              <dl className="m-0 d-flex flex-column gap-1 small">
                {DESTINOS.map((d) => (
                  <div key={d.rol} className="d-flex justify-content-between gap-2">
                    <dt className="fw-normal texto-secundario">{d.rol}</dt>
                    <dd className="m-0">{d.destino}</dd>
                  </div>
                ))}
              </dl>
              <p className="small texto-secundario mb-0 mt-2">El rol viene dentro del token JWT que entrega el backend.</p>
            </div>
          </div>
        </section>
        <section className="col-lg-7" aria-labelledby="titulo-registro">
          <div className="tarjeta p-4 p-md-5 d-flex flex-column gap-4">
            <div>
              <p className="eyebrow">Soy nuevo</p>
              <h2 id="titulo-registro" className="m-0" style={{ fontSize: 32 }}>
                Crear cuenta
              </h2>
              <p className="m-0 mt-1 texto-secundario">Guarda tu dirección de despacho para pagar más rápido.</p>
            </div>
            <FormularioRegistro onIngresar={alIngresar} />
          </div>
        </section>
      </div>
    </div>
  )
}
