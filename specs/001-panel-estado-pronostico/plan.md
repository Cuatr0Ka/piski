# Plan de implementación: Panel de monitoreo (MVP) — Estado actual y Pronóstico de creciente

**Rama**: `001-panel-estado-pronostico` | **Fecha**: 2026-10-16 | **Especificación**: [spec.md](spec.md)

**Entrada**: Especificación de la funcionalidad en `specs/001-panel-estado-pronostico/spec.md`

## Resumen

El MVP entrega dos pantallas, **Estado actual** y **Pronóstico de creciente**, con navegación entre ellas, un selector de escenarios siempre visible y datos 100 % simulados. El panel se entrega como **un solo archivo HTML que se abre con doble clic**, sin servidor, sin instalar nada y sin red.

Enfoque técnico (detalle en [research.md](research.md)):

- Aplicación de una sola página en React y TypeScript estricto, compilada con Vite. Un paso posterior al `build` deja todo (código, estilos y la tipografía Inter) **dentro de `index.html`**, porque Chrome no carga `<script type="module" src>` desde `file://` (verificado el 2026-10-16). Un script en línea sí funciona.
- Los escenarios de ejemplo (`data/escenarios/<id>/`) se incluyen dentro de la aplicación y solo los lee la capa de repositorios, validados con Zod.
- Cada escenario trae su propio "ahora" fijo; todas las antigüedades se calculan contra él, nunca contra el reloj real.
- La clasificación del estado y el pronóstico son **funciones puras** en `services/`. El pronóstico usa una tendencia robusta (mediana de pendientes) y un rango entre cuartiles, con un piso de incertidumbre.
- Sin librería de rutas ni de estado global: navegación por `hash` y hooks con un contexto mínimo. Gráfica en SVG propio.

## Contexto técnico

**Lenguaje y versión**: TypeScript en modo estricto sobre Node 24 (instalado: 24.19.0). Las versiones exactas se fijan al crear el proyecto, verificando la versión estable vigente.

**Dependencias principales**: React, Vite, Zod y `lucide-react` (aprobada por el autor el 2026-10-16). De desarrollo: Vitest, React Testing Library y jsdom. No se agregan librería de rutas, de estado, de gráficas ni de PWA.

**Almacenamiento**: ninguno. Los escenarios van incluidos en la entrega; no se usa `localStorage`, IndexedDB ni red.

**Pruebas**: Vitest y React Testing Library, con nombres y mensajes en español. Las tablas de casos de referencia (clasificación y pronóstico) son datos de prueba. La apertura con doble clic y la comparación con las maquetas se verifican con Chrome real (ver [quickstart.md](quickstart.md)).

**Plataforma de destino**: navegador de escritorio actual (Chrome o Edge verificados; Firefox deseable), abriendo `index.html` como archivo local. Solo escritorio, referencia 1440 × 900.

**Tipo de proyecto**: aplicación web de una sola página, de escritorio, entregada como un único archivo.

**Metas de rendimiento**: mostrar un escenario completo en menos de 5 segundos desde el doble clic (SC-011); estado y pronóstico se calculan sin demora perceptible al cambiar de escenario (SC-002). Como meta deseable, el archivo final pesa menos de 1 MB.

**Restricciones**: sin red ni CDN, sin servidor, sin instalar nada; `readings.json` solo se lee; ningún umbral ni parámetro de cálculo en el código; sin animaciones ni transiciones de color; una sola sombra sólida y solo en lo principal.

**Escala y alcance**: 2 pantallas, 13 escenarios de ejemplo, de decenas a unos cientos de lecturas por escenario.

## Verificación de la constitución

*Puerta: debe pasar antes de la Fase 0. Se vuelve a revisar tras el diseño de la Fase 1.*

Constitución v2.1.0 (`.specify/memory/constitution.md`).

| Principio | Estado | Cómo se cumple |
|---|---|---|
| I. Alcance y fuente de verdad | Pasa | Solo Estado actual y Pronóstico; el panel no envía avisos; sin módulos ajenos. |
| II. Independencia y sin conexión | Pasa | Sin backend ni telemetría; la entrega no necesita red; `readings.json` solo se lee; sin CDN (tipografía embebida). |
| III. Honestidad de los datos | Pasa | Etiqueta "Datos simulados" permanente; pronóstico siempre como rango, nunca tranquilizador; sin datos ≠ verde (`contracts/pronostico.md`). |
| IV. Lenguaje común | Pasa | Tres estados con color, forma, ícono y palabra; hex únicos en tokens; umbrales y parámetros solo desde `config.json`. |
| V. Arquitectura modular | Pasa | `core/`, `ui/`, `features/` y `app/`; la lógica vive en `services/` como funciones puras; solo repositorios leen los JSON. |
| VI. Stack | Pasa | Vite + React + TS estricto + Zod + Vitest/RTL; sin PWA (Sprint 2B). Lucide ya aprobada. |
| VII. Validación y errores | Pasa | Zod con versión de esquema; errores sin trazas; entrega con doble clic; lecturas imposibles se descartan con aviso. |
| VIII. Pruebas | Pasa | Pruebas de toda la lógica y los casos límite; componentes críticos con RTL; textos en español. |
| IX. UX/UI | Pasa con una excepción justificada | Ver "Seguimiento de la complejidad": el interruptor de tema oscuro. |
| X. Esquemas y datos de ejemplo | Pasa | `data/ESQUEMA.md` nace del contrato `contracts/datos-json.md`; escenarios con `simulated: true` y "ahora" fijo. |

