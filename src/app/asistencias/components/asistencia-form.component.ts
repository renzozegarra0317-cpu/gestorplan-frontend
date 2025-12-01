import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-asistencia-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asistencia-form.component.html',
  styleUrls: ['./asistencia-form.component.scss']
})
export class AsistenciaFormComponent {
  @Input() show = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  // Control de pasos del formulario
  step = 1;

  // Modelo de asistencia
  asistencia = {
    trabajadorId: '',
    fecha: '',
    horaEntrada: '',
    horaSalida: '',
    tipo: 'Presente',
    motivo: '',
    observaciones: '',
    estado: 'Pendiente',
    evidenciaUrl: ''
  };

  // Listado de opciones, podrías cargarlas desde un servicio en el futuro
  tiposAsistencia: string[] = [
    'Presente',
    'Tardanza',
    'Falta',
    'Permiso',
    'Licencia',
    'Vacaciones'
  ];

  estadosAsistencia: string[] = [
    'Pendiente',
    'Validado',
    'Observado'
  ];

  // Aquí podrías cargar los trabajadores de un servicio en el futuro
  trabajadores: { id: string, nombre: string }[] = [
    // { id: '1', nombre: 'Juan Perez' },
    // { id: '2', nombre: 'Ana López' }
  ];

  goToNextStep() {
    this.step = 2;
  }

  goToPrevStep() {
    this.step = 1;
  }

  onClose() {
    this.step = 1;
    this.close.emit();
  }

  onSave() {
    // Puedes agregar validaciones aquí si lo necesitas
    this.save.emit(this.asistencia);
    this.step = 1;
  }

  // Si necesitas limpiar el formulario al cerrarlo o guardarlo
  resetForm() {
    this.asistencia = {
      trabajadorId: '',
      fecha: '',
      horaEntrada: '',
      horaSalida: '',
      tipo: 'Presente',
      motivo: '',
      observaciones: '',
      estado: 'Pendiente',
      evidenciaUrl: ''
    };
    this.step = 1;
  }
}