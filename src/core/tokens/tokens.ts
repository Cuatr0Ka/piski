// Única fuente de los tokens de diseño (docs/design-system-panel.md).
// Los tres colores de estado se definen una sola vez, aquí, y son iguales en ambos temas y en la baliza.

export const stateFills = {
  ok: '#2fd1a5',
  warn: '#f5b942',
  stop: '#ef5b5b',
} as const;

export type ThemeName = 'light' | 'dark';

export const themes = {
  light: {
    surface: '#F2F6FB',
    'surface-raised': '#FFFFFF',
    'surface-sunken': '#EDF3FA',
    border: '#DCE4EF',
    'border-strong': '#7A8AA0',
    ink: '#0F1B2D',
    'ink-muted': '#42526A',
    accent: '#0A63BE',
    'accent-strong': '#074F9C',
    'accent-soft': '#E2EFFD',
    'on-accent': '#FFFFFF',
    'ok-fill': stateFills.ok,
    'warn-fill': stateFills.warn,
    'stop-fill': stateFills.stop,
    'state-ink': '#0F1B2D',
    'ok-text': '#0B6B53',
    'warn-text': '#7A5200',
    'stop-text': '#B3261E',
    'ok-soft': '#D9F6EE',
    'warn-soft': '#FDEFCB',
    'stop-soft': '#FCE0E0',
  },
  dark: {
    surface: '#0B1220',
    'surface-raised': '#131C2E',
    'surface-sunken': '#1B2740',
    border: '#26334D',
    'border-strong': '#7D8CA6',
    ink: '#E8EEF7',
    'ink-muted': '#A3B1C6',
    accent: '#6EA2F0',
    'accent-strong': '#9BC0F7',
    'accent-soft': '#16294A',
    'on-accent': '#08162E',
    'ok-fill': stateFills.ok,
    'warn-fill': stateFills.warn,
    'stop-fill': stateFills.stop,
    'state-ink': '#0B1220',
    'ok-text': stateFills.ok,
    'warn-text': stateFills.warn,
    'stop-text': stateFills.stop,
    'ok-soft': '#0F3329',
    'warn-soft': '#3A2C0B',
    'stop-soft': '#3F1A1A',
  },
} as const;

export type ColorToken = keyof (typeof themes)['light'];

// Estilos tipográficos: tamaño y interlineado en px, y peso. Una sola familia (Inter).
export const typography = {
  'state-xl': { size: 64, line: 68, weight: 800 },
  'value-xl': { size: 40, line: 48, weight: 700 },
  'value-lg': { size: 28, line: 36, weight: 700 },
  'value-md': { size: 16, line: 24, weight: 700 },
  'title-lg': { size: 28, line: 36, weight: 700 },
  'title-md': { size: 20, line: 28, weight: 700 },
  body: { size: 16, line: 24, weight: 400 },
  'body-strong': { size: 16, line: 24, weight: 600 },
  label: { size: 14, line: 20, weight: 600 },
  caption: { size: 12, line: 16, weight: 500 },
} as const;

export type TypeStyle = keyof typeof typography;

export const fontFamily = "Inter, 'Segoe UI', system-ui, sans-serif";

export const space = {
  'space-1': 4,
  'space-2': 8,
  'space-3': 12,
  'space-4': 16,
  'space-5': 20,
  'space-6': 24,
  'space-8': 32,
  'space-10': 40,
} as const;

export const radius = {
  'radius-sm': 8,
  'radius-md': 12,
  'radius-lg': 20,
  'radius-pill': 999,
} as const;

export const strokes = {
  'stroke-base': 1,
  'stroke-divider': 1,
  'stroke-focus': 3,
  'stroke-chart': 2,
} as const;

export const sizes = {
  'control-min': 44,
  'control-lg': 56,
  'icon-md': 24,
  'icon-sm': 20,
  'shape-lg': 64,
  'sidebar-w': 264,
  'column-min': 360,
} as const;

export const motion = {
  'duration-fast': '120ms',
  'duration-base': '200ms',
  'ease-standard': 'cubic-bezier(0.2, 0, 0, 1)',
  'ease-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

// Sombras suaves de tarjeta (referencias de la interfaz profesional): difusas, tenues y sin color de estado.
export const shadows = {
  'shadow-sm': '0 1px 2px 0 rgba(15, 27, 45, 0.06)',
  'shadow-md': '0 6px 20px 0 rgba(15, 27, 45, 0.10)',
} as const;
