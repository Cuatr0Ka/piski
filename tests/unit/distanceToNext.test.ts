import { describe, expect, it } from 'vitest';
import { describeDistance } from '../../src/features/estado/services/distanceToNext';
import type { EstadoPaso } from '../../src/features/estado/types';
import { configEjemplo } from '../fixtures/ejemplos';

const estado = (kind: EstadoPaso['kind'], lastLevelMm?: number, lastReadingAt?: number): EstadoPaso => ({
  kind,
  discardedCount: 0,
  ...(lastLevelMm !== undefined ? { lastLevelMm } : {}),
  ...(lastReadingAt !== undefined ? { lastReadingAt } : {}),
});

describe('Distancia al siguiente nivel', () => {
  it('Normal: "Faltan 180 mm para Revisar" con 420 mm', () => {
    expect(describeDistance(estado('normal', 420), configEjemplo, -360)).toBe('Faltan 180 mm para Revisar');
  });

  it('Revisar: "Faltan 190 mm para No cruzar" con 660 mm', () => {
    expect(describeDistance(estado('review', 660), configEjemplo, -360)).toBe('Faltan 190 mm para No cruzar');
  });

  it('No cruzar: "Faltan 90 mm para el nivel del paso" con 910 mm', () => {
    expect(describeDistance(estado('stop', 910), configEjemplo, -360)).toBe('Faltan 90 mm para el nivel del paso');
  });

  it('con el agua en el nivel del paso o por encima lo dice', () => {
    expect(describeDistance(estado('stop', 1000), configEjemplo, -360)).toBe('El agua ya llegó al nivel del paso');
    expect(describeDistance(estado('stop', 1045), configEjemplo, -360)).toBe('El agua ya llegó al nivel del paso');
  });

  it('usa un decimal solo cuando hace falta', () => {
    expect(describeDistance(estado('normal', 417), configEjemplo, -360)).toBe('Faltan 183 mm para Revisar');
  });

  it('se basa en el nivel y no en el estado: una espuria no da una distancia negativa', () => {
    expect(describeDistance(estado('normal', 700), configEjemplo, -360)).toBe('Faltan 150 mm para No cruzar');
  });

  it('Sin datos: explica que el último nivel conocido no se usa para decidir', () => {
    const ultima = Date.parse('2026-10-15T11:30:00-06:00');
    expect(describeDistance(estado('nodata', 480, ultima), configEjemplo, -360)).toBe(
      'El último nivel conocido (480 mm a las 11:30) no se usa para decidir.',
    );
  });

  it('Sin datos y sin ninguna lectura no inventa un nivel', () => {
    expect(describeDistance(estado('nodata'), configEjemplo, -360)).toBe('');
  });
});
