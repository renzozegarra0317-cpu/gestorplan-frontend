export interface PlanillaHistorial {
  id: number;
  codigo: string;
  periodo: string;
  mes: number;
  anio: number;
  tipoPlanilla: string;
  estado: EstadoPlanilla;
  
  // Fechas
  fechaGeneracion: Date;
  fechaAprobacion?: Date;
  fechaPago?: Date;
  fechaInicio: string;
  fechaFin: string;
  
  // Totales
  totalTrabajadores: number;
  totalIngresos: number;
  totalDescuentos: number;
  totalAportes: number;
  totalNeto: number;
  
  // Usuarios
  generadoPor: string;
  aprobadoPor?: string;
  pagadoPor?: string;
  
  // Metadata
  observaciones?: string;
  archivoExcel?: string;
  archivoPDF?: string;
  archivoTXT?: string;
}

export type EstadoPlanilla = 
  | 'Borrador' 
  | 'Generada' 
  | 'Aprobada' 
  | 'Pagada' 
  | 'Anulada';

export interface FiltrosHistorial {
  anio: number;
  mes?: number;
  tipoPlanilla: string;
  estado: string;
  busqueda: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface ResumenHistorial {
  totalPlanillas: number;
  totalTrabajadores: number;
  totalPagado: number;
  planillasPagadas: number;
  planillasPendientes: number;
  planillasAnuladas: number;
}

export interface DetallePlanillaCompleto {
  id: number;
  codigo: string;
  periodo: string;
  tipoPlanilla: string;
  estado: string;
  fechaGeneracion: Date;
  fechaAprobacion?: Date;
  fechaPago?: Date;
  totalTrabajadores: number;
  totalIngresos: number;
  totalDescuentos: number;
  totalAportes: number;
  totalNeto: number;
  generadoPor: string;
  aprobadoPor?: string;
  pagadoPor?: string;
  trabajadores: {
    dni: string;
    nombre: string;
    cargo: string;
    area: string;
    remuneracionBasica: number;
    total_ingresos: number;
    total_descuentos: number;
    neto_a_pagar: number;
    regimen_laboral?: string;
    regimen_laboral_codigo?: string;
    regimen_laboral_nombre?: string;
    dias_trabajados?: number;
    // INGRESOS ADICIONALES
    costo_vida?: number;
    asignacion_familiar?: number;
    movilidad?: number;
    horas_extras_monto?: number;
    bonificaciones?: number;
    otros_ingresos?: number;
    // DESCUENTOS ADICIONALES
    sistema_pensiones?: string;
    aporte_obligatorio_afp?: number;
    aporte_onp?: number;
    comision_afp?: number;
    seguro_afp?: number;
    renta_5ta?: number;
    cuota_sindical?: number;
    cuota_sindical_sitro_mdh?: number;
    prestamo_cooperativa_san_lorenzo?: number;
    cooperativa_san_miguel?: number;
    descuento_coopac_nsr?: number;
    descuento_coopac_san_jose?: number;
    descuento_centro_coop?: number;
    descuento_leon_xiii?: number;
    descuento_banco_comercio?: number;
    descuento_banco_nacion?: number;
    descuento_rimac_seguros?: number;
    descuento_banbif?: number;
    descuento_oftalmol_entes?: number;
    descuento_pactado_pago_indebido?: number;
    tardanzas?: number;
    faltas?: number;
    otros_descuentos?: number;
    // APORTES ADICIONALES
    essalud?: number;
    seguro_vida?: number;
    sctr_pension?: number;
    sctr_salud?: number;
    total_aportes?: number;
    // NETO ADICIONAL
    gratificacion?: number;
    cts_mensual?: number;
    banco?: string;
    numero_cuenta?: string;
    banco_descuento_judicial?: string;
    numero_cuenta_descuento_judicial?: string;
  }[];
}

export const TIPOS_PLANILLA_HISTORIAL = [
  'Todas',
  'Mensual',
  'Quincenal',
  'Gratificacion',
  'CTS',
  'Vacaciones',
  'Utilidades'
];

export const ESTADOS_PLANILLA = [
  'Todos',
  'Borrador',
  'Generada',
  'Aprobada',
  'Pagada',
  'Anulada'
];

export const MESES_HISTORIAL = [
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

export interface AccionPlanilla {
  tipo: 'ver' | 'editar' | 'aprobar' | 'pagar' | 'anular' | 'eliminar' | 'descargar' | 'duplicar' | 'exportar';
  icono: string;
  label: string;
  class: string;
  disponiblePara: EstadoPlanilla[];
}

export const ACCIONES_DISPONIBLES: AccionPlanilla[] = [
  {
    tipo: 'ver',
    icono: '👁️',
    label: 'Ver detalle',
    class: 'btn-action--info',
    disponiblePara: ['Borrador', 'Generada', 'Aprobada', 'Pagada', 'Anulada']
  },
  {
    tipo: 'editar',
    icono: '✏️',
    label: 'Editar',
    class: 'btn-action--primary',
    disponiblePara: ['Borrador', 'Generada']
  },
  {
    tipo: 'aprobar',
    icono: '✅',
    label: 'Aprobar',
    class: 'btn-action--success',
    disponiblePara: ['Generada']
  },
  {
    tipo: 'pagar',
    icono: '💳',
    label: 'Registrar pago',
    class: 'btn-action--success',
    disponiblePara: ['Aprobada']
  },
  {
    tipo: 'anular',
    icono: '🚫',
    label: 'Anular',
    class: 'btn-action--danger',
    disponiblePara: ['Borrador', 'Generada', 'Aprobada']
  },
  {
    tipo: 'eliminar',
    icono: '🗑️',
    label: 'Eliminar definitivamente',
    class: 'btn-action--delete',
    disponiblePara: ['Borrador', 'Anulada']
  },
  {
    tipo: 'descargar',
    icono: '📥',
    label: 'Descargar',
    class: 'btn-action--outline',
    disponiblePara: ['Generada', 'Aprobada', 'Pagada']
  },
  {
    tipo: 'duplicar',
    icono: '📋',
    label: 'Duplicar',
    class: 'btn-action--outline',
    disponiblePara: ['Generada', 'Aprobada', 'Pagada']
  }
];