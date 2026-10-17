# Especificación de la funcionalidad: Panel de monitoreo (MVP) — Estado actual y Pronóstico de creciente

**Rama de la funcionalidad**: `001-panel-estado-pronostico`

**Creado**: 2026-10-16

**Estado**: Borrador

**Entrada**: Descripción del usuario: "Usa la descripcion de @docs\sprints\sprint-1-mvp-estado-y-pronostico.md"

## Aclaraciones

### Sesión 2026-10-16

- Q: Durante una presentación, ¿el "ahora" de cada escenario queda fijo o avanza con el reloj real de la computadora? → A: Fijo. Al elegir un escenario, su última lectura queda siempre con la misma antigüedad y el panel no cambia solo con el paso del tiempo.
- Q: ¿Cuántas lecturas seguidas deben confirmar un cambio de estado, y cuántos minutos puede tener una lectura antes de considerarse "vieja"? → A: Subir de estado con 3 lecturas seguidas, bajar con 5 lecturas seguidas y lectura vieja a partir de 30 minutos.
- Q: Si un archivo trae una lectura imposible (por ejemplo, un nivel negativo), ¿qué debe hacer el panel con ella? → A: Descartarla y avisar: ignora esa lectura, muestra un aviso con cuántas descartó y calcula con las demás; si no quedan suficientes, muestra "Sin datos".
- Q: ¿En qué unidad se muestran el nivel del agua y los umbrales? → A: Todo en milímetros (mm), como una app del clima; los campos pasan a `*_mm`.
- Q: ¿El panel debe mostrar la lluvia? → A: Sí, la lluvia acumulada en mm por ventana (1, 3 y 6 h); es solo informativa y no entra en el cálculo. Cambia la composición aprobada; aprobado el 2026-10-16.
- Q: ¿Cómo debe abrir el panel quien presenta: con doble clic en un archivo, o ejecutando un comando que levanta un servidor local? → A: Con doble clic: se entrega como una carpeta que se abre directo en el navegador, sin instalar nada, sin ejecutar comandos y sin internet.

## Escenarios de usuario y pruebas *(obligatorio)*

El panel es, por ahora, una **demostración local**: todos los datos son escenarios de ejemplo simulados y el panel no está conectado a ningún sensor ni servicio. Aun así, se diseña como una herramienta informativa real que lee un encargado del comité para decidir qué avisar a la gente cercana. El vecino no usa el panel: recibe el aviso. Quien presenta la demostración usa el rol de comité.

### Historia de usuario 1 - Ver el estado del paso de un vistazo (Prioridad: P1)

Como encargado del comité, quiero ver un semáforo grande con una palabra y un mensaje corto, junto al nivel del agua contra el nivel del paso y cuándo fue la última lectura, para saber de un vistazo si el paso es seguro y cuánto confiar en el dato.

**Por qué esta prioridad**: es el valor central del panel. Con solo esta historia ya existe un panel útil: dice si se puede cruzar o no. Todo lo demás se apoya en ella.

**Prueba independiente**: se prueba cargando cada escenario de ejemplo y comprobando que el estado mostrado coincide con el esperado, sin necesidad del pronóstico ni del mensaje para avisar.

**Escenarios de aceptación**:

1. **Dado** un escenario con el nivel por debajo del umbral de Revisar, **cuando** se abre Estado actual, **entonces** se ve el estado **Normal** (verde, círculo, palabra "Normal", mensaje "Paso seguro"), el nivel contra el paso con unidades y "Última lectura hace X min".
2. **Dado** un escenario en que el nivel supera el umbral de Revisar durante varias lecturas seguidas, **cuando** se abre Estado actual, **entonces** se ve **Revisar** (amarillo, triángulo, "Revisa el paso antes de cruzar").
3. **Dado** un escenario en que el nivel supera el umbral de No cruzar durante varias lecturas seguidas, **cuando** se abre Estado actual, **entonces** se ve **No cruzar** (rojo, octágono, "No cruces").
4. **Dado** un escenario con una sola lectura alta aislada entre lecturas normales, **cuando** se abre Estado actual, **entonces** el estado NO cambia.
5. **Dado** un escenario en que el nivel baja de No cruzar, **cuando** se evalúa el estado, **entonces** el panel solo vuelve a un estado menor tras un descenso sostenido (el número de lecturas lo define la configuración).
6. **Dado** un escenario sin lecturas o con la última lectura más vieja que la antigüedad máxima permitida, **cuando** se abre Estado actual, **entonces** se ve **Sin datos** (rombo, "Sin lecturas desde las HH:MM") y NUNCA verde.
7. **Dado** un umbral cambiado en la configuración de ejemplo, **cuando** se recarga el panel, **entonces** el estado cambia sin modificar ningún otro archivo ni el código.
8. **Dado** un escenario con una lectura imposible (por ejemplo, un nivel negativo) entre lecturas válidas, **cuando** se abre Estado actual, **entonces** esa lectura se ignora, se muestra un aviso con cuántas lecturas se descartaron y el estado se calcula con las demás.

