import { describe, expect, it } from 'vitest';
import { scenarioRepository } from '../../src/core/data';
import type { Reading } from '../../src/core/schemas';
import { parseTimestamp } from '../../src/core/time/clock';
import { forecast } from '../../src/features/pronostico/services/forecast';
import type { Pronostico, ThresholdForecast } from '../../src/features/pronostico/types';
import casos from '../casos/pronostico.json';
import { configEjemplo } from '../fixtures/ejemplos';
import { isoDe, lecturas, ultimaMs } from '../fixtures/lecturas';

interface ResultadoUmbral {
  result: 'exceeded' | 'range' | 'from' | 'beyond';
  fromH?: number;
  toH?: number;
}
interface EsperadoConProyeccion {
  kind: 'forecast';
  rate: number;
  rateLow: number;
  rateHigh: number;
  startLevelMm: number;
  discardedCount?: number;
  review: ResultadoUmbral;
  stop: ResultadoUmbral;
  summary: { h: number; lowMm: number; highMm: number };
}
interface EsperadoSinProyeccion {
  kind: 'no_forecast';
  reason: 'few_readings' | 'stale' | 'falling' | 'flat';
  rate?: number;
  readingsInWindow: number;
  discardedCount?: number;
}
interface Caso {
  id: string;
  descripcion: string;
  niveles: number[];
  ahoraMin?: number;
  ahoraIso?: string;
  invertirOrden?: boolean;
  extras?: Array<{ minutosAntesDeAhora: number; level_mm: number }>;
  esperado: EsperadoConProyeccion | EsperadoSinProyeccion;
}

function armar(caso: Caso): { serie: Reading[]; ahora: number } {
  let serie = lecturas(caso.niveles);
  const ahora = caso.ahoraIso
    ? parseTimestamp(caso.ahoraIso)
    : ultimaMs(serie) + (caso.ahoraMin ?? 0) * 60_000;
  for (const e of caso.extras ?? []) {
    serie = [...serie, { timestamp: isoDe(ahora - e.minutosAntesDeAhora * 60_000), level_mm: e.level_mm, rain_mm: 0, simulated: true }];
  }
  if (caso.invertirOrden) serie = [...serie].reverse();
  return { serie, ahora };
}

function umbral(p: Extract<Pronostico, { kind: 'forecast' }>, key: 'review' | 'stop'): ThresholdForecast {
  const u = p.thresholds.find((t) => t.key === key);
  if (!u) throw new Error(`Falta el umbral ${key}`);
  return u;
}

function comprobarUmbral(real: ThresholdForecast, esperado: ResultadoUmbral, etiqueta: string) {
  expect(real.result, `${etiqueta}: tipo de resultado`).toBe(esperado.result);
  if (real.result === 'range') {
    expect(real.fromH, `${etiqueta}: desde`).toBe(esperado.fromH);
    expect(real.toH, `${etiqueta}: hasta`).toBe(esperado.toH);
  }
  if (real.result === 'from') expect(real.fromH, `${etiqueta}: a partir de`).toBe(esperado.fromH);
  if (real.result === 'beyond') expect(real.horizonH, `${etiqueta}: horizonte`).toBe(6);
}

