import { Component, OnInit, ChangeDetectorRef, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Trabajador, FiltrosTrabajador, OrdenTrabajador } from '../trabajador.interface';
import { TrabajadorDetalleComponent } from './detalle/trabajador-detalle.component';
import { environment } from '../../../environments/environment';
import * as XLSX from 'xlsx';
import { trigger, state, style, transition, animate } from '@angular/animations';
// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-lista',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    TrabajadorDetalleComponent,
    TableModule,
    ButtonModule,
    CheckboxModule,
    TagModule,
    TooltipModule
  ],
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideInDown', [
      transition(':enter', [
        style({ transform: 'translateY(-50px)', opacity: 0 }),
        animate('400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
                style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', 
                style({ transform: 'translateY(-30px)', opacity: 0 }))
      ])
    ])
  ]
})
export class ListaComponent implements OnInit {
  Math = Math;
  
  private apiUrl = `${environment.apiUrl}/trabajadores`;
  
  trabajadores: Trabajador[] = [];
  trabajadoresFiltrados: Trabajador[] = [];
  
  filtros: FiltrosTrabajador = {
    busqueda: '',
    area: '',
    cargo: '',
    tipoContrato: '',
    estado: '',
    gerencia: ''
  };
  
  ordenActual: OrdenTrabajador = 'nombreCompleto';
  ordenAscendente: boolean = true;
  
  paginaActual: number = 1;
  itemsPorPagina: number = 20;
  totalPaginas: number = 1;
  
  cargando: boolean = false;
  mostrarFiltros: boolean = false;
  
  trabajadoresSeleccionados: number[] = [];
  todosSeleccionados: boolean = false;

  // PrimeNG Table
  trabajadoresSeleccionadosPrime: Trabajador[] = [];
  sortField: string = 'nombreCompleto';
  sortOrder: number = 1; // 1 para ascendente, -1 para descendente
  globalFilterValue: string = '';

  // MODAL de detalle
  trabajadorDetalle: Trabajador | null = null;

  // Búsqueda para trabajadores eliminados
  busquedaEliminados: string = '';

  // Vista: 'tabla' o 'tarjetas'
  vistaActual: 'tabla' | 'tarjetas' = 'tabla';

  // LISTAS PARA FILTROS
  areas: string[] = [
    'Gerencia Municipal',
    'Recursos Humanos',
    'Administración',
    'Finanzas',
    'Obras y Desarrollo',
    'Servicios Públicos',
    'Tecnología',
    'Asesoría Legal'
  ];
  
  gerencias: string[] = [
    'Gerencia Municipal',
    'Gerencia de Desarrollo Social',
    'Gerencia de Desarrollo Económico',
    'Gerencia de Infraestructura',
    'Gerencia de Servicios Públicos',
    'Gerencia de Fiscalización'
  ];
  
