import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DataProvider } from '../../src/core/data';
import { EstadoActualScreen } from '../../src/features/estado';

function mostrar(escenario: string) {
  return render(
    <DataProvider scenarioId={escenario}>
      <EstadoActualScreen />
    </DataProvider>,
  );
}

describe('Pantalla Estado actual con los escenarios de ejemplo', () => {
  it('tormenta-normal: Normal, "Paso seguro", nivel contra el paso y antigüedad', async () => {
    mostrar('tormenta-normal');
    expect(await screen.findByText('Normal')).toBeTruthy();
    expect(screen.getByText('Paso seguro')).toBeTruthy();
    expect(screen.getByText('de 1000 mm del paso')).toBeTruthy();
    expect(screen.getByText('Última lectura hace 3 min')).toBeTruthy();
    expect(screen.getByText('15 oct, 14:27')).toBeTruthy();
  });

  it('muestra el título de la pantalla y su rol', async () => {
    mostrar('tormenta-normal');
    expect(await screen.findByRole('heading', { name: 'Estado actual' })).toBeTruthy();
    expect(screen.getByText('Para: encargado del comité')).toBeTruthy();
  });

  it('ciclon-revisar: Revisar con "Revisa el paso antes de cruzar"', async () => {
    mostrar('ciclon-revisar');
    expect(await screen.findByText('Revisar', { selector: 'div' })).toBeTruthy();
    expect(screen.getByText('Revisa el paso antes de cruzar')).toBeTruthy();
    expect(screen.getByText('660 mm')).toBeTruthy();
  });

  it('ciclon-no-cruzar: No cruzar con "No cruces"', async () => {
    mostrar('ciclon-no-cruzar');
    expect(await screen.findByText('No cruzar', { selector: 'div' })).toBeTruthy();
    expect(screen.getByText('No cruces')).toBeTruthy();
  });

  it('lecturas-viejas: Sin datos y nunca verde, con la hora de la última lectura', async () => {
    mostrar('lecturas-viejas');
    expect(await screen.findByText('Sin datos')).toBeTruthy();
    expect(screen.getByText('Sin lecturas desde las 11:30', { selector: 'div' })).toBeTruthy();
    expect(screen.queryByText('Paso seguro')).toBeNull();
    expect(screen.queryByText('Normal')).toBeNull();
  });

  it('lectura-espuria: una sola lectura de 950 mm no cambia el estado', async () => {
    mostrar('lectura-espuria');
    expect(await screen.findByText('Normal')).toBeTruthy();
  });

  it('muestra el mensaje de ejemplo "Qué avisar" del estado vigente', async () => {
    const casos = [
      ['tormenta-normal', 'El paso está normal. No hay aviso que dar.'],
      ['ciclon-revisar', 'El arroyo está en Revisar. Pedimos que revisen el paso antes de cruzar.'],
      ['ciclon-no-cruzar', 'El arroyo llegó a No cruzar. Pedimos que nadie cruce el paso.'],
      ['lecturas-viejas', 'No hay lecturas recientes. No se puede avisar con este panel; revisen el arroyo en persona.'],
    ] as const;
    for (const [escenario, mensaje] of casos) {
      const { unmount } = mostrar(escenario);
      expect(await screen.findByText(mensaje)).toBeTruthy();
      unmount();
    }
  });

  it('muestra la lluvia en mm, como una app del clima: última hora y las ventanas de 3 y 6 h', async () => {
    mostrar('ciclon-revisar');
    expect(await screen.findByRole('heading', { name: 'Lluvia' })).toBeTruthy();
    expect(screen.getByText('en la última hora')).toBeTruthy();
    expect(screen.getByText('Últimas 3 h')).toBeTruthy();
    expect(screen.getByText('Últimas 6 h')).toBeTruthy();
    // La cifra principal es de lluvia intensa (más de 20 mm en la última hora).
    const principal = screen.getByText('en la última hora').previousElementSibling as HTMLElement;
    expect(principal.textContent).toMatch(/^\d+(\.\d)? mm$/);
    expect(Number.parseFloat(principal.textContent ?? '0')).toBeGreaterThan(20);
  });

  it('el estiaje no llueve: 0 mm', async () => {
    mostrar('estiaje');
    await screen.findByRole('heading', { name: 'Lluvia' });
    const principal = screen.getByText('en la última hora').previousElementSibling as HTMLElement;
    expect(principal.textContent).toBe('0 mm');
  });

  it('con Sin datos no muestra cifras de lluvia: dice que no se puede calcular', async () => {
    mostrar('lecturas-viejas');
    expect(await screen.findByText('Sin lecturas recientes: no se puede calcular la lluvia.')).toBeTruthy();
    expect(screen.queryByText('en la última hora')).toBeNull();
  });

  it('lectura-imposible: descarta las lecturas imposibles y avisa cuántas', async () => {
    mostrar('lectura-imposible');
    expect(await screen.findByText('Se descartaron 2 lecturas fuera de rango')).toBeTruthy();
    expect(screen.getByText('Normal')).toBeTruthy();
  });
});