---

### Historia de usuario 2 - Elegir el escenario de ejemplo y reconocer que los datos son simulados (Prioridad: P1)

Como comité, quiero elegir fácilmente el escenario de ejemplo y ver siempre que los datos son simulados, para presentar el panel en distintas situaciones sin tocar archivos y sin confundir una demostración con una emergencia real.

**Por qué esta prioridad**: sin selector no se puede demostrar nada más que un escenario, y sin la etiqueta de simulado se arriesga que una prueba se tome por una emergencia. Es condición para todas las demás historias.

**Prueba independiente**: se prueba cambiando entre todos los escenarios con el selector y comprobando que cada pantalla se actualiza sin recargar, mostrando siempre la etiqueta de datos simulados.

**Escenarios de aceptación**:

1. **Dado** el panel abierto, **cuando** se mira la franja bajo la cabecera, **entonces** se ven a la vez la etiqueta "Datos simulados", la nota de que los umbrales de ejemplo son provisionales y el selector de escenarios.
2. **Dado** el selector de escenarios, **cuando** se elige otro escenario, **entonces** la pantalla muestra los datos del nuevo escenario sin recargar la página y sin editar archivos.
3. **Dado** cualquier pantalla que muestre datos simulados, **cuando** se abre, **entonces** la etiqueta "Datos simulados" está visible de forma permanente.
4. **Dado** la carpeta de entrega del panel en una computadora sin internet y sin herramientas instaladas, **cuando** se hace doble clic en su archivo principal, **entonces** el panel abre en el navegador y muestra un escenario con todos sus datos, sin ejecutar comandos.
5. **Dado** un escenario elegido y dejado abierto mucho tiempo, **cuando** pasa el tiempo real, **entonces** el estado, la antigüedad mostrada ("Última lectura hace X min") y el pronóstico NO cambian por sí solos; solo cambian cuando se elige otro escenario.

---

### Historia de usuario 3 - Copiar un mensaje de ejemplo para avisar (Prioridad: P2)

Como encargado del comité, quiero un mensaje de ejemplo según el estado, listo para leer por radio o teléfono y para copiar, para ver cómo avisaría a la gente cercana sin redactarlo en el momento.

**Por qué esta prioridad**: agrega valor práctico al estado, pero el panel ya es útil sin ella.

**Prueba independiente**: se prueba en cada estado comprobando que el mensaje corresponde, que se puede copiar y que el panel confirma la copia.

**Escenarios de aceptación**:

1. **Dado** el estado Normal, Revisar o No cruzar, **cuando** se mira "Qué avisar", **entonces** aparece el mensaje de ejemplo de ese estado.
2. **Dado** un mensaje visible, **cuando** se pulsa "Copiar mensaje", **entonces** el texto queda copiado y el panel confirma que se copió.
3. **Dado** el estado Sin datos, **cuando** se mira "Qué avisar", **entonces** el mensaje dice que no se puede avisar con este panel y que se revise el arroyo en persona, y NUNCA afirma que el paso es seguro.
4. **Dado** cualquier estado, **cuando** se mira la tarjeta, **entonces** se indica que el panel no envía nada y que una persona confirma y avisa.

---

### Historia de usuario 4 - Leer el pronóstico de creciente como un rango (Prioridad: P2)

Como comité, quiero leer una frase que diga cuánto tiempo podría faltar para que el agua llegue a Revisar y a No cruzar, con el nivel actual, el ritmo de subida y una gráfica con banda de incertidumbre, para decidir si avisar o cerrar el paso con anticipación sin confiar en una cifra falsamente exacta.

