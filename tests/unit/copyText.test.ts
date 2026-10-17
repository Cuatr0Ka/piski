import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyText } from '../../src/core/utils/copyText';

type ConPortapapeles = { clipboard?: unknown };
const nav = navigator as unknown as ConPortapapeles;
const doc = document as unknown as { execCommand?: unknown };

describe('Copiar texto', () => {
  afterEach(() => {
    delete nav.clipboard;
    delete doc.execCommand;
    vi.restoreAllMocks();
  });

  it('usa el portapapeles del navegador cuando está disponible', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    nav.clipboard = { writeText };
    expect(await copyText('Hola')).toBe(true);
    expect(writeText).toHaveBeenCalledWith('Hola');
  });

  it('si el portapapeles falla, usa el respaldo por selección y execCommand', async () => {
    nav.clipboard = { writeText: vi.fn().mockRejectedValue(new Error('denegado')) };
    const execCommand = vi.fn().mockReturnValue(true);
    doc.execCommand = execCommand;
    expect(await copyText('Hola')).toBe(true);
    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(document.querySelector('textarea')).toBeNull(); // el área temporal se limpia
  });

  it('sin portapapeles usa directamente el respaldo', async () => {
    const execCommand = vi.fn().mockReturnValue(true);
    doc.execCommand = execCommand;
    expect(await copyText('Hola')).toBe(true);
    expect(execCommand).toHaveBeenCalledTimes(1);
  });

  it('devuelve false si no se puede copiar de ninguna forma', async () => {
    doc.execCommand = vi.fn().mockReturnValue(false);
    expect(await copyText('Hola')).toBe(false);
  });

  it('devuelve false (y no lanza) si ni siquiera existe execCommand', async () => {
    expect(await copyText('Hola')).toBe(false);
  });
});
