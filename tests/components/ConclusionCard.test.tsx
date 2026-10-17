import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConclusionCard } from '../../src/ui/components/ConclusionCard';

const props = {
  sentence: 'Podría llegar a Revisar entre 2.5 y 4 h',
  thresholds: [
    { label: 'Revisar (600 mm)', value: 'entre 2.5 y 4 h', shape: 'review' as const },
    { label: 'No cruzar (850 mm)', value: 'No se proyecta en las próximas 6 h', shape: 'stop' as const },
  ],
  facts: [
    { label: 'Nivel actual', value: '420 mm' },
    { label: 'Ritmo actual', value: '+60.0 mm/h', sub: 'entre +51.0 y +69.0 mm/h' },
    { label: 'Nivel proyectado', value: 'entre 570 y 630 mm en 3 h' },
    { label: 'Última lectura', value: 'hace 3 min' },
  ],
  note: 'Proyección, no medición',
  warning: 'Una lluvia intensa puede acelerar la subida y hacer que esta proyección se quede corta.',
};

describe('ConclusionCard', () => {
  it('muestra la frase de conclusión como lo más grande de la tarjeta, antes que las cifras', () => {
    const { container } = render(<ConclusionCard {...props} />);
    const frase = screen.getByText(props.sentence);
    expect(frase.className).toContain('type-value-xl');
    const textoTarjeta = container.textContent ?? '';
    expect(textoTarjeta.indexOf(props.sentence)).toBeLessThan(textoTarjeta.indexOf('Nivel actual'));
  });

  it('lleva la etiqueta "Conclusión"', () => {
    render(<ConclusionCard {...props} />);
    expect(screen.getByText('Conclusión')).toBeTruthy();
  });

  it('muestra un renglón por umbral con su forma de estado y su valor como rango o como "No se proyecta…"', () => {
    render(<ConclusionCard {...props} />);
    expect(screen.getByText('Revisar (600 mm)')).toBeTruthy();
    expect(screen.getByText('entre 2.5 y 4 h')).toBeTruthy();
    expect(screen.getByText('No cruzar (850 mm)')).toBeTruthy();
    expect(screen.getByText('No se proyecta en las próximas 6 h')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Triángulo' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Octágono' })).toBeTruthy();
  });

  it('muestra nivel actual, ritmo con su rango, nivel proyectado y antigüedad', () => {
    render(<ConclusionCard {...props} />);
    expect(screen.getByText('420 mm')).toBeTruthy();
    expect(screen.getByText('+60.0 mm/h')).toBeTruthy();
    expect(screen.getByText('entre +51.0 y +69.0 mm/h')).toBeTruthy();
    expect(screen.getByText('entre 570 y 630 mm en 3 h')).toBeTruthy();
    expect(screen.getByText('hace 3 min')).toBeTruthy();
  });

  it('incluye la nota "Proyección, no medición" y el aviso de lluvia', () => {
    render(<ConclusionCard {...props} />);
    expect(screen.getByText('Proyección, no medición')).toBeTruthy();
    expect(
      screen.getByText('Una lluvia intensa puede acelerar la subida y hacer que esta proyección se quede corta.'),
    ).toBeTruthy();
  });

  it('es el bloque principal de la pantalla: lleva la sombra sólida mediana', () => {
    const { container } = render(<ConclusionCard {...props} />);
    expect((container.firstElementChild as HTMLElement).className).toContain('main');
  });
});
