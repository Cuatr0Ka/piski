# Panel Piski

Panel de monitoreo de un arroyo, pensado para que un encargado del comité vea de un vistazo si el paso es seguro, qué podría pasar en las próximas horas y qué conviene avisar a la gente cercana.

> **Por ahora es una demostración.** Todos los datos son escenarios de ejemplo simulados, guardados en archivos JSON locales. No hay sensores, ni conexión con ningún servicio, ni datos reales. Los umbrales de ejemplo (Revisar 600 mm, No cruzar 850 mm, paso 1000 mm) son supuestos provisionales y no son los del arroyo real.

## Qué hace

- **Estado actual**: semáforo grande (Normal, Revisar, No cruzar o Sin datos), nivel del agua contra el nivel del paso, antigüedad del dato y un mensaje de ejemplo para avisar, con botón para copiarlo. El panel **no envía nada**: una persona confirma y avisa.
- **Pronóstico de creciente**: una frase que dice cuándo podría llegar el agua a Revisar y a No cruzar, siempre como **rango** y nunca como un número exacto, con la gráfica del nivel, la proyección y su banda de incertidumbre. Cuando no hay datos suficientes, los datos son viejos o el nivel no sube, dice "Sin pronóstico", por qué y qué hacer.
- **Selector de escenarios** siempre visible, para presentar el panel en distintas situaciones (tormenta normal, ciclón, estiaje, lecturas viejas y más) sin tocar archivos.

El pronóstico solo extrapola el ritmo de subida: **no es un modelo hidrológico validado** ni sustituye una alerta oficial, y una lluvia intensa puede hacer que se quede corto.

## Cómo abrirlo (la entrega)

La entrega es **un solo archivo**: `dist/index.html`. Cópialo a cualquier computadora y haz **doble clic**; se abre en el navegador sin instalar nada, sin ejecutar comandos y sin internet.

Funciona en el navegador de escritorio (se verificó en Chrome). Está diseñado para pantallas de escritorio, con 1440 × 900 como tamaño de referencia.

## Cómo desarrollarlo

Requisitos: Node 24 o superior y npm.

| Comando | Para qué |
|---|---|
| `npm install` | Instala las dependencias. |
| `npm run dev` | Servidor de desarrollo con recarga (solo para programar; la entrega no lo usa). |
| `npm test` | Ejecuta las pruebas (Vitest y React Testing Library). |
| `npm run typecheck` | Verifica los tipos en modo estricto. |
| `npm run build` | Genera `dist/index.html`, la entrega de un solo archivo. |
| `npm run verify:dist` | Comprueba que la entrega sea un solo archivo y no dependa de recursos externos. |
| `npm run generar:escenarios` | Vuelve a generar los escenarios de `data/escenarios/` (determinista, sin azar). |

## Estructura

```text
data/
├── ESQUEMA.md              contrato de los archivos JSON
└── escenarios/<id>/        escenario.json, config.json y readings.json de cada escenario
src/
├── core/                   datos (repositorio y proveedor), esquemas Zod, tokens de diseño, tiempo y textos
├── ui/                     componentes visuales reutilizables, sin lógica de negocio
├── features/               estado/ y pronostico/: servicios (funciones puras), hooks y pantallas
└── app/                    composición: navegación por hash, franja de datos simulados y selector
tests/                      pruebas, tablas de casos de referencia y archivos inválidos de prueba
scripts/                    generar escenarios, armar la entrega en un solo archivo y verificarla
docs/                       reglas del proyecto, sistema de diseño, maquetas aprobadas y sprints
specs/                      especificación, plan, contratos y tareas de la funcionalidad
```

## Escenarios de ejemplo

Cada escenario tiene un "ahora" **fijo**: el estado y la antigüedad del dato no cambian por el paso del tiempo real, así que se ve igual cuanto tiempo se deje abierto.

| Grupo | Escenarios |
|---|---|
| Demostración | Tormenta normal, Ciclón (inicio, nivel en Revisar, nivel en No cruzar), Estiaje, Pocas lecturas, Lecturas viejas |
| Casos de prueba | Nivel que baja, Nivel plano, Subida acelerada, Subida con ruido, Lectura espuria, Lecturas imposibles |

La tabla de qué demuestra cada uno y su resultado esperado está en `data/ESQUEMA.md`.

## Reglas del proyecto

- Las reglas que no se rompen están en `docs/reglas.md` (copia ratificada en `.specify/memory/constitution.md`).
- El sistema de diseño (neobrutalismo minimalista) está en `docs/design-system-panel.md` y las maquetas aprobadas en `docs/design/`.
- Las decisiones técnicas importantes se anotan en `docs/decisiones.md`.
- Los umbrales y los parámetros del pronóstico viven solo en `config.json`; nunca se escriben en el código.
- Si un dato falta o es viejo, el panel lo dice ("Sin datos"); **nunca** lo muestra en verde.