describe('Pronóstico: tabla de casos de referencia calculados a mano', () => {
  const lista = casos.casos as unknown as Caso[];

  it('la tabla tiene 20 o más casos (FR-031)', () => {
    expect(lista.length).toBeGreaterThanOrEqual(20);
    expect(new Set(lista.map((c) => c.id)).size).toBe(lista.length);
  });

  for (const caso of lista) {
    it(`${caso.id}: ${caso.descripcion}`, () => {
      const { serie, ahora } = armar(caso);
      const p = forecast(serie, configEjemplo, ahora);
      const e = caso.esperado;

      if (e.kind === 'no_forecast') {
        if (p.kind !== 'no_forecast') throw new Error(`${caso.id}: se esperaba "sin pronóstico" y hubo proyección`);
        expect(p.reason, `${caso.id}: razón`).toBe(e.reason);
        expect(p.readingsInWindow, `${caso.id}: lecturas en la ventana`).toBe(e.readingsInWindow);
        expect(p.discardedCount, `${caso.id}: lecturas descartadas`).toBe(e.discardedCount ?? 0);
        if (e.rate !== undefined) expect(p.rate, `${caso.id}: ritmo`).toBeCloseTo(e.rate, 6);
        return;
      }

      if (p.kind !== 'forecast') throw new Error(`${caso.id}: se esperaba una proyección y fue "${p.reason}"`);
      expect(p.rate, `${caso.id}: ritmo`).toBeCloseTo(e.rate, 6);
      expect(p.rateLow, `${caso.id}: ritmo bajo`).toBeCloseTo(e.rateLow, 6);
      expect(p.rateHigh, `${caso.id}: ritmo alto`).toBeCloseTo(e.rateHigh, 6);
      expect(p.startLevelMm, `${caso.id}: nivel de partida`).toBeCloseTo(e.startLevelMm, 6);
      expect(p.discardedCount, `${caso.id}: lecturas descartadas`).toBe(e.discardedCount ?? 0);
      comprobarUmbral(umbral(p, 'review'), e.review, `${caso.id} Revisar`);
      comprobarUmbral(umbral(p, 'stop'), e.stop, `${caso.id} No cruzar`);
      expect(p.summaryLevel.h, `${caso.id}: hora del nivel proyectado`).toBe(e.summary.h);
      expect(p.summaryLevel.lowMm, `${caso.id}: nivel proyectado bajo`).toBe(e.summary.lowMm);
      expect(p.summaryLevel.highMm, `${caso.id}: nivel proyectado alto`).toBe(e.summary.highMm);
    });
  }
});

describe('Pronóstico: propiedades generales', () => {
  const serie = lecturas([300, 315, 330, 345, 360, 375, 390, 405, 420]);
  const ahora = ultimaMs(serie);

  it('es repetible: con las mismas lecturas y la misma configuración devuelve siempre lo mismo', () => {
    expect(forecast(serie, configEjemplo, ahora)).toEqual(forecast(serie, configEjemplo, ahora));
  });

  it('una lectura espuria aislada no cambia bruscamente el ritmo ni el nivel de partida', () => {
    const base = forecast(serie, configEjemplo, ahora);
    const niveles = [300, 315, 330, 345, 660, 375, 390, 405, 420];
    const conEspuria = forecast(lecturas(niveles), configEjemplo, ahora);
    if (base.kind !== 'forecast' || conEspuria.kind !== 'forecast') throw new Error('Se esperaba una proyección');
    expect(Math.abs(conEspuria.rate - base.rate)).toBeLessThanOrEqual(5);
    expect(Math.abs(conEspuria.startLevelMm - base.startLevelMm)).toBeLessThanOrEqual(10);
  });

  it('la banda es un abanico cada 0.5 h desde 0 hasta el horizonte, centrada en el ritmo', () => {
    const p = forecast(serie, configEjemplo, ahora);
    if (p.kind !== 'forecast') throw new Error('Se esperaba una proyección');
    expect(p.band).toHaveLength(13);
    expect(p.band.map((b) => b.h)).toEqual([0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6]);
    const primero = p.band[0];
    const ultimo = p.band[12];
    expect(primero?.lowMm).toBeCloseTo(p.startLevelMm, 6);
    expect(primero?.highMm).toBeCloseTo(p.startLevelMm, 6);
    expect(ultimo?.midMm).toBeCloseTo(p.startLevelMm + p.rate * 6, 6);
    expect(ultimo?.lowMm).toBeLessThan(ultimo?.midMm ?? 0);
    expect(ultimo?.highMm).toBeGreaterThan(ultimo?.midMm ?? 0);
  });

  it('nunca presenta el resultado como un número único: el rango del ritmo tiene amplitud mayor que cero', () => {
    const p = forecast(serie, configEjemplo, ahora);
    if (p.kind !== 'forecast') throw new Error('Se esperaba una proyección');
    expect(p.rateHigh).toBeGreaterThan(p.rateLow);
  });

  it('usa los parámetros de la configuración y no valores escritos en el código', () => {
    const horizonteCorto = { ...configEjemplo, forecast: { ...configEjemplo.forecast, horizon_h: 4 } };
    const p = forecast(serie, horizonteCorto, ahora);
    if (p.kind !== 'forecast') throw new Error('Se esperaba una proyección');
    expect(p.band.at(-1)?.h).toBe(4);
    expect(p.summaryLevel.h).toBe(2); // horizon_h / 2
    expect(umbral(p, 'stop').result).toBe('beyond');
  });

  it('el mínimo de lecturas sale de la configuración', () => {
    const exigente = { ...configEjemplo, forecast: { ...configEjemplo.forecast, min_readings: 10 } };
    const p = forecast(serie, exigente, ahora);
    expect(p.kind).toBe('no_forecast');
    if (p.kind === 'no_forecast') expect(p.reason).toBe('few_readings');
  });

  it('la ventana de cálculo sale de la configuración', () => {
    // Con 60 min caben 5 lecturas cada 15 min; se baja el mínimo para aislar el efecto de la ventana.
    const corta = { ...configEjemplo, forecast: { ...configEjemplo.forecast, window_min: 60, min_readings: 2 } };
    const p = forecast(serie, corta, ahora);
    if (p.kind !== 'forecast') throw new Error('Se esperaba una proyección');
    expect(p.readingsUsed).toBe(5);
    const conVentanaCorta = forecast(serie, { ...configEjemplo, forecast: { ...configEjemplo.forecast, window_min: 60 } }, ahora);
    expect(conVentanaCorta.kind).toBe('no_forecast'); // con el mínimo de 6, 5 lecturas no alcanzan
  });
});

