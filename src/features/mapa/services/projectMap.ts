import type { Region } from '../../../core/schemas';

export interface MapView {
  /** Ancho y alto del lienzo SVG en unidades de dibujo. */
  width: number;
  height: number;
  /** Convierte [lon, lat] a coordenadas del lienzo. */
  project: (lon: number, lat: number) => { x: number; y: number };
}

const ANCHO = 1000;
const MARGEN = 24;

/** Proyección equirectangular ajustada a la latitud media de la región; mantiene las proporciones reales. */
export function buildView(bbox: Region['bbox']): MapView {
  const [w, s, e, n] = bbox;
  const k = Math.cos((((s + n) / 2) * Math.PI) / 180);
  const dx = (e - w) * k;
  const dy = n - s;
  const escala = (ANCHO - 2 * MARGEN) / dx;
  const height = Math.round(dy * escala + 2 * MARGEN);
  return {
    width: ANCHO,
    height,
    project: (lon, lat) => ({
      x: MARGEN + (lon - w) * k * escala,
      y: MARGEN + (n - lat) * escala,
    }),
  };
}

const f = (n: number) => n.toFixed(1);

/** Trazo SVG ("M x y L x y …") de una línea o un contorno cerrado. */
export function toPath(view: MapView, puntos: readonly (readonly [number, number])[], cerrar = false): string {
  const trazo = puntos
    .map(([lon, lat], i) => {
      const { x, y } = view.project(lon, lat);
      return `${i === 0 ? 'M' : 'L'}${f(x)} ${f(y)}`;
    })
    .join(' ');
  return cerrar ? `${trazo} Z` : trazo;
}
