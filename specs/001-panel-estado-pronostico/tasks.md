---

description: "Lista de tareas del MVP del Panel de monitoreo: Estado actual y Pronóstico de creciente"
---

# Tareas: Panel de monitoreo (MVP) — Estado actual y Pronóstico de creciente

**Entrada**: documentos de diseño en `specs/001-panel-estado-pronostico/`

**Requisitos previos**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/` y `quickstart.md`

**Pruebas**: están incluidas porque la constitución (principio VIII) exige pruebas automatizadas de toda la lógica de negocio y de los componentes críticos. Los nombres y los mensajes de las pruebas van en español. Cada prueba se escribe **antes** de su implementación y debe fallar primero.

**Organización**: las tareas se agrupan por historia de usuario para poder implementar y probar cada una de forma independiente.

## Formato: `[ID] [P?] [Historia] Descripción`

- **[P]**: se puede hacer en paralelo (archivos distintos, sin dependencias pendientes)
- **[Historia]**: a qué historia de usuario pertenece (US1 a US7); las fases de preparación, base y cierre no llevan etiqueta
- Cada descripción incluye la ruta exacta del archivo

## Convenciones de rutas

Proyecto único en la raíz del repositorio, según `plan.md`: `src/` (`core/`, `ui/`, `features/`, `app/`), `data/`, `tests/`, `scripts/` y `dist/` (la entrega, `dist/index.html`).

## Fase 1: Preparación (infraestructura compartida)

**Propósito**: inicializar el proyecto y su estructura.

- [X] T001 Crear la estructura de carpetas del plan, cada una con un archivo `.gitkeep` si queda vacía: `src/core/{data,readings,schemas,tokens,time,i18n,utils}`, `src/ui/{components,theme}`, `src/features/estado/{components,hooks,services}`, `src/features/pronostico/{components,hooks,services}`, `src/app`, `src/assets/fonts`, `data/escenarios`, `tests/{casos,unit,components}`, `tests/fixtures/invalidos` y `scripts`
- [X] T002 Crear `package.json` (nombre `piski-panel`, `"type": "module"`) con los scripts `dev`, `test`, `typecheck`, `build` (`vite build && node scripts/inline-build.mjs`), `verify:dist` (`node scripts/verificar-entrega.mjs`) y `generar:escenarios` (`node scripts/generar-escenarios.mjs`); dependencias `react`, `react-dom`, `zod` y `lucide-react`; de desarrollo `vite`, `@vitejs/plugin-react`, `typescript`, `vitest`, `@testing-library/react`, `jsdom` y los `@types` necesarios. Fijar versiones exactas verificando la versión estable vigente (principio VI). NO agregar librería de rutas, de estado, de gráficas ni de PWA, ni `@testing-library/user-event` ni `@testing-library/jest-dom`; luego ejecutar `npm install`
- [X] T003 [P] Crear `tsconfig.json` único con `strict: true`, `noEmit`, `resolveJsonModule` y `include` de `src`, `tests`, `scripts` y los archivos de configuración
- [X] T004 [P] Crear `vite.config.ts` con el plugin de React, `base: './'`, CSS Modules, `build.cssCodeSplit: false`, `build.rollupOptions.output.inlineDynamicImports: true` y `build.assetsInlineLimit` alto para que la fuente se incruste (R1 de `research.md`), y la sección de Vitest con entorno `jsdom`, `include: ['tests/**/*.test.{ts,tsx}']` y `setupFiles: ['tests/setup.ts']`
- [X] T005 [P] Crear `tests/setup.ts` que limpie el DOM entre pruebas con `cleanup` de React Testing Library
- [X] T006 [P] Crear `index.html` en la raíz con `lang="es"`, título "Piski — Panel de monitoreo", `<div id="root">` y la carga de `src/app/main.tsx`
- [X] T007 [P] Copiar una sola vez el archivo `woff2` variable de Inter (subconjunto latino, pesos 400 a 800) a `src/assets/fonts/inter-latin-wght-normal.woff2` y la licencia a `src/assets/fonts/OFL.txt`; la fuente NO queda como dependencia de ejecución (R9)

---

## Fase 2: Base (requisitos que bloquean todas las historias)

**Propósito**: capa de datos, tokens, textos, componentes base, estructura de la aplicación y construcción de la entrega.

**⚠️ CRÍTICO**: ninguna historia de usuario puede empezar hasta terminar esta fase.

### Tokens y tema

- [X] T008 [P] Escribir `tests/unit/tokens.test.ts` con pruebas de guardia: los hex `#2fd1a5`, `#f5b942` y `#ef5b5b` aparecen definidos una sola vez, solo en `src/core/tokens/tokens.ts`; no existe `text-shadow`, `drop-shadow`, `linear-gradient` ni `radial-gradient` en `src/`; todo `box-shadow` usa solo `var(--shadow-sm)` o `var(--shadow-md)`; no hay colores ni tamaños de letra sueltos en `src/**/*.module.css` y en las pantallas
- [X] T009 Crear `src/core/tokens/tokens.ts` como única fuente de los tokens de `docs/design-system-panel.md`: colores claro y oscuro (superficies, `ink`, `accent`, estados `ok-fill`, `warn-fill`, `stop-fill`, `state-ink`, `ok-text`, `warn-text`, `stop-text` y sus variantes suaves), tipografía (`state-xl` 48/52 peso 800, `value-xl`, `value-lg`, `value-md`, `title-lg`, `title-md`, `body`, `body-strong`, `label`, `caption`), espaciado `space-1` a `space-10`, radios `radius-sm/md/lg` (4, 8 y 12 px), bordes `stroke-base` 2 px, `stroke-divider` 1 px, `stroke-focus` 3 px y `stroke-chart` 2 px, tamaños (`control-min` 40 px, `control-lg` 56 px, `icon-md`, `icon-sm`, `shape-lg`, `content-max` 1280 px, `column-min`), duraciones y curvas, y las sombras `shadow-sm` (`2px 2px 0 0 ink`) y `shadow-md` (`4px 4px 0 0 ink`)
- [X] T010 Crear `src/ui/theme/cssVars.ts` (convierte los tokens en variables CSS para el tema claro y el oscuro y genera las clases `.type-<estilo>`) y `src/ui/theme/global.css` (`@font-face` de Inter con la ruta relativa a `src/assets/fonts/inter-latin-wght-normal.woff2`, reinicio de estilos, anillo de foco de 3 px, tema claro por defecto sin seguir el del sistema, `prefers-reduced-motion` a cero y ninguna transición)

