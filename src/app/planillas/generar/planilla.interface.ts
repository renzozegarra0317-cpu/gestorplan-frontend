export interface Planilla {
  id?: number;
  codigo: string;
  periodo: string;
  mes: number;
  anio: number;
  tipoplanilla: TipoPlanilla;
  estado: EstadoPlanilla;
  
  // Fechas
  fechaInicio: string;
  fechaFin: string;
  fechaGeneracion?: Date;
  fechaPago?: string;
  
  // Totales
  totalTrabajadores: number;
  totalIngresos: number;
  totalDescuentos: number;
  totalAportes: number;
  totalNeto: number;
  
  // Detalles
  detalles: DetallePlanilla[];
  
  // Metadata
  generadoPor?: string;
  aprobadoPor?: string;
  observaciones?: string;
}

export interface DetallePlanilla {
  trabajadorId: number;
  trabajadorDni: string;
  trabajadorNombre: string;
  trabajadorCargo: string;
  trabajadorArea: string;
  tipoContrato: string;
  
  // Días trabajados
  diasTrabajados: number;
  diasHabiles: number;
  horasTrabajadas: number;
  horasExtras: number;
  
  // INGRESOS
  remuneracionBasica: number;
  asignacionFamiliar: number;
  horasExtrasMonto: number;
  bonificaciones: number;
  aguinaldos: number;
  otrosIngresos: number;
  totalIngresos: number;
  
  // DESCUENTOS
  // Descuentos por AFP/ONP
  sistemaPensiones: 'AFP' | 'ONP';
  nombreAFP?: string;
  aporteObligatorioAFP: number;
  comisionAFP: number;
  seguroAFP: number;
  aporteONP: number;
  
  // Descuento por impuestos
  renta5ta: number;
  
  // Otros descuentos
  tardanzas: number;
  faltas: number;
  adelantos: number;
  prestamos: number;
  judiciales: number;
  otrosDescuentos: number;
  totalDescuentos: number;
  
  // APORTES DEL EMPLEADOR
  essalud: number;
  sctr: number;
  otrosAportes: number;
  totalAportes: number;
  
  // NETO
  netoAPagar: number;
  
  // Cuenta bancaria
  banco: string;
  numeroCuenta: string;
  cci?: string;
}

export type TipoPlanilla = 
  | 'Mensual' 
  | 'Quincenal' 
  | 'Gratificacion' 
  | 'CTS' 
  | 'Vacaciones' 
  | 'Utilidades';

export type EstadoPlanilla = 
  | 'Borrador' 
  | 'Generada' 
  | 'Aprobada' 
  | 'Pagada' 
  | 'Cancelada';

export interface ConfiguracionPlanilla {
  // Tasas AFP (2024)
  tasaAporteAFPIntegra: number;      // 10%
  tasaComisionAFPIntegra: number;    // 1.55%
  tasaSeguroAFPIntegra: number;      // 1.74%
  
  tasaAporteAFPPrima: number;        // 10%
  tasaComisionAFPPrima: number;      // 1.60%
  tasaSeguroAFPPrima: number;        // 1.74%
  
  tasaAporteAFPProfuturo: number;    // 10%
  tasaComisionAFPProfuturo: number;  // 1.69%
  tasaSeguroAFPProfuturo: number;    // 1.74%
  
  tasaAporteAFPHabitat: number;      // 10%
  tasaComisionAFPHabitat: number;    // 1.47%
  tasaSeguroAFPHabitat: number;      // 1.74%
  
  // Tasa ONP
  tasaONP: number;                   // 13%
  
  // Aportes empleador
  tasaEsSalud: number;               // 9%
  tasaSCTR: number;                  // Variable según riesgo
  
  // Asignación familiar
  montoAsignacionFamiliar: number;   // S/. 102.50
  
  // Remuneración mínima
  remuneracionMinima: number;        // S/. 1,025.00
  
  // UIT (Unidad Impositiva Tributaria)
  valorUIT: number;                  // S/. 5,150 (2024)
  
  // Horas extras
  recargoPorcentaje25: number;       // 25% (primeras 2 horas)
  recargoPorcentaje35: number;       // 35% (adicionales)
  
  // Renta 5ta categoría
  uitParaRenta: number;              // 7 UIT
  tasaRenta: number;                 // 8% sobre exceso
}

export interface FiltrosGeneracion {
  mes: number;
  anio: number;
  tipoPlanilla: TipoPlanilla;
  areas: string[];
  tiposContrato: string[];
  incluirTodos: boolean;
  trabajadoresSeleccionados: number[];
}

export interface ResumenPlanilla {
  totalTrabajadores: number;
  totalRemuneracionBasica: number;
  totalIngresos: number;
  totalDescuentos: number;
  totalAportes: number;
  totalNeto: number;
  
  // Desglose por sistema de pensiones
  trabajadoresAFP: number;
  trabajadoresONP: number;
  totalAporteAFP: number;
  totalAporteONP: number;
  
  // Desglose por régimen laboral
  desglosePorRegimen: {
    regimen: string;
    cantidad: number;
    total: number;
  }[];
  
  // Desglose por cargo
  desglosePorCargo: {
    cargo: string;
    cantidad: number;
    total: number;
  }[];
}

export const CONFIGURACION_DEFAULT: ConfiguracionPlanilla = {
  // AFP Integra
  tasaAporteAFPIntegra: 0.10,
  tasaComisionAFPIntegra: 0.0155,
  tasaSeguroAFPIntegra: 0.0174,
  
  // AFP Prima
  tasaAporteAFPPrima: 0.10,
  tasaComisionAFPPrima: 0.0160,
  tasaSeguroAFPPrima: 0.0174,
  
  // AFP Profuturo
  tasaAporteAFPProfuturo: 0.10,
  tasaComisionAFPProfuturo: 0.0169,
  tasaSeguroAFPProfuturo: 0.0174,
  
  // AFP Habitat
  tasaAporteAFPHabitat: 0.10,
  tasaComisionAFPHabitat: 0.0147,
  tasaSeguroAFPHabitat: 0.0174,
  
  // ONP
  tasaONP: 0.13,
  
  // Aportes empleador
  tasaEsSalud: 0.09,
  tasaSCTR: 0.01,
  
  // Beneficios
  montoAsignacionFamiliar: 102.50,
  remuneracionMinima: 1025.00,
  valorUIT: 5150.00,
  
  // Horas extras
  recargoPorcentaje25: 0.25,
  recargoPorcentaje35: 0.35,
  
  // Renta 5ta
  uitParaRenta: 7,
  tasaRenta: 0.08
};

export const TIPOS_PLANILLA = [
  { valor: 'Mensual', label: 'Planilla Mensual', icon: '📅' },
  { valor: 'Quincenal', label: 'Planilla Quincenal', icon: '📆' },
  { valor: 'Gratificacion', label: 'Gratificación', icon: '🎁' },
  { valor: 'CTS', label: 'CTS', icon: '💰' },
  { valor: 'Vacaciones', label: 'Vacaciones', icon: '🏖️' },
  { valor: 'Utilidades', label: 'Utilidades', icon: '💵' }
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