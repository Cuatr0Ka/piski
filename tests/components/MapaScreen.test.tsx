import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../../src/app/App';

async function abrirMapa(escenario: string) {
  window.location.hash = `#/mapa?e=${escenario}`;
  render(<App />);
  return screen.findByRole('heading', { name: 'Mapa de balizas' });
}

describe('Pantalla Mapa de balizas', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('aparece en la navegación lateral con su rol', async () => {
    await abrirMapa('ciclon-revisar');
    const enlace = screen.getByRole('link', { name: /Mapa/ });
    expect(enlace.getAttribute('aria-current')).toBe('page');
    expect(enlace.textContent).toContain('Para: comité');
  });

  it('muestra el mapa con texto alternativo y las balizas como botones con su estado', async () => {
    await abrirMapa('ciclon-revisar');
    expect(screen.getByRole('img', { name: /Huauchinango y Xicotepec de Juárez/ })).toBeTruthy();
    const botones = screen.getAllByRole('button', { name: /Baliza .*: (Normal|Revisar|No cruzar|Sin datos)/ });
    expect(botones.length).toBeGreaterThanOrEqual(3);
  });

  it('la lista de balizas muestra el estado en palabras y el nivel en mm', async () => {
    await abrirMapa('ciclon-revisar');
    expect(screen.getByText('660 mm')).toBeTruthy(); // baliza con factor 1 = nivel del escenario
    expect(screen.getAllByText('Revisar').length).toBeGreaterThanOrEqual(1);
  });

  it('elegir una baliza la resalta en el mapa y en la lista', async () => {
    await abrirMapa('ciclon-revisar');
    const lista = screen
      .getAllByRole('button', { name: /Baliza La Morena \(aguas arriba\)/ })
      .find((b) => b.textContent?.includes('Huauchinango'))!;
    fireEvent.click(lista);
    await waitFor(() => expect(lista.getAttribute('aria-pressed')).toBe('true'));
    const enMapa = screen.getByRole('button', { name: 'Baliza La Morena (aguas arriba): Normal' });
    expect(enMapa.getAttribute('aria-pressed')).toBe('true');
  });

  it('avisa que las balizas son de ejemplo y atribuye las fuentes', async () => {
    await abrirMapa('tormenta-normal');
    expect(screen.getByText(/Las balizas del mapa son de ejemplo/)).toBeTruthy();
    expect(screen.getByText(/INEGI/)).toBeTruthy();
  });

  it('con Sin datos ninguna baliza muestra un nivel', async () => {
    await abrirMapa('lecturas-viejas');
    expect(screen.getAllByText('Sin lectura vigente').length).toBeGreaterThanOrEqual(3);
  });
});
