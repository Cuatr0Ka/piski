import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ForecastChart } from '../../src/ui/components/ForecastChart';
import type { ChartProjection, ChartReading, ChartThreshold } from '../../src/ui/components/ForecastChart';

// 25 lecturas cada 15 min en las últimas 6 h, subiendo de 14 a 420 mm.
const lecturas: ChartReading[] = Array.from({ length: 25 }, (_, i) => ({
  hours: -6 + i * 0.25,
  level: 14 + i * (28 / 24),
}));
const umbrales: ChartThreshold[] = [
  { label: 'Revisar: 600 mm', valueMm: 60, tone: 'review' },
  { label: 'No cruzar: 850 mm', valueMm: 85, tone: 'stop' },
  { label: 'Paso: 1000 mm', valueMm: 100, tone: 'crossing' },
];
const proyeccion: ChartProjection = {
  horizonH: 6,
  band: Array.from({ length: 13 }, (_, i) => ({
    h: i * 0.5,
    lowMm: 42 + 5.1 * i * 0.5,
    midMm: 42 + 6 * i * 0.5,
    highMm: 42 + 6.9 * i * 0.5,
  })),
};
// Textos distintos a los del eje para poder buscarlos sin ambigüedad.
const tabla = [
  { hora: 'hace 6 horas', nivel: '140 mm', origen: 'Medido' },
  { hora: 'Ahora mismo', nivel: '420 mm', origen: 'Medido' },
  { hora: 'dentro de 2 horas', nivel: 'entre 520 y 560 mm', origen: 'Estimado' },
];

function dibujar(conProyeccion: boolean) {
  return render(
    <ForecastChart
      title={conProyeccion ? 'Nivel y proyección' : 'Nivel'}
      subtitle={conProyeccion ? 'Últimas 6 h y próximas 6 h · nivel en mm' : 'Últimas 6 h · nivel en mm'}
      readings={lecturas}
      thresholds={umbrales}
      maxMm={125}
      simulated
      table={tabla}
      {...(conProyeccion ? { projection: proyeccion } : {})}
    />,
  );
}

describe('ForecastChart con proyección', () => {
  it('muestra título, periodo y unidad, y la etiqueta "Datos simulados"', () => {
    dibujar(true);
    expect(screen.getByRole('heading', { name: 'Nivel y proyección' })).toBeTruthy();
    expect(screen.getByText('Últimas 6 h y próximas 6 h · nivel en mm')).toBeTruthy();
    expect(screen.getByText('Datos simulados')).toBeTruthy();
  });

  it('dibuja el nivel real, la proyección discontinua y la banda de incertidumbre de relleno sólido', () => {
    const { container } = dibujar(true);
    const real = container.querySelector('polyline[data-serie="real"]');
    const proy = container.querySelector('polyline[data-serie="proyeccion"]');
    const banda = container.querySelector('polygon[data-serie="banda"]');
    expect(real).not.toBeNull();
    expect(proy?.getAttribute('stroke-dasharray')).toBeTruthy();
    expect(banda?.getAttribute('fill')).toBe('var(--accent-soft)');
    expect(real?.getAttribute('stroke-width')).toBe('2'); // stroke-chart
  });

  it('dibuja las líneas de umbral con su etiqueta y el color de su estado', () => {
    const { container } = dibujar(true);
    expect(screen.getByText('Revisar: 600 mm')).toBeTruthy();
    expect(screen.getByText('No cruzar: 850 mm')).toBeTruthy();
    expect(screen.getByText('Paso: 1000 mm')).toBeTruthy();
    const colores = [...container.querySelectorAll('line[data-umbral]')].map((l) => [
      l.getAttribute('data-umbral'),
      l.getAttribute('stroke'),
    ]);
    expect(colores).toEqual([
      ['review', 'var(--warn-text)'],
      ['stop', 'var(--stop-text)'],
      ['crossing', 'var(--ink-muted)'],
    ]);
  });

  it('marca "ahora" y el eje horizontal con las horas pasadas y futuras', () => {
    dibujar(true);
    expect(screen.getByText('ahora')).toBeTruthy();
    expect(screen.getByText('−6 h')).toBeTruthy();
    expect(screen.getByText('+6 h')).toBeTruthy();
  });

  it('la leyenda explica las tres series', () => {
    dibujar(true);
    expect(screen.getByText('Nivel real')).toBeTruthy();
    expect(screen.getByText('Proyección')).toBeTruthy();
    expect(screen.getByText('Banda de incertidumbre')).toBeTruthy();
  });

  it('ofrece los datos como tabla para lectores de pantalla', () => {
    dibujar(true);
    expect(screen.getByText('Ver datos como tabla')).toBeTruthy();
    expect(screen.getByText('entre 520 y 560 mm')).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Hora' })).toBeTruthy();
  });

  it('la gráfica es una imagen accesible con descripción', () => {
    dibujar(true);
    expect(screen.getByRole('img', { name: /Gráfica del nivel del arroyo en milímetros/ })).toBeTruthy();
  });
});
