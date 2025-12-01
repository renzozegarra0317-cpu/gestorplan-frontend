export interface CategoriaReporte {
  id: string;
  nombre: string;
  descripcion: string;
  icon: string;
  color: string;
  reportes: ReporteItem[];
}

export interface ReporteItem {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  icon: string;
  tipo: TipoReporte;
  formatosDisponibles: FormatoExportacion[];
  requiereFiltros: boolean;
  tieneGraficos: boolean;
  frecuenciaUso: 'Alta' | 'Media' | 'Baja';
}

export type TipoReporte = 
  | 'Planillas'
  | 'Beneficios'
  | 'Trabajadores'
  | 'Asistencia'
  | 'Tributario'
  | 'Gerencial'
  | 'Bancario'
  | 'Legal';

export type FormatoExportacion = 'Excel' | 'PDF' | 'CSV' | 'TXT';

export interface FiltrosReporte {
  fechaInicio?: Date;
  fechaFin?: Date;
  mes?: number;
  anio?: number;
  area?: string;
  tipoContrato?: string;
  trabajadorId?: number;
  estado?: string;
}

export interface ConfiguracionReporte {
  incluirGraficos: boolean;
  incluirResumen: boolean;
  incluirDetalle: boolean;
  agruparPor?: string;
  ordenarPor?: string;
  orientacion: 'Portrait' | 'Landscape';
}

export interface ResultadoReporte {
  reporteId: string;
  nombreReporte: string;
  fechaGeneracion: Date;
  formato: FormatoExportacion;
  totalRegistros: number;
  datos: any[];
  resumen?: ResumenReporte;
  graficos?: GraficoReporte[];
}

export interface ResumenReporte {
  totalGeneral: number;
  totalIngresos?: number;
  totalDescuentos?: number;
  totalNeto?: number;
  promedios?: { [key: string]: number };
  totales?: { [key: string]: number };
}

export interface GraficoReporte {
  tipo: 'bar' | 'pie' | 'line' | 'area';
  titulo: string;
  datos: any[];
  labels: string[];
  colores?: string[];
}

export interface HistorialReporte {
  id: number;
  reporteNombre: string;
  fechaGeneracion: Date;
  formato: FormatoExportacion;
  generadoPor: string;
  tamanioArchivo: string;
  urlDescarga: string;
}

