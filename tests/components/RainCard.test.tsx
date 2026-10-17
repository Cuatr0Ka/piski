import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RainCard } from '../../src/ui/components/RainCard';

describe('RainCard', () => {
  it('muestra una cifra grande en mm para la última hora y las demás ventanas debajo', () => {
    render(
      <RainCard
        main={{ value: '31.4 mm', caption: 'en la última hora' }}
        rows={[
          { label: 'Últimas 3 h', value: '78 mm' },
          { label: 'Últimas 6 h', value: '112.6 mm' },
        ]}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Lluvia' })).toBeTruthy();
    expect(screen.getByText('31.4 mm').className).toContain('type-value-xl');
    expect(screen.getByText('en la última hora')).toBeTruthy();
    expect(screen.getByText('Últimas 3 h')).toBeTruthy();
    expect(screen.getByText('78 mm')).toBeTruthy();
    expect(screen.getByText('Últimas 6 h')).toBeTruthy();
    expect(screen.getByText('112.6 mm')).toBeTruthy();
  });

  it('con un mensaje (Sin datos) no inventa cifras y explica que no se puede calcular', () => {
    render(
      <RainCard
        main={{ value: '0 mm', caption: 'en la última hora' }}
        rows={[{ label: 'Últimas 3 h', value: '0 mm' }]}
        message="Sin lecturas recientes: no se puede calcular la lluvia."
      />,
    );
    expect(screen.getByText('Sin lecturas recientes: no se puede calcular la lluvia.')).toBeTruthy();
    expect(screen.queryByText('0 mm')).toBeNull();
    expect(screen.queryByText('Últimas 3 h')).toBeNull();
  });

  it('sin cifra principal también muestra el mensaje de que no hay datos', () => {
    render(<RainCard main={null} rows={[]} />);
    expect(screen.getByText(/no se puede calcular la lluvia/)).toBeTruthy();
  });
});
