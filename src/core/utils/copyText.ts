/** Copia con un área de texto temporal y `execCommand('copy')`, para navegadores sin portapapeles moderno. */
function copiarConSeleccion(texto: string): boolean {
  if (typeof document.execCommand !== 'function') return false;
  const area = document.createElement('textarea');
  area.value = texto;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    document.body.removeChild(area);
  }
}

/**
 * Copia un texto al portapapeles. Usa `navigator.clipboard` (disponible al abrir el archivo local en
 * Chrome) y, si falla o no existe, el respaldo por selección. Devuelve si se pudo copiar.
 */
export async function copyText(texto: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch {
      // Sin permiso o sin contexto seguro: se intenta el respaldo.
    }
  }
  return copiarConSeleccion(texto);
}
