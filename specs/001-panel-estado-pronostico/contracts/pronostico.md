# Contrato: regla del pronóstico de creciente

Función pura `forecast(readings, config, now) → Pronóstico`. No lee el reloj ni ningún archivo. Es una **extrapolación didáctica del ritmo de subida**: no sabe de lluvia ni de saturación del suelo y no es un modelo hidrológico validado. Las tablas de casos (20 o más) viven en `tests/casos/` y se calculan a mano; aquí van los ejemplos de referencia.

## Entradas y salida

- **Entradas**: lecturas crudas, `config.json` (sección `forecast` y `thresholds`) y `now`.
- **Salida**: `Pronóstico` con `kind: forecast | no_forecast` (ver `data-model.md`).

## Paso 1: limpiar y decidir si se pronostica

1. Limpiar las lecturas igual que en la clasificación (imposibles, futuras, orden, misma hora).
2. Si no hay lecturas válidas o la última tiene más de `max_reading_age_min` minutos → `no_forecast`, razón `stale`.
3. Tomar las lecturas de la ventana: las de hora ≥ `now` − `window_min`. Si hay menos de `forecast.min_readings` → `no_forecast`, razón `few_readings`.

## Paso 2: ritmo y rango

1. **Pendientes**: para cada par de lecturas de la ventana separadas **al menos 5 min**, `(nivel₂ − nivel₁) / (horas entre ambas)`, en mm/h.
2. **Ritmo** = mediana de las pendientes.
3. Si el ritmo es **menor que −`flat_rate_mm_h`** → `no_forecast`, razón `falling`. Si su valor absoluto es **menor o igual que `flat_rate_mm_h`** → `no_forecast`, razón `flat`.
4. **Rango del ritmo**: cuartil 25 (`rateLow`) y cuartil 75 (`rateHigh`) de las pendientes. **Piso de incertidumbre**: si `rateHigh − rateLow` es menor que `max(0.3 × ritmo, 10)` mm/h, se ensancha de forma simétrica alrededor del ritmo hasta esa amplitud. Así un tramo perfectamente recto nunca parece exacto.
5. **Nivel de partida** (`startLevelMm`) = mediana de `nivel − ritmo × (horas desde now)` sobre la ventana. Es robusto a una lectura espuria al final.

## Paso 3: tiempo hasta cada umbral

Para cada umbral `T` (Revisar y No cruzar), con `startLevelMm` como nivel actual:

- Si `startLevelMm ≥ T` → `exceeded` ("ya superado").
- Si no: `tempranoH = (T − startLevelMm) / rateHigh` y `tardioH = (T − startLevelMm) / rateLow` (infinito si `rateLow ≤ 0`). Se redondean **hacia afuera** a 0.5 h: `fromH = floor(2 × tempranoH) / 2` y `toH = ceil(2 × tardioH) / 2`.
  - Si `fromH ≥ horizon_h` → `beyond`: **No se proyecta en las próximas `horizon_h` h**.
  - Si no y `toH ≤ horizon_h` → `range`: entre `fromH` y `toH` h.
  - Si no (`toH > horizon_h`) → `from`: a partir de `fromH` h.

## Paso 4: banda de nivel

Para `h` desde 0 hasta `horizon_h` en pasos de 0.5 h: `lowMm = startLevelMm + rateLow × h`, `midMm = startLevelMm + ritmo × h`, `highMm = startLevelMm + rateHigh × h`. Es un abanico que se abre de forma lineal. El **nivel proyectado** que se muestra es el de `h = horizon_h / 2`, redondeado hacia afuera (`floor` el bajo, `ceil` el alto).

## Redacción (textos fijos y reglas)

El pronóstico **nunca** dice "hay tiempo", "más de N h" ni nada tranquilizador. Los textos viven en `core/i18n/`.

**Conclusión** (una frase, lo más grande de la pantalla):

| Situación | Frase |
|---|---|
| Revisar en rango | "Podría llegar a Revisar entre {A} y {B} h" |
| Revisar `from` | "Podría llegar a Revisar a partir de {A} h" |
| Revisar `beyond` | "No se proyecta llegar a Revisar en las próximas {N} h" |
| Revisar superado, No cruzar en rango | "Ya superó Revisar. Podría llegar a No cruzar entre {A} y {B} h" |
| Revisar superado, No cruzar `from` | "Ya superó Revisar. Podría llegar a No cruzar a partir de {A} h" |
| Revisar superado, No cruzar `beyond` | "Ya superó Revisar. No se proyecta llegar a No cruzar en las próximas {N} h" |
| No cruzar superado | "Ya superó No cruzar" |

