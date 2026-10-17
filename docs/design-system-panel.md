<!--
Sistema de diseño del Panel de Monitoreo (Módulo B). Fuente de verdad visual del panel.
Plantilla: design-system.md (Tally). Estilo: Neobrutalismo minimalista (borde oscuro, color sólido y una sombra sólida solo en lo principal).
Los contrastes de las tablas de color se calcularon con la fórmula WCAG 2.x.
-->

# Sistema de diseño del Panel Piski

> Nombre del proyecto: Piski. Las pantallas del panel usan solo los componentes de `src/ui` y los tokens de este documento. Los tokens viven en `src/core/tokens/tokens.ts` y se exponen como variables CSS desde `src/ui/theme/`.

El panel lo consulta un encargado o líder del comité en una computadora de escritorio, a veces de noche durante una tormenta, y con lo que lee avisa a la gente cercana. Hoy el panel se usa para mostrar, con datos simulados, pero es una herramienta informativa: no es un juguete ni lleva animaciones. El diseño busca que el estado y lo que conviene avisar se entiendan de un vistazo: superficies planas, color con significado, tipografía grande y ningún adorno. El estilo es **neobrutalismo minimalista**: borde oscuro, colores sólidos y una sombra sólida desplazada solo en lo principal de cada pantalla, con mucho aire y pocas cajas, sin degradados ni desenfoques. La jerarquía se hace con color, tamaño, borde y posición.

## Neobrutalismo minimalista: qué es y cómo lo aplicamos

**Qué es.** El neobrutalismo es un estilo de interfaz que se popularizó a inicios de los años 2020 como variante del brutalismo web. Se reconoce por bordes gruesos y oscuros, colores sólidos, tipografía pesada y una sombra **desplazada y sólida, sin desenfoque**, que hace parecer que cada pieza está recortada y pegada sobre la página. Lo opuesto al vidrio y a los degradados: todo es plano, directo y visible.

**Y el minimalismo.** El neobrutalismo puro se vuelve ruidoso porque todo lleva borde y sombra. Aquí lo combinamos con minimalismo: conservamos el borde oscuro y la sombra solo donde guían la vista (lo principal de cada pantalla) y quitamos lo demás. Pocas cajas, mucho aire y un solo nivel de contenedor.

**Por qué lo usamos.** Sus señales son fuertes: el borde grueso y la sombra sólida hacen que cada tarjeta y cada control se reconozcan de inmediato, y el contraste de un borde `ink` sobre la superficie es alto en cualquier pantalla. Eso ayuda a un encargado que lee el panel de un vistazo, de noche o con prisa. Resuelve además el punto débil de un estilo totalmente plano, en el que un botón sin relieve puede no parecer un botón.

**Su riesgo.** Mal aplicado se vuelve ruidoso: muchos colores, sombras de distintos tamaños y adornos. Para evitarlo seguimos la disciplina de abajo: un solo acento, los tres colores de estado reservados para el semáforo, dos tamaños de sombra y ningún color decorativo.

**Cómo lo aplicamos aquí** (neobrutalismo minimalista):

1. **Borde fino y oscuro.** Toda tarjeta, control y bloque de estado lleva un borde de `stroke-base` (2 px) en `ink`. Los divisores internos son de 1 px (`stroke-divider`, en `border`).
2. **La sombra sólida solo en lo principal.** `shadow-md` va **únicamente** en el bloque principal de cada pantalla (`StatusBanner` en Estado actual, `ConclusionCard` en Pronóstico) y `shadow-sm` **únicamente** en el botón de la acción principal. Las tarjetas secundarias, los controles secundarios, las etiquetas, los campos y las gráficas no llevan sombra. La sombra siempre es sólida, desplazada hacia abajo y a la derecha, **sin desenfoque** y en `ink`. Quedan prohibidos `text-shadow`, `filter: drop-shadow`, cualquier sombra con desenfoque y `linear-gradient` o `radial-gradient`.
3. **Pocas cajas y mucho aire.** Un solo nivel de contenedor: dentro de una tarjeta se separa con espacio y divisores finos, no con cajas dentro de cajas. Las tarjetas se separan con `space-8` y se rellenan con `space-6`.
4. **Lo tocable se reconoce.** El botón primario tiene relleno `accent`, borde y `shadow-sm`; el secundario tiene relleno `surface-raised` y borde, sin sombra. Al presionar, el control se desplaza 2 px. Los enlaces van subrayados. Nada de "botones fantasma".
5. **El color significa algo.** Solo hay un acento (azul, para lo interactivo) y tres estados (verde, amarillo, rojo). Ningún color decorativo.
6. **El color nunca va solo.** Cada estado lleva además una forma, un ícono y una palabra.
7. **Formas geométricas simples.** Esquinas poco redondeadas (4, 8 y 12 px), rectángulos y círculos; sin píldoras ni siluetas orgánicas.
8. **La tipografía lleva la jerarquía.** Una sola familia, pocos tamaños, números grandes y tabulares. El peso 800 se reserva para la palabra del estado y la conclusión; lo demás usa 400 a 700.
9. **Íconos de trazo uniforme.** Un solo set, mismo grosor, sin rellenos con degradado.
10. **Sin movimiento decorativo.** El neobrutalismo no pide animación y el panel no la usa: hover, presionado y foco cambian de inmediato.

