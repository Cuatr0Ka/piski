import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button, Card, Select, SimulatedBadge } from '../../src/ui';

describe('Componentes base de interfaz', () => {
  it('Button es un botón real que se activa con clic y se puede enfocar con teclado', () => {
    const alClic = vi.fn();
    render(<Button variant="primary" onClick={alClic}>Copiar mensaje</Button>);
    const boton = screen.getByRole('button', { name: 'Copiar mensaje' });
    boton.focus();
    expect(document.activeElement).toBe(boton);
    fireEvent.click(boton);
    expect(alClic).toHaveBeenCalledTimes(1);
    expect(boton.getAttribute('type')).toBe('button');
  });

  it('Button deshabilitado no ejecuta la acción', () => {
    const alClic = vi.fn();
    render(<Button disabled onClick={alClic}>No disponible</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'No disponible' }));
    expect(alClic).not.toHaveBeenCalled();
  });

  it('Select tiene etiqueta visible, grupos y avisa del cambio de valor', () => {
    const alCambiar = vi.fn();
    const { container } = render(
      <Select
        label="Escenario de ejemplo"
        value="a"
        onChange={alCambiar}
        groups={[
          { label: 'Demostración', options: [{ value: 'a', label: 'Uno' }] },
          { label: 'Casos de prueba', options: [{ value: 'b', label: 'Dos' }] },
        ]}
      />,
    );
    const combo = screen.getByLabelText('Escenario de ejemplo');
    expect(container.querySelectorAll('optgroup')).toHaveLength(2);
    fireEvent.change(combo, { target: { value: 'b' } });
    expect(alCambiar).toHaveBeenCalledWith('b');
  });

  it('SimulatedBadge muestra "Datos simulados"', () => {
    render(<SimulatedBadge />);
    expect(screen.getByText('Datos simulados')).toBeTruthy();
  });

  it('Card nombra su contenido para lectores de pantalla', () => {
    render(
      <Card labelledBy="titulo">
        <h2 id="titulo">Título</h2>
      </Card>,
    );
    expect(screen.getByRole('region', { name: 'Título' })).toBeTruthy();
  });
});
