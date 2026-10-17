// Funciones compartidas de las maquetas del Panel Vigía. No es código del panel.

const ICONOS = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  alert: '<path d="M12 8v5"/><path d="M12 17h.01"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  copied: '<path d="M20 6 9 17l-5-5"/>',
  wifioff: '<path d="M12 20h.01"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/><path d="M5 12.859a10 10 0 0 1 5.17-2.69"/><path d="M19 12.859a10 10 0 0 0-2.007-1.523"/><path d="M2 8.82a15 15 0 0 1 4.177-2.643"/><path d="M22 8.82a15 15 0 0 0-11.288-3.764"/><path d="m2 2 20 20"/>',
};

function icono(nombre, tam = 24) {
  return `<svg width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS[nombre]}</svg>`;
}

// Forma del estado: círculo, triángulo, octágono o rombo vacío. Relleno en state-ink y signo en el color del estado.
function forma(estado, tam = 64) {
  const tinta = 'var(--state-ink)';
  const mapa = {
    ok: { fondo: 'var(--ok-fill)', cuerpo: `<circle cx="32" cy="32" r="30" fill="${tinta}"/>`, signo: '<path d="M19 33l9 9 17-19" fill="none" stroke="var(--ok-fill)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' },
    warn: { cuerpo: `<polygon points="32,4 61,57 3,57" fill="${tinta}" stroke="${tinta}" stroke-width="4" stroke-linejoin="round"/>`, signo: '<path d="M32 24v16" stroke="var(--warn-fill)" stroke-width="5" stroke-linecap="round"/><circle cx="32" cy="48" r="3" fill="var(--warn-fill)"/>' },
    stop: { cuerpo: `<polygon points="20,2 44,2 62,20 62,44 44,62 20,62 2,44 2,20" fill="${tinta}"/>`, signo: '<path d="M22 22l20 20M42 22L22 42" stroke="var(--stop-fill)" stroke-width="5" stroke-linecap="round"/>' },
    none: { cuerpo: '<polygon points="32,3 61,32 32,61 3,32" fill="none" stroke="var(--ink)" stroke-width="4" stroke-linejoin="round"/>', signo: '<text x="32" y="42" text-anchor="middle" font-size="28" font-weight="700" fill="var(--ink)" font-family="Inter, Segoe UI, sans-serif">?</text>' },
  };
  const f = mapa[estado];
  return `<svg class="shape" width="${tam}" height="${tam}" viewBox="0 0 64 64" role="img" aria-label="${{ ok: 'Círculo', warn: 'Triángulo', stop: 'Octágono', none: 'Rombo' }[estado]}">${f.cuerpo}${f.signo}</svg>`;
}

// Barra de la maqueta: cambia la variante que se muestra. Se recuerda en el hash de la URL.
function montarVariantes(opciones, actual, alCambiar) {
  const barra = document.createElement('div');
  barra.className = 'mock-bar';
  barra.innerHTML = '<b>Maqueta (no es parte del panel) · Variante:</b>';
  opciones.forEach(([id, etiqueta]) => {
    const b = document.createElement('button');
    b.className = 'btn btn-secondary';
    b.textContent = etiqueta;
    b.dataset.id = id;
    b.addEventListener('click', () => { history.replaceState(null, '', '#' + id); marcar(id); alCambiar(id); });
    barra.appendChild(b);
  });
  document.body.appendChild(barra);
  function marcar(id) { barra.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.id === id))); }
  const inicial = opciones.some(([id]) => id === location.hash.slice(1)) ? location.hash.slice(1) : actual;
  marcar(inicial);
  alCambiar(inicial);
}

function cabecera(activa) {
  return `
  <header class="appbar"><div class="appbar-in">
    <div class="brand">Vigía<small>Panel de monitoreo</small></div>
    <nav class="nav" aria-label="Pantallas">
      <a class="nav-item ${activa === 'estado' ? 'active' : ''}" href="estado-actual.html"><span class="nav-name">Estado actual</span><span class="nav-role">Para: encargado del comité</span></a>
      <a class="nav-item ${activa === 'pronostico' ? 'active' : ''}" href="pronostico.html"><span class="nav-name">Pronóstico</span><span class="nav-role">Para: comité</span></a>
    </nav>
  </div></header>
  <div class="sim-strip"><div class="sim-strip-in">
    <span><b>Datos simulados</b> · No son lecturas reales del arroyo. Los umbrales de ejemplo son provisionales.</span>
    <span class="field"><span class="field-label">Escenario de ejemplo</span><button class="btn btn-secondary" type="button" aria-haspopup="listbox">Ciclón ▾</button></span>
  </div></div>`;
}

function avisoSinRed(hora) {
  return `<div class="notice" role="status">${icono('wifioff')}<span><b>Sin conexión.</b> Estás viendo los datos guardados a las ${hora}. El panel sigue funcionando; el estado se marcará "Sin datos" si el dato envejece demasiado.</span></div>`;
}