Los tiempos se escriben sin ceros sobrantes: "2.5", "4". Cada umbral tiene además su renglón: "ya superado", "entre A y B h", "a partir de A h" o "No se proyecta en las próximas N h".

**Sin pronóstico** (tarjeta neutra con razón y qué hacer):

| `reason` | Título | Razón | Qué hacer |
|---|---|---|---|
| `few_readings` | "Sin pronóstico: hacen falta más lecturas" | "Hay {n} lecturas y se necesitan al menos {mín} para calcular el ritmo." | "Espera unos minutos. Mientras tanto, usa Estado actual." |
| `stale` | "Sin pronóstico: datos viejos" | "La última lectura es de las {HH:MM}, hace {edad}." | "No uses esta proyección. Revisa el arroyo en persona." |
| `falling` | "Sin pronóstico de creciente" | "El nivel está bajando ({ritmo} mm/h)." | "No hay aviso de creciente. Sigue vigilando el arroyo." |
| `flat` | "Sin pronóstico de creciente" | "El nivel está estable." | "No hay aviso de creciente. Sigue vigilando el arroyo." |

**Siempre visibles**: la nota "Proyección, no medición" (cuando hay proyección), el aviso "Una lluvia intensa puede acelerar la subida y hacer que esta proyección se quede corta", "Datos simulados" y el resumen de "Cómo se calcula" con la etiqueta "Supuesto".

**Cifras**: ritmo con un decimal y su rango con un decimal ("+60.0 mm/h", "entre +51.0 y +69.0 mm/h"); nivel proyectado en mm enteros, redondeado hacia afuera.

## Casos de referencia (calculados a mano)

Configuración: ventana 120 min, mínimo 6, horizonte 6 h, estable 5 mm/h; umbrales 600 y 850 mm. Lecturas cada 15 min. La tabla completa (P01 a P20) está en `tests/casos/pronostico.json`.

| # | Situación | Resultado |
|---|---|---|
| P01 | 9 lecturas lineales de 300 a 420 mm (60 mm/h), `now` en la última | Ritmo 60.0; rango 51.0 a 69.0 (piso: amplitud 18). Partida 420. Revisar: temprano 180/69 = 2.61 → 2.5; tardío 180/51 = 3.53 → 4 → **entre 2.5 y 4 h**. No cruzar: temprano 430/69 = 6.23 → 6.0 ≥ 6 → **no se proyecta en las próximas 6 h**. Nivel a 3 h: 420 + 51×3 = 573 y 420 + 69×3 = 627 → **entre 573 y 627 mm**. |
| P02 | Nivel de 500 a 450 mm en 2.5 h (−20 mm/h) | `no_forecast`, razón `falling`. |
| P03 | 420 mm constantes | Ritmo 0 → `no_forecast`, razón `flat`. |
| P04 | 5 lecturas en la ventana | `no_forecast`, razón `few_readings`. |
| P05 | Última lectura 3 h antes de `now` | `no_forecast`, razón `stale`. |
| P06 | Nivel de partida 660, ritmo 70 (piso: amplitud 21, rango 59.5 a 80.5) | Revisar `exceeded`. No cruzar: temprano 190/80.5 = 2.36 → 2.0; tardío 190/59.5 = 3.19 → 3.5 → **entre 2 y 3.5 h**. Nivel a 3 h: 660 + 59.5×3 = 838.5 → 838 y 660 + 80.5×3 = 901.5 → 902 → **entre 838 y 902 mm**. |
| P07 | Nivel de partida 400, ritmo 30 (piso: amplitud 10, rango 25 a 35) | Revisar: temprano 200/35 = 5.71 → 5.5; tardío 200/25 = 8 → 8 > 6 → `from`: **a partir de 5.5 h**. |
| P08 | Nivel de partida 900 (≥ 850) | Revisar y No cruzar `exceeded`: "Ya superó No cruzar". |
| P09 | Serie lineal de 60 mm/h con una sola lectura +300 mm en medio | La mediana de pendientes y el nivel de partida casi no cambian (prueba: ritmo dentro de ±5.0 mm/h y partida dentro de ±10 mm de P01). |
| P10 | Lecturas fuera de orden con las mismas horas de P01 | Mismo resultado que P01. |
| P11 | P01 con una lectura imposible (−50 mm) intercalada | Se descarta; mismo resultado que P01 y `discardedCount` 1. |

Un resultado repetible: con las mismas lecturas, la misma configuración y el mismo `now`, la función devuelve siempre lo mismo.
