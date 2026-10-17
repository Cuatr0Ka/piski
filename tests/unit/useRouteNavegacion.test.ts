import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useRoute } from '../../src/app/useRoute';

describe('Navegación entre pantallas (useRoute)', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('navigate cambia de pantalla conservando el escenario elegido y sin recargar la página', async () => {
    window.location.hash = '#/estado?e=estiaje';
    (window as unknown as { marca?: string }).marca = 'sigue-aqui';
    const { result } = renderHook(() => useRoute());
    expect(result.current.screen).toBe('estado');

    act(() => result.current.navigate('pronostico'));

    await waitFor(() => expect(result.current.screen).toBe('pronostico'));
    expect(result.current.scenarioId).toBe('estiaje');
    expect(window.location.hash).toBe('#/pronostico?e=estiaje');
    expect((window as unknown as { marca?: string }).marca).toBe('sigue-aqui');
  });

  it('volver a Estado actual también conserva el escenario', async () => {
    window.location.hash = '#/pronostico?e=ciclon-revisar';
    const { result } = renderHook(() => useRoute());
    act(() => result.current.navigate('estado'));
    await waitFor(() => expect(result.current.screen).toBe('estado'));
    expect(result.current.scenarioId).toBe('ciclon-revisar');
  });
});
