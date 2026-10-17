# Modelo de datos (Fase 1): Panel de monitoreo (MVP)

Los nombres de campos son los del contrato de archivos (en inglés, `snake_case`) y los tipos de TypeScript los reflejan. El formato exacto está en [contracts/datos-json.md](contracts/datos-json.md), que se convertirá en `data/ESQUEMA.md`.

## Entidades

### Escenario (`escenario.json`)

Situación de ejemplo simulada. Agrupa una configuración y una serie de lecturas.

| Campo | Tipo | Regla |
|---|---|---|
| `schema_version` | entero | Debe ser `1`; otra versión se rechaza con mensaje claro. |
| `id` | texto | Único, en minúsculas, con guiones y sin tildes (por ejemplo `tormenta-normal`); coincide con el nombre de la carpeta. |
| `group` | `demo` o `test` | Grupo del selector: `demo` = "Demostración", `test` = "Casos de prueba". |
| `name` | texto | Nombre que ve quien presenta ("Tormenta normal"). |
| `description` | texto | Una frase de qué demuestra. |
| `now` | fecha y hora ISO 8601 **con zona horaria** | El "ahora" fijo del escenario. Debe ser mayor o igual que la última lectura (con tolerancia de 60 s). |

### Configuración (`config.json`)

| Campo | Tipo | Regla |
|---|---|---|
| `schema_version` | entero | Debe ser `1`. |
| `assumed` | booleano | `true` en los escenarios de ejemplo: los valores son supuestos provisionales. |
| `thresholds.review_mm` | número ≥ 0 | Umbral de Revisar. |
| `thresholds.stop_mm` | número | Umbral de No cruzar; mayor que `review_mm`. |
| `crossing_mm` | número | Nivel del paso; mayor o igual que `stop_mm`. |
| `sustain.readings_to_raise` | entero ≥ 1 | Lecturas seguidas para subir de estado. |
| `sustain.readings_to_lower` | entero ≥ 1 | Lecturas seguidas para bajar de estado. |
| `max_reading_age_min` | número > 0 | Minutos a partir de los cuales una lectura es "vieja" y entre lecturas hay "hueco". |
| `plausible_level_mm.min` / `.max` | números, `min < max` | Rango de niveles posibles; fuera de él una lectura es imposible. |
| `rain_windows_h` | lista de números > 0 (al menos uno) | Ventanas en horas para la lluvia acumulada. |
| `forecast.window_min` | número > 0 | Ventana de cálculo del pronóstico. |
| `forecast.min_readings` | entero ≥ 2 | Mínimo de lecturas válidas en la ventana. |
| `forecast.horizon_h` | número > 0 | Horizonte máximo del pronóstico. |
| `forecast.flat_rate_mm_h` | número ≥ 0 | Ritmo por debajo del cual el nivel se considera estable. |

Valores de ejemplo: Revisar 600 mm, No cruzar 850 mm, paso 1000 mm, subir 3, bajar 5, vieja 30 min, rango plausible 0 a 3000 mm, ventana 120 min, mínimo 6, horizonte 6 h, estable 5.0 mm/h.

### Lectura (`readings.json`)

El archivo es `{ schema_version, readings: [...] }`. Solo se agregan lecturas; el panel nunca las modifica.

| Campo | Tipo | Regla |
|---|---|---|
| `timestamp` | fecha y hora ISO 8601 **con zona horaria** | Sin zona, el archivo se rechaza. |
| `level_mm` | número | Nivel del agua en mm sobre una cota de referencia. Fuera de `plausible_level_mm` es imposible. |
| `rain_mm` | número ≥ 0 | Lluvia en mm del intervalo que cierra la lectura. La lluvia acumulada de una ventana de `h` horas es la suma de las lecturas con hora en `(now − h, now]`. Es solo informativa: no entra en la clasificación ni en el pronóstico. |
| `simulated` | booleano | `true` en todos los escenarios de ejemplo. |

Reglas de lectura: pueden venir fuera de orden (se ordenan por hora); con la misma hora vale la que aparece después en el archivo; las que adelantan más de 60 s respecto a `now` se descartan.

### Evento y Reporte (`events.json`, `reports.json`)

Solo se definen sus tipos y esquemas (con `schema_version`); este MVP no los lee ni los muestra.

### Estado del paso (calculado, no se guarda)

| Campo | Tipo | Descripción |
|---|---|---|
| `kind` | `normal` \| `review` \| `stop` \| `nodata` | Estado mostrado. |
| `lastReadingAt` | fecha y hora u omitido | Hora de la última lectura válida. |
| `ageMin` | número u omitido | Minutos entre `now` y la última lectura válida. |
| `lastLevelMm` | número u omitido | Nivel de la última lectura válida. |
| `discardedCount` | entero | Lecturas descartadas (imposibles o futuras). |
| `noDataReason` | `none` \| `stale` \| `insufficient` \| omitido | Solo con `nodata`. |

### Pronóstico (calculado, no se guarda)

| Campo | Tipo | Descripción |
|---|---|---|
| `kind` | `forecast` \| `no_forecast` | Si hay proyección. |
| `reason` | `few_readings` \| `stale` \| `falling` \| `flat` \| omitido | Solo con `no_forecast`. |
| `rate` | número, mm/h | Ritmo (mediana de pendientes). |
| `rateLow`, `rateHigh` | números, mm/h | Rango del ritmo (con el piso de incertidumbre). |
| `startLevelMm` | número | Nivel de partida robusto. |
| `thresholds` | lista de `{ key, valueMm, result }` | `result`: `exceeded`, `range` (`fromH`, `toH`), `from` (`fromH`) o `beyond` (`horizonH`). |
| `band` | lista de `{ h, lowMm, midMm, highMm }` | Puntos de proyección cada 0.5 h hasta el horizonte. |
| `summaryLevel` | `{ h, lowMm, highMm }` | Nivel proyectado a `horizon_h / 2`. |

### Mensaje de ejemplo

| Estado | Texto |
|---|---|
| Normal | "El paso está normal. No hay aviso que dar." |
| Revisar | "El arroyo está en Revisar. Pedimos que revisen el paso antes de cruzar." |
| No cruzar | "El arroyo llegó a No cruzar. Pedimos que nadie cruce el paso." |
| Sin datos | "No hay lecturas recientes. No se puede avisar con este panel; revisen el arroyo en persona." |

Es un borrador para la demostración; vive en `core/i18n/`.

## Relaciones

- Un **Escenario** tiene exactamente una **Configuración** y una serie de **Lecturas** (carpeta `data/escenarios/<id>/`).
- El **Estado del paso** y el **Pronóstico** se derivan de (Configuración, Lecturas, `now`); no se guardan.
- El **Mensaje de ejemplo** se elige por `kind` del Estado del paso.

## Transiciones de estado

Las reglas de cambio entre Normal, Revisar y No cruzar (arranque, lecturas sostenidas, descenso sostenido, hueco y "Sin datos") están en [contracts/clasificacion-estado.md](contracts/clasificacion-estado.md).
