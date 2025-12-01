export interface RegistroVacaciones {
  id?: number;
  codigo: string;
  trabajadorId: number;
  trabajadorDni: string;
  trabajadorNombre: string;
  trabajadorCargo: string;
  trabajadorArea: string;
  
  // Periodo vacacional
  periodoInicio: Date;
  periodoFin: Date;
  aniosPeriodo: string;
  
  // Dias
  diasGenerados: number;
  diasGozados: number;
  diasPendientes: number;
  
  // Programacion
  fechaInicioProgramada?: Date;
  fechaFinProgramada?: Date;
  diasProgramados?: number;
  
  // Goce real
  fechaInicioReal?: Date;
  fechaFinReal?: Date;
  diasReales?: number;
  
  // Tipo de vacaciones
  tipoVacaciones: TipoVacaciones;
  
  // Pago
  remuneracionVacacional: number;
  montoVacaciones: number;
  
  // Truncas
  esTrunca: boolean;
  motivoTrunca?: string;
  diasTruncas?: number;
  montoTruncas?: number;
  
  // Cuenta bancaria
  banco: string;
  numeroCuenta: string;
  
  // Estado
  estado: EstadoVacaciones;
  fechaProgramacion?: Date;
  fechaAprobacion?: Date;
  fechaPago?: Date;
  
  // Metadata
  programadoPor?: string;
  aprobadoPor?: string;
  observaciones?: string;
  archivoDescanso?: string;
}

export type TipoVacaciones = 
  | 'Completas' 
  | 'Fraccionadas' 
  | 'Truncas' 
  | 'No Gozadas';

export type EstadoVacaciones = 
  | 'Pendiente' 
  | 'Programado' 
  | 'Aprobado' 
  | 'En Goce' 
  | 'Gozado' 
  | 'Pagado'
  | 'Observado';

export interface FiltrosVacaciones {
  anio: number;
  tipo: string;
  estado: string;
  area: string;
  busqueda: string;
}

export interface ResumenVacaciones {
  totalRegistros: number;
  totalTrabajadores: number;
  totalDiasGenerados: number;
  totalDiasGozados: number;
  totalDiasPendientes: number;
  totalMontoPagado: number;
  
  registrosPendientes: number;
  registrosProgramados: number;
  registrosAprobados: number;
  registrosEnGoce: number;
  registrosGozados: number;
  registrosPagados: number;
  
  distribucionPorArea: {
    area: string;
    cantidad: number;
    diasPendientes: number;
  }[];
  
  diasPromedioGozados: number;
  tasaGocePorcentual: number;
}

export interface ProgramacionVacaciones {
  trabajadorId: number;
  fechaInicio: Date;
  fechaFin: Date;
  diasProgramados: number;
  observaciones?: string;
}

export interface RecordVacacional {
  trabajadorId: number;
  trabajadorNombre: string;
  fechaIngreso: Date;
  aniosServicio: number;
  
  periodos: PeriodoVacacional[];
  
  totalDiasGenerados: number;
  totalDiasGozados: number;
  totalDiasPendientes: number;
}

export interface PeriodoVacacional {
  anio: string;
  diasGenerados: number;
  diasGozados: number;
  diasPendientes: number;
  estado: string;
}

export interface ConfiguracionVacaciones {
  diasPorAnio: number; // 30 dias
  diasMinimoContinuo: number; // 7 dias minimo continuo
  diasMaximoFraccionamiento: number; // 15 dias maximo
  permitirFraccionamiento: boolean;
  diasAnticipacionSolicitud: number; // 15 dias de anticipacion
}

export const CONFIGURACION_VACACIONES_DEFAULT: ConfiguracionVacaciones = {
  diasPorAnio: 30,
  diasMinimoContinuo: 7,
  diasMaximoFraccionamiento: 15,
  permitirFraccionamiento: true,
  diasAnticipacionSolicitud: 15
};

export const TIPOS_VACACIONES = [
  'Todas',
  'Completas',
  'Fraccionadas',
  'Truncas',
  'No Gozadas'
];

export const ESTADOS_VACACIONES = [
  'Todos',
  'Pendiente',
  'Programado',
  'Aprobado',
  'En Goce',
  'Gozado',
  'Pagado',
  'Observado'
];

export const AREAS_MUNICIPALES_VAC = [
  'Todas',
  'Gerencia Municipal',
  'Oficina de Recursos Humanos',
  'Oficina de Administracion',
  'Gerencia de Desarrollo Social',
  'Gerencia de Infraestructura',
  'Serenazgo',
  'Registro Civil'
];

export interface ProgramacionAnual {
  anio: number;
  programaciones: {
    mes: number;
    nombreMes: string;
    trabajadores: {
      trabajadorId: number;
      trabajadorNombre: string;
      fechaInicio: Date;
      fechaFin: Date;
      dias: number;
    }[];
  }[];
}

export interface CalendarioVacaciones {
  anio: number;
  mes: number;
  dias: {
    dia: number;
    trabajadores: {
      trabajadorId: number;
      trabajadorNombre: string;
      tipo: string;
    }[];
  }[];
}

export interface LiquidacionVacaciones {
  registro: RegistroVacaciones;
  conceptos: {
    nombre: string;
    monto: number;
  }[];
  totalLiquidacion: number;
}

export const MESES_VACACIONES = [
  { valor: 0, nombre: 'Todos' },
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