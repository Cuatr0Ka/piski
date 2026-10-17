// Utilidades de tiempo. Son funciones puras: reciben siempre un instante explícito y NUNCA
// leen el reloj real (el "ahora" sale del escenario; ver FR-032).

/** Lecturas que adelantan más de 60 s respecto al "ahora" se descartan. No es un umbral de nivel. */
export const FUTURE_TOLERANCE_MS = 60_000;

const CON_ZONA = /(Z|[+-]\d{2}:\d{2})$/;
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** Convierte una marca ISO 8601 con zona horaria a milisegundos desde 1970. */
export function parseTimestamp(valor: string): number {
  if (!CON_ZONA.test(valor)) {
    throw new Error(`La marca de tiempo "${valor}" no tiene zona horaria (por ejemplo -06:00 o Z).`);
  }
  const ms = Date.parse(valor);
  if (Number.isNaN(ms)) throw new Error(`La marca de tiempo "${valor}" no es una fecha válida.`);
  return ms;
}

/** Minutos que pasan de `desde` a `hasta` (negativo si `hasta` es anterior). */
export function minutesBetween(desde: number, hasta: number): number {
  return (hasta - desde) / 60_000;
}

/** "hace 3 min" o "hace 3 h". */
export function formatAge(minutos: number): string {
  const m = Math.floor(minutos);
  if (m < 1) return 'hace menos de 1 min';
  if (m < 60) return `hace ${m} min`;
  return `hace ${Math.floor(m / 60)} h`;
}

const dos = (n: number) => String(n).padStart(2, '0');

/** Desfase en minutos de una marca ISO con zona ("-06:00" → -360, "Z" → 0). */
export function offsetMinutes(valor: string): number {
  const m = /([+-])(\d{2}):(\d{2})$/.exec(valor);
  if (!m) return 0;
  const minutos = Number(m[2]) * 60 + Number(m[3]);
  return m[1] === '-' ? -minutos : minutos;
}

/** Fecha con los campos "locales" de la zona indicada (no la del navegador). */
function enZona(ms: number, offsetMin: number): Date {
  return new Date(ms + offsetMin * 60_000);
}

/** Hora en 24 horas ("14:27") en la zona indicada (la del escenario). */
export function formatHour(ms: number, offsetMin: number): string {
  const d = enZona(ms, offsetMin);
  return `${dos(d.getUTCHours())}:${dos(d.getUTCMinutes())}`;
}

/** "15 oct, 14:27" (24 horas) en la zona indicada. */
export function formatDateTime(ms: number, offsetMin: number): string {
  const d = enZona(ms, offsetMin);
  return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]}, ${formatHour(ms, offsetMin)}`;
}
