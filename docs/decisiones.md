# Decisiones técnicas del Panel Piski

Registro de las decisiones técnicas importantes (Constitución, "Flujo de Desarrollo").

> **Estado del proyecto (2026-10-16):** no hay código. Un intento previo se descartó porque la interfaz no
> cumplía lo que necesita el panel. Las decisiones técnicas de abajo son **propuestas** y se confirman al
> implementar; lo único firme son las decisiones del autor de la sección siguiente. El detalle de cada
> propuesta se escribirá en `specs/<feature>/research.md` cuando exista la feature.

## Decisiones del autor

### Alcance y usuarios (2026-10-16)

- **Solo escritorio.** El panel lo usan encargados y líderes desde una computadora. No se diseña ni se prueba para celular ni tableta. Tamaño de referencia: 1440 × 900.
- **El panel es informativo.** Sin animaciones ni adornos; el encargado lo lee y avisa a la gente cercana. El vecino no usa el panel.
- **El panel no envía avisos.** Sugiere un mensaje ("Qué avisar") y una persona confirma y difunde.
- **Este repositorio construye solo el panel.** Los demás módulos (simulador, firmware, carcasa y 3D, infraestructura verde) son de otros equipos y no se documentan aquí. Se eliminó `docs/entregas/`.
- **Maqueta antes de código.** Cada pantalla tiene una maqueta aprobada en `docs/design/` y no se implementa sin ella. Las maquetas de Estado actual y Pronóstico quedaron **aprobadas el 2026-10-16**.
- **Estilo neobrutalista minimalista** (antes Flat Design): borde de 2 px en `ink`, colores sólidos, mucho aire, pocas cajas y una sombra sólida desplazada solo en lo principal de cada pantalla (`shadow-md` en el bloque principal, `shadow-sm` en el botón principal), sin desenfoque ni degradados. Se descartó el glassmorfismo por contraste variable, necesidad de fondos con degradado y rendimiento. La constitución sube a 2.0.0.
- **Tema claro por defecto**, sin seguir el tema del sistema.
- **Fase de demostración local.** Por ahora la app solo sirve para mostrar, con datos JSON locales y simulados. No hay "modo real"; el selector de escenarios es el control de quien presenta y está siempre a la vista. La interfaz sigue diseñándose como herramienta informativa real.
- **Los sprints 1 y 2A se fusionaron** en un solo sprint, el MVP (`sprints/sprint-1-mvp-estado-y-pronostico.md`). El **Sprint 2B (sin red) queda opcional**.
- **Redacción segura del pronóstico:** nunca "más de N h"; se dice "No se proyecta en las próximas N h", con el aviso de que una lluvia intensa puede acelerar la subida. Los mensajes de "Qué avisar" son ejemplos de la demostración, no un protocolo.
- **Controles de 40 px** de alto como mínimo (antes 48 px táctiles).
- **Metas de rendimiento** (pronóstico < 100 ms, bundle < 250 KB comprimido): se dejan como deseables, no como criterio de terminado.

### Decisiones de `/speckit-clarify` (2026-10-16)

Registradas en `specs/001-panel-estado-pronostico/spec.md`, sección "Aclaraciones".

- **"Ahora" fijo por escenario:** el estado y la antigüedad del dato no cambian por el paso del tiempo real.
- **Valores iniciales (supuestos provisionales):** subir de estado con 3 lecturas seguidas, bajar con 5, lectura vieja a partir de 30 minutos. La ventana de 2 h, el mínimo de 6 lecturas y el horizonte de 6 h salen de las maquetas aprobadas.
- **Lectura imposible:** se descarta con un aviso que dice cuántas se descartaron; si no quedan suficientes, "Sin datos".
- **Entrega con doble clic:** una carpeta que abre en el navegador, sin instalar nada, sin comandos y sin internet. La constitución subió a 2.1.0.

### Decisiones del plan y de la implementación (2026-10-16)

