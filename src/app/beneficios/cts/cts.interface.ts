export interface RegistroCTS {
  id?: number;
  codigo: string;
  trabajadorId: number;
  trabajadorDni: string;
  trabajadorNombre: string;
  trabajadorCargo: string;
  trabajadorArea: string;
  
  // Periodo
  periodo: PeriodoCTS;
  mes: number;
  anio: number;
  fechaInicio: string;
  fechaFin: string;
  
  // Datos de calculo
  mesesCompletos: number;
  diasAdicionales: number;
  totalDias: number;
  
  // Remuneracion computable
  remuneracionBasica: number;
  asignacionFamiliar: number;
  promedioHorasExtras: number;
  promedioComisiones: number;
  promedioBonificaciones: number;
  totalRemuneracionComputable: number;
  
  // Gratificaciones
  gratificacionJulio: number;
  gratificacionDiciembre: number;
  promedioGratificaciones: number;
  sextoGratificacion: number;
  
  // Calculo CTS
  baseCalculo: number;
  montoCTS: number;
  
  // Deposito
  banco: string;
  tipoCuenta: 'Ahorro' | 'Corriente';
  numeroCuenta: string;
  cci?: string;
  moneda: 'Soles' | 'Dolares';
  
  // Estado
  estado: EstadoCTS;
  fechaCalculo?: Date;
  fechaDeposito?: Date;
  numeroComprobante?: string;
  
  // Metadata
  calculadoPor?: string;
  depositadoPor?: string;
  observaciones?: string;
  archivoConstancia?: string;
}

export type PeriodoCTS = 'Mayo' | 'Noviembre';

export type EstadoCTS = 
  | 'Borrador' 
  | 'Calculado' 
  | 'Aprobado' 
  | 'Depositado' 
  | 'Observado';

export interface FiltrosCTS {
  anio: number;
  periodo: string;
  estado: string;
  area: string;
  busqueda: string;
}

export interface ResumenCTS {
  totalRegistros: number;
  totalTrabajadores: number;
  totalCTSCalculado: number;
  totalCTSDepositado: number;
  
  registrosBorrador: number;
  registrosCalculados: number;
  registrosAprobados: number;
  registrosDepositados: number;
  registrosObservados: number;
  
  distribucionPorArea: {
    area: string;
    cantidad: number;
    total: number;
  }[];
  
  promedioMesesServicio: number;
  promedioMontoCTS: number;
}

export interface CalculoCTSMasivo {
  periodo: PeriodoCTS;
  mes: number;
  anio: number;
  trabajadores: number[];
  incluirTodos: boolean;
}

export interface ConfiguracionCTS {
  mesesPorAnio: number; // 12
  diasPorMes: number; // 30
  factorGratificacion: number; // 1/6 = 0.1667
  tasaCambio?: number;
}

export const CONFIGURACION_CTS_DEFAULT: ConfiguracionCTS = {
  mesesPorAnio: 12,
  diasPorMes: 30,
  factorGratificacion: 0.1667,
  tasaCambio: 3.75
};

export const PERIODOS_CTS = ['Todos', 'Mayo', 'Noviembre'];

export const ESTADOS_CTS = [
  'Todos',
  'Borrador',
  'Calculado',
  'Aprobado',
  'Depositado',
  'Observado'
];

export const MESES_CTS = [
  { periodo: 'Mayo', mes: 5, fechaInicio: '01-11', fechaFin: '30-04' },
  { periodo: 'Noviembre', mes: 11, fechaInicio: '01-05', fechaFin: '31-10' }
];

export const AREAS_MUNICIPALES_CTS = [
  'Todas',
  'Gerencia Municipal',
  'Oficina de Recursos Humanos',
  'Oficina de Administracion',
  'Gerencia de Desarrollo Social',
  'Gerencia de Infraestructura',
  'Serenazgo',
  'Registro Civil'
];

export const TIPOS_CUENTA_CTS = ['Ahorro', 'Corriente'];

export const MONEDAS_CTS = ['Soles', 'Dolares'];

export interface ConstanciaCTS {
  registro: RegistroCTS;
  empresa: {
    razonSocial: string;
    ruc: string;
    direccion: string;
  };
  generadoPor: string;
  fechaEmision: Date;
}

export interface ReporteCTS {
  periodo: string;
  anio: number;
  registros: RegistroCTS[];
  totales: {
    totalTrabajadores: number;
    totalMontoCTS: number;
    totalRemuneracionComputable: number;
  };
}