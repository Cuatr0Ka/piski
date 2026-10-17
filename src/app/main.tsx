import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../ui/theme/global.css';
import { installTheme } from '../ui/theme/cssVars';
import logo from '../assets/piski-logo.png';
import { Splash } from '../ui';
import { App } from './App';

// Las variables de los tokens se instalan antes de pintar; el tema claro es el predeterminado.
installTheme();

// Ícono de la pestaña: el mismo logo, incrustado en el archivo (sin pedir nada a la red).
const icono = document.createElement('link');
icono.rel = 'icon';
icono.type = 'image/png';
icono.href = logo;
document.head.appendChild(icono);

const raiz = document.getElementById('root');
if (raiz === null) throw new Error('Falta el elemento #root en index.html.');

createRoot(raiz).render(
  <StrictMode>
    <App />
    <Splash />
  </StrictMode>,
);
