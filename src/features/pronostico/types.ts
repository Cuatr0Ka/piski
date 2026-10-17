/** Por qué no hay pronóstico. */
export type NoForecastReason = 'few_readings' | 'stale' | 'falling' | 'flat';

export type ThresholdKey = 'review' | 'stop';

/** Qué pasa con un umbral: ya superado, llegaría en un rango, llegaría a partir de un momento o no se proyecta. */
export type ThresholdResult =
  | { result: 'exceeded' }
  | { result: 'range'; fromH: number; toH: number }
  | { result: 'from'; fromH: number }
  | { result: 'beyond'; horizonH: number };

export type ThresholdForecast = { key: ThresholdKey; valueMm: number } & ThresholdResult;

/** Un punto de la proyección, en horas a partir del "ahora". */
export interface BandPoint {
  h: number;
  lowMm: number;
  midMm: number;
  highMm: number;
}

/** Pronóstico con proyección: SIEMPRE un rango, nunca un número único. */
export interface ForecastOk {
  kind: 'forecast';
  /** Ritmo de subida (mediana de pendientes), en mm/h. */
  rate: number;
  rateLow: number;
  rateHigh: number;
  /** Nivel de partida robusto, estimado en el "ahora". */
  startLevelMm: number;
  thresholds: ThresholdForecast[];
  band: BandPoint[];
  /** Nivel proyectado a `horizon_h / 2`, redondeado hacia afuera. */
  summaryLevel: { h: number; lowMm: number; highMm: number };
  discardedCount: number;
  readingsUsed: number;
}

/** Sin proyección: faltan lecturas, los datos son viejos o el nivel no sube. */
export interface NoForecast {
  kind: 'no_forecast';
  reason: NoForecastReason;
  /** Lecturas válidas dentro de la ventana de cálculo. */
  readingsInWindow: number;
  minReadings: number;
  /** Ritmo medido, cuando se alcanzó a calcular (con `falling` y `flat`). */
  rate?: number;
  lastReadingAt?: number;
  lastLevelMm?: number;
  ageMin?: number;
  discardedCount: number;
}

export type Pronostico = ForecastOk | NoForecast;
