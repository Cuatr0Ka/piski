import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ForecastChart } from '../../src/ui/components/ForecastChart';
import type { ChartReading, ChartThreshold } from '../../src/ui/components/ForecastChart';

const lecturas: ChartReading[] = Array.from({ length: 25 }, (_, i) => ({ hours: -6 + i * 0.25, level: 45 }));
const umbrales: ChartThreshold[] = [
  { label: 'Revisar: 600 mm', valueMm: 60, tone: 'review' },
  { label: 'No cruzar: 850 mm', valueMm: 85, tone: 'stop' },
  { label: 'Paso: 1000 mm', valueMm: 100, tone: 'crossing' },
];

function sinProyeccion() {
  return render(
    <ForecastChart
      title="Nivel"
      subtitle="Últimas 6 h · nivel en mm"
      readings={lecturas}
      thresholds={umbrales}
      maxMm={125}
      simulated
      table={[{ hora: 'Ahora mismo', nivel: '450 mm', origen: 'Medido' }]}
    />,
  );
}

describe('ForecastChart sin proyección (ancho completo)', () => {
  it('usa todo el ancho para las últimas 6 h: el eje termina en "ahora" y no hay marcas futuras', () => {
    const { container } = sinProyeccion();
    expect(screen.getByText('−6 h')).toBeTruthy();
    expect(screen.getByText('−1 h')).toBeTruthy();
    expect(screen.getByText('ahora')).toBeTruthy();
    expect(screen.queryByText('+2 h')).toBeNull();
    expect(screen.queryByText('+6 h')).toBeNull();
    // "ahora" cae en el extremo derecho del área de dibujo (800 − 24 de margen).
    const ahora = [...container.querySelectorAll('text')].find((t) => t.textContent === 'ahora');
    expect(Number(ahora?.getAttribute('x'))).toBeCloseTo(776, 0);
  });

  it('no dibuja banda ni proyección, y la leyenda solo explica el nivel real', () => {
    const { container } = sinProyeccion();
    expect(container.querySelector('polygon[data-serie="banda"]')).toBeNull();
    expect(container.querySelector('polyline[data-serie="proyeccion"]')).toBeNull();
    expect(screen.getByText('Nivel real')).toBeTruthy();
    expect(screen.queryByText('Banda de incertidumbre')).toBeNull();
  });

  it('conserva las líneas de umbral, la etiqueta de datos simulados y el título "Nivel"', () => {
    sinProyeccion();
    expect(screen.getByRole('heading', { name: 'Nivel' })).toBeTruthy();
    expect(screen.getByText('Datos simulados')).toBeTruthy();
    expect(screen.getByText('Revisar: 600 mm')).toBeTruthy();
    expect(screen.getByText('Paso: 1000 mm')).toBeTruthy();
  });
});
