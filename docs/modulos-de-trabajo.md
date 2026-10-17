# Alcance del proyecto — Panel de monitoreo (Módulo B)

Este repositorio construye **solo el software del panel de monitoreo**. El simulador y los datos (Módulo A), el firmware del nodo y la baliza (Módulo C), la carcasa y los modelos 3D (Módulo D) y la infraestructura verde y el protocolo de alerta (Módulo E) los desarrollan otros equipos y **no se documentan aquí**. Del exterior, el panel solo conoce el contrato de los archivos JSON que consume (`data/ESQUEMA.md`), que define y mantiene este proyecto.

> Regla del proyecto: precios sin verificar y cifras del recomendador como **supuestos configurables**, no mediciones. El panel mantiene esa honestidad en todo lo que muestre.

---

## Fase actual: demostración local

Por ahora el panel **solo sirve para mostrar**. Los datos son archivos JSON locales y simulados; no hay conexión con un nodo ni con servicios externos, y no hay "modo real". Quien presenta elige el escenario de ejemplo (tormenta normal, ciclón, estiaje y otros) desde un selector siempre visible.

Aunque hoy se use para mostrar, la interfaz se diseña como una **herramienta informativa real**: la leerá un encargado del comité para decidir qué avisar a la gente cercana. No es un juguete animado ni una maqueta decorativa.

---

## Quién lo usa

El panel lo usan **encargados y líderes** (comité, Protección Civil, municipio, CONAGUA y CFE) desde una **computadora de escritorio**. Ellos leen el panel y avisan a la gente cercana por sus propios medios. El vecino no abre el panel: recibe el aviso. El panel **no envía nada**; una persona confirma y difunde.

---

## Reglas compartidas

1. **Nodo y panel son independientes.** El panel no depende de una conexión en vivo con el nodo, ni el nodo de internet.
2. **Los colores son el lenguaje común:** verde = normal, amarillo = revisar, rojo = no cruzar. El panel usa los mismos tres estados y los mismos hex (`#2fd1a5`, `#f5b942`, `#ef5b5b`) que la baliza física.
3. **Los umbrales viven en `data/config.json`** y los ajusta el comité. Nadie escribe umbrales en el código del panel.
4. **Todo dato simulado se marca como simulado** en la pantalla que lo muestre.
5. **Comunicación solo por los archivos JSON** descritos en `data/ESQUEMA.md`. Sin APIs propias.

---

## Pantallas del panel

Seis pantallas por rol, que leen los JSON. El MVP son las dos primeras.

| # | Pantalla | Rol principal | Qué muestra | Fase |
|---|---|---|---|---|
| 1 | **Estado actual** | Encargado del comité | Semáforo grande, nivel contra el paso, antigüedad del dato y **mensaje de ejemplo para avisar** | MVP |
| 2 | **Pronóstico de creciente** | Comité | Conclusión en una frase, nivel actual, ritmo de subida y gráfica con **rango de incertidumbre**, nunca un número exacto | MVP |
| 3 | **Laderas** | Comité y Protección Civil | Saturación por sector y aviso de deslave probable (indicador, no estudio geotécnico). Se prototipa con supuestos marcados | Después |
| 4 | **Recomendador verde** | Comité y municipio | Comparación sin intervención contra con bambú y trincheras, con los supuestos visibles | Después |
| 5 | **Reportes** | Por definir (ver pendientes) | Alta rápida de camino bloqueado o árbol caído y mapa de lo reportado | Después |
| 6 | **Panel institucional** | Protección Civil, CONAGUA, CFE | Resumen, historial y exportación | Después |

### Criterios de terminado del MVP

- [ ] Estado actual y Pronóstico cargan desde los JSON de cada escenario, sin backend.
- [ ] El selector de escenarios está siempre a la vista y cambia de escenario sin recargar.
- [ ] La entrega abre con doble clic en el navegador, sin instalar nada ni internet, y cada escenario tiene un "ahora" fijo.
- [ ] El pronóstico muestra rango, no número único, y nunca suena tranquilizador.
- [ ] Estado actual muestra el mismo estado que la baliza para el mismo `config.json`.
- [ ] Cada pantalla coincide con su maqueta aprobada de `docs/design/`.

---

## Orden de construcción

| Fase | Qué se hace | Documento |
|---|---|---|
| 1 | **MVP:** base técnica, Estado actual, Pronóstico y navegación | `sprints/sprint-1-mvp-estado-y-pronostico.md` |
| 2 (opcional) | **Funcionamiento sin red** (PWA) | `sprints/sprint-2b-sin-red.md` |
| 3 | Reportes, Laderas, Recomendador y Panel institucional | por definir |

---

## Pendientes del proyecto

- Municipio del proyecto (el nombre del proyecto es Piski).
- Quién da de alta los reportes: el plan original decía que los vecinos; este documento los dejó "por definir" porque el vecino no usa el panel.
- Aprobación del comité de los mensajes de ejemplo antes de cualquier uso real.
- Si el Sprint 2B (sin red) entra o se pospone.
