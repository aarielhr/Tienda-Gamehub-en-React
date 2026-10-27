# Reporte de cobertura de testing — GameHub Store

## Entorno y ejecución

Fecha de verificación: 27 de octubre de 2026.

La suite utiliza Jasmine y Karma, con Webpack y Babel para procesar JavaScript y JSX. La cobertura se obtiene mediante instrumentación Istanbul y `karma-coverage`.

Las pruebas se ejecutaron en Edge 156 sobre Windows 10, mediante el lanzador basado en Chrome Headless.

Comandos verificados:

```bash
npm run pruebas
npm run compilar
```

Resultado: **64 pruebas ejecutadas y aprobadas, sin fallos**. La compilación de producción con Vite también finalizó correctamente.

## Alcance y casos diseñados

La configuración integra las pruebas importadas por `src/test/index.js` y los archivos `pruebas-karma/**/*.spec.js`.

La suite reúne 54 casos de la suite incorporada desde `main` y 10 casos de `lukas`.

Las áreas comprobadas incluyen:

- **Carrito:** agregar productos, incrementar cantidades sin duplicarlos, respetar stock, actualizar cantidades, quitar artículos, vaciar el carrito y persistir cambios.
- **Cupones y totales:** calcular subtotal, descuentos y total; rechazar códigos desconocidos; comprobar topes de descuento en el servicio, vigencia por fechas y totales no negativos.
- **Componentes:** mostrar productos y estados sin stock, controlar callbacks, presentar el resumen del carrito y bloquear la confirmación sin dirección.
- **Reseñas:** ordenar por fecha y calcular la puntuación promedio.
- **Almacenamiento:** leer y serializar datos, usar valores alternativos y comprobar el error ante JSON inválido.
- **Órdenes:** crear y persistir órdenes, conservar las existentes y mostrar el historial.
- **Catálogo:** carga incremental, ordenamiento, filtros y validación del rango de precios.
- **Pago:** validar campos obligatorios, impedir órdenes inválidas y confirmar una compra con descuento.
- **Contexto del carrito:** registrar y retirar el manejador de eventos de almacenamiento y sincronizar el estado.

Se utilizan `jasmine.createSpy`, `spyOn` y `jasmine.clock()` para observar callbacks, simular respuestas y controlar almacenamiento, eventos y temporizadores.

## Resultados generales de cobertura

| Métrica | Porcentaje | Elementos cubiertos |
|---|---:|---:|
| Sentencias | 92,94 % | 224 de 241 |
| Ramas | 85,80 % | 133 de 155 |
| Funciones | 97,53 % | 79 de 81 |
| Líneas | 92,72 % | 204 de 220 |

## Cobertura por archivo

Las rutas de esta tabla son relativas a `src/`.

| Archivo | Sentencias | Ramas | Funciones | Líneas |
|---|---:|---:|---:|---:|
| componentes/ElementoCarrito.jsx | 100 % | 100 % | 100 % | 100 % |
| componentes/FormularioCheckout.jsx | 100 % | 50 % | 100 % | 100 % |
| componentes/ListaResenas.jsx | 87,50 % | 40 % | 100 % | 87,50 % |
| componentes/ResumenCarrito.jsx | 100 % | 66,66 % | 100 % | 100 % |
| componentes/ResumenOrden.jsx | 100 % | 100 % | 100 % | 100 % |
| componentes/TarjetaProducto.jsx | 100 % | 91,66 % | 100 % | 100 % |
| contexto/ProveedorCarrito.jsx | 75,60 % | 37,50 % | 85,71 % | 74,28 % |
| datos/productos.js | 100 % | 100 % | 100 % | 100 % |
| servicios/almacenamiento.js | 100 % | 100 % | 100 % | 100 % |
| servicios/servicioCarrito.js | 97,05 % | 88,46 % | 100 % | 97,05 % |
| servicios/servicioOrdenes.js | 100 % | 100 % | 100 % | 100 % |
| utilidades/formato.js | 100 % | 100 % | 100 % | 100 % |
| vistas/Carrito.jsx | 100 % | 100 % | 100 % | 100 % |
| vistas/Catalogo.jsx | 92,10 % | 85,71 % | 100 % | 90,90 % |
| vistas/Ordenes.jsx | 100 % | 100 % | 100 % | 100 % |
| vistas/Pago.jsx | 94,44 % | 91,30 % | 100 % | 94,44 % |

## Generación de reportes

```bash
npm run cobertura
```

La configuración también genera cobertura al ejecutar `npm run pruebas`.

Archivos generados:

- HTML: `coverage/html/index.html`.
- LCOV: `coverage/lcov.info`.
- Tabla por archivo y resumen general: salida de la terminal.

Los archivos de pruebas se excluyen de la instrumentación.

## Límites y pendientes

Los porcentajes corresponden al código instrumentado cargado por las pruebas. No representan cobertura exhaustiva de toda la aplicación ni acreditan por sí solos el cumplimiento del listado obligatorio de la evaluación.

Quedan casos por ampliar en el proveedor del carrito, las reseñas, las validaciones de pago y las ramas del catálogo. Las vistas de inicio y estructura/navegación no aparecen en el reporte obtenido.

La comprobación de los topes de descuento y de la vigencia en funciones del servicio no demuestra su aplicación completa en el flujo de compra.

La configuración no exige un porcentaje mínimo para aprobar la ejecución. La revisión visual en anchos de 360, 768 y 1280 píxeles debe realizarse por separado.