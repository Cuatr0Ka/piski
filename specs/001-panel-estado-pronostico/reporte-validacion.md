# Reporte de validación: Panel de monitoreo (MVP)

Resultados de las validaciones de `quickstart.md`, hechas el **2026-10-16** sobre `dist/index.html` (447 KB, un solo archivo). Las comprobaciones en navegador se hicieron con **Chrome real** abierto como archivo local (`file:///…/dist/index.html`) y **con la red bloqueada** (`--host-resolver-rules="MAP * ~NOTFOUND"`), manejado por su protocolo de depuración. El script de validación no forma parte del proyecto.

## Resumen

| Validación | Resultado |
|---|---|
| 1. Pruebas automáticas | **Pasa**: 34 archivos y 261 pruebas; tipos estrictos sin errores |
| 2. Abre con doble clic | **Pasa** en esta computadora; **falta repetirla en otra sin Node** |
| 3. Flujo de la demostración | **Pasa**: 18 pantallas y escenarios, 57 comprobaciones de texto |
| 4. "Ahora" fijo y umbrales | **Pasa** |
| 5. Comparación con las maquetas | **Pasa** (revisión visual de 9 variantes a 1440 × 900) |
| 6. Accesibilidad básica | **Pasa en lo verificable**; **falta la prueba con lector de pantalla real** |

## Validación 1: pruebas automáticas (T108)

- `npm test`: 32 archivos, **261 pruebas**, todas pasan. Incluyen la tabla de **20 casos de clasificación** (C01–C20) y la de **20 casos del pronóstico** (P01–P20), calculadas a mano; ningún resultado esperado se ajustó para que "pase".
- `npm run typecheck` (TypeScript estricto): sin errores.
- Pruebas de guardia: hex de estado definidos una sola vez, sin `text-shadow`, `drop-shadow`, degradados ni sombras con desenfoque, sin colores ni tamaños de letra sueltos, y ninguna función lee el reloj real.

## Validación 2: la entrega abre con doble clic (T065)

| Comprobación | Resultado |
|---|---|
| `npm run build` | Correcto: un solo `dist/index.html` de 447 KB (meta deseable: menos de 1 MB) |
| `npm run verify:dist` | "Entrega verificada: un solo archivo, sin recursos externos" |
| Abrir como archivo local con la red bloqueada | Abre y muestra el escenario completo |
| Solicitudes de red al cargar | 2, ambas `file:` o `data:` (ninguna externa) |
| Errores en la consola | 0 |
| Tipografía Inter | Incrustada como `data:font/woff2` y cargada |

La verificación de direcciones permite cuatro cadenas que son texto dentro de las bibliotecas y no solicitudes (espacio de nombres SVG, enlaces de ayuda de errores de React, e identificadores de esquema y una plantilla de dirección dentro de Zod). Con la red bloqueada el panel funciona igual, lo que confirma que ninguna es una dependencia.

**Pendiente**: repetir esta prueba en una computadora distinta, sin Node ni el proyecto, haciendo doble clic en el archivo copiado (esta computadora ya tiene el entorno de desarrollo).

## Validación 3: flujo de la demostración (T108)

Se recorrieron, cambiando de pantalla y de escenario, los 13 escenarios que cubren el flujo de la sección 4 del sprint. **Las 57 comprobaciones de texto pasaron**, entre ellas:

- Tormenta normal: Normal, "Paso seguro", "Última lectura hace 3 min" y el mensaje de ejemplo; Pronóstico "Sin pronóstico de creciente" (estable).
- Ciclón, inicio: Pronóstico "Podría llegar a Revisar entre 2.5 y 3.5 h", "No se proyecta en las próximas 6 h" y "entre 576 y 630 mm en 3 h", con la nota "Proyección, no medición" y el aviso de lluvia.
- Ciclón, Revisar y No cruzar: estados y mensajes correctos; Pronóstico "Ya superó Revisar. Podría llegar a No cruzar entre 2 y 3.5 h" y "Ya superó No cruzar".
- Estiaje y nivel que baja: "El nivel está bajando"; pocas lecturas: "Hay 3 lecturas y se necesitan al menos 6"; lecturas viejas: **Sin datos** (nunca "Paso seguro") y "Sin pronóstico: datos viejos".
- Lectura espuria: el estado no cambia. Lecturas imposibles: "Se descartaron 2 lecturas fuera de rango".
- "Datos simulados" visible en todas las pantallas; cambiar de pantalla y de escenario **no recarga** la página.

