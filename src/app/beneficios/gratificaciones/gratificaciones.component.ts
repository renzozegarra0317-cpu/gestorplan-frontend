import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GratificacionesService } from './gratificaciones.service';
import { 
  RegistroGratificacion,
  FiltrosGratificaciones,
  ResumenGratificaciones,
  PeriodoGratificacion,
  ConfiguracionGratificacion,
  DescuentoGratificacion,
  CONFIGURACION_GRATIFICACION_DEFAULT,
  PERIODOS_GRATIFICACION,
  ESTADOS_GRATIFICACION,
  MESES_GRATIFICACION,
  AREAS_MUNICIPALES_GRAT,
  TIPOS_CUENTA_GRAT,
  MONEDAS_GRAT
} from './gratificaciones.interface';

@Component({
  selector: 'app-gratificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gratificaciones.component.html',
  styleUrls: ['./gratificaciones.component.scss']
})
export class GratificacionesComponent implements OnInit {
  // Datos
  registrosGratificacion: RegistroGratificacion[] = [];
  registrosFiltrados: RegistroGratificacion[] = [];
  registroSeleccionado: RegistroGratificacion | null = null;
  resumen: ResumenGratificaciones | null = null;
  
  // Configuracion
  config: ConfiguracionGratificacion = { ...CONFIGURACION_GRATIFICACION_DEFAULT };
  
  // Filtros
  filtros: FiltrosGratificaciones = {
    anio: new Date().getFullYear(),
    periodo: 'Todos',
    estado: 'Todos',
    area: 'Todas',
    busqueda: ''
  };
  
  // Estado
  cargando: boolean = false;
  mostrarModalDetalle: boolean = false;
  mostrarModalCalculo: boolean = false;
  mostrarModalPago: boolean = false;
  mostrarModalErrorCarga: boolean = false;
  mensajeErrorCarga: string = '';
  mostrarModalResultadoCalculo: boolean = false;
  resultadoCalculoMasivo: any = null;
  mostrarModalEliminar: boolean = false;
  gratificacionAEliminar: RegistroGratificacion | null = null;
  confirmacionEliminar: string = '';
  eliminando: boolean = false;
  eliminacionCompletada: boolean = false;
  mensajeExito: string = '';
  mensajeError: string = '';
  mostrarModalExitoPago: boolean = false;
  pagando: boolean = false;
  pagoCompletado: boolean = false;
  modoCalculoMasivo: boolean = false;
  
  // Formulario calculo masivo
  periodoCalculoMasivo: PeriodoGratificacion = 'Julio';
  anioCalculoMasivo: number = new Date().getFullYear();
  
  // Trabajadores disponibles
  trabajadoresDisponibles: any[] = [];
  trabajadoresSeleccionados: any[] = [];
  
  // Paginacion
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  
  // Catalogos
  periodosGratificacion = PERIODOS_GRATIFICACION;
  estadosGratificacion = ESTADOS_GRATIFICACION;
  areas = AREAS_MUNICIPALES_GRAT;
  tiposCuenta = TIPOS_CUENTA_GRAT;
  monedas = MONEDAS_GRAT;
  mesesGratificacion = MESES_GRATIFICACION;
  anios: number[] = [];

  constructor(
    private router: Router,
    private gratificacionesService: GratificacionesService,
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
    this.cargarRegistrosGratificacion();
    this.cargarTrabajadores();
  }

  inicializarAnios(): void {
    const anioActual = new Date().getFullYear();
    for (let i = anioActual; i >= anioActual - 5; i--) {
      this.anios.push(i);
    }
  }

  cargarTrabajadores(): void {
    // Solo cargar trabajadores cuando se abre el modal de cálculo
    // Los trabajadores se cargan dinámicamente según el período seleccionado
  }

