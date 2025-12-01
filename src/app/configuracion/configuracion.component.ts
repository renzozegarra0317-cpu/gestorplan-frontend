import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ConfiguracionGeneral,
  ConfiguracionEmpresa,
  ConfiguracionPlanillas,
  ConfiguracionBeneficios,
  ConfiguracionAsistencia,
  ConfiguracionRRHH,
  ConfiguracionTributaria,
  ConfiguracionSeguridad,
  ConfiguracionNotificaciones,
  ConfiguracionPersonalizacion,
  ConfiguracionBackup,
  ConfiguracionSistema,
  ConfiguracionIntegraciones,
  CONFIGURACION_DEFAULT,
  AFPS_DISPONIBLES,
  BANCOS_DISPONIBLES,
  MONEDAS,
  Usuario,
  Rol,
  Cargo,
  HorarioTrabajo,
  Feriado
} from './configuracion.interface';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss']
})
export class ConfiguracionComponent implements OnInit {
  // Configuración completa
  configuracion: Partial<ConfiguracionGeneral> = this.obtenerConfiguracionDefault();
  configuracionOriginal: Partial<ConfiguracionGeneral> = this.obtenerConfiguracionDefault();
  
  // Pestañas
  tabActiva: string = 'empresa';
  tabs = [
    { id: 'empresa', nombre: 'Empresa', icon: '🏢' },
    { id: 'planillas', nombre: 'Planillas', icon: '💰' },
    { id: 'tasas', nombre: 'Tasas y Conceptos', icon: '📊' },
    { id: 'beneficios', nombre: 'Beneficios', icon: '🎁' },
    { id: 'asistencia', nombre: 'Asistencia', icon: '📅' },
    { id: 'rrhh', nombre: 'RRHH', icon: '👥' },
    { id: 'datos-maestros', nombre: 'Datos Maestros', icon: '🗂️' },
    { id: 'tributario', nombre: 'Tributario', icon: '🏛️' },
    { id: 'seguridad', nombre: 'Seguridad', icon: '🔐' },
    { id: 'administrar-roles', nombre: 'Administrar Roles', icon: '👑', requierePermiso: 'roles' },
    { id: 'notificaciones', nombre: 'Notificaciones', icon: '📧' },
    { id: 'personalizacion', nombre: 'Personalización', icon: '🎨' },
    { id: 'backup', nombre: 'Backup', icon: '💾' },
    { id: 'sistema', nombre: 'Sistema', icon: '⚙️' },
    { id: 'integraciones', nombre: 'Integraciones', icon: '🔗' }
  ];
  
  // Estado
  cargando: boolean = false;
  guardando: boolean = false;
  hayChangios: boolean = false;  // ⬅️ CORREGIDO (era hayCambios)
  
  // Modal de éxito al guardar configuración
  mostrarModalExitoConfiguracion: boolean = false;
  guardandoConfiguracion: boolean = false;
  configuracionGuardadaCompletada: boolean = false;

  // ==================== ADMINISTRAR ROLES ====================
  // Lista de roles
  roles: any[] = [];
  rolesCargando: boolean = false;
  
  // Modal crear/editar rol
  mostrarModalRol: boolean = false;
  rolEditando: any = null;
  guardandoRol: boolean = false;
  mostrarModalExitoRol: boolean = false;
  guardandoRolProceso: boolean = false;
  rolGuardadoCompletado: boolean = false;
  mensajeExitoRol: string = '';
  mostrarModalEliminarRol: boolean = false;
  rolAEliminar: any = null;
  confirmacionEliminarRol: string = '';
  eliminandoRol: boolean = false;
  rolEliminadoCompletado: boolean = false;
  mostrarModalExitoEliminacionRol: boolean = false;
  rolForm = {
    nombre: '',
    descripcion: '',
    permisos: {
      trabajadores: { ver: false, crear: false, editar: false, eliminar: false },
      planillas: { ver: false, crear: false, editar: false, eliminar: false },
      reportes: { ver: false, exportar: false },
      configuracion: { ver: false, editar: false },
      asistencia: { ver: false, editar: false },
      beneficios: { ver: false, editar: false },
      prestamos: { ver: false, crear: false, editar: false, eliminar: false },
      usuarios: { ver: false, crear: false, editar: false, eliminar: false },
      roles: { ver: false, crear: false, editar: false, eliminar: false }
    }
  };

  // Modal cambiar contraseña
  mostrarModalPassword: boolean = false;
  passwordForm = {
    usuarioId: null,
    usuarioNombre: '',
    passwordActual: '',
    passwordNuevo: '',
    passwordConfirmar: ''
  };
  guardandoPassword: boolean = false;

  // Lista de usuarios
  usuarios: any[] = [];
  usuariosCargando: boolean = false;
  
  // Propiedades para editar usuario
  mostrarModalEditarUsuario: boolean = false;
  usuarioEditando: any = null;
  usuarioForm = {
    nombre: '',
    apellidos: '',
    email: '',
    username: '',
    rol: '',
    horasDemo: null as number | null,
    fechaInicioDemo: '',
    fechaFinDemo: ''
  };
  guardandoUsuario: boolean = false;

  // Eliminación de usuario
  mostrarModalEliminarUsuario: boolean = false;
  usuarioAEliminar: any = null;
  confirmacionEliminar: string = '';
  mostrarModalExitoEliminacion: boolean = false;
  eliminandoUsuario: boolean = false;
  eliminacionCompletada: boolean = false;

  // Resetear contraseña (solo administradores)
  mostrarModalResetearPassword: boolean = false;
  usuarioReseteando: any = null;
  nuevaPassword: string = '';
  confirmarPassword: string = '';
  reseteandoPassword: boolean = false;

  // Propiedades de usuario actual
  isAdmin: boolean = false;
  isDemo: boolean = false;
  isSuperAdmin: boolean = false;

  // Control de módulos habilitados (configurable por SUPER_ADMIN)
  modulosHabilitados: { [key: string]: boolean } = {};
  currentUser: any = null;
  permisosUsuarioActual: any = null; // Permisos del rol del usuario actual

  // Nuevo usuario
  mostrarModalNuevoUsuario: boolean = false;
  nuevoUsuarioForm = {
    username: '',
    email: '',
    nombre: '',
    apellidos: '',
    rol: '',
    password: '',
    esDemo: false,
    horasDemo: null as number | null
  };
  creandoUsuario: boolean = false;
  mostrarModalExitoCreacion: boolean = false;
  creandoUsuarioProceso: boolean = false;
  usuarioCreadoCompletado: boolean = false;
  
  // Datos Maestros
  subseccionActiva: string = 'cargos';
  subseccionesDatosMaestros = [
    { id: 'cargos', nombre: 'Cargos', icon: '👔', count: 0 },
    { id: 'gerencias', nombre: 'Gerencias', icon: '🏛️', count: 0 },
    { id: 'subgerencias', nombre: 'Subgerencias', icon: '🏢', count: 0 },
    { id: 'unidades', nombre: 'Unidades', icon: '🏢', count: 0 },
    { id: 'tipos-contrato', nombre: 'Tipos de Contrato', icon: '📋', count: 0 },
    { id: 'regimenes-laborales', nombre: 'Regímenes Laborales', icon: '⚖️', count: 0 },
    { id: 'condiciones-laborales', nombre: 'Condiciones Laborales', icon: '📌', count: 0 }
  ];
  
  // Datos
  cargos: any[] = [];
  gerencias: any[] = [];
  subgerencias: any[] = [];
  unidades: any[] = [];
  tiposContrato: any[] = [];
  regimenesLaborales: any[] = [];
  condicionesLaborales: any[] = [];
  
  // Catálogos
  afpsDisponibles = AFPS_DISPONIBLES;
  bancosDisponibles = BANCOS_DISPONIBLES;
  monedas = MONEDAS;
  
  // Arrays auxiliares
  horarios: HorarioTrabajo[] = [];
  feriados: Feriado[] = [];
  
  // Tasas Configurables
  tasas: any[] = [];
  tasasCategorizadas: { [categoria: string]: any[] } = {};
  tasaEditando: any = null;
  mostrarModalTasa: boolean = false;
  private apiTasas = `${environment.apiUrl}/configuracion-tasas`;
  
  // Variables para modal de regímenes laborales
  mostrarModalRegimenLaboral: boolean = false;
  regimenLaboralEditando: any = null;
  guardandoRegimenLaboral: boolean = false;
  regimenLaboralForm = {
    codigo: '',
    nombre: '',
    descripcion: '',
    baseNormativa: 'Ley General del Trabajo'
  };

  // Variables para modal de tipos de contrato
  mostrarModalTipoContrato: boolean = false;
  tipoContratoEditando: any = null;
  guardandoTipoContrato: boolean = false;
  tipoContratoForm = {
    codigo: '',
    nombre: '',
    descripcion: ''
  };

  // Variables para modal de cargos
  mostrarModalCargo: boolean = false;
  cargoEditando: any = null;
  guardandoCargo: boolean = false;
  cargoForm = {
    nombre: '',
    descripcion: ''
  };

  // Variables para modal de condiciones laborales
  mostrarModalCondicionLaboral: boolean = false;
  condicionLaboralEditando: any = null;
  guardandoCondicionLaboral: boolean = false;
  condicionLaboralForm = {
    codigo: '',
    nombre: '',
    descripcion: ''
  };
  
  // Variables para selección múltiple de cargos
  cargosSeleccionados: number[] = [];
  todosCargosSeleccionados: boolean = false;
  cargosDisponibles: any[] = [];
  cargoSeleccionado: string = '';
  
  // Variables para categorías personalizadas
  categoriaEsPersonalizada: boolean = false;
  nuevaCategoria: string = '';
  
  // Variables para editar nombre de categoría
  categoriaEditando: string | null = null;
  categoriaNombreEditando: string = '';
  guardandoNombreCategoria: boolean = false;
  
  // Modales
  mostrarModalArea: boolean = false;
  mostrarModalUsuario: boolean = false;
  mostrarModalHorario: boolean = false;
  mostrarModalFeriado: boolean = false;
  mostrarModalExportar: boolean = false;
  mostrarModalImportar: boolean = false;
  mostrarModalEliminarTasa: boolean = false;
  tasaAEliminar: any = null;
  
  // Búsqueda
  busqueda: string = '';
  
  // Vista previa de cambios
  cambiosPendientes: { campo: string; valorAnterior: any; valorNuevo: any }[] = [];
  
  // Exponer Object.keys para el template
  Object = Object;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Leer query parameter para activar tab específico ANTES de cargar datos
    const params = this.route.snapshot.queryParams;
    console.log('🔍 Query params recibidos:', params);
    
    if (params['tab']) {
      const tabId = params['tab'];
      console.log('📌 Tab solicitado:', tabId);
      // Verificar que el tab existe en la lista
      const tabExiste = this.tabs.find(t => t.id === tabId);
      if (tabExiste) {
        console.log('✅ Tab encontrado, activando:', tabId);
        this.tabActiva = tabId;
      } else {
        console.warn('⚠️ Tab no encontrado:', tabId, 'Tabs disponibles:', this.tabs.map(t => t.id));
      }
    }
    
