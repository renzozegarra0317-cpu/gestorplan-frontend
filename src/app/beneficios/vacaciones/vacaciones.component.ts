import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VacacionesService } from './vacaciones.service';
import { 
  RegistroVacaciones,
  FiltrosVacaciones,
  ResumenVacaciones,
  RecordVacacional,
  ConfiguracionVacaciones,
  CONFIGURACION_VACACIONES_DEFAULT,
  TIPOS_VACACIONES,
  ESTADOS_VACACIONES,
  AREAS_MUNICIPALES_VAC,
  MESES_VACACIONES
} from './vacaciones.interface';

@Component({
  selector: 'app-vacaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vacaciones.component.html',
  styleUrls: ['./vacaciones.component.scss']
})
export class VacacionesComponent implements OnInit {
  // Datos
  registrosVacaciones: RegistroVacaciones[] = [];
  registrosFiltrados: RegistroVacaciones[] = [];
  registroSeleccionado: RegistroVacaciones | null = null;
  recordSeleccionado: RecordVacacional | null = null;
  resumen: ResumenVacaciones | null = null;
  
  // Configuracion
  config: ConfiguracionVacaciones = { ...CONFIGURACION_VACACIONES_DEFAULT };
  
  // Filtros
  filtros: FiltrosVacaciones = {
    anio: new Date().getFullYear(),
    tipo: 'Todas',
    estado: 'Todos',
    area: 'Todas',
    busqueda: ''
  };
  
  // Estado
  cargando: boolean = false;
  mostrarModalDetalle: boolean = false;
  mostrarModalProgramar: boolean = false;
  mostrarModalRecord: boolean = false;
  mostrarModalPago: boolean = false;
  mostrarModalExitoProgramacion: boolean = false;
  programando: boolean = false;
  programacionCompletada: boolean = false;
  mostrarModalAprobar: boolean = false;
  registroAprobar: RegistroVacaciones | null = null;
  aprobando: boolean = false;
  aprobacionCompletada: boolean = false;
  mostrarModalExitoAprobacion: boolean = false;
  
  // Formulario programacion
  formularioProgramacion = {
    trabajadorId: 0,
    fechaInicio: '',
    fechaFin: '',
    diasProgramados: 0,
    observaciones: ''
  };
  
  // Trabajadores disponibles
  trabajadoresDisponibles: any[] = [];
  cargandoTrabajadores: boolean = false;
  
  // Vista
  vistaActual: 'lista' | 'calendario' | 'record' = 'lista';
  
  // Paginacion
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  
  // Catalogos
  tiposVacaciones = TIPOS_VACACIONES;
  estadosVacaciones = ESTADOS_VACACIONES;
  areas = AREAS_MUNICIPALES_VAC;
  mesesVacaciones = MESES_VACACIONES;
  anios: number[] = [];

  constructor(
    private router: Router,
    private vacacionesService: VacacionesService,
    private cdr: ChangeDetectorRef
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
    
    this.inicializarAnios();
    this.cargarRegistrosVacaciones();
    this.cargarTrabajadores();
  }

  inicializarAnios(): void {
    const anioActual = new Date().getFullYear();
    for (let i = anioActual; i >= anioActual - 5; i--) {
      this.anios.push(i);
    }
  }

  cargarTrabajadores(): void {
    this.cargandoTrabajadores = true;
    
    this.vacacionesService.obtenerTrabajadoresDisponibles(this.filtros.anio).subscribe({
      next: (response) => {
        this.cargandoTrabajadores = false;
        if (response.success && response.data) {
          this.trabajadoresDisponibles = response.data.map((t: any) => ({
            id: t.id,
            dni: t.dni,
            nombre: t.nombre,
            cargo: t.cargo || '',
            area: t.area || '',
            fechaIngreso: t.fechaIngreso ? new Date(t.fechaIngreso) : new Date(),
            diasPendientes: t.diasPendientes || 0,
            banco: t.banco || '',
            numeroCuenta: t.numeroCuenta || ''
          }));
          console.log(`✅ Trabajadores cargados: ${this.trabajadoresDisponibles.length}`);
        } else {
          this.trabajadoresDisponibles = [];
          console.warn('⚠️ No se encontraron trabajadores disponibles');
        }
      },
      error: (error) => {
        this.cargandoTrabajadores = false;
        console.error('❌ Error al cargar trabajadores:', error);
        this.trabajadoresDisponibles = [];
        alert('Error al cargar trabajadores disponibles. Por favor, intente nuevamente.');
      }
    });
  }

