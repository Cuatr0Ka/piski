import { describe, expect, it } from 'vitest';
import { themes } from '../../src/core/tokens/tokens';
import type { ColorToken, ThemeName } from '../../src/core/tokens/tokens';

// Contraste WCAG 2.x entre los tokens de color. Las cifras mínimas son las de las tablas de
// docs/design-system-panel.md: el texto cumple 4.5:1 y los bordes e íconos con significado, 3:1.

function luminancia(hex: string): number {
  const canal = (i: number) => {
    const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(0) + 0.7152 * canal(1) + 0.0722 * canal(2);
}

function contraste(a: string, b: string): number {
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x) as [number, number];
  return (claro + 0.05) / (oscuro + 0.05);
}

const ratio = (tema: ThemeName, texto: ColorToken, fondo: ColorToken) =>
  contraste(themes[tema][texto], themes[tema][fondo]);

const SUPERFICIES: ColorToken[] = ['surface', 'surface-raised', 'surface-sunken'];

describe('Contraste del tema claro (el tema base del panel)', () => {
  it('el texto principal y el secundario cumplen 4.5:1 sobre las tres superficies', () => {
    for (const s of SUPERFICIES) {
      expect(ratio('light', 'ink', s), `ink sobre ${s}`).toBeGreaterThanOrEqual(14.3);
      expect(ratio('light', 'ink-muted', s), `ink-muted sobre ${s}`).toBeGreaterThanOrEqual(6.2 - 0.05);
    }
  });

  it('el acento cumple 4.5:1 como texto sobre las superficies y sobre accent-soft', () => {
    for (const s of [...SUPERFICIES, 'accent-soft' as ColorToken]) {
      expect(ratio('light', 'accent', s), `accent sobre ${s}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('el texto sobre el acento cumple 4.5:1', () => {
    for (const f of ['accent', 'accent-strong'] as ColorToken[]) {
      expect(ratio('light', 'on-accent', f), `on-accent sobre ${f}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('el texto de estado cumple 4.5:1 sobre las superficies y sobre su fondo suave', () => {
    const pares: Array<[ColorToken, ColorToken]> = [
      ['ok-text', 'ok-soft'],
      ['warn-text', 'warn-soft'],
      ['stop-text', 'stop-soft'],
    ];
    for (const t of ['ok-text', 'warn-text', 'stop-text'] as ColorToken[]) {
      for (const s of SUPERFICIES) expect(ratio('light', t, s), `${t} sobre ${s}`).toBeGreaterThanOrEqual(4.5);
    }
    for (const [t, f] of pares) expect(ratio('light', t, f), `${t} sobre ${f}`).toBeGreaterThanOrEqual(4.5);
  });

  it('el texto sobre los rellenos de estado (state-ink) cumple 4.5:1', () => {
    for (const f of ['ok-fill', 'warn-fill', 'stop-fill'] as ColorToken[]) {
      expect(ratio('light', 'state-ink', f), `state-ink sobre ${f}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('los bordes ink de tarjetas y controles cumplen 3:1 sobre todas las superficies y sobre los rellenos de estado', () => {
    for (const s of [...SUPERFICIES, 'ok-fill', 'warn-fill', 'stop-fill', 'accent-soft'] as ColorToken[]) {
      expect(ratio('light', 'ink', s), `ink sobre ${s}`).toBeGreaterThanOrEqual(3);
    }
  });

  it('el anillo de foco (accent) y el borde discontinuo (border-strong) se ven sobre las superficies (3:1)', () => {
    for (const s of SUPERFICIES) {
      expect(ratio('light', 'accent', s), `accent sobre ${s}`).toBeGreaterThanOrEqual(3);
      expect(ratio('light', 'border-strong', s), `border-strong sobre ${s}`).toBeGreaterThanOrEqual(3);
    }
  });

  it('los colores de umbral de la gráfica (texto de estado e ink-muted) se leen sobre la tarjeta', () => {
    for (const t of ['warn-text', 'stop-text', 'ink-muted'] as ColorToken[]) {
      expect(ratio('light', t, 'surface-raised'), `${t} sobre surface-raised`).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('Contraste del tema oscuro (opción de la persona; auditoría completa fuera del MVP)', () => {
  it('el texto principal, el secundario y el acento cumplen 4.5:1 sobre las superficies', () => {
    for (const s of SUPERFICIES) {
      for (const t of ['ink', 'ink-muted', 'accent'] as ColorToken[]) {
        expect(ratio('dark', t, s), `${t} sobre ${s}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('el texto de estado cumple 4.5:1, con la excepción documentada de stop-text sobre surface-sunken', () => {
    for (const t of ['ok-text', 'warn-text', 'stop-text'] as ColorToken[]) {
      for (const s of SUPERFICIES) {
        if (t === 'stop-text' && s === 'surface-sunken') continue; // 4.48:1; ahí se usa ink con el ícono en rojo
        expect(ratio('dark', t, s), `${t} sobre ${s}`).toBeGreaterThanOrEqual(4.5);
      }
    }
    expect(ratio('dark', 'stop-text', 'surface-sunken')).toBeGreaterThan(4.4);
    expect(ratio('dark', 'stop-text', 'surface-sunken')).toBeLessThan(4.5);
  });

  it('el texto sobre el acento y sobre los rellenos de estado cumple 4.5:1', () => {
    expect(ratio('dark', 'on-accent', 'accent')).toBeGreaterThanOrEqual(4.5);
    for (const f of ['ok-fill', 'warn-fill', 'stop-fill'] as ColorToken[]) {
      expect(ratio('dark', 'state-ink', f), `state-ink sobre ${f}`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
