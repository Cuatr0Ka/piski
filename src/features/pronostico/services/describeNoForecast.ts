import { textos } from '../../../core/i18n/textos';
import { formatAge, formatHour } from '../../../core/time/clock';
import { formatMm, formatDecimal } from '../../../core/utils/formatNumber';
import type { ConclusionLine } from '../../../ui';
import type { NoForecast } from '../types';

export interface NoForecastView {
  title: string;
  reason: string;
  action: string;
  lines: ConclusionLine[];
}

/** Textos de la tarjeta "sin pronóstico": título, razón, qué hacer y las cifras que sí se conocen. */
export function describeNoForecast(p: NoForecast, offsetMin: number): NoForecastView {
  const sin = textos.pronostico.sin;
  const hora = p.lastReadingAt !== undefined ? formatHour(p.lastReadingAt, offsetMin) : undefined;
  const edad = p.ageMin !== undefined ? formatAge(p.ageMin) : '';

  let titulo: string;
  let razon: string;
  let accion: string;
  switch (p.reason) {
    case 'few_readings':
      titulo = sin.pocasLecturas.titulo;
      razon = sin.pocasLecturas.razon(p.readingsInWindow, p.minReadings);
      accion = sin.pocasLecturas.accion;
      break;
    case 'stale':
      titulo = sin.viejos.titulo;
      razon = hora !== undefined ? sin.viejos.razon(hora, edad) : sin.viejos.sinLecturas;
      accion = sin.viejos.accion;
      break;
    case 'falling':
      titulo = sin.bajando.titulo;
      razon = sin.bajando.razon(formatDecimal(p.rate ?? 0));
      accion = sin.bajando.accion;
      break;
    case 'flat':
      titulo = sin.estable.titulo;
      razon = sin.estable.razon;
      accion = sin.estable.accion;
      break;
  }

  const esViejo = p.reason === 'stale';
  const antiguedad = esViejo
    ? hora !== undefined
      ? textos.sinLecturasDesde(hora)
      : textos.sinLecturas
    : edad;

  return {
    title: titulo,
    reason: razon,
    action: accion,
    lines: [
      {
        label: esViejo ? textos.pronostico.filas.ultimoNivel : textos.pronostico.filas.nivelActual,
        value: p.lastLevelMm !== undefined ? `${formatMm(p.lastLevelMm)} mm` : textos.nivel.sinDato,
      },
      {
        label: textos.pronostico.filas.ritmo,
        value: p.rate !== undefined ? `${formatDecimal(p.rate, true)} mm/h` : textos.pronostico.valores.sinCalcular,
      },
      { label: textos.pronostico.filas.ultimaLectura, value: antiguedad },
    ],
  };
}