  cargarRegistrosVacaciones(): void {
    this.cargando = true;
    
    this.vacacionesService.listar(this.filtros).subscribe({
      next: (response) => {
        if (response.success) {
          this.registrosVacaciones = response.data.map((item: any) => ({
            id: item.id,
            codigo: item.codigo,
            trabajadorId: item.trabajadorId,
            trabajadorDni: item.trabajadorDni,
            trabajadorNombre: item.trabajadorNombre,
            trabajadorCargo: item.trabajadorCargo || '',
            trabajadorArea: item.trabajadorArea || '',
            periodoInicio: item.periodoInicio ? new Date(item.periodoInicio) : new Date(),
            periodoFin: item.periodoFin ? new Date(item.periodoFin) : new Date(),
            aniosPeriodo: item.aniosPeriodo || '',
            diasGenerados: item.diasGenerados || 0,
            diasGozados: item.diasGozados || 0,
            diasPendientes: item.diasPendientes || 0,
            fechaInicioProgramada: item.fechaInicioProgramada ? new Date(item.fechaInicioProgramada) : undefined,
            fechaFinProgramada: item.fechaFinProgramada ? new Date(item.fechaFinProgramada) : undefined,
            diasProgramados: item.diasProgramados || 0,
            fechaInicioReal: item.fechaInicioReal ? new Date(item.fechaInicioReal) : undefined,
            fechaFinReal: item.fechaFinReal ? new Date(item.fechaFinReal) : undefined,
            diasReales: item.diasReales || 0,
            tipoVacaciones: item.tipoVacaciones || 'No Gozadas',
            remuneracionVacacional: item.remuneracionVacacional || 0,
            montoVacaciones: item.montoVacaciones || 0,
            esTrunca: item.esTrunca || false,
            banco: item.banco || '',
            numeroCuenta: item.numeroCuenta || '',
            estado: item.estado || 'Pendiente',
            fechaProgramacion: item.fechaProgramacion ? new Date(item.fechaProgramacion) : undefined,
            fechaAprobacion: item.fechaAprobacion ? new Date(item.fechaAprobacion) : undefined,
            fechaPago: item.fechaPago ? new Date(item.fechaPago) : undefined,
            programadoPor: item.programadoPor || '',
            aprobadoPor: item.aprobadoPor || ''
          }));
          
          this.cargarResumen();
          this.aplicarFiltros();
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar vacaciones:', error);
        this.registrosVacaciones = [];
        this.cargando = false;
      }
    });
  }

  cargarResumen(): void {
    this.vacacionesService.obtenerResumen(this.filtros).subscribe({
      next: (response) => {
        if (response.success) {
          this.resumen = response.data;
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar resumen:', error);
      }
    });
  }

  calcularResumen(): void {
    // El resumen ahora se carga desde el backend
    // Este método se mantiene por compatibilidad pero ya no calcula localmente
    if (!this.resumen) {
      this.cargarResumen();
    }
  }

  aplicarFiltros(): void {
    let resultado = [...this.registrosVacaciones];
    
    if (this.filtros.anio) {
      resultado = resultado.filter(r => {
        const anio = new Date(r.periodoInicio).getFullYear();
        return anio === this.filtros.anio;
      });
    }
    
    if (this.filtros.tipo !== 'Todas') {
      resultado = resultado.filter(r => r.tipoVacaciones === this.filtros.tipo);
    }
    
    if (this.filtros.estado !== 'Todos') {
      resultado = resultado.filter(r => r.estado === this.filtros.estado);
    }
    
    if (this.filtros.area !== 'Todas') {
      resultado = resultado.filter(r => r.trabajadorArea === this.filtros.area);
    }
    
    if (this.filtros.busqueda) {
      const busqueda = this.filtros.busqueda.toLowerCase();
      resultado = resultado.filter(r =>
        r.codigo.toLowerCase().includes(busqueda) ||
        r.trabajadorNombre.toLowerCase().includes(busqueda) ||
        r.trabajadorDni.includes(busqueda)
      );
    }
    
    resultado.sort((a, b) => new Date(b.periodoInicio).getTime() - new Date(a.periodoInicio).getTime());
    
    this.registrosFiltrados = resultado;
    this.paginaActual = 1;
  }

  limpiarFiltros(): void {
    this.filtros = {
      anio: new Date().getFullYear(),
      tipo: 'Todas',
      estado: 'Todos',
      area: 'Todas',
      busqueda: ''
    };
    this.aplicarFiltros();
  }

  // ==================== ACCIONES ====================
  verDetalle(registro: RegistroVacaciones): void {
    this.registroSeleccionado = registro;
    this.mostrarModalDetalle = true;
  }

  abrirProgramacion(trabajador?: any): void {
    // Resetear formulario
    this.formularioProgramacion = {
      trabajadorId: trabajador ? trabajador.id : 0,
      fechaInicio: '',
      fechaFin: '',
      diasProgramados: 0,
      observaciones: ''
    };
    
    // Cargar trabajadores disponibles siempre al abrir el modal
    this.cargarTrabajadores();
    
    this.mostrarModalProgramar = true;
  }

  calcularDiasProgramados(): void {
    if (this.formularioProgramacion.fechaInicio && this.formularioProgramacion.fechaFin) {
      const inicio = new Date(this.formularioProgramacion.fechaInicio);
      const fin = new Date(this.formularioProgramacion.fechaFin);
      const dias = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      this.formularioProgramacion.diasProgramados = dias;
    }
  }

  confirmarProgramacion(): void {
    if (!this.formularioProgramacion.trabajadorId || !this.formularioProgramacion.fechaInicio || !this.formularioProgramacion.fechaFin) {
      alert('Complete todos los campos obligatorios');
      return;
    }
    
    // Validar que las fechas sean válidas
    const fechaInicio = new Date(this.formularioProgramacion.fechaInicio);
    const fechaFin = new Date(this.formularioProgramacion.fechaFin);
    
    if (fechaFin < fechaInicio) {
      alert('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }
    
    this.programando = true;
    this.programacionCompletada = false;
    this.mostrarModalExitoProgramacion = true;
    this.mostrarModalProgramar = false; // Cerrar modal de programación
    
    this.vacacionesService.programar({
      trabajadorId: this.formularioProgramacion.trabajadorId,
      fechaInicio: this.formularioProgramacion.fechaInicio,
      fechaFin: this.formularioProgramacion.fechaFin,
      observaciones: this.formularioProgramacion.observaciones
    }).subscribe({
      next: (response) => {
        if (response.success) {
          // Mostrar spinner de carga
          this.cdr.detectChanges();
          
          // Después de un breve delay, mostrar el check de éxito
          setTimeout(() => {
            this.programando = false;
            this.programacionCompletada = true;
            this.cdr.detectChanges();
            this.cdr.markForCheck();
            
            // Cerrar modal de éxito y recargar datos después de 2.5 segundos
            setTimeout(() => {
              this.cerrarModalExitoProgramacion();
              this.formularioProgramacion = {
                trabajadorId: 0,
                fechaInicio: '',
                fechaFin: '',
                diasProgramados: 0,
                observaciones: ''
              };
              this.cargarRegistrosVacaciones();
              this.cargarTrabajadores();
            }, 2500);
          }, 800);
        }
      },
      error: (error) => {
        console.error('❌ Error al programar vacación:', error);
        this.programando = false;
        this.cerrarModalExitoProgramacion();
        const mensajeError = error.error?.message || error.error?.error || 'Error al programar vacación. Por favor, intente nuevamente.';
        alert(mensajeError);
      }
    });
  }

  cerrarModalExitoProgramacion(): void {
    this.mostrarModalExitoProgramacion = false;
    this.programando = false;
    this.programacionCompletada = false;
  }

  aprobarVacaciones(registro: RegistroVacaciones): void {
    if (!registro.id) return;
    
    this.registroAprobar = registro;
    this.mostrarModalAprobar = true;
  }

  confirmarAprobacion(): void {
    if (!this.registroAprobar) return;
    
    this.aprobando = true;
    this.aprobacionCompletada = false;
    this.mostrarModalAprobar = false;
    this.mostrarModalExitoAprobacion = true;
    
    this.vacacionesService.aprobar(this.registroAprobar.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.cdr.detectChanges();
          
          setTimeout(() => {
            this.aprobando = false;
            this.aprobacionCompletada = true;
            this.cdr.detectChanges();
            this.cdr.markForCheck();
            
            setTimeout(() => {
              this.cerrarModalExitoAprobacion();
              this.cargarRegistrosVacaciones();
            }, 2500);
          }, 800);
        }
      },
      error: (error) => {
        console.error('❌ Error al aprobar vacación:', error);
        this.aprobando = false;
        this.cerrarModalExitoAprobacion();
        const mensajeError = error.error?.message || error.error?.error || 'Error al aprobar vacación. Por favor, intente nuevamente.';
        alert(mensajeError);
      }
    });
  }

  cerrarModalAprobar(): void {
    this.mostrarModalAprobar = false;
    this.registroAprobar = null;
  }

  cerrarModalExitoAprobacion(): void {
    this.mostrarModalExitoAprobacion = false;
    this.aprobando = false;
    this.aprobacionCompletada = false;
    this.registroAprobar = null;
  }

  iniciarGoce(registro: RegistroVacaciones): void {
    if (!registro.id) return;
    
    this.vacacionesService.iniciarGoce(registro.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.cargarRegistrosVacaciones();
        }
      },
      error: (error) => {
        console.error('❌ Error al iniciar goce:', error);
        alert('Error al iniciar goce');
      }
    });
  }

  finalizarGoce(registro: RegistroVacaciones): void {
    if (!registro.id) return;
    
    const diasGozados = registro.diasReales || registro.diasProgramados || 0;
    const diasPendientes = registro.diasGenerados - diasGozados;
    
    this.vacacionesService.finalizarGoce(registro.id, {
      diasGozados,
      diasPendientes
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.cargarRegistrosVacaciones();
        }
      },
      error: (error) => {
        console.error('❌ Error al finalizar goce:', error);
        alert('Error al finalizar goce');
      }
    });
  }

  abrirPago(registro: RegistroVacaciones): void {
    this.registroSeleccionado = registro;
    this.mostrarModalPago = true;
  }

  confirmarPago(): void {
    if (!this.registroSeleccionado || !this.registroSeleccionado.id) return;
    
    const numeroComprobante = `VAC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    this.vacacionesService.pagar(this.registroSeleccionado.id, numeroComprobante).subscribe({
      next: (response) => {
        if (response.success) {
          this.mostrarModalPago = false;
          this.cargarRegistrosVacaciones();
        }
      },
      error: (error) => {
        console.error('❌ Error al confirmar pago:', error);
        alert('Error al confirmar pago');
      }
    });
  }

  verRecord(trabajador: any): void {
    // Obtener todas las vacaciones del trabajador
    this.vacacionesService.listar({ 
      anio: null, 
      estado: 'Todos', 
      area: 'Todas', 
      busqueda: trabajador.dni 
    }).subscribe({
      next: (response) => {
        if (response.success) {
          const vacacionesTrabajador = response.data.filter((v: any) => v.trabajadorId === trabajador.id);
          
          const periodos = vacacionesTrabajador.map((v: any) => ({
            anio: v.aniosPeriodo || `${v.periodoAnio}-${v.periodoAnio + 1}`,
            diasGenerados: v.diasGenerados || 0,
            diasGozados: v.diasGozados || 0,
            diasPendientes: v.diasPendientes || 0,
            estado: v.estado || 'Pendiente'
          }));
          
          const totalDiasGenerados = periodos.reduce((sum: number, p: any) => sum + p.diasGenerados, 0);
          const totalDiasGozados = periodos.reduce((sum: number, p: any) => sum + p.diasGozados, 0);
          const totalDiasPendientes = periodos.reduce((sum: number, p: any) => sum + p.diasPendientes, 0);
          
          this.recordSeleccionado = {
            trabajadorId: trabajador.id,
            trabajadorNombre: trabajador.nombre,
            fechaIngreso: trabajador.fechaIngreso,
            aniosServicio: this.calcularAniosServicio(trabajador.fechaIngreso),
            periodos,
            totalDiasGenerados,
            totalDiasGozados,
            totalDiasPendientes
          };
          this.mostrarModalRecord = true;
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar record vacacional:', error);
        alert('Error al cargar el record vacacional');
      }
    });
  }

  calcularAniosServicio(fechaIngreso: Date): number {
    const hoy = new Date();
    const ingreso = new Date(fechaIngreso);
    return Math.floor((hoy.getTime() - ingreso.getTime()) / (1000 * 60 * 60 * 24 * 365));
  }

  descargarConstancia(registro: RegistroVacaciones): void {
    console.log('Descargar constancia de vacaciones:', registro.codigo);
  }

  exportarExcel(): void {
    console.log('Exportar vacaciones a Excel');
  }

  // ==================== PAGINACION ====================
  get registrosPaginados(): RegistroVacaciones[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.registrosFiltrados.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.registrosFiltrados.length / this.itemsPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  // ==================== UTILIDADES ====================
  getEstadoBadgeClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'Pendiente': 'badge--pendiente',
      'Programado': 'badge--programado',
      'Aprobado': 'badge--aprobado',
      'En Goce': 'badge--engoce',
      'Gozado': 'badge--gozado',
      'Pagado': 'badge--pagado',
      'Observado': 'badge--observado'
    };
    return clases[estado] || '';
  }

  getTipoBadgeClass(tipo: string): string {
    const clases: { [key: string]: string } = {
      'Completas': 'badge--completas',
      'Fraccionadas': 'badge--fraccionadas',
      'Truncas': 'badge--truncas',
      'No Gozadas': 'badge--nogozadas'
    };
    return clases[tipo] || '';
  }

  formatearFecha(fecha: Date | string | undefined): string {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-PE');
  }
}