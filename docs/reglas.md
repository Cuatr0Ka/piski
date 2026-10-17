<!--
Reporte de Impacto de la Sincronización
- Cambio de versión: 1.0.0 → 1.1.0 → 1.1.1 (PATCH: nombre provisional "Vigía" en el título y la introducción; después el nombre pasó a ser "Piski")
  → 1.1.2 (PATCH, 2026-10-16, aprobada por el autor con el Sprint 2: principio V con la carpeta `app/`
  de composición y la capa de datos compartida en `core/`; principio VI con IndexedDB también para la
  copia local de los datos)
  → 2.0.0 (MAJOR, 2026-10-16: el principio IX se redefine: el estilo pasa de Flat Design a
  neobrutalismo minimalista (borde oscuro de 2 px, color sólido, mucho aire y una sombra sólida solo en lo principal, sin
  desenfoque ni degradados). Además: el panel es solo para escritorio y para encargados y líderes; el
  principio IX exige composición por pantalla, conclusión antes de la gráfica, tema claro por defecto y
  maqueta aprobada; el principio X pasa el contrato `ESQUEMA.md` a ser del panel; se quitan las
  referencias a coordinar con otros módulos; se cierra la decisión del dispositivo principal; el
  proyecto está en fase de demostración local: sin modo real, selector de escenarios siempre visible
  y funcionamiento sin red como Sprint 2B opcional)
  → 2.1.0 (MINOR, 2026-10-16, tras `/speckit-clarify`: la entrega se abre con doble clic, sin servidor ni
  red; las lecturas imposibles se descartan con aviso; cada escenario tiene un "ahora" fijo; se
  quita de "Decisiones Pendientes" la forma de cargar los escenarios; se ratifica la constitución)
- Principios modificados: IV (estados y colores remiten a los tokens del sistema de diseño),
  IX (ahora exige `docs/design-system-panel.md` y el estilo Flat Design)
- Secciones añadidas: ninguna; se actualizaron "Tecnologías y Dependencias", "Flujo de Desarrollo"
  y "Decisiones Pendientes"
- Secciones eliminadas: ninguna (en "Decisiones Pendientes" se resolvieron tipografía, tema oscuro y
  estilo visual; los íconos quedan como dependencia a justificar)
- Pendientes: decisiones listadas en "Decisiones Pendientes" (la ratificación ya se hizo el 2026-10-16)
- Historial: 1.0.0 = contenido inicial derivado de modulos-de-trabajo.md (Módulo B)
-->

# Constitución del Panel Piski (Módulo B)

El Panel Piski (nombre del proyecto: Piski) es una aplicación web local, en React, con seis pantallas por rol (Estado actual,
Pronóstico de creciente, Laderas, Recomendador verde, Reportes y Panel institucional). Lo usan
encargados y líderes desde una computadora de escritorio, y ellos avisan a la gente cercana. Lee los
JSON de datos locales. Hoy sirve para mostrar con datos simulados; que funcione sin conexión una
vez cargada es opcional (Sprint 2B). El alcance y las pantallas están en
`modulos-de-trabajo.md`, que es la fuente de verdad del alcance. Este repositorio construye solo el panel.
Esta constitución define las reglas que NO se rompen al desarrollar el panel, tanto por el autor
como por el agente de IA.

## Principios Fundamentales

### I. Alcance y Fuente de Verdad (NO NEGOCIABLE)

- El agente DEBE leer `modulos-de-trabajo.md` (Módulo B y "Reglas compartidas") antes de
  implementar cualquier pantalla.
- NO se agregan funcionalidades fuera del alcance sin indicarlo y obtener la aprobación del autor.
- El desarrollo sigue el orden del plan: Estado actual y Pronóstico primero; después Reportes,
  Laderas, Recomendador y Panel institucional. NO se implementa todo de una sola vez.
- Fuera del alcance del panel: firmware o baliza, simulador, carcasa y modelos 3D, infraestructura
  verde y protocolo de alerta como documentos de trabajo, LoRa, servidores propios y APIs entre equipos.
  Esos trabajos son de otros equipos y no se documentan en este repositorio.
- Las pantallas de Laderas y Recomendador necesitan parámetros que este proyecto aún no tiene;
  mientras no existan, se prototipan con supuestos marcados como tales.
- El panel NO envía avisos ni mensajes: sugiere un texto y una persona confirma y difunde.
- DEBE mantenerse la trazabilidad: entregable del Módulo B → pantalla → implementación.
- Si cambia un entregable, un contrato JSON o un criterio de terminado, DEBE actualizarse
  `modulos-de-trabajo.md` o `data/ESQUEMA.md` para que el código y la planeación no se contradigan.
