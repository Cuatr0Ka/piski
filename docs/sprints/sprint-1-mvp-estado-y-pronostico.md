<!--
Insumo para /speckit.specify del Sprint 1 (MVP) del Panel de Monitoreo (Módulo B).
Fusiona los antiguos "Sprint 1: Base y Estado actual" y "Sprint 2A: Pronóstico y navegación".
El funcionamiento sin red es el Sprint 2B, opcional (sprint-2b-sin-red.md).
NO lo pongas dentro de specs/ (esa carpeta la genera Spec Kit).
Las reglas generales viven en docs/reglas.md y en modulos-de-trabajo.md; no se copian aquí.
Estado: sin implementar. Todos los criterios de aceptación están pendientes.
-->

# Insumo de especificación — Sprint 1 (MVP): Estado actual y Pronóstico

> **Referencias obligatorias para el agente:**
> - Alcance: `docs/modulos-de-trabajo.md`
> - Constitución: `docs/reglas.md` (copia ratificada en `.specify/memory/constitution.md`, versión 2.1.0)
> - Sistema de diseño: `docs/design-system-panel.md` (secciones "Composición" y "Gráficas y datos")
> - Maquetas de referencia: `docs/design/estado-actual.html` y `docs/design/pronostico.html` (aprobadas por el autor el 2026-10-16)
> - Especificación de la funcionalidad: `specs/001-panel-estado-pronostico/spec.md` (con las decisiones de `/speckit-clarify`)
> - Contrato de datos: `data/ESQUEMA.md` (no existe aún; este sprint lo crea)
> - Este documento describe únicamente el alcance de este sprint.

## 1. Contexto del sprint

Es el MVP del panel: la base técnica (proyecto, sistema de diseño, capa de datos) y las dos pantallas que lo componen, **Estado actual** y **Pronóstico de creciente**, con la navegación entre ellas.

**Fase de demostración.** Por ahora la app solo sirve para **mostrar**. Los datos son archivos JSON locales y simulados, y no hay conexión con un nodo ni con servicios externos. Aun así, la interfaz se diseña como una herramienta informativa real: la leerá un encargado del comité para decidir qué avisar a la gente cercana, no como un juguete animado. Quien presenta elige el escenario de ejemplo (tormenta normal, ciclón, estiaje y otros) y la app responde como lo haría con datos reales.

La entrega es una carpeta que se abre con **doble clic** en el navegador, sin instalar nada, sin ejecutar comandos y sin internet. Cada escenario tiene un "ahora" **fijo**: el estado y la antigüedad del dato no cambian por el paso del tiempo real.

El funcionamiento sin red como característica propia (PWA) es el Sprint 2B, opcional.

## 2. Objetivo

Que el encargado vea, con el mismo criterio que la baliza física, si el paso es seguro (**Normal**), si debe revisarse (**Revisar**) o si no se debe cruzar (**No cruzar**), con un mensaje de ejemplo para avisar. Además, que el comité lea cuándo podría alcanzar el agua los niveles de Revisar y No cruzar, siempre como un rango y nunca como un número exacto. Todo calculado solo con `config.json` y las lecturas de `readings.json`.

## 3. Historias de usuario del sprint

> Formato: "Como [rol], quiero [acción] para [beneficio]". Roles: encargado del comité, comité, Protección Civil, municipio, CONAGUA y CFE. El vecino no usa el panel: recibe el aviso. Quien presenta la demostración usa el rol de comité.

### Estado actual