## Contenido

- Escribe en español de México, de tú, con frases cortas y verbos de acción: "Reportar", "Ver pronóstico", "Exportar".
- Cada pantalla abre con una **conclusión en una frase** ("El arroyo está en Revisar", "Podría llegar a Revisar entre 2 y 3 h"). Los números y la gráfica la respaldan; no la sustituyen.
- Mayúscula solo en la primera palabra de títulos, botones y etiquetas: "Nuevo reporte", no "Nuevo Reporte".
- Los estados se dicen con la misma palabra que usa la baliza y la presentación: **Normal**, **Revisar** y **No cruzar**.
- Los mensajes de estado son órdenes cortas: "No cruzar", "Revisar el paso", "Paso seguro".
- Toda cifra lleva su unidad: `420 mm`, `128 mm`, `3 h`. Separador de miles con coma y decimal con punto: `1,250 mm`, `125 mm`.
- **Los pronósticos nunca son un número único.** Se escriben como rango: "entre 450 y 620 mm en 2 a 3 h". Es una regla de honestidad del proyecto (Constitución III).
- Cada dato lleva su antigüedad: "Última lectura hace 12 min". Si es vieja, se dice: "Sin lecturas desde las 14:30".
- Etiquetas fijas: **Datos simulados** (en toda pantalla con datos del simulador) y **Supuesto** (en toda cifra del recomendador).
- Los errores explican qué pasó y cómo arreglarlo: "El archivo no es un reports.json válido. Revisa que lo exportaste desde este panel", no "Error de formato".
- Sin signos de exclamación ni emojis. Tono directo y sereno; el rojo informa, no regaña.
- Fechas y horas: "15 oct, 14:30" en formato de 24 horas, hora local. Hoy y ayer se escriben como palabra.

## Color

La distribución es 60 / 30 / 10: el 60 % es superficie, el 30 % es texto y estructura, y el 10 % es color (acento y estados).

- `accent` es un azul profundo y es el **único color de marca**: botón primario, pestañas activas, enlaces, foco y selección. Se eligió azul porque no se confunde con ninguno de los tres estados.
- Los tres **colores de estado** son los hex del proyecto y no cambian de tema ni de pantalla: verde `#2fd1a5`, amarillo `#f5b942` y rojo `#ef5b5b`. Son los mismos de la baliza, y se usan como **relleno** con texto oscuro encima.
- Esos tres hex son claros y no sirven como texto sobre fondo claro. Por eso hay una variante de **texto de estado** (`ok-text`, `warn-text`, `stop-text`) más oscura en el tema claro. En el tema oscuro el texto de estado es el hex original.
- En el tema claro, el relleno de estado (verde 1.8:1, amarillo 1.6:1 contra `surface`) no cumple 3:1 por sí solo. Por eso **todo bloque de estado lleva borde de `stroke-base` (2 px) en `ink`**, que sí cumple el contraste.
- `accent` nunca significa "bien" ni "mal". El verde nunca se usa para algo que no sea estado normal.
- Los neutros llevan un tinte azulado, no gris puro, para fundirse con el acento.
- El tema oscuro usa un azul marino muy oscuro, no negro puro. El acento se aclara.
- Los datos simulados usan un tratamiento neutro (`surface-sunken` con borde discontinuo), no un color de estado.
- Pares de texto garantizados (los valores están en las tablas): `ink` y `ink-muted` sobre las tres superficies; `accent` sobre las tres superficies y `accent-soft`; `on-accent` solo sobre `accent` y `accent-strong`; `ok-text`, `warn-text` y `stop-text` sobre las tres superficies y su variante `-soft`. Cumplen 4.5:1 en ambos temas, **con una excepción**: en el tema oscuro `stop-text` sobre `surface-sunken` da 4.48:1; ahí se usa `ink` con el ícono en rojo.

