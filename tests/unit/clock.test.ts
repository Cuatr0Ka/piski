import { describe, expect, it } from 'vitest';
import {
  FUTURE_TOLERANCE_MS,
  formatAge,
  formatDateTime,
  formatHour,
  minutesBetween,
  offsetMinutes,
  parseTimestamp,
} from '../../src/core/time/clock';

describe('Utilidades de tiempo', () => {
  it('formatea la antigüedad en minutos y en horas', () => {
    expect(formatAge(0)).toBe('hace menos de 1 min');
    expect(formatAge(3)).toBe('hace 3 min');
    expect(formatAge(59)).toBe('hace 59 min');
    expect(formatAge(60)).toBe('hace 1 h');
    expect(formatAge(180)).toBe('hace 3 h');
  });

  it('formatea la hora en 24 horas', () => {
    expect(formatHour(parseTimestamp('2026-10-15T14:27:00-06:00'), -360)).toBe('14:27');
    expect(formatHour(parseTimestamp('2026-10-15T09:05:00-06:00'), -360)).toBe('09:05');
  });

  it('formatea la fecha y la hora como "15 oct, 14:27"', () => {
    expect(formatDateTime(parseTimestamp('2026-10-15T14:27:00-06:00'), -360)).toBe('15 oct, 14:27');
  });

  it('usa la zona del escenario y no la del navegador', () => {
    const ms = parseTimestamp('2026-10-15T20:30:00Z');
    expect(formatHour(ms, 0)).toBe('20:30');
    expect(formatHour(ms, -360)).toBe('14:30');
    expect(offsetMinutes('2026-10-15T14:30:00-06:00')).toBe(-360);
    expect(offsetMinutes('2026-10-15T14:30:00Z')).toBe(0);
  });

  it('calcula los minutos entre dos instantes', () => {
    const a = parseTimestamp('2026-10-15T14:00:00-06:00');
    const b = parseTimestamp('2026-10-15T14:30:00-06:00');
    expect(minutesBetween(a, b)).toBe(30);
    expect(minutesBetween(b, a)).toBe(-30);
  });

  it('acepta zona Z y desfases, y rechaza marcas sin zona horaria', () => {
    expect(parseTimestamp('2026-10-15T20:00:00Z')).toBe(parseTimestamp('2026-10-15T14:00:00-06:00'));
    expect(() => parseTimestamp('2026-10-15T14:00:00')).toThrow(/zona horaria/);
  });

  it('define la tolerancia de 60 s para lecturas adelantadas', () => {
    expect(FUTURE_TOLERANCE_MS).toBe(60_000);
  });
});
