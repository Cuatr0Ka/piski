import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SCENARIO, buildHash, parseHash, useRoute } from '../../src/app/useRoute';

describe('Dirección de la aplicación (hash)', () => {
  it('sin hash abre Estado actual con el escenario tormenta-normal', () => {
    expect(parseHash('')).toEqual({ screen: 'estado', scenarioId: DEFAULT_SCENARIO });
    expect(DEFAULT_SCENARIO).toBe('tormenta-normal');
  });

  it('lee la pantalla y el escenario de #/pronostico?e=<id>', () => {
    expect(parseHash('#/pronostico?e=ciclon-inicio')).toEqual({ screen: 'pronostico', scenarioId: 'ciclon-inicio' });
    expect(parseHash('#/estado')).toEqual({ screen: 'estado', scenarioId: DEFAULT_SCENARIO });
  });

  it('una pantalla desconocida vuelve a Estado actual y conserva el escenario', () => {
    expect(parseHash('#/raro?e=estiaje')).toEqual({ screen: 'estado', scenarioId: 'estiaje' });
  });

  it('arma la dirección y es reversible', () => {
    const estado = { screen: 'pronostico', scenarioId: 'estiaje' } as const;
    expect(buildHash(estado)).toBe('#/pronostico?e=estiaje');
    expect(parseHash(buildHash(estado))).toEqual(estado);
  });
});

describe('useRoute', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('cambia el escenario sin recargar la página y conserva la pantalla', async () => {
    window.location.hash = '#/pronostico?e=ciclon-inicio';
    (window as unknown as { marca?: string }).marca = 'sigue-aqui';
    const { result } = renderHook(() => useRoute());
    expect(result.current.screen).toBe('pronostico');

    act(() => result.current.setScenario('estiaje'));

    // `hashchange` se dispara de forma asíncrona, como en el navegador.
    await waitFor(() => expect(result.current.scenarioId).toBe('estiaje'));
    expect(result.current.screen).toBe('pronostico');
    expect(window.location.hash).toBe('#/pronostico?e=estiaje');
    expect((window as unknown as { marca?: string }).marca).toBe('sigue-aqui'); // no se recargó
  });
});
