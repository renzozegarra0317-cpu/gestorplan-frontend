export interface RegistroAsistencia {
  id?: number;
  fecha: string;
  trabajadorId: number;
  trabajadorDni: string;
  trabajadorNombre: string;
  trabajadorArea: string;
  trabajadorCargo: string;
  trabajadorRegimenLaboral?: string;  // Régimen laboral del trabajador
  
  // Marcaciones (horas registradas del día)
  horaEntrada?: string;  // Alias de horaEntradaManana (compatibilidad)
  horaSalida?: string;   // Alias de horaSalidaManana (compatibilidad)
  horaEntradaManana?: string;  // Entrada turno mañana (registrada)
  horaSalidaManana?: string;   // Salida turno mañana (registrada)
  horaEntradaTarde?: string;   // Entrada turno tarde (registrada)
  horaSalidaTarde?: string;    // Salida turno tarde (registrada)
  
  // Horarios asignados (horario habitual del trabajador)
  horarioAsignadoEntradaManana?: string;  // Horario asignado entrada mañana
  horarioAsignadoSalidaManana?: string;   // Horario asignado salida mañana
  horarioAsignadoEntradaTarde?: string;   // Horario asignado entrada tarde
  horarioAsignadoSalidaTarde?: string;    // Horario asignado salida tarde
  
  // Estado del registro (Validado, Pendiente, etc.) y tipo de marcación
  estado: 'Presente' | 'Tardanza' | 'Falta' | 'Permiso' | 'Licencia' | 'Vacaciones' | 'Comision' | 'Validado' | 'Pendiente' | 'Observado' | 'Anulada';
  tipoMarcacion?: 'Manual' | 'Biometrico' | 'Sistema' | 'Presente' | 'Tardanza' | 'Falta' | 'Permiso' | 'Licencia' | 'Vacaciones' | 'Comision';
  
  // Cálculos
  minutosRetraso: number;
  minutosTardanza?: number;  // Alias del backend (MinutosTardanza)
  horasTrabajadas: number;
  horasExtras: number;
  
  // Justificación
  tieneJustificacion: boolean;
  motivoJustificacion?: string;
  documentoJustificacion?: string;
  
  // Observaciones
  observaciones?: string;
  ubicacionEntrada?: string;  // Geolocalización
  ubicacionSalida?: string;
  
  // Metadata
  registradoPor: string;
  fechaRegistro: Date;
  modificadoPor?: string;
  fechaModificacion?: Date;
}

export interface ConfiguracionHorario {
  horaEntradaManana: string;      // 08:00
  horaSalidaManana: string;        // 13:00
  horaEntradaTarde: string;        // 14:00
  horaSalidaTarde: string;         // 17:00
  minutosTolerancia: number;       // 15 minutos
  minutosMaximoRetraso: number;    // 60 minutos
}

export interface ResumenDiario {
  fecha: string;
  totalTrabajadores: number;
  presentes: number;
  tardanzas: number;
  faltas: number;
  permisos: number;
  licencias: number;
  vacaciones: number;
  comisiones: number;
  porcentajeAsistencia: number;
}

export interface FiltrosAsistencia {
  fecha?: string;
  estado?: string;
  regimenLaboral?: string;
  busqueda?: string;
}

export const HORARIO_DEFAULT: ConfiguracionHorario = {
  horaEntradaManana: '08:00',
  horaSalidaManana: '13:00',
  horaEntradaTarde: '14:00',
  horaSalidaTarde: '17:00',
  minutosTolerancia: 15,
  minutosMaximoRetraso: 60
};

export const TIPOS_JUSTIFICACION = [
  'Cita Médica',
  'Emergencia Familiar',
  'Trámite Personal',
  'Capacitación',
  'Comisión de Servicio',
  'Permiso Sindical',
  'Licencia por Enfermedad',
  'Licencia por Maternidad',
  'Licencia por Paternidad',
  'Vacaciones',
  'Otro'
];