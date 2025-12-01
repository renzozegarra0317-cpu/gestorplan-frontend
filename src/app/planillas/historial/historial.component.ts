import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import * as XLSX from 'xlsx';
import { NotificacionesService } from '../../services/notificaciones.service';
import { environment } from '../../../environments/environment';
import { 
  PlanillaHistorial,
  FiltrosHistorial,
  ResumenHistorial,
  DetallePlanillaCompleto,
  AccionPlanilla,
  TIPOS_PLANILLA_HISTORIAL,
  ESTADOS_PLANILLA,
  MESES_HISTORIAL,
  ACCIONES_DISPONIBLES
} from './historial.interface';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss', './historial-detalle.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ]),
    trigger('shake', [
      transition(':enter', [
        animate('500ms', keyframes([
          style({ transform: 'translateX(0)', offset: 0 }),
          style({ transform: 'translateX(-10px)', offset: 0.1 }),
          style({ transform: 'translateX(10px)', offset: 0.2 }),
          style({ transform: 'translateX(-10px)', offset: 0.3 }),
          style({ transform: 'translateX(10px)', offset: 0.4 }),
          style({ transform: 'translateX(-10px)', offset: 0.5 }),
          style({ transform: 'translateX(10px)', offset: 0.6 }),
          style({ transform: 'translateX(-10px)', offset: 0.7 }),
          style({ transform: 'translateX(10px)', offset: 0.8 }),
          style({ transform: 'translateX(-5px)', offset: 0.9 }),
          style({ transform: 'translateX(0)', offset: 1 })
        ]))
      ])
    ])
  ]
})
export class HistorialComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('tablaScrollContainer', { static: false }) tablaScrollContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('tablaDetalle', { static: false }) tablaDetalle!: ElementRef<HTMLTableElement>;
  
  private scrollHandler: any = null;
  private resizeHandler: any = null;
  // APIs
  private apiPlanillas = `${environment.apiUrl}/planillas`;
  
  // Datos
  planillas: PlanillaHistorial[] = [];
  planillasFiltradas: PlanillaHistorial[] = [];
  resumen: ResumenHistorial | null = null;
  planillaSeleccionada: DetallePlanillaCompleto | null = null;
  
  // Filtros
  filtros: FiltrosHistorial = {
    anio: new Date().getFullYear(),
    mes: undefined,
    tipoPlanilla: 'Todas',
    estado: 'Todos',
    busqueda: '',
    fechaInicio: undefined,
    fechaFin: undefined
  };
  
  // Estado
  cargando: boolean = false;
  vistaActual: 'lista' | 'tarjetas' | 'estadisticas' = 'lista';
  mostrarModalDetalle: boolean = false;
  trabajadorExpandido: number | null = null; // Índice del trabajador expandido
  mostrarModalAnular: boolean = false;
  planillaAAnular: PlanillaHistorial | null = null;
  motivoAnulacion: string = '';
  anulando: boolean = false;
  mostrarModalExitoAnulacion: boolean = false;
  mostrarModalValidacionAnulacion: boolean = false;
  
  // 🗑️ Modal de eliminación definitiva
  mostrarModalEliminar: boolean = false;
  planillaAEliminar: PlanillaHistorial | null = null;
  confirmacionEliminar: string = '';
  eliminando: boolean = false;
  eliminacionCompletada: boolean = false;
  mensajeError: string = '';
  mensajeExito: string = '';
  
  // 🔍 Filtros para el detalle de planilla (Grid Moderno)
  busquedaTrabajador: string = '';
  regimenFiltro: string = 'Todos';
  vistaDetalle: 'compacta' | 'excel' = 'excel'; // Vista Excel por defecto
  
  // ✏️ Modal de edición de planilla
  mostrarModalEditar: boolean = false;
  planillaAEditar: PlanillaHistorial | null = null;
  trabajadoresEditables: any[] = [];
  guardandoCambios: boolean = false;
  busquedaEditar: string = '';
  regimenFiltroEditar: string = 'Todos';
  
  // Paginación
  paginaActual: number = 1;
  elementosPorPagina: number = 10;
  totalElementos: number = 0;
  
  // Constantes
  tiposPlanilla = TIPOS_PLANILLA_HISTORIAL;
  estadosPlanilla = ESTADOS_PLANILLA;
  mesesHistorial = MESES_HISTORIAL.filter(m => m.valor !== 0); // Excluir "Todos" (valor 0)
  anios: number[] = [];
  accionesDisponibles = ACCIONES_DISPONIBLES;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private notificacionesService: NotificacionesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.inicializarAnios();
    this.cargarHistorial();
    
    // Verificar si hay un planillaId en los query params para abrir el detalle automáticamente
    this.route.queryParams.subscribe(params => {
      if (params['planillaId']) {
        const planillaId = parseInt(params['planillaId'], 10);
        // Esperar a que se cargue el historial y luego abrir el detalle
        setTimeout(() => {
          const planilla = this.planillas.find(p => p.id === planillaId);
          if (planilla) {
            this.verDetalle(planilla);
            // Limpiar el query param después de abrir
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: {},
              replaceUrl: true
            });
          }
        }, 1000);
      }
    });
  }

  ngAfterViewInit(): void {
    // Inicializar sticky después de que la vista se cargue
    setTimeout(() => {
      this.inicializarStickyColumns();
      this.sincronizarAlturasFilas();
    }, 100);
  }

  ngOnDestroy(): void {
    // Limpiar listeners
    if (this.scrollHandler && this.tablaScrollContainer) {
      this.tablaScrollContainer.nativeElement?.removeEventListener('scroll', this.scrollHandler);
    }
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }

  private sincronizandoScroll: boolean = false;

  sincronizarScroll(event: Event): void {
    if (this.sincronizandoScroll) return;
    this.sincronizandoScroll = true;
    
    const scrollTarget = event.target as HTMLElement;
    if (!scrollTarget) {
      this.sincronizandoScroll = false;
      return;
    }
    
    const tablaFija = document.querySelector('.tabla-fija-izquierda') as HTMLElement;
    if (tablaFija) {
      tablaFija.scrollTop = scrollTarget.scrollTop;
    }
    
    requestAnimationFrame(() => {
      this.sincronizandoScroll = false;
    });
  }
  
  sincronizarScrollIzquierdo(event: Event): void {
    if (this.sincronizandoScroll) return;
    this.sincronizandoScroll = true;
    
    const scrollTarget = event.target as HTMLElement;
    if (!scrollTarget) {
      this.sincronizandoScroll = false;
      return;
    }
    
    const tablaDerecha = document.querySelector('.tabla-scroll-derecha') as HTMLElement;
    if (tablaDerecha) {
      tablaDerecha.scrollTop = scrollTarget.scrollTop;
    }
    
    requestAnimationFrame(() => {
      this.sincronizandoScroll = false;
    });
  }

  inicializarStickyColumns(): void {
    // Ya no se necesita - las columnas están en una tabla separada
  }

  sincronizarAlturasFilas(): void {
    // Sincronizar alturas de filas entre ambas tablas usando requestAnimationFrame para mejor rendimiento
    requestAnimationFrame(() => {
      const tablaFija = document.querySelector('.tabla--fija tbody') as HTMLTableSectionElement;
      const tablaDetalle = document.querySelector('.tabla--detalle tbody') as HTMLTableSectionElement;
      
      if (!tablaFija || !tablaDetalle) {
        return;
      }
      
      const filasFija = tablaFija.querySelectorAll('tr');
      const filasDetalle = tablaDetalle.querySelectorAll('tr');
      
      // Asegurar que tengan el mismo número de filas
      if (filasFija.length !== filasDetalle.length || filasFija.length === 0) {
        return;
      }
      
      // Sincronizar altura de cada fila
      filasFija.forEach((filaFija, index) => {
        const filaDetalle = filasDetalle[index] as HTMLTableRowElement;
        if (filaDetalle) {
          // Obtener la altura más grande entre las dos filas
          const rectFija = filaFija.getBoundingClientRect();
          const rectDetalle = filaDetalle.getBoundingClientRect();
          const alturaMaxima = Math.max(rectFija.height, rectDetalle.height, 60); // Mínimo 60px
          
          // Aplicar la altura máxima a ambas filas
          if (alturaMaxima > 0) {
            const filaFijaEl = filaFija as HTMLElement;
            filaFijaEl.style.height = `${alturaMaxima}px`;
            filaFijaEl.style.minHeight = `${alturaMaxima}px`;
            filaFijaEl.style.maxHeight = `${alturaMaxima}px`;
            
            filaDetalle.style.height = `${alturaMaxima}px`;
            filaDetalle.style.minHeight = `${alturaMaxima}px`;
            filaDetalle.style.maxHeight = `${alturaMaxima}px`;
            
            // También sincronizar las celdas
            const celdasFija = filaFija.querySelectorAll('td');
            const celdasDetalle = filaDetalle.querySelectorAll('td');
            
            celdasFija.forEach((celda) => {
              const celdaFija = celda as HTMLElement;
              celdaFija.style.height = `${alturaMaxima}px`;
              celdaFija.style.minHeight = `${alturaMaxima}px`;
              celdaFija.style.maxHeight = `${alturaMaxima}px`;
            });
            
            celdasDetalle.forEach((celda) => {
              const celdaDetalle = celda as HTMLElement;
              celdaDetalle.style.height = `${alturaMaxima}px`;
              celdaDetalle.style.minHeight = `${alturaMaxima}px`;
              celdaDetalle.style.maxHeight = `${alturaMaxima}px`;
            });
          }
        }
      });
    });
  }

  inicializarAnios(): void {
    const anioActual = new Date().getFullYear();
    for (let i = anioActual; i >= anioActual - 5; i--) {
      this.anios.push(i);
    }
  }

  cargarHistorial(): void {
    this.cargando = true;
    
    // Construir parámetros de consulta
    let params = '';
    const queryParams = [];
    
    if (this.filtros.anio) {
      queryParams.push(`año=${this.filtros.anio}`);
    }
    if (this.filtros.mes) {
      queryParams.push(`mes=${this.filtros.mes}`);
    }
    if (this.filtros.tipoPlanilla && this.filtros.tipoPlanilla !== 'Todas') {
      queryParams.push(`tipoPlanilla=${this.filtros.tipoPlanilla}`);
    }
    if (this.filtros.estado && this.filtros.estado !== 'Todos') {
      queryParams.push(`estado=${this.filtros.estado}`);
    }
    
    if (queryParams.length > 0) {
      params = '?' + queryParams.join('&');
    }
    
    console.log('🔍 Cargando historial desde API:', `${this.apiPlanillas}${params}`);
    
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.http.get<any>(`${this.apiPlanillas}${params}`, { headers }).subscribe({
      next: (response) => {
        console.log('✅ Respuesta del historial:', response);
        console.log('📊 Datos recibidos:', response.data);
        console.log('📈 Total de planillas:', response.data?.length);
        
        if (response.success && response.data) {
          // Convertir datos del backend al formato del frontend
          this.planillas = response.data.map((planilla: any) => ({
            id: planilla.PlanillaID,
            codigo: planilla.Codigo,
            periodo: planilla.Periodo,
            mes: planilla.Mes,
            anio: planilla.Año,
            tipoPlanilla: planilla.TipoPlanilla,
            estado: planilla.Estado,
            fechaGeneracion: new Date(planilla.FechaGeneracion),
            fechaAprobacion: planilla.FechaAprobacion ? new Date(planilla.FechaAprobacion) : null,
            fechaPago: planilla.Estado === 'Pagada' ? new Date(planilla.FechaAprobacion || planilla.FechaGeneracion) : null,
            fechaInicio: `${planilla.Año}-${planilla.Mes.toString().padStart(2, '0')}-01`,
            fechaFin: `${planilla.Año}-${planilla.Mes.toString().padStart(2, '0')}-${new Date(planilla.Año, planilla.Mes, 0).getDate()}`,
            totalTrabajadores: planilla.NumeroTrabajadores,
            totalIngresos: planilla.TotalIngresos,
            totalDescuentos: planilla.TotalDescuentos,
            totalAportes: planilla.TotalAportes,
            totalNeto: planilla.NetoPagar,
            generadoPor: planilla.UsuarioCreacion,
            aprobadoPor: planilla.UsuarioAprobacion || null,
            pagadoPor: planilla.Estado === 'Pagada' ? planilla.UsuarioAprobacion : null,
            archivoExcel: `planilla-${planilla.Codigo}.xlsx`,
            archivoPDF: `planilla-${planilla.Codigo}.pdf`,
            archivoTXT: `planilla-${planilla.Codigo}.txt`
          }));
          
          console.log('📊 Planillas cargadas:', this.planillas.length);
          console.log('🔍 Primera planilla:', this.planillas[0]);
        } else {
          console.warn('⚠️ No se recibieron datos del servidor');
          console.warn('⚠️ Response:', response);
          this.planillas = [];
        }
        
        console.log('🔄 Aplicando filtros...');
        this.aplicarFiltros();
        console.log('📈 Calculando resumen...');
        this.calcularResumen();
        console.log('✅ Historial cargado, planillas filtradas:', this.planillasFiltradas.length);
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar historial:', error);
        alert('Error al cargar el historial de planillas. Verifique la conexión con el servidor.');
        this.planillas = [];
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    let planillasFiltradas = [...this.planillas];
    
    console.log('🔍 Aplicando filtros:', {
      anio: this.filtros.anio,
      mes: this.filtros.mes,
      tipoPlanilla: this.filtros.tipoPlanilla,
      estado: this.filtros.estado,
      busqueda: this.filtros.busqueda,
      totalPlanillas: planillasFiltradas.length
    });
    
    // Filtro por año
    if (this.filtros.anio) {
      planillasFiltradas = planillasFiltradas.filter(p => {
        const coincide = p.anio === Number(this.filtros.anio);
        return coincide;
      });
    }
    
    // Filtro por mes (solo si está definido y no es 0)
    if (this.filtros.mes !== undefined && this.filtros.mes !== null && this.filtros.mes !== 0) {
      planillasFiltradas = planillasFiltradas.filter(p => {
        const mesFiltro = Number(this.filtros.mes);
        const mesPlanilla = Number(p.mes);
        const coincide = mesPlanilla === mesFiltro;
        return coincide;
      });
    }
    
    // Filtro por tipo de planilla
    if (this.filtros.tipoPlanilla && this.filtros.tipoPlanilla !== 'Todas') {
      planillasFiltradas = planillasFiltradas.filter(p => p.tipoPlanilla === this.filtros.tipoPlanilla);
    }
    
    // Filtro por estado
    if (this.filtros.estado && this.filtros.estado !== 'Todos') {
      planillasFiltradas = planillasFiltradas.filter(p => p.estado === this.filtros.estado);
    }
    
    // Filtro por búsqueda
    if (this.filtros.busqueda && this.filtros.busqueda.trim()) {
      const busqueda = this.filtros.busqueda.toLowerCase().trim();
      planillasFiltradas = planillasFiltradas.filter(p => 
        (p.codigo && p.codigo.toLowerCase().includes(busqueda)) ||
        (p.periodo && p.periodo.toLowerCase().includes(busqueda)) ||
        (p.generadoPor && p.generadoPor.toLowerCase().includes(busqueda))
      );
    }
    
    console.log('✅ Planillas filtradas:', planillasFiltradas.length);
    
    this.planillasFiltradas = planillasFiltradas;
    this.totalElementos = planillasFiltradas.length;
    this.paginaActual = 1;
  }

  calcularResumen(): void {
    if (this.planillasFiltradas.length === 0) {
      this.resumen = {
        totalPlanillas: 0,
        totalTrabajadores: 0,
        totalPagado: 0,
        planillasPagadas: 0,
        planillasPendientes: 0,
        planillasAnuladas: 0
      };
      return;
    }
    
    const totalTrabajadores = this.planillasFiltradas.reduce((sum, p) => sum + (p.totalTrabajadores || 0), 0);
    const totalPagado = this.planillasFiltradas.reduce((sum, p) => sum + (p.totalNeto || 0), 0);
    const planillasPagadas = this.planillasFiltradas.filter(p => p.estado === 'Pagada').length;
    const planillasPendientes = this.planillasFiltradas.filter(p => p.estado === 'Generada' || p.estado === 'Aprobada').length;
    const planillasAnuladas = this.planillasFiltradas.filter(p => p.estado === 'Anulada').length;
    
    console.log('📊 Cálculo de resumen:');
    console.log('  - Total trabajadores:', totalTrabajadores);
    console.log('  - Total pagado:', totalPagado);
    console.log('  - Planillas pagadas:', planillasPagadas);
    console.log('  - Planillas pendientes:', planillasPendientes);
    console.log('  - Planillas anuladas:', planillasAnuladas);
    
    this.resumen = {
      totalPlanillas: this.planillasFiltradas.length,
      totalTrabajadores: totalTrabajadores,
      totalPagado: totalPagado,
      planillasPagadas: planillasPagadas,
      planillasPendientes: planillasPendientes,
      planillasAnuladas: planillasAnuladas
    };
  }

  // Métodos de filtrado
  filtrar(): void {
    this.aplicarFiltros();
    this.calcularResumen();
  }

  limpiarFiltros(): void {
    this.filtros = {
      anio: new Date().getFullYear(),
      mes: undefined,
      tipoPlanilla: 'Todas',
      estado: 'Todos',
      busqueda: '',
      fechaInicio: undefined,
      fechaFin: undefined
    };
    this.aplicarFiltros();
    this.calcularResumen();
  }

  // Métodos de vista
  cambiarVista(vista: 'lista' | 'tarjetas' | 'estadisticas'): void {
    this.vistaActual = vista;
  }

  // Métodos de navegación
  irAGenerar(): void {
    this.router.navigate(['/planillas/generar']);
  }

  verDetalle(planilla: PlanillaHistorial): void {
    console.log('🔍 Abriendo detalle de planilla:', planilla.codigo);
    
    this.mostrarModalDetalle = true;
    this.trabajadorExpandido = null; // Resetear trabajador expandido al abrir modal
    this.vistaDetalle = 'excel'; // Forzar vista Excel al abrir
    
    this.planillaSeleccionada = {
      id: planilla.id,
      codigo: planilla.codigo,
      periodo: planilla.periodo,
      tipoPlanilla: planilla.tipoPlanilla,
      estado: planilla.estado,
      fechaGeneracion: planilla.fechaGeneracion,
      fechaAprobacion: planilla.fechaAprobacion,
      fechaPago: planilla.fechaPago,
      totalTrabajadores: planilla.totalTrabajadores,
      totalIngresos: planilla.totalIngresos || 0,
      totalDescuentos: planilla.totalDescuentos,
      totalAportes: planilla.totalAportes,
      totalNeto: planilla.totalNeto,
      generadoPor: planilla.generadoPor,
      aprobadoPor: planilla.aprobadoPor,
      pagadoPor: planilla.pagadoPor,
      trabajadores: [] // Se cargará desde el backend
    };
    
    // Cargar trabajadores de la planilla
    this.cargarTrabajadoresPlanilla(planilla.id);
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.planillaSeleccionada = null;
  }

  cargarTrabajadoresPlanilla(planillaId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('📋 Cargando trabajadores de la planilla:', planillaId);
      
      // El interceptor agrega el token automáticamente
      this.http.get<any>(`${this.apiPlanillas}/${planillaId}/detalle`).subscribe({
        next: (response) => {
        console.log('✅ Trabajadores cargados:', response);
        
        if (response.success && response.data && this.planillaSeleccionada) {
          console.log('📊 Datos de trabajadores recibidos:', response.data);
          
          // 🔍 DEBUG: Ver datos CRUDOS del backend
          console.log('\n🔍 ========================================');
          console.log('   DEBUG: DATOS CRUDOS DEL BACKEND');
          console.log('========================================');
          if (response.data.length > 0) {
            const primerTrabajador = response.data[0];
            console.log('📊 PRIMER TRABAJADOR (RAW):');
            console.log('   📊 INGRESOS:');
            console.log('      RemuneracionBasica:', primerTrabajador.RemuneracionBasica);
            console.log('      CostoVida:', primerTrabajador.CostoVida);
            console.log('      ⚠️  AsignacionFamiliar:', primerTrabajador.AsignacionFamiliar, '(DEBE SER 102.5)');
            console.log('      Movilidad:', primerTrabajador.Movilidad);
            console.log('      HorasExtras:', primerTrabajador.HorasExtras);
            console.log('      BonoProductividad:', primerTrabajador.BonoProductividad);
            console.log('      ⚠️  OtrosIngresos:', primerTrabajador.OtrosIngresos, '(DEBE SER 252.21 o 200)');
            console.log('      TotalIngresos:', primerTrabajador.TotalIngresos);
            console.log('   📊 DESCUENTOS:');
            console.log('      AFP (Aporte 10%):', primerTrabajador.AFP);
            console.log('      ComisionAFP:', primerTrabajador.ComisionAFP);
            console.log('      SeguroAFP:', primerTrabajador.SeguroAFP);
            console.log('      ONP:', primerTrabajador.ONP);
            console.log('      ImpuestosRenta:', primerTrabajador.ImpuestosRenta);
            console.log('      Tardanzas:', primerTrabajador.Tardanzas);
            console.log('      Faltas:', primerTrabajador.Faltas);
            console.log('   📊 APORTES:');
            console.log('      AporteEsSalud:', primerTrabajador.AporteEsSalud);
            console.log('      SCTR:', primerTrabajador.SCTR);
            console.log('      TotalAportes:', primerTrabajador.TotalAportes);
            console.log('========================================\n');
          }
          
          this.planillaSeleccionada.trabajadores = response.data.map((trabajador: any) => {
            const mapped = {
              dni: trabajador.NumeroDocumento,
              nombre: `${trabajador.ApellidoPaterno} ${trabajador.ApellidoMaterno}, ${trabajador.Nombres}`,
              cargo: trabajador.Cargo || 'Sin cargo',
              area: trabajador.Area || 'Sin área',
              // ✅ CORREGIR NOMBRES PARA QUE COINCIDAN CON LA INTERFAZ
              dias_trabajados: trabajador.DiasLaborados || 30,
              // INGRESOS DESGLOSADOS
              remuneracionBasica: trabajador.RemuneracionBasica || 0,
              costo_vida: trabajador.CostoVida || 0,
              asignacion_familiar: trabajador.AsignacionFamiliar || 0,
              movilidad: trabajador.Movilidad || 0,
              horas_extras_monto: trabajador.HorasExtras || 0,
              bonificaciones: trabajador.BonoProductividad || 0,
              pc_2015_2016: trabajador.PC_2015_2016 || 0, // P.C (2015-2016)
              ra_829_2011_mdh: trabajador.RA_829_2011_MDH || 0, // R.A (829-2011-MDH, Pc 2011, Can. Familiar)
              otras_reintegros: trabajador.OtrasReintegros || 0, // Otras y/o Reintegros
              convenio_2022_2023: trabajador.Convenio_2022_2023 || 0, // CONVENIO CENTRALIZADO (2022-2023, D.S 311-2022-EF)
              convenio_2023_2024: trabajador.Convenio_2023_2024 || 0, // CONVENIO CENTRALIZADO (2023-2024)
              convenio_2024_2025: trabajador.Convenio_2024_2025 || 0, // CONVENIO CENTRALIZADO (2024-2025)
              homologacion: trabajador.Homologacion || 0, // Homologación
              otros_ingresos: trabajador.OtrosIngresos || 0,
              total_ingresos: trabajador.TotalIngresos || 0,
              // DESCUENTOS DESGLOSADOS
              sistema_pensiones: trabajador.SistemaPensiones || (trabajador.AFP > 0 ? 'AFP' : trabajador.ONP > 0 ? 'ONP' : 'AFP'),
              aporte_obligatorio_afp: trabajador.AFP || 0,
              aporte_onp: trabajador.ONP || 0,
              afp_onp: (trabajador.AFP || 0) + (trabajador.ONP || 0), // Suma para mostrar en Excel/PDF
              comision_afp: trabajador.ComisionAFP || 0,
              seguro_afp: trabajador.SeguroAFP || 0,
              renta_5ta: trabajador.ImpuestosRenta || 0,
              cuota_sindical: trabajador.CuotaSindical || 0,
              cuota_sindical_sitro_mdh: trabajador.CuotaSindicalSITROMDH || 0,
              prestamo_cooperativa_san_lorenzo: trabajador.PrestamoCooperativaSanLorenzo || 0,
              cooperativa_san_miguel: trabajador.CooperativaSanMiguel || 0,
              descuento_coopac_nsr: trabajador.DescuentoCOOPACNSR || 0,
              descuento_coopac_san_jose: trabajador.DescuentoCOOPACSanJose || 0,
              descuento_centro_coop: trabajador.DescuentoCentroCOOP || 0,
              descuento_leon_xiii: trabajador.DescuentoLeonXIII || 0,
              descuento_banco_comercio: trabajador.DescuentoBancoComercio || 0,
              descuento_banco_nacion: trabajador.DescuentoBancoNacion || 0,
              descuento_rimac_seguros: trabajador.DescuentoRimacSeguros || 0,
              descuento_banbif: trabajador.DescuentoBanBif || 0,
              descuento_oftalmol_entes: trabajador.DescuentoOftalmolEntes || 0,
              descuento_pactado_pago_indebido: trabajador.DescuentoPactadoPagoIndebido || 0,
              tardanzas: trabajador.Tardanzas || 0,
              faltas: trabajador.Faltas || 0,
              descuentos_judiciales: trabajador.DescuentosJudiciales || 0,
              otros_descuentos: trabajador.OtrosDescuentos || 0,
              total_descuentos: trabajador.TotalDescuentos || 0,
              // APORTES EMPLEADOR
              essalud: trabajador.AporteEsSalud || 0,
              seguro_vida: trabajador.SeguroVida || 0,
              sctr_pension: trabajador.SCTRPension || 0,
              sctr_salud: trabajador.SCTRSalud || 0,
              total_aportes: trabajador.TotalAportes || 0,
              // NETO
              neto_a_pagar: trabajador.NetoPagar || 0,
              gratificacion: trabajador.Gratificacion || 0,
              cts_mensual: trabajador.CTSMensual || 0,
              // DATOS BANCARIOS
              banco: trabajador.Banco || 'N/A',
              numero_cuenta: trabajador.NumeroCuenta || 'N/A',
              cci: trabajador.CCI || '',
              // DATOS BANCARIOS DESCUENTO JUDICIAL
              banco_descuento_judicial: trabajador.NumeroCuentaDescuento ? 'Banco de la Nación' : 'N/A',
              numero_cuenta_descuento_judicial: trabajador.NumeroCuentaDescuento || 'N/A',
              // ✅ AGREGAR DATOS DE REGIMEN LABORAL
              regimen_laboral: trabajador.RegimenLaboralNombre || trabajador.RegimenLaboral || 'N/A',
              regimen_laboral_codigo: trabajador.RegimenLaboralCodigo || '',
              regimen_laboral_nombre: trabajador.RegimenLaboralNombre || trabajador.RegimenLaboral || 'N/A'
            };
            
            // 🔍 DEBUG: Ver datos DESPUÉS del mapeo
            console.log('\n🔍 DEBUG: DATOS DESPUÉS DEL MAPEO');
            console.log('   📊 INGRESOS:');
            console.log('      remuneracionBasica:', mapped.remuneracionBasica);
            console.log('      asignacion_familiar:', mapped.asignacion_familiar);
            console.log('      bonificaciones:', mapped.bonificaciones);
            console.log('      horas_extras_monto:', mapped.horas_extras_monto);
            console.log('      otros_ingresos:', mapped.otros_ingresos);
            console.log('      total_ingresos:', mapped.total_ingresos);
            console.log('   📊 DESCUENTOS:');
            console.log('      sistema_pensiones:', mapped.sistema_pensiones);
            console.log('      aporte_obligatorio_afp:', mapped.aporte_obligatorio_afp);
            console.log('      comision_afp:', mapped.comision_afp);
            console.log('      seguro_afp:', mapped.seguro_afp);
            console.log('      aporte_onp:', mapped.aporte_onp);
            console.log('      renta_5ta:', mapped.renta_5ta);
            console.log('      total_descuentos:', mapped.total_descuentos);
            console.log('   📊 APORTES:');
            console.log('      essalud:', mapped.essalud);
            console.log('      seguro_vida:', mapped.seguro_vida);
            console.log('      sctr_pension:', mapped.sctr_pension);
            console.log('      sctr_salud:', mapped.sctr_salud);
            console.log('      total_aportes:', mapped.total_aportes);
            console.log('   📊 NETO:');
            console.log('      neto_a_pagar:', mapped.neto_a_pagar);
            console.log('   📊 REGIMEN:');
            console.log('      regimen_laboral:', mapped.regimen_laboral);
            console.log('      regimen_laboral_codigo:', mapped.regimen_laboral_codigo);
            console.log('========================================\n');
            
            return mapped;
          });
          
          console.log('👥 Trabajadores procesados:', this.planillaSeleccionada.trabajadores.length);
          console.log('🔍 Primer trabajador:', this.planillaSeleccionada.trabajadores[0]);
        } else {
          console.warn('⚠️ No se recibieron datos de trabajadores');
          this.planillaSeleccionada!.trabajadores = [];
        }
        },
        error: (error) => {
          console.error('❌ Error al cargar trabajadores:', error);
          alert('Error al cargar los trabajadores de la planilla');
          if (this.planillaSeleccionada) {
            this.planillaSeleccionada.trabajadores = [];
          }
          reject(error);
        },
        complete: () => {
          resolve();
        }
      });
    });
  }

  // Métodos de acciones
  aprobar(planilla: PlanillaHistorial): void {
    if (confirm(`¿Está seguro de aprobar la planilla ${planilla.codigo}?`)) {
      // Obtener el token del localStorage
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      this.http.put(`${this.apiPlanillas}/${planilla.id}/aprobar`, {}, { headers }).subscribe({
        next: (response) => {
          // Agregar notificación
          this.notificacionesService.notificarPlanillaAprobada(planilla.codigo, planilla.periodo);
          alert('Planilla aprobada exitosamente');
          this.cargarHistorial();
        },
        error: (error) => {
          console.error('Error al aprobar planilla:', error);
          alert('Error al aprobar la planilla');
        }
      });
    }
  }

  pagar(planilla: PlanillaHistorial): void {
    if (confirm(`¿Está seguro de marcar como pagada la planilla ${planilla.codigo}?`)) {
      // Obtener el token del localStorage
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      this.http.put(`${this.apiPlanillas}/${planilla.id}/pagar`, {}, { headers }).subscribe({
        next: (response) => {
          // Agregar notificación
          this.notificacionesService.notificarPlanillaPagada(planilla.codigo, planilla.periodo);
          alert('Planilla marcada como pagada');
          this.cargarHistorial();
        },
        error: (error) => {
          console.error('Error al pagar planilla:', error);
          alert('Error al marcar como pagada');
        }
      });
    }
  }

  anular(planilla: PlanillaHistorial): void {
    this.planillaAAnular = planilla;
    this.motivoAnulacion = '';
    this.mostrarModalAnular = true;
  }

  confirmarAnulacion(): void {
    if (!this.planillaAAnular || !this.motivoAnulacion.trim()) {
      this.mostrarModalValidacionAnulacion = true;
      this.cdr.detectChanges();
      return;
    }
    
    // Cerrar modal de confirmación y mostrar estado de carga
    this.mostrarModalAnular = false;
    this.anulando = true;
    this.mostrarModalExitoAnulacion = true;
    this.cdr.detectChanges(); // Forzar detección de cambios
    
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.http.put(`${this.apiPlanillas}/${this.planillaAAnular.id}/anular`, {
      motivo: this.motivoAnulacion
    }, { headers }).subscribe({
      next: (response) => {
        // Simular un pequeño delay para mostrar la animación de carga (mínimo 800ms)
        setTimeout(() => {
          this.anulando = false;
          this.cdr.markForCheck(); // Marcar para detección de cambios
          this.cdr.detectChanges(); // Forzar detección de cambios para mostrar el check
          
          // Cerrar el modal después de 2.5 segundos
          setTimeout(() => {
            this.mostrarModalExitoAnulacion = false;
            this.planillaAAnular = null;
            this.motivoAnulacion = '';
            this.cargarHistorial();
            this.cdr.detectChanges();
          }, 2500);
        }, 800);
      },
      error: (error) => {
        console.error('Error al anular planilla:', error);
        this.anulando = false;
        this.mostrarModalExitoAnulacion = false;
        this.cdr.detectChanges();
        alert('Error al anular la planilla');
      }
    });
  }

  // ===================================
  // 🗑️ ELIMINAR DEFINITIVAMENTE
  // ===================================
  
  abrirModalEliminar(planilla: PlanillaHistorial): void {
    // Validar que la planilla esté en un estado que permite eliminación
    if (planilla.estado !== 'Borrador' && planilla.estado !== 'Anulada') {
      this.mensajeError = `No se puede eliminar una planilla en estado '${planilla.estado}'. Solo se pueden eliminar planillas en estado 'Borrador' o 'Anulada'.`;
      setTimeout(() => this.mensajeError = '', 5000);
      return;
    }
    
    this.planillaAEliminar = planilla;
    this.confirmacionEliminar = '';
    this.mensajeError = '';
    this.mensajeExito = '';
    this.eliminando = false;
    this.mostrarModalEliminar = true;
  }

  cerrarModalEliminar(): void {
    if (this.eliminando) return; // No permitir cerrar mientras se está eliminando
    
    this.mostrarModalEliminar = false;
    this.planillaAEliminar = null;
    this.confirmacionEliminar = '';
    this.mensajeError = '';
    this.mensajeExito = '';
    this.eliminando = false;
    this.eliminacionCompletada = false;
  }

  confirmarEliminacion(): void {
    if (!this.planillaAEliminar || this.eliminando) return;

    // Validar que escribió "ELIMINAR" correctamente
    if (this.confirmacionEliminar.toUpperCase() !== 'ELIMINAR') {
      this.mensajeError = '❌ Debe escribir "ELIMINAR" (en mayúsculas) para confirmar';
      setTimeout(() => this.mensajeError = '', 4000);
      return;
    }

    // Validar estado nuevamente antes de eliminar
    if (this.planillaAEliminar.estado !== 'Borrador' && this.planillaAEliminar.estado !== 'Anulada') {
      this.mensajeError = `No se puede eliminar una planilla en estado '${this.planillaAEliminar.estado}'. Solo se pueden eliminar planillas en estado 'Borrador' o 'Anulada'.`;
      setTimeout(() => this.mensajeError = '', 5000);
      return;
    }

    const codigo = this.planillaAEliminar.codigo;
    const id = this.planillaAEliminar.id;

    console.log(`🗑️ Eliminando planilla definitivamente: ${codigo} (ID: ${id})`);

    this.eliminando = true;
    this.eliminacionCompletada = false;
    this.mensajeError = '';
    this.mensajeExito = '';
    this.cdr.detectChanges();

    // Eliminar de la base de datos
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.http.delete(`${this.apiPlanillas}/${id}`, { headers }).subscribe({
      next: (response: any) => {
        // Simular un pequeño delay para mostrar la animación de carga
        setTimeout(() => {
          this.eliminando = false;
          this.eliminacionCompletada = true;
          this.mensajeExito = `Planilla ${codigo} eliminada definitivamente`;
          this.cdr.detectChanges();
          
          // Cerrar modal después de 2.5 segundos
          setTimeout(() => {
            this.mostrarModalEliminar = false;
            this.planillaAEliminar = null;
            this.confirmacionEliminar = '';
            this.eliminando = false;
            this.eliminacionCompletada = false;
            this.mensajeExito = '';
            this.cargarHistorial();
            this.cdr.detectChanges();
          }, 2500);
        }, 800);
      },
      error: (error) => {
        console.error('❌ Error al eliminar planilla:', error);
        this.eliminando = false;
        this.eliminacionCompletada = false;
        this.mensajeError = error.error?.message || error.message || 'Error al eliminar la planilla';
        this.cdr.detectChanges();
        setTimeout(() => this.mensajeError = '', 6000);
      }
    });
  }

  cancelarAnulacion(): void {
    this.mostrarModalAnular = false;
    this.planillaAAnular = null;
    this.motivoAnulacion = '';
  }

  cerrarModalValidacionAnulacion(): void {
    this.mostrarModalValidacionAnulacion = false;
  }

  // Métodos de exportación
  exportarHistorial(): void {
    this.exportarExcel();
  }

  exportarExcel(): void {
    // Si hay una planilla seleccionada, exportar esa planilla organizada por régimen
    if (this.planillaSeleccionada) {
      this.exportarPlanillaExcel();
      return;
    }
    
    // Si no hay planilla seleccionada, exportar el historial completo
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.http.get(`${this.apiPlanillas}/exportar/excel`, { headers, responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `historial-planillas-${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error al exportar Excel:', error);
        alert('Error al exportar a Excel');
      }
    });
  }

  exportarPlanillaExcel(): void {
    if (!this.planillaSeleccionada || !this.planillaSeleccionada.trabajadores) {
      alert('No hay datos de planilla para exportar');
      return;
    }

    // Obtener trabajadores agrupados por régimen
    const gruposRegimen = this.getTrabajadoresAgrupadosPorRegimen();
    
    // Crear un libro de trabajo
    const wb = XLSX.utils.book_new();
    
    // Crear hoja de resumen
    const resumenData = [
      ['PLANILLA:', this.planillaSeleccionada.codigo],
      ['PERÍODO:', this.planillaSeleccionada.periodo],
      ['ESTADO:', this.planillaSeleccionada.estado],
      [''],
      ['RESUMEN FINANCIERO'],
      ['Ingresos:', this.formatearMoneda(this.planillaSeleccionada.totalIngresos || 0)],
      ['Descuentos:', this.formatearMoneda(this.planillaSeleccionada.totalDescuentos || 0)],
      ['Aportes:', this.formatearMoneda(this.planillaSeleccionada.totalAportes || 0)],
      ['Neto a Pagar:', this.formatearMoneda(this.planillaSeleccionada.totalNeto || 0)],
      [''],
      ['Total Trabajadores:', this.planillaSeleccionada.totalTrabajadores || 0]
    ];
    
    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
    
    // Crear una hoja para cada régimen
    gruposRegimen.forEach((grupo, index) => {
      const datosRegimen: any[] = [];
      
      // Encabezado del régimen
      datosRegimen.push([`RÉGIMEN: ${grupo.regimen}`]);
      datosRegimen.push([`Total trabajadores: ${grupo.trabajadores.length}`]);
      datosRegimen.push(['']); // Línea en blanco
      
      // Encabezados de la tabla
      const encabezados = [
        'DNI',
        'Trabajador',
        'Cargo',
        'Gerencia',
        'Subgerencia',
        'Unidad',
        'Días',
        'Rem. Básica',
        'Costo Vida',
        'Asig. Familiar',
        'Movilidad',
        'Horas Extras',
        'Bonificaciones',
        'P.C (2015-2016)',
        'R.A (829-2011-MDH)',
        'Otras y/o Reintegros',
        'Conv. 2022-2023',
        'Conv. 2023-2024',
        'Conv. 2024-2025',
        'Homologación',
        'Otros Ingresos',
        'Total Ingresos',
        'AFP/ONP',
        'Comisión AFP',
        'Seguro AFP',
        'Renta 5ta',
        'Cuota Sindical',
        'Prest. Coop. San Lorenzo',
        'Coop San Miguel',
        'Desc. COOPAC NSR',
        'Desc. COOPAC San Jose',
        'Desc. Centro Coop',
        'Desc. Leon XIII',
        'Desc. Banco Comercio',
        'Rimac Seguros',
        'Desc. BanBif',
        'Oftalmol Entes',
        'Desc. Pactado Pago Indeb.',
        'Tardanzas',
        'Faltas',
        'Desc. Judiciales',
        'Otros Desc.',
        'Total Descuentos',
        'EsSalud',
        'Seguro Vida',
        'SCTR Pensión',
        'SCTR Salud',
        'Total Aportes',
        'Neto a Pagar',
        'Banco',
        'Cuenta',
        'Banco Desc. Judicial',
        'Cuenta Desc. Judicial'
      ];
      datosRegimen.push(encabezados);
      
      // Datos de cada trabajador
      grupo.trabajadores.forEach(t => {
        datosRegimen.push([
          t.dni || '',
          t.nombre || '',
          t.cargo || '',
          t.gerencia || 'N/A',
          t.subgerencia || 'N/A',
          t.unidad || 'N/A',
          t.dias_trabajados || 0,
          t.remuneracion_basica || 0,
          t.costo_vida || 0,
          t.asignacion_familiar || 0,
          t.movilidad || 0,
          t.horas_extras || 0,
          t.bonificaciones || 0,
          t.pc_2015_2016 || 0,
          t.ra_829_2011_mdh || 0,
          t.otras_reintegros || 0,
          t.convenio_2022_2023 || 0,
          t.convenio_2023_2024 || 0,
          t.convenio_2024_2025 || 0,
          t.homologacion || 0,
          t.otros_ingresos || 0,
          t.total_ingresos || 0,
          t.afp_onp || 0,
          t.comision_afp || 0,
          t.seguro_afp || 0,
          t.renta_5ta || 0,
          t.cuota_sindical || 0,
          t.prestamo_cooperativa_san_lorenzo || 0,
          t.cooperativa_san_miguel || 0,
          t.descuento_coopac_nsr || 0,
          t.descuento_coopac_san_jose || 0,
          t.descuento_centro_coop || 0,
          t.descuento_leon_xiii || 0,
          t.descuento_banco_comercio || 0,
          t.descuento_banco_nacion || 0,
          t.descuento_rimac_seguros || 0,
          t.descuento_banbif || 0,
          t.descuento_oftalmol_entes || 0,
          t.descuento_pactado_pago_indebido || 0,
          t.tardanzas || 0,
          t.faltas || 0,
          t.descuentos_judiciales || 0,
          t.otros_descuentos || 0,
          t.total_descuentos || 0,
          t.essalud || 0,
          t.seguro_vida || 0,
          t.sctr_pension || 0,
          t.sctr_salud || 0,
          t.total_aportes || 0,
          t.neto_a_pagar || 0,
          t.banco || '',
          t.cuenta || '',
          t.banco_descuento_judicial || 'N/A',
          t.numero_cuenta_descuento_judicial || 'N/A'
        ]);
      });
      
      // Fila de totales
      datosRegimen.push(['']); // Línea en blanco
      const filaTotales: any[] = ['TOTALES ' + grupo.regimen + ':'];
      // Llenar celdas vacías hasta llegar a las columnas de totales
      for (let i = 0; i < 21; i++) filaTotales.push('');
      filaTotales.push(this.calcularTotalGrupo(grupo.trabajadores, 'total_ingresos'));
      for (let i = 0; i < 20; i++) filaTotales.push('');
      filaTotales.push(this.calcularTotalGrupo(grupo.trabajadores, 'total_descuentos'));
      for (let i = 0; i < 4; i++) filaTotales.push('');
      filaTotales.push(this.calcularTotalGrupo(grupo.trabajadores, 'total_aportes'));
      filaTotales.push(this.calcularTotalGrupo(grupo.trabajadores, 'neto_a_pagar'));
      filaTotales.push('');
      filaTotales.push('');
      datosRegimen.push(filaTotales);
      
      // Crear hoja de Excel
      const ws = XLSX.utils.aoa_to_sheet(datosRegimen);
      
      // Ajustar ancho de columnas
      const colWidths = [
        { wch: 12 }, // DNI
        { wch: 35 }, // Trabajador
        { wch: 40 }, // Cargo
        { wch: 25 }, // Gerencia
        { wch: 25 }, // Subgerencia
        { wch: 25 }, // Unidad
        { wch: 8 },  // Días
        { wch: 12 }, // Rem. Básica
        { wch: 12 }, // Costo Vida
        { wch: 12 }, // Asig. Familiar
        { wch: 12 }, // Movilidad
        { wch: 12 }, // Horas Extras
        { wch: 12 }, // Bonificaciones
        { wch: 15 }, // P.C (2015-2016)
        { wch: 18 }, // R.A (829-2011-MDH)
        { wch: 18 }, // Otras y/o Reintegros
        { wch: 18 }, // Conv. 2022-2023
        { wch: 18 }, // Conv. 2023-2024
        { wch: 18 }, // Conv. 2024-2025
        { wch: 15 }, // Homologación
        { wch: 12 }, // Otros Ingresos
        { wch: 14 }, // Total Ingresos
        { wch: 12 }, // AFP/ONP
        { wch: 12 }, // Comisión AFP
        { wch: 12 }, // Seguro AFP
        { wch: 12 }, // Renta 5ta
        { wch: 12 }, // Cuota Sindical
        { wch: 18 }, // Prest. Coop. San Lorenzo
        { wch: 15 }, // Coop San Miguel
        { wch: 15 }, // Desc. COOPAC NSR
        { wch: 18 }, // Desc. COOPAC San Jose
        { wch: 15 }, // Desc. Centro Coop
        { wch: 15 }, // Desc. Leon XIII
        { wch: 18 }, // Desc. Banco Comercio
        { wch: 15 }, // Rimac Seguros
        { wch: 12 }, // Desc. BanBif
        { wch: 15 }, // Oftalmol Entes
        { wch: 20 }, // Desc. Pactado Pago Indeb.
        { wch: 12 }, // Tardanzas
        { wch: 12 }, // Faltas
        { wch: 15 }, // Desc. Judiciales
        { wch: 12 }, // Otros Desc.
        { wch: 14 }, // Total Descuentos
        { wch: 12 }, // EsSalud
        { wch: 12 }, // Seguro Vida
        { wch: 12 }, // SCTR Pensión
        { wch: 12 }, // SCTR Salud
        { wch: 14 }, // Total Aportes
        { wch: 14 }, // Neto a Pagar
        { wch: 15 }, // Banco
        { wch: 20 }, // Cuenta
        { wch: 20 }, // Banco Desc. Judicial
        { wch: 25 }  // Cuenta Desc. Judicial
      ];
      ws['!cols'] = colWidths;
      
      // Nombre de la hoja (máximo 31 caracteres)
      const nombreHoja = grupo.regimen.length > 31 ? grupo.regimen.substring(0, 28) + '...' : grupo.regimen;
      XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
    });
    
    // Generar archivo Excel
    const nombreArchivo = `planilla-${this.planillaSeleccionada.codigo}-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);
  }

  exportarPDF(): void {
    if (!this.planillaSeleccionada) {
      alert('No hay planilla seleccionada');
      return;
    }
    
    // Generar PDF desde el frontend organizado por régimen
    this.generarPDFPlanilla();
  }

  generarPDFPlanilla(): void {
    if (!this.planillaSeleccionada || !this.planillaSeleccionada.trabajadores) {
      alert('No hay datos de planilla para exportar');
      return;
    }

    // Usar window.print() para generar PDF desde el navegador
    // Crear una ventana temporal con el contenido formateado
    const contenido = this.generarContenidoPDF();
    const ventana = window.open('', '_blank');
    if (ventana) {
      ventana.document.write(contenido);
      ventana.document.close();
      setTimeout(() => {
        ventana.print();
      }, 250);
    }
  }

  generarContenidoPDF(): string {
    const gruposRegimen = this.getTrabajadoresAgrupadosPorRegimen();
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Planilla ${this.planillaSeleccionada?.codigo}</title>
        <style>
          @media print {
            @page {
              size: A4 landscape;
              margin: 1cm;
            }
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 9px;
            margin: 0;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          .header .municipalidad {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #000;
          }
          .header h1 {
            margin: 0;
            font-size: 18px;
          }
          .header h2 {
            margin: 5px 0;
            font-size: 14px;
          }
          .resumen {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 20px;
            padding: 10px;
            background: #f5f5f5;
          }
          .resumen-item {
            text-align: center;
          }
          .resumen-label {
            font-weight: bold;
            display: block;
            margin-bottom: 5px;
          }
          .resumen-value {
            font-size: 14px;
            font-weight: bold;
          }
          .grupo-regimen {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .grupo-header {
            background: #4a90e2;
            color: white;
            padding: 8px;
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 8px;
          }
          th {
            background: #333;
            color: white;
            padding: 6px 4px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #000;
          }
          td {
            padding: 4px;
            border: 1px solid #ccc;
            text-align: left;
          }
          .text-right {
            text-align: right;
          }
          .text-center {
            text-align: center;
          }
          .total-row {
            background: #e8e8e8;
            font-weight: bold;
          }
          .total-row td {
            border-top: 2px solid #000;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="municipalidad">MUNICIPALIDAD DISTRITAL DE HUANCHACO</div>
          <h1>DETALLE DE PLANILLA</h1>
          <h2>${this.planillaSeleccionada?.codigo} - ${this.planillaSeleccionada?.periodo}</h2>
          <p>Estado: ${this.planillaSeleccionada?.estado}</p>
        </div>
        
        <div class="resumen">
          <div class="resumen-item">
            <span class="resumen-label">INGRESOS</span>
            <span class="resumen-value" style="color: #22c55e;">${this.formatearMoneda(this.planillaSeleccionada?.totalIngresos || 0)}</span>
          </div>
          <div class="resumen-item">
            <span class="resumen-label">DESCUENTOS</span>
            <span class="resumen-value" style="color: #ef4444;">${this.formatearMoneda(this.planillaSeleccionada?.totalDescuentos || 0)}</span>
          </div>
          <div class="resumen-item">
            <span class="resumen-label">APORTES</span>
            <span class="resumen-value" style="color: #f59e0b;">${this.formatearMoneda(this.planillaSeleccionada?.totalAportes || 0)}</span>
          </div>
          <div class="resumen-item">
            <span class="resumen-label">NETO A PAGAR</span>
            <span class="resumen-value" style="color: #3b82f6;">${this.formatearMoneda(this.planillaSeleccionada?.totalNeto || 0)}</span>
          </div>
        </div>
    `;

    gruposRegimen.forEach(grupo => {
      html += `
        <div class="grupo-regimen">
          <div class="grupo-header">
            ${grupo.regimen} - ${grupo.trabajadores.length} trabajador(es)
          </div>
          <table>
            <thead>
              <tr>
                <th>DNI</th>
                <th>Trabajador</th>
                <th>Cargo</th>
                <th>Gerencia</th>
                <th>Subgerencia</th>
                <th>Unidad</th>
                <th class="text-center">Días</th>
                <th class="text-right">Rem. Básica</th>
                <th class="text-right">Costo Vida</th>
                <th class="text-right">Asig. Familiar</th>
                <th class="text-right">Movilidad</th>
                <th class="text-right">Horas Extras</th>
                <th class="text-right">Bonificaciones</th>
                <th class="text-right">P.C (2015-2016)</th>
                <th class="text-right">R.A (829-2011-MDH)</th>
                <th class="text-right">Otras y/o Reintegros</th>
                <th class="text-right">Conv. 2022-2023</th>
                <th class="text-right">Conv. 2023-2024</th>
                <th class="text-right">Conv. 2024-2025</th>
                <th class="text-right">Homologación</th>
                <th class="text-right">Otros Ingresos</th>
                <th class="text-right">Total Ingresos</th>
                <th class="text-right">AFP/ONP</th>
                <th class="text-right">Comisión AFP</th>
                <th class="text-right">Seguro AFP</th>
                <th class="text-right">Renta 5ta</th>
                <th class="text-right">Cuota Sindical</th>
                <th class="text-right">Prest. Coop. San Lorenzo</th>
                <th class="text-right">Coop San Miguel</th>
                <th class="text-right">Desc. COOPAC NSR</th>
                <th class="text-right">Desc. COOPAC San Jose</th>
                <th class="text-right">Desc. Centro Coop</th>
                <th class="text-right">Desc. Leon XIII</th>
                <th class="text-right">Desc. Banco Comercio</th>
                <th class="text-right">Rimac Seguros</th>
                <th class="text-right">Desc. BanBif</th>
                <th class="text-right">Oftalmol Entes</th>
                <th class="text-right">Desc. Pactado Pago Indeb.</th>
                <th class="text-right">Tardanzas</th>
                <th class="text-right">Faltas</th>
                <th class="text-right">Desc. Judiciales</th>
                <th class="text-right">Otros Desc.</th>
                <th class="text-right">Total Descuentos</th>
                <th class="text-right">EsSalud</th>
                <th class="text-right">Seguro Vida</th>
                <th class="text-right">SCTR Pensión</th>
                <th class="text-right">SCTR Salud</th>
                <th class="text-right">Total Aportes</th>
                <th class="text-right">Neto a Pagar</th>
                <th>Banco</th>
                <th>Cuenta</th>
                <th>Banco Desc. Judicial</th>
                <th>Cuenta Desc. Judicial</th>
              </tr>
            </thead>
            <tbody>
      `;

      grupo.trabajadores.forEach(t => {
        html += `
          <tr>
            <td>${t.dni || ''}</td>
            <td>${t.nombre || ''}</td>
            <td>${(t.cargo || '').substring(0, 30)}</td>
            <td>${t.gerencia || 'N/A'}</td>
            <td>${t.subgerencia || 'N/A'}</td>
            <td>${t.unidad || 'N/A'}</td>
            <td class="text-center">${t.dias_trabajados || 0}</td>
            <td class="text-right">${this.formatearMoneda(t.remuneracion_basica || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.costo_vida || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.asignacion_familiar || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.movilidad || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.horas_extras || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.bonificaciones || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.pc_2015_2016 || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.ra_829_2011_mdh || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.otras_reintegros || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.convenio_2022_2023 || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.convenio_2023_2024 || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.convenio_2024_2025 || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.homologacion || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.otros_ingresos || 0)}</td>
            <td class="text-right" style="color: #22c55e; font-weight: bold;">${this.formatearMoneda(t.total_ingresos || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.afp_onp || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.comision_afp || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.seguro_afp || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.renta_5ta || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.cuota_sindical || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.prestamo_cooperativa_san_lorenzo || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.cooperativa_san_miguel || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.descuento_coopac_nsr || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.descuento_coopac_san_jose || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.descuento_centro_coop || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.descuento_leon_xiii || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.descuento_banco_comercio || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.descuento_banco_nacion || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.descuento_rimac_seguros || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.descuento_banbif || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.descuento_oftalmol_entes || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.descuento_pactado_pago_indebido || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.tardanzas || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.faltas || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.descuentos_judiciales || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.otros_descuentos || 0)}</td>
            <td class="text-right" style="color: #ef4444; font-weight: bold;">${this.formatearMoneda(t.total_descuentos || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.essalud || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.seguro_vida || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.sctr_pension || 0)}</td>
            <td class="text-right">${this.formatearMoneda(t.sctr_salud || 0)}</td>
            <td class="text-right" style="color: #f59e0b; font-weight: bold;">${this.formatearMoneda(t.total_aportes || 0)}</td>
            <td class="text-right" style="color: #3b82f6; font-weight: bold;">${this.formatearMoneda(t.neto_a_pagar || 0)}</td>
            <td>${t.banco || ''}</td>
            <td>${t.cuenta || ''}</td>
            <td>${t.banco_descuento_judicial || 'N/A'}</td>
            <td>${t.numero_cuenta_descuento_judicial || 'N/A'}</td>
          </tr>
      `;
      });

      // Fila de totales
      html += `
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="21" class="text-right"><strong>TOTALES ${grupo.regimen}:</strong></td>
              <td class="text-right" style="color: #22c55e;"><strong>${this.formatearMoneda(this.calcularTotalGrupo(grupo.trabajadores, 'total_ingresos'))}</strong></td>
              <td colspan="20"></td>
              <td class="text-right" style="color: #ef4444;"><strong>${this.formatearMoneda(this.calcularTotalGrupo(grupo.trabajadores, 'total_descuentos'))}</strong></td>
              <td colspan="4"></td>
              <td class="text-right" style="color: #f59e0b;"><strong>${this.formatearMoneda(this.calcularTotalGrupo(grupo.trabajadores, 'total_aportes'))}</strong></td>
              <td class="text-right" style="color: #3b82f6;"><strong>${this.formatearMoneda(this.calcularTotalGrupo(grupo.trabajadores, 'neto_a_pagar'))}</strong></td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      `;
    });

    html += `
      </body>
      </html>
    `;

    return html;
  }
  
  exportarTXT(): void {
    if (!this.planillaSeleccionada) {
      alert('No hay planilla seleccionada');
      return;
    }
    
    // El interceptor agrega el token automáticamente
    this.http.get(`${this.apiPlanillas}/${this.planillaSeleccionada.id}/exportar/txt`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `planilla-${this.planillaSeleccionada?.codigo}-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error al exportar TXT:', error);
        alert('Error al exportar a TXT');
      }
    });
  }

  // Métodos de paginación
  get planillasPaginadas(): PlanillaHistorial[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    return this.planillasFiltradas.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.totalElementos / this.elementosPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  // Métodos para expandir/colapsar detalles de trabajador
  toggleDetalleTrabajador(index: number): void {
    if (this.trabajadorExpandido === index) {
      this.trabajadorExpandido = null;
    } else {
      this.trabajadorExpandido = index;
      // Scroll automático al expandir
      setTimeout(() => {
        const element = document.querySelector(`[data-trabajador-index="${index}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  }

  estaExpandido(index: number): boolean {
    return this.trabajadorExpandido === index;
  }

  // Alternar entre vista compacta y Excel
  toggleVistaDetalle(): void {
    this.vistaDetalle = this.vistaDetalle === 'compacta' ? 'excel' : 'compacta';
    this.trabajadorExpandido = null; // Resetear expansión al cambiar vista
  }

  // Agrupar trabajadores por régimen para vista Excel
  getTrabajadoresAgrupadosPorRegimen(): { regimen: string; trabajadores: any[] }[] {
    const trabajadoresFiltrados = this.getTrabajadoresFiltrados();
    const grupos: { [key: string]: any[] } = {};
    
    trabajadoresFiltrados.forEach(t => {
      let regimen = t.regimen_laboral || t.regimen_laboral_nombre || 'Sin Régimen';
      // Normalizar el nombre del régimen para que coincida con los filtros
      if (regimen.toUpperCase().includes('DL 1057') || regimen.toUpperCase().includes('CAS')) {
        regimen = 'RÉGIMEN DL 1057 (CAS)';
      } else if (regimen.toUpperCase().includes('DL 276')) {
        regimen = 'RÉGIMEN DL 276';
      } else if (regimen.toUpperCase().includes('DL 728')) {
        regimen = 'RÉGIMEN DL 728';
      } else if (!regimen || regimen === 'N/A') {
        regimen = 'Sin Régimen';
      }
      
      if (!grupos[regimen]) {
        grupos[regimen] = [];
      }
      grupos[regimen].push(t);
    });
    
    return Object.keys(grupos).map(regimen => ({
      regimen,
      trabajadores: grupos[regimen]
    })).sort((a, b) => a.regimen.localeCompare(b.regimen));
  }
  
  // TrackBy para evitar re-renderizados innecesarios que resetean el scroll
  trackByRegimen(index: number, item: { regimen: string; trabajadores: any[] }): string {
    return item.regimen;
  }

  // Calcular totales por grupo de régimen
  calcularTotalGrupo(trabajadores: any[], campo: string): number {
    return trabajadores.reduce((sum, t) => sum + (t[campo] || 0), 0);
  }

  // Métodos de utilidad
  formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(monto);
  }

  formatearFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-PE');
  }

  obtenerClaseEstado(estado: string): string {
    switch (estado) {
      case 'Pagada': return 'estado-pagada';
      case 'Aprobada': return 'estado-aprobada';
      case 'Generada': return 'estado-generada';
      case 'Anulada': return 'estado-anulada';
      default: return 'estado-default';
    }
  }

  getEstadoBadgeClass(estado: string): string {
    return this.obtenerClaseEstado(estado);
  }

  get nombreMesFiltro(): string {
    if (!this.filtros.mes || this.filtros.mes === 0) {
      return '';
    }
    const mes = this.mesesHistorial.find(m => m.valor === Number(this.filtros.mes));
    return mes ? mes.nombre : '';
  }

  accionDisponible(planilla: PlanillaHistorial, tipo: string): boolean {
    const acciones = this.obtenerAccionesDisponibles(planilla);
    return acciones.some(accion => accion.tipo === tipo);
  }

  ejecutarAccion(tipo: string, planilla: PlanillaHistorial): void {
    switch (tipo) {
      case 'ver':
        this.verDetalle(planilla);
        break;
      case 'aprobar':
        this.aprobar(planilla);
        break;
      case 'pagar':
        this.pagar(planilla);
        break;
      case 'anular':
        this.anular(planilla);
        break;
      case 'eliminar':
        this.abrirModalEliminar(planilla);
        break;
      case 'exportar':
        this.exportarPlanilla(planilla);
        break;
      case 'editar':
        this.editarPlanilla(planilla);
        break;
      default:
        console.warn('Acción no implementada:', tipo);
    }
  }

  exportarPlanilla(planilla: PlanillaHistorial): void {
    // Implementar exportación de planilla individual
    console.log('Exportando planilla:', planilla.codigo);
    alert(`Exportando planilla ${planilla.codigo}`);
  }

  editarPlanilla(planilla: PlanillaHistorial): void {
    // Solo permitir editar planillas en estado 'Generada' o 'Borrador'
    if (planilla.estado !== 'Generada' && planilla.estado !== 'Borrador') {
      this.mostrarNotificacion('warning', '⚠️ Advertencia', `No se puede editar una planilla en estado '${planilla.estado}'. Solo se pueden editar planillas generadas o en borrador.`, 3000);
      return;
    }
    
    console.log('✏️ Abriendo modal de edición para planilla:', planilla.codigo);
    this.planillaAEditar = planilla;
    this.mostrarModalEditar = true;
    this.busquedaEditar = '';
    this.regimenFiltroEditar = 'Todos';
    
    // Cargar los trabajadores de la planilla para edición
    this.cargarTrabajadoresParaEdicion(planilla.id);
  }

  cargarTrabajadoresParaEdicion(planillaId: number): void {
    console.log('📋 Cargando trabajadores para edición:', planillaId);
    this.guardandoCambios = true;
    
    this.http.get<any>(`${this.apiPlanillas}/${planillaId}/detalle`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Mapear trabajadores con campos editables
          this.trabajadoresEditables = response.data.map((trabajador: any) => ({
            trabajadorId: trabajador.TrabajadorID,
            dni: trabajador.NumeroDocumento,
            nombre: `${trabajador.ApellidoPaterno} ${trabajador.ApellidoMaterno}, ${trabajador.Nombres}`,
            cargo: trabajador.Cargo || 'Sin cargo',
            area: trabajador.Area || 'Sin área',
            regimen_laboral: trabajador.RegimenLaboralNombre || trabajador.RegimenLaboral || 'N/A',
            // INGRESOS (editables)
            dias_trabajados: trabajador.DiasLaborados || 30,
            remuneracionBasica: trabajador.RemuneracionBasica || 0,
            costo_vida: trabajador.CostoVida || 0,
            asignacion_familiar: trabajador.AsignacionFamiliar || 0,
            movilidad: trabajador.Movilidad || trabajador.MovilidadLocal || 0,
            horas_extras_monto: trabajador.HorasExtras || 0,
            bonificaciones: trabajador.BonoProductividad || 0,
            pc_2015_2016: trabajador.PC_2015_2016 || 0,
            ra_829_2011_mdh: trabajador.RA_829_2011_MDH || 0,
            otras_reintegros: trabajador.OtrasReintegros || 0,
            convenio_2022_2023: trabajador.Convenio_2022_2023 || 0,
            convenio_2023_2024: trabajador.Convenio_2023_2024 || 0,
            convenio_2024_2025: trabajador.Convenio_2024_2025 || 0,
            homologacion: trabajador.Homologacion || 0,
            otros_ingresos: trabajador.OtrosIngresos || 0,
            // DESCUENTOS (editables)
            tardanzas: trabajador.Tardanzas || 0,
            faltas: trabajador.Faltas || 0,
            otros_descuentos: trabajador.OtrosDescuentos || 0,
            // Totales calculados
            total_ingresos: trabajador.TotalIngresos || 0,
            total_descuentos: trabajador.TotalDescuentos || 0,
            neto_a_pagar: trabajador.NetoAPagar || 0
          }));
          
          console.log('✅ Trabajadores cargados para edición:', this.trabajadoresEditables.length);
          this.guardandoCambios = false;
        } else {
          console.error('❌ Error al cargar trabajadores:', response);
          this.mostrarNotificacion('error', '❌ Error', 'No se pudieron cargar los trabajadores de la planilla', 3000);
          this.guardandoCambios = false;
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar trabajadores:', error);
        this.mostrarNotificacion('error', '❌ Error', 'Error al cargar los trabajadores de la planilla', 3000);
        this.guardandoCambios = false;
      }
    });
  }

  cerrarModalEditar(): void {
    if (this.guardandoCambios) {
      if (!confirm('¿Está seguro de que desea cerrar? Los cambios no guardados se perderán.')) {
        return;
      }
    }
    this.mostrarModalEditar = false;
    this.planillaAEditar = null;
    this.trabajadoresEditables = [];
    this.busquedaEditar = '';
    this.regimenFiltroEditar = 'Todos';
  }

  calcularTotalesTrabajador(trabajador: any): void {
    // Recalcular total de ingresos
    trabajador.total_ingresos = 
      (trabajador.remuneracionBasica || 0) +
      (trabajador.costo_vida || 0) +
      (trabajador.asignacion_familiar || 0) +
      (trabajador.movilidad || 0) +
      (trabajador.horas_extras_monto || 0) +
      (trabajador.bonificaciones || 0) +
      (trabajador.pc_2015_2016 || 0) +
      (trabajador.ra_829_2011_mdh || 0) +
      (trabajador.otras_reintegros || 0) +
      (trabajador.convenio_2022_2023 || 0) +
      (trabajador.convenio_2023_2024 || 0) +
      (trabajador.convenio_2024_2025 || 0) +
      (trabajador.homologacion || 0) +
      (trabajador.otros_ingresos || 0);
    
    // Recalcular total de descuentos (solo los editables)
    trabajador.total_descuentos = 
      (trabajador.tardanzas || 0) +
      (trabajador.faltas || 0) +
      (trabajador.otros_descuentos || 0);
    
    // Recalcular neto a pagar
    trabajador.neto_a_pagar = trabajador.total_ingresos - trabajador.total_descuentos;
  }

  getTrabajadoresEditablesFiltrados(): any[] {
    let trabajadores = [...this.trabajadoresEditables];
    
    // Filtrar por búsqueda
    if (this.busquedaEditar.trim()) {
      const busqueda = this.busquedaEditar.toLowerCase();
      trabajadores = trabajadores.filter(t => 
        t.nombre.toLowerCase().includes(busqueda) ||
        t.dni.includes(busqueda) ||
        t.cargo.toLowerCase().includes(busqueda)
      );
    }
    
    // Filtrar por régimen
    if (this.regimenFiltroEditar !== 'Todos') {
      trabajadores = trabajadores.filter(t => t.regimen_laboral === this.regimenFiltroEditar);
    }
    
    return trabajadores;
  }

  guardarCambiosPlanilla(): void {
    if (!this.planillaAEditar || this.guardandoCambios) return;
    
    // Validar que haya cambios
    const cambios = this.trabajadoresEditables.map(t => ({
      trabajadorId: t.trabajadorId,
      diasTrabajados: t.dias_trabajados,
      // Ingresos
      remuneracionBasica: t.remuneracionBasica,
      costoVida: t.costo_vida,
      asignacionFamiliar: t.asignacion_familiar,
      movilidad: t.movilidad,
      horasExtras: t.horas_extras_monto,
      bonificaciones: t.bonificaciones,
      pc_2015_2016: t.pc_2015_2016,
      ra_829_2011_mdh: t.ra_829_2011_mdh,
      otrasReintegros: t.otras_reintegros,
      convenio_2022_2023: t.convenio_2022_2023,
      convenio_2023_2024: t.convenio_2023_2024,
      convenio_2024_2025: t.convenio_2024_2025,
      homologacion: t.homologacion,
      otrosIngresos: t.otros_ingresos,
      // Descuentos
      tardanzas: t.tardanzas,
      faltas: t.faltas,
      otrosDescuentos: t.otros_descuentos
    }));
    
    this.guardandoCambios = true;
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.http.put<any>(`${this.apiPlanillas}/${this.planillaAEditar.id}/actualizar`, { cambios }, { headers }).subscribe({
      next: (response) => {
        if (response.success) {
          this.mostrarNotificacion('success', '✅ Éxito', 'Los cambios se guardaron correctamente', 3000);
          this.cerrarModalEditar();
          this.cargarHistorial(); // Recargar el historial
        } else {
          this.mostrarNotificacion('error', '❌ Error', response.message || 'Error al guardar los cambios', 3000);
          this.guardandoCambios = false;
        }
      },
      error: (error) => {
        console.error('❌ Error al guardar cambios:', error);
        this.mostrarNotificacion('error', '❌ Error', 'Error al guardar los cambios. Por favor, intente nuevamente.', 3000);
        this.guardandoCambios = false;
      }
    });
  }

  mostrarNotificacion(tipo: string, titulo: string, mensaje: string, duracion: number = 3000): void {
    // Implementación simple de notificación (puedes mejorarla después)
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion--${tipo}`;
    notificacion.innerHTML = `
      <div class="notificacion__icono">${tipo === 'success' ? '✅' : tipo === 'error' ? '❌' : tipo === 'warning' ? '⚠️' : 'ℹ️'}</div>
      <div class="notificacion__contenido">
        <div class="notificacion__titulo">${titulo}</div>
        <div class="notificacion__mensaje">${mensaje}</div>
      </div>
    `;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
      notificacion.style.opacity = '0';
      setTimeout(() => notificacion.remove(), 300);
    }, duracion);
  }

  obtenerAccionesDisponibles(planilla: PlanillaHistorial): AccionPlanilla[] {
    return this.accionesDisponibles.filter(accion => {
      switch (accion.tipo) {
        case 'aprobar':
          return planilla.estado === 'Generada';
        case 'pagar':
          return planilla.estado === 'Aprobada';
        case 'anular':
          return planilla.estado !== 'Anulada' && planilla.estado !== 'Pagada';
        case 'eliminar':
          return planilla.estado === 'Borrador' || planilla.estado === 'Anulada';
        case 'ver':
          return true;
        case 'editar':
          return planilla.estado === 'Generada';
        case 'exportar':
          return true;
        default:
          return false;
      }
    });
  }

  // Calcular totales por columna en el detalle
  calcularTotalColumna(campo: string): string {
    if (!this.planillaSeleccionada?.trabajadores) {
      return 'S/. 0.00';
    }

    const total = this.planillaSeleccionada.trabajadores.reduce((sum: number, trabajador: any) => {
      // ✅ Para AFP/ONP, sumar ambos campos
      if (campo === 'aporte_obligatorio_afp') {
        const valorAFP = trabajador.aporte_obligatorio_afp || 0;
        const valorONP = trabajador.aporte_onp || 0;
        return sum + valorAFP + valorONP;
      }
      
      const valor = trabajador[campo] || 0;
      return sum + valor;
    }, 0);

    return `S/. ${total.toFixed(2)}`;
  }

  // ✅ FUNCIONES PARA FILTROS POR REGIMEN
  aplicarFiltroRegimen(): void {
    // Esta función se ejecuta cuando cambia el filtro de régimen
    // La lógica de filtrado se maneja en el template con *ngFor
  }

  limpiarFiltroRegimen(): void {
    this.regimenFiltro = 'Todos';
  }

  getTrabajadoresFiltrados(): any[] {
    if (!this.planillaSeleccionada?.trabajadores) {
      return [];
    }

    let trabajadores = [...this.planillaSeleccionada.trabajadores];
    
    // Filtro por búsqueda
    if (this.busquedaTrabajador) {
      const busqueda = this.busquedaTrabajador.toLowerCase();
      trabajadores = trabajadores.filter(t => 
        t.nombre?.toLowerCase().includes(busqueda) ||
        t.dni?.includes(busqueda) ||
        t.cargo?.toLowerCase().includes(busqueda) ||
        t.area?.toLowerCase().includes(busqueda)
      );
    }
    
    // Filtro por régimen
    if (this.regimenFiltro && this.regimenFiltro !== 'Todos') {
      trabajadores = trabajadores.filter(trabajador => {
        const regimenTrabajador = trabajador.regimen_laboral || trabajador.regimen_laboral_nombre || 'Sin Régimen';
        // Comparar directamente con el nombre del régimen seleccionado
        return regimenTrabajador === this.regimenFiltro || 
               regimenTrabajador.toUpperCase().includes(this.regimenFiltro.toUpperCase()) ||
               this.regimenFiltro.toUpperCase().includes(regimenTrabajador.toUpperCase());
      });
    }

    return trabajadores;
  }
  
  getRegimenesUnicos(): string[] {
    // Si estamos en el modal de edición, usar trabajadoresEditables
    if (this.mostrarModalEditar && this.trabajadoresEditables.length > 0) {
      const regimenes = new Set<string>();
      this.trabajadoresEditables.forEach(t => {
        const regimen = t.regimen_laboral || 'Sin Régimen';
        if (regimen && regimen !== 'N/A') {
          regimenes.add(regimen);
        }
      });
      return Array.from(regimenes).sort();
    }
    
    // Si estamos en el modal de detalle, usar planillaSeleccionada
    if (!this.planillaSeleccionada?.trabajadores) {
      return [];
    }
    
    const regimenes = new Set<string>();
    this.planillaSeleccionada.trabajadores.forEach(t => {
      const regimen = t.regimen_laboral || t.regimen_laboral_nombre || 'Sin Régimen';
      if (regimen && regimen !== 'N/A') {
        // Normalizar el nombre del régimen para que coincida con lo que se muestra
        let regimenNormalizado = regimen;
        if (regimen.toUpperCase().includes('DL 1057') || regimen.toUpperCase().includes('CAS')) {
          regimenNormalizado = 'RÉGIMEN DL 1057 (CAS)';
        } else if (regimen.toUpperCase().includes('DL 276')) {
          regimenNormalizado = 'RÉGIMEN DL 276';
        } else if (regimen.toUpperCase().includes('DL 728')) {
          regimenNormalizado = 'RÉGIMEN DL 728';
        }
        regimenes.add(regimenNormalizado);
      }
    });
    
    return Array.from(regimenes).sort();
  }
  
  limpiarFiltrosTrabajadores(): void {
    this.busquedaTrabajador = '';
    this.regimenFiltro = 'Todos';
    this.onFiltroCambio();
  }
  
  onFiltroCambio(): void {
    // Sincronizar alturas después de que cambien los filtros
    setTimeout(() => {
      this.sincronizarAlturasFilas();
    }, 150);
  }

  getTrabajadoresPorRegimen(regimen: string): any[] {
    if (!this.planillaSeleccionada?.trabajadores) {
      return [];
    }

    return this.planillaSeleccionada.trabajadores.filter(trabajador => {
      const codigoRegimen = trabajador.regimen_laboral_codigo || '';
      const regimenTrabajador = trabajador.regimen_laboral || '';

      // Mapear regímenes específicos usando los códigos exactos de tu base de datos
      // PRIORIDAD: Los regímenes más específicos van primero para evitar duplicados
      switch (regimen) {
        case 'EMPLEADOS DE CONFIANZA':
          // PRIORIDAD 1: Empleados de confianza (más específico)
          return codigoRegimen === 'DL-276-CONF' || 
                 codigoRegimen === 'DL-728-CONF' ||
                 codigoRegimen === 'DESIGNACION' ||
                 regimenTrabajador.toUpperCase().includes('CONFIANZA') ||
                 regimenTrabajador.toUpperCase().includes('EMPLEADO DE CONFIANZA');
        
        case 'OBREROS':
          // PRIORIDAD 2: Obreros (más específico)
          return codigoRegimen === 'DL-728-OBRERO' || 
                 codigoRegimen === 'DL-1153' ||
                 regimenTrabajador.toUpperCase().includes('OBRERO') ||
                 regimenTrabajador.toUpperCase().includes('SERENO');
        
        case 'CAS':
          // PRIORIDAD 3: CAS (más específico)
          return codigoRegimen === 'DL-1057' || 
                 codigoRegimen === 'LEY-31131' || 
                 codigoRegimen === 'LEY-29849' ||
                 regimenTrabajador.toUpperCase().includes('CAS') ||
                 regimenTrabajador.toUpperCase().includes('1057');
        
        case 'D.L. 276':
          // PRIORIDAD 4: D.L. 276 (solo los que NO son de confianza)
          return codigoRegimen === 'DL-276' && !codigoRegimen.includes('CONF');
        
        case 'D.L. 728':
          // PRIORIDAD 5: D.L. 728 (solo los que NO son de confianza ni obreros)
          return codigoRegimen === 'DL-728' && 
                 !codigoRegimen.includes('CONF') && 
                 !codigoRegimen.includes('OBRERO');
        
        case 'D.L. 1024':
          return codigoRegimen === 'DL-1024' ||
                 regimenTrabajador.toUpperCase().includes('1024') ||
                 regimenTrabajador.toUpperCase().includes('D.L. 1024');
        
        case 'SERVIR':
          return codigoRegimen === 'LEY-30057' ||
                 regimenTrabajador.toUpperCase().includes('SERVIR') ||
                 regimenTrabajador.toUpperCase().includes('30057');
        
        case 'LOCACIÓN DE SERVICIOS':
          return codigoRegimen === 'LOCACION' || 
                 codigoRegimen === 'CONSULTORIA' ||
                 regimenTrabajador.toUpperCase().includes('LOCACION') ||
                 regimenTrabajador.toUpperCase().includes('SERVICIOS');
        
        default:
          return false;
      }
    });
  }

  getResumenPorRegimen(): any[] {
    if (!this.planillaSeleccionada?.trabajadores) {
      return [];
    }

    const regimenes = [
      { nombre: 'CAS', icono: '📋', codigo: 'CAS' },
      { nombre: 'D.L. 728', icono: '🏛️', codigo: 'D.L. 728' },
      { nombre: 'D.L. 276', icono: '⚖️', codigo: 'D.L. 276' },
      { nombre: 'D.L. 1024', icono: '🏢', codigo: 'D.L. 1024' },
      { nombre: 'EMPLEADOS DE CONFIANZA', icono: '👔', codigo: 'EMPLEADOS DE CONFIANZA' },
      { nombre: 'OBREROS', icono: '🔨', codigo: 'OBREROS' },
      { nombre: 'SERVIR', icono: '🎖️', codigo: 'SERVIR' },
      { nombre: 'LOCACIÓN DE SERVICIOS', icono: '📄', codigo: 'LOCACIÓN DE SERVICIOS' }
    ];

    return regimenes.map(regimen => {
      const trabajadores = this.getTrabajadoresPorRegimen(regimen.codigo);
      
      const totalIngresos = trabajadores.reduce((sum, t) => sum + (t.total_ingresos || 0), 0);
      const totalDescuentos = trabajadores.reduce((sum, t) => sum + (t.total_descuentos || 0), 0);
      const totalNeto = trabajadores.reduce((sum, t) => sum + (t.neto_a_pagar || 0), 0);

      return {
        ...regimen,
        trabajadores: trabajadores.length,
        totalIngresos: totalIngresos.toFixed(2),
        totalDescuentos: totalDescuentos.toFixed(2),
        totalNeto: totalNeto.toFixed(2)
      };
    }).filter(regimen => regimen.trabajadores > 0);
  }

  getRegimenBadgeClass(regimen: string): string {
    if (!regimen) return 'regimen-badge--default';
    
    const regimenUpper = regimen.toUpperCase();
    
    if (regimenUpper.includes('CAS')) return 'regimen-badge--cas';
    if (regimenUpper.includes('728')) return 'regimen-badge--dl728';
    if (regimenUpper.includes('276')) return 'regimen-badge--dl276';
    if (regimenUpper.includes('1024')) return 'regimen-badge--dl1024';
    if (regimenUpper.includes('CONFIANZA')) return 'regimen-badge--confianza';
    if (regimenUpper.includes('OBRERO')) return 'regimen-badge--obrero';
    if (regimenUpper.includes('SERVIR')) return 'regimen-badge--servir';
    if (regimenUpper.includes('LOCACION') || regimenUpper.includes('SERVICIOS')) return 'regimen-badge--locacion';
    
    return 'regimen-badge--default';
  }

  // ✅ FUNCIONES PARA PESTAÑAS DE EXCEL
  tabRegimenActual: number = 0;

  seleccionarRegimen(codigoRegimen: string): void {
    this.regimenFiltro = codigoRegimen;
    this.aplicarFiltroRegimen();
  }

  cambiarTabRegimen(direccion: number): void {
    const regimenes = this.getResumenPorRegimen();
    const nuevoIndex = this.tabRegimenActual + direccion;
    
    if (nuevoIndex >= 0 && nuevoIndex < regimenes.length) {
      this.tabRegimenActual = nuevoIndex;
      this.regimenFiltro = regimenes[nuevoIndex].codigo;
      this.aplicarFiltroRegimen();
    }
  }

  getRegimenTabClass(codigoRegimen: string): string {
    switch (codigoRegimen) {
      case 'CAS': return 'cas';
      case 'D.L. 728': return 'dl728';
      case 'D.L. 276': return 'dl276';
      case 'D.L. 1024': return 'dl1024';
      case 'EMPLEADOS DE CONFIANZA': return 'confianza';
      case 'OBREROS': return 'obreros';
      case 'SERVIR': return 'servir';
      case 'LOCACIÓN DE SERVICIOS': return 'locacion';
      default: return 'default';
    }
  }

  getRegimenSeleccionado(): any {
    if (!this.regimenFiltro) {
      // Si no hay filtro, mostrar totales generales
      const trabajadores = this.planillaSeleccionada?.trabajadores || [];
      const totalIngresos = trabajadores.reduce((sum, t) => sum + (t.total_ingresos || 0), 0);
      const totalDescuentos = trabajadores.reduce((sum, t) => sum + (t.total_descuentos || 0), 0);
      const totalNeto = trabajadores.reduce((sum, t) => sum + (t.neto_a_pagar || 0), 0);
      
      return {
        trabajadores: trabajadores.length,
        totalIngresos: totalIngresos.toFixed(2),
        totalDescuentos: totalDescuentos.toFixed(2),
        totalNeto: totalNeto.toFixed(2)
      };
    }

    return this.getResumenPorRegimen().find(r => r.codigo === this.regimenFiltro);
  }
}