import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBanner } from '../../src/ui/components/StatusBanner';

describe('StatusBanner', () => {
  const casos = [
    { kind: 'normal', palabra: 'Normal', corto: 'Paso seguro', forma: 'Círculo' },
    { kind: 'review', palabra: 'Revisar', corto: 'Revisa el paso antes de cruzar', forma: 'Triángulo' },
    { kind: 'stop', palabra: 'No cruzar', corto: 'No cruces', forma: 'Octágono' },
  ] as const;

  for (const c of casos) {
    it(`muestra ${c.palabra} con su palabra, mensaje corto y forma (${c.forma})`, () => {
      render(<StatusBanner kind={c.kind} />);
      expect(screen.getByText(c.palabra)).toBeTruthy();
      expect(screen.getByText(c.corto)).toBeTruthy();
      expect(screen.getByRole('img', { name: c.forma })).toBeTruthy();
    });
  }

  it('Sin datos muestra el rombo y "Sin lecturas desde las HH:MM"', () => {
    render(<StatusBanner kind="nodata" lastHour="11:30" />);
    expect(screen.getByText('Sin datos')).toBeTruthy();
    expect(screen.getByText('Sin lecturas desde las 11:30')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Rombo' })).toBeTruthy();
  });

  it('Sin datos sin ninguna lectura dice "Sin lecturas"', () => {
    render(<StatusBanner kind="nodata" />);
    expect(screen.getByText('Sin lecturas')).toBeTruthy();
  });

  it('se anuncia a lectores de pantalla con role="status"', () => {
    render(<StatusBanner kind="review" />);
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('Sin datos va con borde discontinuo y sin sombra, y nunca con el color Normal', () => {
    const { container } = render(<StatusBanner kind="nodata" />);
    const bloque = container.firstElementChild as HTMLElement;
    expect(bloque.className).toContain('nodata');
    expect(bloque.className).not.toContain('normal');
  });
});
