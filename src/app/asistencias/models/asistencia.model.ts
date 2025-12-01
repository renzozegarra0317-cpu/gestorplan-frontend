export interface Asistencia {
  trabajadorId: string;
  fecha: string;
  horaEntrada: string;
  horaSalida: string;
  tipo: string;
  motivo?: string;
  observaciones?: string;
  estado: string;
  evidenciaUrl?: string;
}