export interface RegistroTardanzaFalta {
  id: number;
  fecha: string;
  trabajadorId: number;
  trabajadorDni: string;
  trabajadorNombre: string;
  trabajadorArea: string;
  trabajadorCargo: string;
  
  // Tipo de incidencia
  tipo: 'Tardanza' | 'Falta';
  
  // Detalles de tardanza
  horaEsperada?: string;
  horaLlegada?: string;
  minutosRetraso?: number;
  
  // Justificación
  estado: 'Pendiente' | 'Justificada' | 'NoJustificada';
  tieneJustificacion: boolean;
  tipoJustificacion?: string;
  motivoJustificacion?: string;
  documentoAdjunto?: string;
  fechaJustificacion?: Date;
  
  // Acciones disciplinarias
  requiereAccion: boolean;
  tipoAccion?: 'Ninguna' | 'Amonestacion' | 'Suspension' | 'Descuento';
  montoDescuento?: number;
  
  // Observaciones
  observaciones?: string;
  
  // Metadata
  registradoPor: string;
  fechaRegistro: Date;
  revisadoPor?: string;
  fechaRevision?: Date;
}

export interface ResumenTardanzasFaltas {
  periodo: string;
  mes: number;
  anio: number;
  
  // Totales
  totalTardanzas: number;
  totalFaltas: number;
  totalIncidencias: number;
  
  // Estados
  tardanzasJustificadas: number;
  tardanzasNoJustificadas: number;
  tardanzasPendientes: number;
  
  faltasJustificadas: number;
  faltasNoJustificadas: number;
  faltasPendientes: number;
  
  // Estadísticas
  minutosRetrasoProm: number;
  trabajadoresConIncidencias: number;
  trabajadoresReincidentes: number;
  
  // Por área
  incidenciasPorArea: IncidenciaPorArea[];
  
  // Tendencia
  tendencia: 'Mejora' | 'Estable' | 'Empeora';
}

export interface IncidenciaPorArea {
  area: string;
  tardanzas: number;
  faltas: number;
  total: number;
}

export interface FiltrosTardanzasFaltas {
  fechaInicio: string;
  fechaFin: string;
  tipo: 'Todas' | 'Tardanza' | 'Falta';
  estado: 'Todos' | 'Pendiente' | 'Justificada' | 'NoJustificada';
  area: string;
  busqueda: string;
}

export interface TrabajadorReincidente {
  trabajadorId: number;
  trabajadorDni: string;
  trabajadorNombre: string;
  trabajadorArea: string;
  cantidadTardanzas: number;
  cantidadFaltas: number;
  totalIncidencias: number;
  ultimaIncidencia: string;
  nivelRiesgo: 'Bajo' | 'Medio' | 'Alto' | 'Critico';
}

export const TIPOS_JUSTIFICACION_TARDANZA = [
  'Problemas de Transporte',
  'Emergencia Médica',
  'Emergencia Familiar',
  'Cita Médica',
  'Trámite Personal Urgente',
  'Accidente de Tránsito',
  'Fenómeno Natural',
  'Problema Doméstico',
  'Otro'
];

export const TIPOS_JUSTIFICACION_FALTA = [
  'Enfermedad',
  'Emergencia Familiar',
  'Duelo',
  'Licencia Médica',
  'Permiso Sindical',
  'Comisión de Servicio',
  'Permiso por Maternidad/Paternidad',
  'Trámite Judicial',
  'Capacitación Autorizada',
  'Otro'
];

export const TIPOS_ACCION_DISCIPLINARIA = [
  { valor: 'Ninguna', label: 'Sin acción' },
  { valor: 'Amonestacion', label: 'Amonestación Verbal' },
  { valor: 'Suspension', label: 'Suspensión' },
  { valor: 'Descuento', label: 'Descuento de Haberes' }
];