# GameHub Store

Tienda de hardware y periféricos migrada a React para EP2. El catálogo, carrito, checkout y órdenes usan datos simulados y `localStorage`; la navegación se realiza del lado del cliente y mantiene las rutas `.html` definidas en EP1.

## Requisitos

- Node.js 20.19+ o 22.12+
- npm

## Instalación y ejecución

```bash
npm install
npm run desarrollo
```

Abre la URL que muestra Vite (normalmente `http://localhost:5173`). Para validar la compilación de producción ejecuta `npm run compilar`; para las pruebas unitarias ejecuta `npm run pruebas`.

## Estructura

```text
├── src/
│   ├── componentes/  # Navegación, tarjetas, líneas del carrito y resumen
│   ├── contexto/     # Estado compartido del carrito
│   ├── datos/        # Productos y regiones simulados
│   ├── servicios/    # Persistencia local, carrito y órdenes simuladas
│   ├── utilidades/   # Formateo de moneda y cálculo de totales
│   └── vistas/       # Inicio, catálogo, carrito, pago e historial
├── configuracion.vite.js # Configuración de Vite y Vitest
├── package.json          # Dependencias y comandos
├── index.html            # Entrada de la aplicación
└── images/               # Imágenes y recursos gráficos
```

Los componentes, vistas, servicios, utilidades, pruebas y archivos de configuración propios usan nombres en español. Los módulos de datos/servicios/utilidades mantienen extensión `.js` porque son JavaScript sin marcado; la interfaz React usa `.jsx`. `package.json`, `index.html` y `.gitignore` mantienen sus nombres requeridos por las herramientas. Los nombres de API propios de React, Bootstrap, Vite y npm se conservan como los define cada herramienta.

## Rutas

- `/` e `/index.html`: inicio
- `/catalogo.html`: catálogo, filtros, orden y carga incremental
- `/carrito.html`: gestión del carrito y cupones (`SETUP2026`, `DUOC10`)
- `/checkout.html`: despacho, validación, pago simulado y confirmación
- `/ordenes.html`: historial de compras

El diseño usa la grilla y componentes de Bootstrap y se adapta a móviles, tablets y escritorio.