**Resultado**: sin violaciones sin justificar. Se revisó de nuevo tras la Fase 1 con el mismo resultado.

## Estructura del proyecto

### Documentación (esta funcionalidad)

```text
specs/001-panel-estado-pronostico/
├── plan.md              # Este archivo (salida de /speckit-plan)
├── research.md          # Fase 0: decisiones y alternativas
├── data-model.md        # Fase 1: entidades y reglas de validación
├── quickstart.md        # Fase 1: guía de validación de extremo a extremo
├── contracts/           # Fase 1: contratos de datos, reglas y pantallas
│   ├── datos-json.md
│   ├── clasificacion-estado.md
│   ├── pronostico.md
│   └── interfaz.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Fase 2 (lo crea /speckit-tasks; no se crea aquí)
```

### Código fuente (raíz del repositorio)

```text
data/
├── ESQUEMA.md                      # contrato de los cuatro JSON (nace de contracts/datos-json.md)
└── escenarios/
    └── <id>/                       # 13 escenarios: 7 de demostración (tormenta-normal, ciclon-inicio, ciclon-revisar, ciclon-no-cruzar, estiaje, pocas-lecturas, lecturas-viejas) y 6 casos de prueba
        ├── escenario.json          # id, nombre, descripción y "ahora" fijo
        ├── config.json
        └── readings.json

src/
├── core/
│   ├── data/                       # repositorio de escenarios y proveedor de datos
│   ├── schemas/                    # esquemas Zod de los JSON
│   ├── tokens/                     # tokens de diseño (única fuente)
│   ├── time/                       # utilidades de tiempo (siempre con un "ahora" recibido)
│   └── i18n/                       # textos de la interfaz centralizados (es)
├── ui/
│   ├── components/                 # StatusBanner, LevelGauge, ForecastChart, ...
│   ├── theme/                      # variables CSS a partir de los tokens
│   └── icons.ts                    # íconos Lucide, uno por uno
├── features/
│   ├── estado/                     # components/, hooks/, services/ (clasificación), types.ts, index.ts
│   └── pronostico/                 # components/, hooks/, services/ (pronóstico), types.ts, index.ts
└── app/                            # composición: App, navegación por hash, selector de escenarios

tests/
├── casos/                          # tablas de casos de referencia (clasificación y pronóstico)
├── fixtures/                       # archivos inválidos (esquema, sin zona horaria, lectura imposible)
├── unit/
└── components/

scripts/
└── inline-build.mjs                # deja la salida de Vite en un solo index.html

dist/
└── index.html                      # LA ENTREGA: se abre con doble clic
```

**Decisión de estructura**: se sigue la organización del principio V. La capa de datos compartida vive en `core/` (ya aprobada). Las carpetas `repositories/` y `validators/` de cada feature no se crean porque las dos pantallas no tienen datos ni validaciones propias; se agregarían si una feature futura las necesita. Los tokens van en `core/tokens/` por el principio V; hay que ajustar la ruta mencionada en `docs/design-system-panel.md` (hoy dice `src/ui/theme/tokens.ts`).

## Seguimiento de la complejidad

> Se llena solo si la verificación de la constitución tiene desviaciones que justificar.

| Desviación | Por qué se necesita | Alternativa más simple descartada porque |
|------------|---------------------|-------------------------------------------|
| Principio IX pide ofrecer tema claro y oscuro; el MVP define los tokens de ambos temas pero **no incluye el interruptor** | Las maquetas aprobadas no muestran ese control, y agregarlo cambia la composición aprobada. La especificación deja fuera la auditoría del tema oscuro. | Agregar el interruptor sin maqueta incumple la regla de maqueta aprobada. Queda como tarea pendiente de aprobación: una maqueta con el control, o dejarlo para un sprint posterior. |
| Script propio `scripts/inline-build.mjs` (unas 40 líneas) para dejar todo en un solo archivo | Es lo que permite abrir con doble clic (verificado). El principio VI prefiere pocas líneas propias a una librería. | `vite-plugin-singlefile` hace lo mismo pero agrega una dependencia; se usará solo si el script propio da problemas. |