- Justificación: el objetivo es un panel que el comité pueda usar en una tormenta para avisar a la gente,
  no un sistema que crece sin control.

### II. Independencia, Datos Locales y Sin Conexión (NO NEGOCIABLE)

- El panel NO depende de una conexión en vivo con el nodo, y el nodo no depende de internet.
- NO hay backend, APIs propias, telemetría, analítica ni envío de datos a terceros.
- El panel se comunica con los demás módulos SOLO por los archivos JSON: `readings.json`,
  `events.json`, `config.json` y `reports.json`.
- El panel NO necesita red para funcionar: en la fase de demostración los datos son escenarios
  locales y simulados. Que siga funcionando sin red tras la primera carga (PWA con service worker)
  es el Sprint 2B, opcional. NO se cargan fuentes, íconos, scripts ni mapas desde CDN en tiempo de
  ejecución.
- El panel NUNCA modifica `readings.json` ni `events.json`: los consume en solo lectura.
- Los reportes de vecinos se guardan en el navegador (IndexedDB) y se intercambian mediante
  exportar e importar `reports.json`, siempre por acción explícita del usuario.
- Los reportes NO almacenan datos personales (nombre, teléfono, cuenta); solo tipo de incidente,
  ubicación aproximada, hora y nota breve.
- Justificación: en una emergencia la red falla; el panel debe seguir sirviendo con lo que ya tiene.

### III. Honestidad de los Datos (NO NEGOCIABLE)

- Todo dato proveniente del simulador se marca como simulado de forma permanente y visible en
  cada pantalla que lo muestre. Los datos se identifican por el campo `simulated` de los JSON.
- El pronóstico de creciente se muestra SIEMPRE con rango de incertidumbre, nunca con un solo
  número exacto.
- Las cifras del recomendador (cuánto baja el pico, cuánto se retrasa la creciente) son
  supuestos configurables, se muestran con su etiqueta de "supuesto" y con los supuestos visibles
  en pantalla. NUNCA se presentan como mediciones.
- Las advertencias honestas del plan se muestran donde corresponda: el bambú tarda años, la
  trampa de sedimentos se llena si no se limpia, la simulación es didáctica y no un modelo
  hidrológico validado.
- La saturación de ladera y el aviso de deslave son indicadores, NO un estudio geotécnico; la
  pantalla de Laderas lo indica.
- Un dato faltante, vencido o sin lecturas recientes se muestra como tal ("sin datos", hora de
  la última lectura); NUNCA se rellena ni se asume un estado verde.
- Justificación: en riesgo por inundación y deslave, una cifra falsamente precisa daña más que
  una cifra honesta con su margen.

### IV. Lenguaje Común: Estados, Colores y Umbrales (NO NEGOCIABLE)

- El panel usa los mismos tres estados que la baliza y la presentación: verde = normal, amarillo =
  revisar, rojo = no cruzar, con los mismos hex: `#2fd1a5`, `#f5b942` y `#ef5b5b`. Los hex viven
  en un solo lugar (los tokens `ok-fill`, `warn-fill` y `stop-fill` de `docs/design-system-panel.md`)
  y NO se repiten sueltos en el código. Son iguales en el tema claro y en el oscuro.
- Los hex de estado se usan como relleno con texto oscuro (`state-ink`); como texto sobre las
  superficies se usan las variantes `ok-text`, `warn-text` y `stop-text` del sistema de diseño.
- El estado NUNCA se comunica solo con color: cada estado lleva además forma, ícono y palabra
  (Normal, Revisar, No cruzar, y "Sin datos" cuando no hay lecturas vigentes), por daltonismo y
  sol fuerte, igual que la baliza distingue patrones sin depender del color.
- Los umbrales se leen SIEMPRE de `config.json`. NO se escriben valores de umbral en el código ni
  en los componentes.
- Con el mismo `config.json` y las mismas lecturas, Estado actual DEBE mostrar el mismo estado
  que la baliza física.
- El cambio de estado sigue la regla de la baliza: se necesita una condición sostenida durante
  varias lecturas; una lectura aislada no cambia el estado, y volver a verde exige descenso
  sostenido. El número de lecturas también viene de `config.json`.
- Los mensajes de estado son cortos y accionables ("No cruzar").
- Justificación: si el panel y la baliza dicen cosas distintas, la gente deja de confiar en ambos.

### V. Arquitectura Modular

