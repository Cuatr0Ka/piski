# Maquetas del Panel Piski

Referencia visual de las pantallas del MVP. Son páginas HTML estáticas, solo para escritorio y en tema claro (tamaño de referencia 1440 × 900), con el estilo neobrutalista minimalista del sistema de diseño: borde fino en `ink`, color sólido, mucho aire y una sombra sólida solo en lo principal de cada pantalla. No son código del panel: sirven para aprobar la composición antes de programar. **Son una guía de composición, no el diseño final.**

**Estado: aprobadas por el autor el 2026-10-16** (`estado-actual.html` y `pronostico.html`, con todas sus variantes). Cualquier cambio de composición posterior se aprueba de nuevo y se anota aquí (`docs/reglas.md`, principio IX).

## Cómo verlas

Abre el archivo en el navegador (doble clic). La barra inferior con borde discontinuo es de la maqueta, no del panel, y cambia entre variantes.

| Archivo | Pantalla | Variantes |
|---|---|---|
| `estado-actual.html` | Estado actual | Normal, Revisar, No cruzar, Sin datos, Sin conexión (Sprint 2B, opcional) |
| `pronostico.html` | Pronóstico de creciente | Subiendo, Revisar superado, Bajando, Pocas lecturas, Datos viejos, Sin conexión (Sprint 2B, opcional) |
| `maqueta.css` y `maqueta.js` | Estilos con los tokens de `design-system-panel.md` y funciones compartidas | — |

## Qué decide cada maqueta

- **Primero la conclusión**, después la gráfica. Pronóstico abre con una frase ("Podría llegar a Revisar entre 2.5 y 4 h") y siempre muestra el nivel actual, el ritmo y la antigüedad del dato.
- **Estado actual** tiene cuatro elementos: bloque de estado, nivel contra el paso, mensaje de ejemplo para avisar y antigüedad del dato.
- **Qué avisar**: texto de ejemplo por estado con botón "Copiar mensaje". El panel no envía nada.
- **Redacción segura**: nunca "más de 6 h"; dice "No se proyecta en las próximas 6 h" y avisa que una lluvia intensa puede acelerar la subida.
- **Sin pronóstico** (bajando, pocas lecturas, datos viejos) usa una tarjeta neutra con qué hacer, y la gráfica ocupa todo el ancho.
- **Selector de escenarios** siempre a la vista, en la franja de "Datos simulados" (la app es una demostración con datos locales; no hay modo real).
- **Navegación** con botones de borde; la pantalla activa se marca con relleno, no solo con subrayado.

## Datos de las maquetas

Todos los números son supuestos de ejemplo: Revisar 600 mm, No cruzar 850 mm y paso 1000 mm. No son los del arroyo real.

## Al aprobar

Cuando el autor apruebe una maqueta, se anota aquí la fecha y se cita en el sprint como "Diseño de referencia aprobado".
