import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../../src/app/App';

describe('Aplicación: carga y errores', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('muestra "Cargando datos…" y luego Estado actual del escenario por omisión', async () => {
    render(<App />);
    expect(screen.getByText('Cargando datos…')).toBeTruthy();
    expect(await screen.findByRole('heading', { name: 'Estado actual' })).toBeTruthy();
    expect(screen.getByText('Normal')).toBeTruthy();
  });

  it('la franja de datos simulados y el selector están siempre a la vista', async () => {
    render(<App />);
    expect(await screen.findByText('Datos simulados')).toBeTruthy();
    expect(screen.getByLabelText('Escenario de ejemplo')).toBeTruthy();
  });

  it('cambiar de escenario con el selector actualiza la pantalla sin recargar', async () => {
    (window as unknown as { marca?: string }).marca = 'sigue-aqui';
    render(<App />);
    await screen.findByText('Paso seguro');

    fireEvent.change(screen.getByLabelText('Escenario de ejemplo'), { target: { value: 'ciclon-no-cruzar' } });

    expect(await screen.findByText('No cruces')).toBeTruthy();
    await waitFor(() => expect(window.location.hash).toContain('e=ciclon-no-cruzar'));
    expect(screen.queryByText('Paso seguro')).toBeNull();
    expect(screen.getByText('Datos simulados')).toBeTruthy(); // sigue visible con el nuevo escenario
    expect((window as unknown as { marca?: string }).marca).toBe('sigue-aqui'); // no se recargó
  });

  it('el selector ofrece los 13 escenarios en dos grupos', async () => {
    const { container } = render(<App />);
    await screen.findByText('Datos simulados');
    expect(container.querySelectorAll('select option')).toHaveLength(13);
    expect(container.querySelectorAll('select optgroup')).toHaveLength(2);
  });

  it('la barra de navegación lleva a Pronóstico y de vuelta, conservando el escenario y sin recargar', async () => {
    window.location.hash = '#/estado?e=ciclon-revisar';
    (window as unknown as { marca?: string }).marca = 'sigue-aqui';
    render(<App />);
    await screen.findByText('Revisa el paso antes de cruzar');

    fireEvent.click(screen.getByRole('link', { name: /Pronóstico/ }));
    expect(await screen.findByRole('heading', { name: 'Pronóstico de creciente' })).toBeTruthy();
    expect(window.location.hash).toBe('#/pronostico?e=ciclon-revisar');
    expect(screen.getByRole('link', { name: /Pronóstico/ }).getAttribute('aria-current')).toBe('page');
    expect((screen.getByLabelText('Escenario de ejemplo') as HTMLSelectElement).value).toBe('ciclon-revisar');

    fireEvent.click(screen.getByRole('link', { name: /Estado actual/ }));
    expect(await screen.findByRole('heading', { name: 'Estado actual' })).toBeTruthy();
    expect((window as unknown as { marca?: string }).marca).toBe('sigue-aqui');
  });

  it('cada pantalla indica su rol en la barra de navegación', async () => {
    render(<App />);
    await screen.findByRole('heading', { name: 'Estado actual' });
    const nav = screen.getByRole('navigation', { name: 'Pantallas' });
    expect(nav.textContent).toContain('Para: encargado del comité');
    expect(nav.textContent).toContain('Para: comité');
  });

  it('un escenario inexistente muestra un error accionable sin trazas', async () => {
    window.location.hash = '#/estado?e=no-existe';
    render(<App />);
    const aviso = await screen.findByText(/No existe el escenario "no-existe"/);
    expect(aviso.textContent).toContain('Elige otro en el selector');
    expect(aviso.textContent).not.toMatch(/Error:|at \S+:\d+|stack/i);
  });
});
