import { describe, expect, it } from 'vitest';
import { loadRegion } from '../../src/core/data';
import { regionSchema } from '../../src/core/schemas';
import { parseHash } from '../../src/app/useRoute';
import { computeBeaconStates } from '../../src/features/mapa/services/beaconStates';
import { buildView, toPath } from '../../src/features/mapa/services/projectMap';
import { configEjemplo } from '../fixtures/ejemplos';

const region = loadRegion();
const AHORA = Date.parse('2026-10-15T14:30:00-06:00');
const lectura = (minAntes: number, nivel: number) => ({
  timestamp: new Date(AHORA - minAntes * 60_000).toISOString().replace('Z', '+00:00'),
  level_mm: nivel,
  rain_mm: 0,
  simulated: true,
});

describe('Región del mapa (data/mapa/region.json)', () => {
  it('cumple el esquema y trae los dos municipios pedidos', () => {
    expect(regionSchema.safeParse(region).success).toBe(true);
    expect(region.municipalities.map((m) => m.name).sort()).toEqual(['Huauchinango', 'Xicotepec de Juárez']);
  });

  it('incluye Necaxa como localidad y atribuye las fuentes', () => {
    expect(region.places.some((l) => l.name === 'Necaxa')).toBe(true);
    expect(region.attribution).toContain('INEGI');
    expect(region.attribution).toContain('OpenStreetMap');
  });

  it('tiene balizas de ejemplo con coordenadas dentro del rectángulo de la región', () => {
    const [w, s, e, n] = region.bbox;
    expect(region.beacons.length).toBeGreaterThanOrEqual(3);
    for (const b of region.beacons) {
      expect(b.lon, `${b.id} fuera en longitud`).toBeGreaterThanOrEqual(w);
      expect(b.lon).toBeLessThanOrEqual(e);
      expect(b.lat, `${b.id} fuera en latitud`).toBeGreaterThanOrEqual(s);
      expect(b.lat).toBeLessThanOrEqual(n);
    }
  });

  it('rechaza una región sin municipios con un mensaje claro', () => {
    expect(() => loadRegion({ x: { ...region, municipalities: [] } })).toThrow(/no es válido/);
    expect(() => loadRegion({})).toThrow(/Falta data\/mapa\/region.json/);
  });
});

describe('Proyección del mapa', () => {
  const vista = buildView([-98, 20, -97.8, 20.2]);

  it('el norte queda arriba y el este a la derecha', () => {
    const noroeste = vista.project(-98, 20.2);
    const sureste = vista.project(-97.8, 20);
    expect(noroeste.y).toBeLessThan(sureste.y);
    expect(noroeste.x).toBeLessThan(sureste.x);
  });

  it('mantiene las proporciones: un grado de latitud mide más que uno de longitud', () => {
    const a = vista.project(-98, 20);
    const lat = vista.project(-98, 20.1);
    const lon = vista.project(-97.9, 20);
    expect(Math.abs(a.y - lat.y)).toBeGreaterThan(Math.abs(lon.x - a.x));
  });

  it('arma trazos abiertos y cerrados', () => {
    const abierto = toPath(vista, [[-98, 20], [-97.9, 20.1]]);
    expect(abierto.startsWith('M')).toBe(true);
    expect(abierto).not.toContain('Z');
    expect(toPath(vista, [[-98, 20], [-97.9, 20.1], [-97.8, 20]], true).endsWith('Z')).toBe(true);
  });
});

describe('Estado de cada baliza', () => {
  const lecturas = [90, 75, 60, 45, 30, 15, 3].map((m, i) => lectura(m, 560 + i * 20));

  it('clasifica cada baliza con su propio nivel y la misma regla de Estado actual', () => {
    const estados = computeBeaconStates(region.beacons, lecturas, configEjemplo, AHORA);
    expect(estados).toHaveLength(region.beacons.length);
    // Nivel central: 680 mm (Revisar). Con factor 0.88 queda en 598 mm (Normal); con 1.12, en 761 mm (Revisar).
    const porFactor = new Map(estados.map((e) => [e.beacon.level_factor, e]));
    expect(porFactor.get(0.88)?.estado.kind).toBe('normal');
    expect(porFactor.get(1)?.estado.kind).toBe('review');
    expect(porFactor.get(1.12)?.estado.kind).toBe('review');
    expect(porFactor.get(1)?.levelMm).toBeCloseTo(680, 5);
  });

  it('con lecturas viejas todas las balizas quedan Sin datos y sin nivel', () => {
    const viejas = lecturas.map((l, i) => lectura(300 + i, l.level_mm));
    for (const e of computeBeaconStates(region.beacons, viejas, configEjemplo, AHORA)) {
      expect(e.estado.kind).toBe('nodata');
      expect(e.levelMm).toBeUndefined();
    }
  });
});

describe('Ruta del mapa', () => {
  it('reconoce #/mapa y conserva el escenario', () => {
    expect(parseHash('#/mapa?e=ciclon-inicio')).toEqual({ screen: 'mapa', scenarioId: 'ciclon-inicio' });
  });
});
