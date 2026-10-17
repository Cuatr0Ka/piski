import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NoForecastCard } from '../../src/ui/components/NoForecastCard';

const props = {
  title: 'Sin pronóstico de creciente',
  reason: 'El nivel está bajando (−20.0 mm/h).',
  action: 'No hay aviso de creciente. Sigue vigilando el arroyo.',
  lines: [
    { label: 'Nivel actual', value: '450 mm' },
    { label: 'Ritmo actual', value: '−20.0 mm/h' },
    { label: 'Última lectura', value: 'hace 3 min' },
  ],
};

describe('NoForecastCard', () => {
  it('muestra el título, la razón y qué hacer', () => {
    render(<NoForecastCard {...props} />);
    expect(screen.getByText('Sin pronóstico de creciente')).toBeTruthy();
    expect(screen.getByText('El nivel está bajando (−20.0 mm/h).')).toBeTruthy();
    expect(screen.getByText('No hay aviso de creciente. Sigue vigilando el arroyo.')).toBeTruthy();
  });

  it('el título es lo más grande de la tarjeta, como la frase de conclusión', () => {
    render(<NoForecastCard {...props} />);
    expect(screen.getByText(props.title).className).toContain('type-value-xl');
  });

  it('usa un tono neutro con ícono de información, no el de un error ni el de un estado', () => {
    const { container } = render(<NoForecastCard {...props} />);
    const tarjeta = container.firstElementChild as HTMLElement;
    expect(tarjeta.className).toContain('neutra');
    expect(container.querySelector('svg')).not.toBeNull();
    expect(tarjeta.className).not.toMatch(/stop|review|normal/);
  });

  it('muestra el nivel, el ritmo y la antigüedad del dato', () => {
    render(<NoForecastCard {...props} />);
    expect(screen.getByText('Nivel actual')).toBeTruthy();
    expect(screen.getByText('450 mm')).toBeTruthy();
    expect(screen.getByText('−20.0 mm/h')).toBeTruthy();
    expect(screen.getByText('hace 3 min')).toBeTruthy();
  });

  it('no muestra tiempos hasta un umbral ni una proyección', () => {
    const { container } = render(<NoForecastCard {...props} />);
    expect(container.textContent).not.toMatch(/entre .* h|a partir de|Podría llegar|Proyección, no medición/);
  });
});
