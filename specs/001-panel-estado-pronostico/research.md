# Investigación (Fase 0): Panel de monitoreo (MVP)

Cada entrada tiene Decisión, Justificación y Alternativas consideradas. No quedan incógnitas sin resolver. Las versiones exactas de las dependencias se fijan al crear el proyecto, verificando la versión estable vigente (principio VI).

## R1. Entrega con doble clic

- **Decisión**: la entrega es **un solo `index.html`** con el código, los estilos y la tipografía en línea. Se genera con `vite build` y un script posterior propio (`scripts/inline-build.mjs`, unas 40 líneas) que reemplaza el `<script type="module" src>` y el `<link rel="stylesheet">` por su contenido en línea, y conserva los tipos de letra como `data:` en el CSS.
- **Justificación**: se probó en Chrome el 2026-10-16 con archivos locales:
  - `<script type="module" src="./m.js">` → **falla** (origen nulo en `file://`).
  - `<script type="module">…</script>` en línea → funciona, con `window.isSecureContext = true` y `navigator.clipboard` disponible.
  - `<script src defer>` clásico externo → funciona.
  Un módulo en línea no necesita ninguna petición, así que es la forma más segura. Además el panel queda en un solo archivo fácil de copiar.
- **Detalles**: sin división de código (`inlineDynamicImports`), CSS en un solo archivo (`cssCodeSplit: false`), `assetsInlineLimit` alto para que la fuente se incruste, y se escapa cualquier `</script>` dentro del código. La salida debe no contener ninguna URL `http(s)://` de recursos (se verifica en `quickstart.md`).
- **Alternativas**:
  - `vite-plugin-singlefile`: hace lo mismo pero agrega una dependencia; es el plan B si el script propio falla.
  - Compilar a un script clásico (IIFE) externo: funciona, pero deja varios archivos y Vite no lo soporta bien para aplicaciones.
  - Servidor local: descartado por la aclaración del 2026-10-16 (doble clic, sin comandos).
  - PWA: no funciona en `file://` (los service workers exigen http o https); queda para el Sprint 2B.

## R2. Cómo se incluyen los escenarios

- **Decisión**: cada escenario es una carpeta `data/escenarios/<id>/` con `escenario.json`, `config.json` y `readings.json`. Se incluyen en la aplicación con `import.meta.glob(..., { eager: true })` y solo los lee el repositorio `ScenarioRepository`, que los pasa por los esquemas Zod. La interfaz nunca toca los JSON directamente.
- **Justificación**: los JSON incluidos funcionan sin `fetch` (que falla en `file://`) y mantienen el principio V (solo repositorios acceden a los datos, detrás de una interfaz que permite cambiar el origen más adelante).
- **Alternativas**: leer con `fetch` (falla en `file://`); un selector manual de carpeta (pasos extra para quien presenta); incrustar los datos como objetos TypeScript (pierde el formato JSON que es el contrato del producto).

## R3. "Ahora" fijo por escenario

- **Decisión**: `escenario.json` define `now` (ISO 8601 con zona horaria). Todas las antigüedades y la regla de "vieja" se calculan contra ese `now`, que se pasa como parámetro a las funciones puras. Ninguna función lee el reloj real.
- **Justificación**: aclaración del 2026-10-16 (FR-032, SC-010). Además hace que las funciones puras sean fáciles de probar y reproducibles.
- **Alternativas**: desplazar las marcas de tiempo al abrir el panel (hace que los archivos "cambien" y complica las pruebas); reloj real (descartado: el panel pasaría a "Sin datos" a media presentación).

## R4. Clasificación del estado

- **Decisión**: función pura `classifyState(readings, config, now)`. Descarta lecturas futuras (más de 60 s) y las imposibles, ordena por hora (misma hora: vale la última del archivo) y recorre las lecturas manteniendo el estado con la regla de lecturas sostenidas y reinicio por hueco. Detalle y casos en `contracts/clasificacion-estado.md`.
- **Justificación**: reproduce la regla del insumo (sección 7): arranque con banda más alta, subir con `readings_to_raise` lecturas seguidas, bajar con `readings_to_lower`, valor igual al umbral cuenta como alcanzado, hueco mayor que `max_reading_age_min` reinicia.
- **Alternativas**: evaluar solo la última lectura (rompe la regla de la baliza y deja pasar espurias); media móvil (suaviza pero no coincide con la lógica de la baliza).

## R5. Método del pronóstico

- **Decisión**: tendencia robusta tipo **Theil–Sen** sobre la ventana reciente (`window_min`, 120 min en los ejemplos):
  - **Ritmo** = mediana de las pendientes entre todos los pares de lecturas (separadas al menos 5 min).
  - **Rango del ritmo** = cuartiles 25 y 75 de esas pendientes, con un **piso**: la amplitud nunca baja de `max(30 % del ritmo, 10 mm/h)`, para que un tramo perfectamente recto no parezca exacto.
  - **Nivel de partida** = mediana de `nivel − ritmo × (hora − ahora)` sobre la ventana (robusto a una lectura espuria al final).
  - **Tiempo hasta un umbral** = `(umbral − nivel de partida) / ritmo`, con el ritmo alto para el extremo temprano y el bajo para el tardío; se redondea **hacia afuera** a 0.5 h. La banda del nivel crece de forma lineal con el tiempo (abanico).
  - Detalle y reglas de texto en `contracts/pronostico.md`.
