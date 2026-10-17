import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RoleNav } from '../../src/ui/components/RoleNav';

const items = [
  { id: 'estado', name: 'Estado actual', role: 'Para: encargado del comité', href: '#/estado?e=ciclon-inicio' },
  { id: 'pronostico', name: 'Pronóstico', role: 'Para: comité', href: '#/pronostico?e=ciclon-inicio' },
];

describe('RoleNav', () => {
  it('muestra una navegación con las dos pantallas y el rol de cada una', () => {
    render(<RoleNav items={items} activeId="estado" label="Pantallas" />);
    expect(screen.getByRole('navigation', { name: 'Pantallas' })).toBeTruthy();
    expect(screen.getByText('Estado actual')).toBeTruthy();
    expect(screen.getByText('Para: encargado del comité')).toBeTruthy();
    expect(screen.getByText('Pronóstico')).toBeTruthy();
    expect(screen.getByText('Para: comité')).toBeTruthy();
  });

  it('marca la pantalla activa con aria-current y un relleno propio, no solo con un subrayado', () => {
    render(<RoleNav items={items} activeId="pronostico" label="Pantallas" />);
    const activa = screen.getByRole('link', { name: /Pronóstico/ });
    const otra = screen.getByRole('link', { name: /Estado actual/ });
    expect(activa.getAttribute('aria-current')).toBe('page');
    expect(activa.className).toContain('activa');
    expect(otra.getAttribute('aria-current')).toBeNull();
    expect(otra.className).not.toContain('activa');
  });

  it('cada pantalla es un enlace real que conserva el escenario en su dirección', () => {
    render(<RoleNav items={items} activeId="estado" label="Pantallas" />);
    expect(screen.getByRole('link', { name: /Estado actual/ }).getAttribute('href')).toBe('#/estado?e=ciclon-inicio');
    expect(screen.getByRole('link', { name: /Pronóstico/ }).getAttribute('href')).toBe('#/pronostico?e=ciclon-inicio');
  });

  it('se puede recorrer con el teclado: los enlaces reciben el foco', () => {
    render(<RoleNav items={items} activeId="estado" label="Pantallas" />);
    const enlaces = screen.getAllByRole('link');
    enlaces[0]?.focus();
    expect(document.activeElement).toBe(enlaces[0]);
    enlaces[1]?.focus();
    expect(document.activeElement).toBe(enlaces[1]);
  });
});
