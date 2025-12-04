export interface BoletaPago {
  id?: number;
  codigo: string;
  trabajadorId: number;
  trabajadorDni: string;
  trabajadorNombre: string;
  trabajadorCargo: string;
  trabajadorArea: string;
  
  // Planilla asociada
  planillaId: number;
  planillaCodigo: string;
  periodo: string;
  mes: number;
  anio: number;
  tipoPlanilla: string;
  
  // Fechas
  fechaGeneracion: Date;
  fechaEmision: Date;
  fechaPago?: Date;
  
  // Dias trabajados
  diasTrabajados: number;
  diasHabiles: number;
  horasTrabajadas: number;
  horasExtras: number;
  
  // INGRESOS
  ingresos: ConceptoBoleta[];
  totalIngresos: number;
  
  // DESCUENTOS
  descuentos: ConceptoBoleta[];
  totalDescuentos: number;
  
  // APORTES EMPLEADOR
  aportesEmpleador: ConceptoBoleta[];
  totalAportesEmpleador: number;
  
  // NETO
  netoAPagar: number;
  
  // Cuenta bancaria
  banco: string;
  numeroCuenta: string;
  cci?: string;
  
  // Datos adicionales del trabajador para la boleta
  codigoEssalud?: string;
  sistemaPension?: string;
  afp?: string;
  cuspp?: string;
  condicion?: string;
  fechaIngreso?: Date;
  
  // Estado
  estado: EstadoBoleta;
  enviada: boolean;
  descargada: boolean;
  
  // Metadata
  generadaPor?: string;
  observaciones?: string;
  rutaArchivoPDF?: string;
}

export interface ConceptoBoleta {
  codigo: string;
  nombre: string;
  tipo: 'Ingreso' | 'Descuento' | 'Aporte';
  monto: number;
  esCalculado: boolean;
  formula?: string;
  detalleCalculo?: string;
}

export type EstadoBoleta = 
  | 'Generada' 
  | 'Aprobada'
  | 'Pagada'
  | 'Enviada' 
  | 'Descargada' 
  | 'Observada'
  | 'Anulada';

export interface FiltrosBoletas {
  anio: number;
  mes?: number;
  planillaId?: number;
  estado: string;
  busqueda: string;
  area: string;
  tipoContrato: string;
}

export interface ResumenBoletas {
  totalBoletas: number;
  boletasGeneradas: number;
  boletasEnviadas: number;
  boletasDescargadas: number;
  
  totalTrabajadores: number;
  totalIngresosPagados: number;
  totalDescuentosAplicados: number;
  totalNetoPagado: number;
  
  // Por area
  distribucionPorArea: {
    area: string;
    cantidad: number;
    total: number;
  }[];
}

export interface EnvioMasivo {
  boletas: BoletaPago[];
  metodo: 'email' | 'sistema';
  asunto?: string;
  mensaje?: string;
}

export const ESTADOS_BOLETA = [
  'Todas',
  'Generada',
  'Aprobada',
  'Pagada',
  'Enviada',
  'Descargada',
  'Observada',
  'Anulada'
];

export const MESES_BOLETAS = [
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

export const AREAS_MUNICIPALES = [
  'Todas',
  'Gerencia Municipal',
  'Oficina de Recursos Humanos',
  'Oficina de Administracion',
  'Gerencia de Desarrollo Social',
  'Gerencia de Infraestructura',
  'Serenazgo',
  'Registro Civil'
];

export const TIPOS_CONTRATO_BOLETAS = [
  'Todos',
  'Nombrado',
  'CAS',
  'Locacion de Servicios',
  'Practicante'
];

export interface PlantillaBoleta {
  titulo: string;
  subtitulo: string;
  logoUrl?: string;
  pie: string;
  mostrarDetalleIngresos: boolean;
  mostrarDetalleDescuentos: boolean;
  mostrarAportesEmpleador: boolean;
  incluirFirmaDigital: boolean;
}

export const PLANTILLA_DEFAULT: PlantillaBoleta = {
  titulo: 'MUNICIPALIDAD DISTRITAL',
  subtitulo: 'Boleta de Pago Electronica',
  pie: 'Este documento es una constancia de pago electronica',
  mostrarDetalleIngresos: true,
  mostrarDetalleDescuentos: true,
  mostrarAportesEmpleador: false,
  incluirFirmaDigital: false
};