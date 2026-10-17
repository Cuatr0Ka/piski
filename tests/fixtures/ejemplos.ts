// Ejemplos válidos de los archivos de datos (los de contracts/datos-json.md), para las pruebas.
import type { Config } from '../../src/core/schemas';

export const configEjemplo: Config = {
  schema_version: 1,
  assumed: true,
  thresholds: { review_mm: 600, stop_mm: 850 },
  crossing_mm: 1000,
  sustain: { readings_to_raise: 3, readings_to_lower: 5 },
  max_reading_age_min: 30,
  rain_windows_h: [1, 3, 6],
  plausible_level_mm: { min: 0, max: 3000 },
  forecast: { window_min: 120, min_readings: 6, horizon_h: 6, flat_rate_mm_h: 5 },
};

export const escenarioEjemplo = {
  schema_version: 1,
  id: 'ciclon-inicio',
  group: 'demo',
  name: 'Ciclón: inicio de la creciente',
  description: 'El nivel sube de forma sostenida; el pronóstico estima cuándo llegaría a Revisar.',
  now: '2026-10-15T14:30:00-06:00',
};

export const lecturasEjemplo = {
  schema_version: 1,
  readings: [
    { timestamp: '2026-10-15T12:30:00-06:00', level_mm: 300.0, rain_mm: 0.4, simulated: true },
    { timestamp: '2026-10-15T12:45:00-06:00', level_mm: 315.0, rain_mm: 0.6, simulated: true },
  ],
};
