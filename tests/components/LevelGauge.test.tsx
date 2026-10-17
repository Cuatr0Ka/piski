import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LevelGauge } from '../../src/ui/components/LevelGauge';

const umbrales = { reviewMm: 600, stopMm: 850, crossingMm: 1000 };

describe('LevelGauge', () => {
  it('muestra el nivel con unidades contra el nivel del paso', () => {
    render(<LevelGauge levelMm={420} thresholds={umbrales} caption="Faltan 180 mm para Revisar" />);
    expect(screen.getByText('420 mm')).toBeTruthy();
    expect(screen.getByText('de 1000 mm del paso')).toBeTruthy();
    expect(screen.getByText('Faltan 180 mm para Revisar')).toBeTruthy();
  });

  it('marca Revisar, No cruzar y Paso con sus valores', () => {
    render(<LevelGauge levelMm={660} thresholds={umbrales} caption="" />);
    for (const [nombre, valor] of [['Revisar', '600 mm'], ['No cruzar', '850 mm'], ['Paso', '1000 mm']]) {
      expect(screen.getByText(nombre as string)).toBeTruthy();
      expect(screen.getByText(valor as string)).toBeTruthy();
    }
  });

  it('con Sin datos muestra "—" y "sin lectura vigente" en lugar de un nivel', () => {
    render(<LevelGauge levelMm={null} thresholds={umbrales} caption="El último nivel conocido (480 mm a las 11:30) no se usa para decidir." />);
    expect(screen.getByText('—')).toBeTruthy();
    expect(screen.getByText('sin lectura vigente')).toBeTruthy();
    expect(screen.queryByText(/de 1000 mm del paso/)).toBeNull();
  });

  it('muestra un decimal solo cuando hace falta', () => {
    render(<LevelGauge levelMm={417.3} thresholds={umbrales} caption="" />);
    expect(screen.getByText('417.3 mm')).toBeTruthy();
  });

  it('expone el nivel como medidor accesible', () => {
    render(<LevelGauge levelMm={420} thresholds={umbrales} caption="" />);
    const medidor = screen.getByRole('meter');
    expect(medidor.getAttribute('aria-valuenow')).toBe('420');
    expect(medidor.getAttribute('aria-valuemin')).toBe('0');
  });
});
