# Documento ERS — Versión 2
## GameHub Store — Frontend — Evaluación 2 (EV2)

**Fecha de actualización:** 27 de octubre de 2026.

**Documento de origen:** ERS de la Evaluación 1.

**Estado:** actualizado a la implementación de EV2; las funciones y verificaciones pendientes se identifican al final.

### Integrantes

- Lukas Valdes.
- Gustavo Gardilic.
- Ariel Hernandez.

### Propósito y Alcance

Este documento actualiza la especificación de requisitos de GameHub Store a partir de la versión de EV1. La EV2 migra el frontend de HTML, CSS y JavaScript tradicional a React con Bootstrap, conserva las rutas lógicas y el flujo de catálogo, carrito, checkout e historial, e incorpora pruebas unitarias con Jasmine ejecutadas mediante Karma y un reporte de cobertura.

La aplicación es una tienda de demostración de hardware y periféricos. Los productos, el stock y las ubicaciones disponibles se obtienen de datos locales. El carrito, el cupón y las órdenes se persisten en el navegador mediante `localStorage`. Los pagos y la confirmación de compra son simulados.

El alcance de EV2 comprende la aplicación React, sus componentes reutilizables, el diseño responsivo, los servicios simulados, las pruebas y la documentación. La autenticación, el cobro real, el envío real de correos, una base de datos compartida y los servicios de backend quedan fuera de esta versión.