  cargarTrabajadoresDisponibles(): void {
    if (!this.periodoCalculoMasivo || !this.anioCalculoMasivo) {
      return;
    }

    // Validar que solo se pueda calcular en julio y diciembre
    if (this.periodoCalculoMasivo !== 'Julio' && this.periodoCalculoMasivo !== 'Diciembre') {
      this.mostrarModalErrorCarga = true;
      this.mensajeErrorCarga = 'Las gratificaciones solo se calculan en Julio y Diciembre';
      return;
    }

    this.gratificacionesService.obtenerTrabajadoresDisponibles(
      this.periodoCalculoMasivo,
      this.anioCalculoMasivo
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.trabajadoresDisponibles = response.data.map((t: any) => ({
            id: t.id,
            dni: t.dni,
            nombre: t.nombre,
            cargo: t.cargo,
            area: t.area,
            fechaIngreso: t.fechaIngreso ? new Date(t.fechaIngreso) : null,
            remuneracionBasica: t.remuneracionBasica,
            asignacionFamiliar: t.asignacionFamiliar,
            sistemaPensiones: t.sistemaPensiones,
            nombreAFP: t.nombreAFP,
            banco: t.banco,
            tipoCuenta: t.tipoCuenta,
            numeroCuenta: t.numeroCuenta,
            cci: t.cci,
            regimenLaboral: t.regimenLaboral,
            regimenLaboralCodigo: t.regimenLaboralCodigo
          }));
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar trabajadores:', error);
        this.mostrarModalErrorCarga = true;
        this.mensajeErrorCarga = error.error?.message || 'Error al cargar trabajadores disponibles. Por favor, intente nuevamente.';
      }
    });
  }

  cargarRegistrosGratificacion(): void {
    this.cargando = true;
    
    this.gratificacionesService.listar(this.filtros).subscribe({
      next: (response) => {
        if (response.success) {
          this.registrosGratificacion = response.data.map((item: any) => ({
            id: item.id,
            codigo: item.codigo,
            trabajadorId: item.trabajadorId,
            trabajadorDni: item.trabajadorDni,
            trabajadorNombre: item.trabajadorNombre,
            trabajadorCargo: item.trabajadorCargo,
            trabajadorArea: item.trabajadorArea,
            periodo: item.periodo,
            mes: item.mes,
            anio: item.anio,
            fechaInicio: item.fechaInicio,
            fechaFin: item.fechaFin,
            mesesCompletos: item.mesesCompletos,
            diasAdicionales: item.diasAdicionales,
            totalDias: item.totalDias,
            remuneracionBasica: item.remuneracionBasica,
            asignacionFamiliar: item.asignacionFamiliar,
            promedioHorasExtras: item.promedioHorasExtras,
            promedioComisiones: item.promedioComisiones,
            promedioBonificaciones: item.promedioBonificaciones,
            totalRemuneracionComputable: item.totalRemuneracionComputable,
            montoGratificacion: item.montoGratificacion,
            bonificacionExtraordinaria: item.bonificacionExtraordinaria,
            porcentajeBonificacion: item.porcentajeBonificacion,
            totalGratificacion: item.totalGratificacion,
            descuentos: [], // Los descuentos se calculan en el backend pero no se almacenan en la BD
            totalDescuentos: item.totalDescuentos,
            netoAPagar: item.netoAPagar,
            banco: item.banco,
            tipoCuenta: item.tipoCuenta,
            numeroCuenta: item.numeroCuenta,
            cci: item.cci,
            moneda: item.moneda,
            estado: item.estado,
            fechaCalculo: item.fechaCalculo ? new Date(item.fechaCalculo) : null,
            fechaPago: item.fechaPago ? new Date(item.fechaPago) : null,
            numeroComprobante: item.numeroComprobante,
            calculadoPor: item.calculadoPor,
            pagadoPor: item.pagadoPor,
            observaciones: item.observaciones
          }));
          
          this.calcularResumen();
          this.aplicarFiltros();
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar gratificaciones:', error);
        alert('Error al cargar gratificaciones');
        this.cargando = false;
      }
    });
  }

  calcularResumen(): void {
    const totalRegistros = this.registrosGratificacion.length;
    const trabajadoresUnicos = new Set(this.registrosGratificacion.map(r => r.trabajadorId));
    const totalTrabajadores = trabajadoresUnicos.size;
    
    const totalGratificacionCalculada = this.registrosGratificacion.reduce((sum, r) => sum + r.montoGratificacion, 0);
    const totalBonificacionExtraordinaria = this.registrosGratificacion.reduce((sum, r) => sum + r.bonificacionExtraordinaria, 0);
    const totalDescuentos = this.registrosGratificacion.reduce((sum, r) => sum + r.totalDescuentos, 0);
    const totalNetoPagado = this.registrosGratificacion
      .filter(r => r.estado === 'Pagado')
      .reduce((sum, r) => sum + r.netoAPagar, 0);
    
    const registrosBorrador = this.registrosGratificacion.filter(r => r.estado === 'Borrador').length;
    const registrosCalculados = this.registrosGratificacion.filter(r => r.estado === 'Calculado').length;
    const registrosAprobados = this.registrosGratificacion.filter(r => r.estado === 'Aprobado').length;
    const registrosPagados = this.registrosGratificacion.filter(r => r.estado === 'Pagado').length;
    const registrosObservados = this.registrosGratificacion.filter(r => r.estado === 'Observado').length;
    
    const areasUnicas = [...new Set(this.registrosGratificacion.map(r => r.trabajadorArea))];
    const distribucionPorArea = areasUnicas.map(area => ({
      area,
      cantidad: this.registrosGratificacion.filter(r => r.trabajadorArea === area).length,
      total: this.registrosGratificacion.filter(r => r.trabajadorArea === area).reduce((sum, r) => sum + r.totalGratificacion, 0)
    }));
    
    const promedioMesesServicio = this.registrosGratificacion.reduce((sum, r) => sum + r.mesesCompletos, 0) / totalRegistros;
    const promedioMontoGratificacion = totalGratificacionCalculada / totalRegistros;
    
    this.resumen = {
      totalRegistros,
      totalTrabajadores,
      totalGratificacionCalculada,
      totalBonificacionExtraordinaria,
      totalDescuentos,
      totalNetoPagado,
      registrosBorrador,
      registrosCalculados,
      registrosAprobados,
      registrosPagados,
      registrosObservados,
      distribucionPorArea,
      promedioMesesServicio,
      promedioMontoGratificacion
    };
  }

  aplicarFiltros(): void {
    let resultado = [...this.registrosGratificacion];
    
    if (this.filtros.anio) {
      resultado = resultado.filter(r => r.anio === this.filtros.anio);
    }
    
    if (this.filtros.periodo !== 'Todos') {
      resultado = resultado.filter(r => r.periodo === this.filtros.periodo);
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
    
    resultado.sort((a, b) => new Date(b.fechaCalculo || 0).getTime() - new Date(a.fechaCalculo || 0).getTime());
    
    this.registrosFiltrados = resultado;
    this.paginaActual = 1;
  }

  limpiarFiltros(): void {
    this.filtros = {
      anio: new Date().getFullYear(),
      periodo: 'Todos',
      estado: 'Todos',
      area: 'Todas',
      busqueda: ''
    };
    this.aplicarFiltros();
  }

  // ==================== CALCULO GRATIFICACION ====================
  abrirCalculoMasivo(): void {
    // Validar que solo se pueda calcular en julio y diciembre
    const mesActual = new Date().getMonth() + 1;
    if (this.periodoCalculoMasivo !== 'Julio' && this.periodoCalculoMasivo !== 'Diciembre') {
      alert('Las gratificaciones solo se calculan en Julio y Diciembre');
      return;
    }
    
    this.modoCalculoMasivo = true;
    this.mostrarModalCalculo = true;
    this.cargarTrabajadoresDisponibles();
  }

  // Los descuentos se calculan en el backend

  confirmarCalculoMasivo(): void {
    if (this.trabajadoresSeleccionados.length === 0) {
      this.mostrarModalErrorCarga = true;
      this.mensajeErrorCarga = 'Seleccione al menos un trabajador';
      return;
    }

    // Validar período
    if (this.periodoCalculoMasivo !== 'Julio' && this.periodoCalculoMasivo !== 'Diciembre') {
      this.mostrarModalErrorCarga = true;
      this.mensajeErrorCarga = 'Las gratificaciones solo se calculan en Julio y Diciembre';
      return;
    }

    this.cargando = true;

    const trabajadorIds = this.trabajadoresSeleccionados.map(t => t.id);

    this.gratificacionesService.calcularMasivo({
      trabajadores: trabajadorIds,
      periodo: this.periodoCalculoMasivo,
      anio: this.anioCalculoMasivo
    }).subscribe({
      next: (response) => {
        if (response.success) {
          // Mostrar modal de resultado
          this.resultadoCalculoMasivo = {
            calculadas: response.data.calculadas,
            errores: response.data.errores,
            erroresDetalle: response.data.erroresDetalle || []
          };
          this.mostrarModalResultadoCalculo = true;
          
          if (response.data.calculadas > 0) {
            this.cargarRegistrosGratificacion();
          }
          
          this.mostrarModalCalculo = false;
          this.trabajadoresSeleccionados = [];
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al calcular gratificaciones:', error);
        this.mostrarModalErrorCarga = true;
        this.mensajeErrorCarga = error.error?.message || 'Error al calcular gratificaciones. Por favor, intente nuevamente.';
        this.cargando = false;
      }
    });
  }

  // El código se genera en el backend

  redondear(valor: number): number {
    return Math.round(valor * 100) / 100;
  }

  // ==================== ACCIONES ====================
  verDetalle(registro: RegistroGratificacion): void {
    // Cargar detalle completo desde el backend para obtener descuentos desglosados
    if (registro.id) {
      this.cargando = true;
      this.gratificacionesService.obtenerPorId(registro.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.registroSeleccionado = {
              ...registro,
              ...response.data,
              descuentos: response.data.descuentos || []
            };
            this.mostrarModalDetalle = true;
          }
          this.cargando = false;
        },
        error: (error) => {
          console.error('❌ Error al cargar detalle:', error);
          // Si falla, usar los datos que ya tenemos
          this.registroSeleccionado = registro;
          this.mostrarModalDetalle = true;
          this.cargando = false;
        }
      });
    } else {
      this.registroSeleccionado = registro;
      this.mostrarModalDetalle = true;
    }
  }

  aprobarRegistro(registro: RegistroGratificacion): void {
    if (confirm(`¿Aprobar la gratificacion de ${registro.trabajadorNombre}?`)) {
      if (!registro.id) {
        alert('Error: No se puede aprobar un registro sin ID');
        return;
      }

      this.gratificacionesService.aprobar(registro.id).subscribe({
        next: (response) => {
          if (response.success) {
            registro.estado = 'Aprobado';
            alert('Gratificación aprobada exitosamente');
          }
        },
        error: (error) => {
          console.error('❌ Error al aprobar gratificación:', error);
          alert('Error al aprobar gratificación');
        }
      });
    }
  }

  abrirPago(registro: RegistroGratificacion): void {
    this.registroSeleccionado = registro;
    this.mostrarModalPago = true;
  }

  confirmarPago(): void {
    if (this.registroSeleccionado) {
      if (!this.registroSeleccionado.id) {
        alert('Error: No se puede pagar un registro sin ID');
        return;
      }

      const numeroComprobante = `GRAT-${this.registroSeleccionado.periodo.substring(0,3).toUpperCase()}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

      this.pagando = true;
      this.pagoCompletado = false;
      this.mostrarModalExitoPago = true;
      this.mostrarModalPago = false; // Cerrar modal de pago

      this.gratificacionesService.pagar(this.registroSeleccionado.id, numeroComprobante).subscribe({
        next: (response) => {
          if (response.success) {
            // Mostrar spinner de carga
            this.cdr.detectChanges();
            
            // Después de un breve delay, mostrar el check de éxito
            setTimeout(() => {
              this.pagando = false;
              this.pagoCompletado = true;
              this.registroSeleccionado!.estado = 'Pagado';
              this.registroSeleccionado!.fechaPago = new Date();
              this.registroSeleccionado!.numeroComprobante = numeroComprobante;
              this.cdr.detectChanges();
              this.cdr.markForCheck();
              
              // Cerrar modal de éxito y recargar lista después de 2.5 segundos
              setTimeout(() => {
                this.cerrarModalExitoPago();
                this.cargarRegistrosGratificacion();
              }, 2500);
            }, 800);
          }
        },
        error: (error) => {
          console.error('❌ Error al confirmar pago:', error);
          this.pagando = false;
          this.cerrarModalExitoPago();
          alert('Error al confirmar pago');
        }
      });
    }
  }

  cerrarModalExitoPago(): void {
    this.mostrarModalExitoPago = false;
    this.pagando = false;
    this.pagoCompletado = false;
  }

  descargarBoleta(registro: RegistroGratificacion): void {
    console.log('Descargar boleta de gratificacion:', registro.codigo);
  }

  exportarExcel(): void {
    console.log('Exportar gratificaciones a Excel');
  }

  toggleSeleccionTrabajador(trabajador: any): void {
    const index = this.trabajadoresSeleccionados.findIndex(t => t.id === trabajador.id);
    if (index > -1) {
      this.trabajadoresSeleccionados.splice(index, 1);
    } else {
      this.trabajadoresSeleccionados.push(trabajador);
    }
  }

  estaTrabajadorSeleccionado(trabajador: any): boolean {
    return this.trabajadoresSeleccionados.some(t => t.id === trabajador.id);
  }

  // ==================== PAGINACION ====================
  get registrosPaginados(): RegistroGratificacion[] {
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
      'Borrador': 'badge--borrador',
      'Calculado': 'badge--calculado',
      'Aprobado': 'badge--aprobado',
      'Pagado': 'badge--pagado',
      'Observado': 'badge--observado'
    };
    return clases[estado] || '';
  }

  formatearFecha(fecha: Date | string | undefined): string {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-PE');
  }

  getPeriodoInfo(periodo: PeriodoGratificacion) {
    return MESES_GRATIFICACION.find(m => m.periodo === periodo);
  }

  cerrarModalErrorCarga(): void {
    this.mostrarModalErrorCarga = false;
    this.mensajeErrorCarga = '';
  }

  cerrarModalResultadoCalculo(): void {
    this.mostrarModalResultadoCalculo = false;
    this.resultadoCalculoMasivo = null;
  }

  // ==================== ELIMINAR GRATIFICACIÓN ====================
  abrirModalEliminar(registro: RegistroGratificacion): void {
    this.gratificacionAEliminar = registro;
    this.mostrarModalEliminar = true;
    this.confirmacionEliminar = '';
    this.mensajeError = '';
    this.eliminando = false;
    this.eliminacionCompletada = false;
    this.mensajeExito = '';
  }

  cerrarModalEliminar(): void {
    if (this.eliminando) return; // No permitir cerrar mientras se elimina
    
    this.mostrarModalEliminar = false;
    this.gratificacionAEliminar = null;
    this.confirmacionEliminar = '';
    this.mensajeError = '';
    this.eliminando = false;
    this.eliminacionCompletada = false;
    this.mensajeExito = '';
  }

  confirmarEliminacion(): void {
    if (!this.gratificacionAEliminar || !this.gratificacionAEliminar.id) {
      this.mensajeError = 'Error: No se puede eliminar un registro sin ID';
      return;
    }

    if (this.confirmacionEliminar.toUpperCase() !== 'ELIMINAR') {
      this.mensajeError = 'Debe escribir "ELIMINAR" para confirmar';
      return;
    }

    this.eliminando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    this.gratificacionesService.eliminar(this.gratificacionAEliminar.id).subscribe({
      next: (response) => {
        if (response.success) {
          // Mostrar spinner de carga
          this.cdr.detectChanges();
          
          // Después de un breve delay, mostrar el check de éxito
          setTimeout(() => {
            this.eliminando = false;
            this.eliminacionCompletada = true;
            this.mensajeExito = 'Gratificación eliminada exitosamente';
            this.cdr.detectChanges();
            this.cdr.markForCheck();
            
            // Cerrar modal y recargar lista después de 2.5 segundos
            setTimeout(() => {
              this.cerrarModalEliminar();
              this.cargarRegistrosGratificacion();
            }, 2500);
          }, 800);
        }
      },
      error: (error) => {
        console.error('❌ Error al eliminar gratificación:', error);
        this.eliminando = false;
        this.mensajeError = error.error?.message || 'Error al eliminar gratificación. Por favor, intente nuevamente.';
        this.cdr.detectChanges();
      }
    });
  }
}