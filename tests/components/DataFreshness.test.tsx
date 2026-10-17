import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DataFreshness } from '../../src/ui/components/DataFreshness';

describe('DataFreshness', () => {
  it('muestra "Última lectura hace X min" con la fecha y la hora', () => {
    render(<DataFreshness value="Última lectura hace 3 min" detail="15 oct, 14:27" />);
    expect(screen.getByText('Antigüedad del dato')).toBeTruthy();
    expect(screen.getByText('Última lectura hace 3 min')).toBeTruthy();
    expect(screen.getByText('15 oct, 14:27')).toBeTruthy();
  });

  it('con datos viejos muestra "Sin lecturas desde las HH:MM" y "hace 3 h"', () => {
    render(<DataFreshness value="Sin lecturas desde las 11:30" detail="hace 3 h · 15 oct, 11:30" />);
    expect(screen.getByText('Sin lecturas desde las 11:30')).toBeTruthy();
    expect(screen.getByText('hace 3 h · 15 oct, 11:30')).toBeTruthy();
  });
});
