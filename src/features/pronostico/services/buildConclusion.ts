import { textos } from '../../../core/i18n/textos';
import type { EstadoClave } from '../../../core/i18n/textos';
import { formatMm, formatHoras } from '../../../core/utils/formatNumber';
import type { ForecastOk, ThresholdForecast, ThresholdKey } from '../types';

export interface ConclusionRow {
  key: ThresholdKey;
  /** Forma de estado del umbral: triángulo para Revisar, octágono para No cruzar. */
  shape: EstadoClave;
  /** "Revisar (60 mm)". */
  label: string;
  /** "entre 2.5 y 4 h", "a partir de 5.5 h", "ya superado" o "No se proyecta en las próximas 6 h". */
  value: string;
}

export interface Conclusion {
  /** La frase de conclusión: lo primero y lo más grande de la pantalla. */
  sentence: string;
  rows: ConclusionRow[];
}

const NOMBRE: Record<ThresholdKey, string> = { review: 'Revisar', stop: 'No cruzar' };
const FORMA: Record<ThresholdKey, EstadoClave> = { review: 'review', stop: 'stop' };

function valorDelRenglon(u: ThresholdForecast): string {
  const v = textos.pronostico.valores;
  switch (u.result) {
    case 'exceeded':
      return v.superado;
    case 'range':
      return v.rango(formatHoras(u.fromH), formatHoras(u.toH));
    case 'from':
      return v.desde(formatHoras(u.fromH));
    case 'beyond':
      return v.noSeProyecta(formatHoras(u.horizonH));
  }
}

function frase(revisar: ThresholdForecast, noCruzar: ThresholdForecast): string {
  const c = textos.pronostico.conclusion;
  // Ya superó No cruzar.
  if (noCruzar.result === 'exceeded') return c.noCruzarSuperado;
  // Ya superó Revisar: la frase habla de No cruzar.
  if (revisar.result === 'exceeded') {
    switch (noCruzar.result) {
      case 'range':
        return c.noCruzarRango(formatHoras(noCruzar.fromH), formatHoras(noCruzar.toH));
      case 'from':
        return c.noCruzarDesde(formatHoras(noCruzar.fromH));
      case 'beyond':
        return c.noCruzarNo(formatHoras(noCruzar.horizonH));
    }
  }
  // Todavía no llega a Revisar.
  switch (revisar.result) {
    case 'range':
      return c.revisarRango(formatHoras(revisar.fromH), formatHoras(revisar.toH));
    case 'from':
      return c.revisarDesde(formatHoras(revisar.fromH));
    case 'beyond':
      return c.revisarNo(formatHoras(revisar.horizonH));
  }
}

/**
 * Arma la frase de conclusión y los renglones por umbral. Nunca dice "hay tiempo" ni "más de N h":
 * si no se proyecta llegar a un umbral, dice "No se proyecta en las próximas N h".
 */
export function buildConclusion(pronostico: ForecastOk, horizonH: number): Conclusion {
  const revisar = pronostico.thresholds.find((t) => t.key === 'review');
  const noCruzar = pronostico.thresholds.find((t) => t.key === 'stop');
  if (revisar === undefined || noCruzar === undefined) {
    throw new Error(`El pronóstico debe traer los umbrales de Revisar y No cruzar (horizonte ${horizonH} h).`);
  }
  return {
    sentence: frase(revisar, noCruzar),
    rows: [revisar, noCruzar].map((u) => ({
      key: u.key,
      shape: FORMA[u.key],
      label: textos.pronostico.filas.umbral(NOMBRE[u.key], formatMm(u.valueMm)),
      value: valorDelRenglon(u),
    })),
  };
}