## Tipografía

- Una sola familia: **Inter**, en pesos 400, 500, 600, 700 y 800 (el 800 para la palabra del estado y los títulos), **empaquetada con la app** (sin CDN, para funcionar sin red). Solo subconjunto latino.
- Las cifras usan `font-variant-numeric: tabular-nums` para que las columnas se alineen y los números no "bailen" al actualizarse.
- Nunca escribas un tamaño de letra suelto: usa un estilo de la escala.
- Tamaño mínimo de texto: 12 px (`caption`), y solo para metadatos. Todo lo que el encargado necesita leer de un vistazo va en 16 px o más.

## Forma, espacio y profundidad

- Margen lateral de pantalla `space-8` (32 px); separación entre tarjetas y entre secciones `space-8`; relleno de tarjetas `space-6`. Se prefiere dejar aire a agregar cajas.
- Radios pequeños y geométricos: `radius-sm` en etiquetas, `radius-md` en botones, campos y chips, `radius-lg` en tarjetas, diálogos y bloques de estado. **No hay píldoras.**
- **Una sola sombra: la sólida desplazada, sin desenfoque** (`shadow-sm` y `shadow-md`), solo en lo principal de cada pantalla. Cero degradados y cero `text-shadow` o `drop-shadow`.
- Una tarjeta es un plano `surface-raised` con borde `ink` de `stroke-base` y, normalmente, sin sombra. Un elemento hundido (campo, pista de barra) usa `surface-sunken` y borde.
- Un solo nivel de contenedor: no se anidan cajas con borde dentro de otras. Para agrupar dentro de una tarjeta se usan espacio y divisores de `stroke-divider`.
- Todo control mide al menos `control-min` (40 px) de alto. Si el dibujo es menor, amplía el área clicable.
- El panel es solo para escritorio. El tamaño de referencia es 1440 × 900 y el contenido tiene un ancho máximo de `content-max` (1280 px), centrado. No hay versión para celular ni tableta.
- La acción principal de una pantalla va junto al elemento al que se refiere (por ejemplo, "Copiar mensaje" debajo del mensaje), no en una barra aparte.

## Estados de interacción

- **Reposo:** botón primario con relleno `accent`, borde `ink` de `stroke-base` y `shadow-sm`; botón secundario con relleno `surface-raised` y el mismo borde, sin sombra.
- **Hover (escritorio):** el relleno pasa a `accent-strong`, o a `accent-soft` en el secundario. No se mueve.
- **Presionado:** el control se desplaza 2 px; si tenía sombra, esta desaparece. Es inmediato y sin transición.
- **Foco:** anillo de 3 px en `accent` con separación de 2 px, por fuera del borde y de la sombra. Debe verse siempre para navegación con teclado.
- **Deshabilitado:** fondo `surface-sunken`, texto `ink-muted`, borde `border` y sin sombra. Nunca se oculta una acción: se deshabilita y se explica por qué.
- **Error:** borde de `stroke-base` en `stop-text` y un mensaje con ícono debajo del campo.
- **Cargando:** texto "Cargando datos…" con una barra simple; sin esqueletos animados.
- **Sin pronóstico:** tarjeta neutra con ícono de información, una frase con la razón y qué hacer. No se parece a un error ni a una tarjeta vacía.
- **Vacío:** una frase que dice qué aparecerá ahí y, si aplica, un botón para el primer elemento. Ejemplo: "Aún no hay reportes. Cuando alguien reporte un camino bloqueado aparecerá aquí."
- **Sin datos / datos viejos:** bloque neutro con "Sin lecturas desde las 14:30". **Nunca** se muestra verde por falta de información.
- Las acciones destructivas (borrar reportes, reemplazar datos al importar) pasan siempre por `ConfirmDialog`.

