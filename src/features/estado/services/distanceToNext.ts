import { textos } from '../../../core/i18n/textos';
import type { Config } from '../../../core/schemas/config';
import { formatHour } from '../../../core/time/clock';
import { formatMm } from '../../../core/utils/formatNumber';
import type { EstadoPaso } from '../types';

/**
 * Frase bajo el nivel: cuánto falta para el siguiente nivel ("Faltan 19 mm para No cruzar").
 * Se basa en el nivel de la última lectura y no en el estado, así una lectura espuria no da distancias negativas.
 * Con "Sin datos" explica que el último nivel conocido no se usa para decidir.
 */
export function describeDistance(estado: EstadoPaso, config: Config, offsetMin: number): string {
  if (estado.lastLevelMm === undefined) return '';
  const nivel = estado.lastLevelMm;

  if (estado.kind === 'nodata') {
    if (estado.lastReadingAt === undefined) return '';
    return textos.nivel.ultimoConocido(formatMm(nivel), formatHour(estado.lastReadingAt, offsetMin));
  }

  const { review_mm: revisar, stop_mm: noCruzar } = config.thresholds;
  if (nivel < revisar) return textos.nivel.faltanRevisar(formatMm(revisar - nivel));
  if (nivel < noCruzar) return textos.nivel.faltanNoCruzar(formatMm(noCruzar - nivel));
  if (nivel < config.crossing_mm) return textos.nivel.faltanPaso(formatMm(config.crossing_mm - nivel));
  return textos.nivel.sobrePaso;
}
