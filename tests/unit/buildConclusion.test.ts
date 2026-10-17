import { describe, expect, it } from 'vitest';
import { buildConclusion } from '../../src/features/pronostico/services/buildConclusion';
import type { ForecastOk, ThresholdForecast, ThresholdResult } from '../../src/features/pronostico/types';

function pronostico(review: ThresholdForecast, stop: ThresholdForecast): ForecastOk {
  return {
    kind: 'forecast',
    rate: 60,
    rateLow: 51,
    rateHigh: 69,
    startLevelMm: 420,
    thresholds: [review, stop],
    band: [],
    summaryLevel: { h: 3, lowMm: 576, highMm: 630 },
    discardedCount: 0,
    readingsUsed: 9,
  };
}

const revisar = (r: ThresholdResult): ThresholdForecast => ({ key: 'review', valueMm: 600, ...r });
const noCruzar = (r: ThresholdResult): ThresholdForecast => ({ key: 'stop', valueMm: 850, ...r });

describe('Conclusión del pronóstico', () => {
  it('Revisar en rango: "Podría llegar a Revisar entre 2.5 y 4 h" (sin ceros sobrantes)', () => {
    const c = buildConclusion(pronostico(revisar({ result: 'range', fromH: 2.5, toH: 4 }), noCruzar({ result: 'beyond', horizonH: 6 })), 6);
    expect(c.sentence).toBe('Podría llegar a Revisar entre 2.5 y 4 h');
  });

  it('Revisar "a partir de"', () => {
    const c = buildConclusion(pronostico(revisar({ result: 'from', fromH: 5.5 }), noCruzar({ result: 'beyond', horizonH: 6 })), 6);
    expect(c.sentence).toBe('Podría llegar a Revisar a partir de 5.5 h');
  });

  it('Revisar fuera del horizonte: "No se proyecta llegar a Revisar en las próximas 6 h"', () => {
    const c = buildConclusion(pronostico(revisar({ result: 'beyond', horizonH: 6 }), noCruzar({ result: 'beyond', horizonH: 6 })), 6);
    expect(c.sentence).toBe('No se proyecta llegar a Revisar en las próximas 6 h');
  });

  it('Revisar superado y No cruzar en rango', () => {
    const c = buildConclusion(pronostico(revisar({ result: 'exceeded' }), noCruzar({ result: 'range', fromH: 2, toH: 3.5 })), 6);
    expect(c.sentence).toBe('Ya superó Revisar. Podría llegar a No cruzar entre 2 y 3.5 h');
  });

  it('Revisar superado y No cruzar "a partir de"', () => {
    const c = buildConclusion(pronostico(revisar({ result: 'exceeded' }), noCruzar({ result: 'from', fromH: 4 })), 6);
    expect(c.sentence).toBe('Ya superó Revisar. Podría llegar a No cruzar a partir de 4 h');
  });

  it('Revisar superado y No cruzar fuera del horizonte', () => {
    const c = buildConclusion(pronostico(revisar({ result: 'exceeded' }), noCruzar({ result: 'beyond', horizonH: 6 })), 6);
    expect(c.sentence).toBe('Ya superó Revisar. No se proyecta llegar a No cruzar en las próximas 6 h');
  });

  it('No cruzar superado: "Ya superó No cruzar"', () => {
    const c = buildConclusion(pronostico(revisar({ result: 'exceeded' }), noCruzar({ result: 'exceeded' })), 6);
    expect(c.sentence).toBe('Ya superó No cruzar');
  });

  it('arma un renglón por umbral con su etiqueta, su forma de estado y su valor', () => {
    const c = buildConclusion(pronostico(revisar({ result: 'exceeded' }), noCruzar({ result: 'range', fromH: 2, toH: 3.5 })), 6);
    expect(c.rows).toEqual([
      { key: 'review', shape: 'review', label: 'Revisar (600 mm)', value: 'ya superado' },
      { key: 'stop', shape: 'stop', label: 'No cruzar (850 mm)', value: 'entre 2 y 3.5 h' },
    ]);
  });

  it('los valores de cada tipo de resultado', () => {
    const c = buildConclusion(pronostico(revisar({ result: 'from', fromH: 5.5 }), noCruzar({ result: 'beyond', horizonH: 6 })), 6);
    expect(c.rows.map((r) => r.value)).toEqual(['a partir de 5.5 h', 'No se proyecta en las próximas 6 h']);
  });

  it('ninguna frase ni renglón dice "más de" ni "hay tiempo", ni suena tranquilizador', () => {
    const resultados: Array<[ThresholdForecast, ThresholdForecast]> = [
      [revisar({ result: 'beyond', horizonH: 6 }), noCruzar({ result: 'beyond', horizonH: 6 })],
      [revisar({ result: 'exceeded' }), noCruzar({ result: 'beyond', horizonH: 6 })],
      [revisar({ result: 'from', fromH: 5.5 }), noCruzar({ result: 'from', fromH: 5.5 })],
    ];
    for (const [r, s] of resultados) {
      const c = buildConclusion(pronostico(r, s), 6);
      const todo = [c.sentence, ...c.rows.map((x) => x.value)].join(' ');
      expect(todo).not.toMatch(/más de|hay tiempo|seguro|sin riesgo|tranquil/i);
    }
  });
});
