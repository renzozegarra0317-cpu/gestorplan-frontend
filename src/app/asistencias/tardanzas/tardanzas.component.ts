import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { 
  RegistroTardanzaFalta, 
  ResumenTardanzasFaltas, 
  FiltrosTardanzasFaltas,
  TrabajadorReincidente,
  TIPOS_JUSTIFICACION_TARDANZA,
  TIPOS_JUSTIFICACION_FALTA,
  TIPOS_ACCION_DISCIPLINARIA
} from './tardanzas.interface';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-tardanzas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tardanzas.component.html',
  styleUrls: ['./tardanzas.component.scss']
})
export class TardanzasComponent implements OnInit {
  // Datos
  registros: RegistroTardanzaFalta[] = [];
  registrosFiltrados: RegistroTardanzaFalta[] = [];
  resumen: ResumenTardanzasFaltas | null = null;
  trabajadoresReincidentes: TrabajadorReincidente[] = [];
  
  // Filtros
  filtros: FiltrosTardanzasFaltas = {
    fechaInicio: this.obtenerPrimerDiaMes(),
    fechaFin: this.obtenerUltimoDiaMes(),
    tipo: 'Todas',
    estado: 'Todos',
    area: '',
    busqueda: ''
  };
  
  // Estado
  cargando: boolean = false;
  vistaActual: 'lista' | 'estadisticas' | 'reincidentes' = 'lista';
  mostrarModalJustificacion: boolean = false;
  mostrarModalAccion: boolean = false;
  mostrarModalDetalles: boolean = false;
  registroSeleccionado: RegistroTardanzaFalta | null = null;
  
  // Catálogos
  tiposJustificacionTardanza = TIPOS_JUSTIFICACION_TARDANZA;
  tiposJustificacionFalta = TIPOS_JUSTIFICACION_FALTA;
  tiposAccion = TIPOS_ACCION_DISCIPLINARIA;
  
  areas: string[] = [];
  
  // Form data
  justificacionForm = {
    tipoJustificacion: '',
    motivo: '',
    documento: null as File | null
  };
  
  accionForm = {
    tipoAccion: 'Ninguna',
    montoDescuento: 0,
    observaciones: ''
  };

  private apiUrl = `${environment.apiUrl}/asistencias`;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Resetear scroll al inicio
    window.scrollTo(0, 0);
    setTimeout(() => {
      const mainContent = document.querySelector('.main-content') as HTMLElement;
      if (mainContent) {
        mainContent.scrollTop = 0;
      }
    }, 100);
    