- El código se organiza en `src/` con `core/`, `ui/`, `features/` y `app/`:
  - `core/`: carga y validación de JSON, almacenamiento local, tiempo, utilidades y tokens. Aquí vive
    la capa de datos que comparten varias pantallas (repositorios, validadores y el proveedor de datos).
  - `ui/`: componentes visuales reutilizables, sin lógica de negocio.
  - `features/`: una carpeta por pantalla (`estado`, `pronostico`, `laderas`, `recomendador`,
    `reportes`, `institucional`).
  - `app/`: capa de composición (navegación, selector de escenarios y avisos compartidos). Puede
    importar de `core`, `ui` y de la API pública (`index.ts`) de cada feature; nada importa de `app`.
- Cada feature se divide en `components/`, `hooks/`, `services/`, `repositories/`,
  `validators/` y `types.ts`, y expone solo su API pública mediante `index.ts`.
- Una feature NO importa archivos internos de otra feature; `core` y `ui` NO dependen de ninguna feature ni de `app`.
- La lógica de negocio (clasificación de estado, pronóstico, comparación del recomendador) DEBE
  vivir en `services/` como funciones puras, NUNCA en componentes ni repositorios.
- Solo los repositorios acceden a los JSON y a IndexedDB, detrás de interfaces, para poder
  cambiar el origen de los datos sin tocar la lógica ni las pantallas.
- Los registros se agregan, no se reescriben: un reporte nuevo es un registro nuevo.
- La estructura puede ajustarse solo ante una necesidad técnica real, conservando una
  separación equivalente de responsabilidades.
- Justificación: separar capas permite que cambie el origen de los datos sin reescribir el panel.

### VI. Stack Tecnológico

- Aplicación: Vite + React + TypeScript en modo estricto.
- Validación de JSON de entrada y de importación: Zod en `validators/`.
- Offline: PWA con service worker (solo si se hace el Sprint 2B, opcional; un service worker no
  funciona al abrir la app como archivo local, así que ese sprint exigiría servirla por http o https).
- Almacenamiento local: IndexedDB para reportes y para la copia local de los datos del panel (que
  permite abrir sin conexión); `localStorage` solo para preferencias menores (por ejemplo, el rol
  elegido).
- Pruebas: Vitest + React Testing Library.
- NO se introducen tecnologías o dependencias nuevas sin justificar su necesidad.
- NO se agregan librerías para lo que se pueda resolver con pocas líneas de código.
- Las versiones exactas se fijan al crear el proyecto, verificando la versión estable vigente.
- Justificación: un conjunto acotado de tecnologías conocidas reduce riesgos y mantiene el
  panel liviano para equipos modestos.

### VII. Validación, Importación y Errores

- Todo JSON se valida contra su esquema (`data/ESQUEMA.md`) al cargarse, sin confiar en que
  viene bien formado.
- Cada archivo lleva un número de versión de esquema; si no coincide con la que el panel
  soporta, se rechaza con un mensaje claro.
- Importar `reports.json` DEBE validar formato y versión, y fusionar o reemplazar datos solo
  tras una confirmación explícita.
- Las entradas del usuario (alta de reporte) se validan antes de guardarse.
- NUNCA se muestran trazas internas al usuario; los errores se presentan con mensajes claros y
  accionables, y el panel sigue mostrando los últimos datos válidos cuando es posible.
- La entrega del panel DEBE abrirse con doble clic en el navegador, sin servidor, sin instalar nada
  y sin red. Los escenarios de ejemplo se incluyen dentro de la entrega; la lectura siempre pasa por
  repositorios.
- Una lectura imposible (por ejemplo, un nivel negativo) se descarta con un aviso visible que dice
  cuántas se descartaron; NUNCA se usa para calcular el estado ni el pronóstico. Si no quedan lecturas
  válidas suficientes, el estado es "Sin datos".
- Justificación: un archivo corrupto no debe dejar la pantalla en blanco durante una tormenta.

### VIII. Pruebas

- Toda lógica de negocio DEBE tener pruebas automatizadas con Vitest: clasificación de estado
  contra los umbrales de `config.json`, persistencia sostenida y regreso a verde, cálculo del
  pronóstico y su rango, comparación del recomendador y validación de esquemas.
- Se prueban los casos límite: sin lecturas, una lectura espuria aislada, valor exactamente en
  el umbral, datos fuera de orden y archivos con esquema inválido.
- Los componentes críticos (semáforo de Estado actual, rango del pronóstico, etiqueta de
  simulado) se prueban con React Testing Library.
- Los nombres y los mensajes de las pruebas se escriben en español.
- Las pruebas usan datos de ejemplo, NUNCA datos reales.
- NO se marca una pantalla como terminada solo porque existe: DEBE funcionar de extremo a
  extremo cargando los JSON.
