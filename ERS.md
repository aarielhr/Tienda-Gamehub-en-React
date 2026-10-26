# Documento ERS - Versión 1
## GameHub Store - Frontend

### Integrantes
- [Nombre Integrante 1]
- [Nombre Integrante 2]
- [Nombre Integrante 3] (opcional, si aplica)

### Requisitos Funcionales
1. **Visualización del Catálogo**
   - Mostrar lista de productos con imagen, nombre, precio y stock.
   - Permitir filtrado por categoría, marca y rango de precio.
   - Ordenar productos por nombre (A-Z/Z-A) y precio (ascendente/descendente).
   - Carga incremental de productos ("Cargar más").

2. **Gestión del Carrito de Compras**
   - Agregar productos al carrito desde el catálogo.
   - Modificar cantidad de productos en el carrito (con límites de stock).
   - Eliminar productos del carrito.
   - Vaciar carrito completo.
   - Mostrar resumen con subtotal, descuento y total.
   - Aplicar cupones de descuento válidos (ej. SETUP2026, DUOC10).
   - Persistir estado del carrito entre vistas usando `localStorage`.

3. **Proceso de Checkout**
   - Validar que el carrito no esté vacío antes de proceder.
   - Recopilar datos de despacho: nombre, correo, teléfono, región, comuna, dirección.
   - Seleccionar método de pago (tarjeta, transferencia, contraentrega).
   - Validar todos los campos en el cliente antes del envío.
   - Mostrar resumen de la orden con descuento aplicado.
   - Simular confirmación de compra y generar número de orden.
   - Vaciar carrito tras compra exitosa.

4. **Historial de Órdenes**
   - Mostrar lista de órdenes realizadas (número, fecha, total, estado).
   - Permitir volver al catálogo para nuevas compras.

5. **Navegación y Diseño Consistente**
   - Menú de navegación común en todas las páginas (Inicio, Catálogo, Carrito, Checkout, Mis Órdenes).
   - Footer informativo con copyright y contacto.
   - Diseño responsivo que se adapta a móvil y escritorio.

### Requisitos No Funcionales
1. **Compatibilidad**
   - Compatibilidad con navegadores modernos: Chrome, Firefox, Safari, Edge (últimas versiones).
   - Soporte para dispositivos móviles y tablets (diseño responsivo).

2. **Usabilidad y Accesibilidad**
   - Interfaz intuitiva con retroalimentación visual (hover, focus, estados de carga).
   - Mensajes de error claros y asociados a los campos correspondientes.
   - Uso de atributos `label for`, `aria-label` y texto oculto para lectores de pantalla donde sea necesario.
   - Contraste de colores adecuado según normas WCAG AA.

3. **Rendimiento**
   - Carga eficiente de recursos (CSS, JS, imágenes optimizadas).
   - Minimizar manipulaciones del DOM innecesarias.
   - Uso de `localStorage` para persistencia ligera del estado del carrito.

4. **Mantenibilidad y Calidad de Código**
   - Código JavaScript modular y legible.
   - Uso de variables CSS para facilitar cambios de tema.
   - Comentarios explicativos en funciones críticas.
   - Estructura de carpetas organizada.

5. **Seguridad (Frontend)**
   - No almacenar datos sensibles (tokens, contraseñas) en `localStorage`.
   - Validación de entrada en el cliente para prevenir datos malformados.
   - Las contraseñas y autenticación se manejarán en EP3 mediante JWT en el backend.

### Herramientas Seleccionadas
- **HTML5**: Estructura semántica y accesible.
- **React**: Vistas y componentes reutilizables con estado mediante hooks.
- **Bootstrap 5**: Sistema de grilla y componentes responsivos.
- **JavaScript**: Lógica de interacción, validación de formularios y gestión de estado.
- **localStorage**: Persistencia del carrito y cupones entre vistas y recargas.
- **Vitest y React Testing Library**: Pruebas unitarias de servicios, utilidades y vistas.
- **Git**: Control de versiones con commits descriptivos y ramas por integrante o funcionalidad.