**Por qué esta prioridad**: da tiempo de reacción, pero depende del estado y de los escenarios (historias 1 y 2).

**Prueba independiente**: se prueba con escenarios de subida (lineal, acelerada, con ruido) comprobando la conclusión, los rangos, el ritmo y la gráfica.

**Escenarios de aceptación**:

1. **Dado** un escenario en que el nivel sube de forma sostenida, **cuando** se abre Pronóstico, **entonces** la primera y más grande lectura es una frase como "Podría llegar a Revisar entre 2.5 y 4 h", antes de la gráfica.
2. **Dado** ese mismo escenario, **cuando** se mira la tarjeta de conclusión, **entonces** se ven el nivel actual, el ritmo de subida en mm por hora con su rango, el nivel proyectado como rango (por ejemplo "entre 570 y 630 mm en 3 h") y la antigüedad del dato.
3. **Dado** ese mismo escenario, **cuando** se mira la gráfica, **entonces** se ven el nivel real, la proyección discontinua, la banda de incertidumbre, las líneas de umbral con el color de su estado y su etiqueta, y el periodo y la unidad; existe además una alternativa en texto.
4. **Dado** un nivel que ya superó un umbral, **cuando** se abre Pronóstico, **entonces** ese umbral dice "Ya superado" en lugar de un rango.
5. **Dado** un umbral que no se proyecta alcanzar dentro del horizonte, **cuando** se abre Pronóstico, **entonces** dice "No se proyecta en las próximas N h" y nunca "más de N h" ni una frase tranquilizadora.
6. **Dado** cualquier pronóstico, **cuando** se mira la pantalla, **entonces** aparecen siempre la nota "Proyección, no medición", el aviso "Una lluvia intensa puede acelerar la subida y hacer que esta proyección se quede corta" y la etiqueta "Datos simulados".
7. **Dado** una lectura espuria aislada, **cuando** se calcula el pronóstico, **entonces** el resultado no cambia de forma brusca.

---

### Historia de usuario 5 - Entender cuándo no hay pronóstico (Prioridad: P2)

Como comité, quiero que el panel diga "Sin pronóstico", la razón y qué hacer cuando no hay datos suficientes, los datos son viejos o el nivel no está subiendo, para no recibir una proyección inventada.

**Por qué esta prioridad**: protege contra el peor error posible (una proyección falsa), y es parte de la honestidad de los datos.

**Prueba independiente**: se prueba con los escenarios de pocas lecturas, lecturas viejas, nivel que baja y nivel plano, comprobando que ninguno muestra una proyección.

**Escenarios de aceptación**:

1. **Dado** un escenario con menos lecturas que el mínimo para pronosticar, **cuando** se abre Pronóstico, **entonces** dice "Sin pronóstico: hacen falta más lecturas", con la razón y qué hacer.
2. **Dado** un escenario con la última lectura más vieja que la antigüedad máxima, **cuando** se abre Pronóstico, **entonces** dice "Sin pronóstico: datos viejos", muestra el último nivel conocido y su antigüedad, y no proyecta.
3. **Dado** un escenario con el nivel bajando o estable, **cuando** se abre Pronóstico, **entonces** dice "Sin pronóstico de creciente", con la razón y qué hacer, y no muestra un tiempo hasta el umbral.
4. **Dado** cualquiera de esos casos, **cuando** se mira la gráfica, **entonces** usa todo el ancho para las últimas horas y no deja espacio reservado para una proyección que no existe.

---

### Historia de usuario 6 - Navegar entre Estado actual y Pronóstico (Prioridad: P2)

Como comité, quiero cambiar entre Estado actual y Pronóstico con una barra de navegación visible, para consultar ambas pantallas sin recargar.

**Por qué esta prioridad**: sin ella el Pronóstico no es alcanzable; es sencilla pero necesaria para el MVP.

**Prueba independiente**: se prueba recorriendo las dos pantallas solo con teclado y solo con mouse.

**Escenarios de aceptación**:

1. **Dado** cualquiera de las dos pantallas, **cuando** se usa la barra de navegación con mouse o teclado, **entonces** se cambia de pantalla sin recargar y el foco siempre es visible.
2. **Dado** la barra de navegación, **cuando** se mira, **entonces** cada pantalla indica su rol ("Para: encargado del comité", "Para: comité") y la pantalla activa se distingue por su relleno, no solo por un subrayado.