  tiposContrato: string[] = ['CAS', 'Nombrado', 'Locador', 'Practicante'];
  estados: string[] = ['Activo', 'Inactivo', 'Vacaciones', 'Licencia', 'Suspendido'];

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private appRef: ApplicationRef
  ) {}

  ngOnInit(): void {
    this.cargarTrabajadores();
  }

  /**
   * ========================================
   * CARGA DE DATOS
   * ========================================
   */
  cargarTrabajadores(): void {
    this.cargando = true;
    
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    console.log('🔍 Token encontrado en cargarTrabajadores:', token ? 'SÍ' : 'NO');
    
    // Crear headers con el token
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    console.log('🔐 Headers creados:', headers);
    
    this.http.get<any>(this.apiUrl, { headers }).subscribe({
      next: (response) => {
        this.cargando = false;
        
        if (response.success && response.data) {
          this.trabajadores = response.data.map((t: any) => ({
  id: t.TrabajadorID,
  dni: t.NumeroDocumento,
  nombreCompleto: `${t.ApellidoPaterno} ${t.ApellidoMaterno}, ${t.Nombres}`,
  
  // DATOS PERSONALES
  apellidoPaterno: t.ApellidoPaterno || '',
  apellidoMaterno: t.ApellidoMaterno || '',
  nombres: t.Nombres || '',
  fechaNacimiento: t.FechaNacimiento || '',
  edad: this.calcularEdad(t.FechaNacimiento),
  sexo: t.Sexo || '',
  estadoCivil: t.EstadoCivil || '',
  nacionalidad: t.Nacionalidad || 'Peruana',
  
  // CONTACTO
  celular: t.Celular || '',
  telefono: t.Telefono || '',
  email: t.Email || '',
  direccion: t.Direccion || '',
  distrito: t.Distrito || '',
  provincia: t.Provincia || '',
  departamento: t.Departamento || '',
  
  // DATOS LABORALES
  codigoTrabajador: t.Codigo || '',
  cargo: (t.CargoNombre || '').toUpperCase(),
  area: t.AreaNombre || '',
  gerencia: t.Gerencia || '',
  tipoContrato: t.TipoContratoNombre || t.TipoContrato || '',
  TipoContratoNombre: t.TipoContratoNombre,
  tipoContratoNombre: t.TipoContratoNombre,
  fechaIngreso: t.FechaIngreso || '',
  estado: t.Estado || 'Activo',
  regimenLaboral: t.RegimenLaboralNombre || t.RegimenLaboral || '',
  antiguedad: this.calcularAntiguedad(t.FechaIngreso),
  
  // CAMPOS ADICIONALES
  condicion: t.Condicion || '',
  Condicion: t.Condicion || '',
  nivel: t.Nivel || '',
  Nivel: t.Nivel || '',
  tipoPlaza: t.TipoPlaza || '',
  TipoPlaza: t.TipoPlaza || '',
  grupoOcupacional: t.GrupoOcupacional || '',
  GrupoOcupacional: t.GrupoOcupacional || '',
  
  // CONTRATO
  fechaInicioContrato: t.FechaInicioContrato || '',
  fechaFinContrato: t.FechaFinContrato || '',
  diasRestantes: this.calcularDiasRestantes(t.FechaFinContrato),
  
  // REMUNERACIÓN
  remuneracionBasica: t.SalarioBase || 0,
  salarioBase: t.SalarioBase || 0,
  asignacionFamiliar: t.AsignacionFamiliar || 0,
  AsignacionFamiliar: t.AsignacionFamiliar || 0,
  costoVida: t.CostoVida || 0,
  CostoVida: t.CostoVida || 0,
  movilidad: t.MovilidadLocal || t.Movilidad || 0,
  MovilidadLocal: t.MovilidadLocal || t.Movilidad || 0,
  horasExtras: t.HorasExtras || 0,
  HorasExtras: t.HorasExtras || 0,
  bonoProductividad: t.BonoProductividad || 0,
  BonoProductividad: t.BonoProductividad || 0,
  pc_2015_2016: t.PC_2015_2016 || 0,
  PC_2015_2016: t.PC_2015_2016 || 0,
  ra_829_2011_mdh: t.RA_829_2011_MDH || 0,
  RA_829_2011_MDH: t.RA_829_2011_MDH || 0,
  otrasReintegros: t.OtrasReintegros || 0,
  OtrasReintegros: t.OtrasReintegros || 0,
  convenio_2022_2023: t.Convenio_2022_2023 || 0,
  Convenio_2022_2023: t.Convenio_2022_2023 || 0,
  convenio_2023_2024: t.Convenio_2023_2024 || 0,
  Convenio_2023_2024: t.Convenio_2023_2024 || 0,
  convenio_2024_2025: t.Convenio_2024_2025 || 0,
  Convenio_2024_2025: t.Convenio_2024_2025 || 0,
  homologacion: t.Homologacion || 0,
  Homologacion: t.Homologacion || 0,
  otrosIngresos: t.OtrosIngresos || 0,
  OtrosIngresos: t.OtrosIngresos || 0,
  totalIngresos: (t.SalarioBase || 0) + (t.AsignacionFamiliar || 0) + (t.CostoVida || 0) + (t.MovilidadLocal || t.Movilidad || 0) + (t.HorasExtras || 0) + (t.BonoProductividad || 0) + (t.PC_2015_2016 || 0) + (t.RA_829_2011_MDH || 0) + (t.OtrasReintegros || 0) + (t.Convenio_2022_2023 || 0) + (t.Convenio_2023_2024 || 0) + (t.Convenio_2024_2025 || 0) + (t.Homologacion || 0) + (t.OtrosIngresos || 0),
  
  // PENSIONES
  sistemasPensiones: t.SistemaPension || '',
  cuspp: t.CUSPP || '',
  tieneAsignacionFamiliar: !!(t.AsignacionFamiliar && t.AsignacionFamiliar > 0),
  esSindicalizado: t.EsSindicalizado || false,
  tieneRimacSeguros: t.TieneRimacSeguros || false,
  aporteRimacSeguros: t.AporteRimacSeguros || 0,
  TieneRimacSeguros: t.TieneRimacSeguros || false,
  AporteRimacSeguros: t.AporteRimacSeguros || 0,
  tieneDescuentoJudicial: t.TieneDescuentoJudicial || false,
  montoDescuentoJudicial: t.MontoDescuentoJudicial || 0,
  numeroCuentaDescuento: t.NumeroCuentaDescuento || '',
  TieneDescuentoJudicial: t.TieneDescuentoJudicial || false,
  MontoDescuentoJudicial: t.MontoDescuentoJudicial || 0,
  NumeroCuentaDescuento: t.NumeroCuentaDescuento || '',
  numeroHijos: t.NumeroHijos || 0,
  NumeroHijos: t.NumeroHijos || 0,
  tipoComisionAFP: t.TipoComisionAFP || '',
  TipoComisionAFP: t.TipoComisionAFP || '',
  codigoEssalud: t.CodigoEssalud || '',
  CodigoEssalud: t.CodigoEssalud || '',
  
  // DATOS BANCARIOS
  banco: t.Banco || '',
  numeroCuenta: t.NumeroCuenta || '',
  cci: t.CCI || '',
  
  // DOCUMENTOS
  tieneContratoFirmado: t.TieneContratoFirmado || false,
  tieneFichaRUC: t.TieneFichaRUC || false,
  tieneDeclaracionJurada: t.TieneDeclaracionJurada || false,
  documentos: [],
  
  // AUDITORÍA
  creadoPor: t.UsuarioCreacion || '',
  fechaCreacion: t.FechaCreacion || '',
  jefeInmediato: t.JefeInmediato || ''
}));
          
          console.log('✅ Trabajadores cargados:', this.trabajadores.length);
          this.aplicarFiltros();
        } else {
          console.warn('⚠️ No se encontraron trabajadores');
          this.trabajadores = [];
          this.aplicarFiltros();
        }
      },
      error: (error) => {
        this.cargando = false;
        console.error('❌ Error al cargar trabajadores:', error);
        alert('❌ Error al cargar la lista de trabajadores. Verifica la conexión con el servidor.');
        this.trabajadores = [];
        this.aplicarFiltros();
      }
    });
  }

  /**
   * ========================================
   * FILTROS Y ORDENAMIENTO
   * ========================================
   */
  aplicarFiltros(): void {
    let resultado = [...this.trabajadores];
    
    // Sincronizar filtro global con búsqueda
    this.globalFilterValue = this.filtros.busqueda;
    
    // Filtro de búsqueda general
    if (this.filtros.busqueda) {
      const busqueda = this.filtros.busqueda.toLowerCase();
      resultado = resultado.filter(t => 
        t.nombreCompleto?.toLowerCase().includes(busqueda) ||
        t.dni?.includes(busqueda) ||
        t.codigoTrabajador?.toLowerCase().includes(busqueda) ||
        t.cargo?.toLowerCase().includes(busqueda) ||
        t.area?.toLowerCase().includes(busqueda)
      );
    }
    
    // Filtro por área
    if (this.filtros.area) {
      resultado = resultado.filter(t => t.area === this.filtros.area);
    }
    
    // Filtro por cargo
    if (this.filtros.cargo && this.filtros.cargo.trim() !== '') {
      resultado = resultado.filter(t => 
        t.cargo?.toLowerCase().includes(this.filtros.cargo!.toLowerCase())
      );
    }
    
    // Filtro por tipo de contrato
    if (this.filtros.tipoContrato) {
      resultado = resultado.filter(t => t.tipoContrato === this.filtros.tipoContrato);
    }
    
    // Filtro por estado
    if (this.filtros.estado) {
      resultado = resultado.filter(t => t.estado === this.filtros.estado);
    }
    
    // Filtro por gerencia
    if (this.filtros.gerencia) {
      resultado = resultado.filter(t => t.gerencia === this.filtros.gerencia);
    }
    
    this.trabajadoresFiltrados = resultado;
    this.ordenar();
    this.calcularPaginacion();
  }

  ordenar(): void {
    this.trabajadoresFiltrados.sort((a, b) => {
      let valorA: any = a[this.ordenActual];
      let valorB: any = b[this.ordenActual];
      
      if (typeof valorA === 'string') {
        valorA = valorA.toLowerCase();
        valorB = valorB?.toLowerCase() || '';
      }
      
      if (valorA < valorB) return this.ordenAscendente ? -1 : 1;
      if (valorA > valorB) return this.ordenAscendente ? 1 : -1;
      return 0;
    });
  }

  cambiarOrden(campo: OrdenTrabajador): void {
    if (this.ordenActual === campo) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.ordenActual = campo;
      this.ordenAscendente = true;
    }
    // Sincronizar con PrimeNG
    this.sortField = campo;
    this.sortOrder = this.ordenAscendente ? 1 : -1;
    this.ordenar();
  }
  
  onSort(event: any): void {
    this.sortField = event.field;
    this.sortOrder = event.order;
    this.ordenActual = event.field as OrdenTrabajador;
    this.ordenAscendente = event.order === 1;
    this.ordenar();
  }
  
  onSelectionChange(event: any): void {
    // PrimeNG pasa el array completo cuando se usa ngModel con múltiples checkboxes
    if (Array.isArray(event)) {
      this.trabajadoresSeleccionadosPrime = event;
      this.trabajadoresSeleccionados = event.map((t: Trabajador) => t.id);
    } else {
      // Si es un objeto individual (no debería pasar con ngModel, pero por si acaso)
      const index = this.trabajadoresSeleccionadosPrime.findIndex(t => t.id === event.id);
      if (index === -1) {
        this.trabajadoresSeleccionadosPrime = [...this.trabajadoresSeleccionadosPrime, event];
        this.trabajadoresSeleccionados.push(event.id);
      } else {
        this.trabajadoresSeleccionadosPrime = this.trabajadoresSeleccionadosPrime.filter(t => t.id !== event.id);
        this.trabajadoresSeleccionados = this.trabajadoresSeleccionados.filter(id => id !== event.id);
      }
    }
    this.actualizarTodosSeleccionados();
  }
  
  onGlobalFilter(event: any): void {
    this.globalFilterValue = event.target.value;
    this.filtros.busqueda = this.globalFilterValue;
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.filtros = {
      busqueda: '',
      area: '',
      cargo: '',
      tipoContrato: '',
      estado: '',
      gerencia: ''
    };
    this.globalFilterValue = '';
    this.aplicarFiltros();
  }

  /**
   * ========================================
   * PAGINACIÓN
   * ========================================
   */
  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.trabajadoresFiltrados.length / this.itemsPorPagina);
    if (this.paginaActual > this.totalPaginas && this.totalPaginas > 0) {
      this.paginaActual = 1;
    }
  }

  get trabajadoresPaginados(): Trabajador[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.trabajadoresFiltrados.slice(inicio, fin);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  /**
   * ========================================
   * SELECCIÓN MÚLTIPLE
   * ========================================
   */
  toggleSeleccion(id: number): void {
    const index = this.trabajadoresSeleccionados.indexOf(id);
    if (index > -1) {
      this.trabajadoresSeleccionados.splice(index, 1);
    } else {
      this.trabajadoresSeleccionados.push(id);
    }
    this.actualizarTodosSeleccionados();
  }

  toggleTodos(event?: any): void {
    // Si el evento viene del checkbox, usar su valor
    const nuevoEstado = event?.checked !== undefined ? event.checked : !this.todosSeleccionados;
    
    if (nuevoEstado) {
      // Seleccionar todos los trabajadores de la página actual
      // IMPORTANTE: Usar los mismos objetos que están en trabajadoresPaginados
      // para que PrimeNG los reconozca correctamente con ngModel
      this.trabajadoresSeleccionadosPrime = [...this.trabajadoresPaginados];
      this.trabajadoresSeleccionados = this.trabajadoresPaginados.map(t => t.id);
      this.todosSeleccionados = true;
    } else {
      // Deseleccionar todos - crear nueva referencia vacía
      this.trabajadoresSeleccionadosPrime = [];
      this.trabajadoresSeleccionados = [];
      this.todosSeleccionados = false;
    }
    
    // Forzar detección de cambios para actualizar la UI
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  actualizarTodosSeleccionados(): void {
    this.todosSeleccionados = this.trabajadoresPaginados.length > 0 &&
      this.trabajadoresPaginados.every(t => this.trabajadoresSeleccionados.includes(t.id));
    // Sincronizar con PrimeNG
    this.trabajadoresSeleccionadosPrime = this.trabajadoresPaginados.filter(t => 
      this.trabajadoresSeleccionados.includes(t.id)
    );
  }

  estaSeleccionado(id: number): boolean {
    return this.trabajadoresSeleccionados.includes(id);
  }

  estaSeleccionadoEnPrime(trabajador: Trabajador): boolean {
    // Verificar tanto por ID como por referencia del objeto para mayor seguridad
    return this.trabajadoresSeleccionadosPrime.some(t => 
      t.id === trabajador.id || t === trabajador
    );
  }

  toggleSeleccionPrime(event: any, trabajador: Trabajador): void {
    const checked = event.checked;
    
    if (checked) {
      // Agregar a la selección si no está
      if (!this.estaSeleccionadoEnPrime(trabajador)) {
        this.trabajadoresSeleccionadosPrime = [...this.trabajadoresSeleccionadosPrime, trabajador];
        if (!this.trabajadoresSeleccionados.includes(trabajador.id)) {
          this.trabajadoresSeleccionados.push(trabajador.id);
        }
      }
    } else {
      // Remover de la selección
      this.trabajadoresSeleccionadosPrime = this.trabajadoresSeleccionadosPrime.filter(t => t.id !== trabajador.id);
      this.trabajadoresSeleccionados = this.trabajadoresSeleccionados.filter(id => id !== trabajador.id);
    }
    this.actualizarTodosSeleccionados();
    this.cdr.detectChanges();
  }

  /**
   * ========================================
   * MODAL DETALLE
   * ========================================
   */
  verDetalle(trabajador: Trabajador): void {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    // Recargar los datos frescos del trabajador desde el backend
    this.http.get<any>(`${environment.apiUrl}/trabajadores/${trabajador.id}`, { headers }).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('📦 Datos recibidos del backend para trabajador:', response.data);
          console.log('🔍 Campos específicos:', {
            NumeroHijos: response.data.NumeroHijos,
            TipoComisionAFP: response.data.TipoComisionAFP,
            CodigoEssalud: response.data.CodigoEssalud,
            Nivel: response.data.Nivel
          });
          // Actualizar con los datos más recientes
          this.trabajadorDetalle = this.mapearTrabajadorBackend(response.data);
          console.log('✅ Trabajador mapeado:', {
            NumeroHijos: this.trabajadorDetalle?.NumeroHijos,
            numeroHijos: this.trabajadorDetalle?.numeroHijos,
            TipoComisionAFP: this.trabajadorDetalle?.TipoComisionAFP,
            tipoComisionAFP: this.trabajadorDetalle?.tipoComisionAFP,
            CodigoEssalud: this.trabajadorDetalle?.CodigoEssalud,
            codigoEssalud: this.trabajadorDetalle?.codigoEssalud,
            Nivel: this.trabajadorDetalle?.Nivel,
            nivel: this.trabajadorDetalle?.nivel
          });
        } else {
          this.trabajadorDetalle = trabajador;
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar trabajador:', error);
        // Si hay error, usar los datos que ya tenemos
        this.trabajadorDetalle = trabajador;
      }
    });
  }

  /**
   * Mapea los datos del backend (PascalCase) al formato del frontend
   */
  private mapearTrabajadorBackend(data: any): Trabajador {
    return {
      id: data.TrabajadorID,
      dni: data.NumeroDocumento,
      codigoTrabajador: data.Codigo,
      apellidoPaterno: data.ApellidoPaterno,
      apellidoMaterno: data.ApellidoMaterno,
      nombres: data.Nombres,
      nombreCompleto: `${data.ApellidoPaterno} ${data.ApellidoMaterno}, ${data.Nombres}`,
      fechaNacimiento: data.FechaNacimiento,
      edad: this.calcularEdad(data.FechaNacimiento),
      sexo: data.Sexo,
      estadoCivil: data.EstadoCivil,
      telefono: data.Telefono,
      celular: data.Celular,
      email: data.Email,
      direccion: data.Direccion,
      distrito: data.Distrito,
      provincia: data.Provincia,
      departamento: data.Departamento,
      cargo: data.CargoNombre || data.Cargo,
      area: data.AreaNombre || data.Area,
      gerencia: data.GerenciaNombre || data.Gerencia,
      tipoContrato: data.TipoContratoNombre || data.TipoContrato,
      TipoContratoNombre: data.TipoContratoNombre,
      regimenLaboral: data.RegimenLaboralNombre || data.RegimenLaboral,
      RegimenLaboralNombre: data.RegimenLaboralNombre,
      fechaIngreso: data.FechaIngreso,
      fechaInicioContrato: data.FechaInicioContrato,
      fechaFinContrato: data.FechaFinContrato,
      estado: data.Estado,
      Condicion: data.Condicion,
      condicion: data.Condicion,
      Nivel: data.Nivel,
      nivel: data.Nivel,
      TipoPlaza: data.TipoPlaza,
      tipoPlaza: data.TipoPlaza,
      GrupoOcupacional: data.GrupoOcupacional,
      grupoOcupacional: data.GrupoOcupacional,
      Nacionalidad: data.Nacionalidad,
      nacionalidad: data.Nacionalidad,
      remuneracionBasica: data.SalarioBase || 0,
      salarioBase: data.SalarioBase || 0,
      asignacionFamiliar: data.AsignacionFamiliar || 0,
      AsignacionFamiliar: data.AsignacionFamiliar || 0,
      costoVida: data.CostoVida || 0,
      CostoVida: data.CostoVida || 0,
      movilidad: data.MovilidadLocal || data.Movilidad || 0,
      MovilidadLocal: data.MovilidadLocal || data.Movilidad || 0,
      horasExtras: data.HorasExtras || 0,
      HorasExtras: data.HorasExtras || 0,
      bonoProductividad: data.BonoProductividad || 0,
      BonoProductividad: data.BonoProductividad || 0,
      pc_2015_2016: data.PC_2015_2016 || 0,
      PC_2015_2016: data.PC_2015_2016 || 0,
      ra_829_2011_mdh: data.RA_829_2011_MDH || 0,
      RA_829_2011_MDH: data.RA_829_2011_MDH || 0,
      otrasReintegros: data.OtrasReintegros || 0,
      OtrasReintegros: data.OtrasReintegros || 0,
      convenio_2022_2023: data.Convenio_2022_2023 || 0,
      Convenio_2022_2023: data.Convenio_2022_2023 || 0,
      convenio_2023_2024: data.Convenio_2023_2024 || 0,
      Convenio_2023_2024: data.Convenio_2023_2024 || 0,
      convenio_2024_2025: data.Convenio_2024_2025 || 0,
      Convenio_2024_2025: data.Convenio_2024_2025 || 0,
      homologacion: data.Homologacion || 0,
      Homologacion: data.Homologacion || 0,
      otrosIngresos: data.OtrosIngresos || 0,
      OtrosIngresos: data.OtrosIngresos || 0,
      totalIngresos: (data.SalarioBase || 0) + (data.AsignacionFamiliar || 0) + (data.CostoVida || 0) + (data.MovilidadLocal || data.Movilidad || 0) + (data.HorasExtras || 0) + (data.BonoProductividad || 0) + (data.PC_2015_2016 || 0) + (data.RA_829_2011_MDH || 0) + (data.OtrasReintegros || 0) + (data.Convenio_2022_2023 || 0) + (data.Convenio_2023_2024 || 0) + (data.Convenio_2024_2025 || 0) + (data.Homologacion || 0) + (data.OtrosIngresos || 0),
      sistemasPensiones: data.SistemaPension,
      cuspp: data.CUSPP,
      CUSPP: data.CUSPP,
      tieneAsignacionFamiliar: data.AsignacionFamiliar > 0,
      esSindicalizado: data.EsSindicalizado,
      numeroHijos: data.NumeroHijos || 0,
      NumeroHijos: data.NumeroHijos || 0,
      tipoComisionAFP: data.TipoComisionAFP || '',
      TipoComisionAFP: data.TipoComisionAFP || '',
      codigoEssalud: data.CodigoEssalud || '',
      CodigoEssalud: data.CodigoEssalud || '',
      tieneRimacSeguros: data.TieneRimacSeguros || false,
      aporteRimacSeguros: data.AporteRimacSeguros || 0,
      TieneRimacSeguros: data.TieneRimacSeguros || false,
      AporteRimacSeguros: data.AporteRimacSeguros || 0,
      tieneDescuentoJudicial: data.TieneDescuentoJudicial || false,
      montoDescuentoJudicial: data.MontoDescuentoJudicial || 0,
      numeroCuentaDescuento: data.NumeroCuentaDescuento || '',
      TieneDescuentoJudicial: data.TieneDescuentoJudicial || false,
      MontoDescuentoJudicial: data.MontoDescuentoJudicial || 0,
      NumeroCuentaDescuento: data.NumeroCuentaDescuento || '',
      banco: data.Banco,
      numeroCuenta: data.NumeroCuenta,
      cci: data.CCI,
      tieneContratoFirmado: data.TieneContratoFirmado,
      tieneFichaRUC: data.TieneFichaRUC,
      tieneDeclaracionJurada: data.TieneDeclaracionJurada,
      creadoPor: data.UsuarioCreacion,
      fechaCreacion: data.FechaCreacion,
      modificadoPor: data.UsuarioActualizacion,
      fechaModificacion: data.FechaActualizacion
    } as Trabajador;
  }

  cerrarDetalle(): void {
    this.trabajadorDetalle = null;
  }

  editarTrabajadorDesdeDetalle(trabajador: Trabajador): void {
    // Guardar el ID del trabajador que estamos viendo
    const trabajadorId = trabajador.id;
    // Cerrar el modal
    this.cerrarDetalle();
    // Navegar a editar
    this.router.navigate(['/trabajadores/editar', trabajadorId]);
  }

  /**
   * ========================================
   * TRABAJADORES ELIMINADOS
   * ========================================
   */
  trabajadoresEliminados: Trabajador[] = [];
  mostrarModalEliminados = false;
  
  // Modal de confirmación para restaurar trabajador
  mostrarModalConfirmarRestaurar: boolean = false;
  trabajadorARestaurar: any = null;
  
  // Modal de éxito al restaurar trabajador
  mostrarModalExitoRestaurar: boolean = false;
  restaurandoTrabajador: boolean = false;
  trabajadorRestauradoCompletado: boolean = false;
  nombreTrabajadorRestaurado: string = '';
  
  // Modal de eliminación definitiva
  mostrarModalEliminacionDefinitiva = false;
  trabajadorAEliminar: any = null;
  confirmacionTexto = '';
  eliminando = false;
  
  // Modal de confirmación para eliminar trabajador (soft delete)
  mostrarModalConfirmarEliminar: boolean = false;
  trabajadorAEliminarConfirmar: Trabajador | null = null;
  eliminandoTrabajador: boolean = false;
  
  // Modal de éxito al eliminar trabajador
  mostrarModalExitoEliminar: boolean = false;
  eliminandoTrabajadorProceso: boolean = false;
  trabajadorEliminadoCompletado: boolean = false;
  nombreTrabajadorEliminado: string = '';
  
  // Modal de éxito al eliminar definitivamente
  mostrarModalExitoEliminarDefinitivo: boolean = false;
  eliminandoDefinitivoProceso: boolean = false;
  trabajadorEliminadoDefinitivoCompletado: boolean = false;

  verEliminados(): void {
    this.mostrarModalEliminados = true;
    this.cargarTrabajadoresEliminados();
  }

  cargarTrabajadoresEliminados(): void {
    this.cargando = true;
    
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.http.get<{ success: boolean; data: Trabajador[] }>(`${this.apiUrl}/inactivos`, { headers })
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.trabajadoresEliminados = response.data;
            console.log('✅ Trabajadores eliminados cargados:', this.trabajadoresEliminados.length);
          }
          this.cargando = false;
        },
        error: (error) => {
          console.error('❌ Error al cargar trabajadores eliminados:', error);
          this.cargando = false;
        }
      });
  }

  restaurarTrabajador(id: number): void {
    // Buscar el trabajador en la lista de eliminados
    const trabajador = this.trabajadoresEliminados.find(t => 
      (t as any).TrabajadorID === id || 
      (t as any).trabajadorId === id || 
      (t as any).id === id
    );
    
    if (!trabajador) {
      alert('❌ Trabajador no encontrado');
      return;
    }
    
    // Mostrar modal de confirmación
    this.trabajadorARestaurar = trabajador;
    this.mostrarModalConfirmarRestaurar = true;
  }
  
  confirmarRestaurarTrabajador(): void {
    if (!this.trabajadorARestaurar) return;
    
    const id = (this.trabajadorARestaurar as any).TrabajadorID || 
               (this.trabajadorARestaurar as any).trabajadorId || 
               (this.trabajadorARestaurar as any).id;
    
    if (!id) {
      alert('❌ ID de trabajador no válido');
      return;
    }
    
    // Cerrar modal de confirmación
    this.mostrarModalConfirmarRestaurar = false;
    
    // Mostrar modal de éxito con spinner
    this.nombreTrabajadorRestaurado = this.getNombreCompleto(this.trabajadorARestaurar);
    this.mostrarModalExitoRestaurar = true;
    this.restaurandoTrabajador = true;
    this.trabajadorRestauradoCompletado = false;
    
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.http.put(`${this.apiUrl}/${id}/restaurar`, {}, { headers })
      .subscribe({
        next: () => {
          // Cambiar a estado de éxito (check verde)
          this.restaurandoTrabajador = false;
          this.trabajadorRestauradoCompletado = true;
          
          // Cerrar modal y recargar después de mostrar el checkmark
          setTimeout(() => {
            this.cerrarModalExitoRestaurar();
            this.cargarTrabajadoresEliminados();
            this.cargarTrabajadores();
            window.dispatchEvent(new CustomEvent('trabajador-restaurado'));
          }, 2000);
        },
        error: (error) => {
          this.restaurandoTrabajador = false;
          this.mostrarModalExitoRestaurar = false;
          console.error('❌ Error al restaurar trabajador:', error);
          alert('❌ Error al restaurar trabajador: ' + (error.error?.message || 'Error de conexión'));
        }
      });
  }
  
  cancelarRestaurarTrabajador(): void {
    this.mostrarModalConfirmarRestaurar = false;
    this.trabajadorARestaurar = null;
  }
  
  cerrarModalExitoRestaurar(): void {
    this.mostrarModalExitoRestaurar = false;
    this.restaurandoTrabajador = false;
    this.trabajadorRestauradoCompletado = false;
    this.nombreTrabajadorRestaurado = '';
    this.trabajadorARestaurar = null;
  }

  eliminarDefinitivoTrabajador(id: number, trabajador: any): void {
    this.trabajadorAEliminar = { id, ...trabajador };
    this.confirmacionTexto = '';
    this.mostrarModalEliminacionDefinitiva = true;
  }

  confirmarEliminacionDefinitiva(): void {
    if (this.confirmacionTexto !== 'ELIMINAR') {
      alert('❌ Debe escribir exactamente "ELIMINAR" para confirmar');
      return;
    }

    this.eliminando = true;
    
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.http.delete(`${this.apiUrl}/${this.trabajadorAEliminar.id}/eliminar-definitivo`, { headers })
      .subscribe({
        next: () => {
          // Cerrar modal de confirmación
          this.cerrarModalEliminacionDefinitiva();
          
          // Mostrar modal de éxito con animación
          this.mostrarModalExitoEliminarDefinitivo = true;
          this.eliminandoDefinitivoProceso = true;
          this.trabajadorEliminadoDefinitivoCompletado = false;
          
          // Simular proceso de eliminación
          setTimeout(() => {
            this.eliminandoDefinitivoProceso = false;
            this.trabajadorEliminadoDefinitivoCompletado = true;
            
            // Cerrar automáticamente después de mostrar el checkmark
            setTimeout(() => {
              this.cerrarModalExitoEliminarDefinitivo();
              this.cargarTrabajadoresEliminados();
              this.cargarTrabajadores();
              // Notificar al dashboard para que se actualice
              window.dispatchEvent(new CustomEvent('trabajador-eliminado'));
            }, 2000);
          }, 1500);
        },
        error: (error) => {
          console.error('❌ Error al eliminar trabajador definitivamente:', error);
          alert('❌ Error al eliminar el trabajador definitivamente');
          this.eliminando = false;
        }
      });
  }

  cerrarModalEliminacionDefinitiva(): void {
    this.mostrarModalEliminacionDefinitiva = false;
    this.trabajadorAEliminar = null;
    this.confirmacionTexto = '';
    this.eliminando = false;
  }
  
  cerrarModalExitoEliminarDefinitivo(): void {
    this.mostrarModalExitoEliminarDefinitivo = false;
    this.eliminandoDefinitivoProceso = false;
    this.trabajadorEliminadoDefinitivoCompletado = false;
  }

  getNombreCompleto(trabajador: any): string {
    return `${trabajador.ApellidoPaterno || trabajador.apellidoPaterno || ''} ${trabajador.ApellidoMaterno || trabajador.apellidoMaterno || ''} ${trabajador.Nombres || trabajador.nombres || ''}`.trim();
  }

  cerrarModalEliminados(): void {
    this.mostrarModalEliminados = false;
  }

  /**
   * ========================================
   * EXPORTACIONES
   * ========================================
   */
  exportarExcel(): void {
    try {
      // Preparar datos para Excel
      const datosExcel = this.trabajadoresFiltrados.map(t => ({
        'DNI': t.dni,
        'Código': t.codigoTrabajador,
        'Apellido Paterno': t.apellidoPaterno,
        'Apellido Materno': t.apellidoMaterno,
        'Nombres': t.nombres,
        'Cargo': t.cargo,
        'Área': t.area,
        'Tipo Contrato': t.tipoContrato,
        'Estado': t.estado,
        'Fecha Ingreso': t.fechaIngreso,
        'Remuneración': t.remuneracionBasica,
        'Celular': t.celular,
        'Email': t.email,
        'Direccion': t.direccion,
        'Distrito': t.distrito,
        'Provincia': t.provincia,
        'Departamento': t.departamento,
        'Gerencia': t.gerencia,
        'Regimen Laboral': t.regimenLaboral,
        'Fecha Inicio Contrato': t.fechaInicioContrato,
        'Fecha Fin Contrato': t.fechaFinContrato,
        'Dias Restantes': t.diasRestantes,
      }));

      // Crear libro de Excel
      const ws = XLSX.utils.json_to_sheet(datosExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Trabajadores');

      // Descargar archivo
      const fecha = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `Trabajadores_${fecha}.xlsx`);

      console.log('✅ Excel generado exitosamente');
    } catch (error) {
      console.error('❌ Error al generar Excel:', error);
      alert('Error al generar el archivo Excel');
    }
  }

  exportarPDF(): void {
    try {
      // Crear contenido HTML para imprimir
      const contenido = this.generarContenidoPDF();
      
      // Abrir ventana de impresión
      const ventana = window.open('', '_blank');
      if (ventana) {
        ventana.document.write(contenido);
        ventana.document.close();
        ventana.print();
      }
    } catch (error) {
      console.error('❌ Error al generar PDF:', error);
      alert('Error al generar el PDF');
    }
  }

  private generarContenidoPDF(): string {
    const fecha = new Date().toLocaleDateString('es-PE');
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Lista de Trabajadores</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #22c55e; text-align: center; }
          .info { text-align: center; margin-bottom: 20px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
          th { background: #22c55e; color: white; padding: 8px; text-align: left; }
          td { border: 1px solid #ddd; padding: 6px; }
          tr:nth-child(even) { background: #f9f9f9; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; }
        </style>
      </head>
      <body>
        <h1>🏛️ MUNICIPALIDAD DE HUANCHACO</h1>
        <div class="info">
          <strong>Lista de Trabajadores</strong><br>
          Fecha: ${fecha} | Total: ${this.trabajadoresFiltrados.length} trabajadores
        </div>
        <table>
          <thead>
            <tr>
              <th>DNI</th>
              <th>Código</th>
              <th>Apellidos y Nombres</th>
              <th>Cargo</th>
              <th>Área</th>
              <th>Tipo Contrato</th>
              <th>Estado</th>
              <th>Remuneración</th>
            </tr>
          </thead>
          <tbody>
    `;

    this.trabajadoresFiltrados.forEach(t => {
      html += `
        <tr>
          <td>${t.dni}</td>
          <td>${t.codigoTrabajador}</td>
          <td>${t.nombreCompleto}</td>
              <td>${t.cargo || 'N/A'}</td>
          <td>${t.area}</td>
          <td>${t.tipoContrato}</td>
          <td>${t.estado}</td>
          <td>${this.formatearMoneda(t.remuneracionBasica)}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
        <div class="footer">
          Generado el ${fecha} - Sistema de Gestión de Planillas
        </div>
      </body>
      </html>
    `;

    return html;
  }

  /**
   * ========================================
   * ACCIONES CRUD
   * ========================================
   */
  nuevoTrabajador(): void {
    this.router.navigate(['/trabajadores/nuevo']);
  }

  editarTrabajador(trabajador: Trabajador): void {
    this.router.navigate(['/trabajadores/editar', trabajador.id]);
  }

  eliminarTrabajador(trabajador: Trabajador): void {
    const confirmar = confirm(`¿Está seguro de eliminar a ${trabajador.nombreCompleto}?\n\nEsta acción no se puede deshacer.`);
    
    if (confirmar) {
      this.trabajadorAEliminarConfirmar = trabajador;
      this.confirmarEliminarTrabajador();
    }
  }
  
  confirmarEliminarTrabajador(): void {
    if (!this.trabajadorAEliminarConfirmar) return;
    
    this.eliminandoTrabajador = true;
    
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.http.delete<any>(`${this.apiUrl}/${this.trabajadorAEliminarConfirmar.id}`, { headers }).subscribe({
      next: (response) => {
        this.eliminandoTrabajador = false;
        
        if (response.success) {
          // Recargar trabajadores inmediatamente
          this.cargarTrabajadores();
          // Notificar al dashboard para que se actualice
          window.dispatchEvent(new CustomEvent('trabajador-eliminado'));
        } else {
          alert('❌ No se pudo eliminar el trabajador: ' + response.message);
        }
      },
      error: (error) => {
        this.eliminandoTrabajador = false;
        console.error('❌ Error al eliminar:', error);
        alert('❌ Error al eliminar trabajador: ' + (error.error?.message || 'Error de conexión'));
      }
    });
  }
  
  cerrarModalExitoEliminar(): void {
    this.mostrarModalExitoEliminar = false;
    this.eliminandoTrabajadorProceso = false;
    this.trabajadorEliminadoCompletado = false;
    this.nombreTrabajadorEliminado = '';
    this.trabajadorAEliminarConfirmar = null;
  }

  /**
   * ========================================
   * UTILIDADES
   * ========================================
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

  getContratoBadgeClass(diasRestantes: number): string {
    if (diasRestantes <= 30) return 'badge--danger';
    if (diasRestantes <= 90) return 'badge--warn';
    return 'badge--ok';
  }

  formatearMoneda(monto: number): string {
    if (!monto) return 'S/. 0.00';
    return `S/. ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Formatea el cargo removiendo el prefijo "CARGO -" solo para la vista de lista
   */
  formatearCargoParaLista(cargo: string | undefined): string {
    if (!cargo) return 'N/A';
    
    // Remover el prefijo "CARGO -" si existe (case insensitive)
    const cargoFormateado = cargo.replace(/^CARGO\s*-\s*/i, '').trim();
    
    return cargoFormateado || 'N/A';
  }

  /**
   * Formatea el tipo de contrato removiendo el prefijo "T-C" solo para la vista de lista
   */
  formatearTipoContratoParaLista(tipoContrato: string | undefined): string {
    if (!tipoContrato) return 'N/A';
    
    // Remover el prefijo "T-C" si existe (puede estar con o sin espacios)
    const contratoFormateado = tipoContrato.replace(/^T-C\s+/i, '').trim();
    
    return contratoFormateado || 'N/A';
  }

  calcularEdad(fechaNacimiento: string | undefined): number {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const nac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  }

  calcularDiasRestantes(fechaFinContrato: string | undefined): number {
    if (!fechaFinContrato) return 0;
    const hoy = new Date();
    const fin = new Date(fechaFinContrato);
    const diff = fin.getTime() - hoy.getTime();
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
  }

  calcularAntiguedad(fechaIngreso: string | undefined): string {
    if (!fechaIngreso) return '0 años';
    
    const hoy = new Date();
    const ingreso = new Date(fechaIngreso);
    
    let años = hoy.getFullYear() - ingreso.getFullYear();
    let meses = hoy.getMonth() - ingreso.getMonth();
    
    if (meses < 0) {
      años--;
      meses += 12;
    }
    
    if (años === 0) {
      return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    } else if (meses === 0) {
      return `${años} ${años === 1 ? 'año' : 'años'}`;
    } else {
      return `${años} ${años === 1 ? 'año' : 'años'}, ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    }
  }

  /**
   * ========================================
   * NUEVOS MÉTODOS PARA MODAL DE ELIMINADOS
   * ========================================
   */
  
  // Filtrar trabajadores eliminados por búsqueda
  trabajadoresEliminadosFiltrados(): any[] {
    if (!this.busquedaEliminados.trim()) {
      return this.trabajadoresEliminados;
    }

    const busqueda = this.busquedaEliminados.toLowerCase();
    return this.trabajadoresEliminados.filter((t: any) => {
      const nombre = `${t.nombres || t.Nombres || ''} ${t.apellidoPaterno || t.ApellidoPaterno || ''} ${t.apellidoMaterno || t.ApellidoMaterno || ''}`.toLowerCase();
      const dni = (t.dni || t.NumeroDocumento || '').toString().toLowerCase();
      const codigo = (t.codigoTrabajador || t.Codigo || '').toLowerCase();
      
      return nombre.includes(busqueda) || dni.includes(busqueda) || codigo.includes(busqueda);
    });
  }

  // Obtener iniciales para el avatar
  obtenerIniciales(nombre: string | undefined, apellido: string | undefined): string {
    const inicial1 = nombre?.charAt(0).toUpperCase() || '?';
    const inicial2 = apellido?.charAt(0).toUpperCase() || '?';
    return `${inicial1}${inicial2}`;
  }

  // Cambiar vista entre tabla y tarjetas
  cambiarVista(vista: 'tabla' | 'tarjetas'): void {
    this.vistaActual = vista;
  }

  // Obtener color del avatar basado en el nombre (para consistencia)
  obtenerColorAvatar(nombre: string | undefined): string {
    const colores = [
      'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)'
    ];
    const nombreStr = nombre || 'Usuario';
    const hash = nombreStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colores[hash % colores.length];
  }
}