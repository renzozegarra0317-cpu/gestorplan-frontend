import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DashboardService } from './dashboard.service';

interface Filtros {
  fechaInicio: string;
  fechaFin: string;
  area: string;
  tipoContrato: string;
  estado: string;
}

interface KPI {
  titulo: string;
  valor: string | number;
  icono: string;
  tendencia: 'up' | 'down' | 'neutral';
  porcentaje: number;
  color: string;
}

interface MovimientoPlanilla {
  id: string;
  tipo: string;
  descripcion: string;
  fecha: Date;
  monto?: number;
  estado: 'completado' | 'pendiente' | 'proceso';
}

interface TrabajadorTop {
  id: string;
  nombre: string;
  cargo: string;
  area: string;
  salario: number;
  foto: string;
}

interface EventoCalendario {
  id: string;
  titulo: string;
  fecha: Date;
  tipo: 'planilla' | 'beneficio' | 'vencimiento' | 'reunion';
  descripcion: string;
}

interface Alerta {
  id: string;
  tipo: 'warning' | 'error' | 'info' | 'success';
  titulo: string;
  mensaje: string;
  fecha: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DashboardService],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Filtros
  filtros: Filtros = {
    fechaInicio: this.obtenerPrimerDiaMes(),
    fechaFin: this.obtenerUltimoDiaMes(),
    area: 'todas',
    tipoContrato: 'todos',
    estado: 'todos'
  };

  // Catálogos
  areas: string[] = ['Todas', 'Gerencia Municipal', 'RRHH', 'Administración', 'Finanzas', 'Obras', 'Servicios'];
  tiposContrato: string[] = ['Todos', 'Nombrado', 'CAS', 'Locador', 'Practicante'];
  estados: string[] = ['Todos', 'Activo', 'Inactivo', 'Suspendido', 'Vacaciones'];

  // Control de visibilidad de filtros
  mostrarFiltrosPanel: boolean = false;

  // KPIs principales
  kpis: KPI[] = [
    { titulo: 'Total Trabajadores', valor: 500, icono: '👥', tendencia: 'up', porcentaje: 5.2, color: '#3b82f6' },
    { titulo: 'Planilla Actual', valor: 'S/. 1,250,000', icono: '💰', tendencia: 'up', porcentaje: 3.1, color: '#22c55e' },
    { titulo: 'Contratos CAS', valor: 18, icono: '📄', tendencia: 'down', porcentaje: 2.1, color: '#f59e0b' },
    { titulo: 'Vacaciones Pendientes', valor: 35, icono: '🏖️', tendencia: 'neutral', porcentaje: 0, color: '#ef4444' },
    { titulo: 'Asistencia Hoy', valor: '95%', icono: '📅', tendencia: 'up', porcentaje: 2.5, color: '#8b5cf6' },
    { titulo: 'Tardanzas Mes', valor: 23, icono: '⏰', tendencia: 'down', porcentaje: 12.3, color: '#ec4899' },
    { titulo: 'CTS Depositado', valor: 'S/. 450,000', icono: '🏦', tendencia: 'up', porcentaje: 100, color: '#14b8a6' },
    { titulo: 'Nuevos Ingresos', valor: 12, icono: '✨', tendencia: 'up', porcentaje: 20, color: '#06b6d4' },
  ];

  // Datos para gráficos
  datosPlanillaMensual = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'],
    valores: [1200000, 1180000, 1250000, 1230000, 1280000, 1260000, 1290000, 1250000]
  };

  datosDistribucionArea = {
    labels: ['GM', 'RRHH', 'Admin', 'Finanzas', 'Obras', 'Servicios'],
    valores: [50, 30, 80, 45, 150, 145]
  };

  datosContratos = {
    labels: ['Nombrado', 'CAS', 'Locador', 'Practicante'],
    valores: [250, 150, 80, 20]
  };

  datosAsistenciaSemanal = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
    valores: [98, 95, 97, 94, 96]
  };

  // Movimientos recientes
  movimientos: MovimientoPlanilla[] = [
    {
      id: '1',
      tipo: 'Pago de planilla mensual',
      descripcion: 'Planilla de agosto 2025',
      fecha: new Date('2025-08-31'),
      monto: 1250000,
      estado: 'completado'
    },
    {
      id: '2',
      tipo: 'Depósito CTS',
      descripcion: 'CTS semestre mayo-octubre',
      fecha: new Date('2025-05-15'),
      monto: 450000,
      estado: 'completado'
    },
    {
      id: '3',
      tipo: 'Gratificación',
      descripcion: 'Gratificación julio 2025',
      fecha: new Date('2025-07-15'),
      monto: 850000,
      estado: 'proceso'
    }
  ];

  // Top trabajadores
  topTrabajadores: TrabajadorTop[] = [
    { id: '1', nombre: 'Juan Pérez García', cargo: 'Gerente Municipal', area: 'Gerencia', salario: 12000, foto: '👨‍💼' },
    { id: '2', nombre: 'María López Torres', cargo: 'Gerente RRHH', area: 'RRHH', salario: 9500, foto: '👩‍💼' },
    { id: '3', nombre: 'Carlos Ramírez Silva', cargo: 'Gerente Finanzas', area: 'Finanzas', salario: 9000, foto: '👨‍💻' },
    { id: '4', nombre: 'Ana Martínez Ruiz', cargo: 'Jefa de Obras', area: 'Obras', salario: 8500, foto: '👷‍♀️' },
    { id: '5', nombre: 'Pedro González Díaz', cargo: 'Contador General', area: 'Finanzas', salario: 8000, foto: '🧑‍💼' },
  ];

  // Eventos próximos
  eventosProximos: EventoCalendario[] = [];

  // Alertas
  alertas: Alerta[] = [
    {
      id: '1',
      tipo: 'warning',
      titulo: '18 Contratos CAS por vencer',
      mensaje: 'Renovar antes del 15 de octubre',
      fecha: new Date()
    },
    {
      id: '2',
      tipo: 'error',
      titulo: '35 Vacaciones pendientes',
      mensaje: 'Trabajadores sin tomar vacaciones del año anterior',
      fecha: new Date()
    },
    {
      id: '3',
      tipo: 'info',
      titulo: 'Actualización PLAME',
      mensaje: 'Nueva versión de PLAME disponible',
      fecha: new Date()
    },
    {
      id: '4',
      tipo: 'success',
      titulo: 'Planilla procesada',
      mensaje: 'Planilla de agosto procesada exitosamente',
      fecha: new Date()
    }
  ];

  // Estado
  cargando: boolean = false;
  mesActual: string = 'Octubre 2025';
  
  // Modal de detalle KPI
  mostrarModalDetalleKPI: boolean = false;
  detalleKPISeleccionado: any = null;
  detalleAsistenciaHoy: any = null;
  cargandoDetalleAsistencia: boolean = false;

  // Modal de calendario completo
  mostrarCalendarioCompleto: boolean = false;
  mesCalendario: Date = new Date();

  // Suscripción a eventos del router
  private routerSubscription?: Subscription;
  private configCheckInterval?: any;

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
    
    // Escuchar eventos de actualización de asistencia
    window.addEventListener('asistencia-actualizada', () => {
      console.log('📢 Evento de asistencia actualizada recibido, recargando dashboard...');
      this.cargarDatos();
    });
    
    // Escuchar eventos cuando se elimina un trabajador
    window.addEventListener('trabajador-eliminado', () => {
      console.log('📢 Evento de trabajador eliminado recibido, recargando dashboard...');
      // Forzar recarga completa sin caché
      setTimeout(() => {
        this.cargarDatos();
      }, 100);
    });
    
    // Escuchar eventos cuando se crea un trabajador
    window.addEventListener('trabajador-creado', () => {
      console.log('📢 Evento de trabajador creado recibido, recargando dashboard...');
      // Forzar recarga completa sin caché
      setTimeout(() => {
        this.cargarDatos();
      }, 100);
    });
    
    // Escuchar mensajes desde iframes o ventanas hijas
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'asistencia-actualizada') {
        console.log('📢 Mensaje de asistencia actualizada recibido, recargando dashboard...');
        this.cargarDatos();
      }
      if (event.data && event.data.type === 'trabajador-eliminado') {
        console.log('📢 Mensaje de trabajador eliminado recibido, recargando dashboard...');
        this.cargarDatos();
      }
    });
    
    // Escuchar cambios de ruta para recargar cuando se vuelve al dashboard
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url === '/dashboard' || event.urlAfterRedirects === '/dashboard') {
          console.log('🔄 Navegación al dashboard detectada, recargando configuración...');
          this.cargarConfiguracionYEventos();
        }
      });
    
    // Verificar cambios en la configuración cada 2 segundos
    this.configCheckInterval = setInterval(() => {
      this.verificarCambiosConfiguracion();
    }, 2000);
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.configCheckInterval) {
      clearInterval(this.configCheckInterval);
    }
  }

  verificarCambiosConfiguracion(): void {
    const ultimaActualizacion = localStorage.getItem('configuracionUltimaActualizacion');
    const ultimaVerificacion = localStorage.getItem('dashboardUltimaVerificacion');
    
    // Si hay una actualización más reciente que nuestra última verificación, recargar
    if (ultimaActualizacion && ultimaVerificacion) {
      const fechaActualizacion = new Date(ultimaActualizacion).getTime();
      const fechaVerificacion = new Date(ultimaVerificacion).getTime();
      
      if (fechaActualizacion > fechaVerificacion) {
        console.log('🔄 Cambios en configuración detectados, recargando eventos...');
        this.cargarConfiguracionYEventos();
        localStorage.setItem('dashboardUltimaVerificacion', new Date().toISOString());
        
        // Si el calendario está abierto, forzar actualización
        if (this.mostrarCalendarioCompleto) {
          this.cdr.detectChanges();
        }
      }
    } else if (ultimaActualizacion) {
      // Primera vez que verificamos, guardar la fecha
      localStorage.setItem('dashboardUltimaVerificacion', new Date().toISOString());
    }
  }

  // ==================== MÉTODOS DE CARGA ====================
  cargarDatos(): void {
    this.cargando = true;
    console.log('🔄 Cargando datos del dashboard...', this.filtros);
    
    this.dashboardService.obtenerDashboardCompleto(this.filtros).subscribe({
      next: (response) => {
        console.log('✅ Respuesta recibida:', response);
        if (response.success) {
          console.log('📊 Datos a actualizar:', response.data);
          this.actualizarDatos(response.data);
          this.cdr.detectChanges(); // Forzar detección de cambios
          console.log('🔄 Cambios detectados y vista actualizada');
        } else {
          console.warn('⚠️ Respuesta sin éxito:', response);
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar dashboard:', error);
        console.error('❌ Detalles del error:', error.message, error.status);
        this.cargando = false;
        alert(`Error al cargar los datos del dashboard: ${error.message || 'Error desconocido'}`);
      }
    });
    
    // Recargar también la configuración y eventos cuando se actualiza manualmente
    this.cargarConfiguracionYEventos();
  }

  private actualizarDatos(data: any): void {
    console.log('🔧 Actualizando datos del dashboard...', data);
    
    // Actualizar KPIs
    if (data.kpis) {
      console.log('📈 KPIs recibidos:', data.kpis);
      console.log('📊 Asistencia Hoy recibida:', data.kpis.asistenciaHoy);
      
      // Crear nuevo array de KPIs
      const nuevosKpis: KPI[] = [
        { 
          titulo: 'Total Trabajadores', 
          valor: data.kpis.totalTrabajadores, 
          icono: '👥', 
          tendencia: 'up' as 'up', 
          porcentaje: 5.2, 
          color: '#3b82f6' 
        },
        { 
          titulo: 'Planilla Actual', 
          valor: this.formatearMoneda(data.kpis.planillaActual), 
          icono: '💰', 
          tendencia: 'up' as 'up', 
          porcentaje: 3.1, 
          color: '#22c55e' 
        },
        { 
          titulo: 'Contratos CAS', 
          valor: data.kpis.contratosCASPorVencer, 
          icono: '📄', 
          tendencia: (data.kpis.contratosCASPorVencer > 0 ? 'down' : 'neutral') as 'down' | 'neutral', 
          porcentaje: 2.1, 
          color: '#f59e0b' 
        },
        { 
          titulo: 'Vacaciones Pendientes', 
          valor: data.kpis.vacacionesPendientes, 
          icono: '🏖️', 
          tendencia: 'neutral' as 'neutral', 
          porcentaje: 0, 
          color: '#ef4444' 
        },
        { 
          titulo: 'Asistencia Hoy', 
          valor: data.kpis.asistenciaHoy, 
          icono: '📅', 
          tendencia: 'up' as 'up', 
          porcentaje: 2.5, 
          color: '#8b5cf6' 
        },
        { 
          titulo: 'Tardanzas Mes', 
          valor: data.kpis.tardanzasMes, 
          icono: '⏰', 
          tendencia: 'down' as 'down', 
          porcentaje: 12.3, 
          color: '#ec4899' 
        },
        { 
          titulo: 'CTS Depositado', 
          valor: this.formatearMoneda(data.kpis.ctsDepositado), 
          icono: '🏦', 
          tendencia: 'up' as 'up', 
          porcentaje: 100, 
          color: '#14b8a6' 
        },
        { 
          titulo: 'Nuevos Ingresos', 
          valor: data.kpis.nuevosIngresos, 
          icono: '✨', 
          tendencia: 'up' as 'up', 
          porcentaje: 20, 
          color: '#06b6d4' 
        }
      ];
      
      // ASIGNAR el nuevo array
      this.kpis = nuevosKpis;
      console.log('✅ KPIs actualizados:', this.kpis);
      console.log('🔍 VERIFICAR VALORES:');
      this.kpis.forEach((kpi, index) => {
        console.log(`  [${index}] ${kpi.titulo}: ${kpi.valor} (tipo: ${typeof kpi.valor})`);
      });
    }

    // Actualizar gráficos
    if (data.evolucionPlanilla) {
      this.datosPlanillaMensual = data.evolucionPlanilla;
    }
    
    if (data.distribucionArea) {
      this.datosDistribucionArea = data.distribucionArea;
    }
    
    if (data.distribucionContratos) {
      this.datosContratos = data.distribucionContratos;
    }
    
    if (data.asistenciaSemanal) {
      this.datosAsistenciaSemanal = data.asistenciaSemanal;
    }

    // Actualizar movimientos
    if (data.movimientos) {
      this.movimientos = data.movimientos;
    }

    // Actualizar top trabajadores
    if (data.topTrabajadores) {
      this.topTrabajadores = data.topTrabajadores;
    }

    // Actualizar alertas
    if (data.alertas) {
      this.alertas = data.alertas;
    }
  }

  aplicarFiltros(): void {
    console.log('Aplicando filtros:', this.filtros);
    this.cargarDatos();
  }

  toggleFiltrosPanel(): void {
    this.mostrarFiltrosPanel = !this.mostrarFiltrosPanel;
  }

  limpiarFiltros(): void {
    this.filtros = {
      fechaInicio: this.obtenerPrimerDiaMes(),
      fechaFin: this.obtenerUltimoDiaMes(),
      area: 'todas',
      tipoContrato: 'todos',
      estado: 'todos'
    };
    this.cargarDatos();
  }

  // ==================== MÉTODOS DE UTILIDAD ====================
  obtenerPrimerDiaMes(): string {
    const fecha = new Date();
    return new Date(fecha.getFullYear(), fecha.getMonth(), 1).toISOString().split('T')[0];
  }

  obtenerUltimoDiaMes(): string {
    const fecha = new Date();
    return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).toISOString().split('T')[0];
  }

  formatearMoneda(valor: number): string {
    if (valor === null || valor === undefined || isNaN(valor)) {
      console.warn('⚠️ Valor inválido para formatear:', valor);
      return 'S/. 0.00';
    }
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(valor);
  }

  formatearFecha(fecha: Date): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(fecha));
  }

  diasHasta(fecha: Date): number {
    const hoy = new Date();
    const objetivo = new Date(fecha);
    const diferencia = objetivo.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  obtenerTextoDias(evento: any): string {
    const dias = this.diasHasta(evento.fecha);
    
    // Si es una reunión de evaluación y la fecha ya pasó, mostrar mensaje especial
    if (evento.tipo === 'reunion' && dias < 0) {
      return 'Sin reuniones asignadas';
    }
    
    // Para otros eventos, mostrar los días normalmente
    if (dias < 0) {
      return `Hace ${Math.abs(dias)} días`;
    } else if (dias === 0) {
      return 'Hoy';
    } else {
      return `Faltan ${dias} días`;
    }
  }

  obtenerColor(index: number): string {
    const colores = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    return colores[index % colores.length];
  }

  obtenerMes(fecha: Date): string {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return meses[new Date(fecha).getMonth()];
  }

  obtenerIconoTipo(tipo: string): string {
    const iconos: any = {
      'planilla': '💰',
      'beneficio': '🎁',
      'vencimiento': '⏰',
      'reunion': '👥'
    };
    return iconos[tipo] || '📋';
  }

  obtenerClaseEstado(estado: string): string {
    const clases: any = {
      'completado': 'success',
      'pendiente': 'warning',
      'proceso': 'info'
    };
    return clases[estado] || 'default';
  }

  // ==================== NAVEGACIÓN ====================
  navegar(ruta: string): void {
    this.router.navigate([ruta]);
  }

  mostrarDetalleKPI(titulo: string): void {
    // Obtener el valor real del KPI de "Total Trabajadores"
    const kpiTotalTrabajadores = this.kpis.find(k => k.titulo === 'Total Trabajadores');
    const totalTrabajadores = kpiTotalTrabajadores ? kpiTotalTrabajadores.valor : 0;
    
    const mensajesDetalle: any = {
      'Total Trabajadores': {
        titulo: 'Total de Trabajadores',
        mensaje: `Tienes ${totalTrabajadores} trabajador${totalTrabajadores !== 1 ? 'es' : ''} activo${totalTrabajadores !== 1 ? 's' : ''} en el sistema.`,
        accion: 'Ver lista completa de trabajadores',
        ruta: '/trabajadores'
      },
      'Planilla Actual': {
        titulo: 'Planilla Actual',
        mensaje: 'El total de la planilla actual es S/. 1,908.74',
        accion: 'Ver detalle de planilla',
        ruta: '/planillas'
      },
      'Contratos CAS': {
        titulo: 'Contratos CAS por Vencer',
        mensaje: 'No hay contratos CAS próximos a vencer.',
        accion: 'Ver contratos',
        ruta: '/trabajadores'
      },
      'Vacaciones Pendientes': {
        titulo: 'Vacaciones Pendientes',
        mensaje: 'Hay 4 trabajadores con vacaciones pendientes.',
        accion: 'Gestionar vacaciones',
        ruta: '/beneficios/vacaciones'
      },
      'Asistencia Hoy': {
        titulo: 'Asistencia de Hoy',
        mensaje: 'Cargando detalle...',
        accion: 'Ver registro de asistencia',
        ruta: '/asistencias/registro',
        esAsistenciaHoy: true
      },
      'Tardanzas Mes': {
        titulo: 'Tardanzas del Mes',
        mensaje: 'No hay tardanzas registradas este mes.',
        accion: 'Ver reporte de tardanzas',
        ruta: '/asistencias/tardanzas'
      },
      'CTS Depositado': {
        titulo: 'CTS Depositado',
        mensaje: 'Total depositado: S/. 0.00',
        accion: 'Ver detalles de CTS',
        ruta: '/beneficios/cts'
      },
      'Nuevos Ingresos': {
        titulo: 'Nuevos Ingresos',
        mensaje: 'No hay nuevos ingresos este mes.',
        accion: 'Ver historial de ingresos',
        ruta: '/trabajadores'
      }
    };

    this.detalleKPISeleccionado = mensajesDetalle[titulo] || {
      titulo: titulo,
      mensaje: 'Información no disponible',
      accion: 'Cerrar',
      ruta: null
    };

    // Si es "Asistencia Hoy", cargar el detalle completo
    if (this.detalleKPISeleccionado.esAsistenciaHoy) {
      this.cargarDetalleAsistenciaHoy();
    }

    this.mostrarModalDetalleKPI = true;
  }

  cargarDetalleAsistenciaHoy(): void {
    this.cargandoDetalleAsistencia = true;
    this.detalleAsistenciaHoy = null;
    
    console.log('🔄 Cargando detalle de asistencia de hoy...');
    
    this.dashboardService.obtenerDetalleAsistenciaHoy().subscribe({
      next: (response) => {
        console.log('📥 Respuesta recibida:', response);
        if (response.success && response.data) {
          this.detalleAsistenciaHoy = response.data;
          console.log('✅ Detalle de asistencia cargado:', this.detalleAsistenciaHoy);
          console.log('📊 Trabajadores:', this.detalleAsistenciaHoy.trabajadores?.length || 0);
        } else {
          console.error('❌ Error al cargar detalle:', response.message);
          this.detalleAsistenciaHoy = null;
        }
        this.cargandoDetalleAsistencia = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error al cargar detalle de asistencia:', error);
        console.error('❌ Detalles del error:', error.status, error.message);
        this.detalleAsistenciaHoy = null;
        this.cargandoDetalleAsistencia = false;
        this.cdr.detectChanges();
      }
    });
  }

  cerrarModalDetalleKPI(): void {
    this.mostrarModalDetalleKPI = false;
    this.detalleKPISeleccionado = null;
    this.detalleAsistenciaHoy = null;
  }

  irARuta(): void {
    if (this.detalleKPISeleccionado?.ruta) {
      this.router.navigate([this.detalleKPISeleccionado.ruta]);
      this.cerrarModalDetalleKPI();
    }
  }

  exportarDatos(): void {
    alert('📊 Exportando datos del dashboard...');
    console.log('Exportando datos:', {
      filtros: this.filtros,
      kpis: this.kpis,
      movimientos: this.movimientos
    });
  }

  verDetalle(tipo: string, id?: string): void {
    console.log('Ver detalle:', tipo, id);
    
    switch(tipo) {
      case 'kpi':
        this.mostrarDetalleKPI(id || '');
        break;
      case 'movimiento':
        alert(`Ver detalle del movimiento: ${id}`);
        break;
      case 'trabajador':
        this.navegar(`/trabajadores/${id}`);
        break;
      default:
        console.log('Tipo no reconocido');
    }
  }

  // ==================== CONFIGURACIÓN Y EVENTOS ====================
  cargarConfiguracionYEventos(): void {
    this.dashboardService.obtenerConfiguracion().subscribe({
      next: (response) => {
        console.log('📊 Respuesta completa del backend:', response);
        if (response.success && response.data) {
          console.log('📊 Datos de configuración recibidos:', response.data);
          const eventos: EventoCalendario[] = [];
          
          // Evento de planilla
          if (response.data.PLANILLAS) {
            const configPlanillas = response.data.PLANILLAS;
            const diaCierre = configPlanillas.diaCierrePlanilla || 25;
            const diaPago = configPlanillas.diaPagoPlanilla || 30;
            
            const fechaCierre = this.calcularFechaMesActual(diaCierre);
            const fechaPago = this.calcularFechaMesActual(diaPago);
            const nombreMes = this.obtenerNombreMes(new Date());
            
            eventos.push({
              id: '1',
              titulo: `Pago de planilla ${nombreMes.toLowerCase()}`,
              fecha: fechaPago,
              tipo: 'planilla',
              descripcion: `Cierre: ${this.formatearFecha(fechaCierre)} | Pago: ${this.formatearFecha(fechaPago)}`
            });
          }
          
          // Evento de CTS (solo el próximo que viene)
          // El backend devuelve las claves directamente en BENEFICIOS
          const configBeneficios = response.data.BENEFICIOS || {};
          const diaMayo = configBeneficios.diaDepositoCTSMayo || configBeneficios.fechaDepositoMayo || 15;
          const diaNoviembre = configBeneficios.diaDepositoCTSNoviembre || configBeneficios.fechaDepositoNoviembre || 15;
          
          const ahora = new Date();
          const añoActual = ahora.getFullYear();
          const mesActual = ahora.getMonth(); // 0-11
          const diaActual = ahora.getDate();
          
          // Determinar cuál es el próximo depósito de CTS
          const fechaCTSMayo = this.calcularFechaEspecifica(añoActual, 4, diaMayo); // Mayo = mes 4 (0-indexed)
          const fechaCTSNoviembre = this.calcularFechaEspecifica(añoActual, 10, diaNoviembre); // Noviembre = mes 10
          
          let proximoCTS: EventoCalendario | null = null;
          
          // Si estamos antes de mayo, el próximo es mayo de este año
          if (mesActual < 4 || (mesActual === 4 && diaActual <= diaMayo)) {
            proximoCTS = {
              id: '3',
              titulo: 'Depósito CTS mayo',
              fecha: fechaCTSMayo,
              tipo: 'beneficio',
              descripcion: `Depósito semestral de CTS - Mayo`
            };
          }
          // Si ya pasó mayo pero estamos antes de noviembre, el próximo es noviembre de este año
          else if (mesActual < 10 || (mesActual === 10 && diaActual <= diaNoviembre)) {
            proximoCTS = {
              id: '3',
              titulo: 'Depósito CTS noviembre',
              fecha: fechaCTSNoviembre,
              tipo: 'beneficio',
              descripcion: `Depósito semestral de CTS - Noviembre`
            };
          }
          // Si ya pasó noviembre, el próximo es mayo del próximo año
          else {
            proximoCTS = {
              id: '3',
              titulo: 'Depósito CTS mayo',
              fecha: this.calcularFechaEspecifica(añoActual + 1, 4, diaMayo),
              tipo: 'beneficio',
              descripcion: `Depósito semestral de CTS - Mayo`
            };
          }
          
          if (proximoCTS) {
            eventos.push(proximoCTS);
          }
          
          // Otros eventos predeterminados
          eventos.push({
            id: '2',
            titulo: 'Vencimiento contratos CAS',
            fecha: new Date('2025-10-15'),
            tipo: 'vencimiento',
            descripcion: '18 contratos CAS por vencer'
          });
          
          // Evento de reunión de evaluación (desde configuración RRHH)
          if (response.data.RRHH?.fechaReunionEvaluacion) {
            // El backend devuelve la fecha como string en formato YYYY-MM-DD
            const fechaString = response.data.RRHH.fechaReunionEvaluacion;
            console.log('📅 Fecha de reunión de evaluación desde backend (string):', fechaString);
            
            // Crear la fecha correctamente (agregar hora para evitar problemas de zona horaria)
            const fechaReunion = new Date(fechaString + 'T00:00:00');
            
            if (!isNaN(fechaReunion.getTime())) {
              console.log('📅 Fecha de reunión de evaluación parseada:', fechaReunion);
              eventos.push({
                id: '4',
                titulo: 'Reunión de evaluación',
                fecha: fechaReunion,
                tipo: 'reunion',
                descripcion: 'Evaluación de desempeño semestral'
              });
            } else {
              console.warn('⚠️ Fecha de reunión de evaluación inválida:', fechaString);
              // Si la fecha es inválida, usar fecha por defecto
              eventos.push({
                id: '4',
                titulo: 'Reunión de evaluación',
                fecha: new Date('2025-09-20'),
                tipo: 'reunion',
                descripcion: 'Evaluación de desempeño semestral'
              });
            }
          } else {
            console.log('📅 No hay fecha de reunión de evaluación en backend, usando fecha por defecto');
            console.log('📅 Datos de RRHH recibidos:', response.data.RRHH);
            // Si no hay configuración, usar fecha por defecto
            eventos.push({
              id: '4',
              titulo: 'Reunión de evaluación',
              fecha: new Date('2025-09-20'),
              tipo: 'reunion',
              descripcion: 'Evaluación de desempeño semestral'
            });
          }
          
          // Ordenar eventos por fecha
          eventos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
          
          this.eventosProximos = eventos;
          
          // Guardar configuración de CTS y Planillas en el componente para el calendario
          if (configBeneficios.diaDepositoCTSMayo || configBeneficios.fechaDepositoMayo) {
            this.actualizarConfiguracionLocalCTS(
              configBeneficios.diaDepositoCTSMayo || configBeneficios.fechaDepositoMayo,
              configBeneficios.diaDepositoCTSNoviembre || configBeneficios.fechaDepositoNoviembre
            );
          }
          
          // Guardar configuración de planillas para el calendario
          if (response.data.PLANILLAS) {
            const configPlanillas = response.data.PLANILLAS;
            this.actualizarConfiguracionLocalPlanillas(
              configPlanillas.diaCierrePlanilla || 25,
              configPlanillas.diaPagoPlanilla || 30
            );
          }
          
          // Guardar configuración de RRHH (fecha de reunión de evaluación) para el calendario
          if (response.data.RRHH?.fechaReunionEvaluacion) {
            this.actualizarConfiguracionLocalRRHH(response.data.RRHH.fechaReunionEvaluacion);
          }
          
          this.cdr.detectChanges();
          console.log('✅ Eventos actualizados con configuración:', this.eventosProximos);
        } else {
          // Si no hay configuración, usar valores por defecto
          this.inicializarEventosPorDefecto();
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar configuración:', error);
        // Usar valores por defecto si falla
        this.inicializarEventosPorDefecto();
      }
    });
  }

  calcularFechaEspecifica(año: number, mes: number, dia: number): Date {
    // mes es 0-indexed (0 = enero, 4 = mayo, 10 = noviembre)
    const ultimoDia = new Date(año, mes + 1, 0).getDate();
    const diaFinal = Math.min(dia, ultimoDia);
    return new Date(año, mes, diaFinal);
  }

  calcularFechaMesActual(dia: number): Date {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = ahora.getMonth(); // 0-11
    
    // Obtener el último día del mes
    const ultimoDia = new Date(año, mes + 1, 0).getDate();
    
    // Si el día configurado es mayor al último día del mes, usar el último día
    const diaFinal = Math.min(dia, ultimoDia);
    
    return new Date(año, mes, diaFinal);
  }

  obtenerNombreMes(fecha: Date): string {
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return meses[fecha.getMonth()];
  }

  inicializarEventosPorDefecto(): void {
    const ahora = new Date();
    const nombreMes = this.obtenerNombreMes(ahora);
    const fechaPago = this.calcularFechaMesActual(30);
    const fechaCierre = this.calcularFechaMesActual(25);
    const añoActual = ahora.getFullYear();
    const mesActual = ahora.getMonth();
    
    const eventos: EventoCalendario[] = [
      {
        id: '1',
        titulo: `Pago de planilla ${nombreMes.toLowerCase()}`,
        fecha: fechaPago,
        tipo: 'planilla',
        descripcion: `Cierre: ${this.formatearFecha(fechaCierre)} | Pago: ${this.formatearFecha(fechaPago)}`
      }
    ];
    
    // Evento de CTS (solo el próximo que viene) con valores por defecto
    const diaMayo = 15;
    const diaNoviembre = 15;
    const diaActual = ahora.getDate();
    
    const fechaCTSMayo = this.calcularFechaEspecifica(añoActual, 4, diaMayo);
    const fechaCTSNoviembre = this.calcularFechaEspecifica(añoActual, 10, diaNoviembre);
    
    let proximoCTS: EventoCalendario | null = null;
    
    // Si estamos antes de mayo, el próximo es mayo de este año
    if (mesActual < 4 || (mesActual === 4 && diaActual <= diaMayo)) {
      proximoCTS = {
        id: '3',
        titulo: 'Depósito CTS mayo',
        fecha: fechaCTSMayo,
        tipo: 'beneficio',
        descripcion: 'Depósito semestral de CTS - Mayo'
      };
    }
    // Si ya pasó mayo pero estamos antes de noviembre, el próximo es noviembre de este año
    else if (mesActual < 10 || (mesActual === 10 && diaActual <= diaNoviembre)) {
      proximoCTS = {
        id: '3',
        titulo: 'Depósito CTS noviembre',
        fecha: fechaCTSNoviembre,
        tipo: 'beneficio',
        descripcion: 'Depósito semestral de CTS - Noviembre'
      };
    }
    // Si ya pasó noviembre, el próximo es mayo del próximo año
    else {
      proximoCTS = {
        id: '3',
        titulo: 'Depósito CTS mayo',
        fecha: this.calcularFechaEspecifica(añoActual + 1, 4, diaMayo),
        tipo: 'beneficio',
        descripcion: 'Depósito semestral de CTS - Mayo'
      };
    }
    
    if (proximoCTS) {
      eventos.push(proximoCTS);
    }
    
    // Otros eventos
    eventos.push({
      id: '2',
      titulo: 'Vencimiento contratos CAS',
      fecha: new Date('2025-10-15'),
      tipo: 'vencimiento',
      descripcion: '18 contratos CAS por vencer'
    });
    
    eventos.push({
      id: '4',
      titulo: 'Reunión de evaluación',
      fecha: new Date('2025-09-20'),
      tipo: 'reunion',
      descripcion: 'Evaluación de desempeño semestral'
    });
    
    // Ordenar por fecha
    eventos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
    
    this.eventosProximos = eventos;
    this.cdr.detectChanges();
  }

  // ==================== CALENDARIO COMPLETO ====================
  diasSemana: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  abrirCalendarioCompleto(): void {
    this.mostrarCalendarioCompleto = true;
    this.mesCalendario = new Date();
  }

  cerrarCalendarioCompleto(): void {
    this.mostrarCalendarioCompleto = false;
  }

  mesAnterior(): void {
    this.mesCalendario = new Date(this.mesCalendario.getFullYear(), this.mesCalendario.getMonth() - 1, 1);
    this.cdr.detectChanges(); // Forzar actualización del calendario
  }

  mesSiguiente(): void {
    this.mesCalendario = new Date(this.mesCalendario.getFullYear(), this.mesCalendario.getMonth() + 1, 1);
    this.cdr.detectChanges(); // Forzar actualización del calendario
  }

  irAHoy(): void {
    this.mesCalendario = new Date();
  }

  obtenerNombreMesCompleto(fecha: Date): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[fecha.getMonth()];
  }

  obtenerDiasCalendario(): any[] {
    const año = this.mesCalendario.getFullYear();
    const mes = this.mesCalendario.getMonth();
    
    // Primer día del mes
    const primerDia = new Date(año, mes, 1);
    const diaSemanaInicio = primerDia.getDay();
    
    // Último día del mes
    const ultimoDia = new Date(año, mes + 1, 0);
    const totalDias = ultimoDia.getDate();
    
    // Días del mes anterior
    const mesAnterior = new Date(año, mes, 0);
    const diasMesAnterior = mesAnterior.getDate();
    
    const dias: any[] = [];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // Días del mes anterior (para completar la primera semana)
    for (let i = diaSemanaInicio - 1; i >= 0; i--) {
      const dia = diasMesAnterior - i;
      const fecha = new Date(año, mes - 1, dia);
      fecha.setHours(0, 0, 0, 0);
      
      dias.push({
        numero: dia,
        fecha: fecha,
        esOtroMes: true,
        esHoy: false,
        eventos: this.obtenerEventosDelDia(fecha)
      });
    }
    
    // Días del mes actual
    for (let dia = 1; dia <= totalDias; dia++) {
      const fecha = new Date(año, mes, dia);
      fecha.setHours(0, 0, 0, 0);
      const esHoy = fecha.getTime() === hoy.getTime();
      
      dias.push({
        numero: dia,
        fecha: fecha,
        esOtroMes: false,
        esHoy: esHoy,
        eventos: this.obtenerEventosDelDia(fecha)
      });
    }
    
    // Días del mes siguiente (para completar la última semana)
    const diasRestantes = 42 - dias.length; // 6 semanas * 7 días
    for (let dia = 1; dia <= diasRestantes; dia++) {
      const fecha = new Date(año, mes + 1, dia);
      fecha.setHours(0, 0, 0, 0);
      
      dias.push({
        numero: dia,
        fecha: fecha,
        esOtroMes: true,
        esHoy: false,
        eventos: this.obtenerEventosDelDia(fecha)
      });
    }
    
    return dias;
  }

  obtenerEventosDelDia(fecha: Date): EventoCalendario[] {
    const eventosDelDia: EventoCalendario[] = [];
    
    // Eventos de la lista principal
    this.eventosProximos.forEach(evento => {
      const fechaEvento = new Date(evento.fecha);
      fechaEvento.setHours(0, 0, 0, 0);
      const fechaComparar = new Date(fecha);
      fechaComparar.setHours(0, 0, 0, 0);
      
      if (fechaEvento.getTime() === fechaComparar.getTime()) {
        eventosDelDia.push(evento);
      }
    });
    
    // Obtener configuración de planillas
    const diaCierre = this.obtenerDiaCierrePlanilla();
    const diaPago = this.obtenerDiaPagoPlanilla();
    
    // Obtener configuración de CTS
    const diaMayo = this.obtenerDiaCTSMayo();
    const diaNoviembre = this.obtenerDiaCTSNoviembre();
    
    const añoFecha = fecha.getFullYear();
    const mesFecha = fecha.getMonth();
    const diaFecha = fecha.getDate();
    
    // Verificar si es día de CIERRE de planilla (todos los meses)
    if (diaFecha === diaCierre) {
      const nombreMes = this.obtenerNombreMes(fecha);
      eventosDelDia.push({
        id: `cierre-planilla-${añoFecha}-${mesFecha}`,
        titulo: `Cierre de planilla ${nombreMes.toLowerCase()}`,
        fecha: new Date(añoFecha, mesFecha, diaCierre),
        tipo: 'planilla',
        descripcion: `Cierre de planilla del mes de ${nombreMes} ${añoFecha}`
      });
    }
    
    // Verificar si es día de PAGO de planilla (todos los meses)
    if (diaFecha === diaPago) {
      const nombreMes = this.obtenerNombreMes(fecha);
      eventosDelDia.push({
        id: `pago-planilla-${añoFecha}-${mesFecha}`,
        titulo: `Pago de planilla ${nombreMes.toLowerCase()}`,
        fecha: new Date(añoFecha, mesFecha, diaPago),
        tipo: 'planilla',
        descripcion: `Pago de planilla del mes de ${nombreMes} ${añoFecha}`
      });
    }
    
    // Verificar si es día de depósito CTS en Mayo (mes 4)
    if (mesFecha === 4 && diaFecha === diaMayo) {
      eventosDelDia.push({
        id: `cts-mayo-${añoFecha}`,
        titulo: 'Depósito CTS mayo',
        fecha: new Date(añoFecha, 4, diaMayo),
        tipo: 'beneficio',
        descripcion: `Depósito semestral de CTS - Mayo ${añoFecha}`
      });
    }
    
    // Verificar si es día de depósito CTS en Noviembre (mes 10)
    if (mesFecha === 10 && diaFecha === diaNoviembre) {
      eventosDelDia.push({
        id: `cts-noviembre-${añoFecha}`,
        titulo: 'Depósito CTS noviembre',
        fecha: new Date(añoFecha, 10, diaNoviembre),
        tipo: 'beneficio',
        descripcion: `Depósito semestral de CTS - Noviembre ${añoFecha}`
      });
    }
    
    return eventosDelDia;
  }

  obtenerDiaCierrePlanilla(): number {
    // Intentar obtener de localStorage primero (configuración guardada)
    const configLocal = localStorage.getItem('configuracionSistema');
    if (configLocal) {
      try {
        const config = JSON.parse(configLocal);
        if (config.planillas?.diaCierrePlanilla) {
          return config.planillas.diaCierrePlanilla;
        }
      } catch (e) {
        console.error('Error al parsear configuración local:', e);
      }
    }
    return 25; // Valor por defecto
  }

  obtenerDiaPagoPlanilla(): number {
    // Intentar obtener de localStorage primero (configuración guardada)
    const configLocal = localStorage.getItem('configuracionSistema');
    if (configLocal) {
      try {
        const config = JSON.parse(configLocal);
        if (config.planillas?.diaPagoPlanilla) {
          return config.planillas.diaPagoPlanilla;
        }
      } catch (e) {
        console.error('Error al parsear configuración local:', e);
      }
    }
    return 30; // Valor por defecto
  }

  obtenerDiaCTSMayo(): number {
    // Intentar obtener de localStorage primero (configuración guardada)
    const configLocal = localStorage.getItem('configuracionSistema');
    if (configLocal) {
      try {
        const config = JSON.parse(configLocal);
        if (config.beneficios?.cts?.fechaDepositoMayo) {
          return config.beneficios.cts.fechaDepositoMayo;
        }
      } catch (e) {
        console.error('Error al parsear configuración local:', e);
      }
    }
    return 15; // Valor por defecto
  }

  obtenerDiaCTSNoviembre(): number {
    // Intentar obtener de localStorage primero (configuración guardada)
    const configLocal = localStorage.getItem('configuracionSistema');
    if (configLocal) {
      try {
        const config = JSON.parse(configLocal);
        if (config.beneficios?.cts?.fechaDepositoNoviembre) {
          return config.beneficios.cts.fechaDepositoNoviembre;
        }
      } catch (e) {
        console.error('Error al parsear configuración local:', e);
      }
    }
    return 15; // Valor por defecto
  }

  actualizarConfiguracionLocalCTS(diaMayo: number, diaNoviembre: number): void {
    // Actualizar configuración local para que el calendario la use
    const configLocal = localStorage.getItem('configuracionSistema');
    if (configLocal) {
      try {
        const config = JSON.parse(configLocal);
        if (!config.beneficios) {
          config.beneficios = {};
        }
        if (!config.beneficios.cts) {
          config.beneficios.cts = {};
        }
        config.beneficios.cts.fechaDepositoMayo = diaMayo;
        config.beneficios.cts.fechaDepositoNoviembre = diaNoviembre;
        localStorage.setItem('configuracionSistema', JSON.stringify(config));
      } catch (e) {
        console.error('Error al actualizar configuración local:', e);
      }
    }
  }

  actualizarConfiguracionLocalPlanillas(diaCierre: number, diaPago: number): void {
    // Actualizar configuración local de planillas para que el calendario la use
    const configLocal = localStorage.getItem('configuracionSistema');
    if (configLocal) {
      try {
        const config = JSON.parse(configLocal);
        if (!config.planillas) {
          config.planillas = {};
        }
        config.planillas.diaCierrePlanilla = diaCierre;
        config.planillas.diaPagoPlanilla = diaPago;
        localStorage.setItem('configuracionSistema', JSON.stringify(config));
      } catch (e) {
        console.error('Error al actualizar configuración local de planillas:', e);
      }
    }
  }

  actualizarConfiguracionLocalRRHH(fechaReunionEvaluacion: string): void {
    // Actualizar configuración local de RRHH para que el calendario la use
    const configLocal = localStorage.getItem('configuracionSistema');
    if (configLocal) {
      try {
        const config = JSON.parse(configLocal);
        if (!config.rrhh) {
          config.rrhh = {};
        }
        config.rrhh.fechaReunionEvaluacion = fechaReunionEvaluacion;
        localStorage.setItem('configuracionSistema', JSON.stringify(config));
      } catch (e) {
        console.error('Error al actualizar configuración local de RRHH:', e);
      }
    }
  }
}