### Textos y tiempo

- [X] T011 [P] Crear `src/core/i18n/textos.ts` con TODOS los textos de la interfaz en español: etiquetas de estado y mensajes cortos (Normal "Paso seguro", Revisar "Revisa el paso antes de cruzar", No cruzar "No cruces", Sin datos "Sin lecturas desde las {HH:MM}"), los cuatro mensajes de ejemplo para avisar de `data-model.md`, la franja de datos simulados, "Cargando datos…", textos de error accionables, los renglones y frases de `contracts/pronostico.md` (conclusión, sin pronóstico por razón, "Proyección, no medición", aviso de lluvia, "Cómo se calcula"), la navegación y el aviso "Se descartó N lectura(s) fuera de rango"
- [X] T012 [P] Escribir `tests/unit/clock.test.ts`: `formatAge` ("hace 3 min", "hace 3 h"), `formatHour` ("14:27", 24 horas), `formatDateTime` ("15 oct, 14:27"), `minutesBetween` y rechazo de marcas de tiempo sin zona horaria
- [X] T013 Crear `src/core/time/clock.ts` con funciones puras que reciben siempre un "ahora" explícito (nunca leen el reloj real) y definen `FUTURE_TOLERANCE_MS = 60_000` (60 s de tolerancia a lecturas adelantadas; no es un umbral de nivel)

### Esquemas y validación

- [X] T014 [P] Crear los archivos inválidos de `tests/fixtures/invalidos/`: `config-sin-campo.json`, `config-version-2.json` (`schema_version` distinta de 1), `readings-sin-zona.json` (marca de tiempo sin zona horaria), `config-umbrales-invertidos.json` (`review_mm` mayor o igual que `stop_mm`) y `readings-mal-formado.json` (JSON roto)
- [X] T015 [P] Escribir `tests/unit/schemas.test.ts`: aceptan los ejemplos válidos de `contracts/datos-json.md` y rechazan cada archivo de `tests/fixtures/invalidos/` con un mensaje en español que dice qué archivo falló y cómo arreglarlo, sin trazas internas
- [X] T016 Crear `src/core/schemas/config.ts` (Zod) con las restricciones exactas de `data-model.md`: `schema_version` entero, "Debe ser `1`"; `assumed` booleano; `thresholds.review_mm` número ≥ 0; `thresholds.stop_mm` número, mayor que `review_mm`; `crossing_mm` número, mayor o igual que `stop_mm`; `sustain.readings_to_raise` entero ≥ 1; `sustain.readings_to_lower` entero ≥ 1; `max_reading_age_min` número > 0; `plausible_level_mm.min` y `.max` números con `min < max`; `forecast.window_min` número > 0; `forecast.min_readings` entero ≥ 2; `forecast.horizon_h` número > 0; `forecast.flat_rate_mm_h` número ≥ 0
- [X] T017 [P] Crear `src/core/schemas/readings.ts` (Zod): `schema_version` entero igual a `1`; `readings` lista de `{ timestamp, level_mm, simulated }`; `timestamp` ISO 8601 **con zona horaria** ("Sin zona, el archivo se rechaza"); `level_mm` número; `simulated` booleano obligatorio. Acepta lecturas fuera de orden y repetidas
- [X] T018 [P] Crear `src/core/schemas/scenario.ts` (Zod): `schema_version` igual a `1`; `id` "Único, en minúsculas, con guiones y sin tildes", igual al nombre de la carpeta; `group` `demo` o `test`; `name` texto; `description` texto; `now` ISO 8601 con zona horaria, "mayor o igual que la última lectura (con tolerancia de 60 s)"
- [X] T019 [P] Crear `src/core/schemas/events.ts` y `src/core/schemas/reports.ts` (Zod, con `schema_version`) solo como tipos definidos y sin uso; los reportes NO llevan datos personales (nombre, teléfono ni cuenta)
- [X] T020 Crear `src/core/schemas/result.ts` (tipo `Result<T>` y conversión de errores de Zod a mensajes en español accionables que nombran el archivo; llama a `z.config(z.locales.es())`; nunca expone trazas) y `src/core/schemas/index.ts` con la API pública
- [X] T021 [P] Crear `data/ESQUEMA.md` a partir de `specs/001-panel-estado-pronostico/contracts/datos-json.md`: los campos, tipos, ejemplos y la versión de esquema de los cuatro JSON y de `escenario.json`

### Lecturas y escenarios

- [X] T022 [P] Escribir `tests/unit/cleanReadings.test.ts`: descarta lecturas imposibles (fuera de `plausible_level_mm`) y las del futuro (más de 60 s después de `now`; con exactamente 60 s se conserva), cuenta `discardedCount`, ordena por hora y, con la misma hora, conserva la que aparece después en el archivo
- [X] T023 Crear `src/core/readings/cleanReadings.ts`: función pura `cleanReadings(readings, config, now)` con el Paso 1 de `contracts/clasificacion-estado.md`
- [X] T024 Crear `scripts/generar-escenarios.mjs`: estructura que genera de forma determinista (sin azar; ruido con funciones seno) `data/escenarios/<id>/{escenario.json,config.json,readings.json}` a partir de definiciones; lecturas cada 15 min, la última 3 minutos antes de `now`, `simulated: true`, `assumed: true` y la configuración de ejemplo de `contracts/datos-json.md`. Las definiciones de cada escenario se agregan en las historias que lo necesitan
- [X] T025 [P] Escribir `tests/unit/scenarioRepository.test.ts`: lista los escenarios agrupados en `demo` y `test`, devuelve `Result` con error accionable si un escenario es inválido, y verifica que el `id` coincide con la carpeta
- [X] T026 Crear `src/core/data/scenarioRepository.ts`: interfaz `ScenarioRepository` y su implementación con los escenarios incluidos en la aplicación mediante `import.meta.glob('../../../data/escenarios/*/*.json', { eager: true })`, validados con los esquemas; es el único lugar que toca los JSON (principio V)
- [X] T027 Crear `src/core/data/DataProvider.tsx` y `src/core/data/useScenario.ts`: contexto que recibe `scenarioId`, muestra "Cargando datos…" mientras carga, expone el escenario activo (configuración, lecturas y `now`) y, si un escenario es inválido, mantiene el último válido y expone el error