- **US1** — Como encargado del comité, quiero ver un semáforo grande con una palabra y un mensaje corto ("No cruzar"), para saber de un vistazo si el paso es seguro.
- **US2** — Como encargado del comité, quiero ver el nivel actual contra el nivel del paso y cuándo fue la última lectura, para entender qué tan cerca está el agua y cuánto confiar en el dato.
- **US3** — Como encargado del comité, quiero un mensaje de ejemplo según el estado, listo para leer por radio o teléfono y para copiar, para ver cómo avisaría a la gente cercana sin redactarlo en el momento.
- **US4** — Como encargado del comité, quiero que el panel diga "Sin datos" cuando las lecturas son viejas o no existen, para no confiar en un verde falso.
- **US5** — Como comité, quiero que el estado del panel coincida con el de la baliza para el mismo `config.json`, para que ambos no se contradigan.
- **US6** — Como comité, quiero ver claramente que los datos son simulados, para no confundir una demostración con una emergencia real.
- **US7** — Como comité, quiero elegir fácilmente el escenario de ejemplo, para presentar el panel en distintas situaciones sin tocar archivos.

### Pronóstico de creciente

- **US8** — Como comité, quiero leer una frase que diga cuánto tiempo podría faltar para que el agua llegue a Revisar y a No cruzar, para decidir si avisar o cerrar el paso con anticipación.
- **US9** — Como comité, quiero que el pronóstico sea un rango (por ejemplo "entre 570 y 630 mm en 3 h") con una banda de incertidumbre en la gráfica, para no confiar en una cifra falsamente exacta.
- **US10** — Como comité, quiero ver la gráfica del nivel real, las líneas de umbral y la proyección, para entender la tendencia de un vistazo.
- **US11** — Como comité, quiero que el panel diga "Sin pronóstico", la razón y qué hacer cuando no hay datos suficientes, los datos son viejos o el nivel está bajando, para no recibir una proyección inventada.
- **US12** — Como comité, quiero ver el nivel actual, el ritmo de subida (mm por hora) y la antigüedad del dato junto al pronóstico, para saber desde dónde se proyecta y qué tan fresco es.
- **US13** — Como comité, quiero cambiar entre Estado actual y Pronóstico con una barra de navegación visible, para consultar ambas sin recargar.

## 4. Flujo demostrable al cierre del sprint

    Abrir la carpeta de entrega con doble clic (sin instalar nada ni internet); el escenario elegido está a la vista junto a la etiqueta "Datos simulados"
    → Escenario "tormenta normal": Estado actual muestra Normal (verde, círculo, "Paso seguro"), el nivel contra el paso, "Última lectura hace X min" y el mensaje de ejemplo para Normal
    → Cambiar a "ciclón": la lectura sube más allá de Revisar durante varias lecturas; el bloque pasa a Revisar (amarillo, triángulo) y el mensaje cambia; después pasa a No cruzar (rojo, octágono, "No cruces")
    → "Copiar mensaje" copia el texto; el panel confirma que se copió
    → Una sola lectura espuria alta NO cambia el estado
    → Cambiar un umbral en config.json de ejemplo y recargar: el estado cambia sin tocar el código
    → Ir a Pronóstico con la barra de navegación: la conclusión dice "Podría llegar a Revisar entre 2.5 y 4 h", con el nivel actual, el ritmo en mm/h y la antigüedad del dato
    → La gráfica muestra la línea real, la proyección discontinua y la banda de incertidumbre
    → Escenario "estiaje" o nivel que baja: "Sin pronóstico: el nivel está bajando" con qué hacer, y la gráfica usa todo el ancho
    → Escenario con pocas lecturas: "Sin pronóstico: hacen falta más lecturas"
    → Escenario con lecturas viejas: Estado actual pasa a "Sin datos" (nunca verde) y Pronóstico dice "Sin pronóstico: datos viejos"
    → Todo con la etiqueta fija "Datos simulados" y, en Pronóstico, la nota "Proyección, no medición"

## 5. Pantallas involucradas

> Referencia: `docs/design-system-panel.md` y las maquetas de `docs/design/`.