---

### Historia de usuario 7 - Confiar en que el estado coincide con el de la baliza (Prioridad: P2)

Como comité, quiero que el estado del panel coincida con el de la baliza física para la misma configuración, para que ambos no se contradigan y la gente no deje de confiar en ellos.

**Por qué esta prioridad**: es una regla del proyecto y condiciona la confianza, pero se comprueba con una tabla de casos y no cambia la forma de la pantalla.

**Prueba independiente**: se prueba ejecutando la tabla de casos de referencia (lecturas, configuración y estado esperado) y comprobando que todos coinciden.

**Escenarios de aceptación**:

1. **Dado** cada caso de la tabla de referencia, **cuando** se calcula el estado, **entonces** coincide con el estado esperado.
2. **Dado** que un caso difiera, **cuando** se revisa, **entonces** se revisa la regla en conjunto y no se ajusta el resultado esperado para que "pase".

---

### Casos límite

- **Lectura espuria aislada**: una sola lectura alta o baja entre lecturas normales no cambia el estado ni altera bruscamente el pronóstico.
- **Valor exactamente en el umbral**: cuenta como umbral alcanzado.
- **Arranque con pocas lecturas**: si hay menos lecturas que las necesarias para sostener un cambio, el estado es la banda más alta de las lecturas disponibles (una sola lectura en No cruzar da No cruzar).
- **Hueco entre lecturas**: si entre dos lecturas pasa más que la antigüedad máxima, el conteo de lecturas sostenidas se reinicia; un hueco exactamente igual no reinicia.
- **Lecturas fuera de orden o con la misma marca de tiempo**: se ordenan por hora; si dos tienen la misma hora, vale la que aparece después en el archivo.
- **Lecturas con hora en el futuro**: se descartan si adelantan más de 60 segundos.
- **Archivo inválido o de otra versión de esquema**: se rechaza con un mensaje claro y accionable, sin trazas internas, y sin pantalla en blanco.
- **Marca de tiempo sin zona horaria**: el archivo se rechaza.
- **Lectura imposible** (por ejemplo, un nivel negativo): se descarta con un aviso visible; si tras descartar no quedan lecturas válidas suficientes, el estado es "Sin datos" y el Pronóstico no proyecta.
- **Nivel plano o con ruido**: no genera proyección de creciente.
- **Nivel que ya superó un umbral**: se muestra "Ya superado".
- **Tiempo proyectado mayor al horizonte máximo**: se muestra "No se proyecta en las próximas N h".
- **Datos viejos en el Pronóstico**: no se proyecta nada; se muestra el último nivel conocido con su antigüedad.
- **Escenario dejado abierto mucho tiempo**: el "ahora" del escenario queda fijo, así que ni el estado ni la antigüedad del dato cambian por el paso del tiempo real; el escenario de lecturas viejas muestra "Sin datos" desde que se elige porque su última lectura ya nace más vieja que la antigüedad máxima.
- **Cambio de escenario**: toda la pantalla (estado, mensaje, pronóstico y gráfica) se actualiza junta, sin mezclar datos del escenario anterior.

## Requisitos *(obligatorio)*

### Requisitos funcionales

**Datos y escenarios**

- **FR-001**: El panel DEBE mostrar el estado del paso (Normal, Revisar, No cruzar o Sin datos) calculado únicamente con la configuración (`config.json`) y las lecturas (`readings.json`) del escenario activo.
- **FR-002**: El panel DEBE validar los datos de cada escenario al cargarlos (estructura, versión de esquema y marcas de tiempo con zona horaria) y rechazar un archivo inválido con un mensaje claro y accionable, sin mostrar trazas internas y sin dejar la pantalla en blanco.
- **FR-003**: El panel DEBE ofrecer un selector de escenarios siempre visible, junto a la etiqueta "Datos simulados", con todos los escenarios de ejemplo, que cambie de escenario sin recargar y sin editar archivos.
- **FR-004**: El panel DEBE mostrar de forma permanente la etiqueta "Datos simulados" en toda pantalla que muestre datos simulados, e indicar que los umbrales de ejemplo son provisionales.
- **FR-005**: El panel NUNCA DEBE modificar las lecturas: las consume en solo lectura.
- **FR-006**: Los umbrales, el nivel del paso, el número de lecturas sostenidas para subir y para bajar, la antigüedad máxima de un dato válido y los parámetros del pronóstico (ventana de cálculo, mínimo de lecturas y horizonte máximo) DEBEN leerse de la configuración; ninguno se escribe en el código ni en la interfaz.
- **FR-034**: El panel DEBE ofrecer una pantalla "Mapa" con un mapa de Huauchinango (con Necaxa) y Xicotepec de Juárez y balizas de ejemplo sobre un arroyo; cada baliza muestra su estado con forma, color y palabra y su nivel en mm, el mapa funciona sin internet y atribuye INEGI y OpenStreetMap. *(Cambio del 2026-10-16, pedido por el autor.)*
- **FR-032**: En cada escenario el "ahora" DEBE quedar fijo: la antigüedad de la última lectura es siempre la misma mientras el escenario esté elegido, y el estado y el pronóstico no cambian por el paso del tiempo real.
- **FR-033**: El panel DEBE descartar una lectura imposible (por ejemplo, un nivel negativo), mostrar un aviso con cuántas lecturas descartó y calcular el estado y el pronóstico con las lecturas válidas; si no quedan suficientes, DEBE mostrar "Sin datos" y no proyectar.

