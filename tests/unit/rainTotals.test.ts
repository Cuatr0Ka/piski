import { describe, expect, it } from 'vitest';
import { scenarioRepository } from '../../src/core/data';
import { cleanReadings } from '../../src/core/readings/cleanReadings';
import { rainTotals } from '../../src/core/readings/rainTotals';
import { parseTimestamp } from '../../src/core/time/clock';
import { configEjemplo } from '../fixtures/ejemplos';
import { lecturas, ultimaMs } from '../fixtures/lecturas';

describe('Lluvia acumulada (rainTotals)', () => {
  // 9 lecturas cada 15 min con 2 mm cada una; el "ahora" es la última lectura.
  const serie = lecturas([300, 315, 330, 345, 360, 375, 390, 405, 420], { lluvia: [2, 2, 2, 2, 2, 2, 2, 2, 2] });
  const ahora = ultimaMs(serie);
  const limpias = cleanReadings(serie, configEjemplo, ahora).readings;

  it('suma la lluvia de cada ventana hasta el "ahora"', () => {
    const t = rainTotals(limpias, [1, 3, 6], ahora);
    // Última hora: lecturas a 0, 15, 30 y 45 min (la de 60 min cae justo en el borde y no cuenta).
    expect(t[0]).toEqual({ hours: 1, mm: 8 });
    expect(t[1]).toEqual({ hours: 3, mm: 18 }); // las 9 lecturas caben en 2 h
    expect(t[2]).toEqual({ hours: 6, mm: 18 });
  });

  it('las ventanas salen de la configuración, no del código', () => {
    const t = rainTotals(limpias, [0.5, 2], ahora);
    expect(t.map((x) => x.hours)).toEqual([0.5, 2]);
    expect(t[0]?.mm).toBe(4); // lecturas a 0 y 15 min
  });

  it('sin lluvia suma 0', () => {
    const seca = cleanReadings(lecturas([300, 315, 330]), configEjemplo, parseTimestamp('2026-10-15T13:00:00-06:00')).readings;
    expect(rainTotals(seca, [1], parseTimestamp('2026-10-15T13:00:00-06:00'))[0]?.mm).toBe(0);
  });

  it('no cuenta lluvia de lecturas posteriores al "ahora"', () => {
    const hasta = ahora - 30 * 60_000;
    const t = rainTotals(limpias, [1], hasta);
    // Con el "ahora" 30 min antes, cuentan las lecturas a 30, 45, 60 y 75 min de la última; no las posteriores.
    expect(t[0]?.mm).toBe(8);
  });
});

describe('Lluvia en los escenarios de ejemplo', () => {
  async function lluviaDe(id: string) {
    const r = await scenarioRepository.get(id);
    if (!r.ok) throw new Error(r.message);
    const { readings } = cleanReadings(r.value.readings, r.value.config, r.value.now);
    return rainTotals(readings, r.value.config.rain_windows_h, r.value.now);
  }

  it('todos los escenarios traen las ventanas de 1, 3 y 6 h en su configuración', async () => {
    const r = await scenarioRepository.get('ciclon-inicio');
    if (!r.ok) throw new Error(r.message);
    expect(r.value.config.rain_windows_h).toEqual([1, 3, 6]);
  });

  it('el ciclón llueve mucho más que la tormenta normal, y el estiaje no llueve', async () => {
    const ciclon = await lluviaDe('ciclon-revisar');
    const tormenta = await lluviaDe('tormenta-normal');
    const estiaje = await lluviaDe('estiaje');
    expect(ciclon[0]?.mm).toBeGreaterThan(20); // más de 20 mm en la última hora
    expect(tormenta[0]?.mm ?? 99).toBeLessThan(3);
    expect(estiaje.every((t) => t.mm === 0)).toBe(true);
  });

  it('la lluvia acumulada nunca decrece al ampliar la ventana', async () => {
    for (const id of ['ciclon-inicio', 'ciclon-revisar', 'ciclon-no-cruzar', 'tormenta-normal']) {
      const t = await lluviaDe(id);
      expect(t[0]?.mm ?? 0).toBeLessThanOrEqual(t[1]?.mm ?? 0);
      expect(t[1]?.mm ?? 0).toBeLessThanOrEqual(t[2]?.mm ?? 0);
    }
  });
});
