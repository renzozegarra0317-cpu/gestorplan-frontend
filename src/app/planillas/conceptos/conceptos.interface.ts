export interface Concepto {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  tipoConcepto: TipoConcepto;
  categoria: CategoriaConcepto;
  
  // Configuracion de calculo
  esCalculado: boolean;
  formula?: string;
  valorFijo?: number;
  porcentaje?: number;
  baseDatos?: string;
  
  // Aplicacion
  aplicaA: AplicacionConcepto;
  tiposContrato: string[];
  
  // Periodicidad
  periodicidad: PeriodicidadConcepto;
  mesesAplicacion?: number[];
  
  // Configuracion tributaria
  afectoRenta5ta: boolean;
  afectoEsSalud: boolean;
  afectoAFP: boolean;
  
  // Prioridad de calculo
  orden: number;
  
  // Estado
  estado: EstadoConcepto;
  activo: boolean;
  
  // Montos minimos y maximos
  montoMinimo?: number;
  montoMaximo?: number;
  
  // Metadata
  creadoPor?: string;
  fechaCreacion?: Date;
  modificadoPor?: string;
  fechaModificacion?: Date;
  
  // Observaciones
  observaciones?: string;
}

export type TipoConcepto = 
  | 'Ingreso' 
  | 'Descuento' 
  | 'Aporte';

export type CategoriaConcepto = 
  // Ingresos
  | 'Remuneracion Basica'
  | 'Asignacion Familiar'
  | 'Horas Extras'
  | 'Bonificaciones'
  | 'Gratificacion'
  | 'CTS'
  | 'Vacaciones'
  | 'Aguinaldos'
  | 'Movilidad'
  | 'Refrigerio'
  | 'Otros Ingresos'
  // Descuentos
  | 'AFP Aporte Obligatorio'
  | 'AFP Comision'
  | 'AFP Seguro'
  | 'ONP'
  | 'Renta 5ta'
  | 'Tardanzas'
  | 'Faltas'
  | 'Adelantos'
  | 'Prestamos'
  | 'Judiciales'
  | 'Otros Descuentos'
  // Aportes
  | 'EsSalud'
  | 'SCTR'
  | 'Otros Aportes';

export type AplicacionConcepto = 
  | 'Todos' 
  | 'Nombrados' 
  | 'CAS' 
  | 'Locacion' 
  | 'Practicantes'
  | 'Personalizado';

export type PeriodicidadConcepto = 
  | 'Mensual' 
  | 'Quincenal' 
  | 'Anual' 
  | 'Semestral' 
  | 'Eventual';

export type EstadoConcepto = 
  | 'Activo' 
  | 'Inactivo' 
  | 'Borrador';

export interface FiltrosConceptos {
  tipoConcepto: string;
  categoria: string;
  estado: string;
  busqueda: string;
  aplicaA: string;
}

export interface PlantillaConcepto {
  nombre: string;
  conceptos: Concepto[];
}

export const TIPOS_CONCEPTO = ['Todos', 'Ingreso', 'Descuento', 'Aporte'];

export const ESTADOS_CONCEPTO = ['Todos', 'Activo', 'Inactivo', 'Borrador'];

export const CATEGORIAS_INGRESO = [
  'Remuneracion Basica',
  'Asignacion Familiar',
  'Horas Extras',
  'Bonificaciones',
  'Gratificacion',
  'CTS',
  'Vacaciones',
  'Aguinaldos',
  'Movilidad',
  'Refrigerio',
  'Otros Ingresos'
];

export const CATEGORIAS_DESCUENTO = [
  'AFP Aporte Obligatorio',
  'AFP Comision',
  'AFP Seguro',
  'ONP',
  'Renta 5ta',
  'Tardanzas',
  'Faltas',
  'Adelantos',
  'Prestamos',
  'Judiciales',
  'Otros Descuentos'
];

export const CATEGORIAS_APORTE = [
  'EsSalud',
  'SCTR',
  'Otros Aportes'
];

export const APLICACIONES = [
  'Todos',
  'Nombrados',
  'CAS',
  'Locacion',
  'Practicantes',
  'Personalizado'
];

export const PERIODICIDADES = [
  'Mensual',
  'Quincenal',
  'Anual',
  'Semestral',
  'Eventual'
];

export const TIPOS_CONTRATO = [
  'Nombrado',
  'CAS',
  'Locacion de Servicios',
  'Practicante'
];

export const MESES = [
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

export const BASES_CALCULO = [
  { valor: 'remuneracion_basica', label: 'Remuneracion Basica' },
  { valor: 'total_ingresos', label: 'Total Ingresos' },
  { valor: 'remuneracion_computable', label: 'Remuneracion Computable' },
  { valor: 'dias_trabajados', label: 'Dias Trabajados' },
  { valor: 'horas_trabajadas', label: 'Horas Trabajadas' },
  { valor: 'valor_hora', label: 'Valor Hora' },
  { valor: 'valor_dia', label: 'Valor Dia' },
  { valor: 'uit', label: 'UIT (Unidad Impositiva Tributaria)' }
];

export const PLANTILLAS_PREDEFINIDAS: PlantillaConcepto[] = [
  {
    nombre: 'Planilla Completa Municipal',
    conceptos: []
  },
  {
    nombre: 'Solo Remuneraciones Basicas',
    conceptos: []
  },
  {
    nombre: 'Gratificacion Julio/Diciembre',
    conceptos: []
  },
  {
    nombre: 'CTS Semestral',
    conceptos: []
  }
];