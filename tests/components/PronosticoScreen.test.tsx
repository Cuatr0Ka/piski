import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DataProvider } from '../../src/core/data';
import { PronosticoScreen } from '../../src/features/pronostico';

function mostrar(escenario: string) {
  return render(
    <DataProvider scenarioId={escenario}>
      <PronosticoScreen />
    </DataProvider>,
  );
}

describe('Pantalla Pronóstico con los escenarios de ejemplo', () => {
  it('muestra el título y su rol', async () => {
    mostrar('ciclon-inicio');
    expect(await screen.findByRole('heading', { name: 'Pronóstico de creciente' })).toBeTruthy();
    expect(screen.getByText('Para: comité')).toBeTruthy();
  });

  it('ciclon-inicio: la conclusión va primero, con el rango, el nivel actual, el ritmo y la antigüedad', async () => {
    const { container } = mostrar('ciclon-inicio');
    expect(await screen.findByText('Podría llegar a Revisar entre 2.5 y 3.5 h')).toBeTruthy();
    expect(screen.getByText('No se proyecta en las próximas 6 h')).toBeTruthy();
    expect(screen.getAllByText('420 mm').length).toBeGreaterThanOrEqual(1); // también aparece en la tabla alternativa
    expect(screen.getByText('+60.0 mm/h')).toBeTruthy();
    expect(screen.getByText('entre +51.0 y +69.0 mm/h')).toBeTruthy();
    expect(screen.getByText('entre 576 y 630 mm en 3 h')).toBeTruthy();
    expect(screen.getByText('hace 3 min')).toBeTruthy();
    // La conclusión aparece antes que la gráfica.
    const texto = container.textContent ?? '';
    expect(texto.indexOf('Podría llegar a Revisar')).toBeLessThan(texto.indexOf('Nivel y proyección'));
  });

  it('con proyección muestra la lluvia de la última hora junto a las demás cifras', async () => {
    mostrar('ciclon-inicio');
    await screen.findByText(/Podría llegar a Revisar/);
    expect(screen.getByText('Lluvia en la última hora')).toBeTruthy();
  });

  it('con proyección muestra la nota "Proyección, no medición" y el aviso de lluvia', async () => {
    mostrar('ciclon-inicio');
    await screen.findByText(/Podría llegar a Revisar/);
    expect(screen.getByText('Proyección, no medición')).toBeTruthy();
    expect(screen.getAllByText(/Una lluvia intensa puede acelerar la subida/).length).toBeGreaterThanOrEqual(1);
  });

  it('muestra la gráfica con la etiqueta "Datos simulados" y el resumen de "Cómo se calcula" con "Supuesto"', async () => {
    mostrar('ciclon-inicio');
    await screen.findByText(/Podría llegar a Revisar/);
    expect(screen.getByText('Datos simulados')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Cómo se calcula' })).toBeTruthy();
    expect(screen.getByText('Supuesto')).toBeTruthy();
    expect(screen.getByText(/Se extrapola el ritmo de subida de las últimas 2 h/)).toBeTruthy();
    expect(screen.getByText(/no un modelo hidrológico validado/)).toBeTruthy();
  });

  it('ciclon-revisar: "Ya superó Revisar" y No cruzar en un rango', async () => {
    mostrar('ciclon-revisar');
    expect(await screen.findByText('Ya superó Revisar. Podría llegar a No cruzar entre 2 y 3.5 h')).toBeTruthy();
    expect(screen.getByText('ya superado')).toBeTruthy();
  });

  it('ciclon-no-cruzar: "Ya superó No cruzar"', async () => {
    mostrar('ciclon-no-cruzar');
    expect(await screen.findByText('Ya superó No cruzar')).toBeTruthy();
  });

  it('estiaje: "Sin pronóstico de creciente" con la razón y qué hacer, sin tiempos hasta un umbral', async () => {
    const { container } = mostrar('estiaje');
    expect(await screen.findByText('Sin pronóstico de creciente')).toBeTruthy();
    expect(screen.getByText(/El nivel está bajando \(−\d\.\d mm\/h\)\./)).toBeTruthy();
    expect(screen.getByText('No hay aviso de creciente. Sigue vigilando el arroyo.')).toBeTruthy();
    expect(container.textContent).not.toMatch(/Podría llegar|a partir de|Proyección, no medición/);
    expect(screen.getByRole('heading', { name: 'Nivel' })).toBeTruthy(); // gráfica sin proyección
  });

  it('tormenta-normal: nivel estable, sin pronóstico de creciente', async () => {
    mostrar('tormenta-normal');
    expect(await screen.findByText('Sin pronóstico de creciente')).toBeTruthy();
    expect(screen.getByText('El nivel está estable.')).toBeTruthy();
  });

  it('pocas-lecturas: "hacen falta más lecturas" con cuántas hay y cuántas se necesitan', async () => {
    mostrar('pocas-lecturas');
    expect(await screen.findByText('Sin pronóstico: hacen falta más lecturas')).toBeTruthy();
    expect(screen.getByText('Hay 3 lecturas y se necesitan al menos 6 para calcular el ritmo.')).toBeTruthy();
    expect(screen.getByText('Espera unos minutos. Mientras tanto, usa Estado actual.')).toBeTruthy();
  });

  it('lecturas-viejas: "datos viejos" con el último nivel conocido y su antigüedad, sin proyectar', async () => {
    const { container } = mostrar('lecturas-viejas');
    expect(await screen.findByText('Sin pronóstico: datos viejos')).toBeTruthy();
    expect(screen.getByText('La última lectura es de las 11:30, hace 3 h.')).toBeTruthy();
    expect(screen.getByText('No uses esta proyección. Revisa el arroyo en persona.')).toBeTruthy();
    expect(screen.getByText('Último nivel conocido')).toBeTruthy();
    expect(screen.getAllByText('480 mm').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Sin lecturas desde las 11:30')).toBeTruthy();
    expect(container.textContent).not.toMatch(/Podría llegar|Proyección, no medición/);
  });

  it('siempre muestra "Cómo se calcula" con su texto, incluso sin pronóstico', async () => {
    mostrar('pocas-lecturas');
    await screen.findByText(/Sin pronóstico/);
    expect(screen.getByRole('heading', { name: 'Cómo se calcula' })).toBeTruthy();
    expect(screen.getByText(/Se extrapola el ritmo de subida/)).toBeTruthy();
  });
});