### Componentes base de interfaz

- [X] T028 [P] Crear `src/ui/icons.ts` importando de `lucide-react` solo los íconos usados, uno por uno (`Check`, `TriangleAlert`, `X`, `Info`, `Copy`)
- [X] T029 [P] Crear `src/ui/components/Card.tsx` y `Card.module.css`: borde `ink` de `stroke-base`, relleno `surface-raised`, sin sombra salvo la propiedad `main` que aplica `shadow-md`
- [X] T030 [P] Crear `src/ui/components/Button.tsx` y `Button.module.css`: primario (relleno `accent`, `shadow-sm`) y secundario (relleno `surface-raised`, sin sombra), alto mínimo `control-min` (40 px), se desplaza 2 px al presionar, foco visible, sin transiciones
- [X] T031 [P] Crear `src/ui/components/Select.tsx` y `Select.module.css`: con etiqueta visible, soporte de grupos (`optgroup`), alto mínimo de 40 px y uso completo con teclado
- [X] T032 [P] Crear `src/ui/components/Notice.tsx` y `EmptyState.tsx` (con sus `.module.css`): avisos neutros con ícono y estados vacíos con una frase que dice qué aparecerá
- [X] T033 [P] Crear `src/ui/components/SimulatedBadge.tsx` y `Tag.tsx` (con sus `.module.css`): etiqueta "Datos simulados" con borde discontinuo y etiqueta genérica de fondo suave sin borde
- [X] T034 Crear `src/ui/index.ts` que exporte la API pública de `src/ui`
- [X] T035 [P] Escribir `tests/components/ui.test.tsx`: `Button` (primario y secundario, se puede activar con teclado), `Select` (etiqueta y grupos) y `SimulatedBadge` (texto "Datos simulados")

### Aplicación y entrega

- [X] T036 [P] Escribir `tests/unit/useRoute.test.ts`: lee `#/estado` y `#/pronostico`, el parámetro `?e=<id>`, abre por defecto Estado actual con `tormenta-normal` y cambia el escenario sin recargar la página
- [X] T037 Crear `src/app/useRoute.ts`: navegación por `hash` sin librería de rutas (`#/estado`, `#/pronostico`, `?e=<id>`), con `navigate` y `setScenario` que no recargan
- [X] T038 Crear `src/app/App.tsx` y `src/app/main.tsx`: cabecera mínima con el nombre "Piski" y "Panel de monitoreo", `DataProvider` con el escenario de `useRoute` y una zona de contenido; importa `src/ui/theme/global.css` y aplica las variables CSS. Las pantallas se conectan en cada historia
- [X] T039 Crear `scripts/inline-build.mjs` (unas 40 líneas): lee `dist/index.html`, reemplaza el `<script type="module" crossorigin src>` por un `<script type="module">` en línea (escapando cualquier `</script>` del código), el `<link rel="stylesheet">` por un `<style>` y quita `crossorigin`; elimina `dist/assets` y deja **solo** `dist/index.html`
- [X] T040 Crear `scripts/verificar-entrega.mjs`: falla si `dist/` tiene archivos distintos de `index.html`, si hay `<script src>` o `<link href>` externos o si aparece alguna dirección `http://` o `https://` que no sea del espacio de nombres SVG (`http://www.w3.org/`)
- [X] T041 Ejecutar `npm run build` y `npm run verify:dist`, y abrir `dist/index.html` con Chrome (sin servidor) para confirmar que la cabecera mínima se ve; es la prueba temprana de que la entrega abre con doble clic (R1)

**Punto de control**: la base está lista; las historias pueden empezar.

---

## Fase 3: Historia de usuario 1 — Ver el estado del paso de un vistazo (Prioridad: P1) 🎯 MVP

**Objetivo**: que el encargado vea el semáforo, el nivel contra el paso y la antigüedad del dato, y que "Sin datos" nunca sea verde.

**Prueba independiente**: cargar cada escenario de la historia y comprobar que el estado mostrado es el esperado, sin el pronóstico ni el mensaje para avisar.

### Pruebas de la historia 1 (escribir primero y comprobar que fallan)