| Pantalla | Qué permite | Diseño de referencia |
|----------|-------------|----------------------|
| Estado actual | Ver el estado del paso (`StatusBanner`), el nivel contra el paso (`LevelGauge`), la antigüedad del dato (`DataFreshness`) y el mensaje de ejemplo (`BroadcastMessage`) | `docs/design/estado-actual.html` (variantes Normal, Revisar, No cruzar y Sin datos); aprobada el 2026-10-16 |
| Pronóstico de creciente | Leer la conclusión, ver el nivel actual, el ritmo y la antigüedad, la gráfica con banda de incertidumbre, el estado "Sin pronóstico" y el resumen del método | `docs/design/pronostico.html` (variantes: subiendo, revisar superado, bajando, pocas lecturas y datos viejos); aprobada el 2026-10-16 |
| Navegación y selector de escenario | Cambiar entre pantallas y elegir el escenario de ejemplo | Cabecera y franja de "Datos simulados" de ambas maquetas |
| Estados de carga y error | "Cargando datos…", datos inválidos con mensaje accionable y "Sin datos" | Sección "Estados de interacción" del sistema de diseño; sin maqueta propia, se revisa en captura |

Componentes de `src/ui` que debe crear este sprint: `StatusBanner`, `StatusShape`, `StatusPill`, `LevelGauge`, `DataFreshness`, `SimulatedBadge`, `BroadcastMessage`, `ConclusionCard`, `ForecastChart`, `RoleNav`, `Disclosure`, `AssumptionTag`, `Card`, `Button`, `Select`, `Notice` y `EmptyState`.

### Mensajes de ejemplo para avisar (borrador, centralizados con los demás textos)

Son ejemplos para la demostración. No salen de un protocolo oficial; antes de un uso real los debe aprobar el comité.

| Estado | Mensaje de ejemplo |
|---|---|
| Normal | "El paso está normal. No hay aviso que dar." |
| Revisar | "El arroyo está en Revisar. Pedimos que revisen el paso antes de cruzar." |
| No cruzar | "El arroyo llegó a No cruzar. Pedimos que nadie cruce el paso." |
| Sin datos | "No hay lecturas recientes. No se puede avisar con este panel; revisen el arroyo en persona." |

El panel **no envía** el mensaje. Una persona lo confirma y lo difunde. El mensaje nunca afirma que el paso es seguro si el estado es "Sin datos".

### Redacción segura del pronóstico

El pronóstico solo extrapola el ritmo de subida y no sabe de lluvia ni de saturación del suelo. Por eso:

- Nunca dice que "hay tiempo" ni que el paso es seguro. Si no se proyecta llegar a un umbral dentro del horizonte, dice "No se proyecta en las próximas 6 h", no "más de 6 h".
- Incluye siempre el aviso fijo: "Una lluvia intensa puede acelerar la subida y hacer que esta proyección se quede corta."

## 6. Entidades y archivos que toca este sprint

| Archivo / entidad | Acción en este sprint |
|-------------------|-----------------------|
| `data/ESQUEMA.md` | crear (campos, tipos, ejemplo y número de versión de esquema de los cuatro JSON, incluidos los campos nuevos del pronóstico) |
| `data/config.json` | leer y validar: umbrales de nivel, nivel del paso, lecturas sostenidas para subir y para bajar, antigüedad máxima de dato válido, el rango plausible del nivel (`plausible_level_mm`) y los parámetros del pronóstico (horizonte máximo, mínimo de lecturas, ventana de cálculo y `flat_rate_mm_h`, el ritmo por debajo del cual el nivel se considera estable) |
| `data/readings.json` | leer y validar, solo lectura y append-only (marca de tiempo con zona horaria, nivel en mm sobre una cota de referencia, `simulated`) |
| `data/events.json` | no se usa; solo se deja definido el tipo |
| `data/reports.json` | no se usa; solo se deja definido el tipo |
| Escenarios de ejemplo | crear (ver sección 10) |
| Servicio de clasificación | crear (función pura: lecturas y `config` → estado) |
| Servicio de pronóstico | crear (función pura: lecturas y `config` → ritmo, rango de tiempo por umbral y banda de nivel) |
| Casos de referencia | crear una tabla de casos de la clasificación (lecturas, configuración y estado esperado) y otra de 20 o más casos del pronóstico calculados a mano |