export const CATEGORIAS_REPORTES: CategoriaReporte[] = [
  {
    id: 'planillas',
    nombre: 'Planillas',
    descripcion: 'Reportes de planillas y remuneraciones',
    icon: '📊',
    color: '#3b82f6',
    reportes: [
      {
        id: 'planilla-mensual',
        codigo: 'RPL-001',
        nombre: 'Planilla Mensual Consolidada',
        descripcion: 'Resumen consolidado de la planilla del mes',
        icon: '📄',
        tipo: 'Planillas',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: true,
        tieneGraficos: true,
        frecuenciaUso: 'Alta'
      },
      {
        id: 'planilla-analitica',
        codigo: 'RPL-002',
        nombre: 'Planilla Analítica',
        descripcion: 'Detalle completo por concepto y trabajador',
        icon: '📋',
        tipo: 'Planillas',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: true,
        tieneGraficos: false,
        frecuenciaUso: 'Alta'
      },
      {
        id: 'planilla-area',
        codigo: 'RPL-003',
        nombre: 'Planilla por Área',
        descripcion: 'Planilla agrupada por área o gerencia',
        icon: '🏢',
        tipo: 'Planillas',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: true,
        tieneGraficos: true,
        frecuenciaUso: 'Media'
      },
      {
        id: 'comparativo-mensual',
        codigo: 'RPL-004',
        nombre: 'Comparativo Mensual',
        descripcion: 'Comparación entre periodos de planilla',
        icon: '📈',
        tipo: 'Planillas',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: true,
        tieneGraficos: true,
        frecuenciaUso: 'Media'
      },
      {
        id: 'resumen-descuentos',
        codigo: 'RPL-005',
        nombre: 'Resumen de Descuentos',
        descripcion: 'Consolidado de todos los descuentos',
        icon: '➖',
        tipo: 'Planillas',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: true,
        tieneGraficos: true,
        frecuenciaUso: 'Alta'
      },
      {
        id: 'aportes-empleador',
        codigo: 'RPL-006',
        nombre: 'Aportes del Empleador',
        descripcion: 'Resumen de aportes patronales',
        icon: '🏛️',
        tipo: 'Planillas',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: true,
        tieneGraficos: false,
        frecuenciaUso: 'Alta'
      }
    ]
  },
  {
    id: 'beneficios',
    nombre: 'Beneficios',
    descripcion: 'Reportes de beneficios laborales',
    icon: '🎁',
    color: '#10b981',
    reportes: [
      {
        id: 'reporte-cts',
        codigo: 'RBEN-001',
        nombre: 'Reporte de CTS',
        descripcion: 'Detalle de CTS por periodo',
        icon: '💰',
        tipo: 'Beneficios',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: true,
        tieneGraficos: true,
        frecuenciaUso: 'Alta'
      },
      {
        id: 'reporte-gratificaciones',
        codigo: 'RBEN-002',
        nombre: 'Reporte de Gratificaciones',
        descripcion: 'Gratificaciones de Julio y Diciembre',
        icon: '🎁',
        tipo: 'Beneficios',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: true,
        tieneGraficos: true,
        frecuenciaUso: 'Alta'
      },
      {
        id: 'reporte-vacaciones',
        codigo: 'RBEN-003',
        nombre: 'Reporte de Vacaciones',
        descripcion: 'Estado de vacaciones por trabajador',
        icon: '🏖️',
        tipo: 'Beneficios',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: true,
        tieneGraficos: true,
        frecuenciaUso: 'Media'
      },
      {
        id: 'reporte-utilidades',
        codigo: 'RBEN-004',
        nombre: 'Reporte de Utilidades',
        descripcion: 'Distribución de utilidades anual',
        icon: '💼',
        tipo: 'Beneficios',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: true,
        tieneGraficos: true,
        frecuenciaUso: 'Baja'
      },
      {
        id: 'consolidado-beneficios',
        codigo: 'RBEN-005',
        nombre: 'Consolidado Anual de Beneficios',
        descripcion: 'Todos los beneficios del año',
        icon: '📊',
        tipo: 'Beneficios',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: true,
        tieneGraficos: true,
        frecuenciaUso: 'Media'
      }
    ]
  },
  {
    id: 'trabajadores',
    nombre: 'Trabajadores',
    descripcion: 'Reportes de personal y RRHH',
    icon: '👥',
    color: '#8b5cf6',
    reportes: [
      {
        id: 'listado-trabajadores',
        codigo: 'RTRB-001',
        nombre: 'Listado General de Trabajadores',
        descripcion: 'Listado completo del personal',
        icon: '📋',
        tipo: 'Trabajadores',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: true,
        tieneGraficos: false,
        frecuenciaUso: 'Alta'
      },
      {
        id: 'trabajadores-area',
        codigo: 'RTRB-002',
        nombre: 'Trabajadores por Área',
        descripcion: 'Personal agrupado por área',
        icon: '🏢',
        tipo: 'Trabajadores',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: true,
        tieneGraficos: true,
        frecuenciaUso: 'Media'
      },
      {
        id: 'ceses-periodo',
        codigo: 'RTRB-003',
        nombre: 'Ceses del Periodo',
        descripcion: 'Trabajadores que cesaron',
        icon: '🚪',
        tipo: 'Trabajadores',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: true,
        tieneGraficos: true,
        frecuenciaUso: 'Media'
      },
      {
        id: 'ingresos-periodo',
        codigo: 'RTRB-004',
        nombre: 'Ingresos del Periodo',
        descripcion: 'Nuevos trabajadores ingresados',
        icon: '🆕',
        tipo: 'Trabajadores',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: true,
        tieneGraficos: true,
        frecuenciaUso: 'Media'
      },
      {
        id: 'antiguedad',
        codigo: 'RTRB-005',
        nombre: 'Antigüedad de Trabajadores',
        descripcion: 'Tiempo de servicio del personal',
        icon: '⏳',
        tipo: 'Trabajadores',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: false,
        tieneGraficos: true,
        frecuenciaUso: 'Baja'
      },
      {
        id: 'cumpleanos',
        codigo: 'RTRB-006',
        nombre: 'Cumpleaños del Mes',
        descripcion: 'Trabajadores que cumplen años',
        icon: '🎂',
        tipo: 'Trabajadores',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: true,
        tieneGraficos: false,
        frecuenciaUso: 'Media'
      }
    ]
  },
  {
    id: 'asistencia',
    nombre: 'Asistencia',
    descripcion: 'Reportes de control de asistencia',
    icon: '📅',
    color: '#f59e0b',
    reportes: [
      {
        id: 'asistencia-mensual',
        codigo: 'RAST-001',
        nombre: 'Asistencia Mensual',
        descripcion: 'Consolidado de asistencia del mes',
        icon: '📊',
        tipo: 'Asistencia',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: true,
        tieneGraficos: true,
        frecuenciaUso: 'Alta'
      },
      {
        id: 'tardanzas',
        codigo: 'RAST-002',
        nombre: 'Reporte de Tardanzas',
        descripcion: 'Tardanzas e inasistencias',
        icon: '⏰',
        tipo: 'Asistencia',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: true,
        tieneGraficos: true,
        frecuenciaUso: 'Alta'
      },
      {
        id: 'horas-extras',
        codigo: 'RAST-003',
        nombre: 'Horas Extras',
        descripcion: 'Registro de horas extras trabajadas',
        icon: '⏱️',
        tipo: 'Asistencia',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: true,
        tieneGraficos: true,
        frecuenciaUso: 'Alta'
      },
      {
        id: 'licencias-permisos',
        codigo: 'RAST-004',
        nombre: 'Licencias y Permisos',
        descripcion: 'Registro de licencias otorgadas',
        icon: '📝',
        tipo: 'Asistencia',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: true,
        tieneGraficos: false,
        frecuenciaUso: 'Media'
      }
    ]
  },
  {
    id: 'tributario',
    nombre: 'Tributario',
    descripcion: 'Reportes para entidades externas',
    icon: '🏛️',
    color: '#ef4444',
    reportes: [
      {
        id: 'plame',
        codigo: 'RTRI-001',
        nombre: 'PLAME (T-Registro)',
        descripcion: 'Archivo para SUNAT',
        icon: '📄',
        tipo: 'Tributario',
        formatosDisponibles: ['TXT', 'Excel'],
        requiereFiltros: true,
        tieneGraficos: false,
        frecuenciaUso: 'Alta'
      },
      {
        id: 'afp-net',
        codigo: 'RTRI-002',
        nombre: 'AFP NET',
        descripcion: 'Archivo para AFP',
        icon: '💳',
        tipo: 'Tributario',
        formatosDisponibles: ['TXT', 'Excel'],
        requiereFiltros: true,
        tieneGraficos: false,
        frecuenciaUso: 'Alta'
      },
      {
        id: 'renta-quinta',
        codigo: 'RTRI-003',
        nombre: 'PDT Renta 5ta Categoría',
        descripcion: 'Declaración de renta de trabajadores',
        icon: '📋',
        tipo: 'Tributario',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: true,
        tieneGraficos: false,
        frecuenciaUso: 'Alta'
      },
      {
        id: 'essalud',
        codigo: 'RTRI-004',
        nombre: 'EsSalud',
        descripcion: 'Declaración para EsSalud',
        icon: '🏥',
        tipo: 'Tributario',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: true,
        tieneGraficos: false,
        frecuenciaUso: 'Alta'
      }
    ]
  },
  {
    id: 'gerencial',
    nombre: 'Gerencial',
    descripcion: 'Reportes para la alta dirección',
    icon: '📈',
    color: '#06b6d4',
    reportes: [
      {
        id: 'costo-laboral',
        codigo: 'RGER-001',
        nombre: 'Costo Laboral Mensual',
        descripcion: 'Análisis de costos de personal',
        icon: '💰',
        tipo: 'Gerencial',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: true,
        tieneGraficos: true,
        frecuenciaUso: 'Alta'
      },
      {
        id: 'distribucion-costos',
        codigo: 'RGER-002',
        nombre: 'Distribución de Costos por Área',
        descripcion: 'Costos agrupados por área',
        icon: '📊',
        tipo: 'Gerencial',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: true,
        tieneGraficos: true,
        frecuenciaUso: 'Media'
      },
      {
        id: 'kpis-rrhh',
        codigo: 'RGER-003',
        nombre: 'Indicadores de RRHH (KPIs)',
        descripcion: 'Dashboard de indicadores clave',
        icon: '🎯',
        tipo: 'Gerencial',
        formatosDisponibles: ['PDF'],
        requiereFiltros: true,
        tieneGraficos: true,
        frecuenciaUso: 'Media'
      },
      {
        id: 'evolucion-anual',
        codigo: 'RGER-004',
        nombre: 'Evolución de Planilla Anual',
        descripcion: 'Tendencia de planilla en el año',
        icon: '📈',
        tipo: 'Gerencial',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: true,
        tieneGraficos: true,
        frecuenciaUso: 'Baja'
      },
      {
        id: 'presupuesto-vs-ejecutado',
        codigo: 'RGER-005',
        nombre: 'Presupuesto vs Ejecutado',
        descripcion: 'Comparación presupuestal',
        icon: '💹',
        tipo: 'Gerencial',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: true,
        tieneGraficos: true,
        frecuenciaUso: 'Alta'
      }
    ]
  },
  {
    id: 'bancario',
    nombre: 'Bancario',
    descripcion: 'Archivos para entidades bancarias',
    icon: '🏦',
    color: '#14b8a6',
    reportes: [
      {
        id: 'abono-nacion',
        codigo: 'RBAN-001',
        nombre: 'Archivo de Abono (Banco de la Nación)',
        descripcion: 'Archivo para transferencias bancarias',
        icon: '💳',
        tipo: 'Bancario',
        formatosDisponibles: ['TXT', 'Excel'],
        requiereFiltros: true,
        tieneGraficos: false,
        frecuenciaUso: 'Alta'
      },
      {
        id: 'abono-bcp',
        codigo: 'RBAN-002',
        nombre: 'Archivo de Abono (BCP)',
        descripcion: 'Archivo formato BCP',
        icon: '💳',
        tipo: 'Bancario',
        formatosDisponibles: ['TXT', 'Excel'],
        requiereFiltros: true,
        tieneGraficos: false,
        frecuenciaUso: 'Media'
      },
      {
        id: 'cuentas-bancarias',
        codigo: 'RBAN-003',
        nombre: 'Reporte de Cuentas Bancarias',
        descripcion: 'Listado de cuentas de trabajadores',
        icon: '🏦',
        tipo: 'Bancario',
        formatosDisponibles: ['Excel', 'PDF'],
        requiereFiltros: false,
        tieneGraficos: false,
        frecuenciaUso: 'Baja'
      }
    ]
  },
  {
    id: 'legal',
    nombre: 'Legal',
    descripcion: 'Documentos y constancias',
    icon: '📄',
    color: '#a855f7',
    reportes: [
      {
        id: 'constancias-trabajo',
        codigo: 'RLEG-001',
        nombre: 'Constancias de Trabajo',
        descripcion: 'Generación de constancias laborales',
        icon: '📝',
        tipo: 'Legal',
        formatosDisponibles: ['PDF'],
        requiereFiltros: false,
        tieneGraficos: false,
        frecuenciaUso: 'Alta'
      },
      {
        id: 'certificado-ingresos',
        codigo: 'RLEG-002',
        nombre: 'Certificado de Ingresos',
        descripcion: 'Certificación de remuneraciones',
        icon: '💰',
        tipo: 'Legal',
        formatosDisponibles: ['PDF'],
        requiereFiltros: true,
        tieneGraficos: false,
        frecuenciaUso: 'Media'
      },
      {
        id: 'liquidacion-beneficios',
        codigo: 'RLEG-003',
        nombre: 'Liquidación de Beneficios Sociales',
        descripcion: 'Liquidación por cese',
        icon: '📋',
        tipo: 'Legal',
        formatosDisponibles: ['PDF'],
        requiereFiltros: false,
        tieneGraficos: false,
        frecuenciaUso: 'Media'
      }
    ]
  }
];

export const MESES_REPORTE = [
  { valor: 1, nombre: 'Enero' },
  { valor: 2, nombre: 'Febrero' },
  { valor: 3, nombre: 'Marzo' },
  { valor: 4, nombre: 'Abril' },
  { valor: 5, nombre: 'Mayo' },
  { valor: 6, nombre: 'Junio' },
  { valor: 7, nombre: 'Julio' },
  { valor: 8, nombre: 'Agosto' },
  { valor: 9, nombre: 'Septiembre' },
  { valor: 10, nombre: 'Octubre' },
  { valor: 11, nombre: 'Noviembre' },
  { valor: 12, nombre: 'Diciembre' }
];