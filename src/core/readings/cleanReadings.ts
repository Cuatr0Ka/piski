import type { Config } from '../schemas/config';
import type { Reading } from '../schemas/readings';
import { FUTURE_TOLERANCE_MS, parseTimestamp } from '../time/clock';

/** Una lectura lista para calcular: instante en milisegundos y nivel en mm. */
export interface ReadingPoint {
  timestamp: number;
  levelMm: number;
  /** Lluvia caída desde la lectura anterior, en mm. */
  rainMm: number;
  simulated: boolean;
}

export interface CleanResult {
  /** Lecturas válidas, ordenadas por hora y sin horas repetidas. */
  readings: ReadingPoint[];
  /** Lecturas descartadas por imposibles (fuera de rango) o por venir del futuro. */
  discardedCount: number;
}

/**
 * Paso 1 de contracts/clasificacion-estado.md: descarta las lecturas imposibles y las que
 * adelantan más de 60 s respecto al "ahora", ordena por hora y, con la misma hora, deja la
 * que aparece después en el archivo. Función pura: el "ahora" lo recibe, nunca lee el reloj.
 */
export function cleanReadings(
  lecturas: readonly Reading[],
  config: Pick<Config, 'plausible_level_mm'>,
  ahora: number,
): CleanResult {
  const { min, max } = config.plausible_level_mm;
  let discardedCount = 0;
  const validas: Array<ReadingPoint & { indice: number }> = [];

  lecturas.forEach((l, indice) => {
    const timestamp = parseTimestamp(l.timestamp);
    const imposible = l.level_mm < min || l.level_mm > max;
    const futura = timestamp > ahora + FUTURE_TOLERANCE_MS;
    if (imposible || futura) {
      discardedCount += 1;
      return;
    }
    validas.push({ timestamp, levelMm: l.level_mm, rainMm: l.rain_mm, simulated: l.simulated, indice });
  });

  validas.sort((a, b) => a.timestamp - b.timestamp || a.indice - b.indice);

  const readings: ReadingPoint[] = [];
  for (const v of validas) {
    const ultima = readings[readings.length - 1];
    const punto: ReadingPoint = {
      timestamp: v.timestamp,
      levelMm: v.levelMm,
      rainMm: v.rainMm,
      simulated: v.simulated,
    };
    if (ultima && ultima.timestamp === v.timestamp) readings[readings.length - 1] = punto;
    else readings.push(punto);
  }
  return { readings, discardedCount };
}