## 7. Regla de clasificación del estado

Esta regla es del panel y es la que debe reproducir la baliza física.

- **Arranque:** mientras haya menos lecturas que `readings_to_raise`, el estado es la banda más alta de las lecturas disponibles. Una sola lectura en No cruzar da No cruzar.
- **Hueco entre lecturas:** si entre dos lecturas pasa **más** que `max_reading_age_min`, el conteo de lecturas sostenidas se reinicia. Un hueco exactamente igual no reinicia.
- **Valor igual al umbral:** cuenta como alcanzado.
- **Subir y bajar** usan ventanas distintas: `readings_to_raise` y `readings_to_lower`. Volver a Normal exige descenso sostenido.
- **Sin datos:** no hay lecturas o la última es más vieja que `max_reading_age_min`. Nunca se asume Normal.
- **Lecturas con hora más de 60 s en el futuro** se descartan.
- **Misma marca de tiempo:** vale la lectura que aparece después en el archivo.
- **Marcas de tiempo** en ISO 8601 con zona horaria (`-06:00` o `Z`); sin zona, el archivo se rechaza.
- **Lectura imposible** (por ejemplo, un nivel negativo): se descarta, se muestra un aviso con cuántas lecturas se descartaron y el estado se calcula con las demás. Si no quedan suficientes, el estado es "Sin datos" y el Pronóstico no proyecta. El rango plausible vive en `config.json` (`plausible_level_mm`; en los ejemplos, de 0 a 3000 mm).

## 8. Reglas aplicables

> En este proyecto no hay reglas de negocio numeradas; aplican los principios de `docs/reglas.md` y las reglas compartidas de `modulos-de-trabajo.md`.

- Reglas compartidas 1 a 5 de `modulos-de-trabajo.md`.
- Principio I: alcance (solo lo de este sprint); el panel no envía avisos.
- Principio II: sin backend, sin telemetría, sin CDN en tiempo de ejecución, `readings.json` nunca se modifica.
- Principio III: dato faltante o viejo se muestra como tal, nunca como verde; etiqueta "Datos simulados"; el pronóstico siempre es un rango con incertidumbre, nunca un número único, con el método visible y marcado como supuesto; no se pronostica sin datos suficientes, con datos viejos ni con el nivel bajando; la simulación es didáctica y no un modelo hidrológico validado.
- Principio IV: tres estados con forma, ícono y palabra; umbrales, número de lecturas y parámetros del pronóstico desde `config.json`; el cambio de estado exige condición sostenida y volver a verde exige descenso sostenido; las líneas de umbral usan los colores de estado.
- Principio V: arquitectura `core` / `ui` / `features` / `app`; la clasificación y el pronóstico viven en `services/` como funciones puras; los repositorios acceden a los JSON.
- Principio VII: validación con Zod y versión de esquema; errores sin trazas.
- Principio VIII: pruebas con Vitest y React Testing Library, en español.
- Principio IX: solo escritorio, informativo, neobrutalismo minimalista, conclusión antes de la gráfica, tema claro por defecto, maqueta aprobada; gráfica en SVG propio con líneas de 2 px y sin degradados.
- Principio X: tipos y esquemas Zod reflejan `ESQUEMA.md`; escenarios de ejemplo con `simulated: true`.

## 9. Criterios de aceptación

Todos pendientes.

**Base**

