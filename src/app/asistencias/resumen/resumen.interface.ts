export interface ResumenMensualTrabajador {
  trabajadorId: number;
  trabajadorDni: string;
  trabajadorNombre: string;
  trabajadorArea: string;
  trabajadorCargo: string;
  
  // Estadísticas del mes
  diasHabiles: number;
  diasPresente: number;
  diasTardanza: number;
  diasFalta: number;
  diasPermiso: number;
  diasLicencia: number;
  diasVacaciones: number;
  diasComision: number;
  
  // Porcentajes
  porcentajeAsistencia: number;
  porcentajePuntualidad: number;
  
  // Horas
  totalHorasTrabajadas: number;
  totalHorasExtras: number;
  totalMinutosRetraso: number;
  
  // Justificaciones
  tardanzasJustificadas: number;
  faltasJustificadas: number;
  
  // Detalle diario
  detallesDiarios: DetalleDiario[];
}

export interface DetalleDiario {
  fecha: string;
  diaSemana: string;
  estado: 'Presente' | 'Tardanza' | 'Falta' | 'Permiso' | 'Licencia' | 'Vacaciones' | 'Comision' | 'Feriado' | 'Descanso';
  horaEntrada?: string;
  horaSalida?: string;
  horasTrabajadas: number;
  minutosRetraso: number;
  tieneJustificacion: boolean;
  observaciones?: string;
}

export interface ResumenGeneralMensual {
  mes: number;
  anio: number;
  nombreMes: string;
  totalTrabajadores: number;
  diasHabiles: number;
  
  // Totales
  totalAsistencias: number;
  totalTardanzas: number;
  totalFaltas: number;
  totalPermisos: number;
  totalLicencias: number;
  
  // Promedios
  promedioAsistencia: number;
  promedioPuntualidad: number;
  
  // Top/Bottom
  trabajadoresDestacados: ResumenMensualTrabajador[];
  trabajadoresAlerta: ResumenMensualTrabajador[];
}

export interface FiltrosResumen {
  mes: number;
  anio: number;
  area?: string;
  ordenarPor: 'nombre' | 'asistencia' | 'tardanzas' | 'faltas';
  busqueda?: string;
}

export interface GraficoAsistencia {
  fecha: string;
  presentes: number;
  tardanzas: number;
  faltas: number;
  permisos: number;
}

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