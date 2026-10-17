# Esquema de los archivos de datos (JSON)

Contrato de los archivos que lee el Panel Piski (principio X de la constitución). Lo define y lo mantiene este proyecto; cualquier cambio se anota aquí y en `docs/decisiones.md`. Los esquemas de validación están en `src/core/schemas/` y deben reflejar este documento.

Reglas generales:

- Todos los archivos llevan `schema_version`. El panel solo soporta la versión `1`; otra versión se rechaza con un mensaje claro.
- Todas las marcas de tiempo son ISO 8601 **con zona horaria** (`-06:00` o `Z`). Sin zona, el archivo se rechaza.
- El panel solo **lee**: nunca modifica `readings.json` ni `events.json`.
- Un archivo inválido produce un mensaje que nombra el archivo y dice cómo arreglarlo, sin trazas. El panel sigue mostrando el último escenario válido.
- Los nombres de campos van en inglés y `snake_case`; los mensajes al usuario van en español.

## Carpeta de un escenario

Cada escenario de ejemplo es una carpeta `data/escenarios/<id>/` con tres archivos: `escenario.json`, `config.json` y `readings.json`. Los genera `npm run generar:escenarios` (`scripts/generar-escenarios.mjs`).

## `escenario.json`

```json
{
  "schema_version": 1,
  "id": "ciclon-inicio",
  "group": "demo",
  "name": "Ciclón: inicio de la creciente",
  "description": "El nivel sube de forma sostenida; el pronóstico estima cuándo llegaría a Revisar.",
  "now": "2026-10-15T14:30:00-06:00"
}
```

| Campo | Tipo | Regla |
|---|---|---|
| `schema_version` | entero | Debe ser `1`. |
| `id` | texto | Único, en minúsculas, con guiones y sin tildes; coincide con el nombre de la carpeta. |
| `group` | `demo` o `test` | Grupo del selector: `demo` = "Demostración", `test` = "Casos de prueba". |
| `name` | texto | Nombre que ve quien presenta. |
| `description` | texto | Una frase de qué demuestra. |
| `now` | fecha y hora ISO 8601 con zona horaria | El "ahora" **fijo** del escenario: todas las antigüedades se calculan contra él, nunca contra el reloj real. |

## `config.json`

```json
{
  "schema_version": 1,
  "assumed": true,
  "thresholds": { "review_mm": 600, "stop_mm": 850 },
  "crossing_mm": 1000,
  "sustain": { "readings_to_raise": 3, "readings_to_lower": 5 },
  "max_reading_age_min": 30,
  "plausible_level_mm": { "min": 0, "max": 3000 },
  "rain_windows_h": [1, 3, 6],
  "forecast": {
    "window_min": 120,
    "min_readings": 6,
    "horizon_h": 6,
    "flat_rate_mm_h": 5
  }
}
```

| Campo | Tipo | Regla |
|---|---|---|
| `schema_version` | entero | Debe ser `1`. |
| `assumed` | booleano | `true` en los escenarios de ejemplo: los valores son supuestos provisionales y no son los del arroyo real. |
| `thresholds.review_mm` | número ≥ 0 | Umbral de Revisar. |
| `thresholds.stop_mm` | número | Umbral de No cruzar; mayor que `review_mm`. |
| `crossing_mm` | número | Nivel del paso; mayor o igual que `stop_mm`. |
| `sustain.readings_to_raise` | entero ≥ 1 | Lecturas seguidas para subir de estado. |
| `sustain.readings_to_lower` | entero ≥ 1 | Lecturas seguidas para bajar de estado. |
| `max_reading_age_min` | número > 0 | Minutos a partir de los cuales una lectura es "vieja" y entre lecturas hay "hueco". |
| `plausible_level_mm.min` / `.max` | números, `min < max` | Rango de niveles posibles; fuera de él una lectura es imposible y se descarta. |
| `rain_windows_h` | lista de números > 0 (al menos uno) | Ventanas, en horas, para la lluvia acumulada que muestra el panel (por ejemplo 1, 3 y 6 h). |
| `forecast.window_min` | número > 0 | Ventana de cálculo del pronóstico. |
| `forecast.min_readings` | entero ≥ 2 | Mínimo de lecturas válidas en la ventana. |
| `forecast.horizon_h` | número > 0 | Horizonte máximo del pronóstico. |
| `forecast.flat_rate_mm_h` | número ≥ 0 | Ritmo por debajo del cual el nivel se considera estable. |

## `readings.json`

```json
{
  "schema_version": 1,
  "readings": [
    { "timestamp": "2026-10-15T12:30:00-06:00", "level_mm": 300, "rain_mm": 4.5, "simulated": true },
    { "timestamp": "2026-10-15T12:45:00-06:00", "level_mm": 315, "rain_mm": 5.0, "simulated": true }
  ]
}
```

| Campo | Tipo | Regla |
|---|---|---|
| `timestamp` | fecha y hora ISO 8601 con zona horaria | Sin zona, el archivo se rechaza. |
| `level_mm` | número | Nivel del agua en mm sobre una cota de referencia. Fuera de `plausible_level_mm` es imposible. |
| `rain_mm` | número ≥ 0 | Lluvia caída en mm durante el intervalo que cierra esa lectura (como el pluviómetro de una app del clima). El panel la suma por ventana. |
| `simulated` | booleano | Obligatorio; `true` en todos los escenarios de ejemplo. |

