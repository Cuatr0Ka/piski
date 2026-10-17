import { describe, expect, it } from 'vitest';
import { classifyState } from '../../src/features/estado/services/classifyState';
import { configEjemplo } from '../fixtures/ejemplos';
import { ahoraTras, lecturas } from '../fixtures/lecturas';

// Configuración de ejemplo: Revisar 60, No cruzar 85, subir con 3 lecturas, bajar con 5, vieja a los 30 min.
const estadoDe = (niveles: number[], config = configEjemplo) => {
  const serie = lecturas(niveles);
  return classifyState(serie, config, ahoraTras(serie));
};

describe('Clasificación del estado: historia 1 (ver el estado del paso)', () => {
  it('muestra Normal cuando todas las lecturas están por debajo de Revisar (C01)', () => {
    expect(estadoDe([420, 430, 440]).kind).toBe('normal');
  });

  it('una sola lectura espuria alta no cambia el estado (C02 y C03)', () => {
    expect(estadoDe([420, 430, 700]).kind).toBe('normal');
    expect(estadoDe([420, 430, 440, 700]).kind).toBe('normal');
  });

  it('pasa a Revisar con 3 lecturas seguidas en Revisar (C06)', () => {
    expect(estadoDe([420, 430, 700, 710, 720]).kind).toBe('review');
  });

  it('pasa a No cruzar con 3 lecturas seguidas en No cruzar', () => {
    expect(estadoDe([420, 700, 800, 900, 910, 920]).kind).toBe('stop');
  });

  it('al arranque, una sola lectura en No cruzar da No cruzar (C04)', () => {
    expect(estadoDe([900]).kind).toBe('stop');
  });

  it('bajar de No cruzar exige 5 lecturas seguidas bajas: con 4 sigue en No cruzar (C08)', () => {
    expect(estadoDe([900, 900, 900, 500, 500, 500, 500]).kind).toBe('stop');
  });

  it('con 5 lecturas seguidas bajas vuelve a Normal (C09)', () => {
    expect(estadoDe([900, 900, 900, 500, 500, 500, 500, 500]).kind).toBe('normal');
  });

  it('sin lecturas muestra Sin datos y nunca Normal (C13)', () => {
    const e = classifyState([], configEjemplo, Date.parse('2026-10-15T14:30:00-06:00'));
    expect(e.kind).toBe('nodata');
    expect(e.noDataReason).toBe('none');
  });

  it('con la última lectura más vieja que 30 min muestra Sin datos (C14)', () => {
    const serie = lecturas([420, 430, 440]);
    const e = classifyState(serie, configEjemplo, ahoraTras(serie, 31));
    expect(e.kind).toBe('nodata');
    expect(e.noDataReason).toBe('stale');
  });

  it('con exactamente 30 min de antigüedad la lectura todavía no es vieja (C15)', () => {
    const serie = lecturas([420, 430, 440]);
    expect(classifyState(serie, configEjemplo, ahoraTras(serie, 30)).kind).toBe('normal');
  });

  it('informa la última lectura, su antigüedad y su nivel', () => {
    const serie = lecturas([420, 430, 440]);
    const e = classifyState(serie, configEjemplo, ahoraTras(serie, 3));
    expect(e.lastLevelMm).toBe(440);
    expect(e.ageMin).toBe(3);
    expect(e.lastReadingAt).toBe(Date.parse(serie[2]!.timestamp));
    expect(e.discardedCount).toBe(0);
  });

  it('cambiar un umbral en la configuración cambia el estado sin tocar el código', () => {
    const niveles = [900, 900, 900];
    expect(estadoDe(niveles).kind).toBe('stop');
    const otraConfig = {
      ...configEjemplo,
      thresholds: { review_mm: 600, stop_mm: 1200 },
      crossing_mm: 1300,
    };
    expect(estadoDe(niveles, otraConfig).kind).toBe('review');
  });
});