- Si se implementa el funcionamiento sin red (Sprint 2B), DEBE probarse realmente (cargar una vez,
  cortar la conexión, recargar) antes de cerrar ese sprint.
- Justificación: un umbral mal aplicado es un falso "verde", y el error se nota tarde.

### IX. UX/UI Limpia y Legible (NO NEGOCIABLE)

- La interfaz DEBE ser clara y legible con alto contraste en una pantalla de escritorio (tamaño de
  referencia 1440 × 900) y usable con mouse y teclado.
- El panel es solo para escritorio: lo usan encargados y líderes, que luego avisan a la gente. NO se
  diseña ni se prueba para celular ni tableta.
- Hoy el panel se usa para mostrar, con datos simulados locales, pero se diseña como una herramienta
  informativa real: NO es un juguete ni lleva animaciones, efectos ni adornos.
- Estado actual lo entiende un encargado sin explicación: semáforo grande, nivel contra el paso,
  antigüedad del dato y un mensaje sugerido para avisar.
- Cada pantalla pone primero la conclusión en una frase y después la gráfica o el detalle. Una gráfica
  nunca es el elemento principal sin una frase que diga qué significa.
- Toda pantalla y componente DEBE seguir `docs/design-system-panel.md` (incluida su sección
  "Composición"). Si una decisión de ese documento cambia, se actualiza antes de modificar la interfaz.
- Cada pantalla tiene una maqueta aprobada en `docs/design/`. NO se implementa una pantalla sin
  maqueta aprobada, y NO se cierra hasta compararla con ella en una captura.
- El selector de escenarios de ejemplo está siempre a la vista (en la franja de "Datos simulados"
  bajo la cabecera) y es el control de quien presenta. NO existe un "modo real": mientras la app sea
  una demostración, todos los datos son escenarios simulados.
- El estilo es neobrutalismo minimalista: borde oscuro en `ink` (2 px), colores sólidos, mucho aire y
  pocas cajas (un solo nivel de contenedor). Hay UNA sola clase de sombra, la sólida desplazada y sin
  desenfoque, y solo en lo principal: `shadow-md` en el bloque principal de cada pantalla y
  `shadow-sm` en el botón de la acción principal. NO se usan `text-shadow`, `drop-shadow`, sombras con
  desenfoque, degradados, biseles ni texturas. La jerarquía se logra con superficies, bordes, tamaño y
  posición. Todo control se reconoce por su relleno sólido o su borde, y se desplaza 2 px al presionarse,
  de inmediato y sin transición.
- Las pantallas SOLO usan componentes de `src/ui` y tokens (colores, tipografía, espacios,
  radios, bordes). NO se usan colores ni medidas sueltas en las pantallas.
- Una sola familia tipográfica (Inter, empaquetada con la app) y un solo set de íconos.
- La interfaz ofrece tema claro y oscuro, y cumple contraste en ambos. El claro es la base y el
  predeterminado: NO sigue el tema del sistema; el oscuro es una opción que elige la persona.
- El pronóstico se muestra siempre como rango (línea discontinua con banda de incertidumbre), y
  los datos simulados y los supuestos llevan sus etiquetas fijas ("Datos simulados", "Supuesto").
- El panel NO parpadea ni anima números: el parpadeo es propio de la baliza física, y el cambio
  de estado en pantalla es inmediato y se anuncia a lectores de pantalla.
- Los controles miden al menos 40 px de alto, tienen foco visible y se usan completos con teclado; el
  texto cumple contraste suficiente.
- Cada pantalla indica para qué rol es (encargado del comité, comité, Protección Civil, municipio,
  CONAGUA, CFE).
- Las acciones destructivas (borrar reportes, reemplazar datos) piden confirmación, y toda
  acción muestra un resultado claro (éxito o error).
- Los textos de la interfaz están en español y centralizados en un solo lugar.
- Justificación: se usará con prisa y bajo estrés; la claridad es parte de la seguridad.

### X. Esquemas y Datos de Ejemplo

- El contrato de los JSON que el panel consume es `data/ESQUEMA.md`. Lo define y lo mantiene este
  proyecto; cualquier cambio se anota en el documento y en `docs/decisiones.md`.
- Los tipos de TypeScript y los esquemas de Zod DEBEN reflejar `ESQUEMA.md`; si divergen, se
  corrige el código o el documento, no se ignora.
- El repositorio incluye datos de ejemplo (`data/` o fixtures) que cubren los tres escenarios:
  tormenta normal, ciclón y estiaje. Cada pantalla DEBE poder verse con ellos sin capturar nada a mano.
