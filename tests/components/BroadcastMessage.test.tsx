import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { textos } from '../../src/core/i18n/textos';
import { BroadcastMessage } from '../../src/ui/components/BroadcastMessage';

const nav = navigator as unknown as { clipboard?: unknown };

describe('BroadcastMessage', () => {
  afterEach(() => {
    delete nav.clipboard;
    delete (document as unknown as { execCommand?: unknown }).execCommand;
  });

  it('muestra "Qué avisar", la etiqueta "Sugerido", el mensaje y que el panel no envía nada', () => {
    render(<BroadcastMessage message={textos.avisar.mensajes.review} />);
    expect(screen.getByRole('heading', { name: 'Qué avisar' })).toBeTruthy();
    expect(screen.getByText('Sugerido')).toBeTruthy();
    expect(screen.getByText(textos.avisar.mensajes.review)).toBeTruthy();
    expect(screen.getByText('El panel no envía nada. Tú confirmas y avisas.')).toBeTruthy();
  });

  it('"Copiar mensaje" copia el texto y confirma "Mensaje copiado"', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    nav.clipboard = { writeText };
    render(<BroadcastMessage message={textos.avisar.mensajes.stop} />);

    expect(screen.queryByText('Mensaje copiado')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Copiar mensaje' }));

    expect(await screen.findByText('Mensaje copiado')).toBeTruthy();
    expect(writeText).toHaveBeenCalledWith(textos.avisar.mensajes.stop);
  });

  it('si no se puede copiar lo dice con claridad', async () => {
    render(<BroadcastMessage message={textos.avisar.mensajes.normal} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copiar mensaje' }));
    expect(await screen.findByText(/No se pudo copiar/)).toBeTruthy();
  });

  it('al cambiar el mensaje (otro estado) la confirmación se borra', async () => {
    nav.clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
    const { rerender } = render(<BroadcastMessage message={textos.avisar.mensajes.review} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copiar mensaje' }));
    await screen.findByText('Mensaje copiado');

    rerender(<BroadcastMessage message={textos.avisar.mensajes.stop} />);
    expect(screen.queryByText('Mensaje copiado')).toBeNull();
  });

  it('el botón de copiar es la acción principal (única con sombra pequeña)', () => {
    render(<BroadcastMessage message={textos.avisar.mensajes.normal} />);
    expect(screen.getByRole('button', { name: 'Copiar mensaje' }).className).toContain('primary');
  });
});

describe('Mensajes de ejemplo para avisar', () => {
  it('con Sin datos el mensaje nunca afirma que el paso es seguro ni que no hay aviso que dar', () => {
    const mensaje = textos.avisar.mensajes.nodata;
    expect(mensaje).not.toMatch(/seguro|normal|no hay aviso/i);
    expect(mensaje).toContain('No se puede avisar con este panel');
    expect(mensaje).toContain('revisen el arroyo en persona');
  });

  it('hay un mensaje para cada uno de los cuatro estados', () => {
    expect(Object.keys(textos.avisar.mensajes).sort()).toEqual(['nodata', 'normal', 'review', 'stop']);
  });
});
