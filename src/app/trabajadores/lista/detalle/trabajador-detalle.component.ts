import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Trabajador } from '../../trabajador.interface';

@Component({
  selector: 'app-trabajador-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trabajador-detalle.component.html',
  styleUrls: ['./trabajador-detalle.component.scss']
})
export class TrabajadorDetalleComponent {
  @Input() trabajador!: Trabajador;
  @Output() cerrar = new EventEmitter<void>();
  @Output() editar = new EventEmitter<void>();

  tabActivo: string = 'personal';

  /**
   * Retorna la clase CSS para el badge de estado
   */
  getEstadoBadgeClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'Activo': 'badge--activo',
      'Inactivo': 'badge--inactivo',
      'Suspendido': 'badge--suspendido',
      'Vacaciones': 'badge--vacaciones',
      'Licencia': 'badge--licencia'
    };
    return clases[estado] || '';
  }

  /**
   * Retorna la clase CSS para el badge de días restantes de contrato
   */
  getContratoBadgeClass(diasRestantes: number): string {
    if (diasRestantes <= 30) return 'badge--danger';
    if (diasRestantes <= 90) return 'badge--warn';
    return 'badge--ok';
  }

  /**
   * Formatea un número como moneda peruana (Soles)
   */
  formatearMoneda(monto: number): string {
    if (!monto) return 'S/. 0.00';
    return `S/. ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Formatea una fecha en formato legible (DD/MM/YYYY)
   */
  formatearFecha(fecha: string | undefined | null): string {
    if (!fecha) return 'No registrado';
    
    try {
      const fechaObj = new Date(fecha);
      
      // Verificar que la fecha sea válida
      if (isNaN(fechaObj.getTime())) {
        return 'Fecha inválida';
      }
      
      // Formatear como DD/MM/YYYY
      const dia = fechaObj.getDate().toString().padStart(2, '0');
      const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
      const anio = fechaObj.getFullYear();
      
      return `${dia}/${mes}/${anio}`;
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
  }

  /**
   * Calcula el total de ingresos del trabajador
   */
  calcularTotalIngresos(): number {
    const remuneracion = this.trabajador.remuneracionBasica || 0;
    const asignacion = this.trabajador.asignacionFamiliar || 0;
    const costoVida = this.trabajador.costoVida || 0;
    const movilidad = this.trabajador.movilidad || 0;
    const horasExtras = this.trabajador.horasExtras || 0;
    const bono = this.trabajador.bonoProductividad || 0;
    const pc_2015_2016 = this.trabajador.pc_2015_2016 || 0;
    const ra_829_2011_mdh = this.trabajador.ra_829_2011_mdh || 0;
    const otrasReintegros = this.trabajador.otrasReintegros || 0;
    const convenio_2022_2023 = this.trabajador.convenio_2022_2023 || 0;
    const convenio_2023_2024 = this.trabajador.convenio_2023_2024 || 0;
    const convenio_2024_2025 = this.trabajador.convenio_2024_2025 || 0;
    const homologacion = this.trabajador.homologacion || 0;
    const otros = this.trabajador.otrosIngresos || 0;
    
    return remuneracion + asignacion + costoVida + movilidad + horasExtras + bono + 
           pc_2015_2016 + ra_829_2011_mdh + otrasReintegros + 
           convenio_2022_2023 + convenio_2023_2024 + convenio_2024_2025 + 
           homologacion + otros;
  }

  /**
   * Descarga un documento (implementar según tu backend)
   */
  descargarDocumento(documento: any): void {
    console.log('Descargando documento:', documento);
    // Implementar lógica de descarga según tu backend
    alert(`Descargando: ${documento.nombre}`);
  }
}