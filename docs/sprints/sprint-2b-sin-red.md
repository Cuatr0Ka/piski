<!--
Insumo para /speckit.specify del Sprint 2B del Panel de Monitoreo (Módulo B).
Es la segunda mitad del antiguo "Sprint 2"; el pronóstico y la navegación pasaron al Sprint 1 (MVP).
Las reglas generales viven en docs/reglas.md y en modulos-de-trabajo.md; no se copian aquí.
Estado: OPCIONAL y sin implementar. Se decide después de cerrar el MVP. Todos los criterios están pendientes.
-->

# Insumo de especificación — Sprint 2B (opcional): Funcionamiento sin red

> **Advertencia de viabilidad.** El MVP se entrega para abrirse con doble clic (archivo local). Un service worker no funciona en ese modo, así que este sprint exigiría servir la app por http o https (un servidor local o un alojamiento). Hay que decidirlo antes de empezar.
>
> **Sprint opcional.** El MVP (`sprint-1-mvp-estado-y-pronostico.md`) es una demostración local con datos simulados y no lo necesita. Se hace si se quiere mostrar que el panel sigue funcionando sin internet, que es uno de los argumentos del proyecto.

> **Referencias obligatorias para el agente:**
> - Alcance: `docs/modulos-de-trabajo.md`
> - Constitución: `docs/reglas.md`, principios II, VI y VIII
> - Sistema de diseño: `docs/design-system-panel.md` (`Notice`, "Estados de interacción")
> - Sprint previo: `sprint-1-mvp-estado-y-pronostico.md`
> - Este documento describe únicamente el alcance de este sprint.

## 1. Contexto del sprint

Estado actual y Pronóstico ya existen (MVP). Este sprint opcional agrega que el panel **funcione sin conexión** tras la primera carga. En una tormenta la red falla, y el panel debe seguir sirviendo con lo que ya tiene. Como en la fase de demostración los datos son escenarios locales y simulados, aquí "los últimos datos guardados" son el escenario que estaba abierto.

## 2. Objetivo

Que todo el panel (Estado actual y Pronóstico) siga abriendo y mostrando el último dato guardado sin red, diciendo con claridad desde cuándo es ese dato.

## 3. Historias de usuario del sprint

- **US1** — Como encargado del comité, quiero que el panel abra y muestre el último dato aunque no haya internet, para poder avisar durante una tormenta.
- **US2** — Como encargado del comité, quiero ver qué tan viejo es el dato y un aviso de que no hay conexión, para no confiar en una lectura antigua.
- **US3** — Como comité, quiero que el panel use un JSON más reciente cuando lo haya y la copia guardada cuando no, para que los datos se mantengan al día sin pasos extra.
- **US4** — Como comité, quiero saber cómo llevar los JSON actualizados al sitio sin internet, para mantener el panel al día.

## 4. Flujo demostrable al cierre del sprint

    Abrir el panel con conexión y cargar el escenario "ciclón" (primera carga)
    → Cortar la conexión y recargar la página: el panel abre igual con el último dato
    → Estado actual y Pronóstico funcionan sin red; se ve "Última lectura hace X min" y un aviso de que no hay conexión
    → El estado nunca aparece en verde por falta de actualización: si el dato envejece, pasa a "Sin datos"
    → Volver a conectar con un JSON más reciente: el panel lo usa y actualiza la copia guardada

## 5. Pantallas involucradas

| Pantalla | Qué permite | Diseño de referencia |
|----------|-------------|----------------------|
| Aviso de funcionamiento sin red | Informar que el panel funciona sin conexión y desde cuándo son los datos | Variante `offline` de `Notice`; se agrega a ambas maquetas de `docs/design/` antes de implementar |
| Estado actual y Pronóstico | Sin cambios funcionales; incorporan el aviso | Sprint 1 (MVP) |

## 6. Entidades y archivos que toca este sprint

| Archivo / entidad | Acción en este sprint |
|-------------------|-----------------------|
| Caché de la PWA | crear (shell de la app, tipografía, íconos y JSON en caché) |
| Copia local de los datos | crear (IndexedDB: JSON crudo validado, revalidado al leerlo) |
| `data/readings.json`, `data/config.json` | leer; nunca se modifican |

## 7. Reglas aplicables

- Principio II: funcionar sin red tras la primera carga (PWA con service worker); sin CDN en tiempo de ejecución; `readings.json` nunca se modifica.
- Principio III: un dato viejo se muestra como tal; nunca se asume verde.
- Principio VI: IndexedDB para la copia local de los datos; dependencias de desarrollo aprobadas por el autor el 2026-10-16 (`vite-plugin-pwa`, `workbox-build`, `workbox-window`, `fake-indexeddb`).
- Principio VII: la copia local se revalida al leerla; errores sin trazas.
- Principio VIII: la prueba sin red se hace realmente (cargar una vez, cortar la conexión, recargar).

## 8. Criterios de aceptación

Todos pendientes.

- [ ] CA-1: el panel se carga una vez y, tras cortar la conexión y recargar, abre y muestra Estado actual y Pronóstico con el último dato guardado.
- [ ] CA-2: sin conexión se muestra un aviso claro con la antigüedad del dato, y el estado nunca aparece en verde por falta de actualización.
- [ ] CA-3: cuando hay conexión y un JSON más reciente, el panel lo usa y actualiza la copia guardada; cuando no la hay, usa la copia. No retrocede ante un archivo más viejo.
- [ ] CA-4: la tipografía, los íconos y todo recurso se sirven desde la propia app; no hay solicitudes a dominios externos (verificable en las herramientas de red).
- [ ] CA-5: la prueba manual sin red está documentada (pasos y resultado) en el reporte del sprint y se hizo con el panel realmente desconectado, no solo con las herramientas de desarrollo.
- [ ] CA-6: las pruebas automatizadas cubren la caché, la copia local y el cambio entre conexión y sin conexión.
- [ ] CA-7: los textos nuevos están en español y centralizados en un solo lugar.
- [ ] CA-8: el aviso sin red aparece en la maqueta aprobada y la implementación coincide con ella.

## 9. Fuera de alcance de este sprint

- Reportes, IndexedDB para reportes, exportar e importar `reports.json`.
- Laderas, Recomendador verde y Panel institucional.
- Actualización automática de los JSON desde un nodo o simulador.
- Notificaciones push y envío de avisos.

## 10. Decisiones pendientes para /speckit.clarify

- Estrategia de caché de los JSON: primero red con respaldo en caché, o primero caché con actualización.
- Cómo llegan los JSON actualizados al lugar sin internet (copia manual, carpeta compartida o USB) y si el panel necesita un selector manual de archivos (`file://`).
- Cómo se instala el panel en el equipo (acceso directo, instalación PWA o servidor local).
- Política de versiones nuevas de la app (propuesta: se aplican al cerrar todas las pestañas).

## 11. Restricciones heredadas

Aplican todas las de `docs/reglas.md`. No se copian aquí. Restricción adicional: la prueba sin red debe hacerse con el panel realmente desconectado.