- [X] T042 [P] [US1] Escribir `tests/unit/classifyState.test.ts` con los escenarios de aceptación: Normal (C01), espuria que no cambia el estado (C02 y C03), Revisar sostenido (C06), No cruzar con una sola lectura al arranque (C04), bajar solo tras 5 lecturas (C08 y C09), sin lecturas (C13), lectura vieja (C14) y que cambiar `stop_mm` en la configuración cambia el estado sin tocar el código
- [X] T043 [P] [US1] Escribir `tests/unit/distanceToNext.test.ts`: "Faltan 180 mm para Revisar" (420 mm), "Faltan 190 mm para No cruzar" (660 mm), "Faltan 90 mm para el nivel del paso" (910 mm) y el texto de último nivel conocido con "Sin datos"
- [X] T044 [P] [US1] Escribir `tests/components/StatusBanner.test.tsx`: cada estado muestra palabra, mensaje corto, forma (círculo, triángulo, octágono, rombo con su `aria-label`) y `role="status"`; "Sin datos" tiene borde discontinuo y sin sombra
- [X] T045 [P] [US1] Escribir `tests/components/LevelGauge.test.tsx`: nivel con unidades ("420 mm"), "de 1000 mm del paso", marcas de Revisar, No cruzar y Paso, y "—" con "Sin datos"
- [X] T046 [P] [US1] Escribir `tests/components/DataFreshness.test.tsx`: "Última lectura hace X min" con fecha y hora, y "Sin lecturas desde las HH:MM" con "hace 3 h"
- [X] T047 [P] [US1] Escribir `tests/components/EstadoActualScreen.test.tsx`: con `tormenta-normal` muestra Normal, con `ciclon-revisar` Revisar, con `ciclon-no-cruzar` No cruzar, con `lecturas-viejas` "Sin datos" (nunca verde), con `lectura-espuria` Normal y con `lectura-imposible` el aviso "Se descartaron 2 lecturas fuera de rango"

### Implementación de la historia 1

- [X] T048 [US1] Agregar a `scripts/generar-escenarios.mjs` las definiciones de `tormenta-normal` (estable en torno a 400 mm), `ciclon-revisar` (sube unos 70 mm/h hasta 660 mm), `ciclon-no-cruzar` (910 mm sostenido), `lecturas-viejas` (última lectura de 480 mm, 3 h antes de `now`), `lectura-espuria` (normal con una sola lectura de 950 mm) y `lectura-imposible` (con −50 mm y 9990 mm), todos con `group` según `contracts/datos-json.md`; ejecutar `npm run generar:escenarios`
- [X] T049 [US1] Crear `src/features/estado/types.ts` con el tipo `EstadoPaso` de `data-model.md`: `kind` (`normal` | `review` | `stop` | `nodata`), `lastReadingAt`, `ageMin`, `lastLevelMm`, `discardedCount` y `noDataReason` (`none` | `stale` | `insufficient`)
- [X] T050 [US1] Crear `src/features/estado/services/classifyState.ts`: función pura `classifyState(readings, config, now)` con los Pasos 2 a 4 de `contracts/clasificacion-estado.md` (sin datos, banda de cada lectura con valor igual al umbral alcanzado, arranque con la banda más alta, subir con `readings_to_raise`, bajar con `readings_to_lower`, reinicio por hueco mayor que `max_reading_age_min`); usa `cleanReadings`; todos los parámetros salen de `config`
- [X] T051 [P] [US1] Crear `src/features/estado/services/distanceToNext.ts`: la frase "Faltan X mm para …" según el estado y los umbrales de la configuración
- [X] T052 [P] [US1] Crear `src/ui/components/StatusShape.tsx` y `StatusShape.module.css`: círculo con ✓, triángulo con !, octágono con ✕ y rombo vacío con ?, en `state-ink`, cada uno con `aria-label`
- [X] T053 [US1] Crear `src/ui/components/StatusBanner.tsx`, `StatusPill.tsx` y sus `.module.css`: relleno del color de estado, borde `ink`, `shadow-md`, palabra en `state-xl`, mensaje corto y `role="status"`; "Sin datos" con relleno `surface-sunken`, borde discontinuo y sin sombra
- [X] T054 [P] [US1] Crear `src/ui/components/LevelGauge.tsx` y `LevelGauge.module.css`: valor `value-xl` con unidades, barra con relleno `accent` y marcas de Revisar, No cruzar y Paso tomadas de la configuración, y la frase de distancia; la escala máxima se deriva de `crossing_mm`
- [X] T055 [P] [US1] Crear `src/ui/components/DataFreshness.tsx` y `DataFreshness.module.css`: "Última lectura hace X min" y la fecha y hora, o "Sin lecturas desde las HH:MM" con "hace 3 h"
- [X] T056 [US1] Crear `src/features/estado/hooks/useEstadoPaso.ts`: toma el escenario de `useScenario`, limpia las lecturas y calcula `classifyState` con el `now` del escenario
- [X] T057 [US1] Crear `src/features/estado/components/EstadoActualScreen.tsx` y `src/features/estado/index.ts`: dos columnas (izquierda 7/12 con bloque de estado y nivel contra el paso; derecha 5/12 con antigüedad del dato), título "Estado actual" con "Para: encargado del comité", `Notice` con el aviso de lecturas descartadas cuando `discardedCount > 0`; sigue `docs/design/estado-actual.html`
- [X] T058 [US1] Conectar `EstadoActualScreen` en `src/app/App.tsx` para la ruta `#/estado` y comprobar con `npm test` y `npm run typecheck`

**Punto de control**: Estado actual funciona y se puede probar solo.

---

## Fase 4: Historia de usuario 2 — Elegir el escenario y reconocer que los datos son simulados (Prioridad: P1)

**Objetivo**: que quien presenta cambie de escenario sin tocar archivos, vea siempre "Datos simulados" y pueda abrir el panel con doble clic.

**Prueba independiente**: cambiar entre todos los escenarios con el selector y comprobar que la pantalla se actualiza sin recargar, con la etiqueta siempre visible; abrir `dist/index.html` con doble clic.

### Pruebas de la historia 2

- [X] T059 [P] [US2] Escribir `tests/components/SimStrip.test.tsx`: muestra "Datos simulados", la nota de umbrales provisionales solo cuando `assumed` es verdadero, el selector "Escenario de ejemplo" con los grupos "Demostración" y "Casos de prueba", y que al elegir otro escenario se pide el cambio sin recargar
- [X] T060 [P] [US2] Escribir `tests/unit/sinRelojReal.test.ts`: guardia que falla si algún archivo de `src/core/` o `src/features/` usa `Date.now(`, `new Date()` sin argumentos o `performance.now` (FR-032)
- [X] T061 [P] [US2] Escribir `tests/unit/ahoraFijo.test.ts`: con temporizadores simulados que avanzan 30 minutos, el estado y la antigüedad de un escenario no cambian (SC-010)