- [ ] CA-1: el proyecto (Vite, React y TypeScript estricto) compila, y existen los comandos para desarrollo, build y pruebas.
- [ ] CA-2: los tokens del sistema de diseño (color, tipografía, espaciado, radios, bordes, sombras, tamaños) están en un solo lugar y se exponen como variables CSS; no hay colores, medidas ni tamaños de letra sueltos en las pantallas.
- [ ] CA-3: los tres hex de estado (`#2fd1a5`, `#f5b942`, `#ef5b5b`) aparecen definidos una sola vez, como tokens.
- [ ] CA-4: no existe ningún `text-shadow`, `drop-shadow`, degradado ni `box-shadow` con desenfoque en el código; la única sombra es `shadow-md` (bloque principal) o `shadow-sm` (botón principal), sólida, desplazada y en `ink`; ningún otro elemento lleva sombra.
- [ ] CA-5: los repositorios leen `config.json` y `readings.json` de cada escenario, los validan con Zod y rechazan con mensaje claro un archivo inválido o de otra versión de esquema (probado con archivos inválidos de ejemplo).
- [ ] CA-6: el selector de escenarios está siempre a la vista, junto a la etiqueta "Datos simulados", ofrece todos los escenarios de la sección 10 y cambia de escenario sin recargar ni capturar nada a mano.

**Estado actual**

- [ ] CA-7: Estado actual muestra `StatusBanner` con relleno, borde `ink` de 2 px, sombra sólida, forma, ícono, palabra y mensaje corto para Normal, Revisar y No cruzar.
- [ ] CA-8: el estado se calcula únicamente con los umbrales de `config.json`; cambiar un umbral cambia el estado sin modificar el código.
- [ ] CA-9: una sola lectura espuria no cambia el estado; el cambio exige el número de lecturas sostenidas de `config.json`.
- [ ] CA-10: volver a Normal exige descenso sostenido, igual que la baliza.
- [ ] CA-11: sin lecturas, o con la última lectura más vieja que el máximo de `config.json`, se muestra "Sin datos" con la hora de la última lectura, nunca verde.
- [ ] CA-12: `LevelGauge` muestra el nivel actual contra el nivel del paso, con unidades (`420 mm`), y `DataFreshness` muestra "Última lectura hace X min".
- [ ] CA-13: toda pantalla que muestre datos con `simulated: true` lleva la etiqueta "Datos simulados" visible permanente, e indica que los umbrales de ejemplo son provisionales.
- [ ] CA-14: con el mismo `config.json` y las mismas lecturas, el estado calculado coincide con una tabla de casos de referencia (valores esperados definidos en las pruebas), que cubre la regla de la sección 7.
- [ ] CA-15: el estado no depende solo del color: es legible en escala de grises y tiene `role="status"` o `aria-live="polite"`. Se prueba con un lector de pantalla real.
- [ ] CA-16: contraste verificado en tema claro según las tablas del sistema de diseño; los controles miden al menos 40 px de alto y se usan con teclado con foco visible.
- [ ] CA-17: la lógica de clasificación tiene pruebas automatizadas con casos límite (sin lecturas, una lectura espuria, valor exactamente en el umbral, lecturas fuera de orden, hueco entre lecturas, archivo inválido).
- [ ] CA-18: `data/ESQUEMA.md` existe, con los campos de los cuatro JSON, y los tipos coinciden con él.
- [ ] CA-19: los textos de la interfaz (incluidos los mensajes de ejemplo) están en español y centralizados en un solo lugar.
- [ ] CA-20: `BroadcastMessage` muestra el mensaje del estado vigente, "Copiar mensaje" lo copia y confirma el resultado, y con "Sin datos" nunca sugiere que el paso es seguro.

**Pronóstico**

