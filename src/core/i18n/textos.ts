// Todos los textos de la interfaz, en español y centralizados (principio IX, FR-029).
// Los componentes piden aquí sus textos; ninguno escribe texto suelto.

export type EstadoClave = 'normal' | 'review' | 'stop' | 'nodata';

export const textos = {
  marca: {
    nombre: 'Piski',
    logoAlt: 'Logo de Piski: una gota de agua con montañas y un arroyo',
    subtitulo: 'Panel de monitoreo',
  },

  navegacion: {
    etiqueta: 'Pantallas',
    estado: { nombre: 'Estado actual', rol: 'Para: encargado del comité' },
    pronostico: { nombre: 'Pronóstico', rol: 'Para: comité' },
    mapa: { nombre: 'Mapa', rol: 'Para: comité' },
  },

  pantallas: {
    estado: { titulo: 'Estado actual', rol: 'Para: encargado del comité' },
    pronostico: { titulo: 'Pronóstico de creciente', rol: 'Para: comité' },
    mapa: { titulo: 'Mapa de balizas', rol: 'Para: comité' },
  },

  franja: {
    etiqueta: 'Datos simulados',
    noSonReales: 'No son lecturas reales del arroyo.',
    umbralesProvisionales: 'Los umbrales de ejemplo son provisionales.',
    selector: 'Escenario de ejemplo',
    grupoDemo: 'Demostración',
    grupoPrueba: 'Casos de prueba',
  },

  carga: {
    cargando: 'Cargando datos…',
    errorTitulo: 'No se pudieron leer los datos del escenario',
    sinEscenario: 'Aún no hay un escenario cargado. Elige uno en el selector de escenarios.',
  },

  estados: {
    normal: { palabra: 'Normal', corto: 'Paso seguro', forma: 'Círculo' },
    review: { palabra: 'Revisar', corto: 'Revisa el paso antes de cruzar', forma: 'Triángulo' },
    stop: { palabra: 'No cruzar', corto: 'No cruces', forma: 'Octágono' },
    nodata: { palabra: 'Sin datos', corto: '', forma: 'Rombo' },
  },
  sinLecturasDesde: (hora: string) => `Sin lecturas desde las ${hora}`,
  sinLecturas: 'Sin lecturas',

  nivel: {
    titulo: 'Nivel actual contra el paso',
    sinLectura: 'sin lectura vigente',
    delPaso: (mm: string) => `de ${mm} mm del paso`,
    marcaRevisar: 'Revisar',
    marcaNoCruzar: 'No cruzar',
    marcaPaso: 'Paso',
    faltanRevisar: (mm: string) => `Faltan ${mm} mm para Revisar`,
    faltanNoCruzar: (mm: string) => `Faltan ${mm} mm para No cruzar`,
    faltanPaso: (mm: string) => `Faltan ${mm} mm para el nivel del paso`,
    sobrePaso: 'El agua ya llegó al nivel del paso',
    ultimoConocido: (mm: string, hora: string) =>
      `El último nivel conocido (${mm} mm a las ${hora}) no se usa para decidir.`,
    sinDato: '—',
  },

  antiguedad: {
    titulo: 'Antigüedad del dato',
    ultimaLectura: (edad: string) => `Última lectura ${edad}`,
    hace: (edad: string, fecha: string) => `${edad} · ${fecha}`,
  },

  avisar: {
    titulo: 'Qué avisar',
    etiqueta: 'Sugerido',
    copiar: 'Copiar mensaje',
    copiado: 'Mensaje copiado',
    noCopiado: 'No se pudo copiar. Selecciona el texto y cópialo a mano.',
    nota: 'El panel no envía nada. Tú confirmas y avisas.',
    // Mensajes de ejemplo para la demostración: no son un protocolo oficial.
    mensajes: {
      normal: 'El paso está normal. No hay aviso que dar.',
      review: 'El arroyo está en Revisar. Pedimos que revisen el paso antes de cruzar.',
      stop: 'El arroyo llegó a No cruzar. Pedimos que nadie cruce el paso.',
      nodata:
        'No hay lecturas recientes. No se puede avisar con este panel; revisen el arroyo en persona.',
    } satisfies Record<EstadoClave, string>,
  },

  lluvia: {
    titulo: 'Lluvia',
    /** "en la última hora" / "en las últimas 3 h": acompaña a la cifra principal. */
    enVentana: (horas: number) => (horas === 1 ? 'en la última hora' : `en las últimas ${horas} h`),
    /** "Última hora" / "Últimas 3 h": etiqueta de cada renglón. */
    ventana: (horas: number) => (horas === 1 ? 'Última hora' : `Últimas ${horas} h`),
    sinDatos: 'Sin lecturas recientes: no se puede calcular la lluvia.',
    nota: 'Lluvia caída según las lecturas del escenario.',
  },

  descartadas: (n: number) =>
    n === 1 ? 'Se descartó 1 lectura fuera de rango' : `Se descartaron ${n} lecturas fuera de rango`,

  pronostico: {
    notaProyeccion: 'Proyección, no medición',
    avisoLluvia:
      'Una lluvia intensa puede acelerar la subida y hacer que esta proyección se quede corta.',
    conclusionEtiqueta: 'Conclusión',
    filas: {
      nivelActual: 'Nivel actual',
      ultimoNivel: 'Último nivel conocido',
      ritmo: 'Ritmo actual',
      proyectado: 'Nivel proyectado',
      ultimaLectura: 'Última lectura',
      umbral: (nombre: string, mm: string) => `${nombre} (${mm} mm)`,
    },
    valores: {
      superado: 'ya superado',
      rango: (a: string, b: string) => `entre ${a} y ${b} h`,
      desde: (a: string) => `a partir de ${a} h`,
      noSeProyecta: (n: string) => `No se proyecta en las próximas ${n} h`,
      sinCalcular: 'Sin calcular',
      ritmoRango: (a: string, b: string) => `entre ${a} y ${b} mm/h`,
      proyectadoRango: (a: string, b: string, h: string) => `entre ${a} y ${b} mm en ${h} h`,
    },
    conclusion: {
      revisarRango: (a: string, b: string) => `Podría llegar a Revisar entre ${a} y ${b} h`,
      revisarDesde: (a: string) => `Podría llegar a Revisar a partir de ${a} h`,
      revisarNo: (n: string) => `No se proyecta llegar a Revisar en las próximas ${n} h`,
      noCruzarRango: (a: string, b: string) =>
        `Ya superó Revisar. Podría llegar a No cruzar entre ${a} y ${b} h`,
      noCruzarDesde: (a: string) =>
        `Ya superó Revisar. Podría llegar a No cruzar a partir de ${a} h`,
      noCruzarNo: (n: string) =>
        `Ya superó Revisar. No se proyecta llegar a No cruzar en las próximas ${n} h`,
      noCruzarSuperado: 'Ya superó No cruzar',
    },
    sin: {
      pocasLecturas: {
        titulo: 'Sin pronóstico: hacen falta más lecturas',
        razon: (n: number, min: number) =>
          `Hay ${n} lecturas y se necesitan al menos ${min} para calcular el ritmo.`,
        accion: 'Espera unos minutos. Mientras tanto, usa Estado actual.',
      },
      viejos: {
        titulo: 'Sin pronóstico: datos viejos',
        razon: (hora: string, edad: string) => `La última lectura es de las ${hora}, ${edad}.`,
        sinLecturas: 'No hay lecturas válidas.',
        accion: 'No uses esta proyección. Revisa el arroyo en persona.',
      },
      bajando: {
        titulo: 'Sin pronóstico de creciente',
        razon: (ritmo: string) => `El nivel está bajando (${ritmo} mm/h).`,
        accion: 'No hay aviso de creciente. Sigue vigilando el arroyo.',
      },
      estable: {
        titulo: 'Sin pronóstico de creciente',
        razon: 'El nivel está estable.',
        accion: 'No hay aviso de creciente. Sigue vigilando el arroyo.',
      },
    },
  },

  mapa: {
    tituloMapa: 'Región y balizas',
    alternativa:
      'Mapa de Huauchinango y Xicotepec de Juárez con la ubicación de las balizas sobre el arroyo La Morena',
    tituloBalizas: 'Balizas',
    seleccionada: 'Seleccionada',
    nivel: (mm: string) => `${mm} mm`,
    sinLectura: 'Sin lectura vigente',
    leyenda: {
      arroyo: 'Arroyo de ejemplo: La Morena',
      cauces: 'Otros cauces',
      presas: 'Presas',
      municipio: 'Límite municipal',
    },
    nota: 'Las balizas del mapa son de ejemplo: todas siguen el escenario elegido y cada una mide un nivel distinto. El panel no recibe datos de balizas reales.',
    necaxaAprox: 'Necaxa: ubicación aproximada.',
    marcaBaliza: (nombre: string, estado: string) => `${nombre}: ${estado}`,
  },
  porHora: {
    titulo: 'Proyección por hora',
    subtitulo: (horas: string) => `Nivel esperado en mm durante las próximas ${horas} h · proyección, no medición`,
    ahora: 'Ahora',
    rango: (bajo: string, alto: string) => `${bajo} a ${alto} mm`,
  },
  grafica: {
    tituloConProyeccion: 'Nivel y proyección',
    tituloSolo: 'Nivel',
    subtituloConProyeccion: (horas: string) => `Últimas 6 h y próximas ${horas} h · nivel en mm`,
    subtituloSolo: 'Últimas 6 h · nivel en mm',
    alternativa: 'Gráfica del nivel del arroyo en milímetros',
    leyendaReal: 'Nivel real',
    leyendaProyeccion: 'Proyección',
    leyendaBanda: 'Banda de incertidumbre',
    ahora: 'ahora',
    verTabla: 'Ver datos como tabla',
    tabla: { hora: 'Hora', nivel: 'Nivel', origen: 'Origen', medido: 'Medido', proyeccion: 'Proyección' },
    sinLectura: 'Sin lectura',
    umbral: (nombre: string, mm: string) => `${nombre}: ${mm} mm`,
  },

  metodo: {
    titulo: 'Cómo se calcula',
    supuesto: 'Supuesto',
    resumen: (ventana: string) =>
      `Se extrapola el ritmo de subida de las últimas ${ventana} h. El rango sale de cuánto varía ese ritmo y se ensancha con el tiempo. Es una proyección didáctica, no un modelo hidrológico validado ni un sustituto de una alerta oficial.`,
    verParametros: 'Ver parámetros',
    ventana: 'Ventana de cálculo',
    minimoLecturas: 'Mínimo de lecturas',
    horizonte: 'Horizonte máximo',
    horas: (n: string) => `${n} h`,
  },

  errores: {
    archivo: (archivo: string, detalle: string) =>
      `El archivo ${archivo} no es válido. ${detalle}`,
    arreglo: 'Revisa que respete el contrato de data/ESQUEMA.md.',
    versionEsquema: (archivo: string, version: unknown) =>
      `El archivo ${archivo} usa la versión de esquema ${String(version)}, pero el panel solo soporta la versión 1. Vuelve a generarlo con el esquema actual.`,
    jsonRoto: (archivo: string) =>
      `El archivo ${archivo} no es un JSON válido. Revisa que no le falten comas, comillas o llaves.`,
    zonaHoraria: (archivo: string) =>
      `El archivo ${archivo} tiene marcas de tiempo sin zona horaria. Agrega la zona (por ejemplo -06:00 o Z).`,
    idDistinto: (carpeta: string, id: string) =>
      `El archivo escenario.json de la carpeta ${carpeta} declara el id "${id}". El id debe coincidir con el nombre de la carpeta.`,
    ahoraAnterior: (carpeta: string) =>
      `El "ahora" del escenario ${carpeta} es anterior a su última lectura. Corrige la marca "now" de escenario.json.`,
    noExiste: (id: string) => `No existe el escenario "${id}". Elige otro en el selector de escenarios.`,
    faltaArchivo: (carpeta: string, archivo: string) =>
      `Al escenario ${carpeta} le falta el archivo ${archivo}. Vuelve a generar los escenarios con npm run generar:escenarios.`,
  },
} as const;