### Implementación de la historia 2

- [X] T062 [P] [US2] Crear `src/app/ScenarioSelector.tsx`: `Select` con la etiqueta visible "Escenario de ejemplo" y los grupos "Demostración" y "Casos de prueba" tomados del repositorio
- [X] T063 [US2] Crear `src/app/SimStrip.tsx` y `SimStrip.module.css`: franja neutra con borde discontinuo bajo la cabecera con "Datos simulados · No son lecturas reales del arroyo. Los umbrales de ejemplo son provisionales." (la nota solo con `assumed`) y el selector al extremo derecho
- [X] T064 [US2] Integrar `SimStrip` en `src/app/App.tsx`: `setScenario` actualiza el `hash` sin recargar y conserva la pantalla activa
- [X] T065 [US2] Ejecutar la Validación 2 de `quickstart.md` (`npm run build`, `npm run verify:dist` y abrir `dist/index.html` con doble clic en una máquina sin Node ni internet) y anotar el resultado en `specs/001-panel-estado-pronostico/reporte-validacion.md`

**Punto de control**: las historias 1 y 2 funcionan juntas; ya se puede demostrar Estado actual.

---

## Fase 5: Historia de usuario 3 — Copiar un mensaje de ejemplo para avisar (Prioridad: P2)

**Objetivo**: mostrar el mensaje de ejemplo del estado vigente, permitir copiarlo y confirmar que se copió, sin enviar nada.

**Prueba independiente**: en cada estado comprobar que el mensaje corresponde, que se copia y que el panel confirma.

### Pruebas de la historia 3

- [X] T066 [P] [US3] Escribir `tests/unit/copyText.test.ts`: usa `navigator.clipboard.writeText` y, si falla, el respaldo por selección y `execCommand('copy')`
- [X] T067 [P] [US3] Escribir `tests/components/BroadcastMessage.test.tsx`: el mensaje de cada estado, "Copiar mensaje" copia el texto y muestra "Mensaje copiado", con "Sin datos" el mensaje NUNCA afirma que el paso es seguro, y aparece "El panel no envía nada. Tú confirmas y avisas."

### Implementación de la historia 3

- [X] T068 [P] [US3] Crear `src/core/utils/copyText.ts` con la copia al portapapeles y su respaldo
- [X] T069 [US3] Crear `src/ui/components/BroadcastMessage.tsx` y `BroadcastMessage.module.css`: tarjeta "Qué avisar" con la etiqueta "Sugerido", el mensaje como cita con barra lateral (sin caja anidada) y el botón primario "Copiar mensaje" (la única sombra `shadow-sm` de la pantalla)
- [X] T070 [US3] Integrar `BroadcastMessage` en la columna derecha de `src/features/estado/components/EstadoActualScreen.tsx` con el mensaje de `src/core/i18n/textos.ts` según `kind`

**Punto de control**: Estado actual está completa según la maqueta.

---

## Fase 6: Historia de usuario 4 — Leer el pronóstico de creciente como un rango (Prioridad: P2)

**Objetivo**: mostrar una conclusión en una frase, el nivel actual, el ritmo y una gráfica con banda de incertidumbre, siempre como rango.

**Prueba independiente**: con los escenarios de subida comprobar la conclusión, los rangos, el ritmo y la gráfica.

### Pruebas de la historia 4

- [X] T071 [P] [US4] Crear `tests/casos/pronostico.json` con los casos de pronóstico calculados a mano que producen proyección: P01, P06, P07, P08, P09, P10 y P11 de `contracts/pronostico.md`, más subida acelerada, ruido, redondeo hacia afuera, un umbral exactamente en el horizonte (`beyond`) y dos casos `range` y `from` adicionales; cada caso con lecturas, configuración, `now` y resultado esperado (junto con la tarea T088 suman 20 o más, FR-031)
- [X] T072 [P] [US4] Escribir `tests/unit/forecast.test.ts`: recorre `tests/casos/pronostico.json` y comprueba que con las mismas lecturas y configuración el resultado es siempre el mismo y que una lectura espuria no cambia bruscamente el ritmo ni el nivel de partida (P09)
- [X] T073 [P] [US4] Escribir `tests/unit/robustTrend.test.ts`: mediana, cuartiles 25 y 75, pares separados al menos 5 min, piso de incertidumbre `max(0.3 × ritmo, 10)` mm/h y nivel de partida como mediana de `nivel − ritmo × (horas desde now)`
- [X] T074 [P] [US4] Escribir `tests/unit/buildConclusion.test.ts`: las frases de la tabla de redacción de `contracts/pronostico.md`, tiempos sin ceros sobrantes ("2.5", "4") y que ninguna frase contiene "más de" ni "hay tiempo"
- [X] T075 [P] [US4] Escribir `tests/components/ConclusionCard.test.tsx`: frase como lo más grande, un renglón por umbral ("entre A y B h", "a partir de A h", "ya superado", "No se proyecta en las próximas N h"), nivel actual, ritmo con su rango con la misma precisión, nivel proyectado, antigüedad, nota "Proyección, no medición" y aviso de lluvia
- [X] T076 [P] [US4] Escribir `tests/components/ForecastChart.test.tsx`: dibuja nivel real, proyección discontinua, banda de relleno sólido sin degradado, líneas de umbral con la etiqueta y el color de su estado, "ahora", periodo y unidad, y la tabla alternativa "Ver datos como tabla"

### Implementación de la historia 4