**Estado actual**

- **FR-007**: El estado DEBE cambiar solo ante una condición sostenida durante el número de lecturas definido en la configuración; una lectura aislada no lo cambia, y volver a un estado menor exige un descenso sostenido (subir y bajar usan ventanas distintas).
- **FR-008**: Mientras haya menos lecturas que las necesarias para sostener un cambio, el estado DEBE ser la banda más alta de las lecturas disponibles.
- **FR-009**: Un hueco entre dos lecturas mayor que la antigüedad máxima DEBE reiniciar el conteo de lecturas sostenidas; un hueco exactamente igual no.
- **FR-010**: Un valor igual al umbral DEBE contar como umbral alcanzado.
- **FR-011**: El panel DEBE mostrar "Sin datos", con la hora de la última lectura, cuando no hay lecturas o la última es más vieja que la antigüedad máxima, y NUNCA debe mostrar Normal ni verde en ese caso.
- **FR-012**: El panel DEBE ordenar las lecturas por hora, descartar las que adelantan más de 60 segundos y, ante marcas de tiempo iguales, usar la que aparece después en el archivo.
- **FR-013**: Cada estado DEBE comunicarse con color, forma, ícono y palabra a la vez (Normal: verde, círculo; Revisar: amarillo, triángulo; No cruzar: rojo, octágono; Sin datos: rombo vacío), con un mensaje corto, y DEBE anunciarse a lectores de pantalla.
- **FR-014**: El panel DEBE mostrar el nivel actual contra el nivel del paso, con unidades, y la antigüedad del dato en la forma "Última lectura hace X min".

**Mensaje para avisar**

- **FR-015**: El panel DEBE mostrar un mensaje de ejemplo según el estado vigente, permitir copiarlo y confirmar que se copió.
- **FR-016**: El mensaje NUNCA DEBE afirmar que el paso es seguro cuando el estado es Sin datos, y el panel NUNCA DEBE enviar el mensaje por ningún medio: una persona lo confirma y lo difunde.

**Pronóstico de creciente**