- **Repositorio:** [Tienda-Gamehub-en-React](https://github.com/aarielhr/Tienda-Gamehub-en-React).
- **Sitio publicado:** [GameHub Store en Vercel](https://tienda-gamehub-en-react.vercel.app/).
- **Documento de pruebas:** `REPORTE-COBERTURA-TESTING.md`, ubicado en la raíz del proyecto.

### Requisitos Funcionales

1. **Visualización del Catálogo — RF-01**
   - Mostrar productos con su imagen original, nombre, precio y disponibilidad de stock.
   - Permitir el filtrado por categoría, marca y rango de precio.
   - Permitir ordenar por nombre (A-Z/Z-A) y precio (ascendente/descendente).
   - Mostrar un mensaje cuando ningún producto cumple los filtros.
   - Informar cuando el precio mínimo supera al máximo y evitar aplicar ese rango.
   - Incorporar carga incremental mediante el botón «Cargar más productos».
   - Impedir agregar productos sin stock y mostrar su condición de agotados.

   **Implementación:** `Catalogo.jsx`, `TarjetaProducto.jsx` y `src/datos/productos.js`. La carga inicial utiliza cuatro productos y aumenta en grupos de cuatro. La portada presenta los tres primeros productos del catálogo como destacados.

2. **Gestión del Carrito de Compras — RF-02**
   - Agregar productos desde el inicio o el catálogo.
   - Incrementar la cantidad del producto existente sin duplicar su línea en el carrito.
   - Rechazar productos inexistentes o agotados y evitar superar su stock disponible.
   - Permitir modificar cantidades enteras desde una unidad hasta el stock máximo.
   - Permitir eliminar un artículo o vaciar el carrito completo.
   - Mostrar un resumen de subtotal, descuento y total.
   - Aceptar los códigos `SETUP2026` (15 %) y `DUOC10` (10 %), normalizando espacios y mayúsculas.
   - Informar los códigos desconocidos y retirar el cupón almacenado cuando se aplica uno inválido.
   - Persistir el carrito y el cupón entre vistas y recargas del mismo origen.
   - Actualizar el contador de artículos de la navegación a partir del contexto compartido.

   **Implementación:** `ProveedorCarrito.jsx`, `ElementoCarrito.jsx`, `ResumenCarrito.jsx`, `ResumenOrden.jsx`, `Carrito.jsx` y los servicios de almacenamiento y carrito. El total se limita a un valor no negativo. Los topes monetarios y la vigencia por fechas cuentan con funciones probadas, pero su integración en el flujo visible se mantiene como pendiente; no se consideran reglas completadas de RF-02.

3. **Proceso de Checkout — RF-03**
   - Impedir continuar con el pago cuando el carrito está vacío y ofrecer un enlace al catálogo.
   - Recopilar nombre, correo, teléfono, región, comuna y dirección mediante campos controlados por React.
   - Ofrecer tarjeta, transferencia bancaria y contraentrega como métodos de pago simulados.
   - Validar los campos antes de registrar la orden y mostrar mensajes personalizados ante errores.
   - Mostrar el resumen del carrito con el descuento aplicado.
   - Generar una confirmación de compra con número de orden y mostrar el correo ingresado.
   - Guardar la orden simulada, vaciar el carrito y eliminar el cupón tras una compra válida.

   **Reglas de validación implementadas:**

   | Campo | Regla |
   |---|---|
   | Nombre | Mínimo tres caracteres, sin contar espacios al principio y al final. |
   | Correo | Formato con nombre, `@`, dominio y extensión. |
   | Teléfono | Exactamente nueve dígitos numéricos. |
   | Región | Debe pertenecer al conjunto de regiones disponibles. |
   | Comuna | Debe pertenecer a la región seleccionada. Se restablece al cambiar la región. |
   | Dirección | Mínimo cinco caracteres, sin contar espacios externos. |
   | Método de pago | Tarjeta, transferencia o contraentrega. |

   **Implementación:** `Pago.jsx` contiene el estado y la validación. `FormularioCheckout.jsx` mantiene deshabilitado el botón de confirmar mientras la dirección esté vacía; habilitar el botón no sustituye la validación completa del envío. Las ubicaciones son un subconjunto de comunas de Valparaíso, Metropolitana de Santiago y Biobío. No existe un envío de correo ni un cobro real.

4. **Historial de Órdenes — RF-04**
   - Guardar las órdenes de compras simuladas realizadas en el mismo navegador y origen.
   - Conservar las órdenes previas al registrar una nueva.
   - Presentar una tabla con número, fecha, total y estado.
   - Mostrar un mensaje y un enlace al catálogo cuando no existan órdenes.

   **Implementación:** `servicioOrdenes.js` y `Ordenes.jsx`. Cada orden guarda `numero`, `fecha`, `total` y `estado`, inicialmente «Pendiente». El número se construye con el prefijo `GH-` y los últimos seis dígitos de la marca de tiempo. Esta generación es demostrativa y no garantiza unicidad global. El historial no dispone de seguimiento real de despacho ni cambios de estado desde un servidor.

5. **Navegación y Diseño Consistente — RF-05**
   - Mantener una navegación compartida entre Inicio, Catálogo, Carrito, Checkout y Mis Órdenes.
   - Utilizar enrutamiento de cliente y conservar las rutas lógicas de EV1.
   - Presentar un pie de página con copyright, contacto y enlaces sociales.
   - Adaptar la presentación a móvil, tablet y escritorio mediante Bootstrap y estilos complementarios.
   - Conservar las imágenes de los productos y mostrar retroalimentación al agregar artículos.

   | Ruta | Vista |
   |---|---|
   | `/` y `/index.html` | Inicio. |
   | `/catalogo.html` | Catálogo, filtros, ordenamiento y carga incremental. |
   | `/carrito.html` | Artículos, cantidades, cupones y totales. |
   | `/checkout.html` | Despacho, validación, pago simulado y confirmación. |
   | `/ordenes.html` | Historial de órdenes locales. |

   **Implementación:** `Aplicacion.jsx` declara las rutas con React Router; `Estructura.jsx` comparte cabecera y pie, actualiza el título y muestra avisos temporales. La navegación móvil utiliza el componente desplegable de Bootstrap. Los accesos visuales de la portada conducen al catálogo; no aplican filtros automáticamente. El rediseño utiliza fondo oscuro, acentos cian, tipografía y bordes consistentes. La ilustración del teclado de la portada es decorativa.

### Requisitos No Funcionales

1. **Compatibilidad — RNF-01**
   - Se mantiene como objetivo la compatibilidad con versiones modernas de Chrome, Firefox, Safari y Edge.
   - La ejecución automatizada registrada se realizó en Edge 156 sobre Windows 10 con un lanzador basado en Chrome Headless.
   - El diseño local fue revisado a anchos de 360, 768 y 1280 píxeles. En las vistas revisadas no se observaron imágenes rotas ni desbordamientos horizontales de página.
   - La compatibilidad completa con todos los navegadores citados requiere comprobaciones adicionales y no se declara certificada.

2. **Usabilidad y Accesibilidad — RNF-02**
   - Proporcionar retroalimentación para acciones del carrito, errores del catálogo y validaciones del checkout.
   - Utilizar etiquetas asociadas a los controles, textos alternativos en imágenes y nombres accesibles donde corresponde.
   - Distinguir los estados de foco, interacción, disponibilidad y deshabilitación.
   - Mantener contraste legible y respetar la preferencia de movimiento reducido en los efectos visuales.
   - Mantener WCAG AA como objetivo de accesibilidad. No se ha realizado una auditoría integral que permita declarar cumplimiento completo.

3. **Rendimiento — RNF-03**
   - Generar la versión de producción mediante Vite.
   - Utilizar carga incremental del catálogo y carga diferida de imágenes donde está implementada.
   - Gestionar la interfaz con estado React y componentes reutilizables.
   - Publicar las imágenes desde `public/images/` para que se incluyan en `dist/images/` durante la compilación.
   - La compilación de producción se verificó correctamente. La optimización integral de imágenes y las métricas de rendimiento no se consideran acreditadas por esa compilación.

4. **Mantenibilidad y Calidad de Código — RNF-04**
   - Organizar el proyecto en componentes, vistas, contexto, servicios, datos y utilidades.
   - Intercambiar datos mediante propiedades y gestionar estado y efectos con hooks de React.
   - Mantener variables CSS para colores y estilos compartidos, junto con la grilla y los componentes de Bootstrap.
   - Conservar pruebas separadas del código de aplicación y control de versiones con Git.

5. **Seguridad y Persistencia del Frontend — RNF-05**
   - Evitar guardar contraseñas, credenciales y datos de tarjeta en `localStorage`.
   - Validar entradas en el cliente para mejorar la consistencia de los datos del flujo simulado.
   - Reconocer que la validación del cliente y `localStorage` no reemplazan las validaciones ni la seguridad de un backend.
   - Limitar los datos persistidos a carrito, cupón y resumen de órdenes. Los campos de despacho permanecen en el estado del formulario y no se guardan en la orden actual.
   - Considerar que el almacenamiento pertenece al origen: los datos de localhost, una vista previa y el dominio publicado no se comparten automáticamente.
   - No se implementan autenticación, autorización de usuarios ni pagos reales en EV2.

6. **Pruebas y Cobertura — RNF-06**
   - Disponer de al menos diez pruebas unitarias con Jasmine, ejecutadas mediante Karma, y cotejar sus casos con el listado obligatorio de la pauta.
   - Configurar `karma`, `karma-jasmine`, `jasmine-core`, `karma-chrome-launcher`, `karma-webpack`, `webpack`, `babel-loader`, `@babel/core`, `@babel/preset-env`, `@babel/preset-react` y `karma-coverage`.
   - Instrumentar el código con `babel-plugin-istanbul` y excluir los archivos de pruebas de la medición.
   - Utilizar `jasmine.createSpy`, `spyOn` y `jasmine.clock()` para callbacks, almacenamiento, eventos y temporizadores.
   - Documentar alcance, casos diseñados, resultados y cobertura por archivo en `REPORTE-COBERTURA-TESTING.md`.

### Herramientas Seleccionadas

| Herramienta | Uso en EV2 |
|---|---|
| HTML5 y JSX | Estructura semántica y composición de la interfaz. |
| React 19 y React DOM | Componentes reutilizables, propiedades, estado y efectos. |
| React Router | Navegación de cliente entre las rutas de EV1. |
| Bootstrap 5 | Grilla responsiva, navegación, formularios, botones y componentes visuales. |
| CSS3 | Identidad visual, variables, Flexbox, Grid y media queries. |
| JavaScript | Reglas del carrito, validaciones, datos locales y cálculo de totales. |
| Vite | Servidor de desarrollo y compilación de producción. |
| localStorage | Persistencia del carrito, cupón y órdenes por origen. |
| Jasmine y Karma | Definición y ejecución de las pruebas automatizadas en navegador. |
| React Testing Library y React DOM con act | Montaje de componentes e interacción en las pruebas. |
| Webpack y Babel | Procesamiento de JavaScript y JSX para la suite de Karma. |
| karma-coverage e Istanbul | Instrumentación, medición y generación de reportes de cobertura. |
| Git y GitHub | Control de versiones, colaboración e integración mediante Pull Requests. |
| Vercel | Publicación del frontend compilado. |

### Propuesta de Solución

#### Arquitectura de Carpetas (EV2)

```text
Tienda-Gamehub-en-React/
├── index.html                         # Entrada HTML de la aplicación
├── package.json                       # Dependencias y comandos
├── package-lock.json                  # Versiones resueltas
├── configuracion.vite.js              # Configuración de Vite y React
├── karma.conf.cjs                     # Jasmine, Webpack, Babel y cobertura
├── ERS.md                             # Este documento
├── REPORTE-COBERTURA-TESTING.md         # Casos y cobertura por archivo
├── README.md                          # Instalación, ejecución y rutas
├── public/
│   └── images/                        # Productos, logo y miniatura de video
├── src/
│   ├── principal.jsx                  # Montaje de React, Router y proveedor
│   ├── Aplicacion.jsx                 # Declaración de rutas
│   ├── estilos.css                    # Estilos compartidos
│   ├── componentes/                   # Navegación, productos y formularios
│   ├── contexto/                      # ProveedorCarrito y usarCarrito
│   ├── datos/                         # Productos y ubicaciones simuladas
│   ├── servicios/                     # Almacenamiento, carrito y órdenes
│   ├── utilidades/                    # Moneda y cálculo de totales
│   ├── vistas/                        # Inicio, catálogo, carrito, pago y órdenes
│   └── test/
│       └── index.js                   # Importa 11 archivos *.pruebas.*
├── pruebas-karma/                     # 9 archivos *.spec.js, con 10 casos
├── coverage/                         # Reportes generados; excluidos de Git
└── dist/                             # Compilación generada; excluida de Git
```

Los once archivos `*.pruebas.js` y `*.pruebas.jsx` están junto a componentes, servicios, utilidades y vistas. El punto de entrada `src/test/index.js` los reúne para Karma. La configuración también carga `pruebas-karma/**/*.spec.js`.

#### Flujo de Datos

1. **Carga Inicial**
   - `index.html` carga `src/principal.jsx`.
   - React DOM monta la aplicación con `BrowserRouter` y `ProveedorCarrito`.
   - Se incorporan Bootstrap y la hoja de estilos compartida.
   - El proveedor inicializa el carrito desde `gamehub_carrito` o una lista vacía.

2. **Navegación entre Vistas**
   - React Router selecciona la vista sin recargar un archivo HTML independiente por cada ruta.
   - `Estructura` mantiene los elementos comunes y actualiza el título según la ruta.
   - El contador de artículos se calcula desde el contexto del carrito.

3. **Interacción con el Catálogo**
   - `src/datos/productos.js` contiene los productos y ubicaciones simuladas.
   - `Catalogo` gestiona filtros, ordenamiento y cantidad visible mediante estado React y valores derivados.
   - Cada `TarjetaProducto` recibe el producto y el callback de agregar por propiedades.
   - El servicio comprueba existencia y stock; el proveedor actualiza el estado y persiste el resultado.

4. **Gestión del Carrito**
   - `ElementoCarrito` controla la entrada de cantidad y notifica cambios o eliminación al proveedor.
   - El proveedor actualiza los artículos y los guarda en `gamehub_carrito`.
   - `Carrito` aplica el código del cupón y conserva su código y porcentaje en `gamehub_cupon`.
   - `calcularTotales` obtiene subtotal, descuento y total; los componentes de resumen los presentan.
   - Vaciar el carrito elimina sus artículos y el cupón almacenado.

5. **Proceso de Checkout**
   - `Pago` bloquea el flujo si no hay artículos y controla los datos del formulario.
   - Al seleccionar una región se actualizan las comunas disponibles y se limpia la selección anterior.
   - Al enviar, se comprueban todos los campos antes de crear una orden.
   - `servicioOrdenes` persiste la orden simulada. Después se limpian carrito y cupón y se presenta la confirmación.

6. **Historial de Órdenes**
   - `Ordenes` obtiene `gamehub_ordenes` y presenta los registros o un estado vacío.
   - La fecha y el importe se presentan con formato local chileno.

#### Cómo se Mantiene el Estado del Carrito

| Clave de localStorage | Contenido |
|---|---|
| `gamehub_carrito` | Arreglo de artículos con `id`, `nombre`, `precio`, `cantidad`, `stockMaximo` e `imagen`. |
| `gamehub_cupon` | Objeto con `codigo` y `descuento`. |
| `gamehub_ordenes` | Arreglo de órdenes con `numero`, `fecha`, `total` y `estado`. |

- Las estructuras se serializan y leen como JSON mediante `almacenamiento.js`.
- El contexto mantiene sincronizadas las vistas de la misma aplicación mediante estado React.
- El proveedor escucha el evento `storage` para volver a cargar el carrito cuando otra pestaña del mismo origen modifica su clave. Este mecanismo no implementa sincronización completa de cupones u órdenes.
- Si una clave no existe, se utiliza el valor alternativo correspondiente.
- Un JSON inválido genera actualmente un error de lectura. Existe una prueba que verifica ese comportamiento; no se declara recuperación automática de datos corruptos.

#### Pruebas y Resultados Verificados

**Verificación registrada el 27 de octubre de 2026:** 64 pruebas aprobadas de 64 ejecutadas y compilación de producción correcta.

La suite reúne 54 casos importados desde `src/test/index.js` y los siguientes diez casos de `pruebas-karma`:

| N.º | Caso diseñado | Archivo |
|---|---|---|
| 1 | Calcular el subtotal de artículos con distintas cantidades. | `calcularSubtotal.spec.js` |
| 2 | Incrementar un producto existente sin duplicarlo. | `servicioCarrito.spec.js` |
| 3 | Limitar la cantidad al stock máximo. | `servicioCarrito.spec.js` |
| 4 | Calcular descuentos con tope en la función del servicio y observar la persistencia con un espía. | `aplicarCupon.spec.js` |
| 5 | Aceptar una fecha vigente y rechazar períodos vencidos o futuros en la función de vigencia. | `cuponVigente.spec.js` |
| 6 | Restar descuentos sin generar un total negativo. | `calcularTotal.spec.js` |
| 7 | Mostrar un producto agotado y deshabilitar su botón de agregar. | `TarjetaProducto.spec.js` |
| 8 | Mostrar el mensaje de carrito vacío en el componente de resumen. | `ResumenCarrito.spec.js` |
| 9 | Bloquear la confirmación sin dirección y habilitar el botón al ingresarla. | `FormularioCheckout.spec.js` |
| 10 | Ordenar reseñas por fecha y calcular su promedio. | `ListaResenas.spec.js` |

Los otros 54 casos comprueban servicios de carrito, almacenamiento y órdenes; utilidades; componentes; sincronización del proveedor; catálogo; carrito; historial y pago. Se utilizan pruebas aisladas y pruebas de componentes con interacción. El resultado de 64 casos aprobados acredita la suite ejecutada, pero su correspondencia completa con el listado obligatorio debe cotejarse con la pauta del docente.

| Métrica de cobertura | Resultado |
|---|---:|
| Sentencias | 92,94 % — 224 de 241 |
| Ramas | 85,80 % — 133 de 155 |
| Funciones | 97,53 % — 79 de 81 |
| Líneas | 92,72 % — 204 de 220 |

El detalle por archivo se encuentra en `REPORTE-COBERTURA-TESTING.md`. Los porcentajes corresponden al código instrumentado cargado por las pruebas; las vistas de inicio y estructura/navegación no aparecen en ese reporte. No existe un umbral mínimo de cobertura configurado que haga fallar la ejecución.

#### Instalación, Ejecución y Compilación

Con Node.js y npm instalados, desde la raíz del proyecto:

```bash
npm install
npm run dev
```

Abrir la dirección que indique Vite. Para verificar y compilar:

```bash
npm run pruebas
npm run cobertura
npm run compilar
```

- `pruebas` ejecuta Jasmine mediante Karma y también genera cobertura.
- `cobertura` ejecuta la suite con los reporteros de cobertura.
- `compilar` genera `dist/` e incluye las imágenes de `public/images/`.
- `npm run test:watch` mantiene la suite activa durante el desarrollo.
- Los reportes se generan en `coverage/html/index.html`, `coverage/lcov.info` y la salida de la terminal.
- En Windows, la configuración intenta utilizar Edge si `CHROME_BIN` no está definido y encuentra una instalación en las rutas previstas. En otros entornos debe estar disponible un navegador compatible con el lanzador configurado.

#### Estado de EV2 y Pendientes

| Elemento | Estado documentado |
|---|---|
| Migración a React, componentes, hooks y rutas | Implementada. |
| Bootstrap y presentación responsiva | Implementados; revisión visual local a 360, 768 y 1280 px. |
| Catálogo, carrito, checkout e historial simulados | Implementados con almacenamiento local. |
| Imágenes originales y recursos públicos | Conservados en `public/images/` e incluidos en la compilación. |
| Jasmine, Karma, Webpack, Babel, espías y cobertura | Configurados; 64 pruebas aprobadas en la ejecución registrada. |
| Documento de cobertura por archivo | Disponible en `REPORTE-COBERTURA-TESTING.md`. |
| Topes monetarios de cupones | La función del servicio está probada; falta conectarla al subtotal real y al importe mostrado por carrito y pago. |
| Vigencia por fechas de los cupones | La función `cuponVigente` está probada; no está incorporada a la aplicación de cupones del flujo de compra. |
| Reseñas | `ListaResenas` existe y está probado de forma aislada; no se presenta actualmente en las vistas de la tienda. |
| Revisión del listado obligatorio de pruebas | Pendiente de cotejo con la pauta completa. |
| Compatibilidad entre navegadores y accesibilidad integral | Verificación adicional pendiente. |

Los elementos pendientes no se presentan como funcionalidades terminadas. Antes de entregar se debe cotejar la pauta completa, revisar el despliegue final y preparar el proyecto comprimido y los documentos en el formato solicitado por el docente.

#### Consideraciones para EV3

- Sustituir progresivamente los datos y servicios simulados por llamadas a API REST de microservicios Spring Boot.
- Incorporar autenticación y autorización con JWT y validaciones en el servidor según el alcance de EV3.
- Gestionar pedidos, stock y persistencia en el backend, en lugar de depender de `localStorage` como fuente de verdad.
- Evaluar la integración de pagos, notificaciones y seguimiento solo si forman parte de los requisitos de la siguiente evaluación.

---

*La versión 2 conserva la estructura del ERS de EV1 y la actualiza a la arquitectura, las pruebas y el estado real de GameHub Store para EV2. Los resultados registrados corresponden a las verificaciones realizadas el 27 de octubre de 2026.*