- **Justificación**: es explicable, reproducible y robusta a una lectura aislada sin sumar dependencias. Con una subida lineal de 60 mm/h desde 420 mm reproduce exactamente las cifras de la maqueta aprobada: Revisar "entre 2.5 y 4 h", No cruzar "no se proyecta en las próximas 6 h" y "entre 570 y 630 mm en 3 h".
- **Supuesto**: el piso del 30 % y el redondeo a 0.5 h son supuestos del método; se muestran en "Cómo se calcula" con la etiqueta "Supuesto". El cálculo solo extrapola el ritmo: no sabe de lluvia ni de saturación del suelo (de ahí el aviso fijo).
- **Alternativas**: regresión lineal por mínimos cuadrados (sensible a espurias y no da un rango natural); media de los últimos N puntos (muy sensible al ruido); modelos con lluvia (fuera de alcance).

## R6. Lecturas imposibles

- **Decisión**: `config.json` incluye `plausible_level_mm` (mínimo y máximo, ejemplo 0 a 3000 mm). Una lectura fuera de ese rango se **descarta** y el panel muestra un aviso "Se descartó N lectura(s) fuera de rango". Si no quedan lecturas válidas suficientes, el estado es "Sin datos" y el Pronóstico no proyecta.
- **Justificación**: aclaración del 2026-10-16 (FR-033). Tener el rango en la configuración respeta que ningún valor se escribe en el código. Es un supuesto provisional, como los umbrales.
- **Alternativas**: rechazar el archivo entero (se queda sin datos por una sola lectura mala); usarla (un sensor averiado daría un semáforo falso).

## R7. Estado de la aplicación y navegación

- **Decisión**: hooks de React y un contexto mínimo (`DataProvider`) que guarda el escenario activo; sin Zustand. Navegación por `hash` (`#/estado`, `#/pronostico`) sin librería de rutas, y el escenario activo viaja en el `hash` (`#/pronostico?e=ciclon`).
- **Justificación**: dos pantallas no justifican dependencias (principio VI); el `hash` funciona en `file://`, conserva la pantalla y el escenario al recargar y se maneja con teclado y mouse.
- **Alternativas**: React Router (dependencia innecesaria); Zustand (innecesario para un solo valor compartido); `localStorage` (no hace falta y la constitución lo reserva a preferencias menores).

## R8. Gráfica

- **Decisión**: componente `ForecastChart` en SVG propio, con líneas de 2 px, banda de relleno sólido sin degradado, líneas de umbral con el color de su estado y una tabla alternativa para lectores de pantalla.
- **Justificación**: es lo que fija la constitución (sin librería salvo necesidad) y el sistema de diseño; la maqueta aprobada ya define su forma.
- **Alternativas**: librerías de gráficas (peso y dependencia innecesarios).

## R9. Tokens, estilos y tipografía

- **Decisión**: los tokens viven en `src/core/tokens/` como única fuente (incluidos los tres hex de estado y las dos sombras sólidas). `src/ui/theme/` los convierte en variables CSS para el tema claro y el oscuro. Los componentes usan CSS Modules con `var(--…)`. Pruebas de guardia vigilan hex únicos, ausencia de degradados, `text-shadow`, `drop-shadow` y sombras con desenfoque, y valores sueltos. La tipografía Inter es un único archivo variable `woff2` (subconjunto latino, pesos 400 a 800) que se copia una vez al repositorio y se incrusta en el CSS; la fuente no es una dependencia de ejecución.
- **Justificación**: cumple los principios IV y IX y funciona sin red.
- **Alternativas**: CDN de fuentes (prohibido); pesos separados (más peso para el mismo resultado).

## R10. Íconos

- **Decisión**: `lucide-react`, importado ícono por ícono desde `src/ui/icons.ts` (aprobada por el autor el 2026-10-16). Las formas de estado (círculo, triángulo, octágono, rombo) son SVG propios en `StatusShape`.
- **Alternativas**: SVG propios para todo (más trabajo sin beneficio).

## R11. Textos

- **Decisión**: todos los textos de la interfaz, incluidos los mensajes de ejemplo para avisar, están en `src/core/i18n/` en español. Los componentes reciben o piden los textos desde ahí.
- **Justificación**: principio IX y FR-029; facilita revisar la redacción con el comité.

## R12. Copiar el mensaje

- **Decisión**: `navigator.clipboard.writeText` (disponible en `file://` en Chrome, verificado), con respaldo por selección y `execCommand('copy')` si falla, y confirmación visible "Mensaje copiado".
- **Alternativas**: solo el respaldo antiguo (obsoleto); sin respaldo (frágil en otros navegadores).

## R13. Pruebas

- **Decisión**: Vitest para la lógica (tablas de casos calculadas a mano) y React Testing Library con jsdom para los componentes críticos (semáforo, rango del pronóstico, etiqueta de simulado, mensaje). Las tablas viven en `tests/casos/`. La apertura con doble clic, la ausencia de peticiones externas y la comparación con las maquetas se verifican con Chrome real (comandos en `quickstart.md`).
- **Alternativas**: Playwright (dependencia fuera del núcleo permitido; se puede reconsiderar después).

## R14. Tema oscuro

- **Decisión**: se definen los tokens de ambos temas, pero el MVP **no incluye el interruptor** hasta que una maqueta lo muestre (ver "Seguimiento de la complejidad" en `plan.md`).
- **Justificación**: no cambiar la composición aprobada; la especificación excluye la auditoría completa del tema oscuro.