- **FR-017**: El Pronóstico DEBE abrir con una conclusión en una frase, lo más grande de la pantalla, antes de la gráfica; la gráfica nunca aparece sin una frase que diga qué significa.
- **FR-018**: El pronóstico DEBE expresarse SIEMPRE como rango (tiempo hasta cada umbral y nivel proyectado), nunca como un número único, y el método y sus supuestos DEBEN ser visibles y marcados como "Supuesto".
- **FR-019**: El panel DEBE mostrar junto al pronóstico el nivel actual (o el último conocido si los datos son viejos), el ritmo de subida en mm por hora con la misma precisión que su rango y la antigüedad del dato.
- **FR-020**: La gráfica DEBE mostrar el nivel real, la proyección discontinua, la banda de incertidumbre, las líneas de umbral con el color de su estado y su etiqueta, y el periodo y la unidad, y DEBE tener una alternativa en texto.
- **FR-021**: Si el nivel ya superó un umbral, el panel DEBE indicar "Ya superado" para ese umbral en lugar de un rango.
- **FR-022**: Si el tiempo proyectado supera el horizonte máximo, el panel DEBE decir "No se proyecta en las próximas N h", y NUNCA "más de N h" ni una frase que suene tranquilizadora.
- **FR-023**: El Pronóstico DEBE incluir siempre la nota "Proyección, no medición" y el aviso "Una lluvia intensa puede acelerar la subida y hacer que esta proyección se quede corta".
- **FR-024**: El panel NO DEBE proyectar cuando hay menos lecturas que el mínimo, cuando los datos son viejos o cuando el nivel está estable o bajando; en esos casos DEBE decir "Sin pronóstico", la razón y qué hacer, y la gráfica DEBE usar todo el ancho sin espacio reservado para una proyección.
- **FR-025**: El cálculo del pronóstico DEBE dar siempre el mismo resultado con las mismas lecturas y la misma configuración, y DEBE ser robusto ante una lectura espuria aislada.
- **FR-026**: La sección "Cómo se calcula" DEBE mostrar siempre un resumen en texto; los parámetros pueden ir en un despliegue, pero nunca una sección con solo un título.
- **FR-032**: Todas las cifras de agua (nivel, umbrales, ritmo, nivel proyectado y lluvia) DEBEN mostrarse en milímetros (mm), como en una app del clima. *(Cambio del 2026-10-16.)*
- **FR-033**: El Estado actual DEBE mostrar la lluvia acumulada en mm para cada ventana de `rain_windows_h` (por ejemplo última hora, 3 h y 6 h), calculada con el "ahora" fijo; con "Sin datos" NO DEBE mostrar cifras de lluvia. El Pronóstico DEBE mostrar la lluvia de la última hora. La lluvia es informativa: NO entra en la clasificación ni en el pronóstico. *(Cambio del 2026-10-16; la tarjeta "Lluvia" cambia la composición aprobada; el usuario la aprobó el 2026-10-16.)*

**Navegación y presentación**

- **FR-027**: El panel DEBE ofrecer una barra de navegación visible entre Estado actual y Pronóstico, usable con teclado y con mouse, con foco visible; cada pantalla DEBE indicar su rol y la activa se distingue por relleno.
- **FR-028**: Cada pantalla DEBE coincidir, a 1440 × 900, con su maqueta aprobada en composición, jerarquía y tamaños relativos; es solo para escritorio y no lleva animaciones ni transiciones de color.
- **FR-029**: Los textos de la interfaz DEBEN estar en español y centralizados en un solo lugar.
- **FR-030**: El panel DEBE poder abrirse con doble clic sobre un archivo de una carpeta de entrega, en el navegador, sin instalar nada, sin ejecutar comandos y sin depender de una conexión a internet, y DEBE mostrar todos los escenarios con sus datos incluidos en esa carpeta.

**Verificación de la regla de estado**

- **FR-031**: La regla de clasificación del estado DEBE comprobarse contra una tabla de casos de referencia (lecturas, configuración y estado esperado), y el pronóstico contra una tabla de 20 o más casos calculados a mano.

### Entidades clave

