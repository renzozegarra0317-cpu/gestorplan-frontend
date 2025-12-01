export interface RegistroGratificacion {
  id?: number;
  codigo: string;
  trabajadorId: number;
  trabajadorDni: string;
  trabajadorNombre: string;
  trabajadorCargo: string;
  trabajadorArea: string;
  
  // Periodo
  periodo: PeriodoGratificacion;
  mes: number;
  anio: number;
  fechaInicio: string;
  fechaFin: string;
  
  // Tiempo de servicio
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
  
  // Gratificacion
  montoGratificacion: number;
  
  // Bonificacion extraordinaria (9%)
  bonificacionExtraordinaria: number;
  porcentajeBonificacion: number;
  
  // Total
  totalGratificacion: number;
  
  // Descuentos
  descuentos: DescuentoGratificacion[];
  totalDescuentos: number;
  
  // Neto a pagar
  netoAPagar: number;
  
  // Cuenta bancaria
  banco: string;
  tipoCuenta: 'Ahorro' | 'Corriente';
  numeroCuenta: string;
  cci?: string;
  moneda: 'Soles' | 'Dolares';
  
  // Estado
  estado: EstadoGratificacion;
  fechaCalculo?: Date;
  fechaPago?: Date;
  numeroComprobante?: string;
  
  // Metadata
  calculadoPor?: string;
  pagadoPor?: string;
  observaciones?: string;
  archivoBoleta?: string;
}

export interface DescuentoGratificacion {
  codigo: string;
  nombre: string;
  tipo: 'AFP' | 'ONP' | 'Renta5ta' | 'Otros';
  monto: number;
  porcentaje?: number;
}

export type PeriodoGratificacion = 'Julio' | 'Diciembre';

export type EstadoGratificacion = 
  | 'Borrador' 
  | 'Calculado' 
  | 'Aprobado' 
  | 'Pagado' 
  | 'Observado';

export interface FiltrosGratificaciones {
  anio: number;
  periodo: string;
  estado: string;
  area: string;
  busqueda: string;
}

export interface ResumenGratificaciones {
  totalRegistros: number;
  totalTrabajadores: number;
  totalGratificacionCalculada: number;
  totalBonificacionExtraordinaria: number;
  totalDescuentos: number;
  totalNetoPagado: number;
  
  registrosBorrador: number;
  registrosCalculados: number;
  registrosAprobados: number;
  registrosPagados: number;
  registrosObservados: number;
  
  distribucionPorArea: {
    area: string;
    cantidad: number;
    total: number;
  }[];
  
  promedioMesesServicio: number;
  promedioMontoGratificacion: number;
}

export interface CalculoGratificacionMasivo {
  periodo: PeriodoGratificacion;
  mes: number;
  anio: number;
  trabajadores: number[];
  incluirTodos: boolean;
}

export interface ConfiguracionGratificacion {
  mesesPorAnio: number; // 12
  diasPorMes: number; // 30
  porcentajeBonificacion: number; // 9%
  aplicarBonificacion: boolean;
  tasaCambio?: number;
}

export const CONFIGURACION_GRATIFICACION_DEFAULT: ConfiguracionGratificacion = {
  mesesPorAnio: 12,
  diasPorMes: 30,
  porcentajeBonificacion: 9,
  aplicarBonificacion: true,
  tasaCambio: 3.75
};

export const PERIODOS_GRATIFICACION = ['Todos', 'Julio', 'Diciembre'];

export const ESTADOS_GRATIFICACION = [
  'Todos',
  'Borrador',
  'Calculado',
  'Aprobado',
  'Pagado',
  'Observado'
];

export const MESES_GRATIFICACION = [
  { 
    periodo: 'Julio', 
    mes: 7, 
    fechaInicio: '01-01', 
    fechaFin: '30-06',
    descripcion: 'Fiestas Patrias',
    icon: '🇵🇪'
  },
  { 
    periodo: 'Diciembre', 
    mes: 12, 
    fechaInicio: '01-07', 
    fechaFin: '31-12',
    descripcion: 'Navidad',
    icon: '🎄'
  }
];

export const AREAS_MUNICIPALES_GRAT = [
  'Todas',
  'Gerencia Municipal',
  'Oficina de Recursos Humanos',
  'Oficina de Administracion',
  'Gerencia de Desarrollo Social',
  'Gerencia de Infraestructura',
  'Serenazgo',
  'Registro Civil'
];

export const TIPOS_CUENTA_GRAT = ['Ahorro', 'Corriente'];

export const MONEDAS_GRAT = ['Soles', 'Dolares'];

export interface BoletaGratificacion {
  registro: RegistroGratificacion;
  empresa: {
    razonSocial: string;
    ruc: string;
    direccion: string;
  };
  generadoPor: string;
  fechaEmision: Date;
}

export interface ReporteGratificacion {
  periodo: string;
  anio: number;
  registros: RegistroGratificacion[];
  totales: {
    totalTrabajadores: number;
    totalGratificacion: number;
    totalBonificacion: number;
    totalDescuentos: number;
    totalNeto: number;
  };
}

export interface ComparativoGratificaciones {
  anio: number;
  gratificacionJulio: number;
  gratificacionDiciembre: number;
  totalAnual: number;
  trabajadoresJulio: number;
  trabajadoresDiciembre: number;
  diferencia: number;
}