Detalle y alternativas en `specs/001-panel-estado-pronostico/research.md`.

- **Entrega en un solo archivo.** `dist/index.html` con todo en línea. Se verificó en Chrome que un `<script type="module" src>` externo falla al abrir un archivo local y que un módulo en línea funciona; por eso un script propio (`scripts/inline-build.mjs`, sin dependencias nuevas) deja la salida de Vite en un solo archivo. Es una excepción menor a "no hay librerías para lo que se resuelve con pocas líneas": se evitó `vite-plugin-singlefile`.
- **Excepción al principio IX: sin interruptor de tema oscuro en el MVP.** Los tokens de ambos temas están definidos, pero las maquetas aprobadas no muestran ese control y agregarlo cambiaría la composición aprobada. Queda pendiente: una maqueta con el control (y la auditoría de contraste del tema oscuro) o dejarlo para un sprint posterior.
- **Método del pronóstico.** Mediana de pendientes (tipo Theil–Sen) sobre la ventana, rango entre cuartiles con piso de incertidumbre `max(30 % del ritmo, 10 mm/h)`, nivel de partida como mediana de `nivel − ritmo × horas` estimada en el "ahora", y tiempos redondeados hacia afuera a 0.5 h (con una tolerancia numérica para que un valor exacto no salte al paso siguiente). Los supuestos del método están en `robustTrend.ts` y se muestran en pantalla como "Supuesto".
- **El nivel de partida se estima en el "ahora"**, no en la última lectura. Con la última lectura 3 minutos antes del "ahora", el escenario `ciclon-inicio` da Revisar "entre 2.5 y 3.5 h" y no "entre 2.5 y 4 h" (que es el caso exacto con `now` en la última lectura, P01).
- **Frase "a partir de X h"** cuando un umbral podría llegar dentro del horizonte pero el extremo tardío lo pasa. No está en la especificación; evita decir "más de N h".
- **`escenario.json` lleva `group`** (`demo` o `test`) para agrupar el selector.
- **Los escenarios se generan** con `scripts/generar-escenarios.mjs` (determinista, sin azar) y se incluyen en la entrega.

### Aprobaciones de dependencias y estructura (2026-10-16)

- **Lucide** (`lucide-react`, importado ícono por ícono desde `src/ui/icons.ts`): aprobada. Alternativa si se sustituye: SVG propios dentro de ese archivo.
- **Dependencias de desarrollo del Sprint 2B**: aprobadas — `vite-plugin-pwa`, `workbox-build`, `workbox-window` y `fake-indexeddb`. El panel que se entrega no gana ninguna dependencia. Las versiones exactas se fijan al crear el proyecto, verificando la versión estable vigente.
- **IndexedDB también para la copia local de los datos**: aprobada (principio VI).
- **Carpeta `src/app` y capa de datos en `src/core`**: aprobada (principio V).

## Propuestas técnicas pendientes de confirmar

### MVP: base y Estado actual

| Id | Propuesta |
|----|-----------|
| R2 | Carga de los JSON: **decidido** que la entrega se abre con doble clic, sin servidor ni red, así que los escenarios de ejemplo (`config.json` y `readings.json` por carpeta) se incluyen dentro de la entrega y se leen detrás de repositorios. Cómo se arma internamente (por ejemplo, empaquetados en la aplicación) se decide en `/speckit-plan`. Durante el desarrollo se puede usar un servidor local. |
| R3 | Sin "modo real": toda la app es una demostración con escenarios simulados, y el selector de escenarios siempre está a la vista. (Reemplaza la propuesta anterior de separar modo real y modo ensayo.) |
| R4 | **Decidido** que cada escenario tiene un "ahora" fijo: define su propia hora de referencia y el panel calcula antigüedades contra ese "ahora", no contra el reloj real. Así el estado y "Última lectura hace X min" no cambian solos. |
| R5 | Hooks de React y un contexto mínimo; sin Zustand. |
| R6 | Ver la aprobación de Lucide arriba. |
| R7 | **Implementado.** `src/core/tokens/tokens.ts` es la única fuente de los tokens; `src/ui/theme/` los convierte en variables CSS para el tema claro y el oscuro; los componentes usan CSS Modules con `var(--…)`. Pruebas de guardia vigilan los hex únicos, la ausencia de degradados, de `text-shadow`, de `drop-shadow` y de sombras con desenfoque (solo se permiten `shadow-sm` y `shadow-md`, y solo en los elementos principales), y los valores sueltos. |
| R8 | Mensajes de validación de Zod en español (`z.config(z.locales.es())`). |
| R9 | Marcas de tiempo adelantadas hasta 60 s se aceptan como actuales. |
| R10 | Mensajes de ejemplo para avisar centralizados con los demás textos; son ejemplos de la demostración y los debe aprobar el comité antes de un uso real. |

