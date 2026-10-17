// Auxiliares para armar series de lecturas en las pruebas (cada 15 min, zona -06:00).
import type { Reading } from '../../src/core/schemas';

const INICIO = Date.parse('2026-10-15T12:00:00-06:00');

/** Marca ISO con zona -06:00 a partir de milisegundos. */
export function isoDe(ms: number): string {
  const d = new Date(ms - 6 * 3_600_000);
  const dos = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}-${dos(d.getUTCMonth() + 1)}-${dos(d.getUTCDate())}` +
    `T${dos(d.getUTCHours())}:${dos(d.getUTCMinutes())}:${dos(d.getUTCSeconds())}-06:00`
  );
}

interface Opciones {
  /** Minutos entre lecturas (15 por omisión). */
  pasoMin?: number;
  /** Minutos exactos del intervalo anterior a la lectura de índice i (para probar huecos). */
  huecos?: Record<number, number>;
  /** Lluvia (mm) de cada lectura; por omisión 0. */
  lluvia?: number[];
}

/** Serie de lecturas con los niveles dados, de la más vieja a la más reciente. */
export function lecturas(niveles: number[], { pasoMin = 15, huecos = {}, lluvia = [] }: Opciones = {}): Reading[] {
  let t = INICIO;
  return niveles.map((level_mm, i) => {
    if (i > 0) t += (huecos[i] ?? pasoMin) * 60_000;
    return { timestamp: isoDe(t), level_mm, rain_mm: lluvia[i] ?? 0, simulated: true };
  });
}

/** Milisegundos de la última lectura de la serie. */
export function ultimaMs(serie: Reading[]): number {
  return Date.parse(serie[serie.length - 1]?.timestamp ?? '');
}

/** "Ahora" a `min` minutos de la última lectura (5 por omisión). */
export function ahoraTras(serie: Reading[], min = 5): number {
  return ultimaMs(serie) + min * 60_000;
}