- [X] T077 [US4] Agregar a `scripts/generar-escenarios.mjs` las definiciones de `ciclon-inicio` (sube 60 mm/h hasta 420 mm), `subida-acelerada` (el ritmo crece de 40 a 100 mm/h; nivel final 520 mm) y `ruido` (subida lenta con ruido de ±20 mm); ejecutar `npm run generar:escenarios`
- [X] T078 [US4] Crear `src/features/pronostico/types.ts` con el tipo `Pronostico` de `data-model.md`: `kind`, `reason`, `rate`, `rateLow`, `rateHigh`, `startLevelMm`, `thresholds` (`exceeded`, `range`, `from`, `beyond`), `band` y `summaryLevel`
- [X] T079 [P] [US4] Crear `src/features/pronostico/services/robustTrend.ts`: pendientes entre pares, mediana, cuartiles, piso de incertidumbre y nivel de partida
- [X] T080 [US4] Crear `src/features/pronostico/services/forecast.ts`: función pura `forecast(readings, config, now)` con los Pasos 2 a 4 de `contracts/pronostico.md` para series que suben (ritmo y rango, nivel de partida, tiempo hasta cada umbral redondeado hacia afuera a 0.5 h con `exceeded`, `range`, `from` y `beyond`, banda cada 0.5 h y nivel proyectado a `horizon_h / 2`); todos los parámetros salen de `config`
- [X] T081 [P] [US4] Crear `src/features/pronostico/services/buildConclusion.ts`: arma la frase y los renglones por umbral con los textos de `src/core/i18n/textos.ts`
- [X] T082 [P] [US4] Crear `src/ui/components/AssumptionTag.tsx` y `Disclosure.tsx` (con sus `.module.css`): etiqueta "Supuesto" y sección plegable cuyo resumen siempre se ve
- [X] T083 [P] [US4] Crear `src/ui/components/ConclusionCard.tsx` y `ConclusionCard.module.css`: tarjeta principal (`shadow-md`) con la frase en lo más grande, un renglón por umbral con su forma de estado, nivel actual, ritmo y rango, nivel proyectado, antigüedad, nota "Proyección, no medición" y el aviso "Una lluvia intensa puede acelerar la subida y hacer que esta proyección se quede corta"
- [X] T084 [P] [US4] Crear `src/ui/components/ForecastChart.tsx` y `ForecastChart.module.css`: gráfica en SVG propio con líneas de `stroke-chart` (2 px), banda de relleno sólido `accent-soft` con borde discontinuo, líneas de umbral con color de estado y etiqueta, línea de "ahora", eje en mm, leyenda y tabla alternativa; sin sombras ni degradados
- [X] T085 [US4] Crear `src/features/pronostico/hooks/usePronostico.ts`: toma el escenario de `useScenario`, limpia las lecturas y calcula `forecast` con el `now` del escenario
- [X] T086 [US4] Crear `src/features/pronostico/components/PronosticoScreen.tsx` y `src/features/pronostico/index.ts`: conclusión a la izquierda (4/12), gráfica a la derecha (8/12) con la etiqueta "Datos simulados" y debajo "Cómo se calcula" con el resumen siempre visible, `AssumptionTag`, el aviso de lluvia y los parámetros tras "Ver parámetros"; sigue `docs/design/pronostico.html`
- [X] T087 [US4] Conectar `PronosticoScreen` en `src/app/App.tsx` para la ruta `#/pronostico` y comprobar con `npm test` y `npm run typecheck`

**Punto de control**: el Pronóstico funciona con escenarios de subida.

---

## Fase 7: Historia de usuario 5 — Entender cuándo no hay pronóstico (Prioridad: P2)

**Objetivo**: que el panel diga "Sin pronóstico", la razón y qué hacer cuando faltan lecturas, los datos son viejos o el nivel no sube, sin proyectar.

**Prueba independiente**: con los escenarios de pocas lecturas, datos viejos, nivel que baja y nivel plano comprobar que ninguno muestra una proyección.

### Pruebas de la historia 5

- [X] T088 [P] [US5] Agregar a `tests/casos/pronostico.json` los casos sin proyección de `contracts/pronostico.md`: P02 (`falling`), P03 (`flat`), P04 (`few_readings`), P05 (`stale`), el límite exacto de `flat_rate_mm_h`, y una lectura imposible que deja menos lecturas que el mínimo; con T071 el total llega a 20 o más casos
- [X] T089 [P] [US5] Escribir `tests/components/NoForecastCard.test.tsx`: título, razón y qué hacer de cada `reason` (tabla de `contracts/pronostico.md`), tono neutro con ícono de información y ningún tiempo hasta el umbral
- [X] T090 [P] [US5] Escribir `tests/components/ForecastChartAnchoCompleto.test.tsx`: sin pronóstico la gráfica usa todo el ancho para las últimas 6 h y no reserva espacio ni marcas de tiempo futuras

### Implementación de la historia 5

- [X] T091 [US5] Agregar a `scripts/generar-escenarios.mjs` las definiciones de `estiaje` (baja despacio de 200 a 150 mm), `nivel-baja` (pico de 500 mm y bajada de unos 20 mm/h hasta 450 mm), `nivel-plano` (420 mm constantes) y `pocas-lecturas` (solo 3 lecturas, de 380 a 420 mm); ejecutar `npm run generar:escenarios`
- [X] T092 [US5] Ampliar `src/features/pronostico/services/forecast.ts` con el Paso 1 y la regla de ritmo de `contracts/pronostico.md`: `stale` (sin lecturas válidas o última más vieja que `max_reading_age_min`), `few_readings` (menos de `forecast.min_readings` en la ventana), `falling` (ritmo menor que −`flat_rate_mm_h`) y `flat` (valor absoluto menor o igual que `flat_rate_mm_h`), con ese orden de prioridad
- [X] T093 [P] [US5] Crear `src/ui/components/NoForecastCard.tsx` y `NoForecastCard.module.css`: tarjeta principal neutra con ícono de información, título, razón y qué hacer, y las filas de nivel (o "Último nivel conocido"), ritmo y última lectura
- [X] T094 [US5] Agregar a `src/ui/components/ForecastChart.tsx` el modo de ancho completo para series sin proyección (últimas 6 h en todo el ancho, sin marcas futuras ni espacio reservado)
- [X] T095 [US5] Actualizar `src/features/pronostico/components/PronosticoScreen.tsx` para elegir `ConclusionCard` o `NoForecastCard` según `kind` y mostrar el último nivel conocido y su antigüedad cuando los datos son viejos

