import { z } from 'zod';
import { schemaVersionSchema } from './timestamp';

/** Configuración (`config.json`). Los umbrales y los parámetros de cálculo viven solo aquí. */
export const configSchema = z
  .object({
    schema_version: schemaVersionSchema,
    assumed: z.boolean(),
    thresholds: z.object({
      review_mm: z.number().min(0),
      stop_mm: z.number(),
    }),
    crossing_mm: z.number(),
    sustain: z.object({
      readings_to_raise: z.number().int().min(1),
      readings_to_lower: z.number().int().min(1),
    }),
    max_reading_age_min: z.number().positive(),
    /** Ventanas, en horas, para sumar la lluvia (por ejemplo [1, 3, 6]). */
    rain_windows_h: z.array(z.number().positive()).min(1),
    plausible_level_mm: z.object({
      min: z.number(),
      max: z.number(),
    }),
    forecast: z.object({
      window_min: z.number().positive(),
      min_readings: z.number().int().min(2),
      horizon_h: z.number().positive(),
      flat_rate_mm_h: z.number().min(0),
    }),
  })
  .refine((c) => c.thresholds.stop_mm > c.thresholds.review_mm, {
    path: ['thresholds', 'stop_mm'],
    error: 'debe ser mayor que review_mm (el umbral de No cruzar va por encima del de Revisar)',
  })
  .refine((c) => c.crossing_mm >= c.thresholds.stop_mm, {
    path: ['crossing_mm'],
    error: 'debe ser mayor o igual que thresholds.stop_mm',
  })
  .refine((c) => c.plausible_level_mm.min < c.plausible_level_mm.max, {
    path: ['plausible_level_mm', 'max'],
    error: 'debe ser mayor que plausible_level_mm.min',
  });

export type Config = z.infer<typeof configSchema>;
