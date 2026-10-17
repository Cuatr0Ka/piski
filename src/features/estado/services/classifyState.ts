import { cleanReadings } from '../../../core/readings/cleanReadings';
import type { Config } from '../../../core/schemas/config';
import type { Reading } from '../../../core/schemas/readings';
import { minutesBetween } from '../../../core/time/clock';
import type { EstadoKind, EstadoPaso } from '../types';

// Bandas de nivel: 0 = normal, 1 = revisar, 2 = no cruzar.
type Banda = 0 | 1 | 2;
const KIND_DE_BANDA: readonly EstadoKind[] = ['normal', 'review', 'stop'];

const banda = (nivel: number, config: Config): Banda => {
  if (nivel >= config.thresholds.stop_mm) return 2;
  if (nivel >= config.thresholds.review_mm) return 1;
  return 0;
};

function bandaMaxima(bandas: readonly Banda[], desde: number, hasta: number): Banda {
  let m: Banda = 0;
  for (let i = desde; i <= hasta; i++) m = Math.max(m, bandas[i] ?? 0) as Banda;
  return m;
}

function bandaMinima(bandas: readonly Banda[], desde: number, hasta: number): Banda {
  let m: Banda = 2;
  for (let i = desde; i <= hasta; i++) m = Math.min(m, bandas[i] ?? 0) as Banda;
  return m;
}

/**
 * Regla de clasificación del estado (contracts/clasificacion-estado.md), la misma que debe
 * reproducir la baliza. Función pura: el "ahora" lo recibe, nunca lee el reloj.
 * Todos los umbrales y números de lecturas salen de `config`.
 */
export function classifyState(lecturas: readonly Reading[], config: Config, now: number): EstadoPaso {
  const { readings, discardedCount } = cleanReadings(lecturas, config, now);

  const ultima = readings[readings.length - 1];
  if (ultima === undefined) {
    return { kind: 'nodata', discardedCount, noDataReason: discardedCount > 0 ? 'insufficient' : 'none' };
  }

  const ageMin = minutesBetween(ultima.timestamp, now);
  const base = { lastReadingAt: ultima.timestamp, ageMin, lastLevelMm: ultima.levelMm, discardedCount };

  // Una lectura más vieja que el máximo (estrictamente) deja el estado sin datos: nunca se asume Normal.
  if (ageMin > config.max_reading_age_min) return { ...base, kind: 'nodata', noDataReason: 'stale' };

  const bandas = readings.map((r) => banda(r.levelMm, config));
  const maxHuecoMs = config.max_reading_age_min * 60_000;
  const { readings_to_raise: subir, readings_to_lower: bajar } = config.sustain;

  let estado: Banda = 0;
  let inicioSegmento = 0;
  for (let i = 0; i < readings.length; i++) {
    const actual = readings[i];
    const previa = readings[i - 1];
    // Un hueco mayor que el máximo reinicia el conteo (uno exactamente igual, no).
    if (actual !== undefined && previa !== undefined && actual.timestamp - previa.timestamp > maxHuecoMs) {
      inicioSegmento = i;
    }
    const cuenta = i - inicioSegmento + 1;

    if (cuenta < subir) {
      // Arranque: la banda más alta de las lecturas disponibles del segmento.
      estado = bandaMaxima(bandas, inicioSegmento, i);
      continue;
    }
    const sube = bandaMinima(bandas, i - subir + 1, i);
    if (sube > estado) {
      estado = sube;
    } else if (cuenta >= bajar) {
      const baja = bandaMaxima(bandas, i - bajar + 1, i);
      if (baja < estado) estado = baja;
    }
  }

  return { ...base, kind: KIND_DE_BANDA[estado] ?? 'normal' };
}
