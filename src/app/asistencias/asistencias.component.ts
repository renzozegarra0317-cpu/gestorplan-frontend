import { Component } from '@angular/core';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { AsistenciaFormComponent } from './components/asistencia-form.component';

interface Asistencia {
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

@Component({
  selector: 'app-asistencias',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    AsistenciaFormComponent
  ],
  templateUrl: './asistencias.component.html',
  styleUrls: ['./asistencias.component.scss']
})
export class AsistenciasComponent {
  mostrarModalAsistencia = false;

  asistencias: Asistencia[] = [
    {
      trabajadorId: 'Juan Perez',
      fecha: '2025-10-01',
      horaEntrada: '08:05',
      horaSalida: '17:15',
      tipo: 'Presente',
      motivo: '',
      observaciones: '',
      estado: 'Validado',
      evidenciaUrl: ''
    }
  ];

  abrirModalAsistencia() {
    this.mostrarModalAsistencia = true;
  }

  cerrarModalAsistencia() {
    this.mostrarModalAsistencia = false;
  }

  guardarAsistencia(asistencia: Asistencia) {
    this.asistencias.unshift(asistencia);
    this.mostrarModalAsistencia = false;
  }
}