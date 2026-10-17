import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Splash } from '../../src/ui';

describe('Pantalla de bienvenida', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('muestra el logo y el nombre al abrir', () => {
    render(<Splash />);
    expect(screen.getByRole('img', { name: /Logo de Piski/ })).toBeTruthy();
    expect(screen.getByText('Piski')).toBeTruthy();
    expect(screen.getByText('Panel de monitoreo')).toBeTruthy();
  });

  it('se desvanece y desaparece sola', () => {
    render(<Splash visibleMs={1000} fadeMs={300} />);
    expect(screen.getByTestId('splash').className).not.toContain('saliendo');
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByTestId('splash').className).toContain('saliendo');
    act(() => vi.advanceTimersByTime(300));
    expect(screen.queryByTestId('splash')).toBeNull();
  });

  it('se cierra con un clic o con una tecla sin esperar', () => {
    const { unmount } = render(<Splash visibleMs={5000} fadeMs={100} />);
    fireEvent.click(screen.getByTestId('splash'));
    expect(screen.getByTestId('splash').className).toContain('saliendo');
    unmount();

    render(<Splash visibleMs={5000} fadeMs={100} />);
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(screen.getByTestId('splash').className).toContain('saliendo');
    act(() => vi.advanceTimersByTime(100));
    expect(screen.queryByTestId('splash')).toBeNull();
  });
});
