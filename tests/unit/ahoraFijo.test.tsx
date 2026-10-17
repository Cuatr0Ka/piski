import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DataProvider } from '../../src/core/data';
import { EstadoActualScreen } from '../../src/features/estado';

// SC-010: dejar abierto un escenario 30 minutos no cambia su estado ni la antigüedad mostrada.
describe('"Ahora" fijo por escenario', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('el estado y la antigüedad no cambian aunque pasen 30 minutos de reloj real', async () => {
    vi.useFakeTimers({ toFake: ['Date'] }); // solo el reloj; las promesas de la carga siguen normales
    vi.setSystemTime(new Date('2027-01-01T00:00:00Z'));
    render(
      <DataProvider scenarioId="ciclon-revisar">
        <EstadoActualScreen />
      </DataProvider>,
    );
    expect(await screen.findByText('Revisa el paso antes de cruzar')).toBeTruthy();
    expect(screen.getByText('Última lectura hace 3 min')).toBeTruthy();

    vi.setSystemTime(new Date('2027-01-01T00:30:00Z'));
    await Promise.resolve();

    expect(screen.getByText('Revisa el paso antes de cruzar')).toBeTruthy();
    expect(screen.getByText('Última lectura hace 3 min')).toBeTruthy();
    expect(screen.getByText('15 oct, 14:27')).toBeTruthy();
  });

  it('el escenario de lecturas viejas muestra "Sin datos" desde que se elige', async () => {
    render(
      <DataProvider scenarioId="lecturas-viejas">
        <EstadoActualScreen />
      </DataProvider>,
    );
    expect(await screen.findByText('Sin datos')).toBeTruthy();
  });
});
