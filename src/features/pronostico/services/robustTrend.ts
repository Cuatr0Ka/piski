// Tendencia robusta tipo Theil–Sen (R5 de research.md). Los supuestos del método viven aquí y se
// muestran en "Cómo se calcula" con la etiqueta "Supuesto".

export interface TrendPoint {
  /** Horas respecto al "ahora" (negativas: en el pasado). */
  hours: number;
  /** Nivel en mm. */
  level: number;
}

/** Solo cuentan los pares de lecturas separadas al menos 5 min (supuesto del método). */
export const MIN_PAIR_GAP_H = 5 / 60;
/** Piso de incertidumbre: la amplitud del rango del ritmo nunca baja de max(30 % del ritmo, 10 mm/h). */
export const FLOOR_RELATIVE = 0.3;
export const FLOOR_ABSOLUTE_MM_H = 10;
/** Paso de la banda y del redondeo de tiempos, en horas. */
export const STEP_H = 0.5;

// Evita que el ruido numérico mueva un valor exacto (por ejemplo 2.0000000000000004 h) al paso siguiente.
const EPSILON = 1e-9;

/** Pendiente (mm/h) entre todos los pares de puntos separados al menos `minGapH`. */
export function pairwiseSlopes(puntos: readonly TrendPoint[], minGapH: number): number[] {
  const pendientes: number[] = [];
  for (let i = 0; i < puntos.length; i++) {
    for (let j = i + 1; j < puntos.length; j++) {
      const a = puntos[i];
      const b = puntos[j];
      if (a === undefined || b === undefined) continue;
      const dt = b.hours - a.hours;
      if (dt >= minGapH - EPSILON) pendientes.push((b.level - a.level) / dt);
    }
  }
  return pendientes;
}

/** Cuantil con interpolación lineal (el método habitual de los cuartiles). */
export function quantile(valores: readonly number[], p: number): number {
  if (valores.length === 0) throw new Error('No se puede calcular un cuantil sin valores.');
  const ordenados = [...valores].sort((a, b) => a - b);
  const posicion = (ordenados.length - 1) * p;
  const abajo = Math.floor(posicion);
  const arriba = Math.ceil(posicion);
  const a = ordenados[abajo] ?? 0;
  const b = ordenados[arriba] ?? a;
  return a + (b - a) * (posicion - abajo);
}

export const median = (valores: readonly number[]): number => quantile(valores, 0.5);

/** Ensancha de forma simétrica el rango del ritmo hasta la amplitud mínima, si hace falta. */
export function applyUncertaintyFloor(
  ritmo: number,
  bajo: number,
  alto: number,
): { low: number; high: number } {
  const minimo = Math.max(FLOOR_RELATIVE * Math.abs(ritmo), FLOOR_ABSOLUTE_MM_H);
  if (alto - bajo >= minimo) return { low: bajo, high: alto };
  return { low: ritmo - minimo / 2, high: ritmo + minimo / 2 };
}

/** Nivel de partida: mediana de (nivel − ritmo × horas) sobre la ventana. Robusto a una lectura espuria. */
export function estimateStartLevel(puntos: readonly TrendPoint[], ritmo: number): number {
  return median(puntos.map((p) => p.level - ritmo * p.hours));
}

/** Redondea hacia abajo a pasos de 0.5 h (el extremo temprano de un rango). */
export const roundDownToHalf = (horas: number): number => Math.floor(horas / STEP_H + EPSILON) * STEP_H;

/** Redondea hacia arriba a pasos de 0.5 h (el extremo tardío de un rango). */
export const roundUpToHalf = (horas: number): number => Math.ceil(horas / STEP_H - EPSILON) * STEP_H;

/** Nivel en mm redondeado hacia abajo (extremo bajo de un rango). */
export const floorMm = (mm: number): number => Math.floor(mm + EPSILON);

/** Nivel en mm redondeado hacia arriba (extremo alto de un rango). */
export const ceilMm = (mm: number): number => Math.ceil(mm - EPSILON);