## Estados del sistema (semáforo)

Los tres estados se distinguen por **cuatro señales a la vez**: color, forma, ícono y palabra. Así se leen con daltonismo, con sol fuerte y en escala de grises, en el mismo espíritu de la baliza física, que se distingue por posición o parpadeo y no solo por color.

| Estado | Relleno | Forma del indicador | Ícono | Palabra | Texto corto |
|---|---|---|---|---|---|
| Normal | `#2fd1a5` | Círculo | Check | **Normal** | "Paso seguro" |
| Revisar | `#f5b942` | Triángulo | Alerta | **Revisar** | "Revisa el paso antes de cruzar" |
| No cruzar | `#ef5b5b` | Octágono / cuadrado | X | **No cruzar** | "No cruces" |
| Sin datos | `surface-sunken` | Rombo vacío | Interrogación | **Sin datos** | "Sin lecturas desde las HH:MM" |

- El bloque de estado (`StatusBanner`) ocupa todo el ancho, con relleno de estado, borde `ink` de `stroke-base`, `shadow-md`, texto en `state-ink` y la palabra en `state-xl`. El bloque "Sin datos" no lleva sombra y su borde es discontinuo.
- El estado se calcula **solo** con `config.json` y las lecturas (Constitución IV).
- El panel **no parpadea**. El parpadeo es propio de la baliza física; en pantalla se sustituye por la forma y el texto.

## Iconografía

- Un solo set de trazo uniforme: **Lucide** (`lucide-react`), trazo de 2 px, extremos redondeados, tamaño `icon-md` (24 px) o `icon-sm` (20 px). Se importa ícono por ícono para que pese poco y funcione sin red. Es una dependencia a justificar según la Constitución VI.
- Los íconos de estado van dentro de la forma del estado (círculo, triángulo, octágono), en `state-ink`.
- Cada ícono con significado lleva etiqueta de texto o `aria-label`.
- No se usan emojis como íconos.

## Pantallas y roles

Cada pantalla indica su rol en la cabecera (encargado del comité, comité, Protección Civil, municipio, CONAGUA, CFE).

| Pantalla | Rol principal | Elemento principal |
|---|---|---|
| Estado actual | Encargado del comité | `StatusBanner` + mensaje sugerido para avisar |
| Pronóstico de creciente | Comité | Conclusión en una frase + gráfica con banda de incertidumbre |
| Laderas | Comité y Protección Civil | Saturación por sector con estado |
| Recomendador verde | Comité y municipio | Comparación sin intervención vs. con bambú y trincheras, con `AssumptionTag` |
| Reportes | Comité | Formulario corto + lista y mapa |
| Panel institucional | Protección Civil, CONAGUA, CFE | Resumen, historial y exportación |

- En Estado actual no hay más de cuatro elementos: el bloque de estado, el nivel contra el paso, la antigüedad del dato y el mensaje sugerido para avisar.
- Las demás pantallas muestran máximo cuatro bloques por vista. El detalle va en una sección plegable cuyo resumen siempre se ve; nunca hay una sección vacía o con solo un título.
- La navegación entre pantallas es una barra superior con botones con borde `ink`, sin sombra, y el rol de cada pantalla debajo del nombre. La pantalla activa se marca con relleno `accent` y texto `on-accent`, no solo con un subrayado.

## Composición

Cómo se ordena cada pantalla a 1440 × 900. Las maquetas aprobadas están en `docs/design/` y mandan sobre estos bocetos.