**Punto de control**: el Pronóstico es honesto en todos los casos.

---

## Fase 8: Historia de usuario 6 — Navegar entre Estado actual y Pronóstico (Prioridad: P2)

**Objetivo**: cambiar de pantalla con una barra visible, con teclado y mouse, sin recargar.

**Prueba independiente**: recorrer las dos pantallas solo con teclado y solo con mouse.

### Pruebas de la historia 6

- [X] T096 [P] [US6] Escribir `tests/components/RoleNav.test.tsx`: dos botones con su rol ("Para: encargado del comité" y "Para: comité"), `aria-current="page"` en el activo con relleno `accent`, y se pueden recorrer y activar con teclado con foco visible
- [X] T097 [P] [US6] Escribir `tests/unit/useRouteNavegacion.test.ts`: `navigate` cambia de pantalla conservando el escenario elegido y sin recargar la página

### Implementación de la historia 6

- [X] T098 [US6] Crear `src/ui/components/RoleNav.tsx` y `RoleNav.module.css`: botones con borde `ink`, sin sombra, el rol debajo del nombre; el activo con relleno `accent` y texto `on-accent`
- [X] T099 [US6] Integrar `RoleNav` en la cabecera de `src/app/App.tsx` con enlaces que conservan el escenario (`#/estado?e=…` y `#/pronostico?e=…`)

**Punto de control**: las dos pantallas están completas y conectadas.

---

## Fase 9: Historia de usuario 7 — Confiar en que el estado coincide con el de la baliza (Prioridad: P2)

**Objetivo**: comprobar la regla completa contra una tabla de casos de referencia.

**Prueba independiente**: ejecutar la tabla de casos y comprobar que todos coinciden con el estado esperado.

### Pruebas de la historia 7

- [X] T100 [P] [US7] Crear `tests/casos/clasificacion.json` con los 20 casos C01 a C20 de `contracts/clasificacion-estado.md` (lecturas, configuración, `now`, estado esperado y `discardedCount`)
- [X] T101 [P] [US7] Escribir `tests/unit/classifyState.referencia.test.ts`: recorre `tests/casos/clasificacion.json`; si un caso falla, se revisa la regla en conjunto y NO se ajusta el resultado esperado para que "pase"

### Implementación de la historia 7

- [X] T102 [US7] Corregir `src/features/estado/services/classifyState.ts` solo si algún caso de la tabla falla, sin cambiar los resultados esperados; si la regla del contrato resulta ambigua, anotar la decisión en `docs/decisiones.md`

**Punto de control**: la regla de clasificación está verificada contra la tabla de referencia.

---

## Fase 10: Cierre y asuntos transversales

**Propósito**: documentación, validación de extremo a extremo y revisión final.

- [X] T103 [P] Crear `README.md` en español en la raíz: qué es el panel, cómo abrir `dist/index.html` con doble clic, comandos (`dev`, `test`, `typecheck`, `build`, `verify:dist`, `generar:escenarios`), estructura de carpetas y lista de escenarios
- [X] T104 [P] Actualizar `docs/design-system-panel.md` (la ruta de los tokens pasa a `src/core/tokens/tokens.ts`) y `docs/sprints/sprint-1-mvp-estado-y-pronostico.md` (13 escenarios en dos grupos, `group` en `escenario.json` y el campo `plausible_level_mm` y `flat_rate_mm_h` de la configuración)
- [X] T105 [P] Registrar en `docs/decisiones.md` la excepción del interruptor de tema oscuro (tokens de ambos temas sin interruptor hasta que una maqueta lo incluya), el método del pronóstico (mediana de pendientes con piso de incertidumbre) y la entrega en un solo archivo
- [X] T106 Revisar el contraste del tema claro contra las tablas de `docs/design-system-panel.md`, que los controles midan al menos 40 px de alto, el foco visible y la navegación completa con teclado (Validación 6 de `quickstart.md`)
- [X] T107 Comparar capturas de 1440 × 900 de `dist/index.html` con las maquetas de `docs/design/` para ambas pantallas y todas sus variantes (Validación 5 de `quickstart.md`) y corregir las diferencias de composición, jerarquía y tamaños relativos
- [X] T108 Ejecutar las Validaciones 1, 3 y 4 de `quickstart.md` (pruebas, flujo de la demostración y "ahora" fijo con los umbrales) y registrar los resultados en `specs/001-panel-estado-pronostico/reporte-validacion.md`
- [X] T109 Medir y anotar en `specs/001-panel-estado-pronostico/reporte-validacion.md`: abrir un escenario completo en menos de 5 segundos (SC-011), cambiar de escenario en menos de 3 segundos con a lo sumo 2 interacciones (SC-002) y el tamaño de `dist/index.html` (meta deseable: menos de 1 MB)
- [ ] T110 Probar con un lector de pantalla real (NVDA o Narrador) que el cambio de estado se anuncia y que la gráfica tiene su tabla (CA-15) y anotar el resultado en `specs/001-panel-estado-pronostico/reporte-validacion.md`
- [X] T111 Ejecución final limpia de `npm test`, `npm run typecheck`, `npm run build` y `npm run verify:dist`

---

## Dependencias y orden de ejecución

### Dependencias entre fases

- **Preparación (Fase 1)**: sin dependencias; puede empezar de inmediato.
- **Base (Fase 2)**: depende de la Preparación y **bloquea** todas las historias.
- **Historias (Fases 3 a 9)**: todas dependen de la Base y se pueden hacer en orden de prioridad (P1 antes que P2).
- **Cierre (Fase 10)**: depende de las historias que se quieran entregar.

### Dependencias entre historias

