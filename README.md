# GameHub Store

Tienda de hardware y periféricos desarrollada con **React**, **React Router**, **Bootstrap 5** y **Vite**. Esta rama continúa la aplicación de EV2 e integra la interfaz con los microservicios Spring Boot de EV3 a través del API Gateway.

## Requisitos

- Node.js 20.19+ (o 22.12+)
- npm
- Backend de referencia iniciado; el API Gateway escucha por defecto en `http://localhost:8080`

## Instalación y ejecución

```bash
npm install
npm run dev
```

Vite informa la dirección local, normalmente `http://localhost:5173`. Antes de ejecutar el frontend, inicia el backend siguiendo las instrucciones de su [repositorio](https://github.com/Lukazez/GameHubStore-Backend-) y comprueba que Eureka y el API Gateway estén disponibles.

### Gateway

La aplicación manda todas las llamadas al Gateway (no directamente a cada microservicio). La URL se configura con `VITE_API_URL`; `.env.example` muestra el valor local recomendado:

```dotenv
VITE_API_URL=http://localhost:8080
```

Vite lee las variables de entorno al arrancar. Si se cambia `.env`, reinicia `npm run dev`. En un despliegue, configura `VITE_API_URL` con la URL pública del Gateway y permite el origen del frontend en CORS en el backend.

## Funcionalidades EV3

- Registro e inicio de sesión contra `/api/auth`, persistencia de la sesión JWT y renovación antes de expirar.
- Envío del token mediante `Authorization: Bearer ...`; los errores HTTP se presentan en la interfaz.
- Rutas y navegación según roles `CLIENTE`, `OPERADOR` y `ADMIN`. La protección en el frontend complementa la autorización que hace el backend; no la sustituye.
- Catálogo y detalle con productos, categorías, stock del inventario y resumen de reseñas.
- Carrito persistente compatible con los datos locales existentes de EV2; validación de precio, stock y cupón en el backend antes de pagar.
- Checkout con precarga del perfil, creación de órdenes y pago simulado; historial y seguimiento para el cliente.
- Panel de operador para pagos, despachos, inventario y garantías; panel de administración para productos, categorías, promociones, reseñas y usuarios.

## Pruebas y compilación

```bash
npm run compilar
npm run pruebas
npm run cobertura
```

Karma ejecuta Jasmine en Chrome Headless. En Windows donde esté instalado Edge y no Chrome, se puede seleccionar Edge indicando `CHROME_BIN` desde Git Bash, por ejemplo:

```bash
CHROME_BIN='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' npm run pruebas
```

Las pruebas generan el reporte HTML en `coverage/html/index.html` y el resumen en `coverage/por-archivo.txt`. Las pruebas unitarias de EV2 y de la integración EV3 se ejecutan juntas. La cobertura se informa como referencia; debe ampliarse especialmente en los módulos del catálogo, carrito y órdenes integrados con el backend.

## Rutas principales

- `/` y `/index.html`: portada.
- `/catalogo.html`, `/catalogo`: catálogo; admite búsqueda y filtro de categoría.
- `/producto/:id`: ficha y reseñas del producto.
- `/carrito.html`, `/carrito`: carrito.
- `/acceso`: inicio de sesión y registro de clientes.
- `/checkout.html`, `/checkout`: checkout (rol `CLIENTE`).
- `/ordenes.html`, `/mis-ordenes`: historial (rol `CLIENTE`).
- `/ordenes/:id/confirmacion`: detalle de pago y despacho (rol `CLIENTE`).
- `/operador`: panel de operación (roles `OPERADOR` y `ADMIN`).
- `/admin`: administración (rol `ADMIN`).

## Datos de prueba del backend

Las cuentas demostrativas del backend incluyen `ana@gamehub.test` (ADMIN), `luis@gamehub.test` (OPERADOR) y `camila@gamehub.test` (CLIENTE). La contraseña inicial es `clave123` según las semillas de desarrollo. La lista de cuentas y las reglas de los pagos están en los datos semilla y el [README del backend de referencia](https://github.com/Lukazez/GameHubStore-Backend-). También puedes crear una cuenta de cliente desde `/acceso`. El método de pago es simulado por el backend, no se procesa dinero real.

## Estado de verificación en este entorno

- `npm run compilar`: correcto; Vite advierte que el bundle JS principal supera 500 kB.
- `npm run pruebas` en Microsoft Edge: **114 pruebas correctas**. La cobertura total medida es 81,37 % de sentencias, 71,33 % de ramas, 82,86 % de funciones y 85,16 % de líneas; conviene ampliar las pruebas de las funcionalidades integradas.
- No se pudo ejecutar el backend localmente en este entorno porque Java/Maven/Docker no están disponibles. La integración en vivo depende de iniciar el backend y apuntar `VITE_API_URL` al Gateway.