**Estado actual** (dos columnas: izquierda 7/12, derecha 5/12)

    ┌ Cabecera: nombre · navegación (cada botón con su rol) ──────────────────┐
    │ Franja: Datos simulados · umbrales de ejemplo ·· Escenario: [Ciclón ▾]   │
    │ ┌────────────────────────────────────┐ ┌─────────────────────────────┐  │
    │ │ STATUSBANNER (todo el ancho)        │ │ QUÉ AVISAR                   │  │
    │ │ [forma] Revisar                     │ │ "El arroyo está en Revisar…" │  │
    │ │ Revisa el paso antes de cruzar      │ │ [Copiar mensaje]             │  │
    │ └────────────────────────────────────┘ │ Tú confirmas y avisas.       │  │
    │ ┌────────────────────────────────────┐ └─────────────────────────────┘  │
    │ │ NIVEL CONTRA EL PASO  660 mm         │ ┌─────────────────────────────┐  │
    │ │ barra con marcas Revisar/No cruzar  │ │ ANTIGÜEDAD  hace 3 min       │  │
    │ └────────────────────────────────────┘ └─────────────────────────────┘  │

**Pronóstico de creciente** (conclusión a la izquierda 4/12, gráfica a la derecha 8/12)

    ┌ Cabecera + franja de datos simulados con el selector de escenario ─────┐
    │ ┌───────────────────────┐ ┌────────────────────────────────────────┐  │
    │ │ CONCLUSIÓN             │ │ GRÁFICA grande: nivel real, proyección │  │
    │ │ "Podría llegar a       │ │ discontinua, banda, umbrales           │  │
    │ │ Revisar entre 2 y 3 h" │ │                                        │  │
    │ │ No cruzar: no se       │ │                                        │  │
    │ │ proyecta en 6 h        │ │                                        │  │
    │ │ Nivel actual · Ritmo   │ │                                        │  │
    │ │ Última lectura hace…   │ │                                        │  │
    │ └───────────────────────┘ └────────────────────────────────────────┘  │
    │ ┌ Cómo se calcula (resumen siempre visible, detalle plegable) ────────┐ │
    └─────────────────────────────────────────────────────────────────────────┘

- **Jerarquía:** lo más grande de la pantalla es la conclusión o el estado; después las cifras; la gráfica y el detalle van como apoyo.
- **Pronóstico siempre con su contexto:** la tarjeta de conclusión muestra el nivel actual (o el último conocido si los datos son viejos), el ritmo y la antigüedad del dato. Una proyección sin su punto de partida y su frescura no se muestra.
- **Redacción segura:** si no se proyecta llegar a un umbral en el horizonte, se escribe "No se proyecta en las próximas 6 h", nunca "más de 6 h" ni nada que suene tranquilizador. Va siempre el aviso "Una lluvia intensa puede acelerar la subida y hacer que esta proyección se quede corta".
- **Sin pronóstico** (nivel bajando, pocas lecturas, datos viejos): la tarjeta de conclusión usa tono neutro con ícono de información y dice qué hacer ("El nivel está bajando. Sigue vigilando"). La gráfica usa todo el ancho para las últimas horas y **no reserva espacio vacío para una proyección que no existe**.
- **Selector de escenarios:** por ahora la app es una demostración con datos simulados, así que el selector es el control de quien presenta y está siempre a la vista, en la franja de datos simulados, al extremo derecho. Es un control con etiqueta ("Escenario de ejemplo"), no un botón escondido. No hay "modo real".
- **Datos simulados:** una franja neutra con borde discontinuo bajo la cabecera, siempre visible. Indica también que los umbrales de ejemplo son provisionales.

## Gráficas y datos

- Gráficas en **SVG propio**: líneas de `stroke-chart` (2 px), áreas con relleno sólido simple (sin degradado) y ejes en `ink`. La tarjeta que contiene la gráfica lleva borde y no lleva sombra; el dibujo tampoco.
- Serie principal (nivel real) en `accent`. El **pronóstico** es una línea discontinua en `accent` con una **banda de incertidumbre** rellena de `accent-soft` y borde discontinuo; nunca una línea única.
- Las líneas de umbral (`config.json`) se dibujan en el color del estado que activan y llevan etiqueta de texto ("Revisar: 600 mm", "No cruzar: 850 mm").
- Una serie de datos simulados lleva la etiqueta **Datos simulados** en el título de la gráfica.
- Cada punto o zona importante tiene alternativa en texto (tabla o resumen) para lectores de pantalla.
- Siempre se indica el periodo y la unidad.

## Accesibilidad

