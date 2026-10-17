import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Limpia el DOM entre pruebas de componentes.
afterEach(() => {
  cleanup();
});
