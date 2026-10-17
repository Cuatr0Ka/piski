import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  configSchema,
  eventsSchema,
  parseFile,
  parseJsonText,
  readingsSchema,
  reportsSchema,
  scenarioSchema,
} from '../../src/core/schemas';
import type { Result } from '../../src/core/schemas';
import { configEjemplo, escenarioEjemplo, lecturasEjemplo } from '../fixtures/ejemplos';

const leerInvalido = (nombre: string) =>
  readFileSync(join(import.meta.dirname, '..', 'fixtures', 'invalidos', nombre), 'utf8');

function mensajeDe(r: Result<unknown>): string {
  if (r.ok) throw new Error('Se esperaba un error de validación');
  return r.message;
}

describe('Esquemas de los archivos de datos', () => {
  it('aceptan los ejemplos válidos de contracts/datos-json.md', () => {
    expect(parseFile(configSchema, configEjemplo, 'config.json').ok).toBe(true);
    expect(parseFile(readingsSchema, lecturasEjemplo, 'readings.json').ok).toBe(true);
    expect(parseFile(scenarioSchema, escenarioEjemplo, 'escenario.json').ok).toBe(true);
  });

  it('aceptan los tipos definidos de eventos y reportes', () => {
    const eventos = {
      schema_version: 1,
      events: [{ timestamp: '2026-10-15T14:00:00-06:00', type: 'state_change', message: 'Normal a Revisar' }],
    };
    const reportes = {
      schema_version: 1,
      reports: [
        {
          id: 'r-001',
          timestamp: '2026-10-15T14:10:00-06:00',
          type: 'blocked_road',
          approximate_location: 'Camino al paso',
          note: 'Árbol caído',
        },
      ],
    };
    expect(parseFile(eventsSchema, eventos, 'events.json').ok).toBe(true);
    expect(parseFile(reportsSchema, reportes, 'reports.json').ok).toBe(true);
  });

  it('rechazan una configuración con un campo faltante, con un mensaje en español que nombra el archivo', () => {
    const r = parseJsonText(configSchema, leerInvalido('config-sin-campo.json'), 'config.json');
    const mensaje = mensajeDe(r);
    expect(mensaje).toContain('config.json');
    expect(mensaje).toContain('max_reading_age_min');
    expect(mensaje).toMatch(/Revisa/);
  });

  it('rechazan otra versión de esquema y explican cómo arreglarlo', () => {
    const mensaje = mensajeDe(parseJsonText(configSchema, leerInvalido('config-version-2.json'), 'config.json'));
    expect(mensaje).toContain('versión de esquema 2');
    expect(mensaje).toMatch(/Vuelve a generarlo/);
  });

  it('rechazan marcas de tiempo sin zona horaria', () => {
    const mensaje = mensajeDe(parseJsonText(readingsSchema, leerInvalido('readings-sin-zona.json'), 'readings.json'));
    expect(mensaje).toContain('zona horaria');
    expect(mensaje).toContain('readings.json');
  });

  it('rechazan umbrales invertidos (review_mm mayor o igual que stop_mm)', () => {
    const mensaje = mensajeDe(
      parseJsonText(configSchema, leerInvalido('config-umbrales-invertidos.json'), 'config.json'),
    );
    expect(mensaje).toContain('stop_mm');
  });

  it('rechazan un JSON mal formado sin mostrar trazas', () => {
    const mensaje = mensajeDe(parseJsonText(readingsSchema, leerInvalido('readings-mal-formado.json'), 'readings.json'));
    expect(mensaje).toContain('no es un JSON válido');
    expect(mensaje).not.toMatch(/SyntaxError|Unexpected|at \w+|ZodError|\bstack\b/i);
  });

  it('ningún mensaje de error expone trazas ni textos en inglés de Zod', () => {
    const casos = [
      parseFile(configSchema, { schema_version: 1 }, 'config.json'),
      parseFile(readingsSchema, { schema_version: 1, readings: [{ timestamp: 5 }] }, 'readings.json'),
      parseFile(scenarioSchema, { ...escenarioEjemplo, id: 'Ciclón Inicio' }, 'escenario.json'),
    ];
    for (const caso of casos) {
      const mensaje = mensajeDe(caso);
      expect(mensaje).not.toMatch(/Invalid input|expected|received|ZodError|\bat \S+:\d+/i);
    }
  });

  it('validan las restricciones de la configuración', () => {
    const con = (cambios: object) => parseFile(configSchema, { ...configEjemplo, ...cambios }, 'config.json').ok;
    expect(con({ crossing_mm: 849 })).toBe(false); // crossing_mm debe ser mayor o igual que stop_mm
    expect(con({ crossing_mm: 850 })).toBe(true);
    expect(con({ sustain: { readings_to_raise: 0, readings_to_lower: 5 } })).toBe(false);
    expect(con({ sustain: { readings_to_raise: 3, readings_to_lower: 2.5 } })).toBe(false);
    expect(con({ max_reading_age_min: 0 })).toBe(false);
    expect(con({ plausible_level_mm: { min: 10, max: 10 } })).toBe(false);
    expect(con({ forecast: { ...configEjemplo.forecast, min_readings: 1 } })).toBe(false);
    expect(con({ forecast: { ...configEjemplo.forecast, horizon_h: 0 } })).toBe(false);
    expect(con({ forecast: { ...configEjemplo.forecast, window_min: 0 } })).toBe(false);
    expect(con({ forecast: { ...configEjemplo.forecast, flat_rate_mm_h: -1 } })).toBe(false);
    expect(con({ thresholds: { review_mm: -1, stop_mm: 850 } })).toBe(false);
  });

  it('validan las restricciones del escenario y de las lecturas', () => {
    const esc = (c: object) => parseFile(scenarioSchema, { ...escenarioEjemplo, ...c }, 'escenario.json').ok;
    expect(esc({ id: 'sin-tildes-1' })).toBe(true);
    expect(esc({ id: 'Con Mayúsculas' })).toBe(false);
    expect(esc({ id: 'con_guion_bajo' })).toBe(false);
    expect(esc({ group: 'otro' })).toBe(false);
    expect(esc({ now: '2026-10-15T14:30:00' })).toBe(false);
    const lect = (l: object) =>
      parseFile(readingsSchema, { schema_version: 1, readings: [{ timestamp: '2026-10-15T12:30:00Z', level_mm: 10, rain_mm: 0, simulated: true, ...l }] }, 'readings.json').ok;
    expect(lect({})).toBe(true);
    expect(lect({ simulated: undefined })).toBe(false); // simulated es obligatorio
    expect(lect({ level_mm: 'alto' })).toBe(false);
  });
});