- **US1 (P1)**: empieza tras la Base; no depende de otras historias.
- **US2 (P1)**: empieza tras la Base; se integra con US1 en `App.tsx`, pero se prueba sola con la cabecera mínima.
- **US3 (P2)**: depende de que exista `EstadoActualScreen` (US1).
- **US4 (P2)**: empieza tras la Base; la pantalla se conecta en `App.tsx` como US1.
- **US5 (P2)**: extiende los archivos de US4 (`forecast.ts`, `ForecastChart.tsx` y `PronosticoScreen.tsx`); va después de US4.
- **US6 (P2)**: necesita las dos pantallas (US1 y US4).
- **US7 (P2)**: verifica el servicio de US1.

### Dentro de cada historia

- Las pruebas se escriben primero y deben fallar antes de implementar.
- Tipos y servicios antes que hooks; hooks antes que pantallas; pantalla antes de conectarla en `App.tsx`.
- Las tareas que modifican `scripts/generar-escenarios.mjs`, `src/app/App.tsx` o `forecast.ts` no son paralelas entre sí.

### Oportunidades de paralelismo

- En la Preparación: T003 a T007.
- En la Base: T008, T011 y T012; T014, T015 y T017 a T019; T022 y T025; T028 a T033 y T035; T036.
- En US1: T042 a T047 (pruebas) y luego T051, T052, T054 y T055.
- En US4: T071 a T076 (pruebas) y luego T079, T081, T082, T083 y T084.
- Con varias personas: tras la Base, una persona hace US1 → US2 → US3 y otra US4 → US5; US6 y US7 al final.

---

## Ejemplo de paralelismo: Historia 1

```text
# Lanzar juntas todas las pruebas de la historia 1:
Tarea: "Escribir tests/unit/classifyState.test.ts"
Tarea: "Escribir tests/unit/distanceToNext.test.ts"
Tarea: "Escribir tests/components/StatusBanner.test.tsx"
Tarea: "Escribir tests/components/LevelGauge.test.tsx"
Tarea: "Escribir tests/components/DataFreshness.test.tsx"
Tarea: "Escribir tests/components/EstadoActualScreen.test.tsx"

# Lanzar juntos los componentes de la historia 1:
Tarea: "Crear src/ui/components/StatusShape.tsx"
Tarea: "Crear src/ui/components/LevelGauge.tsx"
Tarea: "Crear src/ui/components/DataFreshness.tsx"
```

---

## Estrategia de implementación

### Primero lo mínimo demostrable (historias 1 y 2)

1. Completar la Fase 1 (Preparación) y la Fase 2 (Base), incluida T041 que prueba la apertura con doble clic.
2. Completar la Fase 3 (US1) y la Fase 4 (US2).
3. **DETENERSE Y VALIDAR**: Estado actual con el selector de escenarios, abierto con doble clic. Ya se puede demostrar.

### Entrega incremental

1. Base lista → US1 + US2 → demostrar Estado actual (primera demostración).
2. Agregar US3 → Estado actual completa según la maqueta.
3. Agregar US4 y US5 → Pronóstico honesto en todos los casos.
4. Agregar US6 → navegación entre pantallas (aquí queda el MVP completo).
5. Agregar US7 → regla verificada contra la tabla de referencia.
6. Cierre → validaciones, capturas contra las maquetas y reporte.

### Alcance sugerido del MVP

Todo el MVP son las 7 historias. Si hay que recortar, el mínimo con valor son **US1 + US2** (el semáforo con el selector de escenarios), y el siguiente paso natural es **US4 + US5 + US6** (pronóstico y navegación).

---

## Fase final: unidades en mm y lluvia (cambio del 2026-10-16)

Pedido del usuario: que los datos se lean como en una app del clima (agua en mm, no en cm) y que se vea la lluvia acumulada.

- [X] T111 Pasar niveles, umbrales y rangos de cm a mm en esquemas, datos, escenarios, textos y pruebas (campos `*_mm`)
- [X] T112 Agregar `rain_mm` a las lecturas y `rain_windows_h` a la configuración (`src/core/schemas/`)
- [X] T113 Calcular la lluvia acumulada por ventana en `src/core/readings/rainTotals.ts`, con prueba
- [X] T114 Crear `RainCard` y mostrarla en Estado actual; fila "Lluvia en la última hora" en Pronóstico
- [X] T115 Regenerar los 13 escenarios con lluvia (`scripts/generar-escenarios.mjs`) y validar en Chrome real (57 comprobaciones)
- [X] T116 Sincronizar documentos y contratos en mm
- [X] T117 Aprobar de nuevo la composición (tarjeta "Lluvia") y actualizar las maquetas `docs/design/estado-actual.html` y `pronostico.html`

- [X] T118 Rediseñar la interfaz con estilo profesional: tokens (paleta, radios, sombras suaves), barra lateral y barra superior, tarjetas, medidor de arco, tira "Proyección por hora"; enmendar la constitución a v3.0.0 y el sistema de diseño
- [X] T119 Agregar la pantalla "Mapa" (`#/mapa`): mapa vectorial de Huauchinango (con Necaxa) y Xicotepec de Juárez con balizas de ejemplo sobre el arroyo La Morena (`scripts/generar-mapa.mjs`, `data/mapa/region.json`, `src/features/mapa/`, `RegionMap`), con pruebas

---

## Notas

- [P] = archivos distintos, sin dependencias pendientes.
- La etiqueta [Historia] enlaza cada tarea con su historia para dar trazabilidad.
- Verificar que las pruebas fallen antes de implementar.
- Hacer un commit después de cada tarea o grupo lógico (Conventional Commits: tipo y alcance en inglés, descripción en español).
- Ningún valor de umbral, horizonte, ventana, mínimo ni rango plausible se escribe en el código: todo sale de `config.json`.
- Ninguna función lee el reloj real: el "ahora" sale siempre del escenario.
- No se implementa una pantalla en un estado distinto al de su maqueta aprobada de `docs/design/`; un cambio de composición se aprueba de nuevo.
- Evitar: tareas vagas, conflictos en el mismo archivo y dependencias entre historias que rompan su independencia.