Solo se agregan lecturas; nunca se editan. El panel acepta lecturas fuera de orden y repetidas: se ordenan por hora y, con la misma hora, vale la que aparece **después** en el archivo. Las lecturas que adelantan más de 60 s respecto al "ahora" se descartan.

## `events.json` y `reports.json`

Solo se definen; el MVP no los usa.

```json
{ "schema_version": 1, "events": [ { "timestamp": "2026-10-15T14:00:00-06:00", "type": "state_change", "message": "Normal a Revisar" } ] }
```

```json
{ "schema_version": 1, "reports": [ { "id": "r-001", "timestamp": "2026-10-15T14:10:00-06:00", "type": "blocked_road", "approximate_location": "Camino al paso", "note": "Árbol caído" } ] }
```

Los reportes no llevan datos personales (nombre, teléfono ni cuenta); el esquema rechaza cualquier campo extra.

## Escenarios de ejemplo

Todos con `simulated: true`, `assumed: true` y la configuración de ejemplo de arriba. Las lecturas llegan cada 15 minutos y la última queda 3 minutos antes de `now`, salvo en `lecturas-viejas`.

**Demostración (`demo`)**

| `id` | Qué demuestra | Estado esperado | Pronóstico esperado |
|---|---|---|---|
| `tormenta-normal` | Nivel estable alrededor de 400 mm con ruido leve | Normal | Sin pronóstico (estable) |
| `ciclon-inicio` | Subida sostenida de 60 mm/h hasta 420 mm | Normal | Revisar entre 2.5 y 3.5 h; No cruzar "no se proyecta en las próximas 6 h" |
| `ciclon-revisar` | Subida de unos 70 mm/h hasta 660 mm | Revisar | Revisar "ya superado"; No cruzar en unas 2 a 3.5 h |
| `ciclon-no-cruzar` | Nivel de 910 mm sostenido | No cruzar | "Ya superó No cruzar" |
| `estiaje` | Nivel bajo que baja despacio (de 200 a 150 mm) | Normal | Sin pronóstico (bajando) |
| `pocas-lecturas` | Solo 3 lecturas (de 380 a 420 mm) | Normal (arranque) | Sin pronóstico (hacen falta más lecturas) |
| `lecturas-viejas` | Última lectura de 480 mm, 3 h antes de `now` | Sin datos | Sin pronóstico (datos viejos) |

**Casos de prueba (`test`)**

| `id` | Qué demuestra | Estado esperado | Pronóstico esperado |
|---|---|---|---|
| `nivel-baja` | Pico de 500 mm y bajada de unos 20 mm/h hasta 450 mm | Normal | Sin pronóstico (bajando) |
| `nivel-plano` | 420 mm constantes | Normal | Sin pronóstico (estable) |
| `subida-acelerada` | El ritmo crece de 40 a 100 mm/h; nivel final 520 mm | Normal | Pronóstico con rango amplio |
| `ruido` | Subida lenta con ruido de ±20 mm | Normal | Pronóstico con rango amplio |
| `lectura-espuria` | Nivel normal con una sola lectura de 950 mm entre lecturas de unos 400 mm | Normal (no cambia) | Estable y robusto a la lectura espuria |
| `lectura-imposible` | Lecturas válidas más una de −50 mm y otra de 9990 mm | Normal, con aviso "Se descartaron 2 lecturas fuera de rango" | Calculado con las válidas |

## Archivos inválidos de prueba (`tests/fixtures/invalidos/`)

Campo faltante, `schema_version` distinta de 1, marca de tiempo sin zona horaria, `review_mm` mayor o igual que `stop_mm` y JSON mal formado. Cada uno debe producir un mensaje claro y accionable, sin trazas.


## Mapa de la región (`data/mapa/region.json`)

Lo genera `npm run generar:mapa` (descarga una sola vez; el panel no necesita red al abrirse). Contiene:

| Campo | Contenido |
|---|---|
| `bbox` | `[oeste, sur, este, norte]` en grados |
| `municipalities` | Contornos de Huauchinango (con la localidad de Necaxa) y Xicotepec de Juárez; fuente: INEGI, Marco Geoestadístico |
| `waterways` | Cauces con nombre recortados a los municipios; `main: true` marca el arroyo de ejemplo (La Morena); fuente: OpenStreetMap |
| `reservoirs` | Presas dentro de los municipios |
| `places` | Localidades (Necaxa va con ubicación aproximada, porque OpenStreetMap no tiene su nodo) |
| `beacons` | Balizas de ejemplo: `id`, `name`, `lon`, `lat`, `municipality` y `level_factor` |

`level_factor` multiplica el nivel del escenario activo para simular que cada baliza mide un nivel distinto; el estado de cada una se calcula con la misma regla y la misma configuración que Estado actual. Las coordenadas y los niveles de las balizas son de ejemplo. Atribución obligatoria: INEGI y © colaboradores de OpenStreetMap (ODbL).