- Controles de 40 px de alto o más.
- Texto con contraste mínimo 4.5:1; bordes de controles e íconos con significado, 3:1.
- Todo estado tiene palabra, forma e ícono además del color.
- Navegación completa con teclado y foco siempre visible.
- Respeta `prefers-reduced-motion`.
- Admite zoom y el tamaño de fuente del navegador; las tarjetas crecen en alto, no recortan texto.
- Los bloques de estado usan `role="status"` o `aria-live="polite"` para anunciar cambios.

## Componentes

`Button`, `Chip`, `TextField`, `Select`, `Card`, `StatusBanner`, `StatusPill`, `StatusShape`, `LevelGauge` (nivel contra el paso), `BroadcastMessage` (mensaje sugerido para avisar, con botón "Copiar mensaje"), `ConclusionCard` (conclusión en una frase), `ForecastChart` (con banda), `DataFreshness` (antigüedad del dato), `SimulatedBadge`, `AssumptionTag`, `RoleNav` (barra de navegación entre pantallas), `Disclosure` (sección plegable), `ConfirmDialog`, `EmptyState`, `Notice` (mensajes de éxito y error), `FileImport` y `FileExport`. Cada pantalla usa solo estos componentes y los tokens; no escribe colores, medidas ni tamaños de letra sueltos.

## Tokens

### Color (superficie, texto y acento)

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `surface` | `#F4F6F9` | `#0B1220` | Fondo de pantalla. |
| `surface-raised` | `#FFFFFF` | `#131C2E` | Tarjetas, diálogos y navegación, sobre surface. |
| `surface-sunken` | `#E4E9F0` | `#1B2740` | Campos, pistas de barras, chips en reposo y bloques "sin datos". |
| `border` | `#C9D2DE` | `#26334D` | Divisores internos y bordes de controles deshabilitados. No identifica controles ni tarjetas. |
| `border-strong` | `#5E6E82` | `#7D8CA6` | Bloque "Sin datos" (borde discontinuo) y ejes secundarios. 4.27:1 o más sobre las tres superficies en ambos temas. |
| `ink` | `#101A2A` | `#E8EEF7` | Texto principal, **borde de tarjetas y controles** y color de la sombra sólida. 14.3:1 o más. |
| `ink-muted` | `#475569` | `#A3B1C6` | Texto secundario y metadatos. 6.2:1 o más. |
| `accent` | `#1F5FBF` | `#6EA2F0` | Único color de marca: botón primario, enlaces, pestaña activa y foco. 4.99:1 o más como texto. |
| `accent-strong` | `#174A96` | `#9BC0F7` | Hover y presionado. |
| `accent-soft` | `#DCE8F9` | `#16294A` | Fondo de selección, botón tonal y banda de incertidumbre. El texto va en `accent` (4.9:1 o más). |
| `on-accent` | `#FFFFFF` | `#08162E` | Texto e íconos sobre `accent` y `accent-strong` (6.1:1 o más). |

### Color (estados)

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `ok-fill` | `#2fd1a5` | `#2fd1a5` | Relleno del estado Normal. **Mismo hex en ambos temas y en la baliza.** |
| `warn-fill` | `#f5b942` | `#f5b942` | Relleno del estado Revisar. |
| `stop-fill` | `#ef5b5b` | `#ef5b5b` | Relleno del estado No cruzar. |
| `state-ink` | `#101A2A` | `#0B1220` | Texto e íconos sobre cualquier relleno de estado (5.2:1 a 10.6:1). |
| `ok-text` | `#0B6B53` | `#2fd1a5` | Texto, íconos y borde del estado Normal sobre las superficies. 5.3:1 o más. |
| `warn-text` | `#7A5200` | `#f5b942` | Ídem para Revisar. 5.7:1 o más. |
| `stop-text` | `#B3261E` | `#ef5b5b` | Ídem para No cruzar. 5.4:1 o más en claro; en oscuro no sobre `surface-sunken` (4.48:1). |
| `ok-soft` | `#D9F6EE` | `#0F3329` | Fondo suave de etiquetas del estado Normal. |
| `warn-soft` | `#FDEFCB` | `#3A2C0B` | Ídem para Revisar. |
| `stop-soft` | `#FCE0E0` | `#3F1A1A` | Ídem para No cruzar y fondo de errores. |

### Tipografía (Inter)