- Los datos de ejemplo llevan `simulated: true`.
- Cada escenario de ejemplo tiene un "ahora" fijo: la antigüedad de su última lectura es siempre la
  misma, y el estado y el pronóstico NO cambian por el paso del tiempo real.
- Justificación: poder ver cada pantalla con datos acelera el desarrollo y permite trabajar
  sin esperar al simulador.

## Tecnologías y Dependencias

- Núcleo permitido: Vite, React, TypeScript, Zod, Vitest, React Testing Library y un plugin de
  PWA para el service worker (este último solo si se hace el Sprint 2B).
- Tipografía: Inter, empaquetada (solo subconjunto latino), sin CDN.
- Íconos: Lucide (`lucide-react`), importados uno por uno; dependencia pendiente de justificar
  según el principio VI antes de agregarla.
- Enrutamiento y gestor de estado: se deciden en el plan de la pantalla correspondiente (ver
  "Decisiones Pendientes").
- Gráficas: SVG propio, sin librería, salvo que se justifique una necesidad concreta.
- Priorizar alternativas gratuitas y de bajo costo; el proyecto NO debe generar costos recurrentes.
- Toda dependencia nueva DEBE justificarse antes de agregarse, incluyendo su peso, ya que el
  panel debe cargar rápido y quedar en caché.

## Flujo de Desarrollo

- Para implementar una pantalla, el agente DEBE: leer el contexto completo, abrir la maqueta aprobada
  en `docs/design/`, revisar el estado del repositorio, identificar qué existe ya, proponer un plan e
  implementar únicamente el alcance acordado.
- Si una decisión técnica no está definida, DEBE proponer opciones antes de asumir una solución irreversible.
- Una pantalla está terminada cuando: la funcionalidad está implementada, carga y valida los JSON,
  usa los umbrales de `config.json`, maneja los errores previsibles, no rompe flujos existentes,
  respeta `docs/design-system-panel.md` (tokens, neobrutalismo y estados) en tema claro y oscuro,
  coincide con su maqueta aprobada (comparada en una captura a 1440 × 900), la lógica tiene pruebas, marca los datos simulados y la documentación se
  actualizó si hubo una decisión relevante.
- Al terminar, el agente DEBE reportar: archivos modificados, pantallas cubiertas, pruebas
  realizadas, pendientes y riesgos o decisiones abiertas.
- Ramas: una por funcionalidad con el formato `NNN-<nombre-en-minusculas>` (por ejemplo
  `001-estado-actual`). Para correcciones puntuales: `fix-<nombre>`. NO se trabaja directamente
  sobre `main`.
- Commits: pequeños y enfocados, con Conventional Commits (tipo y alcance en inglés, descripción
  en español). NO se mezclan funcionalidades no relacionadas en un mismo cambio.
- La documentación, los comentarios y los mensajes de commit se escriben en español; los
  identificadores del código (entidades, campos, funciones) se escriben en inglés.
- Las decisiones técnicas importantes se anotan en `docs/decisiones.md`.

## Decisiones Pendientes

Estas decisiones aún no están tomadas; el agente puede proponer opciones, pero NO asumirlas
como definitivas:

- Gestor de estado (hooks y contexto, o Zustand).
- Enrutamiento (React Router o navegación por rol sin librería).
- Método de extrapolación del pronóstico y cómo se calcula el rango de incertidumbre.
- Si el panel puede editar `config.json` (comité) o solo leerlo.
- Campos exactos de los cuatro JSON: se definen en `data/ESQUEMA.md` del panel.
- Aprobar o sustituir Lucide como set de íconos (dependencia a justificar; aprobada por el autor el 2026-10-16).
- Estilo del mapa de la pantalla Reportes y su funcionamiento sin red.
- Cómo se obtienen los JSON actualizados en sitio (copia manual, carpeta compartida o USB).
- Municipio del proyecto (el nombre del proyecto es Piski).

## Gobernanza

- Esta constitución tiene prioridad sobre cualquier otra práctica o convención del repositorio.
  Las "Reglas compartidas" de `modulos-de-trabajo.md` aplican en su totalidad al panel.
- Las enmiendas DEBEN ser aprobadas por el autor del proyecto y documentarse actualizando la
  versión (SemVer), la fecha de última enmienda y el reporte de impacto del encabezado.
- Versionado: MAJOR para eliminar o redefinir principios; MINOR para añadir principios o
  secciones; PATCH para aclaraciones y correcciones de redacción.
- El cumplimiento se revisa en cada contribución; cualquier desviación DEBE justificarse
  explícitamente o descartarse.

**Versión**: 2.1.0 | **Redactada**: 2026-10-16 | **Ratificación**: 2026-10-16 | **Última enmienda**: 2026-10-16