    this.cargarAreas();
    this.cargarDatos();
  }
  
  cargarAreas(): void {
    this.http.get<any>(`${environment.apiUrl}/areas`).subscribe({
      next: (response) => {
        const areasData = response.data || response;
        if (Array.isArray(areasData) && areasData.length > 0) {
          const areasUnicas = new Map<string, string>();
          areasData.forEach((area: any) => {
            const nombre = area.Nombre || area.nombre;
            if (nombre && !areasUnicas.has(nombre.trim().toUpperCase())) {
              areasUnicas.set(nombre.trim().toUpperCase(), nombre);
            }
          });
          this.areas = Array.from(areasUnicas.values()).sort();
        } else {
          // Fallback si no hay áreas
          this.areas = [
            'Gerencia Municipal',
            'Oficina de Recursos Humanos',
            'Oficina de Administración',
            'Gerencia de Desarrollo Social',
            'Gerencia de Infraestructura',
            'Serenazgo',
            'Registro Civil'
          ];
        }
      },
      error: (error) => {
        console.error('Error al cargar áreas:', error);
        // Fallback
        this.areas = [
          'Gerencia Municipal',
          'Oficina de Recursos Humanos',
          'Oficina de Administración',
          'Gerencia de Desarrollo Social',
          'Gerencia de Infraestructura',
          'Serenazgo',
          'Registro Civil'
        ];
      }
    });
  }

  obtenerPrimerDiaMes(): string {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
  }

  obtenerUltimoDiaMes(): string {
    const hoy = new Date();
    const ultimo = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    return `${ultimo.getFullYear()}-${String(ultimo.getMonth() + 1).padStart(2, '0')}-${String(ultimo.getDate()).padStart(2, '0')}`;
  }

  cargarDatos(): void {
    this.cargando = true;
    
    // Modo DEMO: forzar todo vacío
    if (this.authService.isDemo()) {
      this.registros = [];
      this.registrosFiltrados = [];
      this.resumen = {
        periodo: `${this.filtros.fechaInicio} - ${this.filtros.fechaFin}`,
        mes: new Date(this.filtros.fechaInicio).getMonth() + 1,
        anio: new Date(this.filtros.fechaInicio).getFullYear(),
        totalIncidencias: 0,
        totalTardanzas: 0,
        totalFaltas: 0,
        tardanzasJustificadas: 0,
        tardanzasNoJustificadas: 0,
        tardanzasPendientes: 0,
        faltasJustificadas: 0,
        faltasNoJustificadas: 0,
        faltasPendientes: 0,
        minutosRetrasoProm: 0,
        trabajadoresConIncidencias: 0,
        trabajadoresReincidentes: 0,
        incidenciasPorArea: [],
        tendencia: 'Estable'
      };
      this.trabajadoresReincidentes = [];
      this.cargando = false;
      return;
    }
    
    // Cargar incidencias
    let params = new HttpParams()
      .set('fechaInicio', this.filtros.fechaInicio)
      .set('fechaFin', this.filtros.fechaFin)
      .set('tipo', this.filtros.tipo)
      .set('estado', this.filtros.estado);
    
    if (this.filtros.area) {
      params = params.set('area', this.filtros.area);
    }
    
    if (this.filtros.busqueda) {
      params = params.set('busqueda', this.filtros.busqueda);
    }
    
    console.log('🔄 [Frontend] Cargando incidencias con parámetros:', {
      fechaInicio: this.filtros.fechaInicio,
      fechaFin: this.filtros.fechaFin,
      tipo: this.filtros.tipo,
      estado: this.filtros.estado,
      area: this.filtros.area,
      busqueda: this.filtros.busqueda,
      url: `${this.apiUrl}/incidencias`
    });
    
    this.http.get<any>(`${this.apiUrl}/incidencias`, { params }).subscribe({
      next: (response) => {
        console.log('✅ [Frontend] Respuesta recibida:', {
          success: response.success,
          total: response.total,
          dataLength: response.data?.length || 0
        });
        
        if (response.success) {
          this.registros = response.data || [];
          this.registrosFiltrados = [...this.registros]; // Inicializar filtrados
          console.log(`📊 [Frontend] ${this.registros.length} incidencias cargadas`);
          if (this.registros.length > 0) {
            // Mostrar detalles completos de las primeras 3 incidencias
            this.registros.slice(0, 3).forEach((reg, index) => {
              console.log(`📝 [Frontend] Incidencia ${index + 1}:`, {
                id: reg.id,
                tipo: reg.tipo,
                trabajadorNombre: reg.trabajadorNombre,
                minutosRetraso: reg.minutosRetraso,
                horaLlegada: reg.horaLlegada,
                horaEsperada: reg.horaEsperada,
                fecha: reg.fecha
              });
            });
          }
        } else {
          console.error('❌ [Frontend] Error en respuesta:', response.message);
          this.registros = [];
          this.registrosFiltrados = [];
        }
        this.cargarResumen();
      },
      error: (error) => {
        console.error('❌ [Frontend] Error HTTP al cargar incidencias:', error);
        console.error('❌ [Frontend] Detalles del error:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        this.registros = [];
        this.registrosFiltrados = [];
        this.cargarResumen();
      }
    });
  }
  
  cargarResumen(): void {
    let params = new HttpParams()
      .set('fechaInicio', this.filtros.fechaInicio)
      .set('fechaFin', this.filtros.fechaFin);
    
    this.http.get<any>(`${this.apiUrl}/incidencias/resumen`, { params }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;
          this.resumen = {
            periodo: `${this.filtros.fechaInicio} - ${this.filtros.fechaFin}`,
            mes: new Date(this.filtros.fechaInicio).getMonth() + 1,
            anio: new Date(this.filtros.fechaInicio).getFullYear(),
            totalTardanzas: data.totalTardanzas || 0,
            totalFaltas: data.totalFaltas || 0,
            totalIncidencias: data.totalIncidencias || 0,
            tardanzasJustificadas: data.tardanzasJustificadas || 0,
            tardanzasNoJustificadas: data.tardanzasNoJustificadas || 0,
            tardanzasPendientes: data.tardanzasPendientes || 0,
            faltasJustificadas: data.faltasJustificadas || 0,
            faltasNoJustificadas: data.faltasNoJustificadas || 0,
            faltasPendientes: data.faltasPendientes || 0,
            minutosRetrasoProm: data.minutosRetrasoProm || 0,
            trabajadoresConIncidencias: data.trabajadoresConIncidencias || 0,
            trabajadoresReincidentes: data.trabajadoresReincidentes || 0,
            incidenciasPorArea: data.incidenciasPorArea || [],
            tendencia: data.tendencia || 'Estable'
          };
        } else {
          this.resumen = {
            periodo: `${this.filtros.fechaInicio} - ${this.filtros.fechaFin}`,
            mes: new Date(this.filtros.fechaInicio).getMonth() + 1,
            anio: new Date(this.filtros.fechaInicio).getFullYear(),
            totalTardanzas: 0,
            totalFaltas: 0,
            totalIncidencias: 0,
            tardanzasJustificadas: 0,
            tardanzasNoJustificadas: 0,
            tardanzasPendientes: 0,
            faltasJustificadas: 0,
            faltasNoJustificadas: 0,
            faltasPendientes: 0,
            minutosRetrasoProm: 0,
            trabajadoresConIncidencias: 0,
            trabajadoresReincidentes: 0,
            incidenciasPorArea: [],
            tendencia: 'Estable'
          };
        }
        this.cargarReincidentes();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar resumen:', error);
        this.resumen = {
          periodo: `${this.filtros.fechaInicio} - ${this.filtros.fechaFin}`,
          mes: new Date(this.filtros.fechaInicio).getMonth() + 1,
          anio: new Date(this.filtros.fechaInicio).getFullYear(),
          totalTardanzas: 0,
          totalFaltas: 0,
          totalIncidencias: 0,
          tardanzasJustificadas: 0,
          tardanzasNoJustificadas: 0,
          tardanzasPendientes: 0,
          faltasJustificadas: 0,
          faltasNoJustificadas: 0,
          faltasPendientes: 0,
          minutosRetrasoProm: 0,
          trabajadoresConIncidencias: 0,
          trabajadoresReincidentes: 0,
          incidenciasPorArea: [],
          tendencia: 'Estable'
        };
        this.cargarReincidentes();
        this.cargando = false;
      }
    });
  }
  
  cargarReincidentes(): void {
    let params = new HttpParams()
      .set('fechaInicio', this.filtros.fechaInicio)
      .set('fechaFin', this.filtros.fechaFin);
    
    this.http.get<any>(`${this.apiUrl}/incidencias/reincidentes`, { params }).subscribe({
      next: (response) => {
        if (response.success) {
          this.trabajadoresReincidentes = response.data || [];
        } else {
          this.trabajadoresReincidentes = [];
        }
      },
      error: (error) => {
        console.error('Error al cargar reincidentes:', error);
        this.trabajadoresReincidentes = [];
      }
    });
  }


  calcularNivelRiesgo(tardanzas: number, faltas: number): 'Bajo' | 'Medio' | 'Alto' | 'Critico' {
    const total = tardanzas + faltas;
    const pesoFaltas = faltas * 2;
    const puntaje = tardanzas + pesoFaltas;
    
    if (puntaje >= 10 || faltas >= 3) return 'Critico';
    if (puntaje >= 6 || faltas >= 2) return 'Alto';
    if (puntaje >= 3) return 'Medio';
    return 'Bajo';
  }

  aplicarFiltros(): void {
    // Recargar datos desde el backend con los nuevos filtros
    this.cargarDatos();
  }

  abrirModalJustificacion(registro: RegistroTardanzaFalta): void {
    this.registroSeleccionado = registro;
    this.justificacionForm = {
      tipoJustificacion: registro.tipoJustificacion || '',
      motivo: registro.motivoJustificacion || '',
      documento: null
    };
    this.mostrarModalJustificacion = true;
    
    // CRÍTICO: Reducir z-index del topbar y sidebar cuando el modal está abierto
    setTimeout(() => {
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('modal-open');
      
      const topbar = document.querySelector('app-topbar');
      if (topbar) {
        (topbar as HTMLElement).style.setProperty('z-index', '1', 'important');
        const topbarElement = topbar.querySelector('.topbar');
        if (topbarElement) {
          (topbarElement as HTMLElement).style.setProperty('z-index', '1', 'important');
          (topbarElement as HTMLElement).style.setProperty('pointer-events', 'none', 'important');
        }
      }
      
      const sidebar = document.querySelector('app-sidebar');
      if (sidebar) {
        (sidebar as HTMLElement).style.setProperty('z-index', '1', 'important');
        (sidebar as HTMLElement).style.setProperty('pointer-events', 'none', 'important');
      }
    }, 100);
  }

  guardarJustificacion(): void {
    if (!this.registroSeleccionado || !this.justificacionForm.tipoJustificacion || !this.justificacionForm.motivo) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }
    
    const payload = {
      tipoJustificacion: this.justificacionForm.tipoJustificacion,
      motivo: this.justificacionForm.motivo,
      documento: this.justificacionForm.documento ? this.justificacionForm.documento.name : null
    };
    
    this.http.put(`${this.apiUrl}/incidencias/${this.registroSeleccionado.id}/justificacion`, payload)
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            alert('Justificación guardada correctamente');
            this.mostrarModalJustificacion = false;
            this.restaurarTopbarSidebar();
            this.cargarDatos(); // Recargar datos
          } else {
            alert('Error al guardar justificación: ' + (response.message || 'Error desconocido'));
          }
        },
        error: (error) => {
          console.error('Error al guardar justificación:', error);
          alert('Error al guardar justificación: ' + (error.error?.message || error.message || 'Error desconocido'));
        }
      });
  }
  onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.justificacionForm.documento = input.files[0];
  }
}

  restaurarTopbarSidebar(): void {
    // CRÍTICO: Restaurar z-index del topbar y sidebar cuando el modal se cierra
    setTimeout(() => {
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      
      const topbar = document.querySelector('app-topbar');
      if (topbar) {
        (topbar as HTMLElement).style.setProperty('z-index', '100000', 'important');
        (topbar as HTMLElement).style.setProperty('pointer-events', 'auto', 'important');
        (topbar as HTMLElement).style.setProperty('visibility', 'visible', 'important');
        
        const topbarElement = topbar.querySelector('.topbar');
        if (topbarElement) {
          (topbarElement as HTMLElement).style.setProperty('z-index', '100000', 'important');
          (topbarElement as HTMLElement).style.setProperty('pointer-events', 'auto', 'important');
          (topbarElement as HTMLElement).style.setProperty('visibility', 'visible', 'important');
        }
      }
      
      const sidebar = document.querySelector('app-sidebar');
      if (sidebar) {
        (sidebar as HTMLElement).style.setProperty('z-index', '1000', 'important');
        (sidebar as HTMLElement).style.setProperty('pointer-events', 'auto', 'important');
        (sidebar as HTMLElement).style.setProperty('visibility', 'visible', 'important');
      }
      
      // Forzar un reflow para asegurar que los cambios se apliquen
      void document.body.offsetHeight;
    }, 150);
  }

  abrirModalAccion(registro: RegistroTardanzaFalta): void {
    this.registroSeleccionado = registro;
    this.accionForm = {
      tipoAccion: registro.tipoAccion || 'Ninguna',
      montoDescuento: registro.montoDescuento || 0,
      observaciones: registro.observaciones || ''
    };
    this.mostrarModalAccion = true;
  }

  abrirModalDetalles(registro: RegistroTardanzaFalta): void {
    this.registroSeleccionado = registro;
    this.mostrarModalDetalles = true;
  }

  formatearFecha(fecha: string | Date): string {
    if (!fecha) return 'N/A';
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return fechaObj.toLocaleDateString('es-PE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  formatearFechaHora(fecha: string | Date): string {
    if (!fecha) return 'N/A';
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return fechaObj.toLocaleString('es-PE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  guardarAccion(): void {
    if (!this.registroSeleccionado) {
      return;
    }
    
    const payload = {
      tipoAccion: this.accionForm.tipoAccion,
      montoDescuento: this.accionForm.tipoAccion === 'Descuento' ? this.accionForm.montoDescuento : null,
      observaciones: this.accionForm.observaciones
    };
    
    this.http.put(`${this.apiUrl}/incidencias/${this.registroSeleccionado.id}/accion`, payload)
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            alert('Acción disciplinaria guardada correctamente');
            this.mostrarModalAccion = false;
            this.cargarDatos(); // Recargar datos
          } else {
            alert('Error al guardar acción: ' + (response.message || 'Error desconocido'));
          }
        },
        error: (error) => {
          console.error('Error al guardar acción:', error);
          alert('Error al guardar acción: ' + (error.error?.message || error.message || 'Error desconocido'));
        }
      });
  }

  exportarExcel(): void {
    try {
      // Preparar datos para exportar
      const datosExportar = this.registrosFiltrados.map(r => ({
        'Fecha': r.fecha,
        'Tipo': r.tipo,
        'DNI': r.trabajadorDni,
        'Trabajador': r.trabajadorNombre,
        'Área': r.trabajadorArea,
        'Cargo': r.trabajadorCargo,
        'Detalle': r.tipo === 'Tardanza' 
          ? `Llegada: ${r.horaLlegada || '---'} (+${r.minutosRetraso || 0}min)`
          : 'Ausencia total',
        'Estado': r.estado === 'NoJustificada' ? 'No Justificada' : r.estado,
        'Justificación': r.tieneJustificacion ? (r.tipoJustificacion || 'Sí') : 'No',
        'Motivo': r.motivoJustificacion || '---',
        'Acción': r.requiereAccion ? (r.tipoAccion || 'Sí') : 'Sin acción',
        'Observaciones': r.observaciones || '---'
      }));
      
      // Crear workbook
      const ws = XLSX.utils.json_to_sheet(datosExportar);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Tardanzas y Faltas');
      
      // Generar nombre de archivo
      const fechaInicio = this.filtros.fechaInicio.replace(/-/g, '');
      const fechaFin = this.filtros.fechaFin.replace(/-/g, '');
      const nombreArchivo = `Tardanzas_Faltas_${fechaInicio}_${fechaFin}.xlsx`;
      
      // Descargar
      XLSX.writeFile(wb, nombreArchivo);
      alert('Excel exportado correctamente');
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      alert('Error al exportar Excel. Por favor, instale la librería xlsx: npm install xlsx');
    }
  }

  exportarPDF(): void {
    try {
      // Crear contenido HTML para el PDF
      let contenido = `
        <html>
          <head>
            <title>Reporte de Tardanzas y Faltas</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .resumen { margin-top: 30px; }
              .resumen-card { display: inline-block; margin: 10px; padding: 10px; border: 1px solid #ddd; }
            </style>
          </head>
          <body>
            <h1>Reporte de Tardanzas y Faltas</h1>
            <p><strong>Período:</strong> ${this.filtros.fechaInicio} al ${this.filtros.fechaFin}</p>
            <div class="resumen">
              <h2>Resumen</h2>
              ${this.resumen ? `
                <p><strong>Total Incidencias:</strong> ${this.resumen.totalIncidencias}</p>
                <p><strong>Total Tardanzas:</strong> ${this.resumen.totalTardanzas}</p>
                <p><strong>Total Faltas:</strong> ${this.resumen.totalFaltas}</p>
                <p><strong>Trabajadores Afectados:</strong> ${this.resumen.trabajadoresConIncidencias}</p>
              ` : ''}
            </div>
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>DNI</th>
                  <th>Trabajador</th>
                  <th>Área</th>
                  <th>Detalle</th>
                  <th>Estado</th>
                  <th>Justificación</th>
                </tr>
              </thead>
              <tbody>
      `;
      
      this.registrosFiltrados.forEach(r => {
        contenido += `
          <tr>
            <td>${r.fecha}</td>
            <td>${r.tipo}</td>
            <td>${r.trabajadorDni}</td>
            <td>${r.trabajadorNombre}</td>
            <td>${r.trabajadorArea}</td>
            <td>${r.tipo === 'Tardanza' ? `Llegada: ${r.horaLlegada || '---'} (+${r.minutosRetraso || 0}min)` : 'Ausencia total'}</td>
            <td>${r.estado === 'NoJustificada' ? 'No Justificada' : r.estado}</td>
            <td>${r.tieneJustificacion ? (r.tipoJustificacion || 'Sí') : 'No'}</td>
          </tr>
        `;
      });
      
      contenido += `
              </tbody>
            </table>
          </body>
        </html>
      `;
      
      // Abrir ventana para imprimir/guardar como PDF
      const ventana = window.open('', '_blank');
      if (ventana) {
        ventana.document.write(contenido);
        ventana.document.close();
        ventana.print();
      } else {
        alert('Por favor, permita ventanas emergentes para exportar PDF');
      }
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Error al exportar PDF');
    }
  }

  limpiarFiltros(): void {
    this.filtros = {
      fechaInicio: this.obtenerPrimerDiaMes(),
      fechaFin: this.obtenerUltimoDiaMes(),
      tipo: 'Todas',
      estado: 'Todos',
      area: '',
      busqueda: ''
    };
    this.cargarDatos(); // Recargar desde el backend
  }

  getEstadoBadgeClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'Pendiente': 'badge--pendiente',
      'Justificada': 'badge--justificada',
      'NoJustificada': 'badge--no-justificada'
    };
    return clases[estado] || '';
  }

  getTipoBadgeClass(tipo: string): string {
    return tipo === 'Tardanza' ? 'badge--tardanza' : 'badge--falta';
  }

  getNivelRiesgoBadgeClass(nivel: string): string {
    const clases: { [key: string]: string } = {
      'Bajo': 'badge--riesgo-bajo',
      'Medio': 'badge--riesgo-medio',
      'Alto': 'badge--riesgo-alto',
      'Critico': 'badge--riesgo-critico'
    };
    return clases[nivel] || '';
  }

  get tiposJustificacionActuales(): string[] {
    return this.registroSeleccionado?.tipo === 'Tardanza' 
      ? this.tiposJustificacionTardanza 
      : this.tiposJustificacionFalta;
  }
}