## Validación 4: "ahora" fijo y umbrales (T108)

- **"Ahora" fijo (SC-010)**: con tiempo virtual se adelantó el reloj **30 minutos** con el escenario "Ciclón: nivel en Revisar" abierto. El estado ("Revisar") y la antigüedad ("Última lectura hace 3 min") quedaron idénticos.
- **Cambio de umbral (SC-007)**: se cambió `stop_mm` de 85 a 120 (y `crossing_mm` a 130) en el `config.json` de "Ciclón: nivel en No cruzar", con el nivel en 910 mm. Tras reconstruir, el estado pasó de **No cruzar a Revisar** ("Faltan 290 mm para No cruzar") sin tocar el código. Se restauró el escenario y se regeneró.

## Validación 5: comparación con las maquetas (T107)

Capturas de 1440 × 900 de **9 variantes** (Estado actual: Normal, Revisar, No cruzar y Sin datos; Pronóstico: subiendo, Revisar superado, bajando, pocas lecturas y datos viejos) revisadas contra `docs/design/`. La composición, la jerarquía y los tamaños relativos coinciden: dos columnas 7/12 y 5/12 en Estado actual, conclusión 4/12 y gráfica 8/12 en Pronóstico, la frase de conclusión como lo más grande, sombra solo en el bloque principal y en el botón principal, y la barra de navegación con la pantalla activa rellena.

Diferencias de contenido aceptadas (no de composición): el escenario "Ciclón: inicio" da Revisar "entre 2.5 y 3.5 h" y no "entre 2.5 y 4 h" de la maqueta, porque el "ahora" queda 3 minutos después de la última lectura y el nivel de partida se estima en el "ahora" (ver `docs/decisiones.md`).

## Validación 6: accesibilidad básica (T106, T110)

| Comprobación | Resultado |
|---|---|
| Contraste del tema claro contra las tablas del sistema de diseño | **Pasa** (11 pruebas automáticas: texto 4.5:1; bordes, anillo de foco y borde discontinuo 3:1). En el tema oscuro, la excepción documentada de `stop-text` sobre `surface-sunken` (4.48:1) |
| Controles de al menos 40 px de alto (medido en Chrome) | **Pasa**: 40 px (botones, selector y desplegable) y 60 px (navegación) |
| Navegación con teclado | **Pasa**: con Tab se recorren la navegación, el selector y "Copiar mensaje" |
| Foco visible | **Pasa**: contorno sólido de 3 px en cada control enfocado |
| Sin animaciones ni transiciones | **Pasa**: 0 elementos con transición o animación (medido en Chrome) |
| Estado legible sin color | Forma, ícono y palabra en cada estado (probado con pruebas de componentes); la revisión en escala de grises es visual |
| Lector de pantalla real (NVDA o Narrador) | **Pendiente (T110)**: no se pudo probar aquí. El estado lleva `role="status"` y `aria-live="polite"`, y la gráfica tiene su tabla alternativa, pero hay que confirmarlo con un lector real |

## Mediciones (T109)

| Medida | Resultado | Meta |
|---|---|---|
| Abrir un escenario completo (de la navegación a la pantalla con datos, en Chrome) | **~210 ms** (204–222 ms en tres corridas) | < 5 s (SC-011) |
| Cambiar de escenario con el selector (1 interacción) | **~14 ms** (13–16 ms) | < 3 s y a lo sumo 2 interacciones (SC-002) |
| Tamaño de la entrega | **447 KB** (un archivo, con la tipografía incrustada) | < 1 MB (deseable) |
| Escenario, estado y pronóstico tras 30 min de reloj | sin cambios | sin cambios (SC-010) |

## Cambio posterior: mm y lluvia (2026-10-16)

Todo el panel pasó a mm y se agregó la tarjeta "Lluvia" (acumulado por ventana). Tras el cambio: 261 pruebas verdes, tipos sin errores, `dist/index.html` de 453 KB verificado y 57 comprobaciones en Chrome real. La composición de Estado actual pasó de 4 a 5 elementos y fue **aprobado por el usuario el 2026-10-16** y las maquetas ya lo reflejan.

## Pendientes

1. **T110**: probar con un lector de pantalla real.
2. Repetir la prueba del doble clic en una computadora sin Node ni el proyecto.
3. Interruptor de tema oscuro: sigue fuera del MVP hasta que una maqueta lo incluya (excepción anotada en `docs/decisiones.md`).
