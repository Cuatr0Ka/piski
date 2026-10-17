# Contrato: interfaz de las pantallas

> **Actualización 2026-10-16 (estilo profesional):** la navegación pasa a una barra lateral, la franja de datos simulados y el selector van en una barra superior, Estado actual se organiza en una fila superior (estado y "Qué avisar") y tres tarjetas de indicador (nivel con medidor de arco, lluvia y antigüedad), y Pronóstico agrega la tira "Proyección por hora". Manda `docs/design-system-panel.md` (adenda); las maquetas HTML quedan como referencia histórica del contenido. Los datos y textos de las tablas siguientes no cambian.

Contrato de la interfaz del panel con quien lo usa. La composición, la jerarquía y los tamaños relativos son las de las maquetas aprobadas el 2026-10-16 (`docs/design/estado-actual.html` y `docs/design/pronostico.html`); los tokens y componentes son los de `docs/design-system-panel.md`. Si algo de aquí contradice una maqueta aprobada, manda la maqueta.

## Estructura común (cabecera y franja)

| Elemento | Contenido | Comportamiento |
|---|---|---|
| Cabecera | Nombre "Piski" con "Panel de monitoreo" y barra de navegación | Dos botones, "Estado actual" (Para: encargado del comité) y "Pronóstico" (Para: comité). La pantalla activa se rellena de azul; sin sombra. Usable con teclado y mouse, con foco visible. |
| Franja de datos simulados | "Datos simulados · No son lecturas reales del arroyo. Los umbrales de ejemplo son provisionales." y el selector "Escenario de ejemplo" | Siempre visible. El selector agrupa "Demostración" y "Casos de prueba" y cambia de escenario sin recargar. |
| Aviso de lecturas descartadas | "Se descartó N lectura(s) fuera de rango" | Aparece solo cuando `discardedCount > 0`, sobre el contenido de la pantalla. |
| Estados de carga y error | "Cargando datos…" con barra simple; error de datos con mensaje accionable y sin trazas | Si un escenario es inválido, sigue mostrando el último escenario válido. |

## Navegación y estado de la URL

- Dirección con `hash`: `#/estado` y `#/pronostico`; el escenario viaja como parámetro (`#/pronostico?e=ciclon-inicio`).
- Al abrir sin `hash` se muestra Estado actual con el escenario `tormenta-normal`.
- Cambiar de pantalla o de escenario no recarga la página.

## Estado actual

Dos columnas (izquierda 7/12, derecha 5/12), con a lo sumo cinco elementos. **Cambio de composición aprobado (2026-10-16):** la tarjeta "Lluvia" es el quinto elemento, para que los datos se lean como en una app del clima; las maquetas ya la incluyen.

| Elemento | Componente | Datos |
|---|---|---|
| Bloque de estado | `StatusBanner` + `StatusShape` | `EstadoPaso.kind`: Normal (verde, círculo, "Paso seguro"), Revisar (amarillo, triángulo, "Revisa el paso antes de cruzar"), No cruzar (rojo, octágono, "No cruces"), Sin datos (rombo, "Sin lecturas desde las HH:MM"). `role="status"`. Relleno y borde `ink`, con `shadow-md`; "Sin datos" va punteado y sin sombra. |
| Nivel contra el paso | `LevelGauge` | Nivel actual en mm (o "—" con "Sin datos"), "de 1000 mm del paso", barra con marcas de Revisar, No cruzar y Paso, y una frase ("Faltan 190 mm para No cruzar"). Con "Sin datos": "El último nivel conocido (480 mm a las 11:30) no se usa para decidir." |
| Qué avisar | `BroadcastMessage` | Mensaje de ejemplo del estado, botón "Copiar mensaje" (único con `shadow-sm`), confirmación "Mensaje copiado" y la nota "El panel no envía nada. Tú confirmas y avisas." |
| Lluvia | `RainCard` | Lluvia acumulada en mm por ventana (`rain_windows_h`: "42 mm en la última hora", "110 mm en 3 h", "172 mm en 6 h"), calculada con el "ahora" fijo. Con "Sin datos" no muestra cifras. Es informativa: no cambia el estado. |
| Antigüedad del dato | `DataFreshness` | "Última lectura hace X min" y la fecha y hora; con "Sin datos": "Sin lecturas desde las HH:MM" y "hace 3 h · 15 oct, 11:30". |

## Pronóstico de creciente

Conclusión a la izquierda (4/12) y gráfica a la derecha (8/12); debajo, "Cómo se calcula".

| Elemento | Componente | Datos |
|---|---|---|
| Conclusión | `ConclusionCard` (con `shadow-md`) | Frase de `contracts/pronostico.md` en el tamaño más grande; un renglón por umbral; nivel actual (o "Último nivel conocido"), ritmo con su rango, nivel proyectado, antigüedad ("Última lectura hace X min"), nota "Proyección, no medición" y aviso de lluvia. Sin pronóstico: tarjeta neutra con ícono de información, razón y qué hacer. |
| Gráfica | `ForecastChart` | Últimas 6 h y, si hay pronóstico, las próximas `horizon_h` h; nivel real, proyección discontinua, banda de incertidumbre, líneas de umbral con su color de estado y su etiqueta, "ahora", eje en mm. Sin pronóstico ocupa todo el ancho de las últimas 6 h. Incluye "Ver datos como tabla". Lleva la etiqueta "Datos simulados". |
| Cómo se calcula | `Disclosure` + `AssumptionTag` | Resumen siempre visible con el método y el aviso de lluvia; "Ver parámetros" muestra ventana, mínimo de lecturas y horizonte. Entre los datos de la conclusión se agrega la fila "Lluvia en la última hora" (mm), informativa, sin entrar en el cálculo. **Cambio aprobado.** |

## Accesibilidad y presentación

- El estado se distingue por color, forma, ícono y palabra; es legible en escala de grises.
- Contraste del tema claro según las tablas del sistema de diseño; controles de al menos 40 px de alto.
- La gráfica tiene alternativa en texto (tabla) para lectores de pantalla.
- Sin animaciones ni transiciones de color; el cambio de estado es inmediato y se anuncia.
- Solo escritorio, a 1440 × 900 de referencia; los textos salen de `core/i18n/`.