- [ ] CA-21: el servicio de pronóstico es una función pura que, con las mismas lecturas y el mismo `config.json`, devuelve siempre el mismo resultado.
- [ ] CA-22: el pronóstico nunca se muestra como un número único: el tiempo hasta cada umbral y el nivel proyectado se expresan como rango (por ejemplo "entre 2.5 y 4 h").
- [ ] CA-23: el rango nace del método documentado y está descrito en pantalla como supuesto con `AssumptionTag`.
- [ ] CA-24: la gráfica muestra el nivel real, la proyección discontinua, la banda de incertidumbre de relleno sólido sin degradado, las líneas de umbral con su etiqueta, y el periodo y la unidad.
- [ ] CA-25: las líneas de umbral usan el color del estado que activan y su valor sale de `config.json`.
- [ ] CA-26: el panel muestra el ritmo actual de subida en mm por hora con su unidad, con la misma precisión que su rango.
- [ ] CA-27: con menos lecturas que el mínimo de `config.json` se muestra "Sin pronóstico" con la razón, nunca una proyección.
- [ ] CA-28: con el nivel estable o bajando se muestra "Sin pronóstico de creciente" con la razón y qué hacer, y no un tiempo hasta el umbral.
- [ ] CA-29: si el nivel ya superó un umbral, se indica "Ya superado" para ese umbral en lugar de un rango.
- [ ] CA-30: si el tiempo proyectado supera el horizonte máximo de `config.json`, se muestra "No se proyecta en las próximas N h" y nunca "más de N h" ni una frase que suene tranquilizadora.
- [ ] CA-31: una lectura espuria aislada no cambia de forma brusca el pronóstico.
- [ ] CA-32: la pantalla incluye la nota fija "Proyección, no medición", el aviso "Una lluvia intensa puede acelerar la subida y hacer que esta proyección se quede corta" y la etiqueta "Datos simulados".
- [ ] CA-33: la **conclusión en una frase** es lo más grande de la pantalla y va antes que la gráfica; la gráfica nunca aparece sin una frase que diga qué significa.
- [ ] CA-34: sin pronóstico, la gráfica usa todo el ancho para las últimas horas y no deja espacio vacío reservado para una proyección.
- [ ] CA-35: el resumen del método ("Cómo se calcula") siempre muestra texto; nunca hay una sección con solo un título.
- [ ] CA-36: con la última lectura más vieja que el máximo de `config.json`, el Pronóstico dice "Sin pronóstico: datos viejos" y no proyecta.
- [ ] CA-37: el Pronóstico muestra el nivel actual (o el último conocido, si los datos son viejos) y la antigüedad del dato.
- [ ] CA-38: se puede navegar entre Estado actual y Pronóstico con teclado y con mouse, con foco visible; cada pantalla indica su rol y la activa se distingue por relleno, no solo por subrayado.
- [ ] CA-39: la gráfica tiene alternativa en texto (tabla o resumen) para lectores de pantalla.
- [ ] CA-40: las pruebas automatizadas cubren los casos límite del pronóstico: pocas lecturas, datos viejos, nivel bajando, nivel plano, umbral ya superado, ruido, lectura espuria, lecturas fuera de orden y tiempo mayor al horizonte.

**General**

- [ ] CA-41: cada pantalla, en una captura a 1440 × 900, coincide con su maqueta aprobada en composición, jerarquía y tamaños relativos.
- [ ] CA-42: las pantallas no tienen animaciones ni transiciones de color.
- [ ] CA-43: la entrega es una carpeta que abre con doble clic en el navegador, sin servidor, sin instalar nada y sin red, y muestra todos los escenarios con sus datos incluidos (decisión tomada en `/speckit-clarify`).
- [ ] CA-44: cada escenario tiene un "ahora" fijo: dejarlo abierto no cambia su estado, su pronóstico ni la antigüedad mostrada.
- [ ] CA-45: una lectura imposible se descarta y se avisa con cuántas se descartaron; si no quedan lecturas válidas suficientes, el estado es "Sin datos" y el Pronóstico no proyecta.

## 10. Escenarios de ejemplo (fixtures)

