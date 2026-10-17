import { textos } from '../../../core/i18n/textos';
import type { ReadingPoint } from '../../../core/readings/cleanReadings';
import type { RainTotal } from '../../../core/readings/rainTotals';
import { formatAge, minutesBetween } from '../../../core/time/clock';
import { formatMm, formatDecimal, formatHoras } from '../../../core/utils/formatNumber';
import type { ConclusionLine } from '../../../ui';
import type { ForecastOk } from '../types';
import { buildConclusion } from './buildConclusion';

export interface ForecastView {
  sentence: string;
  thresholds: ConclusionLine[];
  facts: ConclusionLine[];
  note: string;
  warning: string;
}

/** Textos de la tarjeta de conclusión: la frase, un renglón por umbral y las cifras que la respaldan. */
export function describeForecast(
  p: ForecastOk,
  ultima: ReadingPoint | undefined,
  now: number,
  horizonH: number,
  lluvia: RainTotal | undefined,
): ForecastView {
  const conclusion = buildConclusion(p, horizonH);
  const v = textos.pronostico.valores;
  const f = textos.pronostico.filas;

  return {
    sentence: conclusion.sentence,
    thresholds: conclusion.rows.map((r) => ({ label: r.label, value: r.value, shape: r.shape })),
    facts: [
      { label: f.nivelActual, value: ultima ? `${formatMm(ultima.levelMm)} mm` : textos.nivel.sinDato },
      {
        label: f.ritmo,
        value: `${formatDecimal(p.rate, true)} mm/h`,
        sub: v.ritmoRango(formatDecimal(p.rateLow, true), formatDecimal(p.rateHigh, true)),
      },
      {
        label: f.proyectado,
        value: v.proyectadoRango(String(p.summaryLevel.lowMm), String(p.summaryLevel.highMm), formatHoras(p.summaryLevel.h)),
      },
      ...(lluvia
        ? [{ label: `${textos.lluvia.titulo} ${textos.lluvia.enVentana(lluvia.hours)}`, value: `${formatMm(lluvia.mm)} mm` }]
        : []),
      { label: f.ultimaLectura, value: ultima ? formatAge(minutesBetween(ultima.timestamp, now)) : '' },
    ],
    note: textos.pronostico.notaProyeccion,
    warning: textos.pronostico.avisoLluvia,
  };
}
