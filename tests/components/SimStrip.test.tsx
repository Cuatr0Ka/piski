import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SimStrip } from '../../src/app/SimStrip';

const entradas = {
  demo: [
    { id: 'tormenta-normal', name: 'Tormenta normal', description: 'x', group: 'demo' as const },
    { id: 'ciclon-inicio', name: 'Ciclón: inicio de la creciente', description: 'x', group: 'demo' as const },
  ],
  test: [{ id: 'nivel-plano', name: 'Prueba: nivel plano', description: 'x', group: 'test' as const }],
};

describe('Franja de datos simulados', () => {
  it('muestra siempre "Datos simulados" y que no son lecturas reales', () => {
    render(<SimStrip assumed={false} entries={entradas} value="tormenta-normal" onChange={() => {}} />);
    expect(screen.getByText('Datos simulados')).toBeTruthy();
    expect(screen.getByText(/No son lecturas reales del arroyo/)).toBeTruthy();
  });

  it('indica que los umbrales de ejemplo son provisionales solo cuando la configuración es un supuesto', () => {
    const { rerender } = render(<SimStrip assumed entries={entradas} value="tormenta-normal" onChange={() => {}} />);
    expect(screen.getByText(/Los umbrales de ejemplo son provisionales/)).toBeTruthy();
    rerender(<SimStrip assumed={false} entries={entradas} value="tormenta-normal" onChange={() => {}} />);
    expect(screen.queryByText(/Los umbrales de ejemplo son provisionales/)).toBeNull();
  });

  it('ofrece el selector "Escenario de ejemplo" con los grupos Demostración y Casos de prueba', () => {
    const { container } = render(
      <SimStrip assumed entries={entradas} value="tormenta-normal" onChange={() => {}} />,
    );
    const selector = screen.getByLabelText('Escenario de ejemplo') as HTMLSelectElement;
    expect(selector.value).toBe('tormenta-normal');
    const grupos = [...container.querySelectorAll('optgroup')].map((g) => g.getAttribute('label'));
    expect(grupos).toEqual(['Demostración', 'Casos de prueba']);
    expect([...selector.options].map((o) => o.value)).toEqual(['tormenta-normal', 'ciclon-inicio', 'nivel-plano']);
  });

  it('al elegir otro escenario avisa su id (sin recargar la página)', () => {
    const alCambiar = vi.fn();
    render(<SimStrip assumed entries={entradas} value="tormenta-normal" onChange={alCambiar} />);
    fireEvent.change(screen.getByLabelText('Escenario de ejemplo'), { target: { value: 'ciclon-inicio' } });
    expect(alCambiar).toHaveBeenCalledWith('ciclon-inicio');
  });
});
