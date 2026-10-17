/** Redondea a un decimal y lo muestra solo si hace falta: 42 → "42", 41.7 → "41.7". */
export function formatMm(valor: number): string {
  const r = Math.round(valor * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}

/** Número con un decimal fijo, con signo opcional ("+6.0", "−2.0"). */
export function formatDecimal(valor: number, conSigno = false): string {
  const r = Math.round(valor * 10) / 10;
  const texto = Math.abs(r).toFixed(1);
  if (r < 0) return `−${texto}`;
  return conSigno ? `+${texto}` : texto;
}

/** Horas en pasos de 0.5 sin ceros sobrantes: 4 → "4", 2.5 → "2.5". */
export function formatHoras(valor: number): string {
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(1);
}