### Propuesta de Solución

#### Arquitectura de Carpetas (EP2)
```
/Gamehub-Store
│
├── index.html          # Punto de entrada de Vite y React
├── src/
│   ├── componentes/    # Navegación, productos, carrito y resumen
│   ├── contexto/       # Estado compartido del carrito
│   ├── datos/          # Catálogo y ubicaciones simuladas
│   ├── servicios/      # Persistencia, reglas del carrito y órdenes
│   ├── utilidades/     # Formateo y cálculo de totales
│   └── vistas/         # Vistas React para las rutas de EP1
├── package.json        # Dependencias y comandos
├── configuracion.vite.js # Configuración de Vite y Vitest
└── images/             # Carpeta de imágenes de productos
    ├── mouse-ajazz.jpg
    ├── Pad Mouse ATK Sky XSoft.jpg
    ├── Monitor ASUS TUF 24.jpg
    ├── Teclado Ajazz AK820.avif
    ├── Tarjeta Gráfica ASUS RTX 4060.jpg
    └── mouse-atk-blazing.jpg
```

#### Flujo de Datos
1. **Carga Inicial**
   - Vite carga la aplicación React desde `src/principal.jsx`, con Bootstrap y React Router.
   - El contexto del carrito inicializa su estado desde `gamehub_carrito` en `localStorage`.

2. **Navegación entre Vistas**
   - React Router navega en cliente entre las mismas rutas: `/index.html`, `/catalogo.html`, `/carrito.html`, `/checkout.html` y `/ordenes.html`.
   - Los servicios leen y guardan carrito, cupón y órdenes en `localStorage`; el contexto mantiene sincronizado el contador.

3. **Interacción con el Catálogo**
   - `src/datos/productos.js` contiene los productos simulados.
   - La vista `Catalogo` gestiona filtros, ordenamiento y carga incremental con estado React.
   - El componente reutilizable `TarjetaProducto` recibe el producto por propiedades y delega la acción de agregar al contexto del carrito.

4. **Gestión del Carrito**
   - `ProveedorCarrito` sincroniza las acciones del carrito con `localStorage`.
   - `ElementoCarrito` gestiona la cantidad con estado React y limita el valor al stock disponible.
   - `servicioCarrito` valida cupones y persiste `gamehub_cupon`; los totales se calculan con `src/utilidades/formato.js`.

5. **Proceso de Checkout**
   - La vista `Pago` impide avanzar cuando el carrito está vacío y valida los campos de despacho, región/comuna y pago.
   - `servicioOrdenes` guarda una orden simulada. Tras una compra correcta, se limpian carrito y cupón y se muestra la confirmación.

6. **Historial de Órdenes**
   - La vista `Ordenes` lee `gamehub_ordenes` y muestra una tabla responsiva o el mensaje de historial vacío.

#### Cómo se Mantiene el Estado del Carrito
- El carrito se almacena como un arreglo de objetos en `localStorage` bajo la clave `gamehub_carrito`.
- Cada objeto representa un producto en el carrito y contiene: `id`, `nombre`, `precio`, `cantidad`, `stockMaximo` y `imagen`.
- Toda operación que modifica el carrito (agregar, cambiar cantidad, quitar, vaciar) actualiza este arreglo en `localStorage` y luego vuelve a renderizar la vista afectada.
- El contexto carga inicialmente el carrito desde `localStorage` y escucha eventos `storage` para sincronizar pestañas.

#### Consideraciones para EP2 y EP3
- EP2 migra las vistas a React con Bootstrap y cubre servicios, utilidades y vistas con pruebas unitarias de Vitest (`npm run pruebas`).
- En EP3, reemplazar los datos simulados y `localStorage` por llamadas a API REST de microservicios Spring Boot, autenticación JWT y manejo de sesiones en el backend.

---
*Este documento constituye la propuesta inicial (versión 1) para el desarrollo del frontend de GameHub Store. Puede ser actualizado conforme avance el proyecto y se reciban retroalimentaciones del docente o asistentes.*