- **Datos de producción:** ninguno. La app no trae lecturas reales.
- **Escenarios (todos con `simulated: true`): 13, en dos grupos.** *Demostración*: tormenta normal, ciclón en tres etapas (inicio de la creciente, nivel en Revisar y nivel en No cruzar), estiaje, pocas lecturas y lecturas viejas. *Casos de prueba*: nivel que baja, nivel plano, subida acelerada, subida con ruido, lectura espuria y lecturas imposibles. Cada uno es una carpeta con su `escenario.json` (con su `group` y su "ahora" fijo), su `config.json` y su `readings.json`. El detalle está en `data/ESQUEMA.md`.
- **Valores iniciales de `config.json` (supuestos provisionales, decididos en `/speckit-clarify`):** subir de estado con 3 lecturas seguidas, bajar con 5, lectura vieja a partir de 30 minutos, ventana de cálculo del pronóstico de 2 h, mínimo de 6 lecturas para pronosticar y horizonte máximo de 6 h. Siguen leyéndose de la configuración.
- **"Ahora" fijo:** al elegir un escenario, su última lectura queda siempre con la misma antigüedad (por ejemplo, "hace 3 min"). El escenario de lecturas viejas nace con su última lectura más vieja que 30 minutos.
- Los umbrales de ejemplo (Revisar 600 mm, No cruzar 850 mm, paso 1000 mm) y los parámetros del pronóstico son **supuestos provisionales**, no mediciones, y no son los del arroyo real. `config.json` lo marca con `assumed: true`.
- Casos de prueba aparte: archivos con esquema inválido o sin zona horaria.

## 11. Fuera de alcance de este sprint

- Funcionamiento sin red, PWA, service worker y copia local de los datos (Sprint 2B, opcional).
- Datos reales, conexión con un nodo, un simulador o cualquier servicio externo.
- Reportes, IndexedDB, exportar e importar `reports.json`.
- Laderas, Recomendador verde y Panel institucional.
- Modelo hidrológico o cálculo con saturación del suelo o lluvia acumulada (el pronóstico solo extrapola el ritmo de subida).
- Notificaciones push, alertas automáticas y envío de avisos por cualquier medio.
- Edición de `config.json` desde el panel.
- Auditoría completa del tema oscuro.
- Una librería de gráficas (la gráfica es SVG propio) y el mapa.
- Versión para celular o tableta.

## 12. Decisiones pendientes para /speckit.clarify

> Cosas que NO deben asumirse sin confirmación.

> **Ya decididas en `/speckit-clarify` (2026-10-16):** el "ahora" de cada escenario es fijo; subir con 3 lecturas, bajar con 5 y lectura vieja a los 30 minutos (ventana de 2 h, mínimo de 6 lecturas y horizonte de 6 h salen de las maquetas); una lectura imposible se descarta y se avisa; la entrega se abre con doble clic. Como consecuencia, los escenarios se incluyen dentro de la entrega y la lectura sigue pasando por repositorios; cómo se arma internamente se decide en la planeación.

- Cómo se define "paso": nivel en mm contra una cota de referencia (propuesto) o distancia del sensor.
- Método de extrapolación del pronóstico, cómo se calcula el rango de incertidumbre y cuánto se ensancha con el horizonte.
- Si el pronóstico considera la zona ciega del sensor (unos 250 mm) y cómo trata lecturas fuera de rango.
- Redacción final de los mensajes de ejemplo y de la conclusión del pronóstico en cada caso.
- Gestor de estado (hooks y contexto, o Zustand) y navegación (propuesta: sin librería de rutas, sincronizada con el `hash`).

## 13. Restricciones heredadas

Aplican todas las de `docs/reglas.md`. No se copian aquí. Restricciones adicionales de este sprint:

- No se agregan dependencias fuera del núcleo permitido sin justificarlas (Lucide está aprobada por el autor desde el 2026-10-16).
- Los valores de umbral y de parámetros de los escenarios son provisionales y se marcan como supuestos. No se escriben valores de umbral, horizonte, ventana ni mínimo en el código.
- El pronóstico es una extrapolación didáctica del ritmo de subida. No debe presentarse como un modelo hidrológico validado ni como sustituto de una alerta oficial.
- Las maquetas están aprobadas (2026-10-16). La composición, la jerarquía y los tamaños relativos de las pantallas deben coincidir con ellas; un cambio de composición se aprueba de nuevo antes de implementarlo.
