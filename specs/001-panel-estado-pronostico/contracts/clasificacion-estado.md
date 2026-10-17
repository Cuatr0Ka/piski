# Contrato: regla de clasificación del estado

Función pura `classifyState(readings, config, now) → EstadoPaso`. No lee el reloj ni ningún archivo. Es la regla que la baliza física debe reproducir (principio IV); las tablas de casos de referencia viven en `tests/casos/` y se calculan a mano.

## Entradas y salida

- **Entradas**: lecturas crudas, `config.json` validada y `now` (el "ahora" fijo del escenario).
- **Salida**: `{ kind: normal | review | stop | nodata, lastReadingAt, ageMin, lastLevelMm, discardedCount, noDataReason }` (ver `data-model.md`).

## Paso 1: limpiar las lecturas

1. Descartar las lecturas **imposibles**: `level_mm` fuera de `plausible_level_mm`. Cuentan en `discardedCount`.
2. Descartar las lecturas **del futuro**: `timestamp` mayor que `now` + 60 s. Cuentan en `discardedCount`. Una que adelante exactamente 60 s se conserva.
3. **Ordenar** por `timestamp` ascendente. Si dos lecturas tienen la misma hora, vale la que aparece **después** en el archivo.

## Paso 2: ¿hay datos?

- Sin lecturas válidas → `nodata`. Razón `none` si no había lecturas; `insufficient` si las había pero se descartaron todas.
- Si la última lectura tiene más de `max_reading_age_min` minutos de antigüedad (`now` − hora, **estrictamente mayor**) → `nodata`, razón `stale`. Con exactamente `max_reading_age_min` no es vieja.
- Nunca se asume Normal cuando no hay datos.

## Paso 3: banda de cada lectura

- `stop` (2) si `level_mm ≥ thresholds.stop_mm`.
- `review` (1) si `level_mm ≥ thresholds.review_mm` (un valor **igual al umbral cuenta como alcanzado**).
- `normal` (0) en otro caso.

## Paso 4: estado con lecturas sostenidas

Se recorre la serie en orden manteniendo el estado `S`. Un **segmento** empieza en la primera lectura y se reinicia cuando entre dos lecturas consecutivas pasa **más** que `max_reading_age_min` (un hueco exactamente igual no reinicia). Para la lectura `i` del segmento, con `count` lecturas desde el inicio del segmento:

1. **Arranque**: si `count < readings_to_raise`, `S` = la banda **más alta** de las lecturas del segmento hasta `i`. Una sola lectura en No cruzar da No cruzar.
2. **Subir**: si `count ≥ readings_to_raise`, sea `up` la banda **más baja** entre las últimas `readings_to_raise` lecturas. Si `up > S`, `S = up`.
3. **Bajar**: si no subió y `count ≥ readings_to_lower`, sea `down` la banda **más alta** entre las últimas `readings_to_lower` lecturas. Si `down < S`, `S = down`.
4. El estado final es `S` de la última lectura, salvo `nodata`.

Subir y bajar usan ventanas distintas; volver a Normal exige un descenso sostenido.

## Casos de referencia (calculados a mano)

Configuración: Revisar 600 mm, No cruzar 850 mm, subir 3, bajar 5, vieja 30 min. Lecturas cada 15 min; `now` = última lectura + 5 min, salvo indicación.

| # | Lecturas (mm) | Estado | Por qué |
|---|---|---|---|
| C01 | 420, 430, 440 | Normal | Todas en banda normal. |
| C02 | 420, 430, 700 | Normal | Espuria: las últimas 3 incluyen dos normales; `up` = normal. |
| C03 | 420, 430, 440, 700 | Normal | Igual: las últimas 3 son 430, 440 y 700. |
| C04 | 900 | No cruzar | Arranque: una sola lectura en No cruzar. |
| C05 | 900, 420 | No cruzar | Arranque: banda más alta de las disponibles. |
| C06 | 420, 430, 700, 710, 720 | Revisar | Las últimas 3 (700, 710, 720) están en Revisar: sube. |
| C07 | 500, 500, 600, 600, 600 | Revisar | Valor igual al umbral cuenta; las últimas 3 son 600. |
| C08 | 900, 900, 900, 500, 500, 500, 500 | No cruzar | Solo 4 lecturas bajas; bajar exige 5. |
| C09 | 900, 900, 900, 500, 500, 500, 500, 500 | Normal | 5 lecturas seguidas bajas: baja a Normal. |
| C10 | 900, 900, 900, 700, 700, 700, 700, 700 | Revisar | 5 lecturas en Revisar: baja de No cruzar a Revisar. |
| C11 | 900, 900, 900, [hueco de 30 min], 500 | No cruzar | Hueco igual al máximo: no reinicia; solo 4 lecturas, no baja. |
| C12 | 900, 900, 900, [hueco de 31 min], 500 | Normal | Hueco mayor: reinicia; arranque con una lectura normal. |
| C13 | (sin lecturas) | Sin datos (`none`) | No hay lecturas. |
| C14 | 420, 430, 440 con `now` = última + 31 min | Sin datos (`stale`) | Más vieja que 30 min. |
| C15 | 420, 430, 440 con `now` = última + 30 min | Normal | Exactamente 30 min: no es vieja. |
| C16 | 420, −50, 440, 430 | Normal, `discardedCount` 1 | Se descarta −50; quedan 420, 440, 430. |
| C17 | una lectura con hora `now` + 61 s | Sin datos (`insufficient`) | Descartada por futura; no queda ninguna. |
| C18 | una lectura con hora `now` + 60 s, 420 | Normal | Adelanto exacto de 60 s se conserva. |
| C19 | en el archivo: 440 (hora 3), 420 (hora 1), 430 (hora 2) | Normal | Se ordenan por hora antes de evaluar. |
| C20 | dos lecturas con la misma hora: 400 y luego 900 | No cruzar | Con la misma hora vale la que aparece después (900). |

Si la implementación de la baliza difiere en algún caso, se revisa la regla en conjunto; no se ajusta el resultado esperado para que "pase".
