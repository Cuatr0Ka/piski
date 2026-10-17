import { describe, expect, it } from 'vitest';
import {
  FLOOR_ABSOLUTE_MM_H,
  FLOOR_RELATIVE,
  MIN_PAIR_GAP_H,
  applyUncertaintyFloor,
  estimateStartLevel,
  median,
  pairwiseSlopes,
  quantile,
  roundDownToHalf,
  roundUpToHalf,
} from '../../src/features/pronostico/services/robustTrend';

describe('Tendencia robusta', () => {
  it('define los supuestos del método: pares de al menos 5 min y piso de max(30 % del ritmo, 10 mm/h)', () => {
    expect(MIN_PAIR_GAP_H).toBeCloseTo(5 / 60, 10);
    expect(FLOOR_RELATIVE).toBe(0.3);
    expect(FLOOR_ABSOLUTE_MM_H).toBe(10);
  });

  it('calcula la pendiente (mm/h) entre todos los pares de puntos', () => {
    const puntos = [
      { hours: -0.5, level: 10 },
      { hours: -0.25, level: 11 },
      { hours: 0, level: 12 },
    ];
    expect(pairwiseSlopes(puntos, MIN_PAIR_GAP_H).sort()).toEqual([4, 4, 4]);
  });

  it('ignora los pares separados por menos de 5 min', () => {
    const puntos = [
      { hours: -0.5, level: 10 },
      { hours: -0.49, level: 99 }, // 0.6 min después: no cuenta
      { hours: 0, level: 12 },
    ];
    const pendientes = pairwiseSlopes(puntos, MIN_PAIR_GAP_H);
    expect(pendientes).toHaveLength(2);
    expect(pendientes.every((p) => Math.abs(p) < 200)).toBe(true);
  });

  it('calcula la mediana y los cuartiles con interpolación lineal', () => {
    expect(median([5, 1, 3])).toBe(3);
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(quantile([1, 2, 3, 4, 5], 0.25)).toBe(2);
    expect(quantile([1, 2, 3, 4, 5], 0.75)).toBe(4);
    expect(quantile([7], 0.25)).toBe(7);
    expect(quantile([0, 10], 0.25)).toBe(2.5);
  });

  it('aplica el piso de incertidumbre a un tramo perfectamente recto', () => {
    const r = applyUncertaintyFloor(60, 60, 60); // 30 % de 60 mm/h = 18 mm/h de amplitud
    expect(r.low).toBeCloseTo(51, 10);
    expect(r.high).toBeCloseTo(69, 10);
  });

  it('con un ritmo pequeño el piso absoluto de 10 mm/h manda', () => {
    const r = applyUncertaintyFloor(20, 20, 20); // 30 % de 20 mm/h = 6 < 10: manda el piso absoluto
    expect(r.high - r.low).toBeCloseTo(10, 10);
    expect(r.low).toBeCloseTo(15, 10);
    expect(r.high).toBeCloseTo(25, 10);
  });

  it('no toca un rango que ya supera el piso', () => {
    expect(applyUncertaintyFloor(180, 140, 220)).toEqual({ low: 140, high: 220 });
  });

  it('estima el nivel de partida como la mediana de nivel − ritmo × horas, robusta a una espuria', () => {
    const puntos = [-1, -0.75, -0.5, -0.25, 0].map((hours) => ({ hours, level: 42 + 6 * hours }));
    expect(estimateStartLevel(puntos, 6)).toBeCloseTo(42, 10);
    const conEspuria = puntos.map((p, i) => (i === 2 ? { ...p, level: 90 } : p));
    expect(estimateStartLevel(conEspuria, 6)).toBeCloseTo(42, 10);
  });

  it('redondea hacia afuera a pasos de 0.5 h sin que el ruido numérico mueva un valor exacto', () => {
    expect(roundDownToHalf(2.6087)).toBe(2.5);
    expect(roundDownToHalf(2)).toBe(2);
    expect(roundDownToHalf(1.9999999999999998)).toBe(2);
    expect(roundUpToHalf(3.529)).toBe(4);
    expect(roundUpToHalf(3)).toBe(3);
    expect(roundUpToHalf(3.0000000000000004)).toBe(3);
    expect(roundUpToHalf(2.7059)).toBe(3);
  });
});
