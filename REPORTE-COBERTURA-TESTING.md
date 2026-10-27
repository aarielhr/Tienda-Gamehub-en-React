# Reporte de cobertura de testing

## Resumen

La suite automatizada se ejecuta con **Karma, Jasmine, Webpack e Istanbul**. Karma abre Chrome Headless y reúne los resultados de las pruebas unitarias y de componentes.

Última ejecución registrada: **26 de octubre de 2026**.

| Métrica | Resultado |
|---|---:|
| Pruebas aprobadas | 54 de 54 |
| Sentencias cubiertas | 93,11 % (203 de 218) |
| Líneas cubiertas | 93,15 % (177 de 190) |
| Funciones cubiertas | 97,29 % (72 de 74) |
| Ramas cubiertas | 87,59 % (120 de 137) |

Estos porcentajes describen el código instrumentado que se cargó al ejecutar las pruebas; no deben interpretarse como cobertura exhaustiva de toda la aplicación. La configuración actual no establece un mínimo de cobertura que haga fallar la ejecución.

## Áreas verificadas

| Área | Pruebas incluidas |
|---|---|
| Carrito | Agregar, actualizar, quitar y vaciar productos; validar cupones y guardar cambios en `localStorage`. |
| Órdenes | Crear y conservar órdenes previas, y presentar el historial persistido. |
| Almacenamiento | Serializar y leer valores, usar valores alternativos y manejar JSON inválido. |
| Utilidades | Calcular subtotal, descuento y total; limitar descuentos y formatear moneda. |
| Proveedor del carrito | Registrar y retirar el listener `storage`, y sincronizar el carrito. |
| Tarjeta de producto | Espiar el callback de agregar y controlar el temporizador con el reloj de Jasmine. |
| Catálogo | Mostrar productos, cargar más, ordenar, filtrar y validar rangos de precio. |
| Pago | Mostrar errores de validación y completar una compra con cupón y persistencia de la orden. |

Las pruebas usan `jasmine.createSpy`, `spyOn` y `jasmine.clock()` para observar o controlar callbacks, almacenamiento, manejadores de eventos y temporizadores.

## Archivos de pruebas

- `src/servicios/servicioCarrito.pruebas.js`
- `src/servicios/servicioOrdenes.pruebas.js`
- `src/servicios/almacenamiento.pruebas.js`
- `src/utilidades/formato.pruebas.js`
- `src/componentes/ElementoCarrito.pruebas.jsx`
- `src/componentes/ProveedorCarrito.pruebas.jsx`
- `src/componentes/TarjetaProducto.pruebas.jsx`
- `src/vistas/Carrito.pruebas.jsx`
- `src/vistas/Catalogo.pruebas.jsx`
- `src/vistas/Ordenes.pruebas.jsx`
- `src/vistas/Pago.pruebas.jsx`

El punto de entrada `src/test/index.js` importa estos archivos para que Karma los ejecute.

## Ejecución y reportes

Desde la raíz del proyecto:

```powershell
npm run pruebas
```

Para correr la suite y generar los reportes:

```powershell
npm run cobertura
```

Los reportes de cobertura se guardan en:

- HTML: `coverage/html/index.html`
- LCOV: `coverage/lcov.info`
- Resumen en texto: salida del comando en la terminal.

También se puede usar `npm run test:watch` para mantener Karma activo mientras se modifican archivos.

## Cobertura pendiente

La suite verifica flujos importantes, pero no cubre todos los componentes, páginas ni casos límite. Se recomienda agregar pruebas para:

- La vista de inicio y el componente de estructura/navegación, incluidos el título de página y el aviso temporal.
- Los casos restantes del proveedor: agregar, actualizar, quitar y vaciar productos, y el error al usar el contexto fuera del proveedor.
- Casos adicionales de validación de pago y errores del almacenamiento.
- Ramas límite adicionales del catálogo, el stock y el cálculo de descuentos.

Conviene revisar `coverage/html/index.html` después de cada ejecución para identificar líneas y ramas no cubiertas. Un porcentaje alto no sustituye la revisión de la calidad de las aserciones ni garantiza que todos los comportamientos relevantes estén probados.
