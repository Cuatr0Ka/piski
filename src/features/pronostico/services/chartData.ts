import { textos } from '../../../core/i18n/textos';
import type { ReadingPoint } from '../../../core/readings/cleanReadings';
import type { Config } from '../../../core/schemas/config';
import { formatMm, formatHoras } from '../../../core/utils/formatNumber';
import type { ChartProjection, ChartReading, ChartTableRow, ChartThreshold } from '../../../ui';
import type { Pronostico } from '../types';
import { ceilMm, floorMm } from './robustTrend';

export interface ChartData {
  readings: ChartReading[];
  thresholds: ChartThreshold[];
  maxMm: number;
  projection?: ChartProjection;
  table: ChartTableRow[];
}

const MS_POR_HORA = 3_600_000;
const HORAS_ATRAS = 6;
/** El eje vertical llega un 25 % más allá del nivel del paso. */
const ESCALA_VERTICAL = 1.25;
/** Una lectura sirve para una fila de la tabla si está a menos de 12 min de la hora pedida. */
const TOLERANCIA_TABLA_H = 0.2;

const etiquetaHora = (t: number): string =>
  t === 0 ? textos.grafica.ahora : t > 0 ? `+${formatHoras(t)} h` : `−${formatHoras(Math.abs(t))} h`;

/** Arma lo que la gráfica dibuja y su alternativa en texto, a partir de las lecturas válidas y el pronóstico. */
export function buildChartData(
  lecturas: readonly ReadingPoint[],
  pronostico: Pronostico,
  config: Config,
  now: number,
): ChartData {
  const readings: ChartReading[] = lecturas
    .map((l) => ({ hours: (l.timestamp - now) / MS_POR_HORA, level: l.levelMm }))
    .filter((l) => l.hours >= -HORAS_ATRAS && l.hours <= 0);

  const t = textos.grafica.umbral;
  const thresholds: ChartThreshold[] = [
    { tone: 'review', valueMm: config.thresholds.review_mm, label: t('Revisar', formatMm(config.thresholds.review_mm)) },
    { tone: 'stop', valueMm: config.thresholds.stop_mm, label: t('No cruzar', formatMm(config.thresholds.stop_mm)) },
    { tone: 'crossing', valueMm: config.crossing_mm, label: t('Paso', formatMm(config.crossing_mm)) },
  ];

  const projection: ChartProjection | undefined =
    pronostico.kind === 'forecast' ? { horizonH: config.forecast.horizon_h, band: pronostico.band } : undefined;

  // Alternativa en texto: lecturas medidas cada 2 h y, con proyección, el rango a un tercio, dos tercios y el total del horizonte.
  const table: ChartTableRow[] = [];
  for (const objetivo of [-6, -4, -2, 0]) {
    const cercana = readings.reduce<ChartReading | undefined>(
      (mejor, r) => (mejor === undefined || Math.abs(r.hours - objetivo) < Math.abs(mejor.hours - objetivo) ? r : mejor),
      undefined,
    );
    if (cercana !== undefined && Math.abs(cercana.hours - objetivo) <= TOLERANCIA_TABLA_H) {
      table.push({
        hora: etiquetaHora(objetivo),
        nivel: `${formatMm(cercana.level)} mm`,
        origen: textos.grafica.tabla.medido,
      });
    }
  }
  if (projection !== undefined) {
    for (const parte of [1, 2, 3]) {
      const h = (projection.horizonH * parte) / 3;
      const punto = projection.band.reduce((mejor, b) => (Math.abs(b.h - h) < Math.abs(mejor.h - h) ? b : mejor));
      table.push({
        hora: etiquetaHora(h),
        nivel: `entre ${floorMm(punto.lowMm)} y ${ceilMm(punto.highMm)} mm`,
        origen: textos.grafica.tabla.proyeccion,
      });
    }
  }

  return { readings, thresholds, maxMm: config.crossing_mm * ESCALA_VERTICAL, ...(projection ? { projection } : {}), table };
}
