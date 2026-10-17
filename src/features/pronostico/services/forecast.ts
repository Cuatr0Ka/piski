import { cleanReadings } from '../../../core/readings/cleanReadings';
import type { Config } from '../../../core/schemas/config';
import type { Reading } from '../../../core/schemas/readings';
import { minutesBetween } from '../../../core/time/clock';
import type {
  BandPoint,
  ForecastOk,
  NoForecast,
  Pronostico,
  ThresholdForecast,
  ThresholdKey,
} from '../types';
import {
  MIN_PAIR_GAP_H,
  STEP_H,
  applyUncertaintyFloor,
  ceilMm,
  estimateStartLevel,
  floorMm,
  median,
  pairwiseSlopes,
  quantile,
  roundDownToHalf,
  roundUpToHalf,
} from './robustTrend';
import type { TrendPoint } from './robustTrend';

const MS_POR_HORA = 3_600_000;

function resultadoDeUmbral(
  key: ThresholdKey,
  valueMm: number,
  inicio: number,
  rateLow: number,
  rateHigh: number,
  horizonte: number,
): ThresholdForecast {
  if (inicio >= valueMm) return { key, valueMm, result: 'exceeded' };

  const faltan = valueMm - inicio;
  const tempranoH = faltan / rateHigh;
  // Si el ritmo bajo no es positivo, el extremo tardío no tiene límite.
  const tardioH = rateLow > 0 ? faltan / rateLow : Infinity;
  const fromH = roundDownToHalf(tempranoH);
  const toH = Number.isFinite(tardioH) ? roundUpToHalf(tardioH) : Infinity;

  if (fromH >= horizonte) return { key, valueMm, result: 'beyond', horizonH: horizonte };
  if (toH <= horizonte) return { key, valueMm, result: 'range', fromH, toH };
  return { key, valueMm, result: 'from', fromH };
}

/**
 * Pronóstico de creciente (contracts/pronostico.md). Función pura y repetible: extrapola el ritmo de
 * subida de la ventana reciente con una tendencia robusta y devuelve SIEMPRE un rango, nunca un número
 * único. No sabe de lluvia ni de saturación del suelo: no es un modelo hidrológico validado.
 * Todos los parámetros (ventana, mínimo de lecturas, horizonte, ritmo "estable", umbrales) salen de `config`.
 */
export function forecast(lecturas: readonly Reading[], config: Config, now: number): Pronostico {
  const { readings, discardedCount } = cleanReadings(lecturas, config, now);
  const { window_min, min_readings, horizon_h, flat_rate_mm_h } = config.forecast;

  const sinProyeccion = (extra: Pick<NoForecast, 'reason' | 'readingsInWindow'> & Partial<NoForecast>): NoForecast => ({
    kind: 'no_forecast',
    minReadings: min_readings,
    discardedCount,
    ...extra,
  });

  // 1. Sin lecturas válidas o con la última demasiado vieja: no se proyecta.
  const ultima = readings[readings.length - 1];
  if (ultima === undefined) return sinProyeccion({ reason: 'stale', readingsInWindow: 0 });
  const ageMin = minutesBetween(ultima.timestamp, now);
  const ultimaLectura = { lastReadingAt: ultima.timestamp, lastLevelMm: ultima.levelMm, ageMin };
  if (ageMin > config.max_reading_age_min) {
    return sinProyeccion({ reason: 'stale', readingsInWindow: 0, ...ultimaLectura });
  }

  // 2. Lecturas de la ventana reciente; con menos que el mínimo no se pronostica.
  const ventana = readings.filter((r) => r.timestamp >= now - window_min * 60_000);
  if (ventana.length < min_readings) {
    return sinProyeccion({ reason: 'few_readings', readingsInWindow: ventana.length, ...ultimaLectura });
  }
  const puntos: TrendPoint[] = ventana.map((r) => ({ hours: (r.timestamp - now) / MS_POR_HORA, level: r.levelMm }));
  const pendientes = pairwiseSlopes(puntos, MIN_PAIR_GAP_H);
  if (pendientes.length === 0) {
    return sinProyeccion({ reason: 'few_readings', readingsInWindow: ventana.length, ...ultimaLectura });
  }

  // 3. Ritmo: mediana de las pendientes. Bajando o estable: no hay pronóstico de creciente.
  const rate = median(pendientes);
  if (rate < -flat_rate_mm_h) {
    return sinProyeccion({ reason: 'falling', readingsInWindow: ventana.length, rate, ...ultimaLectura });
  }
  if (Math.abs(rate) <= flat_rate_mm_h) {
    return sinProyeccion({ reason: 'flat', readingsInWindow: ventana.length, rate, ...ultimaLectura });
  }

  // 4. Rango del ritmo (cuartiles) con piso de incertidumbre, y nivel de partida robusto.
  const { low: rateLow, high: rateHigh } = applyUncertaintyFloor(
    rate,
    quantile(pendientes, 0.25),
    quantile(pendientes, 0.75),
  );
  const startLevelMm = estimateStartLevel(puntos, rate);

  // 5. Tiempo hasta cada umbral, redondeado hacia afuera a 0.5 h.
  const thresholds = [
    resultadoDeUmbral('review', config.thresholds.review_mm, startLevelMm, rateLow, rateHigh, horizon_h),
    resultadoDeUmbral('stop', config.thresholds.stop_mm, startLevelMm, rateLow, rateHigh, horizon_h),
  ];

  // 6. Banda de nivel (abanico) cada 0.5 h hasta el horizonte.
  const band: BandPoint[] = [];
  for (let h = 0; h <= horizon_h + 1e-9; h += STEP_H) {
    band.push({
      h,
      lowMm: startLevelMm + rateLow * h,
      midMm: startLevelMm + rate * h,
      highMm: startLevelMm + rateHigh * h,
    });
  }

  const hResumen = horizon_h / 2;
  const summaryLevel = {
    h: hResumen,
    lowMm: floorMm(startLevelMm + rateLow * hResumen),
    highMm: ceilMm(startLevelMm + rateHigh * hResumen),
  };

  const resultado: ForecastOk = {
    kind: 'forecast',
    rate,
    rateLow,
    rateHigh,
    startLevelMm,
    thresholds,
    band,
    summaryLevel,
    discardedCount,
    readingsUsed: ventana.length,
  };
  return resultado;
}
