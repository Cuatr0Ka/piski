# Contrato: archivos de datos (JSON)

Este contrato se convierte en `data/ESQUEMA.md` durante la implementación (principio X). Todos los archivos llevan `schema_version`; si no coincide con la versión que el panel soporta (`1`), se rechazan con un mensaje claro. Los nombres de campos van en inglés y los mensajes al usuario en español.

Reglas generales:

- Todas las marcas de tiempo son ISO 8601 **con zona horaria** (`-06:00` o `Z`). Sin zona, el archivo se rechaza.
- El panel solo **lee**; nunca modifica `readings.json` ni `events.json`.
- Un archivo inválido produce un mensaje que dice qué archivo falló y cómo arreglarlo, sin trazas. El panel sigue mostrando el último escenario válido.

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

`now` es el "ahora" fijo del escenario. `id` coincide con el nombre de la carpeta. `group` es `demo` ("Demostración") o `test` ("Casos de prueba") y decide en qué grupo aparece en el selector.

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

Validaciones: `review_mm < stop_mm ≤ crossing_mm`; `rain_windows_h` lista no vacía de números > 0; `readings_to_raise` y `readings_to_lower` enteros ≥ 1; `plausible_level_mm.min < max`; `min_readings` entero ≥ 2. `assumed: true` indica que los valores son supuestos provisionales y activa la nota de umbrales provisionales.

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

Solo se agregan lecturas. El panel acepta lecturas fuera de orden y repetidas (ver `clasificacion-estado.md`). `simulated` es obligatorio.

## `events.json` y `reports.json`

Solo se definen; el MVP no los usa.

```json
{ "schema_version": 1, "events": [ { "timestamp": "2026-10-15T14:00:00-06:00", "type": "state_change", "message": "Normal a Revisar" } ] }
```

```json
{ "schema_version": 1, "reports": [ { "id": "r-001", "timestamp": "2026-10-15T14:10:00-06:00", "type": "blocked_road", "approximate_location": "Camino al paso", "note": "Árbol caído" } ] }
```

Los reportes no llevan datos personales (nombre, teléfono ni cuenta).

## Escenarios de ejemplo (`data/escenarios/<id>/`)

Todos con `simulated: true`, `assumed: true` y la configuración de ejemplo de arriba (salvo indicación). Las lecturas llegan cada 15 minutos y la última queda 3 minutos antes de `now`, salvo en "lecturas viejas". Los escenarios se agrupan en el selector.

**Demostración**

| `id` | Qué demuestra | Estado esperado | Pronóstico esperado |
|---|---|---|---|
| `tormenta-normal` | Nivel estable alrededor de 400 mm con ruido leve | Normal | Sin pronóstico (estable) |
| `ciclon-inicio` | Subida sostenida de 60 mm/h hasta 420 mm | Normal | Revisar entre 2.5 y 3.5 h; No cruzar "no se proyecta en las próximas 6 h" |
| `ciclon-revisar` | Subida de unos 70 mm/h hasta 660 mm | Revisar | Revisar "ya superado"; No cruzar en unas 2 a 3.5 h |
| `ciclon-no-cruzar` | Nivel de 910 mm sostenido | No cruzar | "Ya superó No cruzar" |
| `estiaje` | Nivel bajo que baja despacio (de 200 a 150 mm) | Normal | Sin pronóstico (bajando) |
| `pocas-lecturas` | Solo 3 lecturas (de 380 a 420 mm) | Normal (arranque) | Sin pronóstico (hacen falta más lecturas) |
| `lecturas-viejas` | Última lectura de 480 mm, 3 h antes de `now` | Sin datos | Sin pronóstico (datos viejos) |

**Casos de prueba**

| `id` | Qué demuestra | Estado esperado | Pronóstico esperado |
|---|---|---|---|
| `nivel-baja` | Pico de 500 mm y bajada de unos 20 mm/h hasta 450 mm | Normal | Sin pronóstico (bajando) |
| `nivel-plano` | 420 mm constantes | Normal | Sin pronóstico (estable) |
| `subida-acelerada` | El ritmo crece de 40 a 100 mm/h; nivel final 520 mm | Normal | Pronóstico con rango amplio |
| `ruido` | Subida lenta con ruido de ±20 mm | Normal | Pronóstico con rango amplio |
| `lectura-espuria` | Nivel normal con una sola lectura de 950 mm entre lecturas de unos 400 mm | Normal (no cambia) | Estable y robusto a la lectura espuria |
| `lectura-imposible` | Lecturas válidas más una de −50 mm y otra de 9990 mm | Normal, con aviso "Se descartaron 2 lecturas fuera de rango" | Calculado con las válidas |

## Archivos inválidos de prueba (`tests/fixtures/`)

Esquema con campo faltante; `schema_version` distinta de 1; marca de tiempo sin zona horaria; `review_mm` mayor o igual que `stop_mm`; JSON mal formado. Cada uno debe producir un mensaje claro y accionable, sin trazas.