| Estilo | Tamaño / interlineado | Peso | Uso |
|---|---|---|---|
| `state-xl` | 48px / 52px | 800 | Palabra del estado en `StatusBanner` ("No cruzar"). |
| `value-xl` | 40px / 48px | 700 | Nivel actual (`420 mm`), cifra principal de una pantalla. |
| `value-lg` | 28px / 36px | 700 | Cifras de tarjetas: nivel, mm acumulados, rango del pronóstico. |
| `value-md` | 16px / 24px | 700 | Cifras de renglones de tabla, alineadas a la derecha. |
| `title-lg` | 28px / 36px | 700 | Título de pantalla. |
| `title-md` | 20px / 28px | 700 | Título de tarjeta, diálogo o sección. |
| `body` | 16px / 24px | 400 | Texto corrido y valor de campos. |
| `body-strong` | 16px / 24px | 600 | Texto de botones y títulos de renglón. |
| `label` | 14px / 20px | 600 | Etiquetas de campos, chips, pestañas y estados. |
| `caption` | 12px / 16px | 500 | Metadatos, antigüedad del dato y etiquetas **Datos simulados** y **Supuesto**. |

### Espaciado

| Token | Valor | Uso |
|---|---|---|
| `space-1` | `4px` | Separación mínima entre ícono y texto. |
| `space-2` | `8px` | Separación entre elementos relacionados dentro de un componente. |
| `space-3` | `12px` | Separación entre renglones. |
| `space-4` | `16px` | Separación entre un título y su contenido. |
| `space-5` | `20px` | Relleno vertical del bloque de estado. |
| `space-6` | `24px` | Relleno de tarjetas, horizontal de botones y de diálogos. |
| `space-8` | `32px` | Margen lateral de pantalla y separación entre tarjetas y secciones. |
| `space-10` | `40px` | Aire alrededor de estados vacíos. |

### Radios

| Token | Valor | Uso |
|---|---|---|
| `radius-sm` | `4px` | Etiquetas y chips pequeños. |
| `radius-md` | `8px` | Botones, campos y chips. |
| `radius-lg` | `12px` | Tarjetas, diálogos y bloque de estado. |

### Bordes

| Token | Valor | Uso |
|---|---|---|
| `stroke-base` | `2px` | Borde en `ink` de tarjetas, controles y bloques de estado. |
| `stroke-divider` | `1px` | Divisores internos de una tarjeta, en `border`. |
| `stroke-focus` | `3px` | Anillo de foco, separado 2 px del elemento. |
| `stroke-chart` | `2px` | Líneas de gráficas. |

### Tamaños

| Token | Valor | Uso |
|---|---|---|
| `control-min` | `40px` | Altura mínima de cualquier control. |
| `control-lg` | `56px` | Altura de campos de texto. |
| `icon-md` | `24px` | Tamaño estándar de íconos. |
| `icon-sm` | `20px` | Íconos dentro de etiquetas y ayudas. |
| `shape-lg` | `64px` | Forma del estado dentro del bloque de estado. |
| `content-max` | `1280px` | Ancho máximo del contenido; centrado en pantallas más anchas. |
| `column-min` | `360px` | Ancho mínimo de una columna de contenido: si la ventana se reduce, las columnas se apilan en lugar de apretarse. No es un diseño para celular. |

### Duración y curvas

