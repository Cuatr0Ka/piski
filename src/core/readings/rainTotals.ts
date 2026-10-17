import type { ReadingPoint } from './cleanReadings';

const MS_POR_HORA = 3_600_000;

/** Lluvia acumulada, en mm, en las últimas `hours` horas. */
export interface RainTotal {
  hours: number;
  mm: number;
}

/**
 * Suma la lluvia de las lecturas que caen en cada ventana (las últimas N horas hasta el "ahora").
 * Función pura: el "ahora" lo recibe, nunca lee el reloj. Las ventanas salen de `config.json`.
 */
export function rainTotals(
  lecturas: readonly ReadingPoint[],
  ventanasH: readonly number[],
  now: number,
): RainTotal[] {
  return ventanasH.map((hours) => {
    const desde = now - hours * MS_POR_HORA;
    const mm = lecturas.filter((l) => l.timestamp > desde && l.timestamp <= now).reduce((s, l) => s + l.rainMm, 0);
    return { hours, mm };
  });
}