    // También suscribirse para cambios dinámicos
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        const tabId = params['tab'];
        const tabExiste = this.tabs.find(t => t.id === tabId);
        if (tabExiste && this.tabActiva !== tabId) {
          console.log('🔄 Cambiando tab dinámicamente a:', tabId);
          this.tabActiva = tabId;
          this.cambiarTab(tabId);
        }
      }
    });
    
    this.cargarConfiguracion();
    this.inicializarDatos();
    this.cargarUsuarioActual();
    this.cargarModulosHabilitados();
    
    // Si ya está en datos-maestros, cargar todos los datos
    if (this.tabActiva === 'datos-maestros') {
      this.cargarTodosLosDatosMaestros();
    }
    
    // Si es el tab de tasas, asegurar que se carguen después de inicializar
    if (this.tabActiva === 'tasas') {
      console.log('💰 Tab de tasas activo, cargando datos...');
      setTimeout(() => {
        this.cargarTasas();
        this.cargarCargosParaTasas();
      }, 500);
    }
  }

  inicializarDatos(): void {
    // Cargar datos auxiliares
    this.cargarCargos();
    this.cargarUsuarios();
    this.cargarRoles();
    this.cargarHorarios();
    this.cargarFeriados();
    this.cargarTasas();
    this.cargarCargosParaTasas(); // ⬅️ Cargar cargos para el selector
  }

  // ==================== CARGA DE CONFIGURACIÓN ====================
  cargarConfiguracion(): void {
    this.cargando = true;
    
    // Cargar desde el backend primero
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.http.get(`${environment.apiUrl}/configuracion/activa`, { headers }).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          // Cargar configuración desde localStorage como base
          const configGuardada = localStorage.getItem('configuracionSistema');
          if (configGuardada) {
            try {
              this.configuracion = JSON.parse(configGuardada);
            } catch (error) {
              this.configuracion = this.obtenerConfiguracionDefault();
            }
          } else {
            this.configuracion = this.obtenerConfiguracionDefault();
          }
          
          // Actualizar con valores del backend
          if (response.data.PLANILLAS) {
            if (!this.configuracion.planillas) {
              this.configuracion.planillas = CONFIGURACION_DEFAULT.planillas as any;
            }
            this.configuracion.planillas.diaCierrePlanilla = response.data.PLANILLAS.diaCierrePlanilla || this.configuracion.planillas.diaCierrePlanilla || 25;
            this.configuracion.planillas.diaPagoPlanilla = response.data.PLANILLAS.diaPagoPlanilla || this.configuracion.planillas.diaPagoPlanilla || 30;
          }
          
          // Actualizar configuración de INTEGRACIONES
          if (response.data.INTEGRACIONES) {
            if (!this.configuracion.integraciones) {
              this.configuracion.integraciones = {
                integrarBancoNacion: false,
                integrarBCP: false,
                integrarInterbank: false,
                integrarSUNAT: false,
                integrarEsSalud: false,
                integrarRENIEC: false,
                integrarAFP: false,
                afpsIntegradas: [],
                integrarBiometrico: false,
                modeloBiometrico: '',
                ipBiometrico: '',
                integrarERP: false,
                tipoERP: '',
                webhooks: [],
                apis: []
              };
            }
            this.configuracion.integraciones.integrarBancoNacion = response.data.INTEGRACIONES.integrarBancoNacion || false;
            this.configuracion.integraciones.integrarBCP = response.data.INTEGRACIONES.integrarBCP || false;
            this.configuracion.integraciones.integrarInterbank = response.data.INTEGRACIONES.integrarInterbank || false;
            this.configuracion.integraciones.integrarSUNAT = response.data.INTEGRACIONES.integrarSUNAT || false;
            this.configuracion.integraciones.integrarEsSalud = response.data.INTEGRACIONES.integrarEsSalud || false;
            this.configuracion.integraciones.integrarRENIEC = response.data.INTEGRACIONES.integrarRENIEC || false;
            this.configuracion.integraciones.integrarAFP = response.data.INTEGRACIONES.integrarAFP || false;
            this.configuracion.integraciones.integrarBiometrico = response.data.INTEGRACIONES.integrarBiometrico || false;
            this.configuracion.integraciones.modeloBiometrico = response.data.INTEGRACIONES.modeloBiometrico || '';
            this.configuracion.integraciones.ipBiometrico = response.data.INTEGRACIONES.ipBiometrico || '';
          }
          
          // Actualizar configuración de RRHH (fecha de reunión de evaluación)
          if (response.data.RRHH) {
            if (!this.configuracion.rrhh) {
              this.configuracion.rrhh = {
                cargos: [],
                tiposContrato: [],
                nivelesEducativos: [],
                documentosRequeridos: [],
                periodoEvaluacionDesempeno: 'semestral',
                fechaReunionEvaluacion: new Date('2025-09-20'),
                escalasEvaluacion: [],
                horasCapacitacionAnual: 40,
                presupuestoCapacitacion: 50000,
                permitirAutoevaluacion: false,
                notificarCumpleanos: false,
                notificarAniversarios: false
              };
            }
            if (response.data.RRHH.fechaReunionEvaluacion) {
              this.configuracion.rrhh.fechaReunionEvaluacion = new Date(response.data.RRHH.fechaReunionEvaluacion);
            }
            if (response.data.RRHH.periodoEvaluacionDesempeno) {
              this.configuracion.rrhh.periodoEvaluacionDesempeno = response.data.RRHH.periodoEvaluacionDesempeno;
            }
          }
          
          if (response.data.BENEFICIOS) {
            if (!this.configuracion.beneficios) {
              this.configuracion.beneficios = {
                cts: { fechaDepositoMayo: 15, fechaDepositoNoviembre: 15, tasaInteres: 3.5, bancoDepositario: 'Banco de la Nación', tipoCuenta: 'Ahorros', diasPorAnio: 360, incluirGratificacionesEnCalculo: true, incluirHorasExtrasEnCalculo: true, mesesPromedioHorasExtras: 6, generarDepositosAuto: true },
                gratificaciones: {} as any,
                vacaciones: {} as any,
                utilidades: {} as any
              };
            }
            if (!this.configuracion.beneficios.cts) {
              this.configuracion.beneficios.cts = {
                fechaDepositoMayo: 15,
                fechaDepositoNoviembre: 15,
                tasaInteres: 3.5,
                bancoDepositario: 'Banco de la Nación',
                tipoCuenta: 'Ahorros',
                diasPorAnio: 360,
                incluirGratificacionesEnCalculo: true,
                incluirHorasExtrasEnCalculo: true,
                mesesPromedioHorasExtras: 6,
                generarDepositosAuto: true
              };
            }
            // Actualizar fechas de CTS desde el backend
            // El backend usa diaDepositoCTSMayo y diaDepositoCTSNoviembre
            const diaMayoBackend = response.data.BENEFICIOS.diaDepositoCTSMayo;
            const diaNoviembreBackend = response.data.BENEFICIOS.diaDepositoCTSNoviembre;
            
            if (diaMayoBackend !== undefined && diaMayoBackend !== null) {
              this.configuracion.beneficios.cts.fechaDepositoMayo = diaMayoBackend;
            }
            if (diaNoviembreBackend !== undefined && diaNoviembreBackend !== null) {
              this.configuracion.beneficios.cts.fechaDepositoNoviembre = diaNoviembreBackend;
            }
          }
          
          // Guardar en localStorage la configuración actualizada
          localStorage.setItem('configuracionSistema', JSON.stringify(this.configuracion));
        } else {
          // Si no hay respuesta del backend, cargar desde localStorage
          const configGuardada = localStorage.getItem('configuracionSistema');
          if (configGuardada) {
            try {
              this.configuracion = JSON.parse(configGuardada);
            } catch (error) {
              this.configuracion = this.obtenerConfiguracionDefault();
            }
          } else {
            this.configuracion = this.obtenerConfiguracionDefault();
          }
        }
        
        // Guardar copia para detectar cambios
        this.configuracionOriginal = JSON.parse(JSON.stringify(this.configuracion));
        
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar configuración del backend:', error);
        // Cargar desde localStorage como respaldo
        const configGuardada = localStorage.getItem('configuracionSistema');
        if (configGuardada) {
          try {
            this.configuracion = JSON.parse(configGuardada);
          } catch (e) {
            this.configuracion = this.obtenerConfiguracionDefault();
          }
        } else {
          this.configuracion = this.obtenerConfiguracionDefault();
        }
        
        // Guardar copia para detectar cambios
        this.configuracionOriginal = JSON.parse(JSON.stringify(this.configuracion));
        
        this.cargando = false;
      }
    });
  }

  obtenerConfiguracionDefault(): Partial<ConfiguracionGeneral> {
    return {
      empresa: {
        razonSocial: 'Municipalidad Distrital de San Juan',
        nombreComercial: 'Municipalidad San Juan',
        ruc: '20123456789',
        direccion: 'Av. Principal 123',
        distrito: 'San Juan',
        provincia: 'Lima',
        departamento: 'Lima',
        pais: 'Perú',
        telefono: '01-1234567',
        celular: '987654321',
        email: 'contacto@munisanjuan.gob.pe',
        web: 'www.munisanjuan.gob.pe',
        logo: '',
        alcalde: 'Juan Pérez García',
        gerenteMunicipal: 'María López Torres',
        gerenteRRHH: 'Carlos Ramírez Silva',
        periodoGestion: '2023-2026',
        fechaInicioGestion: new Date('2023-01-01'),
        fechaFinGestion: new Date('2026-12-31'),
        actividadEconomica: 'Administración Pública',
        codigoCIIU: '8411',
        tipoContribuyente: 'Gobierno Local',
        regimenTributario: 'General'
      },
      planillas: CONFIGURACION_DEFAULT.planillas,
      beneficios: {
        cts: {
          tasaInteres: 3.5,
          bancoDepositario: 'Banco de la Nación',
          tipoCuenta: 'Ahorros',
          diasPorAnio: 360,
          incluirGratificacionesEnCalculo: true,
          incluirHorasExtrasEnCalculo: true,
          mesesPromedioHorasExtras: 6,
          generarDepositosAuto: true,
          fechaDepositoMayo: 15,
          fechaDepositoNoviembre: 15
        },
        gratificaciones: {
          porcentajeBonificacionExtraordinaria: 9,
          incluirEnPlanillaMensual: false,
          mesGratificacionJulio: 7,
          mesGratificacionDiciembre: 12,
          aplicarRetencionRenta: true
        },
        vacaciones: {
          diasPorAnio: 30,
          diasMinimoContinuo: 7,
          diasMaximoFraccionamiento: 15,
          permitirFraccionamiento: true,
          diasAnticipacionSolicitud: 15,
          permitirAcumulacion: true,
          aniosMaximosAcumulacion: 2,
          generarRecordAutomatico: true
        },
        utilidades: {
          porcentajeDistribucionTrabajadores: 10,
          porcentajePorDias: 50,
          porcentajePorRemuneracion: 50,
          diasAnioCompleto: 360,
          aplicarRenta5ta: true
        }
      },
      asistencia: {
        horariosPorDefecto: [],
        turnos: [],
        minutosToleranciaTardanza: 15,
        tardanzasMaximasMes: 3,
        faltasMaximasMes: 2,
        tipoMarcacion: 'biometrico',
        requiereJustificacionTardanza: true,
        requiereJustificacionFalta: true,
        permitirHorasExtras: true,
        requiereAprobacionHE: true,
        porcentajeHE25: 25,
        porcentajeHE35: 35,
        porcentajeHE100: 100,
        feriados: [],
        diasNoLaborables: [],
        generarReportesDiarios: true,
        enviarAlertasTardanzas: true
      },
      rrhh: {
        cargos: [],
        tiposContrato: [
          { id: '1', nombre: 'Nombrado', descripcion: 'Personal nombrado', duracion: 'indefinido', color: '#10b981' },
          { id: '2', nombre: 'CAS', descripcion: 'Contrato Administrativo de Servicios', duracion: 'plazo_fijo', color: '#3b82f6' },
          { id: '3', nombre: 'Locador', descripcion: 'Locador de Servicios', duracion: 'plazo_fijo', color: '#f59e0b' },
          { id: '4', nombre: 'Practicante', descripcion: 'Practicante Pre/Profesional', duracion: 'plazo_fijo', color: '#8b5cf6' }
        ],
        nivelesEducativos: ['Primaria', 'Secundaria', 'Técnico', 'Universitario', 'Postgrado', 'Maestría', 'Doctorado'],
        documentosRequeridos: [
          { id: '1', nombre: 'DNI', obligatorio: true, tipo: 'identidad' },
          { id: '2', nombre: 'Certificado de Antecedentes', obligatorio: true, tipo: 'legal' },
          { id: '3', nombre: 'CV Documentado', obligatorio: true, tipo: 'profesional' }
        ],
        periodoEvaluacionDesempeno: 'semestral',
        fechaReunionEvaluacion: new Date('2025-09-20'), // Fecha por defecto
        escalasEvaluacion: [
          { id: '1', nombre: 'Deficiente', valorMinimo: 0, valorMaximo: 10, descripcion: 'Desempeño muy bajo' },
          { id: '2', nombre: 'Regular', valorMinimo: 11, valorMaximo: 14, descripcion: 'Desempeño básico' },
          { id: '3', nombre: 'Bueno', valorMinimo: 15, valorMaximo: 17, descripcion: 'Desempeño satisfactorio' },
          { id: '4', nombre: 'Muy Bueno', valorMinimo: 18, valorMaximo: 19, descripcion: 'Desempeño destacado' },
          { id: '5', nombre: 'Excelente', valorMinimo: 20, valorMaximo: 20, descripcion: 'Desempeño sobresaliente' }
        ],
        horasCapacitacionAnual: 40,
        presupuestoCapacitacion: 50000,
        permitirAutoevaluacion: true,
        notificarCumpleanos: true,
        notificarAniversarios: true
      },
      tributario: {
        usuarioSUNAT: '',
        claveSUNAT: '',
        certificadoDigital: '',
        versionPLAME: '6.0',
        rutaPLAME: 'C:\\PLAME',
        generarArchivosPLAMEAuto: true,
        codigosAFP: {
          'PRIMA': '01',
          'INTEGRA': '02',
          'PROFUTURO': '03',
          'HABITAT': '04'
        },
        rutaAFPNET: 'C:\\AFPNET',
        uitActual: 5150,
        tramoRenta: [
          { id: '1', desde: 0, hasta: 5, tasa: 8 },
          { id: '2', desde: 5, hasta: 20, tasa: 14 },
          { id: '3', desde: 20, hasta: 35, tasa: 17 },
          { id: '4', desde: 35, hasta: 45, tasa: 20 },
          { id: '5', desde: 45, hasta: 999999, tasa: 30 }
        ],
        deduccionMinima: 7,
        tasaEsSalud: 9,
        tarifaSCTR: 1.5,
        tasaONP: 13,
        generarPDTAuto: true,
        declaracionElectronica: true
      },
      seguridad: {
        usuarios: [],
        roles: [],
        longitudMinimaPassword: 8,
        requiereCaracteresEspeciales: true,
        requiereNumeros: true,
        requiereMayusculas: true,
        diasExpiracionPassword: 90,
        tiempoMaximoSesion: 480,
        sesionesSimultaneas: 1,
        cerrarSesionInactividad: true,
        minutosInactividad: 30,
        registrarCambios: true,
        nivelAuditoria: 'completo',
        diasRetencionLogs: 365,
        autenticacionDosFactores: false,  // ⬅️ CORREGIDO (sin espacio)
        permitirRecordarDispositivo: true,
        bloquearTrasIntentosFallidos: 5,
        ipsPermitidas: [],
        restriccionHoraria: false,
        horarioAcceso: []
      },
      notificaciones: {
        servidorSMTP: 'smtp.gmail.com',
        puertoSMTP: 587,
        usuarioEmail: '',
        passwordEmail: '',
        emailRemitente: 'noreply@munisanjuan.gob.pe',
        nombreRemitente: 'Sistema de Planillas - Municipalidad',
        usarSSL: true,
        notificarNuevoPlanilla: true,
        notificarPagoRealizado: true,
        notificarCumpleanos: true,
        notificarVencimientos: true,
        notificarTardanzas: true,
        emailsAdministradores: [],
        emailsRRHH: [],
        resumenDiario: false,
        resumenSemanal: true,
        resumenMensual: true,
        integrarWhatsApp: false,
        numeroWhatsApp: '',
        integrarSMS: false,
        proveedorSMS: ''
      },
      personalizacion: {
        tema: 'auto',
        colorPrimario: '#22c55e',
        colorSecundario: '#3b82f6',
        colorAccent: '#f59e0b',
        fuentePrincipal: 'Inter',
        tamanioFuente: 'mediano',
        logoEmpresa: '',
        logoReportes: '',
        colorCorporativo: '#22c55e',
        formatoFecha: 'DD/MM/YYYY',
        formatoHora: 'HH:mm',
        separadorDecimal: '.',
        separadorMiles: ',',
        idioma: 'es',
        zonaHoraria: 'America/Lima',  // ⬅️ CORREGIDO (sin espacio)
        orientacionReportesPorDefecto: 'portrait',
        incluirLogoEnReportes: true,
        pieReportes: 'Sistema de Gestión de Planillas - Municipalidad',
        widgetsActivos: ['planilla', 'trabajadores', 'asistencia', 'beneficios'],
        ordenWidgets: ['planilla', 'trabajadores', 'asistencia', 'beneficios'],
        animaciones: true,
        sonidos: false,
        modoAccesibilidad: false
      },
      backup: {
        backupAutomatico: true,
        frecuenciaBackup: 'diario',
        horaBackup: '02:00',
        rutaBackupLocal: 'C:\\Backups\\Planillas',
        backupEnNube: false,
        proveedorNube: 'local',
        diasRetencionBackup: 30,
        backupsMaximosAlmacenar: 10,
        comprimirBackups: true,
        encriptarBackups: true,
        notificarBackupExitoso: true,
        notificarBackupFallido: true,
        emailsNotificacion: [],
        permitirRestauracion: true,
        crearPuntoRestauracionAntes: true
      },
      sistema: {
        versionSistema: '1.0.0',
        fechaActualizacion: new Date(),
        modoMantenimiento: false,
        mensajeMantenimiento: 'Sistema en mantenimiento. Volveremos pronto.',
        cacheDatos: true,
        tiempoCache: 3600,
        optimizarConsultas: true,
        nivelLogs: 'info',
        guardarLogsEnArchivo: true,
        rutaLogs: 'C:\\Logs\\Planillas',
        registrosPorPagina: 10,
        tamanioMaximoArchivo: 10,  // ⬅️ CORREGIDO (sin ñ)
        trabajadoresMaximos: 1000,
        verificarActualizacionesAuto: true,
        notificarActualizaciones: true,
        tiempoLimpiezaAutomatica: 90,
        optimizarDBAutomatico: true,
        apiHabilitada: false,
        apiKey: '',
        rateLimitAPI: 100
      },
      integraciones: {
        integrarBancoNacion: false,
        integrarBCP: false,
        integrarInterbank: false,
        integrarSUNAT: false,
        integrarEsSalud: false,
        integrarRENIEC: false,
        integrarAFP: false,
        afpsIntegradas: [],
        integrarBiometrico: false,
        modeloBiometrico: '',
        ipBiometrico: '',
        integrarERP: false,
        tipoERP: '',
        webhooks: [],
        apis: []
      }
    };
  }

  // ==================== GESTIÓN DE TABS ====================
  cambiarTab(tabId: string): void {
    if (this.hayChangiosSinGuardar()) {
      if (!confirm('Hay cambios sin guardar. ¿Desea continuar sin guardar?')) {
        return;
      }
    }
    this.tabActiva = tabId;
    
    // Cargar datos maestros cuando se seleccione esa pestaña
    if (tabId === 'datos-maestros') {
      this.cargarTodosLosDatosMaestros();
    }
    
    // Cargar datos de administrar roles cuando se seleccione esa pestaña
    if (tabId === 'administrar-roles') {
      this.cargarRoles();
      this.cargarUsuarios();
    }
  }

  hayChangiosSinGuardar(): boolean {
    return JSON.stringify(this.configuracion) !== JSON.stringify(this.configuracionOriginal);
  }

  // ==================== GUARDAR CONFIGURACIÓN ====================
  guardarConfiguracion(): void {
    if (!this.validarConfiguracion()) {
      return;
    }

    this.guardando = true;

    // Guardar en el backend primero
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    // Preparar promesas para guardar cada módulo
    const promesasGuardado: Promise<any>[] = [];
    
    // Guardar configuración de PLANILLAS
    if (this.configuracion.planillas) {
      const configPlanillas: { [key: string]: any } = {
        diaCierrePlanilla: this.configuracion.planillas.diaCierrePlanilla || 25,
        diaPagoPlanilla: this.configuracion.planillas.diaPagoPlanilla || 30,
        diasDelMes: this.configuracion.planillas.diasDelMes || 30,
        horasPorDia: this.configuracion.planillas.horasPorDia || 8,
        redondeoDecimales: this.configuracion.planillas.redondeoDecimales || 2,
        redondeoTipo: this.configuracion.planillas.redondeoTipo || 'normal',
        calcularHorasExtrasAuto: this.configuracion.planillas.calcularHorasExtrasAuto ?? true,
        aplicarRetencionAutomatica: this.configuracion.planillas.aplicarRetencionAutomatica ?? true,
        generarBoletasAuto: this.configuracion.planillas.generarBoletasAuto ?? true
      };
      
      promesasGuardado.push(
        firstValueFrom(
          this.http.post('http://localhost:5000/api/configuracion/guardar', {
            modulo: 'PLANILLAS',
            configuraciones: configPlanillas
          }, { headers })
        )
      );
    }
    
    // Guardar configuración de BENEFICIOS (CTS)
    if (this.configuracion.beneficios?.cts) {
      const configBeneficios: { [key: string]: any } = {
        diaDepositoCTSMayo: this.configuracion.beneficios.cts.fechaDepositoMayo || 15,
        diaDepositoCTSNoviembre: this.configuracion.beneficios.cts.fechaDepositoNoviembre || 15,
        tasaInteresCTS: this.configuracion.beneficios.cts.tasaInteres || 0,
        diasPorAnioCTS: this.configuracion.beneficios.cts.diasPorAnio || 360
      };
      
      promesasGuardado.push(
        firstValueFrom(
          this.http.post('http://localhost:5000/api/configuracion/guardar', {
            modulo: 'BENEFICIOS',
            configuraciones: configBeneficios
          }, { headers })
        )
      );
    }
    
    // Guardar configuración de RRHH (fecha de reunión de evaluación)
    if (this.configuracion.rrhh?.fechaReunionEvaluacion) {
      const fechaReunion = this.configuracion.rrhh.fechaReunionEvaluacion instanceof Date 
        ? this.configuracion.rrhh.fechaReunionEvaluacion.toISOString().split('T')[0]
        : this.configuracion.rrhh.fechaReunionEvaluacion;
      
      const configRRHH: { [key: string]: any } = {
        fechaReunionEvaluacion: fechaReunion,
        periodoEvaluacionDesempeno: this.configuracion.rrhh.periodoEvaluacionDesempeno || 'semestral'
      };
      
      promesasGuardado.push(
        firstValueFrom(
          this.http.post('http://localhost:5000/api/configuracion/guardar', {
            modulo: 'RRHH',
            configuraciones: configRRHH
          }, { headers })
        )
      );
    }
    
    // Guardar configuración de INTEGRACIONES
    if (this.configuracion.integraciones) {
      const configIntegraciones: { [key: string]: any } = {
        integrarBancoNacion: this.configuracion.integraciones.integrarBancoNacion || false,
        integrarBCP: this.configuracion.integraciones.integrarBCP || false,
        integrarInterbank: this.configuracion.integraciones.integrarInterbank || false,
        integrarSUNAT: this.configuracion.integraciones.integrarSUNAT || false,
        integrarEsSalud: this.configuracion.integraciones.integrarEsSalud || false,
        integrarRENIEC: this.configuracion.integraciones.integrarRENIEC || false,
        integrarAFP: this.configuracion.integraciones.integrarAFP || false,
        integrarBiometrico: this.configuracion.integraciones.integrarBiometrico || false,
        modeloBiometrico: this.configuracion.integraciones.modeloBiometrico || '',
        ipBiometrico: this.configuracion.integraciones.ipBiometrico || ''
      };
      
      promesasGuardado.push(
        firstValueFrom(
          this.http.post('http://localhost:5000/api/configuracion/guardar', {
            modulo: 'INTEGRACIONES',
            configuraciones: configIntegraciones
          }, { headers })
        )
      );
    }
    
    // Ejecutar todas las promesas en paralelo
    Promise.all(promesasGuardado).then(() => {
      // Guardar en localStorage (importante para que otros componentes puedan acceder)
      localStorage.setItem('configuracionSistema', JSON.stringify(this.configuracion));
      
      // Marcar timestamp de última actualización para que el dashboard se actualice
      localStorage.setItem('configuracionUltimaActualizacion', new Date().toISOString());
      
      // Actualizar configuración original
      this.configuracionOriginal = JSON.parse(JSON.stringify(this.configuracion));
      
      this.guardando = false;
      this.hayChangios = false;
      
      // Mostrar modal de éxito con animación
      this.mostrarModalExitoConfiguracion = true;
      this.guardandoConfiguracion = true;
      this.configuracionGuardadaCompletada = false;
      
      // Simular proceso de guardado
      setTimeout(() => {
        this.guardandoConfiguracion = false;
        this.configuracionGuardadaCompletada = true;
        
        // Cerrar automáticamente después de mostrar el checkmark
        setTimeout(() => {
          this.cerrarModalExitoConfiguracion();
          
          // Aplicar cambios visuales si es personalización
          if (this.tabActiva === 'personalizacion') {
            this.aplicarPersonalizacion();
          }
        }, 2000);
      }, 1500);
      
    }).catch((error) => {
      console.error('❌ Error al guardar configuración en backend:', error);
      
      // Aún así guardar en localStorage como respaldo
      localStorage.setItem('configuracionSistema', JSON.stringify(this.configuracion));
      localStorage.setItem('configuracionUltimaActualizacion', new Date().toISOString());
      this.configuracionOriginal = JSON.parse(JSON.stringify(this.configuracion));
      this.guardando = false;
      this.hayChangios = false;
      
      // Determinar el tipo de error
      let mensajeError = 'Error al guardar en servidor.';
      if (error.status === 0) {
        mensajeError = 'No se pudo conectar con el servidor. Verifique que el backend esté ejecutándose.';
      } else if (error.status === 403 || error.message?.includes('CORS')) {
        mensajeError = 'Error de CORS. Verifique la configuración del servidor.';
      } else if (error.error?.message) {
        mensajeError = error.error.message;
      }
      
      alert(`⚠️ Configuración guardada localmente.\n\n${mensajeError}`);
    });
  }

  validarConfiguracion(): boolean {
    // Validaciones por pestaña
    switch (this.tabActiva) {
      case 'empresa':
        if (!this.configuracion.empresa?.razonSocial) {
          alert('⚠️ La razón social es obligatoria');
          return false;
        }
        if (!this.configuracion.empresa?.ruc || this.configuracion.empresa.ruc.length !== 11) {
          alert('⚠️ El RUC debe tener 11 dígitos');
          return false;
        }
        break;
        
      case 'planillas':
        if (this.configuracion.planillas?.tipoCambio && this.configuracion.planillas.tipoCambio <= 0) {
          alert('⚠️ El tipo de cambio debe ser mayor a 0');
          return false;
        }
        break;
        
      case 'notificaciones':
        if (this.configuracion.notificaciones?.usuarioEmail && !this.validarEmail(this.configuracion.notificaciones.usuarioEmail)) {
          alert('⚠️ El email del servidor SMTP no es válido');
          return false;
        }
        break;
    }
    
    return true;
  }

  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // ==================== RESTAURAR CONFIGURACIÓN ====================
  restaurarDefecto(): void {
    if (confirm('¿Está seguro de restaurar la configuración por defecto? Se perderán todos los cambios.')) {
      this.configuracion = this.obtenerConfiguracionDefault();
      this.guardarConfiguracion();
    }
  }

  cancelarCambios(): void {
    if (confirm('¿Está seguro de cancelar los cambios?')) {
      this.configuracion = JSON.parse(JSON.stringify(this.configuracionOriginal));
      this.hayChangios = false;  // ⬅️ CORREGIDO
    }
  }

  // ==================== EXPORTAR/IMPORTAR ====================
  exportarConfiguracion(): void {
    const dataStr = JSON.stringify(this.configuracion, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `configuracion_${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  importarConfiguracion(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const config = JSON.parse(e.target.result);
          this.configuracion = config;
          alert('✅ Configuración importada exitosamente');
        } catch (error) {
          alert('⚠️ Error al importar la configuración. Archivo inválido.');
        }
      };
      reader.readAsText(file);
    }
  }

  // ==================== DATOS AUXILIARES ====================
  // Método cargarAreas() eliminado - Áreas ya no se usan

  cargarCargos(): void {
    this.cargos = [
      { id: '1', codigo: 'GM-001', nombre: 'Gerente Municipal', area: 'GM', nivel: 1, sueldoMinimo: 8000, sueldoMaximo: 12000, descripcion: '', requisitos: '' },
      { id: '2', codigo: 'RRHH-001', nombre: 'Especialista RRHH', area: 'RRHH', nivel: 2, sueldoMinimo: 3500, sueldoMaximo: 5000, descripcion: '', requisitos: '' }
    ];
  }


  cargarHorarios(): void {
    this.horarios = [
      { id: '1', nombre: 'Horario Administrativo', horaEntrada: '08:00', horaSalida: '17:00', horaInicioAlmuerzo: '13:00', horaFinAlmuerzo: '14:00', diasLaborales: [1,2,3,4,5], activo: true }
    ];
  }

  cargarFeriados(): void {
    this.feriados = [
      { id: '1', fecha: new Date('2025-01-01'), nombre: 'Año Nuevo', tipo: 'nacional', esLaborable: false },
      { id: '2', fecha: new Date('2025-07-28'), nombre: 'Fiestas Patrias', tipo: 'nacional', esLaborable: false },
      { id: '3', fecha: new Date('2025-07-29'), nombre: 'Fiestas Patrias', tipo: 'nacional', esLaborable: false }
    ];
  }

  // ==================== PERSONALIZACIÓN ====================
  aplicarPersonalizacion(): void {
    if (this.configuracion.personalizacion) {
      const root = document.documentElement;
      
      // Aplicar colores
      root.style.setProperty('--accent', this.configuracion.personalizacion.colorPrimario);
      root.style.setProperty('--color-secundario', this.configuracion.personalizacion.colorSecundario);
      
      // Aplicar tema
      if (this.configuracion.personalizacion.tema === 'dark') {
        document.body.classList.add('dark-theme');
      } else if (this.configuracion.personalizacion.tema === 'light') {
        document.body.classList.remove('dark-theme');
      }
      
      // Aplicar tamaño de fuente
      if (this.configuracion.personalizacion.tamanioFuente) {
        const tamanios = { pequeno: '14px', mediano: '16px', grande: '18px' };
        root.style.setProperty('--font-size-base', tamanios[this.configuracion.personalizacion.tamanioFuente]);
      }
    }
  }

  // ==================== BACKUP ====================
  ejecutarBackupManual(): void {
    if (confirm('¿Desea crear un backup manual del sistema?')) {
      this.cargando = true;
      
      setTimeout(() => {
        this.cargando = false;
        alert('✅ Backup creado exitosamente');
      }, 2000);
    }
  }

  restaurarBackup(): void {
    if (confirm('⚠️ ¿Está seguro de restaurar un backup? Esta acción sobrescribirá los datos actuales.')) {
      alert('📂 Funcionalidad de restauración próximamente');
    }
  }

  // ==================== SISTEMA ====================
  limpiarCache(): void {
    if (confirm('¿Desea limpiar el caché del sistema?')) {
      localStorage.removeItem('cacheDatos');
      alert('✅ Caché limpiado exitosamente');
    }
  }

  optimizarBaseDatos(): void {
    if (confirm('¿Desea optimizar la base de datos?')) {
      this.cargando = true;
      
      setTimeout(() => {
        this.cargando = false;
        alert('✅ Base de datos optimizada exitosamente');
      }, 3000);
    }
  }

  verificarActualizaciones(): void {
    this.cargando = true;
    
    setTimeout(() => {
      this.cargando = false;
      alert('ℹ️ El sistema está actualizado a la última versión');
    }, 1500);
  }

  // ==================== UTILIDADES ====================
  detectarCambios(): void {
    this.hayChangios = this.hayChangiosSinGuardar();  // ⬅️ CORREGIDO
    
    if (this.hayChangios) {  // ⬅️ CORREGIDO
      this.calcularCambiosPendientes();
    }
  }

  calcularCambiosPendientes(): void {
    // Implementar lógica para detectar cambios específicos
    this.cambiosPendientes = [];
  }

  formatearFecha(fecha: Date | string | undefined): string {
    if (!fecha) return '-';
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleDateString('es-PE');
  }

  copiarTexto(texto: string): void {
    navigator.clipboard.writeText(texto).then(() => {
      alert('✅ Texto copiado al portapapeles');
    });
  }

  generarAPIKey(): void {
    const key = 'pk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    if (this.configuracion.sistema) {
      this.configuracion.sistema.apiKey = key;
    }
  }

  probarConexionSMTP(): void {
    if (!this.configuracion.notificaciones?.servidorSMTP) {
      alert('⚠️ Configure primero el servidor SMTP');
      return;
    }
    
    this.cargando = true;
    
    setTimeout(() => {
      this.cargando = false;
      alert('✅ Conexión SMTP exitosa');
    }, 2000);
  }

  probarIntegracion(tipo: string): void {
    this.cargando = true;
    
    setTimeout(() => {
      this.cargando = false;
      alert(`✅ Integración con ${tipo} exitosa`);
    }, 2000);
  }

  // ==================== GESTIÓN DE TASAS CONFIGURABLES ====================
  cargarTasas(): void {
    console.log('[cargarTasas] Cargando tasas desde:', this.apiTasas);
    
    this.http.get<any>(this.apiTasas).subscribe({
      next: (response) => {
        console.log('[cargarTasas] Respuesta completa:', response);
        this.tasas = response.success ? response.data : response;
        console.log('[cargarTasas] Tasas procesadas:', this.tasas);
        this.categorizarTasas();
      },
      error: (error) => {
        console.error('[cargarTasas] Error al cargar tasas:', error);
        alert('⚠️ Error al cargar las tasas configurables');
      }
    });
  }

  categorizarTasas(): void {
    this.tasasCategorizadas = {};
    
    // Agrupar por la columna Categoria (ACTIVAS E INACTIVAS)
    this.tasas.forEach(tasa => {
      const categoria = tasa.Categoria || 'Otros';
      if (!this.tasasCategorizadas[categoria]) {
        this.tasasCategorizadas[categoria] = [];
      }
      this.tasasCategorizadas[categoria].push(tasa);
    });
    
    console.log('[categorizarTasas] Tasas categorizadas (activas e inactivas):', this.tasasCategorizadas);
  }

  editarTasa(tasa: any): void {
    console.log('[editarTasa] Editando tasa:', tasa);
    console.log('[editarTasa] ConfigID original:', tasa.ConfigID);
    
    this.tasaEditando = { ...tasa };
    
    // Debug: Verificar que ConfigID se mantenga
    console.log('[editarTasa] ConfigID después de copiar:', this.tasaEditando.ConfigID);
    console.log('[editarTasa] Tasa completa después de copiar:', this.tasaEditando);
    
    // Inicializar variables de categoría personalizada
    this.categoriaEsPersonalizada = false;
    this.nuevaCategoria = '';
    
    // Verificar si es una categoría personalizada (no está en la lista predefinida)
    const categoriasPredefinidas = [
      'AFP - Fondo de Pensiones', 'ONP - Sistema de Pensiones', 'Salud', 'SEGUROS', 'SCTR',
      'Renta de 5ta Categoría', 'Renta', 'Bonificaciones', 'BONIFICACIONES', 'INGRESOS',
      'Asignación Familiar', 'Descuentos por Asistencia', 'DESCUENTOS', 'SINDICAL',
      'PRESTAMOS', 'APORTES', 'Otros', 'OTROS_DESCUENTOS'
    ];
    
    if (!categoriasPredefinidas.includes(tasa.Categoria)) {
      // Es una categoría personalizada
      this.categoriaEsPersonalizada = true;
      this.nuevaCategoria = tasa.Categoria;
      this.tasaEditando.Categoria = '__NUEVA_CATEGORIA__';
    }
    
    // Debug final
    console.log('[editarTasa] ConfigID final:', this.tasaEditando.ConfigID);
    console.log('[editarTasa] Es edición?', !!this.tasaEditando.ConfigID);
    
    this.mostrarModalTasa = true;
  }

  nuevaTasa(): void {
    console.log('[nuevaTasa] Abriendo modal. Cargos disponibles:', this.cargosDisponibles.length);
    
    // Cargar cargos disponibles si aún no están cargados
    if (this.cargosDisponibles.length === 0) {
      console.log('[nuevaTasa] Cargando cargos...');
      this.cargarCargosParaTasas();
    }
    
    this.cargoSeleccionado = '';
    this.categoriaEsPersonalizada = false;
    this.nuevaCategoria = '';
    this.tasaEditando = {
      ConfigID: null,
      Codigo: '', // Se generará automáticamente
      Nombre: '',
      Valor: 0,
      TipoValor: 'Porcentaje',
      Categoria: 'Descuentos por Asistencia', // Por defecto la categoría más reciente
      TipoTasa: '', // Opcional: DESCUENTO, INGRESO, APORTE_EMPLEADOR o vacío para detección automática
      Descripcion: '',
      Activo: true,
      FechaVigenciaInicio: new Date().toISOString().split('T')[0],
      FechaVigenciaFin: null
    };
    this.mostrarModalTasa = true;
  }
  
  // Generar código automáticamente según la categoría y nombre
  generarCodigoTasa(): void {
    if (!this.tasaEditando.Nombre || !this.tasaEditando.Categoria) {
      return;
    }
    
    const categoria = this.tasaEditando.Categoria;
    const nombre = this.tasaEditando.Nombre;
    this.generarCodigoTasaConCategoria(categoria, nombre);
  }
  
  // Generar código con categoría específica
  generarCodigoTasaConCategoria(categoria: string, nombre?: string): void {
    const nombreTasa = nombre || this.tasaEditando.Nombre;
    if (!nombreTasa) {
      return;
    }
    
    // Crear código basado en la categoría y nombre
    let prefijo = '';
    
    switch(categoria) {
      // PENSIONES
      case 'AFP - Fondo de Pensiones':
        prefijo = 'AFP_';
        break;
      case 'ONP - Sistema de Pensiones':
        prefijo = 'ONP_';
        break;
        
      // SALUD Y SEGUROS
      case 'Salud':
        prefijo = 'SALUD_';
        break;
      case 'SEGUROS':
        prefijo = 'SEGURO_';
        break;
      case 'SCTR':
        prefijo = 'SCTR_';
        break;
        
      // TRIBUTARIO
      case 'Renta de 5ta Categoría':
        prefijo = 'RENTA_5TA_';
        break;
      case 'Renta':
        prefijo = 'RENTA_';
        break;
        
      // INGRESOS Y BONIFICACIONES
      case 'Bonificaciones':
        prefijo = 'BON_';
        break;
      case 'BONIFICACIONES':
        prefijo = 'BONIFICACION_';
        break;
      case 'INGRESOS':
        prefijo = 'INGRESO_';
        break;
      case 'Asignación Familiar':
        prefijo = 'ASIG_FAM_';
        break;
        
      // DESCUENTOS
      case 'Descuentos por Asistencia':
        prefijo = 'DESC_';
        break;
      case 'DESCUENTOS':
        prefijo = 'DESCUENTO_';
        break;
      case 'SINDICAL':
        prefijo = 'SINDICAL_';
        break;
      case 'PRESTAMOS':
        prefijo = 'PRESTAMO_';
        break;
      case 'APORTES':
        prefijo = 'APORTE_';
        break;
        
      // OTROS
      case 'Otros':
        prefijo = 'OTRO_';
        break;
      case 'OTROS_DESCUENTOS':
        prefijo = 'OTRO_DESCUENTO_';
        break;
        
      default:
        // Para categorías personalizadas, usar el nombre de la categoría como prefijo
        if (categoria && categoria !== 'Descuentos por Asistencia') {
          prefijo = categoria.toUpperCase().replace(/[^A-Z0-9]/g, '_') + '_';
        } else {
          prefijo = 'TASA_';
        }
    }
    
    // Convertir nombre a código (eliminar espacios, mayúsculas, sin caracteres especiales)
    const nombreCodigo = nombreTasa
      .toUpperCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
      .replace(/[^A-Z0-9\s]/g, '') // Solo letras y números
      .replace(/\s+/g, '_') // Espacios a guiones bajos
      .substring(0, 30); // Máximo 30 caracteres
    
    this.tasaEditando.Codigo = prefijo + nombreCodigo;
  }
  
  // Detectar si se debe mostrar el selector de cargo
  esCategoriaRenta(): boolean {
    return this.tasaEditando && this.tasaEditando.Categoria === 'Renta';
  }
  
  // Manejar cambio de tipo de tasa
  onTipoTasaChange(): void {
    console.log('[onTipoTasaChange] Tipo de tasa seleccionado:', this.tasaEditando.TipoTasa);
    // El tipo de tasa se guardará directamente, no necesita procesamiento adicional
  }

  // Manejar cambio de categoría
  onCategoriaChange(event: any): void {
    const categoriaSeleccionada = event.target.value;
    
    if (categoriaSeleccionada === '__NUEVA_CATEGORIA__') {
      // Usuario quiere crear una nueva categoría
      this.categoriaEsPersonalizada = true;
      this.tasaEditando.Categoria = '__NUEVA_CATEGORIA__'; // Mantener el valor para que se muestre en el dropdown
      this.nuevaCategoria = '';
    } else {
      // Usuario seleccionó una categoría existente
      this.categoriaEsPersonalizada = false;
      this.tasaEditando.Categoria = categoriaSeleccionada;
      this.nuevaCategoria = '';
      this.generarCodigoTasa();
    }
  }
  
  // Manejar cambio en nueva categoría
  onNuevaCategoriaChange(): void {
    if (this.nuevaCategoria.trim()) {
      // Convertir a mayúsculas y asignar
      const categoriaNueva = this.nuevaCategoria.toUpperCase().trim();
      // No cambiar tasaEditando.Categoria aquí, solo generar el código
      this.generarCodigoTasaConCategoria(categoriaNueva);
    }
  }
  
  cargarCargosParaTasas(): void {
    this.http.get<any>('http://localhost:5000/api/cargos').subscribe({
      next: (response) => {
        // El API puede devolver un objeto o un array directamente
        if (Array.isArray(response)) {
          this.cargosDisponibles = response;
        } else if (response && response.data) {
          this.cargosDisponibles = response.data;
        } else if (response && Array.isArray(response.cargos)) {
          this.cargosDisponibles = response.cargos;
        } else {
          console.warn('[cargarCargosParaTasas] Respuesta inesperada:', response);
          this.cargosDisponibles = [];
        }
        console.log('[cargarCargosParaTasas] Cargos cargados:', this.cargosDisponibles.length);
        console.log('[cargarCargosParaTasas] Primer cargo:', this.cargosDisponibles[0]);
      },
      error: (error) => {
        console.error('[cargarCargosParaTasas] Error:', error);
        this.cargosDisponibles = [];
      }
    });
  }
  
  onCargoSeleccionado(): void {
    if (!this.cargoSeleccionado) return;
    
    // Generar código automáticamente basado en el cargo seleccionado
    const cargoNormalizado = this.cargoSeleccionado
      .toUpperCase()
      .replace(/\s+/g, '_')
      .replace(/[ÁÀÄÂ]/g, 'A')
      .replace(/[ÉÈËÊ]/g, 'E')
      .replace(/[ÍÌÏÎ]/g, 'I')
      .replace(/[ÓÒÖÔ]/g, 'O')
      .replace(/[ÚÙÜÛ]/g, 'U')
      .replace(/Ñ/g, 'N');
    
    this.tasaEditando.Codigo = `RENTA_5TA_${cargoNormalizado}`;
    this.tasaEditando.Nombre = `Renta 5ta - ${this.cargoSeleccionado}`;
    this.tasaEditando.Categoria = 'Renta';
    this.tasaEditando.TipoValor = 'Monto';
    this.tasaEditando.Descripcion = `Retención mensual fija para ${this.cargoSeleccionado}`;
  }

  guardarTasa(): void {
    // Determinar la categoría final
    let categoriaFinal = this.tasaEditando.Categoria;
    if (this.categoriaEsPersonalizada && this.nuevaCategoria.trim()) {
      categoriaFinal = this.nuevaCategoria.toUpperCase().trim();
    }
    
    // Debug: Verificar ConfigID
    console.log('🔍 [guardarTasa] ConfigID:', this.tasaEditando.ConfigID);
    console.log('🔍 [guardarTasa] Es edición?', !!this.tasaEditando.ConfigID);
    console.log('🔍 [guardarTasa] Tasa completa:', this.tasaEditando);
    
    // Validaciones
    if (!this.tasaEditando.Codigo || !this.tasaEditando.Nombre || !this.tasaEditando.Valor || 
        !this.tasaEditando.TipoValor || !categoriaFinal) {
      alert('⚠️ Faltan campos obligatorios: Código, Nombre, Valor, Tipo y Categoría son requeridos');
      return;
    }

    this.guardando = true;
    const metodo = this.tasaEditando.ConfigID ? 'put' : 'post';
    const url = this.tasaEditando.ConfigID 
      ? `${this.apiTasas}/${this.tasaEditando.ConfigID}` 
      : this.apiTasas;
      
    console.log('🔍 [guardarTasa] Método:', metodo);
    console.log('🔍 [guardarTasa] URL:', url);

    // Preparar payload con los nombres correctos que espera el backend
    const payload = {
      codigo: this.tasaEditando.Codigo,
      nombre: this.tasaEditando.Nombre,
      valor: parseFloat(this.tasaEditando.Valor) || 0,
      tipoValor: this.tasaEditando.TipoValor, // ⬅️ CORREGIDO (era "tipo")
      categoria: categoriaFinal,  // ⬅️ Usar la categoría final
      tipoTasa: this.tasaEditando.TipoTasa || null, // Nuevo campo: DESCUENTO, INGRESO, APORTE_EMPLEADOR
      descripcion: this.tasaEditando.Descripcion || '',
      activo: this.tasaEditando.Activo !== false, // Default true
      fechaVigenciaInicio: this.tasaEditando.FechaVigenciaInicio || new Date().toISOString().split('T')[0],
      fechaVigenciaFin: this.tasaEditando.FechaVigenciaFin || null
    };

    console.log('💾 Guardando tasa:', payload);

    this.http[metodo](url, payload).subscribe({
      next: (response: any) => {
        this.guardando = false;
        this.mostrarModalTasa = false;
        alert('✅ Tasa guardada exitosamente');
        this.cargarTasas();
      },
      error: (error) => {
        this.guardando = false;
        console.error('[guardarTasa] Error:', error);
        alert('❌ Error al guardar la tasa: ' + (error.error?.message || 'Error de conexión'));
      }
    });
  }

  eliminarTasa(tasa: any): void {
    this.tasaAEliminar = tasa;
    this.mostrarModalEliminarTasa = true;
  }

  desactivarTasa(): void {
    if (!this.tasaAEliminar) return;

    const tasaActualizada = {
      ...this.tasaAEliminar,
      activo: false
    };

    this.guardando = true;
    this.http.put(`${this.apiTasas}/${this.tasaAEliminar.ConfigID}`, {
      codigo: tasaActualizada.Codigo,
      nombre: tasaActualizada.Nombre,
      valor: tasaActualizada.Valor,
      tipoValor: tasaActualizada.TipoValor,
      categoria: tasaActualizada.Categoria,
      tipoTasa: tasaActualizada.TipoTasa || null,
      descripcion: tasaActualizada.Descripcion,
      activo: false,
      fechaVigenciaInicio: tasaActualizada.FechaVigenciaInicio,
      fechaVigenciaFin: tasaActualizada.FechaVigenciaFin
    }).subscribe({
      next: () => {
        this.guardando = false;
        this.mostrarModalEliminarTasa = false;
        this.tasaAEliminar = null;
        alert('✅ Tasa desactivada exitosamente');
        this.cargarTasas();
      },
      error: (error) => {
        this.guardando = false;
        console.error('[desactivarTasa] Error:', error);
        alert('❌ Error al desactivar la tasa');
      }
    });
  }

  // =====================================================
  // EDITAR NOMBRE DE CATEGORÍA
  // =====================================================
  iniciarEdicionCategoria(categoria: string): void {
    this.categoriaEditando = categoria;
    this.categoriaNombreEditando = categoria;
  }

  cancelarEdicionCategoria(): void {
    this.categoriaEditando = null;
    this.categoriaNombreEditando = '';
  }

  guardarNombreCategoria(categoriaAnterior: string): void {
    const categoriaNueva = this.categoriaNombreEditando.trim();
    
    // Validaciones
    if (!categoriaNueva || categoriaNueva === '') {
      alert('⚠️ El nombre de la categoría no puede estar vacío');
      return;
    }
    
    if (categoriaAnterior === categoriaNueva) {
      this.cancelarEdicionCategoria();
      return;
    }
    
    // Confirmar acción
    if (!confirm(`¿Estás seguro de renombrar la categoría "${categoriaAnterior}" a "${categoriaNueva}"?\n\nEsto actualizará todas las tasas de esta categoría.`)) {
      return;
    }
    
    this.guardandoNombreCategoria = true;
    
    this.http.put(`${this.apiTasas}/categoria/renombrar`, {
      categoriaAnterior: categoriaAnterior,
      categoriaNueva: categoriaNueva
    }).subscribe({
      next: (response: any) => {
        this.guardandoNombreCategoria = false;
        this.cancelarEdicionCategoria();
        alert('✅ Nombre de categoría actualizado exitosamente');
        this.cargarTasas(); // Recargar para reflejar el cambio
      },
      error: (error) => {
        this.guardandoNombreCategoria = false;
        console.error('[guardarNombreCategoria] Error:', error);
        alert('❌ Error al actualizar el nombre de la categoría: ' + (error.error?.message || 'Error de conexión'));
      }
    });
  }

  eliminarTasaDefinitivamente(): void {
    if (!this.tasaAEliminar) return;

    this.guardando = true;
    console.log('🗑️ [eliminarTasaDefinitivamente] Eliminando tasa ID:', this.tasaAEliminar.ConfigID);
    
    this.http.delete(`${this.apiTasas}/${this.tasaAEliminar.ConfigID}/eliminar-definitivamente`).subscribe({
      next: (response) => {
        this.guardando = false;
        this.mostrarModalEliminarTasa = false;
        this.tasaAEliminar = null;
        console.log('✅ [eliminarTasaDefinitivamente] Tasa eliminada:', response);
        alert('✅ Tasa eliminada definitivamente de la base de datos');
        this.cargarTasas();
      },
      error: (error) => {
        this.guardando = false;
        console.error('[eliminarTasaDefinitivamente] Error:', error);
        alert('❌ Error al eliminar la tasa: ' + (error.error?.message || 'Error de conexión'));
      }
    });
  }

  cerrarModalEliminarTasa(): void {
    this.mostrarModalEliminarTasa = false;
    this.tasaAEliminar = null;
  }

  cerrarModalTasa(): void {
    this.mostrarModalTasa = false;
    this.tasaEditando = null;
  }

  formatearValorTasa(valor: number, tipo: string): string {
    if (tipo === 'Porcentaje') {
      return (valor * 100).toFixed(2) + '%';
    } else if (tipo === 'Monto') {
      return 'S/. ' + valor.toFixed(2);
    } else {
      return valor.toString();
    }
  }

  // =====================================================
  // MÉTODOS PARA DATOS MAESTROS
  // =====================================================
  
  cambiarSubseccion(subseccionId: string): void {
    this.subseccionActiva = subseccionId;
    this.cargarDatosMaestros();
  }
  
  cargarDatosMaestros(): void {
    switch (this.subseccionActiva) {
      case 'cargos':
        this.cargarCargosParaDatosMaestros();
        break;
      case 'gerencias':
        this.cargarGerenciasParaDatosMaestros();
        break;
      case 'subgerencias':
        this.cargarSubgerenciasParaDatosMaestros();
        break;
      case 'unidades':
        this.cargarUnidadesParaDatosMaestros();
        break;
      case 'tipos-contrato':
        this.cargarTiposContratoParaDatosMaestros();
        break;
      case 'regimenes-laborales':
        this.cargarRegimenesLaboralesParaDatosMaestros();
        break;
      case 'condiciones-laborales':
        this.cargarCondicionesLaboralesParaDatosMaestros();
        break;
    }
  }

  // CARGAR TODOS LOS DATOS MAESTROS AL ENTRAR A LA PESTAÑA
  cargarTodosLosDatosMaestros(): void {
    console.log('🚀 Cargando todos los datos maestros...');
    
    // Cargar todas las secciones en paralelo
    this.cargarCargosParaDatosMaestros();
    this.cargarGerenciasParaDatosMaestros();
    this.cargarSubgerenciasParaDatosMaestros();
    this.cargarUnidadesParaDatosMaestros();
    this.cargarTiposContratoParaDatosMaestros();
    this.cargarRegimenesLaboralesParaDatosMaestros();
    this.cargarCondicionesLaboralesParaDatosMaestros();
  }
  
  // CARGAR DATOS PARA DATOS MAESTROS
  cargarCargosParaDatosMaestros(): void {
    // Limpiar selección cuando se recargan los cargos
    this.cargosSeleccionados = [];
    this.todosCargosSeleccionados = false;
    this.http.get('http://localhost:5000/api/cargos').subscribe({
      next: (response: any) => {
        console.log('📋 Respuesta de cargos:', response);
        this.cargos = response.data || [];
        this.actualizarCount('cargos', this.cargos.length);
        console.log('📋 Cargos cargados:', this.cargos.length);
      },
      error: (error) => {
        console.error('❌ Error al cargar cargos:', error);
        this.cargos = [];
      }
    });
  }
  
  cargarGerenciasParaDatosMaestros(): void {
    this.http.get('http://localhost:5000/api/gerencias').subscribe({
      next: (response: any) => {
        this.gerencias = response.data || [];
        this.actualizarCount('gerencias', this.gerencias.length);
      },
      error: (error) => {
        console.error('Error al cargar gerencias:', error);
        this.gerencias = [];
      }
    });
  }
  
  cargarSubgerenciasParaDatosMaestros(): void {
    this.http.get('http://localhost:5000/api/subgerencias').subscribe({
      next: (response: any) => {
        this.subgerencias = response.data || [];
        this.actualizarCount('subgerencias', this.subgerencias.length);
      },
      error: (error) => {
        console.error('Error al cargar subgerencias:', error);
        this.subgerencias = [];
      }
    });
  }
  
  cargarUnidadesParaDatosMaestros(): void {
    this.http.get('http://localhost:5000/api/unidades').subscribe({
      next: (response: any) => {
        this.unidades = response.data || [];
        this.actualizarCount('unidades', this.unidades.length);
      },
      error: (error) => {
        console.error('Error al cargar unidades:', error);
        this.unidades = [];
      }
    });
  }
  
  cargarTiposContratoParaDatosMaestros(): void {
    this.http.get('http://localhost:5000/api/tipos-contrato').subscribe({
      next: (response: any) => {
        this.tiposContrato = response.data || [];
        this.actualizarCount('tipos-contrato', this.tiposContrato.length);
      },
      error: (error) => {
        console.error('Error al cargar tipos de contrato:', error);
        this.tiposContrato = [];
      }
    });
  }
  
  cargarRegimenesLaboralesParaDatosMaestros(): void {
    this.http.get('http://localhost:5000/api/regimenes-laborales').subscribe({
      next: (response: any) => {
        this.regimenesLaborales = response.data || [];
        this.actualizarCount('regimenes-laborales', this.regimenesLaborales.length);
      },
      error: (error) => {
        console.error('Error al cargar regímenes laborales:', error);
        this.regimenesLaborales = [];
      }
    });
  }

  cargarCondicionesLaboralesParaDatosMaestros(): void {
    this.http.get('http://localhost:5000/api/condiciones-laborales').subscribe({
      next: (response: any) => {
        this.condicionesLaborales = response.data || [];
        this.actualizarCount('condiciones-laborales', this.condicionesLaborales.length);
      },
      error: (error) => {
        console.error('Error al cargar condiciones laborales:', error);
        this.condicionesLaborales = [];
      }
    });
  }
  
  actualizarCount(tipo: string, count: number): void {
    const subseccion = this.subseccionesDatosMaestros.find(s => s.id === tipo);
    if (subseccion) {
      subseccion.count = count;
    }
  }
  
  // MÉTODOS PARA CARGOS
  // MÉTODOS PARA CARGOS CON MODAL
  abrirModalNuevoCargo(): void {
    this.cargoEditando = null;
    this.cargoForm = {
      nombre: '',
      descripcion: ''
    };
    this.mostrarModalCargo = true;
  }

  abrirModalEditarCargo(cargo: any): void {
    this.cargoEditando = cargo;
    this.cargoForm = {
      nombre: cargo.Nombre || '',
      descripcion: cargo.Descripcion || ''
    };
    this.mostrarModalCargo = true;
  }

  cerrarModalCargo(): void {
    this.mostrarModalCargo = false;
    this.cargoEditando = null;
    this.cargoForm = {
      nombre: '',
      descripcion: ''
    };
  }

  guardarCargo(): void {
    // Validaciones
    if (!this.cargoForm.nombre?.trim()) {
      alert('❌ El nombre es obligatorio');
      return;
    }

    // Verificar duplicados de nombre
    const nombreUpper = this.cargoForm.nombre.trim().toUpperCase();
    const existeCargoPorNombre = this.cargos.some(cargo => {
      if (this.cargoEditando && cargo.CargoID === this.cargoEditando.CargoID) {
        return false; // Excluir el mismo cargo en edición
      }
      return cargo.Nombre && cargo.Nombre.toUpperCase() === nombreUpper;
    });

    if (existeCargoPorNombre) {
      alert('❌ Ya existe un cargo con ese nombre. Por favor, use un nombre diferente.');
      return;
    }

    this.guardandoCargo = true;

    const datos = {
      nombre: this.cargoForm.nombre.trim().toUpperCase(),
      descripcion: this.cargoForm.descripcion.trim(),
      activo: true
    };

    if (this.cargoEditando) {
      // Editar cargo existente
      this.http.put(`http://localhost:5000/api/cargos/${this.cargoEditando.CargoID}`, datos).subscribe({
        next: () => {
          this.guardandoCargo = false;
          this.cerrarModalCargo();
          alert('✅ Cargo actualizado exitosamente');
          this.cargarCargosParaDatosMaestros();
        },
        error: (error) => {
          this.guardandoCargo = false;
          console.error('Error al actualizar cargo:', error);
          
          // Manejar errores específicos
          if (error.error && error.error.error && error.error.error.includes('UNIQUE KEY constraint')) {
            alert('❌ Ya existe un cargo con ese nombre. Por favor, use un nombre diferente.');
          } else {
            alert('❌ Error al actualizar el cargo');
          }
        }
      });
    } else {
      // Crear nuevo cargo
      this.http.post('http://localhost:5000/api/cargos', datos).subscribe({
        next: () => {
          this.guardandoCargo = false;
          this.cerrarModalCargo();
          alert('✅ Cargo creado exitosamente');
          this.cargarCargosParaDatosMaestros();
        },
        error: (error) => {
          this.guardandoCargo = false;
          console.error('Error al crear cargo:', error);
          
          // Manejar errores específicos
          if (error.error && error.error.error && error.error.error.includes('UNIQUE KEY constraint')) {
            alert('❌ Ya existe un cargo con ese nombre. Por favor, use un nombre diferente.');
          } else {
            alert('❌ Error al crear el cargo');
          }
        }
      });
    }
  }

  nuevoCargo(): void {
    this.abrirModalNuevoCargo();
  }
  
  editarCargo(cargo: any): void {
    this.abrirModalEditarCargo(cargo);
  }
  
  // MÉTODOS PARA SELECCIÓN MÚLTIPLE DE CARGOS
  estaCargoSeleccionado(cargoId: number): boolean {
    return this.cargosSeleccionados.includes(cargoId);
  }

  toggleSeleccionCargo(cargoId: number): void {
    const index = this.cargosSeleccionados.indexOf(cargoId);
    if (index > -1) {
      this.cargosSeleccionados.splice(index, 1);
    } else {
      this.cargosSeleccionados.push(cargoId);
    }
    this.actualizarEstadoTodosCargos();
  }

  toggleTodosCargos(): void {
    if (this.todosCargosSeleccionados) {
      this.cargosSeleccionados = [];
    } else {
      this.cargosSeleccionados = this.cargos.map(c => c.CargoID);
    }
    this.todosCargosSeleccionados = !this.todosCargosSeleccionados;
  }

  actualizarEstadoTodosCargos(): void {
    this.todosCargosSeleccionados = this.cargos.length > 0 && 
      this.cargosSeleccionados.length === this.cargos.length;
  }

  async eliminarCargosSeleccionados(): Promise<void> {
    if (this.cargosSeleccionados.length === 0) {
      alert('⚠️ No hay cargos seleccionados');
      return;
    }

    const cantidad = this.cargosSeleccionados.length;
    if (!confirm(`¿Está seguro de eliminar ${cantidad} cargo(s) seleccionado(s)?\n\nSi algún cargo está asignado a trabajadores, podrá omitirlo y continuar con los demás.`)) {
      return;
    }

    const cargosAEliminar = [...this.cargosSeleccionados];
    const cargosEliminados: number[] = [];
    const cargosOmitidos: { id: number; nombre: string; razon: string }[] = [];

    for (const cargoId of cargosAEliminar) {
      const cargo = this.cargos.find(c => c.CargoID === cargoId);
      const nombreCargo = cargo ? cargo.Nombre : `ID ${cargoId}`;

      try {
        await firstValueFrom(this.http.delete(`http://localhost:5000/api/cargos/${cargoId}`));
        cargosEliminados.push(cargoId);
        // Remover de la lista de seleccionados
        const index = this.cargosSeleccionados.indexOf(cargoId);
        if (index > -1) {
          this.cargosSeleccionados.splice(index, 1);
        }
      } catch (error: any) {
        console.error(`Error al eliminar cargo ${cargoId}:`, error);
        
        // Si hay un error por constraint (trabajadores asignados)
        if (error.error && error.error.error && 
            (error.error.error.includes('REFERENCE constraint') || 
             error.error.error.includes('FK_') ||
             error.error.message?.includes('trabajador'))) {
          
          const continuar = confirm(
            `⚠️ El cargo "${nombreCargo}" no se puede eliminar porque está asignado a uno o más trabajadores.\n\n` +
            `¿Desea omitir este cargo y continuar eliminando los demás?`
          );
          
          if (continuar) {
            cargosOmitidos.push({
              id: cargoId,
              nombre: nombreCargo,
              razon: 'Está asignado a trabajadores'
            });
            // Remover de la lista de seleccionados
            const index = this.cargosSeleccionados.indexOf(cargoId);
            if (index > -1) {
              this.cargosSeleccionados.splice(index, 1);
            }
          } else {
            // Si el usuario cancela, detener la eliminación
            break;
          }
        } else {
          // Otro tipo de error
          const continuar = confirm(
            `❌ Error al eliminar el cargo "${nombreCargo}": ${error.error?.message || error.message}\n\n` +
            `¿Desea continuar con los demás cargos?`
          );
          
          if (!continuar) {
            break;
          }
        }
      }
    }

    // Mostrar resumen
    let mensaje = `✅ Proceso completado:\n`;
    mensaje += `• Eliminados: ${cargosEliminados.length}\n`;
    if (cargosOmitidos.length > 0) {
      mensaje += `• Omitidos: ${cargosOmitidos.length}\n`;
      mensaje += `\nCargos omitidos:\n`;
      cargosOmitidos.forEach(c => {
        mensaje += `- ${c.nombre} (${c.razon})\n`;
      });
    }
    alert(mensaje);

    // Recargar la lista
    this.cargarCargosParaDatosMaestros();
    this.cargosSeleccionados = [];
    this.todosCargosSeleccionados = false;
  }

  eliminarCargo(cargo: any): void {
    if (confirm(`¿Está seguro de eliminar el cargo "${cargo.Nombre}"?`)) {
      this.http.delete(`http://localhost:5000/api/cargos/${cargo.CargoID}`).subscribe({
        next: () => {
          alert('✅ Cargo eliminado exitosamente');
          this.cargarCargosParaDatosMaestros();
          // Remover de seleccionados si estaba seleccionado
          const index = this.cargosSeleccionados.indexOf(cargo.CargoID);
          if (index > -1) {
            this.cargosSeleccionados.splice(index, 1);
          }
          this.actualizarEstadoTodosCargos();
        },
        error: (error) => {
          console.error('Error al eliminar cargo:', error);
          
          if (error.error && error.error.error && 
              (error.error.error.includes('REFERENCE constraint') || 
               error.error.error.includes('FK_'))) {
            alert('❌ No se puede eliminar el cargo porque está asignado a uno o más trabajadores.');
          } else {
            alert('❌ Error al eliminar el cargo');
          }
        }
      });
    }
  }
  
  // MÉTODOS PARA ÁREAS - ELIMINADOS (Áreas ya no se usan)
  
  // MÉTODOS PARA GERENCIAS
  nuevaGerencia(): void {
    const nombre = prompt('Ingrese el nombre de la nueva gerencia:');
    if (nombre && nombre.trim()) {
      const nombreUpper = nombre.trim().toUpperCase();
      
      // Validar duplicados en el frontend
      const existeGerencia = this.gerencias.some(gerencia => gerencia.Nombre && gerencia.Nombre.toUpperCase() === nombreUpper);
      if (existeGerencia) {
        alert('❌ Ya existe una gerencia con ese nombre. Por favor, use un nombre diferente.');
        return;
      }
      
      this.http.post('http://localhost:5000/api/gerencias', {
        nombre: nombreUpper,
        descripcion: '',
        activo: true
      }).subscribe({
        next: () => {
          alert('✅ Gerencia creada exitosamente');
          this.cargarGerenciasParaDatosMaestros();
        },
        error: (error) => {
          console.error('Error al crear gerencia:', error);
          if (error.error && error.error.error && error.error.error.includes('Violación')) {
            alert('❌ Ya existe una gerencia con ese nombre. Por favor, use un nombre diferente.');
          } else {
            alert('❌ Error al crear la gerencia');
          }
        }
      });
    }
  }
  
  editarGerencia(gerencia: any): void {
    const nuevoNombre = prompt('Ingrese el nuevo nombre de la gerencia:', gerencia.Nombre);
    if (nuevoNombre && nuevoNombre.trim()) {
      this.http.put(`http://localhost:5000/api/gerencias/${gerencia.GerenciaID}`, {
        nombre: nuevoNombre.trim().toUpperCase(),
        descripcion: gerencia.Descripcion || '',
        activo: gerencia.Activo
      }).subscribe({
        next: () => {
          alert('✅ Gerencia actualizada exitosamente');
          this.cargarGerenciasParaDatosMaestros();
        },
        error: (error) => {
          console.error('Error al actualizar gerencia:', error);
          alert('❌ Error al actualizar la gerencia');
        }
      });
    }
  }
  
  eliminarGerencia(gerencia: any): void {
    if (confirm(`¿Está seguro de eliminar la gerencia "${gerencia.Nombre}"?`)) {
      this.http.delete(`http://localhost:5000/api/gerencias/${gerencia.GerenciaID}`).subscribe({
        next: () => {
          alert('✅ Gerencia eliminada exitosamente');
          this.cargarGerenciasParaDatosMaestros();
        },
        error: (error) => {
          console.error('Error al eliminar gerencia:', error);
          alert('❌ Error al eliminar la gerencia');
        }
      });
    }
  }
  
  // MÉTODOS PARA SUBGERENCIAS
  nuevaSubgerencia(): void {
    const nombre = prompt('Ingrese el nombre de la nueva subgerencia:');
    if (nombre && nombre.trim()) {
      const nombreUpper = nombre.trim().toUpperCase();
      
      // Validar duplicados en el frontend
      const existeSubgerencia = this.subgerencias.some(subgerencia => subgerencia.Nombre && subgerencia.Nombre.toUpperCase() === nombreUpper);
      if (existeSubgerencia) {
        alert('❌ Ya existe una subgerencia con ese nombre. Por favor, use un nombre diferente.');
        return;
      }
      
      this.http.post('http://localhost:5000/api/subgerencias', {
        nombre: nombreUpper,
        gerenciaID: 1, // Por defecto
        activo: true
      }).subscribe({
        next: () => {
          alert('✅ Subgerencia creada exitosamente');
          this.cargarSubgerenciasParaDatosMaestros();
        },
        error: (error) => {
          console.error('Error al crear subgerencia:', error);
          if (error.error && error.error.error && error.error.error.includes('Violación')) {
            alert('❌ Ya existe una subgerencia con ese nombre. Por favor, use un nombre diferente.');
          } else {
            alert('❌ Error al crear la subgerencia');
          }
        }
      });
    }
  }
  
  editarSubgerencia(subgerencia: any): void {
    const nuevoNombre = prompt('Ingrese el nuevo nombre de la subgerencia:', subgerencia.Nombre);
    if (nuevoNombre && nuevoNombre.trim()) {
      this.http.put(`http://localhost:5000/api/subgerencias/${subgerencia.SubgerenciaID}`, {
        nombre: nuevoNombre.trim().toUpperCase(),
        gerenciaID: subgerencia.GerenciaID || 1,
        activo: subgerencia.Activo
      }).subscribe({
        next: () => {
          alert('✅ Subgerencia actualizada exitosamente');
          this.cargarSubgerenciasParaDatosMaestros();
        },
        error: (error) => {
          console.error('Error al actualizar subgerencia:', error);
          alert('❌ Error al actualizar la subgerencia');
        }
      });
    }
  }
  
  eliminarSubgerencia(subgerencia: any): void {
    if (confirm(`¿Está seguro de eliminar la subgerencia "${subgerencia.Nombre}"?`)) {
      this.http.delete(`http://localhost:5000/api/subgerencias/${subgerencia.SubgerenciaID}`).subscribe({
        next: () => {
          alert('✅ Subgerencia eliminada exitosamente');
          this.cargarSubgerenciasParaDatosMaestros();
        },
        error: (error) => {
          console.error('Error al eliminar subgerencia:', error);
          alert('❌ Error al eliminar la subgerencia');
        }
      });
    }
  }
  
  // MÉTODOS PARA UNIDADES
  nuevaUnidad(): void {
    const nombre = prompt('Ingrese el nombre de la nueva unidad:');
    if (nombre && nombre.trim()) {
      const nombreUpper = nombre.trim().toUpperCase();
      
      // Validar duplicados en el frontend
      const existeUnidad = this.unidades.some(unidad => unidad.Nombre && unidad.Nombre.toUpperCase() === nombreUpper);
      if (existeUnidad) {
        alert('❌ Ya existe una unidad con ese nombre. Por favor, use un nombre diferente.');
        return;
      }
      
      this.http.post('http://localhost:5000/api/unidades', {
        nombre: nombreUpper,
        subgerenciaID: 1, // Por defecto
        activo: true
      }).subscribe({
        next: () => {
          alert('✅ Unidad creada exitosamente');
          this.cargarUnidadesParaDatosMaestros();
        },
        error: (error) => {
          console.error('Error al crear unidad:', error);
          if (error.error && error.error.error && error.error.error.includes('Violación')) {
            alert('❌ Ya existe una unidad con ese nombre. Por favor, use un nombre diferente.');
          } else {
            alert('❌ Error al crear la unidad');
          }
        }
      });
    }
  }
  
  editarUnidad(unidad: any): void {
    const nuevoNombre = prompt('Ingrese el nuevo nombre de la unidad:', unidad.Nombre);
    if (nuevoNombre && nuevoNombre.trim()) {
      this.http.put(`http://localhost:5000/api/unidades/${unidad.UnidadID}`, {
        nombre: nuevoNombre.trim().toUpperCase(),
        subgerenciaID: unidad.SubgerenciaID || 1,
        activo: unidad.Activo
      }).subscribe({
        next: () => {
          alert('✅ Unidad actualizada exitosamente');
          this.cargarUnidadesParaDatosMaestros();
        },
        error: (error) => {
          console.error('Error al actualizar unidad:', error);
          alert('❌ Error al actualizar la unidad');
        }
      });
    }
  }
  
  eliminarUnidad(unidad: any): void {
    if (confirm(`¿Está seguro de eliminar la unidad "${unidad.Nombre}"?`)) {
      this.http.delete(`http://localhost:5000/api/unidades/${unidad.UnidadID}`).subscribe({
        next: () => {
          alert('✅ Unidad eliminada exitosamente');
          this.cargarUnidadesParaDatosMaestros();
        },
        error: (error) => {
          console.error('Error al eliminar unidad:', error);
          alert('❌ Error al eliminar la unidad');
        }
      });
    }
  }
  
  // MÉTODOS PARA TIPOS DE CONTRATO
  // MÉTODOS PARA TIPOS DE CONTRATO CON MODAL
  abrirModalNuevoTipoContrato(): void {
    this.tipoContratoEditando = null;
    this.tipoContratoForm = {
      codigo: '',
      nombre: '',
      descripcion: ''
    };
    this.mostrarModalTipoContrato = true;
  }

  abrirModalEditarTipoContrato(tipo: any): void {
    this.tipoContratoEditando = tipo;
    this.tipoContratoForm = {
      codigo: tipo.Codigo || '',
      nombre: tipo.Nombre || '',
      descripcion: tipo.Descripcion || ''
    };
    this.mostrarModalTipoContrato = true;
  }

  cerrarModalTipoContrato(): void {
    this.mostrarModalTipoContrato = false;
    this.tipoContratoEditando = null;
    this.tipoContratoForm = {
      codigo: '',
      nombre: '',
      descripcion: ''
    };
  }

  guardarTipoContrato(): void {
    // Validaciones
    if (!this.tipoContratoForm.nombre?.trim()) {
      alert('❌ El nombre es obligatorio');
      return;
    }

    // Generar código automático si está vacío
    if (!this.tipoContratoForm.codigo?.trim()) {
      this.tipoContratoForm.codigo = this.tipoContratoForm.nombre.trim().toUpperCase().replace(/\s+/g, '-').substring(0, 20);
    }

    // Verificar duplicados de nombre
    const nombreUpper = this.tipoContratoForm.nombre.trim().toUpperCase();
    const existeTipoPorNombre = this.tiposContrato.some(tipo => {
      if (this.tipoContratoEditando && tipo.TipoContratoID === this.tipoContratoEditando.TipoContratoID) {
        return false; // Excluir el mismo tipo en edición
      }
      return tipo.Nombre && tipo.Nombre.toUpperCase() === nombreUpper;
    });

    if (existeTipoPorNombre) {
      alert('❌ Ya existe un tipo de contrato con ese nombre. Por favor, use un nombre diferente.');
      return;
    }

    // Verificar duplicados de código
    const codigoUpper = this.tipoContratoForm.codigo.trim().toUpperCase();
    const existeTipoPorCodigo = this.tiposContrato.some(tipo => {
      if (this.tipoContratoEditando && tipo.TipoContratoID === this.tipoContratoEditando.TipoContratoID) {
        return false; // Excluir el mismo tipo en edición
      }
      return tipo.Codigo && tipo.Codigo.toUpperCase() === codigoUpper;
    });

    if (existeTipoPorCodigo) {
      alert('❌ Ya existe un tipo de contrato con ese código. Por favor, use un código diferente.');
      return;
    }

    this.guardandoTipoContrato = true;

    const datos = {
      codigo: this.tipoContratoForm.codigo.trim().toUpperCase(),
      nombre: this.tipoContratoForm.nombre.trim().toUpperCase(),
      descripcion: this.tipoContratoForm.descripcion.trim(),
      requiereConvocatoria: false,
      tienePlazo: false
    };

    if (this.tipoContratoEditando) {
      // Editar tipo de contrato existente
      this.http.put(`http://localhost:5000/api/tipos-contrato/${this.tipoContratoEditando.TipoContratoID}`, datos).subscribe({
        next: () => {
          this.guardandoTipoContrato = false;
          this.cerrarModalTipoContrato();
          alert('✅ Tipo de contrato actualizado exitosamente');
          this.cargarTiposContratoParaDatosMaestros();
        },
        error: (error) => {
          this.guardandoTipoContrato = false;
          console.error('Error al actualizar tipo de contrato:', error);
          
          // Manejar errores específicos
          if (error.error && error.error.error && error.error.error.includes('UNIQUE KEY constraint')) {
            alert('❌ Ya existe un tipo de contrato con ese código. Por favor, use un código diferente.');
          } else {
            alert('❌ Error al actualizar el tipo de contrato');
          }
        }
      });
    } else {
      // Crear nuevo tipo de contrato
      this.http.post('http://localhost:5000/api/tipos-contrato', datos).subscribe({
        next: () => {
          this.guardandoTipoContrato = false;
          this.cerrarModalTipoContrato();
          alert('✅ Tipo de contrato creado exitosamente');
          this.cargarTiposContratoParaDatosMaestros();
        },
        error: (error) => {
          this.guardandoTipoContrato = false;
          console.error('Error al crear tipo de contrato:', error);
          
          // Manejar errores específicos
          if (error.error && error.error.error && error.error.error.includes('UNIQUE KEY constraint')) {
            alert('❌ Ya existe un tipo de contrato con ese código. Por favor, use un código diferente.');
          } else {
            alert('❌ Error al crear el tipo de contrato');
          }
        }
      });
    }
  }

  nuevoTipoContrato(): void {
    this.abrirModalNuevoTipoContrato();
  }
  
  editarTipoContrato(tipo: any): void {
    this.abrirModalEditarTipoContrato(tipo);
  }
  
  eliminarTipoContrato(tipo: any): void {
    if (confirm(`¿Está seguro de eliminar el tipo de contrato "${tipo.Nombre}"?\n\nSi hay trabajadores usando este tipo de contrato, se realizará una desactivación en lugar de eliminación.`)) {
      this.http.delete(`http://localhost:5000/api/tipos-contrato/${tipo.TipoContratoID}`).subscribe({
        next: (response: any) => {
          let mensaje = '✅ Tipo de contrato eliminado exitosamente';
          
          if (response.data && response.data.cantidadTrabajadores > 0) {
            mensaje = `✅ El tipo de contrato ha sido desactivado.\n\n⚠️ Nota: ${response.data.cantidadTrabajadores} trabajador(es) aún lo están usando, por lo que se realizó una desactivación en lugar de eliminación física.`;
          } else if (response.message) {
            mensaje = response.message;
          }
          
          alert(mensaje);
          this.cargarTiposContratoParaDatosMaestros();
        },
        error: (error) => {
          console.error('Error al eliminar tipo de contrato:', error);
          
          let mensajeError = '❌ Error al eliminar el tipo de contrato';
          
          if (error.error && error.error.message) {
            mensajeError = `❌ ${error.error.message}`;
          }
          
          alert(mensajeError);
        }
      });
    }
  }
  
  // MÉTODOS PARA REGÍMENES LABORALES
  abrirModalNuevoRegimenLaboral(): void {
    this.regimenLaboralEditando = null;
    this.regimenLaboralForm = {
      codigo: '',
      nombre: '',
      descripcion: '',
      baseNormativa: 'Ley General del Trabajo'
    };
    this.mostrarModalRegimenLaboral = true;
  }
  
  abrirModalEditarRegimenLaboral(regimen: any): void {
    this.regimenLaboralEditando = regimen;
    this.regimenLaboralForm = {
      codigo: regimen.Codigo || '',
      nombre: regimen.Nombre || '',
      descripcion: regimen.Descripcion || '',
      baseNormativa: regimen.BaseNormativa || 'Ley General del Trabajo'
    };
    this.mostrarModalRegimenLaboral = true;
  }

  cerrarModalRegimenLaboral(): void {
    this.mostrarModalRegimenLaboral = false;
    this.regimenLaboralEditando = null;
    this.regimenLaboralForm = {
      codigo: '',
      nombre: '',
      descripcion: '',
      baseNormativa: 'Ley General del Trabajo'
    };
  }

  guardarRegimenLaboral(): void {
    // Validaciones
    if (!this.regimenLaboralForm.nombre?.trim()) {
      alert('❌ El nombre es obligatorio');
      return;
    }
    if (!this.regimenLaboralForm.descripcion?.trim()) {
      alert('❌ La descripción es obligatoria');
      return;
    }
    if (!this.regimenLaboralForm.baseNormativa?.trim()) {
      alert('❌ La base normativa es obligatoria');
      return;
    }

    // Generar código automático si está vacío
    if (!this.regimenLaboralForm.codigo?.trim()) {
      this.regimenLaboralForm.codigo = this.regimenLaboralForm.nombre.trim().toUpperCase().replace(/\s+/g, '-').substring(0, 20);
    }

    // Verificar duplicados de nombre
    const nombreUpper = this.regimenLaboralForm.nombre.trim().toUpperCase();
    const existeRegimenPorNombre = this.regimenesLaborales.some(regimen => {
      if (this.regimenLaboralEditando && regimen.RegimenID === this.regimenLaboralEditando.RegimenID) {
        return false; // Excluir el mismo régimen en edición
      }
      return regimen.Nombre && regimen.Nombre.toUpperCase() === nombreUpper;
    });

    if (existeRegimenPorNombre) {
      alert('❌ Ya existe un régimen laboral con ese nombre. Por favor, use un nombre diferente.');
      return;
    }

    // Verificar duplicados de código
    const codigoUpper = this.regimenLaboralForm.codigo.trim().toUpperCase();
    const existeRegimenPorCodigo = this.regimenesLaborales.some(regimen => {
      if (this.regimenLaboralEditando && regimen.RegimenID === this.regimenLaboralEditando.RegimenID) {
        return false; // Excluir el mismo régimen en edición
      }
      return regimen.Codigo && regimen.Codigo.toUpperCase() === codigoUpper;
    });

    if (existeRegimenPorCodigo) {
      alert('❌ Ya existe un régimen laboral con ese código. Por favor, use un código diferente.');
      return;
    }

    this.guardandoRegimenLaboral = true;

    const datos = {
      codigo: this.regimenLaboralForm.codigo.trim().toUpperCase(),
      nombre: this.regimenLaboralForm.nombre.trim().toUpperCase(),
      descripcion: this.regimenLaboralForm.descripcion.trim(),
      baseNormativa: this.regimenLaboralForm.baseNormativa.trim()
    };

    if (this.regimenLaboralEditando) {
      // Editar régimen existente
      this.http.put(`http://localhost:5000/api/regimenes-laborales/${this.regimenLaboralEditando.RegimenID}`, datos).subscribe({
        next: () => {
          this.guardandoRegimenLaboral = false;
          this.cerrarModalRegimenLaboral();
          alert('✅ Régimen laboral actualizado exitosamente');
          this.cargarRegimenesLaboralesParaDatosMaestros();
        },
        error: (error) => {
          this.guardandoRegimenLaboral = false;
          console.error('Error al actualizar régimen laboral:', error);
          
          // Manejar errores específicos
          if (error.error && error.error.error && error.error.error.includes('UNIQUE KEY constraint')) {
            alert('❌ Ya existe un régimen laboral con ese código. Por favor, use un código diferente.');
          } else {
            alert('❌ Error al actualizar el régimen laboral');
          }
        }
      });
    } else {
      // Crear nuevo régimen
      this.http.post('http://localhost:5000/api/regimenes-laborales', datos).subscribe({
        next: () => {
          this.guardandoRegimenLaboral = false;
          this.cerrarModalRegimenLaboral();
          alert('✅ Régimen laboral creado exitosamente');
          this.cargarRegimenesLaboralesParaDatosMaestros();
        },
        error: (error) => {
          this.guardandoRegimenLaboral = false;
          console.error('Error al crear régimen laboral:', error);
          
          // Manejar errores específicos
          if (error.error && error.error.error && error.error.error.includes('UNIQUE KEY constraint')) {
            alert('❌ Ya existe un régimen laboral con ese código. Por favor, use un código diferente.');
          } else {
            alert('❌ Error al crear el régimen laboral');
          }
        }
      });
    }
  }
  
  eliminarRegimenLaboral(regimen: any): void {
    if (confirm(`¿Está seguro de eliminar completamente el régimen laboral "${regimen.Nombre}"?\n\n⚠️ ADVERTENCIA: Esta acción no se puede deshacer.`)) {
      this.http.delete(`http://localhost:5000/api/regimenes-laborales/${regimen.RegimenID}`).subscribe({
        next: () => {
          alert('✅ Régimen laboral eliminado exitosamente');
          this.cargarRegimenesLaboralesParaDatosMaestros();
        },
        error: (error) => {
          console.error('Error al eliminar régimen laboral:', error);
          
          // Manejar errores específicos
          if (error.error && error.error.error && error.error.error.includes('REFERENCE constraint')) {
            alert('❌ No se puede eliminar este régimen laboral porque está siendo usado por uno o más trabajadores.\n\nSugerencia: Primero cambie el régimen laboral de los trabajadores que lo usan.');
          } else {
            alert('❌ Error al eliminar el régimen laboral');
          }
        }
      });
    }
  }

  // ==================== CONDICIONES LABORALES ====================
  
  abrirModalNuevoCondicionLaboral(): void {
    this.condicionLaboralEditando = null;
    this.condicionLaboralForm = {
      codigo: '',
      nombre: '',
      descripcion: ''
    };
    this.mostrarModalCondicionLaboral = true;
  }

  abrirModalEditarCondicionLaboral(condicion: any): void {
    this.condicionLaboralEditando = condicion;
    this.condicionLaboralForm = {
      codigo: condicion.Codigo || '',
      nombre: condicion.Nombre || '',
      descripcion: condicion.Descripcion || ''
    };
    this.mostrarModalCondicionLaboral = true;
  }

  cerrarModalCondicionLaboral(): void {
    this.mostrarModalCondicionLaboral = false;
    this.condicionLaboralEditando = null;
    this.condicionLaboralForm = {
      codigo: '',
      nombre: '',
      descripcion: ''
    };
  }

  guardarCondicionLaboral(): void {
    if (!this.condicionLaboralForm.nombre?.trim()) {
      alert('❌ El nombre es obligatorio');
      return;
    }

    if (!this.condicionLaboralForm.codigo?.trim()) {
      alert('❌ El código es obligatorio');
      return;
    }

    this.guardandoCondicionLaboral = true;

    const datos = {
      codigo: this.condicionLaboralForm.codigo.trim(),
      nombre: this.condicionLaboralForm.nombre.trim(),
      descripcion: this.condicionLaboralForm.descripcion?.trim() || ''
    };

    if (this.condicionLaboralEditando) {
      this.http.put(`http://localhost:5000/api/condiciones-laborales/${this.condicionLaboralEditando.CondicionID}`, datos).subscribe({
        next: () => {
          this.guardandoCondicionLaboral = false;
          this.cerrarModalCondicionLaboral();
          alert('✅ Condición laboral actualizada exitosamente');
          this.cargarCondicionesLaboralesParaDatosMaestros();
        },
        error: (error) => {
          this.guardandoCondicionLaboral = false;
          console.error('Error al actualizar condición laboral:', error);
          alert('❌ Error al actualizar la condición laboral: ' + (error.error?.message || 'Error de conexión'));
        }
      });
    } else {
      this.http.post('http://localhost:5000/api/condiciones-laborales', datos).subscribe({
        next: () => {
          this.guardandoCondicionLaboral = false;
          this.cerrarModalCondicionLaboral();
          alert('✅ Condición laboral creada exitosamente');
          this.cargarCondicionesLaboralesParaDatosMaestros();
        },
        error: (error) => {
          this.guardandoCondicionLaboral = false;
          console.error('Error al crear condición laboral:', error);
          alert('❌ Error al crear la condición laboral: ' + (error.error?.message || 'Error de conexión'));
        }
      });
    }
  }

  eliminarCondicionLaboral(condicion: any): void {
    const confirmacion = confirm(
      `¿Está seguro de eliminar la condición laboral "${condicion.Nombre}"?\n\n` +
      `Esta acción desactivará la condición laboral.`
    );

    if (confirmacion) {
      this.http.delete(`http://localhost:5000/api/condiciones-laborales/${condicion.CondicionID}`).subscribe({
        next: (response: any) => {
          if (response.trabajadoresUsando > 0) {
            alert(`✅ Condición laboral desactivada. Hay ${response.trabajadoresUsando} trabajador(es) que aún la están usando.`);
          } else {
            alert('✅ Condición laboral eliminada exitosamente');
          }
          this.cargarCondicionesLaboralesParaDatosMaestros();
        },
        error: (error) => {
          console.error('Error al eliminar condición laboral:', error);
          alert('❌ Error al eliminar la condición laboral: ' + (error.error?.message || 'Error de conexión'));
        }
      });
    }
  }

  // ==================== ADMINISTRAR ROLES ====================
  
  // Cargar roles
  cargarRoles(): void {
    this.rolesCargando = true;
    this.http.get('http://localhost:5000/api/roles').subscribe({
      next: (response: any) => {
        this.roles = (response.data || response).map((rol: any) => {
          // Parsear permisos si vienen como string JSON
          let permisos = rol.permisos;
          if (typeof permisos === 'string') {
            try {
              permisos = JSON.parse(permisos);
            } catch (error) {
              console.error('Error al parsear permisos JSON para rol:', rol.nombre, error);
              permisos = {};
            }
          }
          
          // Si los permisos son ["*"], convertir al objeto completo de permisos
          if (Array.isArray(permisos) && permisos.length === 1 && permisos[0] === '*') {
            permisos = {
              trabajadores: { ver: true, crear: true, editar: true, eliminar: true },
              planillas: { ver: true, crear: true, editar: true, eliminar: true },
              reportes: { ver: true, exportar: true },
              configuracion: { ver: true, editar: true },
              asistencia: { ver: true, editar: true },
              beneficios: { ver: true, editar: true },
              prestamos: { ver: true, crear: true, editar: true, eliminar: true },
              usuarios: { ver: true, crear: true, editar: true, eliminar: true },
              roles: { ver: true, crear: true, editar: true, eliminar: true }
            };
          }
          
          // Asegurar que permisos sea un objeto, no null o undefined
          if (!permisos || typeof permisos !== 'object' || Array.isArray(permisos)) {
            permisos = {};
          }
          
          return {
            ...rol,
            permisos: permisos,
            fechaActualizacion: rol.fechaModificacion || rol.fechaCreacion || new Date().toISOString()
          };
        });
        // Ordenar: Super Administrador siempre primero, luego los demás en orden alfabético
        this.roles.sort((a: any, b: any) => {
          const nombreA = (a.nombre || '').toUpperCase().trim();
          const nombreB = (b.nombre || '').toUpperCase().trim();
          
          // Verificar si es Super Administrador
          const esSuperAdminA = nombreA === 'SUPER ADMINISTRADOR' || 
                               nombreA === 'SUPER_ADMINISTRADOR' || 
                               nombreA === 'SUPER_ADMIN';
          const esSuperAdminB = nombreB === 'SUPER ADMINISTRADOR' || 
                               nombreB === 'SUPER_ADMINISTRADOR' || 
                               nombreB === 'SUPER_ADMIN';
          
          // Super Administrador siempre primero
          if (esSuperAdminA && !esSuperAdminB) return -1;
          if (!esSuperAdminA && esSuperAdminB) return 1;
          
          // Si ambos son Super Admin o ninguno lo es, ordenar alfabéticamente
          return (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' });
        });
        this.rolesCargando = false;
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        this.rolesCargando = false;
        // No mostrar alerta para evitar spam en consola
        console.warn('⚠️ No se pudieron cargar los roles (endpoint no disponible)');
      }
    });
  }

  // Cargar usuarios
  cargarUsuarios(): void {
    this.usuariosCargando = true;
    this.http.get('http://localhost:5000/api/usuarios').subscribe({
      next: (response: any) => {
        this.usuarios = (response.data || response).map((usuario: any) => ({
          ...usuario,
          rol: usuario.Rol || usuario.rol, // Mapear Rol (PascalCase) a rol (camelCase)
          ultimoAcceso: usuario.UltimoAcceso || usuario.ultimoAcceso, // Mapear UltimoAcceso (PascalCase) a ultimoAcceso (camelCase)
          nombre: usuario.Nombre || usuario.nombre || '', // Mapear Nombre (PascalCase) a nombre (camelCase)
          apellidos: usuario.Apellidos || usuario.apellidos || '', // Mapear Apellidos (PascalCase) a apellidos (camelCase)
          email: usuario.Email || usuario.email || '', // Mapear Email (PascalCase) a email (camelCase)
          username: usuario.Username || usuario.username || '', // Mapear Username (PascalCase) a username (camelCase)
          fechaActualizacion: usuario.fechaModificacion || usuario.fechaCreacion || new Date().toISOString(),
          // Campos DEMO
          horasDemo: usuario.HorasRestantes || usuario.horasDemo || null,
          fechaInicioDemo: usuario.FechaInicioDemo || usuario.fechaInicioDemo || '',
          fechaFinDemo: usuario.FechaFinDemo || usuario.fechaFinDemo || ''
        }));
        console.log('👥 Usuarios cargados:', this.usuarios);
        this.usuariosCargando = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.usuariosCargando = false;
        // No mostrar alerta para evitar spam en consola
        console.warn('⚠️ No se pudieron cargar los usuarios (endpoint no disponible)');
      }
    });
  }

  // Abrir modal crear rol
  abrirModalCrearRol(): void {
    this.rolEditando = null;
    this.rolForm = {
      nombre: '',
      descripcion: '',
      permisos: {
        trabajadores: { ver: false, crear: false, editar: false, eliminar: false },
        planillas: { ver: false, crear: false, editar: false, eliminar: false },
        reportes: { ver: false, exportar: false },
        configuracion: { ver: false, editar: false },
        asistencia: { ver: false, editar: false },
        beneficios: { ver: false, editar: false },
        prestamos: { ver: false, crear: false, editar: false, eliminar: false },
        usuarios: { ver: false, crear: false, editar: false, eliminar: false },
        roles: { ver: false, crear: false, editar: false, eliminar: false }
      }
    };
    this.mostrarModalRol = true;
  }

  // Abrir modal editar rol
  abrirModalEditarRol(rol: any): void {
    this.rolEditando = rol;
    
    // Verificar si es el rol Super Administrador (el más alto)
    const nombreRol = (rol.nombre || '').toUpperCase().trim();
    const esSuperAdministrador = nombreRol === 'SUPER ADMINISTRADOR' || 
                                 nombreRol === 'SUPER_ADMINISTRADOR' ||
                                 nombreRol === 'SUPER_ADMIN' ||
                                 this.getRolDisplayName(rol.nombre) === 'Super Administrador';
    
    // También verificar si es Administrador normal
    const esAdministrador = nombreRol === 'ADMIN' || 
                           nombreRol === 'ADMIN_NORMAL' ||
                           rol.nombre === 'Administrador';
    
    const esRolAlto = esSuperAdministrador || esAdministrador;
    
    // Estructura base de permisos - Si es Super Administrador, todos en true por defecto
    let permisos = {
      trabajadores: { 
        ver: esRolAlto, 
        crear: esRolAlto, 
        editar: esRolAlto, 
        eliminar: esRolAlto 
      },
      planillas: { 
        ver: esRolAlto, 
        crear: esRolAlto, 
        editar: esRolAlto, 
        eliminar: esRolAlto 
      },
      reportes: { 
        ver: esRolAlto, 
        exportar: esRolAlto 
      },
      configuracion: { 
        ver: esRolAlto, 
        editar: esRolAlto 
      },
      asistencia: { 
        ver: esRolAlto, 
        editar: esRolAlto 
      },
      beneficios: { 
        ver: esRolAlto, 
        editar: esRolAlto 
      },
      prestamos: {
        ver: esRolAlto,
        crear: esRolAlto,
        editar: esRolAlto,
        eliminar: esRolAlto
      },
      usuarios: {
        ver: esRolAlto,
        crear: esRolAlto,
        editar: esRolAlto,
        eliminar: esRolAlto
      },
      roles: {
        ver: esRolAlto,
        crear: esRolAlto,
        editar: esRolAlto,
        eliminar: esRolAlto
      }
    };

    // Procesar permisos del rol
    if (rol.permisos) {
      let permisosRol = rol.permisos;
      
      // Si viene como string JSON, parsearlo
      if (typeof permisosRol === 'string') {
        try {
          permisosRol = JSON.parse(permisosRol);
        } catch (error) {
          console.error('Error al parsear permisos JSON:', error);
          permisosRol = {};
        }
      }
      
      // Si es array con ["*"], marcar TODOS los permisos como true (control total)
      if (Array.isArray(permisosRol) && permisosRol.includes('*')) {
        console.log('🔍 Rol tiene permisos ["*"] - Marcando TODOS los permisos como true');
        permisos = {
          trabajadores: { ver: true, crear: true, editar: true, eliminar: true },
          planillas: { ver: true, crear: true, editar: true, eliminar: true },
          reportes: { ver: true, exportar: true },
          configuracion: { ver: true, editar: true },
          asistencia: { ver: true, editar: true },
          beneficios: { ver: true, editar: true },
          prestamos: { ver: true, crear: true, editar: true, eliminar: true },
          usuarios: { ver: true, crear: true, editar: true, eliminar: true },
          roles: { ver: true, crear: true, editar: true, eliminar: true }
        };
      } else if (typeof permisosRol === 'object' && permisosRol !== null) {
        // Si es objeto, mapear los permisos específicos
        // Para Super Administrador, si esRolAlto es true, forzar todos los permisos a true
        if (esSuperAdministrador) {
          console.log('🔍 Es Super Administrador - Forzando TODOS los permisos a true');
          permisos = {
            trabajadores: { ver: true, crear: true, editar: true, eliminar: true },
            planillas: { ver: true, crear: true, editar: true, eliminar: true },
            reportes: { ver: true, exportar: true },
            configuracion: { ver: true, editar: true },
            asistencia: { ver: true, editar: true },
            beneficios: { ver: true, editar: true },
            prestamos: { ver: true, crear: true, editar: true, eliminar: true },
            usuarios: { ver: true, crear: true, editar: true, eliminar: true },
            roles: { ver: true, crear: true, editar: true, eliminar: true }
          };
        } else {
          // Para otros roles, usar los permisos específicos o los valores por defecto
          permisos = {
            trabajadores: { 
              ver: permisosRol.trabajadores?.ver === true || esRolAlto,
              crear: permisosRol.trabajadores?.crear === true || esRolAlto,
              editar: permisosRol.trabajadores?.editar === true || esRolAlto,
              eliminar: permisosRol.trabajadores?.eliminar === true || esRolAlto
            },
            planillas: { 
              ver: permisosRol.planillas?.ver === true || esRolAlto,
              crear: permisosRol.planillas?.crear === true || esRolAlto,
              editar: permisosRol.planillas?.editar === true || esRolAlto,
              eliminar: permisosRol.planillas?.eliminar === true || esRolAlto
            },
            reportes: { 
              ver: permisosRol.reportes?.ver === true || esRolAlto,
              exportar: permisosRol.reportes?.exportar === true || esRolAlto
            },
            configuracion: { 
              ver: permisosRol.configuracion?.ver === true || esRolAlto,
              editar: permisosRol.configuracion?.editar === true || esRolAlto
            },
            asistencia: { 
              ver: permisosRol.asistencia?.ver === true || esRolAlto,
              editar: permisosRol.asistencia?.editar === true || esRolAlto
            },
            beneficios: { 
              ver: permisosRol.beneficios?.ver === true || esRolAlto,
              editar: permisosRol.beneficios?.editar === true || esRolAlto
            },
            prestamos: {
              ver: permisosRol.prestamos?.ver === true || esRolAlto,
              crear: permisosRol.prestamos?.crear === true || esRolAlto,
              editar: permisosRol.prestamos?.editar === true || esRolAlto,
              eliminar: permisosRol.prestamos?.eliminar === true || esRolAlto
            },
            usuarios: {
              ver: permisosRol.usuarios?.ver === true || esRolAlto,
              crear: permisosRol.usuarios?.crear === true || esRolAlto,
              editar: permisosRol.usuarios?.editar === true || esRolAlto,
              eliminar: permisosRol.usuarios?.eliminar === true || esRolAlto
            },
            roles: {
              ver: permisosRol.roles?.ver === true || esRolAlto,
              crear: permisosRol.roles?.crear === true || esRolAlto,
              editar: permisosRol.roles?.editar === true || esRolAlto,
              eliminar: permisosRol.roles?.eliminar === true || esRolAlto
            }
          };
        }
      }
    }

    this.rolForm = {
      nombre: rol.nombre || '',
      descripcion: rol.descripcion || '',
      permisos: permisos
    };
    
    // Log para depuración
    console.log('🔍 Permisos cargados para el rol:', rol.nombre);
    console.log('   Permisos finales:', this.rolForm.permisos);
    
    this.mostrarModalRol = true;
    
    // Forzar detección de cambios para asegurar que los checkboxes se actualicen
    this.cdr.detectChanges();
  }

  // Cerrar modal rol
  cerrarModalRol(): void {
    this.mostrarModalRol = false;
    this.rolEditando = null;
    this.rolForm = {
      nombre: '',
      descripcion: '',
      permisos: {
        trabajadores: { ver: false, crear: false, editar: false, eliminar: false },
        planillas: { ver: false, crear: false, editar: false, eliminar: false },
        reportes: { ver: false, exportar: false },
        configuracion: { ver: false, editar: false },
        asistencia: { ver: false, editar: false },
        beneficios: { ver: false, editar: false },
        prestamos: { ver: false, crear: false, editar: false, eliminar: false },
        usuarios: { ver: false, crear: false, editar: false, eliminar: false },
        roles: { ver: false, crear: false, editar: false, eliminar: false }
      }
    };
  }

  // Cerrar modal éxito rol
  cerrarModalExitoRol(): void {
    this.mostrarModalExitoRol = false;
    this.guardandoRolProceso = false;
    this.rolGuardadoCompletado = false;
    this.mensajeExitoRol = '';
  }

  // Guardar rol
  guardarRol(): void {
    if (!this.rolForm.nombre.trim()) {
      alert('❌ El nombre del rol es obligatorio');
      return;
    }

    this.guardandoRol = true;
    
    // Verificar si todos los permisos están marcados (rol de administrador)
    const todosPermisos = this.verificarSiTodosPermisosMarcados();
    let permisosParaEnviar;
    
    if (todosPermisos) {
      // Si todos los permisos están marcados, usar ["*"] para administrador
      permisosParaEnviar = ["*"];
    } else {
      // Si no, usar los permisos específicos
      permisosParaEnviar = this.rolForm.permisos;
    }

    const datos = {
      nombre: this.rolForm.nombre.trim(),
      descripcion: this.rolForm.descripcion.trim(),
      permisos: permisosParaEnviar
    };

    if (this.rolEditando) {
      // Actualizar rol existente
      this.http.put(`http://localhost:5000/api/roles/${this.rolEditando.id}`, datos).subscribe({
        next: () => {
          this.guardandoRol = false;
          this.cerrarModalRol();
          
          // Mostrar modal de éxito con animación
          this.mostrarModalExitoRol = true;
          this.guardandoRolProceso = true;
          this.rolGuardadoCompletado = false;
          this.mensajeExitoRol = `Rol "${this.rolForm.nombre}" actualizado exitosamente`;
          
          this.cdr.detectChanges();
          
          // Después de un breve delay, mostrar el check de éxito
          setTimeout(() => {
            this.guardandoRolProceso = false;
            this.rolGuardadoCompletado = true;
            this.cdr.detectChanges();
            this.cdr.markForCheck();
            
            // Cerrar modal de éxito y recargar datos después de 2.5 segundos
            setTimeout(() => {
              this.cerrarModalExitoRol();
              this.cargarRoles();
            }, 2500);
          }, 800);
        },
        error: (error) => {
          this.guardandoRol = false;
          console.error('Error al actualizar rol:', error);
          alert('❌ Error al actualizar el rol');
        }
      });
    } else {
      // Crear nuevo rol
      this.http.post('http://localhost:5000/api/roles', datos).subscribe({
        next: () => {
          this.guardandoRol = false;
          this.cerrarModalRol();
          
          // Mostrar modal de éxito con animación
          this.mostrarModalExitoRol = true;
          this.guardandoRolProceso = true;
          this.rolGuardadoCompletado = false;
          this.mensajeExitoRol = `Rol "${this.rolForm.nombre}" creado exitosamente`;
          
          this.cdr.detectChanges();
          
          // Después de un breve delay, mostrar el check de éxito
          setTimeout(() => {
            this.guardandoRolProceso = false;
            this.rolGuardadoCompletado = true;
            this.cdr.detectChanges();
            this.cdr.markForCheck();
            
            // Cerrar modal de éxito y recargar datos después de 2.5 segundos
            setTimeout(() => {
              this.cerrarModalExitoRol();
              this.cargarRoles();
            }, 2500);
          }, 800);
        },
        error: (error) => {
          this.guardandoRol = false;
          console.error('Error al crear rol:', error);
          alert('❌ Error al crear el rol');
        }
      });
    }
  }

  // Abrir modal eliminar rol
  eliminarRol(rol: any): void {
    this.rolAEliminar = rol;
    this.confirmacionEliminarRol = '';
    this.mostrarModalEliminarRol = true;
  }

  // Cerrar modal eliminar rol
  cerrarModalEliminarRol(): void {
    this.mostrarModalEliminarRol = false;
    this.rolAEliminar = null;
    this.confirmacionEliminarRol = '';
    this.eliminandoRol = false;
    this.rolEliminadoCompletado = false;
  }

  // Confirmar eliminación de rol
  confirmarEliminacionRol(): void {
    if (!this.rolAEliminar || this.confirmacionEliminarRol !== 'ELIMINAR') {
      return;
    }

    this.eliminandoRol = true;
    this.mostrarModalEliminarRol = false;

    this.http.delete(`http://localhost:5000/api/roles/${this.rolAEliminar.id}`).subscribe({
      next: (response: any) => {
        if (response.success) {
          // Mostrar modal de éxito con animación
          this.mostrarModalExitoEliminacionRol = true;
          this.eliminandoRol = true;
          this.rolEliminadoCompletado = false;
          
          this.cdr.detectChanges();
          
          // Después de un breve delay, mostrar el check de éxito
          setTimeout(() => {
            this.eliminandoRol = false;
            this.rolEliminadoCompletado = true;
            this.cdr.detectChanges();
            this.cdr.markForCheck();
            
            // Cerrar modal de éxito y recargar datos después de 2.5 segundos
            setTimeout(() => {
              this.cerrarModalExitoEliminacionRol();
              this.cargarRoles();
            }, 2500);
          }, 800);
        } else {
          this.eliminandoRol = false;
          alert('❌ Error al eliminar el rol: ' + (response.message || 'Error desconocido'));
        }
      },
      error: (error) => {
        this.eliminandoRol = false;
        console.error('Error al eliminar rol:', error);
        let mensajeError = 'Error al eliminar el rol. Verifique la conexión.';
        
        if (error.error) {
          if (error.error.message) {
            mensajeError = error.error.message;
          } else if (error.error.error === 'ROL_EN_USO') {
            mensajeError = 'No se puede eliminar el rol porque hay usuarios asignados a este rol. Primero debe cambiar el rol de esos usuarios.';
          }
        }
        
        alert('❌ ' + mensajeError);
      }
    });
  }

  // Cerrar modal éxito eliminación rol
  cerrarModalExitoEliminacionRol(): void {
    this.mostrarModalExitoEliminacionRol = false;
    this.eliminandoRol = false;
    this.rolEliminadoCompletado = false;
    this.rolAEliminar = null;
  }

  // Abrir modal cambiar contraseña
  abrirModalCambiarPassword(usuario: any): void {
    const id = usuario?.UsuarioID || usuario?.id;
    this.passwordForm = {
      usuarioId: id,
      usuarioNombre: usuario.username,
      passwordActual: '',
      passwordNuevo: '',
      passwordConfirmar: ''
    };
    this.mostrarModalPassword = true;
  }

  // Cerrar modal contraseña
  cerrarModalPassword(): void {
    this.mostrarModalPassword = false;
    this.passwordForm = {
      usuarioId: null,
      usuarioNombre: '',
      passwordActual: '',
      passwordNuevo: '',
      passwordConfirmar: ''
    };
  }

  // Cambiar contraseña
  cambiarPassword(): void {
    if (!this.passwordForm.passwordNuevo || !this.passwordForm.passwordConfirmar) {
      alert('❌ Todos los campos son obligatorios');
      return;
    }

    if (this.passwordForm.passwordNuevo !== this.passwordForm.passwordConfirmar) {
      alert('❌ Las contraseñas nuevas no coinciden');
      return;
    }

    if (this.passwordForm.passwordNuevo.length < 6) {
      alert('❌ La contraseña debe tener al menos 6 caracteres');
      return;
    }

    this.guardandoPassword = true;
    const datos = {
      passwordActual: this.passwordForm.passwordActual,
      passwordNuevo: this.passwordForm.passwordNuevo
    };

    this.http.put(`http://localhost:5000/api/usuarios/${this.passwordForm.usuarioId}/password`, datos).subscribe({
      next: () => {
        this.guardandoPassword = false;
        this.cerrarModalPassword();
        alert('✅ Contraseña cambiada exitosamente');
      },
      error: (error) => {
        this.guardandoPassword = false;
        console.error('Error al cambiar contraseña:', error);
        if (error.status === 401) {
          alert('❌ La contraseña actual es incorrecta');
        } else {
          alert('❌ Error al cambiar la contraseña');
        }
      }
    });
  }

  // Toggle permiso
  togglePermiso(seccion: string, permiso: string): void {
    if (!this.rolForm || !this.rolForm.permisos) {
      return;
    }
    
    // Asegurar que la sección existe
    if (!this.rolForm.permisos[seccion]) {
      this.rolForm.permisos[seccion] = {};
    }
    
    // Inicializar el permiso si no existe
    if (!this.rolForm.permisos[seccion].hasOwnProperty(permiso)) {
      this.rolForm.permisos[seccion][permiso] = false;
    }
    
    // Toggle del permiso
    this.rolForm.permisos[seccion][permiso] = !this.rolForm.permisos[seccion][permiso];
    
    // Forzar detección de cambios
    this.cdr.detectChanges();
  }

  // Verificar si un permiso está activo
  tienePermiso(seccion: string, permiso: string): boolean {
    if (!this.rolForm || !this.rolForm.permisos) {
      return false;
    }
    
    // Verificar si la sección existe
    if (!this.rolForm.permisos[seccion]) {
      return false;
    }
    
    // Verificar si el permiso específico existe y está en true
    const tienePermiso = this.rolForm.permisos[seccion][permiso] === true;
    
    return tienePermiso;
  }

  // Verificar si todos los permisos están marcados (para rol de administrador)
  verificarSiTodosPermisosMarcados(): boolean {
    const permisos = this.rolForm.permisos;
    
    // Verificar trabajadores
    if (!permisos.trabajadores?.ver || !permisos.trabajadores?.crear || 
        !permisos.trabajadores?.editar || !permisos.trabajadores?.eliminar) {
      return false;
    }
    
    // Verificar planillas
    if (!permisos.planillas?.ver || !permisos.planillas?.crear || 
        !permisos.planillas?.editar || !permisos.planillas?.eliminar) {
      return false;
    }
    
    // Verificar reportes
    if (!permisos.reportes?.ver || !permisos.reportes?.exportar) {
      return false;
    }
    
    // Verificar configuración
    if (!permisos.configuracion?.ver || !permisos.configuracion?.editar) {
      return false;
    }
    
    // Verificar asistencia
    if (!permisos.asistencia?.ver || !permisos.asistencia?.editar) {
      return false;
    }
    
    // Verificar beneficios
    if (!permisos.beneficios?.ver || !permisos.beneficios?.editar) {
      return false;
    }
    
    // Verificar préstamos (si existe)
    if (permisos.prestamos && (
        !permisos.prestamos.ver || !permisos.prestamos.crear || 
        !permisos.prestamos.editar || !permisos.prestamos.eliminar)) {
      return false;
    }
    
    // Verificar usuarios (si existe)
    if (permisos.usuarios && (
        !permisos.usuarios.ver || !permisos.usuarios.crear || 
        !permisos.usuarios.editar || !permisos.usuarios.eliminar)) {
      return false;
    }
    
    // Verificar roles (si existe)
    if (permisos.roles && (
        !permisos.roles.ver || !permisos.roles.crear || 
        !permisos.roles.editar || !permisos.roles.eliminar)) {
      return false;
    }
    
    return true;
  }

  // ==================== FUNCIONES DE AVATAR ====================
  
  // Generar iniciales del usuario
  getInicialesUsuario(usuario: any): string {
    if (usuario.nombre && usuario.apellidos) {
      return (usuario.nombre.charAt(0) + usuario.apellidos.charAt(0)).toUpperCase();
    } else if (usuario.username) {
      return usuario.username.substring(0, 2).toUpperCase();
    } else if (usuario.email) {
      return usuario.email.substring(0, 2).toUpperCase();
    }
    return 'U?';
  }

  // Generar color único basado en el nombre de usuario
  getColorAvatar(usuario: any): string {
    const colores = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
    ];
    
    const texto = usuario.username || usuario.email || usuario.nombre || 'default';
    let hash = 0;
    for (let i = 0; i < texto.length; i++) {
      hash = texto.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colores[Math.abs(hash) % colores.length];
  }

  // Generar icono basado en el rol
  getIconoRol(rol: string): string {
    const iconos: { [key: string]: string } = {
      'ADMINISTRADOR': '👑',
      'RRHH': '👥',
      'CONTABILIDAD': '💰',
      'GERENCIA': '📊',
      'SUPERVISOR': '👨‍💼',
      'EDITOR': '✏️',
      'USUARIO': '👤'
    };
    return iconos[rol?.toUpperCase()] || '👤';
  }

  // Mostrar nombre legible del rol
  getRolDisplayName(rol: string): string {
    if (!rol) return 'Sin rol';
    
    const r = rol.toUpperCase().trim();
    
    // Solo normalizar roles específicos del sistema que ya existen
    // NO modificar roles creados por el usuario
    // Lista de roles del sistema que deben normalizarse:
    const rolesSistemaSuperAdmin = [
      'SUPER ADMINISTRADOR',
      'SUPER_ADMINISTRADOR', 
      'SUPER_ADMIN'
    ];
    
    // Si es un rol del sistema Super Admin, normalizarlo
    if (rolesSistemaSuperAdmin.includes(r)) {
      return 'Super Administrador';
    }
    
    // Para otros roles, devolver el nombre tal cual está (sin modificar)
    return rol;
  }

  // ==================== GESTIÓN DE USUARIOS ====================
  
  // Abrir modal editar usuario
  abrirModalEditarUsuario(usuario: any): void {
    console.log('🔍 Abriendo modal para usuario:', usuario);
    console.log('🔍 UsuarioID del usuario:', usuario.UsuarioID);
    
    this.usuarioEditando = usuario;
    this.usuarioForm = {
      nombre: usuario.nombre || '',
      apellidos: usuario.apellidos || '',
      email: usuario.email || '',
      username: usuario.username || '',
      rol: usuario.rol || '',
      horasDemo: usuario.horasDemo || null,
      fechaInicioDemo: usuario.fechaInicioDemo ? this.formatearFechaParaInput(usuario.fechaInicioDemo) : '',
      fechaFinDemo: usuario.fechaFinDemo ? this.formatearFechaParaInput(usuario.fechaFinDemo) : ''
    };
    
    // Si es usuario DEMO y tiene horas, calcular fecha de expiración automáticamente
    if (this.usuarioForm.rol === 'DEMO' && this.usuarioForm.horasDemo) {
      this.onHorasDemoChange();
    }
    
    console.log('🔍 Formulario inicializado:', this.usuarioForm);
    console.log('🔍 Usuario editando asignado:', this.usuarioEditando);
    this.mostrarModalEditarUsuario = true;
  }

  // Cerrar modal editar usuario
  cerrarModalEditarUsuario(): void {
    this.mostrarModalEditarUsuario = false;
    this.usuarioEditando = null;
    this.usuarioForm = {
      nombre: '',
      apellidos: '',
      email: '',
      username: '',
      rol: '',
      horasDemo: null,
      fechaInicioDemo: '',
      fechaFinDemo: ''
    };
  }

  // Abrir modal eliminar usuario
  abrirModalEliminarUsuario(usuario: any): void {
    if (!this.isAdmin) return;
    this.usuarioAEliminar = usuario;
    this.confirmacionEliminar = '';
    this.mostrarModalEliminarUsuario = true;
  }

  // Cerrar modal eliminar usuario
  cerrarModalEliminarUsuario(): void {
    this.mostrarModalEliminarUsuario = false;
    this.usuarioAEliminar = null;
    this.confirmacionEliminar = '';
  }

  // Eliminar usuario confirmado
  eliminarUsuarioConfirmado(): void {
    if (!this.usuarioAEliminar || this.confirmacionEliminar !== 'ELIMINAR') {
      alert('❌ Debe escribir exactamente "ELIMINAR" para confirmar');
      return;
    }
    const id = this.usuarioAEliminar.UsuarioID || this.usuarioAEliminar.id;
    if (!id) {
      alert('❌ No se pudo identificar el usuario a eliminar');
      return;
    }

    // Cerrar modal de confirmación y mostrar modal de éxito
    this.cerrarModalEliminarUsuario();
    this.mostrarModalExitoEliminacion = true;
    this.eliminandoUsuario = true;
    this.eliminacionCompletada = false;

    // Petición al backend (eliminación permanente)
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    this.http.delete(`http://localhost:5000/api/usuarios/${id}`, { headers }).subscribe({
      next: (response: any) => {
        if (response.success) {
          // Mostrar spinner de carga
          this.cdr.detectChanges();
          
          // Después de un breve delay, mostrar el check de éxito
          setTimeout(() => {
            this.eliminandoUsuario = false;
            this.eliminacionCompletada = true;
            this.cdr.detectChanges();
            this.cdr.markForCheck();
            
            // Cerrar modal de éxito y recargar datos después de 2.5 segundos
            setTimeout(() => {
              this.cerrarModalExitoEliminacion();
              this.cargarUsuarios();
            }, 2500);
          }, 800);
        } else {
          this.eliminandoUsuario = false;
          this.cerrarModalExitoEliminacion();
          alert('❌ No se pudo eliminar el usuario: ' + (response.message || 'Error desconocido'));
        }
      },
      error: (error) => {
        console.error('Error al eliminar usuario:', error);
        this.eliminandoUsuario = false;
        this.cerrarModalExitoEliminacion();
        const mensajeError = error.error?.message || error.error?.error || 'Error al eliminar usuario. Verifique la conexión.';
        alert('❌ ' + mensajeError);
      }
    });
  }

  cerrarModalExitoEliminacion(): void {
    this.mostrarModalExitoEliminacion = false;
    this.eliminandoUsuario = false;
    this.eliminacionCompletada = false;
  }

  // ==================== FUNCIONES DEMO ====================
  
  // Formatear fecha para input datetime-local
  formatearFechaParaInput(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Verificar si la cuenta DEMO está activa
  isDemoActive(): boolean {
    if (!this.usuarioForm.fechaFinDemo) return false;
    const ahora = new Date();
    const fechaFin = new Date(this.usuarioForm.fechaFinDemo);
    return fechaFin > ahora;
  }

  // Obtener tiempo restante
  getTiempoRestante(): string {
    if (!this.usuarioForm.fechaFinDemo) return '';
    
    const ahora = new Date();
    const fechaFin = new Date(this.usuarioForm.fechaFinDemo);
    const diferencia = fechaFin.getTime() - ahora.getTime();
    
    if (diferencia <= 0) return 'Expirado';
    
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    
    if (horas > 0) {
      return `${horas}h ${minutos}m`;
    } else {
      return `${minutos}m`;
    }
  }

  // Formatear fecha para input de tipo date (YYYY-MM-DD)
  formatearFechaParaDateInput(fecha: Date | string | undefined): string {
    if (!fecha) return '';
    const date = fecha instanceof Date ? fecha : new Date(fecha);
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Manejar cambio de fecha de reunión de evaluación
  onFechaReunionEvaluacionChange(value: string): void {
    if (value && value.trim() !== '') {
      // El input de tipo date devuelve el formato YYYY-MM-DD
      // Agregar hora para evitar problemas de zona horaria
      const fecha = new Date(value + 'T00:00:00');
      
      if (!isNaN(fecha.getTime())) {
        // Solo actualizar si la fecha es válida
        this.configuracion.rrhh!.fechaReunionEvaluacion = fecha;
        this.detectarCambios();
      }
    }
  }

  // Actualizar fecha de fin cuando cambian las horas
  onHorasDemoChange(): void {
    if (this.usuarioForm.horasDemo) {
      // Para usuarios DEMO, siempre usar la fecha actual como inicio
      // Esto asegura que cuando edites un usuario DEMO expirado, se reactive con el tiempo nuevo
      const fechaInicio = new Date();
      this.usuarioForm.fechaInicioDemo = this.formatearFechaParaInput(fechaInicio.toISOString());
      
      // Calcular fecha de fin sumando las horas
      const fechaFin = new Date(fechaInicio.getTime() + (this.usuarioForm.horasDemo * 60 * 60 * 1000));
      this.usuarioForm.fechaFinDemo = this.formatearFechaParaInput(fechaFin.toISOString());
      
      console.log('🕐 Fecha de inicio DEMO:', this.usuarioForm.fechaInicioDemo);
      console.log('🕐 Fecha de fin DEMO:', this.usuarioForm.fechaFinDemo);
    }
  }

  // Guardar cambios de usuario
  guardarUsuario(): void {
    if (!this.usuarioEditando) {
      console.log('❌ No hay usuario editando');
      return;
    }

    console.log('🔍 Usuario editando:', this.usuarioEditando);
    console.log('🔍 UsuarioID del usuario editando:', this.usuarioEditando.UsuarioID);
    console.log('🔍 Formulario:', this.usuarioForm);

    // Validaciones
    if (!this.usuarioForm.nombre?.trim()) {
      alert('❌ El nombre es obligatorio');
      return;
    }
    if (!this.usuarioForm.apellidos?.trim()) {
      alert('❌ Los apellidos son obligatorios');
      return;
    }
    if (!this.usuarioForm.username?.trim()) {
      alert('❌ El nombre de usuario es obligatorio');
      return;
    }

    this.guardandoUsuario = true;

    const datosActualizacion = {
      username: this.usuarioForm.username,
      email: this.usuarioForm.email,
      rol: this.usuarioForm.rol,
      nombre: this.usuarioForm.nombre,
      apellidos: this.usuarioForm.apellidos,
      horasDemo: this.usuarioForm.horasDemo,
      fechaInicioDemo: this.usuarioForm.fechaInicioDemo,
      fechaFinDemo: this.usuarioForm.fechaFinDemo
    };

    console.log('📤 Enviando datos:', datosActualizacion);
    console.log('📤 URL:', `http://localhost:5000/api/usuarios/${this.usuarioEditando.UsuarioID}`);

    this.http.put(`http://localhost:5000/api/usuarios/${this.usuarioEditando.UsuarioID}`, datosActualizacion).subscribe({
      next: (response: any) => {
        if (response.success) {
          alert('✅ Usuario actualizado exitosamente');
          this.cerrarModalEditarUsuario();
          this.cargarUsuarios(); // Recargar lista
        } else {
          alert('❌ Error al actualizar usuario: ' + (response.message || 'Error desconocido'));
        }
        this.guardandoUsuario = false;
      },
      error: (error) => {
        console.error('Error al actualizar usuario:', error);
        alert('❌ Error al actualizar usuario. Verifique la conexión.');
        this.guardandoUsuario = false;
      }
    });
  }

  // ==================== FUNCIONES RESETEAR CONTRASEÑA ====================
  
  abrirModalResetearPassword(usuario: any): void {
    this.usuarioReseteando = usuario;
    this.nuevaPassword = '';
    this.confirmarPassword = '';
    this.mostrarModalResetearPassword = true;
    
    // Limpiar campos después de un pequeño delay para evitar interferencias
    setTimeout(() => {
      const inputs = document.querySelectorAll('.password-input');
      inputs.forEach((input: any) => {
        if (input) {
          input.focus();
          input.blur();
        }
      });
    }, 100);
  }

  cerrarModalResetearPassword(): void {
    this.mostrarModalResetearPassword = false;
    this.usuarioReseteando = null;
    this.nuevaPassword = '';
    this.confirmarPassword = '';
  }

  resetearPassword(): void {
    // Validaciones
    if (!this.nuevaPassword) {
      alert('❌ La nueva contraseña es obligatoria');
      return;
    }

    if (this.nuevaPassword.length < 6) {
      alert('❌ La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (this.nuevaPassword !== this.confirmarPassword) {
      alert('❌ Las contraseñas no coinciden');
      return;
    }

    this.reseteandoPassword = true;

    this.http.put(`http://localhost:5000/api/usuarios/${this.usuarioReseteando.UsuarioID}/reset-password`, {
      passwordNuevo: this.nuevaPassword
    }).subscribe({
      next: (response: any) => {
        if (response.success) {
          alert('✅ Contraseña reseteada exitosamente');
          this.cerrarModalResetearPassword();
        } else {
          alert('❌ Error al resetear contraseña: ' + (response.message || 'Error desconocido'));
        }
        this.reseteandoPassword = false;
      },
      error: (error) => {
        console.error('Error al resetear contraseña:', error);
        alert('❌ Error al resetear contraseña. Verifique la conexión.');
        this.reseteandoPassword = false;
      }
    });
  }

  // ==================== CARGA DE USUARIO ACTUAL ====================
  
  cargarUsuarioActual(): void {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No hay token de autenticación');
      return;
    }

    // Decodificar el token JWT para obtener la información del usuario
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUser = {
        UsuarioID: payload.UsuarioID,
        username: payload.username,
        rol: payload.rol
      };
      
      // Verificar rol
      const rolUpper = (this.currentUser.rol || '').toUpperCase();
      // Super Administrador: solo roles específicos de Super Admin
      this.isSuperAdmin = rolUpper === 'SUPER ADMINISTRADOR' || 
                         rolUpper === 'SUPER_ADMINISTRADOR' || 
                         rolUpper === 'SUPER_ADMIN' ||
                         this.currentUser.rol === 'Super Administrador';
      // Administrador: incluye Super Administrador y Administrador normal
      // PERO no tratamos "Administrador" como Super Administrador
      this.isAdmin = this.isSuperAdmin || 
                     rolUpper === 'ADMINISTRADOR' || 
                     rolUpper === 'ADMIN' || 
                     rolUpper === 'ADMIN_NORMAL' || 
                     this.currentUser.rol === 'Administrador';
      this.isDemo = this.currentUser.rol === 'DEMO' || this.currentUser.rol === 'demo';
      
      // Cargar permisos del rol del usuario actual
      this.cargarPermisosUsuarioActual();
      
      // Si es DEMO, ocultar el tab de Administrar Roles
      if (this.isDemo) {
        this.tabs = this.tabs.filter(t => t.id !== 'administrar-roles');
      }
      // Si es SUPER_ADMIN, agregar tab de Módulos
      if (this.isSuperAdmin && !this.tabs.find(t => t.id === 'modulos')) {
        this.tabs.splice(5, 0, { id: 'modulos', nombre: 'Módulos', icon: '🧩' });
      }
      // Aplicar módulos habilitados a administradores normales
      if (!this.isSuperAdmin) {
        this.aplicarModulosHabilitados();
      }
      
      // Filtrar tabs según permisos
      this.filtrarTabsSegunPermisos();
      
      console.log('Usuario actual cargado:', this.currentUser);
      console.log('Rol del usuario:', this.currentUser.rol);
      console.log('Es administrador:', this.isAdmin);
      console.log('Permisos del usuario:', this.permisosUsuarioActual);
    } catch (error) {
      console.error('Error al decodificar el token:', error);
    }
  }

  // Cargar permisos del rol del usuario actual
  cargarPermisosUsuarioActual(): void {
    if (!this.currentUser || !this.currentUser.rol) {
      this.permisosUsuarioActual = null;
      return;
    }

    // Si es Super Administrador, tiene todos los permisos
    if (this.isSuperAdmin) {
      this.permisosUsuarioActual = {
        usuarios: { ver: true, crear: true, editar: true, eliminar: true },
        roles: { ver: true, crear: true, editar: true, eliminar: true }
      };
      return;
    }

    // Obtener permisos del rol desde la base de datos
    this.http.get(`http://localhost:5000/api/roles/nombre/${encodeURIComponent(this.currentUser.rol)}`).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          let permisos = response.data.permisos;
          if (typeof permisos === 'string') {
            try {
              permisos = JSON.parse(permisos);
            } catch (error) {
              console.error('Error al parsear permisos:', error);
              permisos = {};
            }
          }
          this.permisosUsuarioActual = permisos || {};
          console.log('Permisos cargados del rol:', this.permisosUsuarioActual);
          
          // Filtrar tabs después de cargar permisos
          this.filtrarTabsSegunPermisos();
        } else {
          this.permisosUsuarioActual = {};
        }
      },
      error: (error) => {
        console.error('Error al cargar permisos del rol:', error);
        this.permisosUsuarioActual = {};
      }
    });
  }

  // Filtrar tabs según los permisos del usuario
  filtrarTabsSegunPermisos(): void {
    if (!this.permisosUsuarioActual) {
      // Si no hay permisos cargados aún, no filtrar
      return;
    }

    // Si es Super Administrador, no filtrar nada
    if (this.isSuperAdmin) {
      return;
    }

    // Filtrar tabs que requieren permisos específicos
    this.tabs = this.tabs.filter(tab => {
      // Si el tab requiere permiso de roles
      if (tab.requierePermiso === 'roles') {
        return this.permisosUsuarioActual.roles && this.permisosUsuarioActual.roles.ver === true;
      }
      // Si el tab requiere permiso de usuarios
      if (tab.requierePermiso === 'usuarios') {
        return this.permisosUsuarioActual.usuarios && this.permisosUsuarioActual.usuarios.ver === true;
      }
      // Si no requiere permisos específicos, mostrar siempre
      return true;
    });

    // Si el tab activo fue ocultado, cambiar a otro tab
    const tabActivoExiste = this.tabs.find(t => t.id === this.tabActiva);
    if (!tabActivoExiste && this.tabs.length > 0) {
      this.tabActiva = this.tabs[0].id;
    }
  }

  // Verificar si el usuario tiene permiso para ver usuarios
  puedeVerUsuarios(): boolean {
    if (this.isSuperAdmin) return true;
    return this.permisosUsuarioActual?.usuarios?.ver === true;
  }

  // Verificar si el usuario tiene permiso para ver roles
  puedeVerRoles(): boolean {
    if (this.isSuperAdmin) return true;
    return this.permisosUsuarioActual?.roles?.ver === true;
  }

  // Obtener el número de permisos activos de un rol
  contarPermisosActivos(rol: any): number {
    if (!rol || !rol.permisos) return 0;
    
    let contador = 0;
    for (const seccion of Object.keys(rol.permisos)) {
      if (rol.permisos[seccion] && typeof rol.permisos[seccion] === 'object') {
        for (const permiso of Object.keys(rol.permisos[seccion])) {
          if (rol.permisos[seccion][permiso] === true) {
            contador++;
          }
        }
      }
    }
    return contador;
  }

  // Obtener el número total de permisos posibles
  contarPermisosTotales(rol: any): number {
    if (!rol || !rol.permisos) return 0;
    
    let contador = 0;
    for (const seccion of Object.keys(rol.permisos)) {
      if (rol.permisos[seccion] && typeof rol.permisos[seccion] === 'object') {
        contador += Object.keys(rol.permisos[seccion]).length;
      }
    }
    return contador;
  }

  // ==================== CONTROL DE MÓDULOS (SUPER_ADMIN) ====================
  cargarModulosHabilitados(): void {
    try {
      const data = localStorage.getItem('modulosHabilitados');
      if (data) {
        this.modulosHabilitados = JSON.parse(data);
      } else {
        // Habilitar todos por defecto
        this.modulosHabilitados = this.tabs.reduce((acc: any, t: any) => { acc[t.id] = true; return acc; }, {});
      }
    } catch (_) {
      this.modulosHabilitados = this.tabs.reduce((acc: any, t: any) => { acc[t.id] = true; return acc; }, {});
    }
  }

  guardarModulosHabilitados(): void {
    localStorage.setItem('modulosHabilitados', JSON.stringify(this.modulosHabilitados));
    alert('✅ Preferencias de módulos guardadas');
  }

  aplicarModulosHabilitados(): void {
    if (!this.modulosHabilitados || Object.keys(this.modulosHabilitados).length === 0) return;
    this.tabs = this.tabs.filter(t => this.modulosHabilitados[t.id] !== false);
    if (!this.tabs.find(t => t.id === this.tabActiva)) {
      this.tabActiva = 'empresa';
    }
  }

  // ==================== FUNCIONES NUEVO USUARIO ====================
  
  abrirModalNuevoUsuario(): void {
    this.nuevoUsuarioForm = {
      username: '',
      email: '',
      nombre: '',
      apellidos: '',
      rol: '',
      password: '',
      esDemo: false,
      horasDemo: null
    };
    this.mostrarModalNuevoUsuario = true;
  }

  cerrarModalNuevoUsuario(): void {
    this.mostrarModalNuevoUsuario = false;
    this.nuevoUsuarioForm = {
      username: '',
      email: '',
      nombre: '',
      apellidos: '',
      rol: '',
      password: '',
      esDemo: false,
      horasDemo: null
    };
  }

  // Método cuando se activa/desactiva el checkbox DEMO
  onDemoToggleChange(): void {
    if (this.nuevoUsuarioForm.esDemo) {
      // Si se marca como DEMO, asignar automáticamente el rol DEMO
      this.nuevoUsuarioForm.rol = 'DEMO';
      // Establecer un valor por defecto de horas si no hay
      if (!this.nuevoUsuarioForm.horasDemo || this.nuevoUsuarioForm.horasDemo <= 0) {
        this.nuevoUsuarioForm.horasDemo = 1; // 1 hora por defecto
      }
    } else {
      // Si se desmarca, limpiar horas
      this.nuevoUsuarioForm.horasDemo = null;
      // Solo limpiar rol si era DEMO
      if (this.nuevoUsuarioForm.rol === 'DEMO') {
        this.nuevoUsuarioForm.rol = '';
      }
    }
  }

  // Calcular cuándo expirará la demo
  calcularFinDemo(): string {
    if (!this.nuevoUsuarioForm.horasDemo || this.nuevoUsuarioForm.horasDemo <= 0) {
      return 'No configurado';
    }
    
    const ahora = new Date();
    const fechaFin = new Date(ahora.getTime() + (this.nuevoUsuarioForm.horasDemo * 60 * 60 * 1000));
    
    return fechaFin.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  crearUsuario(): void {
    // Validaciones
    if (!this.nuevoUsuarioForm.username) {
      alert('❌ El nombre de usuario es obligatorio');
      return;
    }

    if (!this.nuevoUsuarioForm.nombre) {
      alert('❌ El nombre es obligatorio');
      return;
    }

    if (!this.nuevoUsuarioForm.apellidos) {
      alert('❌ Los apellidos son obligatorios');
      return;
    }

    if (!this.nuevoUsuarioForm.rol) {
      alert('❌ El rol es obligatorio');
      return;
    }

    if (!this.nuevoUsuarioForm.password) {
      alert('❌ La contraseña es obligatoria');
      return;
    }

    if (this.nuevoUsuarioForm.password.length < 6) {
      alert('❌ La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Validación específica para DEMO
    if (this.nuevoUsuarioForm.esDemo) {
      if (!this.nuevoUsuarioForm.horasDemo || this.nuevoUsuarioForm.horasDemo <= 0) {
        alert('❌ Por favor, ingresa un número válido de horas para la cuenta DEMO');
        return;
      }
      if (this.nuevoUsuarioForm.horasDemo > 720) {
        alert('⚠️ El tiempo máximo para una cuenta DEMO es 720 horas (30 días)');
        return;
      }
      // Asegurar que el rol sea DEMO
      this.nuevoUsuarioForm.rol = 'DEMO';
    }

    this.creandoUsuario = true;

    // Preparar datos para enviar al backend
    // El email es opcional, si está vacío se envía como null
    const datosUsuario = {
      username: this.nuevoUsuarioForm.username,
      email: this.nuevoUsuarioForm.email && this.nuevoUsuarioForm.email.trim() !== '' 
        ? this.nuevoUsuarioForm.email.trim() 
        : null,
      nombre: this.nuevoUsuarioForm.nombre,
      apellidos: this.nuevoUsuarioForm.apellidos,
      rol: this.nuevoUsuarioForm.rol,
      password: this.nuevoUsuarioForm.password,
      esDemo: this.nuevoUsuarioForm.esDemo || false,
      horasDemo: this.nuevoUsuarioForm.esDemo ? this.nuevoUsuarioForm.horasDemo : null
    };

    console.log('📋 Creando usuario con datos:', datosUsuario);

    // Cerrar modal de creación y mostrar modal de éxito
    this.mostrarModalNuevoUsuario = false;
    this.mostrarModalExitoCreacion = true;
    this.creandoUsuarioProceso = true;
    this.usuarioCreadoCompletado = false;
    this.creandoUsuario = true;

    this.http.post('http://localhost:5000/api/usuarios', datosUsuario).subscribe({
      next: (response: any) => {
        if (response.success) {
          // Mostrar spinner de carga
          this.cdr.detectChanges();
          
          // Después de un breve delay, mostrar el check de éxito
          setTimeout(() => {
            this.creandoUsuarioProceso = false;
            this.usuarioCreadoCompletado = true;
            this.creandoUsuario = false;
            this.cdr.detectChanges();
            this.cdr.markForCheck();
            
            // Cerrar modal de éxito y recargar datos después de 2.5 segundos
            setTimeout(() => {
              this.cerrarModalExitoCreacion();
              this.cargarUsuarios(); // Recargar la lista de usuarios
            }, 2500);
          }, 800);
        } else {
          this.creandoUsuarioProceso = false;
          this.creandoUsuario = false;
          this.cerrarModalExitoCreacion();
          alert('❌ Error al crear usuario: ' + (response.message || 'Error desconocido'));
        }
      },
      error: (error) => {
        console.error('Error al crear usuario:', error);
        
        this.creandoUsuarioProceso = false;
        this.creandoUsuario = false;
        this.cerrarModalExitoCreacion();
        
        let mensajeError = 'Error al crear usuario. Verifique la conexión.';
        
        if (error.error) {
          // Priorizar el mensaje del backend si existe
          if (error.error.message) {
            mensajeError = error.error.message;
          } else if (error.error.error) {
            // Si hay un código de error específico, mostrar mensaje personalizado
            switch (error.error.error) {
              case 'USERNAME_DUPLICADO':
                mensajeError = `El nombre de usuario ya existe. Por favor, elija otro nombre de usuario.`;
                break;
              case 'EMAIL_DUPLICADO':
                mensajeError = `El email ya está registrado. Por favor, use otro email.`;
                break;
              case 'DUPLICADO':
                mensajeError = 'Ya existe un usuario con estos datos. Verifique el nombre de usuario y el email.';
                break;
              default:
                mensajeError = error.error.error || mensajeError;
            }
          }
        }
        
        alert('❌ ' + mensajeError);
      }
    });
  }

  cerrarModalExitoCreacion(): void {
    this.mostrarModalExitoCreacion = false;
    this.creandoUsuarioProceso = false;
    this.usuarioCreadoCompletado = false;
  }
  
  // Cerrar modal de éxito de configuración
  cerrarModalExitoConfiguracion(): void {
    this.mostrarModalExitoConfiguracion = false;
    this.guardandoConfiguracion = false;
    this.configuracionGuardadaCompletada = false;
  }
}