export interface RegistroUtilidades {
  id?: number;
  codigo: string;
  trabajadorId: number;
  trabajadorDni: string;
  trabajadorNombre: string;
  trabajadorCargo: string;
  trabajadorArea: string;
  
  // Periodo fiscal
  periodoFiscal: number;
  fechaInicio: Date;
  fechaFin: Date;
  
  // Dias trabajados
  diasTrabajados: number;
  diasHabiles: number;
  porcentajeDias: number;
  
  // Remuneracion
  remuneracionPromedio: number;
  totalRemuneracionAnual: number;
  
  // Calculo de utilidades
  montoPorDias: number;
  montoPorRemuneracion: number;
  totalUtilidades: number;
  
  // Empresa/Municipalidad
  utilidadEmpresa: number;
  porcentajeDistribucion: number;
  
  // Descuentos (si aplica)
  descuentos: DescuentoUtilidades[];
  totalDescuentos: number;
  
  // Neto
  netoAPagar: number;
  
  // Cuenta bancaria
  banco: string;
  numeroCuenta: string;
  
  // Estado
  estado: EstadoUtilidades;
  fechaCalculo?: Date;
  fechaAprobacion?: Date;
  fechaPago?: Date;
  
  // Metadata
  calculadoPor?: string;
  aprobadoPor?: string;
  observaciones?: string;
  archivoConstancia?: string;
}

export interface DescuentoUtilidades {
  codigo: string;
  nombre: string;
  tipo: 'Renta5ta' | 'Adelantos' | 'Judiciales' | 'Otros';
  monto: number;
  porcentaje?: number;
}

export type EstadoUtilidades = 
  | 'Pendiente' 
  | 'Calculado' 
  | 'Aprobado' 
  | 'Pagado' 
  | 'Observado';

export interface FiltrosUtilidades {
  periodoFiscal: number;
  estado: string;
  area: string;
  busqueda: string;
}

export interface ResumenUtilidades {
  totalRegistros: number;
  totalTrabajadores: number;
  utilidadEmpresaTotal: number;
  totalUtilidadesCalculadas: number;
  totalDescuentos: number;
  totalNetoPagado: number;
  
  registrosPendientes: number;
  registrosCalculados: number;
  registrosAprobados: number;
  registrosPagados: number;
  registrosObservados: number;
  
  distribucionPorArea: {
    area: string;
    cantidad: number;
    total: number;
  }[];
  
  promedioDiasTrabajados: number;
  promedioUtilidades: number;
}

export interface ConfiguracionUtilidades {
  porcentajeDias: number; // 50% por días trabajados
  porcentajeRemuneracion: number; // 50% por remuneración
  diasAnioCompleto: number; // 360 días
  porcentajeDistribucionTrabajadores: number; // Según empresa
  aplicarRenta5ta: boolean;
  tasaCambio?: number;
}

export const CONFIGURACION_UTILIDADES_DEFAULT: ConfiguracionUtilidades = {
  porcentajeDias: 50,
  porcentajeRemuneracion: 50,
  diasAnioCompleto: 360,
  porcentajeDistribucionTrabajadores: 10, // 10% de utilidades según ley
  aplicarRenta5ta: true,
  tasaCambio: 3.75
};

export const ESTADOS_UTILIDADES = [
  'Todos',
  'Pendiente',
  'Calculado',
  'Aprobado',
  'Pagado',
  'Observado'
];

export const AREAS_MUNICIPALES_UTIL = [
  'Todas',
  'Gerencia Municipal',
  'Oficina de Recursos Humanos',
  'Oficina de Administracion',
  'Gerencia de Desarrollo Social',
  'Gerencia de Infraestructura',
  'Serenazgo',
  'Registro Civil'
];

export interface CalculoUtilidadesMasivo {
  periodoFiscal: number;
  utilidadEmpresa: number;
  trabajadores: number[];
  incluirTodos: boolean;
}

export interface DetalleCalculoUtilidades {
  utilidadEmpresa: number;
  porcentajeDistribucion: number;
  montoADistribuir: number;
  
  totalDiasTrabajados: number;
  totalRemuneracionAnual: number;
  
  factorDias: number;
  factorRemuneracion: number;
}

export interface ComparativoUtilidades {
  periodoFiscal: number;
  utilidadEmpresa: number;
  totalDistribuido: number;
  trabajadoresBeneficiados: number;
  promedioUtilidades: number;
}

export interface LiquidacionUtilidades {
  registro: RegistroUtilidades;
  detalleCalculo: {
    utilidadEmpresa: number;
    porcentajeDistribucion: number;
    montoDistribuible: number;
    
    calculoPorDias: {
      diasTrabajados: number;
      totalDias: number;
      porcentaje: number;
      monto: number;
    };
    
    calculoPorRemuneracion: {
      remuneracion: number;
      totalRemuneracion: number;
      porcentaje: number;
      monto: number;
    };
  };
}

export const PERIODOS_FISCALES_DISPONIBLES = [2024, 2023, 2022, 2021, 2020];

export interface HistorialUtilidades {
  trabajadorId: number;
  trabajadorNombre: string;
  registros: {
    periodoFiscal: number;
    diasTrabajados: number;
    totalUtilidades: number;
    estado: string;
  }[];
  totalAcumulado: number;
}