| Token | Valor | Uso |
|---|---|---|
| `duration-fast` | `120ms` | Cambios de estado de un control (hover, foco, presionado). |
| `duration-base` | `200ms` | Cambio de pantalla y apertura de diálogos. |
| `ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Cambios de estado y posición. |
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Elementos que entran a la pantalla. |

### Sombras

Solo existe la sombra sólida desplazada del neobrutalismo: **sin desenfoque, sin propagación y siempre en `ink`**. Se escribe `box-shadow: <desplazamiento> <desplazamiento> 0 0 var(--ink)` usando estos tokens.

| Token | Valor | Uso |
|---|---|---|
| `shadow-sm` | `2px 2px 0 0 ink` | Solo el botón de la acción principal de la pantalla. |
| `shadow-md` | `4px 4px 0 0 ink` | Solo el bloque principal de la pantalla (`StatusBanner`, `ConclusionCard`) y los diálogos. |

Cualquier otro elemento va sin sombra. Las revisiones de código rechazan `text-shadow`, `drop-shadow`, cualquier `box-shadow` con desenfoque (tercer valor distinto de `0`) y cualquier degradado. No se definen otros tamaños de sombra.

## Movimiento

El movimiento es mínimo y nunca retrasa la lectura del estado.

- Se anima solo opacidad y posición (`translate`), con `duration-fast` o `duration-base`. El hover, el presionado de los controles (que se desplazan hacia su sombra) y el foco **no** llevan transición: cambian de inmediato.
- Un cambio de estado (por ejemplo, de Revisar a No cruzar) se hace **de inmediato**, sin transición de color, y se anuncia a lectores de pantalla.
- Una lectura nueva actualiza los números sin animarlos; no hay contadores que "corran".
- Cambio entre pantallas: inmediato o con desvanecimiento de `duration-fast`, sin desplazamiento lateral.
- Diálogos: aparecen con opacidad en `duration-base`; el velo es un color sólido translúcido.
- Con `prefers-reduced-motion`, todas las transiciones se reducen a cero.
- No hay animación de entrada ni pantalla de presentación: el panel abre directo en el estado.


## Adenda 2026-10-16: tarjeta de lluvia (`RainCard`)

Componente nuevo, aprobado el 2026-10-16. Es una tarjeta estándar (`card`, borde `ink`, sin sombra) con el título "Lluvia", la cifra de la última hora en `value-lg` ("42 mm"), el acumulado de 3 h y 6 h en texto `muted` y la nota "Solo informativa: no cambia el estado". Con "Sin datos" no muestra cifras. En Estado actual va en la columna derecha, entre "Qué avisar" y "Antigüedad del dato". Todas las cifras de agua del sistema se expresan en mm.


## Adenda 2026-10-16: estilo profesional (sustituye al neobrutalismo)

El autor pidió un aspecto más profesional y sólido, a partir de tres referencias (dashboard de hidrometría, guía de dashboard con navegación lateral y app del clima). **Esta adenda manda sobre cualquier regla anterior de este documento** (bordes `ink` de 2 px, sombras sólidas desplazadas, radios pequeños, desplazamiento al presionar) y sobre las maquetas HTML de `docs/design/`, que quedan como referencia histórica del contenido.

- **Estructura**: barra lateral (marca + navegación con ícono, nombre y rol), barra superior (datos simulados + selector de escenario) y contenido en tarjetas.
- **Tarjetas**: fondo blanco, borde de 1 px en `border`, radio `radius-lg` (20 px), `shadow-sm`; el bloque principal usa `shadow-md`.
- **Color**: superficie `#F2F6FB`, acento azul `#0A63BE`; los tres colores de estado no cambian. Texto principal `#0F1B2D`, secundario `#42526A`.
- **Controles**: botones y selectores en forma de píldora (`radius-pill`), foco visible de 3 px.
- **Sombras** (única excepción a lo anterior, tokens `shadow-sm` y `shadow-md`): difusas y tenues; siguen prohibidos `text-shadow`, `drop-shadow` y los degradados.
- **Estado actual**: fila superior con el bloque de estado (7/12) y "Qué avisar" (5/12); debajo, tres tarjetas de indicador: nivel (medidor de arco con marcas de Revisar, No cruzar y Paso), lluvia y antigüedad del dato.
- **Pronóstico**: conclusión (4/12) y gráfica (8/12); debajo, la tira "Proyección por hora" (`HourlyStrip`: una tarjeta por hora con el nivel central, el rango y el estado que le correspondería) y "Cómo se calcula".
- **Tipografía**: la palabra del estado mide 64 px.

### Adenda: pantalla de bienvenida y logo (2026-10-17)

- **Logo**: el emblema de Piski (gota con montañas y arroyo) está en `src/assets/piski-logo.png`, incrustado en el archivo de entrega. Se usa en la barra lateral, en el ícono de la pestaña y en la bienvenida.
- **Pantalla de bienvenida** (`Splash`): al abrir o recargar muestra el logo y el nombre unos 1.6 s y se desvanece en 0.4 s; también se cierra con un clic o una tecla. Es la **única animación permitida** del panel (excepción pedida por el autor a la regla de "sin animaciones"); con "reducir movimiento" del sistema desaparece sin desvanecerse.