describe('Pronóstico: escenarios de ejemplo', () => {
  async function pronosticoDe(id: string) {
    const r = await scenarioRepository.get(id);
    if (!r.ok) throw new Error(r.message);
    return forecast(r.value.readings, r.value.config, r.value.now);
  }

  it('ciclon-inicio: Revisar entre 2.5 y 3.5 h, No cruzar fuera del horizonte y 576 a 630 mm a las 3 h', async () => {
    const p = await pronosticoDe('ciclon-inicio');
    if (p.kind !== 'forecast') throw new Error('Se esperaba una proyección');
    expect(umbral(p, 'review')).toMatchObject({ result: 'range', fromH: 2.5, toH: 3.5 });
    expect(umbral(p, 'stop').result).toBe('beyond');
    expect(p.summaryLevel).toMatchObject({ h: 3, lowMm: 576, highMm: 630 });
  });

  it('ciclon-revisar: Revisar ya superado y No cruzar en 2 a 3.5 h', async () => {
    const p = await pronosticoDe('ciclon-revisar');
    if (p.kind !== 'forecast') throw new Error('Se esperaba una proyección');
    expect(umbral(p, 'review').result).toBe('exceeded');
    expect(umbral(p, 'stop')).toMatchObject({ result: 'range', fromH: 2, toH: 3.5 });
  });

  it('ciclon-no-cruzar: ambos umbrales ya superados', async () => {
    const p = await pronosticoDe('ciclon-no-cruzar');
    if (p.kind !== 'forecast') throw new Error('Se esperaba una proyección');
    expect(umbral(p, 'review').result).toBe('exceeded');
    expect(umbral(p, 'stop').result).toBe('exceeded');
  });

  it('subida-acelerada y ruido producen una proyección con un rango amplio', async () => {
    for (const id of ['subida-acelerada', 'ruido']) {
      const p = await pronosticoDe(id);
      if (p.kind !== 'forecast') throw new Error(`${id}: se esperaba una proyección`);
      expect(p.rateHigh - p.rateLow, `${id}: amplitud del rango del ritmo`).toBeGreaterThanOrEqual(10);
    }
  });

  it('sin proyección en los escenarios que no suben: normal, plano, estiaje, baja, pocas lecturas y viejas', async () => {
    const esperados: Array<[string, string]> = [
      ['tormenta-normal', 'flat'],
      ['nivel-plano', 'flat'],
      ['estiaje', 'falling'],
      ['nivel-baja', 'falling'],
      ['pocas-lecturas', 'few_readings'],
      ['lecturas-viejas', 'stale'],
      ['lectura-espuria', 'flat'],
    ];
    for (const [id, razon] of esperados) {
      const p = await pronosticoDe(id);
      expect(p.kind, `${id} no debe proyectar`).toBe('no_forecast');
      if (p.kind === 'no_forecast') expect(p.reason, `${id}: razón`).toBe(razon);
    }
  });

  it('lectura-imposible calcula con las lecturas válidas y no proyecta (estable)', async () => {
    const p = await pronosticoDe('lectura-imposible');
    expect(p.kind).toBe('no_forecast');
    if (p.kind === 'no_forecast') expect(p.discardedCount).toBe(2);
  });
});
