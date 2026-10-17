# Guía de validación rápida: Panel de monitoreo (MVP)

Guía para comprobar de extremo a extremo que la funcionalidad cumple la especificación. No contiene código de implementación; los detalles de datos y reglas están en [data-model.md](data-model.md) y en [contracts/](contracts/).

## Requisitos previos

- Node 24 o superior y npm (instalados: Node 24.19.0, npm 11.17.0).
- Chrome o Edge de escritorio, para la prueba con doble clic.
- La carpeta del proyecto con las dependencias instaladas (`npm install`).

## Comandos del proyecto

| Comando | Para qué |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga (solo para programar; la entrega no lo usa). |
| `npm test` | Pruebas de Vitest y React Testing Library. |
| `npm run typecheck` | Verificación de tipos en modo estricto. |
| `npm run build` | Genera `dist/index.html`, **la entrega**: un solo archivo con todo en línea. |

## Validación 1: pruebas automáticas

1. Ejecutar `npm test`.
2. **Esperado**: pasan las tablas de casos de [clasificación](contracts/clasificacion-estado.md) (C01 a C20) y de [pronóstico](contracts/pronostico.md) (P01 a P11 y las demás de 20 o más casos), la validación de archivos inválidos y las pruebas de componentes (semáforo, rango del pronóstico, etiqueta de simulado, mensaje y gráfica). Los nombres de las pruebas están en español.
3. Ejecutar `npm run typecheck`; sin errores.

## Validación 2: la entrega abre con doble clic (SC-011, FR-030)

1. Ejecutar `npm run build`.
2. Copiar `dist/index.html` a otra carpeta o equipo sin Node, sin internet y sin el proyecto.
3. Hacer doble clic en `index.html`.
4. **Esperado**: el panel abre en el navegador y muestra Estado actual con un escenario completo en menos de 5 segundos, con la tipografía Inter y sin errores en la consola.
5. Comprobar que no hay recursos externos: buscar en `dist/index.html` direcciones `http://` o `https://`. Solo pueden aparecer cadenas del espacio de nombres SVG (`http://www.w3.org/...`), que no son peticiones. En las herramientas de red del navegador no debe haber solicitudes.

## Validación 3: flujo de la demostración (SC-005)

Con el panel abierto, recorrer sin editar archivos:

1. Escenario **Tormenta normal**: Estado actual muestra Normal (verde, círculo, "Paso seguro"), nivel contra el paso, "Última lectura hace 3 min" y el mensaje de ejemplo de Normal. Pronóstico dice "Sin pronóstico de creciente" (estable).
2. Escenario **Ciclón: inicio**: Pronóstico muestra "Podría llegar a Revisar entre 2.5 y 3.5 h" (el "ahora" queda 3 min después de la última lectura, por eso difiere de las cifras de la maqueta), "No se proyecta en las próximas 6 h" para No cruzar, "entre 570 y 630 mm en 3 h", la gráfica con banda y el nivel actual, ritmo y antigüedad.
3. Escenario **Ciclón: Revisar**: Estado actual pasa a Revisar (amarillo, triángulo) y el mensaje cambia; Pronóstico dice "Ya superó Revisar…".
4. Escenario **Ciclón: No cruzar**: Estado actual muestra No cruzar (rojo, octágono, "No cruces"); "Copiar mensaje" copia el texto y confirma "Mensaje copiado".
5. Escenario **Estiaje**: Pronóstico dice "Sin pronóstico de creciente" (bajando) y la gráfica usa todo el ancho.
6. Escenario **Pocas lecturas**: "Sin pronóstico: hacen falta más lecturas".
7. Escenario **Lecturas viejas**: Estado actual muestra "Sin datos" (nunca verde) y Pronóstico "Sin pronóstico: datos viejos".
8. Casos de prueba: **Lectura espuria** no cambia el estado; **Lectura imposible** muestra "Se descartaron 2 lecturas fuera de rango".
9. En cada paso, la etiqueta "Datos simulados" está visible y el cambio de escenario no recarga la página.

## Validación 4: "ahora" fijo y umbrales (SC-007, SC-010)

1. Dejar abierto el escenario Ciclón: Revisar durante 30 minutos. **Esperado**: el estado, "Última lectura hace X min" y el pronóstico no cambian.
2. Cambiar `stop_mm` en el `config.json` de un escenario, volver a generar con `npm run build` y abrir de nuevo. **Esperado**: el estado cambia sin tocar el código.

## Validación 5: comparación con las maquetas (SC-009, FR-028)

1. Abrir `dist/index.html` y la maqueta correspondiente de `docs/design/` en una ventana de 1440 × 900.
2. Comparar composición, jerarquía y tamaños relativos. Para capturas desde Chrome sin interfaz:

   ```text
   chrome --headless=new --window-size=1440,900 --screenshot=captura.png "file:///RUTA/dist/index.html#/estado?e=ciclon-revisar"
   ```

3. **Esperado**: sin diferencias de composición que el autor rechace. No hay animaciones ni transiciones de color, y la única sombra es la del bloque principal y la del botón principal.

## Validación 6: accesibilidad básica (SC-008)

- Recorrer ambas pantallas solo con teclado: el foco siempre es visible y la navegación funciona.
- Ver cada estado en escala de grises: los cuatro se distinguen por forma, ícono y palabra.
- Probar con un lector de pantalla real (NVDA o Narrador): el cambio de estado se anuncia y la gráfica tiene su tabla.
