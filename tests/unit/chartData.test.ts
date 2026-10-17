import { describe, expect, it } from 'vitest';
import { scenarioRepository } from '../../src/core/data';
import { cleanReadings } from '../../src/core/readings/cleanReadings';
import { buildChartData } from '../../src/features/pronostico/services/chartData';
import { forecast } from '../../src/features/pronostico/services/forecast';

async function datosDe(id: string) {
  const r = await scenarioRepository.get(id);
  if (!r.ok) throw new Error(r.message);
  const { scenario } = { scenario: r.value };
  const limpias = cleanReadings(scenario.readings, scenario.config, scenario.now).readings;
  const pronostico = forecast(scenario.readings, scenario.config, scenario.now);
  return { chart: buildChartData(limpias, pronostico, scenario.config, scenario.now), pronostico };
}

describe('Datos de la gráfica del pronóstico', () => {
  it('con proyección: lecturas de las últimas 6 h, banda hasta el horizonte y tres líneas de umbral', async () => {
    const { chart } = await datosDe('ciclon-inicio');
    expect(chart.readings.length).toBeGreaterThan(20);
    expect(chart.readings.every((r) => r.hours >= -6 && r.hours <= 0)).toBe(true);
    expect(chart.projection?.horizonH).toBe(6);
    expect(chart.projection?.band).toHaveLength(13);
    expect(chart.maxMm).toBe(1250);
    expect(chart.thresholds.map((t) => [t.tone, t.label])).toEqual([
      ['review', 'Revisar: 600 mm'],
      ['stop', 'No cruzar: 850 mm'],
      ['crossing', 'Paso: 1000 mm'],
    ]);
  });

  it('la tabla alternativa incluye lecturas medidas y la proyección a 2, 4 y 6 h', async () => {
    const { chart } = await datosDe('ciclon-inicio');
    const origenes = chart.table.map((f) => `${f.hora}|${f.origen}`);
    expect(origenes).toContain('ahora|Medido');
    expect(origenes).toContain('+2 h|Proyección');
    expect(origenes).toContain('+4 h|Proyección');
    expect(origenes).toContain('+6 h|Proyección');
    const proyectado = chart.table.find((f) => f.hora === '+2 h');
    expect(proyectado?.nivel).toMatch(/^entre \d+ y \d+ mm$/);
  });

  it('sin pronóstico no hay proyección y la tabla solo tiene lecturas medidas', async () => {
    const { chart } = await datosDe('tormenta-normal');
    expect(chart.projection).toBeUndefined();
    expect(chart.table.every((f) => f.origen === 'Medido')).toBe(true);
  });
});
