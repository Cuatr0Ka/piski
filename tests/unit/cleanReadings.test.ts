import { describe, expect, it } from 'vitest';
import { cleanReadings } from '../../src/core/readings/cleanReadings';
import { parseTimestamp } from '../../src/core/time/clock';
import { configEjemplo } from '../fixtures/ejemplos';

const AHORA = parseTimestamp('2026-10-15T14:30:00-06:00');
const lectura = (iso: string, level_mm: number, rain_mm = 0) => ({ timestamp: iso, level_mm, rain_mm, simulated: true });
const limpiar = (lecturas: ReturnType<typeof lectura>[], ahora = AHORA) =>
  cleanReadings(lecturas, configEjemplo, ahora);

describe('Limpieza de lecturas', () => {
  it('descarta las lecturas imposibles (fuera de plausible_level_mm) y las cuenta', () => {
    const r = limpiar([
      lectura('2026-10-15T14:00:00-06:00', 420),
      lectura('2026-10-15T14:15:00-06:00', -50),
      lectura('2026-10-15T14:20:00-06:00', 9990),
      lectura('2026-10-15T14:25:00-06:00', 430),
    ]);
    expect(r.readings.map((x) => x.levelMm)).toEqual([420, 430]);
    expect(r.discardedCount).toBe(2);
  });

  it('conserva los niveles exactamente en los límites del rango plausible', () => {
    const r = limpiar([lectura('2026-10-15T14:00:00-06:00', 0), lectura('2026-10-15T14:10:00-06:00', 3000)]);
    expect(r.readings).toHaveLength(2);
    expect(r.discardedCount).toBe(0);
  });

  it('descarta las lecturas que adelantan más de 60 s, y conserva las de exactamente 60 s', () => {
    const r = limpiar([
      lectura('2026-10-15T14:30:00-06:00', 420),
      lectura('2026-10-15T14:31:00-06:00', 430), // exactamente 60 s: se conserva
      lectura('2026-10-15T14:31:01-06:00', 440), // 61 s: se descarta
    ]);
    expect(r.readings.map((x) => x.levelMm)).toEqual([420, 430]);
    expect(r.discardedCount).toBe(1);
  });

  it('ordena por hora las lecturas fuera de orden', () => {
    const r = limpiar([
      lectura('2026-10-15T14:15:00-06:00', 440),
      lectura('2026-10-15T14:00:00-06:00', 420),
      lectura('2026-10-15T14:10:00-06:00', 430),
    ]);
    expect(r.readings.map((x) => x.levelMm)).toEqual([420, 430, 440]);
  });

  it('con la misma hora conserva la lectura que aparece después en el archivo', () => {
    const r = limpiar([
      lectura('2026-10-15T14:00:00-06:00', 400),
      lectura('2026-10-15T14:00:00-06:00', 900),
      lectura('2026-10-15T14:10:00-06:00', 430),
    ]);
    expect(r.readings.map((x) => x.levelMm)).toEqual([900, 430]);
  });

  it('devuelve una lista vacía y 0 descartadas sin lecturas', () => {
    const r = limpiar([]);
    expect(r.readings).toEqual([]);
    expect(r.discardedCount).toBe(0);
  });

  it('conserva la lluvia de cada lectura válida y descarta la de las lecturas descartadas', () => {
    const r = limpiar([
      lectura('2026-10-15T14:00:00-06:00', 420, 1.5),
      lectura('2026-10-15T14:10:00-06:00', -50, 9), // imposible: su lluvia no cuenta
      lectura('2026-10-15T14:20:00-06:00', 430, 2.5),
    ]);
    expect(r.readings.map((x) => x.rainMm)).toEqual([1.5, 2.5]);
  });
});