- **Escenario**: una situación de ejemplo simulada (por ejemplo tormenta normal, ciclón, estiaje, nivel que baja, pocas lecturas, lecturas viejas). Agrupa una configuración y una serie de lecturas, y se elige desde el selector.
- **Configuración (`config.json`)**: umbrales de Revisar y No cruzar, nivel del paso, lecturas sostenidas para subir y para bajar, antigüedad máxima de un dato válido, parámetros del pronóstico (ventana, mínimo de lecturas, horizonte), versión de esquema y marca de que los valores son supuestos.
- **Lectura (`readings.json`)**: marca de tiempo con zona horaria, nivel del agua en mm sobre una cota de referencia y marca de dato simulado. Solo se agregan, nunca se editan.
- **Estado del paso**: Normal, Revisar, No cruzar o Sin datos, calculado a partir de la configuración y las lecturas.
- **Pronóstico**: ritmo de subida, rango de tiempo hasta cada umbral, banda de nivel proyectado y razón cuando no hay pronóstico.
- **Mensaje de ejemplo**: texto corto asociado a cada estado, para copiar; no se envía.
- **Evento y Reporte (`events.json`, `reports.json`)**: se dejan definidos pero este MVP no los usa.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: Al abrir Estado actual, al menos el 90 % de las personas de una prueba con 5 encargados identifica correctamente el estado del paso en menos de 5 segundos.
- **SC-002**: Quien presenta puede pasar de un escenario a otro en menos de 3 segundos, con a lo sumo 2 interacciones y sin recargar ni editar archivos.
- **SC-003**: El 100 % de los casos de referencia de la clasificación del estado y el 100 % de los 20 o más casos del pronóstico dan el resultado esperado.
- **SC-004**: En todos los escenarios de ejemplo hay 0 apariciones de Normal con datos ausentes o viejos, 0 pronósticos presentados como número único y 0 proyecciones con datos insuficientes, viejos o con el nivel bajando.
- **SC-005**: El flujo completo de la demostración (tormenta normal → ciclón → pronóstico → estiaje → pocas lecturas → lecturas viejas) se recorre de principio a fin sin editar archivos, salvo el paso de cambiar un umbral.
- **SC-006**: Al menos el 90 % de las personas de una prueba con 5 miembros del comité explica con sus palabras cuándo podría llegar el agua a Revisar tras leer solo la conclusión del Pronóstico, sin explicación previa.
- **SC-007**: Cambiar un umbral en la configuración de ejemplo cambia el estado mostrado en menos de 1 minuto, sin modificar el código.
- **SC-008**: Los 4 estados se distinguen entre sí en escala de grises en el 100 % de las pruebas.
- **SC-009**: Una captura a 1440 × 900 de cada pantalla coincide con su maqueta aprobada en composición, jerarquía y tamaños relativos, sin diferencias que el autor rechace.
- **SC-010**: Dejar abierto cualquier escenario durante 30 minutos no cambia su estado ni la antigüedad del dato mostrada.
- **SC-011**: En una computadora sin internet y sin herramientas instaladas, el panel abre con doble clic y muestra un escenario completo en menos de 5 segundos.

## Supuestos

- Los usuarios son encargados y líderes del comité (y, en la demostración, quien presenta) que usan una computadora de escritorio con mouse y teclado. El vecino no usa el panel.
- La app es una demostración local con escenarios simulados; no hay datos reales, ni conexión con un nodo, un simulador o servicios externos.
- El "nivel del paso" se entiende como el nivel del agua en mm sobre una cota de referencia, no como la distancia medida por un sensor. Quien produce los datos resuelve la conversión antes de escribir el archivo.
- Los umbrales de ejemplo (Revisar 600 mm, No cruzar 850 mm, paso 1000 mm) y los parámetros del pronóstico son supuestos provisionales, no mediciones, y no son los del arroyo real; la configuración los marca como supuestos.
- Valores iniciales de la configuración de ejemplo, todos supuestos provisionales: subir de estado con 3 lecturas seguidas, bajar con 5, lectura vieja a partir de 30 minutos, ventana de cálculo del pronóstico de 2 h, mínimo de 6 lecturas para pronosticar y horizonte máximo de 6 h (estos tres últimos son los que muestran las maquetas aprobadas). Siguen leyéndose de la configuración y no se escriben en el código.
- El método de extrapolación del pronóstico y cómo se calcula y se ensancha el rango se deciden en la fase de planeación o aclaración; esta especificación solo exige que sea explicable, reproducible y mostrado como rango.
- Qué cuenta como "lectura imposible" (límites del rango plausible del nivel) se define al planear; esta especificación solo exige el comportamiento ante ella.
- Los mensajes de ejemplo son un borrador para la demostración, no un protocolo oficial; antes de un uso real los debe aprobar el comité.
- La entrega del panel es una carpeta que se abre con doble clic; cómo se arma internamente (por ejemplo, con los escenarios incluidos dentro de la aplicación) se decide en la planeación. Durante el desarrollo se puede usar un servidor local, pero la entrega no lo exige.
- Las maquetas de Estado actual y Pronóstico (`docs/design/`) están aprobadas desde el 2026-10-16; un cambio de composición se aprueba de nuevo antes de implementarlo.
- **Fuera de alcance**: funcionamiento sin red como característica específica (sprint opcional posterior), datos reales o conexión con sensores, reportes de vecinos, Laderas, Recomendador verde, Panel institucional, modelo hidrológico o cálculo del pronóstico con lluvia acumulada o saturación del suelo (la lluvia solo se muestra, no se usa para calcular), notificaciones o envío de avisos, edición de la configuración desde el panel, auditoría completa del tema oscuro, mapas y versión para celular o tableta.