### Pronóstico (dentro del sprint MVP) y funcionamiento sin red (Sprint 2B, opcional)

El sprint MVP incluye el pronóstico (R14 a R17 y R25 a R28, columna "MVP"). El Sprint 2B es opcional.

| Id | Propuesta | Sprint |
|----|-----------|--------|
| R14 | Ritmo de subida con tendencia robusta (mediana de pendientes, Theil–Sen) sobre la ventana reciente | MVP |
| R15 | Banda de incertidumbre con dispersión robusta; crece con el horizonte; piso del 10 % de lo proyectado | MVP |
| R16 | Tiempo hasta cada umbral por rejilla de 1 min, medido desde ahora, redondeado hacia afuera a 0.5 h | MVP |
| R17 | Cinco campos nuevos obligatorios en `config.json` (`schema_version` sigue en 1) | MVP |
| R25 | Navegación sin librería de rutas, sincronizada con el `hash` de la URL | MVP |
| R26 | Gráfica en SVG propio con alternativa en tabla | MVP |
| R27 | Seis escenarios de ejemplo nuevos para el pronóstico | MVP |
| R28 | Tabla de 20 o más casos del pronóstico calculados a mano | MVP |
| R18 | Dos capas sin red: service worker para la app e IndexedDB para los datos. **Aviso:** un service worker no funciona al abrir la app con doble clic (archivo local), así que este sprint exigiría servir la app por http o https; evaluar antes de hacerlo | 2B |
| R19 | La copia local guarda el JSON crudo validado y se revalida al leerla | 2B |
| R20 | La conexión se deduce de los errores de red y de `navigator.onLine` | 2B |
| R21 | Relectura periódica silenciosa; no retrocede ante un archivo más viejo; sin relectura en la demostración | 2B |
| R22 | Service worker sin `skipWaiting`: una versión nueva entra al cerrar todas las pestañas | 2B |
| R23 | Manifiesto con ícono SVG propio; instalar es opcional | 2B |
| R29 | Pruebas sin red en tres niveles: automáticas, verificación del build y manual real | 2B |
| R30 | Textos centralizados; ícono `WifiOff`; tono `offline` de `Notice` | 2B |

## Pendientes de decisión

- Municipio del proyecto (el nombre del proyecto es Piski).
- Si el panel puede editar `config.json` o solo leerlo.
- Cómo llegan los JSON actualizados al sitio sin internet.


## 2026-10-16: unidades en mm y lluvia acumulada

- **Decisión**: todo el agua (nivel, umbrales, ritmo, proyección) se muestra en mm, como una app del clima; los campos de datos pasan a `*_mm`.
- **Decisión**: se agrega `rain_mm` por lectura y `rain_windows_h` en la configuración; el panel muestra la lluvia acumulada (1, 3 y 6 h). Es solo informativa: no interviene en la clasificación ni en el pronóstico.
- **Consecuencia**: Estado actual pasa de cuatro a cinco elementos. Es un cambio de composición sobre las maquetas aprobadas; las maquetas se actualizaron y el usuario **aprobó el cambio** (T117).
