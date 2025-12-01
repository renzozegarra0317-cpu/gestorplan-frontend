import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
// Animaciones removidas para evitar errores

// Interfaces
import {
  ConfiguracionEmpresarial,
  UsuarioSistema,
  LogSistema,
  Auditoria,
  DashboardConfiguracion,
  MenuConfiguracion,
  AlertaSistema,
  MetricasSistema,
  EstadoSistema,
  RespaldoSistema,
  ConfiguracionModulo
} from './configuracion-empresarial.interface';

@Component({
  selector: 'app-configuracion-empresarial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion-empresarial.component.html',
  styleUrls: ['./configuracion-empresarial.component.scss'],
  // Animaciones removidas para evitar errores
})
export class ConfiguracionEmpresarialComponent implements OnInit, OnDestroy {
  
  // ========== ESTADO DEL COMPONENTE ==========
  tabActiva: string = 'dashboard';
  sidebarAbierta: boolean = true;
  cargando: boolean = false;
  modoOscuro: boolean = true;
  
  // ========== DATOS PRINCIPALES ==========
  configuracionEmpresarial: ConfiguracionEmpresarial | null = null;
  dashboard: DashboardConfiguracion | null = null;
  usuarios: UsuarioSistema[] = [];
  logs: LogSistema[] = [];
  auditoria: Auditoria[] = [];
  alertas: AlertaSistema[] = [];
  metricas: MetricasSistema | null = null;
  estadoSistema: EstadoSistema | null = null;
  respaldos: RespaldoSistema[] = [];
  modulos: ConfiguracionModulo[] = [];
  
  // ========== CONFIGURACIÓN DE MENÚ ==========
  menuConfiguracion: MenuConfiguracion[] = [
    {
      id: 'dashboard',
      titulo: 'Dashboard',
      icono: '📊',
      ruta: '/configuracion/dashboard',
      descripcion: 'Panel principal del sistema',
      color: '#3b82f6',
      activo: true,
      orden: 1
    },
    {
      id: 'empresa',
      titulo: 'Configuración Empresarial',
      icono: '🏢',
      ruta: '/configuracion/empresa',
      descripcion: 'Datos de la empresa y personalización',
      color: '#8b5cf6',
      activo: true,
      orden: 2
    },
    {
      id: 'usuarios',
      titulo: 'Gestión de Usuarios',
      icono: '👥',
      ruta: '/configuracion/usuarios',
      descripcion: 'Usuarios, roles y permisos',
      color: '#10b981',
      activo: true,
      orden: 3,
      badge: {
        texto: '12',
        color: '#ef4444'
      }
    },
    {
      id: 'estructura',
      titulo: 'Estructura Organizacional',
      icono: '🏗️',
      ruta: '/configuracion/estructura',
      descripcion: 'Áreas, cargos y jerarquías',
      color: '#f59e0b',
      activo: true,
      orden: 4
    },
    {
      id: 'modulos',
      titulo: 'Configuración de Módulos',
      icono: '⚙️',
      ruta: '/configuracion/modulos',
      descripcion: 'Configuración de planillas, asistencias, beneficios',
      color: '#06b6d4',
      activo: true,
      orden: 5
    },
    {
      id: 'monitoreo',
      titulo: 'Monitoreo del Sistema',
      icono: '📈',
      ruta: '/configuracion/monitoreo',
      descripcion: 'Logs, métricas y rendimiento',
      color: '#ef4444',
      activo: true,
      orden: 6,
      badge: {
        texto: '3',
        color: '#f59e0b'
      }
    },
    {
      id: 'auditoria',
      titulo: 'Auditoría e Historial',
      icono: '📋',
      ruta: '/configuracion/auditoria',
      descripcion: 'Historial de cambios y auditoría',
      color: '#8b5cf6',
      activo: true,
      orden: 7
    },
    {
      id: 'herramientas',
      titulo: 'Herramientas Avanzadas',
      icono: '🔧',
      ruta: '/configuracion/herramientas',
      descripcion: 'Respaldos, importación y exportación',
      color: '#6b7280',
      activo: true,
      orden: 8
    },
    {
      id: 'seguridad',
      titulo: 'Seguridad',
      icono: '🔒',
      ruta: '/configuracion/seguridad',
      descripcion: 'Configuración de seguridad y acceso',
      color: '#dc2626',
      activo: true,
      orden: 9
    },
    {
      id: 'integraciones',
      titulo: 'Integraciones',
      icono: '🔗',
      ruta: '/configuracion/integraciones',
      descripcion: 'APIs y conexiones externas',
      color: '#059669',
      activo: true,
      orden: 10
    }
  ];
  
  // ========== MODALES Y FORMULARIOS ==========
  mostrarModalUsuario: boolean = false;
  mostrarModalEmpresa: boolean = false;
  mostrarModalRespaldo: boolean = false;
  mostrarModalLogs: boolean = false;
  
  usuarioEditando: UsuarioSistema | null = null;
  configuracionEditando: ConfiguracionEmpresarial | null = null;
  
  // ========== FILTROS Y BÚSQUEDAS ==========
  filtroLogs: string = '';
  filtroAuditoria: string = '';
  filtroUsuarios: string = '';
  nivelLog: string = 'todos';
  fechaDesde: string = '';
  fechaHasta: string = '';
  
  // ========== PAGINACIÓN ==========
  paginaActual: number = 1;
  elementosPorPagina: number = 20;
  totalElementos: number = 0;
  
  // ========== INTERVALOS ==========
  private intervalMetricas: any;
  private intervalLogs: any;
  private intervalAlertas: any;
  
  // ========== CONSTRUCTOR ==========
  constructor(private http: HttpClient) {}
  
  // ========== LIFECYCLE HOOKS ==========
  ngOnInit(): void {
    this.inicializarComponente();
    this.iniciarMonitoreo();
  }
  
  ngOnDestroy(): void {
    this.detenerMonitoreo();
  }
  
  // ========== INICIALIZACIÓN ==========
  private inicializarComponente(): void {
    console.log('🚀 Inicializando Super Panel de Configuración Empresarial');
    this.cargarDashboard();
    this.cargarConfiguracionEmpresarial();
    this.cargarUsuarios();
    this.cargarLogs();
    this.cargarAuditoria();
    this.cargarAlertas();
    this.cargarMetricas();
    this.cargarEstadoSistema();
    this.cargarRespaldos();
    this.cargarModulos();
  }
  
  private iniciarMonitoreo(): void {
    // Actualizar métricas cada 30 segundos
    this.intervalMetricas = setInterval(() => {
      this.cargarMetricas();
    }, 30000);
    
    // Actualizar logs cada 10 segundos
    this.intervalLogs = setInterval(() => {
      this.cargarLogs();
    }, 10000);
    
    // Actualizar alertas cada 15 segundos
    this.intervalAlertas = setInterval(() => {
      this.cargarAlertas();
    }, 15000);
  }
  
  private detenerMonitoreo(): void {
    if (this.intervalMetricas) clearInterval(this.intervalMetricas);
    if (this.intervalLogs) clearInterval(this.intervalLogs);
    if (this.intervalAlertas) clearInterval(this.intervalAlertas);
  }
  
  // ========== NAVEGACIÓN ==========
  cambiarTab(tab: string): void {
    this.tabActiva = tab;
    console.log(`📱 Cambiando a tab: ${tab}`);
    
    // Cargar datos específicos según el tab
    switch (tab) {
      case 'dashboard':
        this.cargarDashboard();
        break;
      case 'usuarios':
        this.cargarUsuarios();
        break;
      case 'monitoreo':
        this.cargarLogs();
        this.cargarMetricas();
        break;
      case 'auditoria':
        this.cargarAuditoria();
        break;
      case 'herramientas':
        this.cargarRespaldos();
        break;
    }
  }
  
  toggleSidebar(): void {
    this.sidebarAbierta = !this.sidebarAbierta;
  }
  
  // ========== CARGA DE DATOS ==========
  private cargarDashboard(): void {
    this.http.get<any>(`${environment.apiUrl}/configuracion/dashboard`).subscribe({
      next: (data) => {
        this.dashboard = data;
        console.log('📊 Dashboard cargado:', data);
      },
      error: (err) => {
        console.error('❌ Error al cargar dashboard:', err);
        this.crearDashboardMock();
      }
    });
  }
  
  private cargarConfiguracionEmpresarial(): void {
    this.http.get<any>(`${environment.apiUrl}/configuracion/empresarial`).subscribe({
      next: (data) => {
        this.configuracionEmpresarial = data;
        console.log('🏢 Configuración empresarial cargada:', data);
      },
      error: (err) => {
        console.error('❌ Error al cargar configuración empresarial:', err);
        this.crearConfiguracionMock();
      }
    });
  }
  
  private cargarUsuarios(): void {
    this.http.get<any[]>(`${environment.apiUrl}/configuracion/usuarios`).subscribe({
      next: (data) => {
        this.usuarios = data;
        console.log(`👥 ${data.length} usuarios cargados`);
      },
      error: (err) => {
        console.error('❌ Error al cargar usuarios:', err);
        this.crearUsuariosMock();
      }
    });
  }
  
  private cargarLogs(): void {
    const params = {
      nivel: this.nivelLog,
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta,
      filtro: this.filtroLogs
    };
    
    this.http.get<any[]>(`${environment.apiUrl}/configuracion/logs`, { params }).subscribe({
      next: (data) => {
        this.logs = data;
        console.log(`📋 ${data.length} logs cargados`);
      },
      error: (err) => {
        console.error('❌ Error al cargar logs:', err);
        this.crearLogsMock();
      }
    });
  }
  
  private cargarAuditoria(): void {
    this.http.get<any[]>(`${environment.apiUrl}/configuracion/auditoria`).subscribe({
      next: (data) => {
        this.auditoria = data;
        console.log(`📋 ${data.length} registros de auditoría cargados`);
      },
      error: (err) => {
        console.error('❌ Error al cargar auditoría:', err);
        this.crearAuditoriaMock();
      }
    });
  }
  
  private cargarAlertas(): void {
    this.http.get<any[]>(`${environment.apiUrl}/configuracion/alertas`).subscribe({
      next: (data) => {
        this.alertas = data;
        console.log(`🚨 ${data.length} alertas cargadas`);
      },
      error: (err) => {
        console.error('❌ Error al cargar alertas:', err);
        this.crearAlertasMock();
      }
    });
  }
  
  private cargarMetricas(): void {
    this.http.get<any>(`${environment.apiUrl}/configuracion/metricas`).subscribe({
      next: (data) => {
        this.metricas = data;
        console.log('📈 Métricas cargadas:', data);
      },
      error: (err) => {
        console.error('❌ Error al cargar métricas:', err);
        this.crearMetricasMock();
      }
    });
  }
  
  private cargarEstadoSistema(): void {
    this.http.get<any>(`${environment.apiUrl}/configuracion/estado-sistema`).subscribe({
      next: (data) => {
        this.estadoSistema = data;
        console.log('🖥️ Estado del sistema cargado:', data);
      },
      error: (err) => {
        console.error('❌ Error al cargar estado del sistema:', err);
        this.crearEstadoSistemaMock();
      }
    });
  }
  
  private cargarRespaldos(): void {
    this.http.get<any[]>(`${environment.apiUrl}/configuracion/respaldos`).subscribe({
      next: (data) => {
        this.respaldos = data;
        console.log(`💾 ${data.length} respaldos cargados`);
      },
      error: (err) => {
        console.error('❌ Error al cargar respaldos:', err);
        this.crearRespaldosMock();
      }
    });
  }
  
  private cargarModulos(): void {
    this.http.get<any[]>(`${environment.apiUrl}/configuracion/modulos`).subscribe({
      next: (data) => {
        this.modulos = data;
        console.log(`⚙️ ${data.length} módulos cargados`);
      },
      error: (err) => {
        console.error('❌ Error al cargar módulos:', err);
        this.crearModulosMock();
      }
    });
  }
  
  // ========== MÉTODOS DE USUARIOS ==========
  abrirModalUsuario(usuario?: UsuarioSistema): void {
    this.usuarioEditando = usuario ? { ...usuario } : this.crearUsuarioVacio();
    this.mostrarModalUsuario = true;
  }
  
  cerrarModalUsuario(): void {
    this.mostrarModalUsuario = false;
    this.usuarioEditando = null;
  }
  
  guardarUsuario(): void {
    if (!this.usuarioEditando) return;
    
    this.cargando = true;
    const url = this.usuarioEditando.id ? 
      `/api/configuracion/usuarios/${this.usuarioEditando.id}` : 
      '/api/configuracion/usuarios';
    
    const metodo = this.usuarioEditando.id ? 'put' : 'post';
    
    this.http[metodo](url, this.usuarioEditando).subscribe({
      next: () => {
        console.log('✅ Usuario guardado exitosamente');
        this.cerrarModalUsuario();
        this.cargarUsuarios();
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error al guardar usuario:', err);
        this.cargando = false;
      }
    });
  }
  
  eliminarUsuario(id: number): void {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      this.http.delete(`/api/configuracion/usuarios/${id}`).subscribe({
        next: () => {
          console.log('✅ Usuario eliminado exitosamente');
          this.cargarUsuarios();
        },
        error: (err) => {
          console.error('❌ Error al eliminar usuario:', err);
        }
      });
    }
  }
  
  // ========== MÉTODOS DE CONFIGURACIÓN EMPRESARIAL ==========
  abrirModalEmpresa(): void {
    this.configuracionEditando = this.configuracionEmpresarial ? 
      { ...this.configuracionEmpresarial } : this.crearConfiguracionVacia();
    this.mostrarModalEmpresa = true;
  }
  
  cerrarModalEmpresa(): void {
    this.mostrarModalEmpresa = false;
    this.configuracionEditando = null;
  }
  
  guardarConfiguracionEmpresarial(): void {
    if (!this.configuracionEditando) return;
    
    this.cargando = true;
    this.http.put('/api/configuracion/empresarial', this.configuracionEditando).subscribe({
      next: () => {
        console.log('✅ Configuración empresarial guardada exitosamente');
        this.cerrarModalEmpresa();
        this.cargarConfiguracionEmpresarial();
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error al guardar configuración empresarial:', err);
        this.cargando = false;
      }
    });
  }
  
  // ========== MÉTODOS DE RESPALDOS ==========
  crearRespaldo(): void {
    this.mostrarModalRespaldo = true;
  }
  
  cerrarModalRespaldo(): void {
    this.mostrarModalRespaldo = false;
  }
  
  ejecutarRespaldo(tipo: string): void {
    this.cargando = true;
    this.http.post('/api/configuracion/respaldos', { tipo }).subscribe({
      next: () => {
        console.log('✅ Respaldo iniciado exitosamente');
        this.cerrarModalRespaldo();
        this.cargarRespaldos();
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error al crear respaldo:', err);
        this.cargando = false;
      }
    });
  }
  
  // ========== MÉTODOS DE LOGS ==========
  abrirModalLogs(): void {
    this.mostrarModalLogs = true;
  }
  
  cerrarModalLogs(): void {
    this.mostrarModalLogs = false;
  }
  
  filtrarLogs(): void {
    this.cargarLogs();
  }
  
  limpiarLogs(): void {
    if (confirm('¿Está seguro de limpiar todos los logs?')) {
      this.http.delete('/api/configuracion/logs').subscribe({
        next: () => {
          console.log('✅ Logs limpiados exitosamente');
          this.cargarLogs();
        },
        error: (err) => {
          console.error('❌ Error al limpiar logs:', err);
        }
      });
    }
  }

  exportarLogs(): void {
    const logsData = this.logs.map(log => ({
      nivel: log.nivel,
      timestamp: log.timestamp,
      modulo: log.modulo,
      mensaje: log.mensaje,
      usuario: log.usuario || 'N/A',
      ip: log.ip || 'N/A',
      duracion: log.duracion || 'N/A'
    }));

    const csvContent = this.convertirLogsACSV(logsData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `logs_sistema_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ Logs exportados exitosamente');
  }

  private convertirLogsACSV(logs: any[]): string {
    const headers = ['Nivel', 'Timestamp', 'Módulo', 'Mensaje', 'Usuario', 'IP', 'Duración'];
    const csvRows = [headers.join(',')];
    
    logs.forEach(log => {
      const row = [
        log.nivel,
        log.timestamp,
        log.modulo,
        `"${log.mensaje.replace(/"/g, '""')}"`,
        log.usuario,
        log.ip,
        log.duracion
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }

  // ========== MÉTODOS PARA ESTADÍSTICAS DE LOGS ==========
  obtenerTotalLogs(): number {
    return this.logs.length;
  }

  obtenerLogsError(): number {
    return this.logs.filter(log => log.nivel === 'ERROR').length;
  }

  obtenerLogsWarning(): number {
    return this.logs.filter(log => log.nivel === 'WARN').length;
  }

  obtenerLogsInfo(): number {
    return this.logs.filter(log => log.nivel === 'INFO').length;
  }

  obtenerLogsDebug(): number {
    return this.logs.filter(log => log.nivel === 'DEBUG').length;
  }
  
  // ========== MÉTODOS DE UTILIDAD ==========
  obtenerClaseNivelLog(nivel: string): string {
    const clases = {
      'DEBUG': 'badge--info',
      'INFO': 'badge--success',
      'WARN': 'badge--warning',
      'ERROR': 'badge--danger',
      'FATAL': 'badge--danger'
    };
    return clases[nivel as keyof typeof clases] || 'badge--info';
  }
  
  obtenerIconoTipoAccion(tipo: string): string {
    const iconos = {
      'creacion': '➕',
      'actualizacion': '✏️',
      'eliminacion': '🗑️',
      'acceso': '🔓',
      'error': '❌'
    };
    return iconos[tipo as keyof typeof iconos] || '📝';
  }
  
  obtenerColorTipoAccion(tipo: string): string {
    const colores = {
      'creacion': '#10b981',
      'actualizacion': '#3b82f6',
      'eliminacion': '#ef4444',
      'acceso': '#8b5cf6',
      'error': '#f59e0b'
    };
    return colores[tipo as keyof typeof colores] || '#6b7280';
  }
  
  formatearFecha(fecha: Date | string): string {
    return new Date(fecha).toLocaleString('es-ES');
  }
  
  formatearTamano(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
  
  // ========== MÉTODOS MOCK (DATOS DE PRUEBA) ==========
  private crearDashboardMock(): void {
    this.dashboard = {
      estadisticasGenerales: {
        totalUsuarios: 15,
        usuariosActivos: 12,
        totalRegistros: 2847,
        registrosHoy: 23,
        erroresHoy: 2,
        respaldosCompletados: 5,
        espacioUtilizado: 2.4,
        uptime: 99.8
      },
      actividadReciente: [],
      alertasSistema: [],
      metricasRendimiento: {
        tiempoRespuesta: 120,
        usoMemoria: 45,
        usoCPU: 23,
        conexionesActivas: 8,
        peticionesPorMinuto: 45,
        erroresPorHora: 1,
        uptime: 99.8
      },
      proximasTareas: [],
      estadoServicios: []
    };
  }
  
  private crearConfiguracionMock(): void {
    this.configuracionEmpresarial = {
      nombreEmpresa: 'Municipalidad de Ejemplo',
      razonSocial: 'Municipalidad Provincial de Ejemplo',
      ruc: '20123456789',
      direccion: 'Plaza Principal S/N',
      telefono: '01-2345678',
      email: 'contacto@municipalidad.gob.pe',
      web: 'www.municipalidad.gob.pe',
      colores: {
        primario: '#3b82f6',
        secundario: '#8b5cf6',
        acento: '#10b981',
        fondo: '#1e293b',
        texto: '#ffffff',
        exito: '#10b981',
        advertencia: '#f59e0b',
        error: '#ef4444',
        info: '#06b6d4'
      },
      configuracionGeneral: {
        moneda: 'PEN',
        idioma: 'es',
        zonaHoraria: 'America/Lima',
        formatoFecha: 'DD/MM/YYYY',
        formatoHora: 'HH:mm',
        decimales: 2,
        separadorDecimal: '.',
        separadorMiles: ','
      },
      configuracionSistema: {
        version: '1.0.0',
        ambiente: 'produccion',
        mantenimiento: false,
        respaldosAutomaticos: true,
        frecuenciaRespaldo: 'diario',
        diasRetencionLogs: 30,
        maxIntentosLogin: 3,
        tiempoSesion: 480,
        validacionesEstrictas: true
      },
      configuracionNotificaciones: {
        emailActivo: true,
        smsActivo: false,
        notificacionesPush: true,
        servidorSMTP: 'smtp.gmail.com',
        puertoSMTP: 587,
        usuarioSMTP: 'sistema@municipalidad.gob.pe',
        passwordSMTP: '***',
        sslSMTP: true,
        emailRemitente: 'sistema@municipalidad.gob.pe',
        nombreRemitente: 'Sistema Municipal'
      },
      configuracionSeguridad: {
        encriptacionDatos: true,
        autenticacionDosFactores: false,
        sesionesConcurrentes: 3,
        ipPermitidas: [],
        horariosAcceso: [],
        politicasPassword: {
          longitudMinima: 8,
          requiereMayusculas: true,
          requiereMinusculas: true,
          requiereNumeros: true,
          requiereSimbolos: false,
          diasExpiracion: 90,
          noReutilizarUltimas: 5
        },
        auditoriaCompleta: true
      }
    };
  }
  
  private crearUsuariosMock(): void {
    this.usuarios = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@municipalidad.gob.pe',
        nombre: 'Administrador',
        apellidos: 'Sistema',
        telefono: '01-2345678',
        cargo: 'Administrador de Sistemas',
        area: 'Tecnología',
        rol: {
          id: 1,
          nombre: 'Administrador',
          descripcion: 'Acceso completo al sistema',
          nivel: 1,
          permisos: ['*'],
          activo: true
        },
        activo: true,
        ultimoAcceso: new Date(),
        fechaCreacion: new Date(),
        permisos: [],
        configuracionPersonal: {
          tema: 'oscuro',
          idioma: 'es',
          notificacionesEmail: true,
          notificacionesPush: true,
          dashboardPersonalizado: true,
          widgetsActivos: ['metricas', 'alertas', 'actividad']
        }
      }
    ];
  }
  
  private crearLogsMock(): void {
    this.logs = [
      {
        id: 1,
        timestamp: new Date(),
        nivel: 'INFO',
        modulo: 'Autenticación',
        accion: 'Login exitoso',
        usuario: 'admin',
        ip: '192.168.1.100',
        mensaje: 'Usuario admin inició sesión correctamente',
        duracion: 150,
        memoria: 45.2,
        cpu: 12.5
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 300000),
        nivel: 'WARN',
        modulo: 'Planillas',
        accion: 'Validación',
        usuario: 'rrhh',
        ip: '192.168.1.101',
        mensaje: 'Advertencia: Campo obligatorio vacío en planilla',
        duracion: 200,
        memoria: 52.1,
        cpu: 15.3
      }
    ];
  }
  
  private crearAuditoriaMock(): void {
    this.auditoria = [
      {
        id: 1,
        timestamp: new Date(),
        usuario: 'admin',
        accion: 'Actualización',
        modulo: 'Usuarios',
        entidad: 'Usuario',
        entidadId: '2',
        cambios: [
          {
            campo: 'activo',
            valorAnterior: false,
            valorNuevo: true,
            tipo: 'actualizacion'
          }
        ],
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        resultado: 'exitoso',
        duracion: 250
      }
    ];
  }
  
  private crearAlertasMock(): void {
    this.alertas = [
      {
        id: 1,
        tipo: 'warning',
        titulo: 'Espacio en disco bajo',
        mensaje: 'El espacio disponible en disco está por debajo del 20%',
        fecha: new Date(),
        leida: false,
        prioridad: 'media'
      },
      {
        id: 2,
        tipo: 'error',
        titulo: 'Error en conexión a base de datos',
        mensaje: 'Se detectó un error temporal en la conexión a la base de datos',
        fecha: new Date(Date.now() - 600000),
        leida: true,
        prioridad: 'alta'
      }
    ];
  }
  
  private crearMetricasMock(): void {
    this.metricas = {
      fecha: new Date(),
      usuariosActivos: 8,
      sesionesActivas: 12,
      peticionesTotal: 1247,
      peticionesExitosas: 1235,
      peticionesError: 12,
      tiempoRespuestaPromedio: 145,
      usoMemoria: 45.2,
      usoCPU: 23.1,
      espacioDisco: 2.4,
      erroresCriticos: 0,
      advertencias: 3
    };
  }
  
  private crearEstadoSistemaMock(): void {
    this.estadoSistema = {
      servidor: 'online',
      baseDatos: 'conectada',
      servicios: [
        {
          nombre: 'API REST',
          estado: 'activo',
          version: '1.0.0',
          ultimaVerificacion: new Date(),
          tiempoRespuesta: 120
        },
        {
          nombre: 'Base de Datos',
          estado: 'activo',
          version: 'SQL Server 2019',
          ultimaVerificacion: new Date(),
          tiempoRespuesta: 45
        }
      ],
      ultimaVerificacion: new Date(),
      proximoMantenimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
  }
  
  private crearRespaldosMock(): void {
    this.respaldos = [
      {
        id: 1,
        nombre: 'Respaldo Completo - 2025-01-15',
        descripcion: 'Respaldo automático diario',
        fecha: new Date(),
        tamano: 1024 * 1024 * 500, // 500 MB
        tipo: 'completo',
        estado: 'completado',
        ubicacion: '/respaldos/backup_20250115.bak',
        comprimido: true,
        encriptado: true,
        usuario: 'sistema'
      }
    ];
  }
  
  private crearModulosMock(): void {
    this.modulos = [
      {
        modulo: 'planillas',
        nombre: 'Módulo de Planillas',
        descripcion: 'Gestión de planillas y remuneraciones',
        version: '1.2.0',
        activo: true,
        configuracion: {},
        dependencias: ['trabajadores', 'asistencias'],
        ultimaActualizacion: new Date(),
        responsable: 'admin'
      },
      {
        modulo: 'trabajadores',
        nombre: 'Módulo de Trabajadores',
        descripcion: 'Gestión de personal y datos laborales',
        version: '1.1.5',
        activo: true,
        configuracion: {},
        dependencias: [],
        ultimaActualizacion: new Date(),
        responsable: 'admin'
      }
    ];
  }
  
  private crearUsuarioVacio(): UsuarioSistema {
    return {
      username: '',
      email: '',
      nombre: '',
      apellidos: '',
      rol: {
        id: 0,
        nombre: '',
        descripcion: '',
        nivel: 0,
        permisos: [],
        activo: true
      },
      activo: true,
      permisos: [],
      configuracionPersonal: {
        tema: 'oscuro',
        idioma: 'es',
        notificacionesEmail: true,
        notificacionesPush: true,
        dashboardPersonalizado: false,
        widgetsActivos: []
      }
    };
  }
  
  private crearConfiguracionVacia(): ConfiguracionEmpresarial {
    return {
      nombreEmpresa: '',
      razonSocial: '',
      ruc: '',
      direccion: '',
      telefono: '',
      email: '',
      colores: {
        primario: '#3b82f6',
        secundario: '#8b5cf6',
        acento: '#10b981',
        fondo: '#1e293b',
        texto: '#ffffff',
        exito: '#10b981',
        advertencia: '#f59e0b',
        error: '#ef4444',
        info: '#06b6d4'
      },
      configuracionGeneral: {
        moneda: 'PEN',
        idioma: 'es',
        zonaHoraria: 'America/Lima',
        formatoFecha: 'DD/MM/YYYY',
        formatoHora: 'HH:mm',
        decimales: 2,
        separadorDecimal: '.',
        separadorMiles: ','
      },
      configuracionSistema: {
        version: '1.0.0',
        ambiente: 'produccion',
        mantenimiento: false,
        respaldosAutomaticos: true,
        frecuenciaRespaldo: 'diario',
        diasRetencionLogs: 30,
        maxIntentosLogin: 3,
        tiempoSesion: 480,
        validacionesEstrictas: true
      },
      configuracionNotificaciones: {
        emailActivo: true,
        smsActivo: false,
        notificacionesPush: true,
        servidorSMTP: '',
        puertoSMTP: 587,
        usuarioSMTP: '',
        passwordSMTP: '',
        sslSMTP: true,
        emailRemitente: '',
        nombreRemitente: ''
      },
      configuracionSeguridad: {
        encriptacionDatos: true,
        autenticacionDosFactores: false,
        sesionesConcurrentes: 3,
        ipPermitidas: [],
        horariosAcceso: [],
        politicasPassword: {
          longitudMinima: 8,
          requiereMayusculas: true,
          requiereMinusculas: true,
          requiereNumeros: true,
          requiereSimbolos: false,
          diasExpiracion: 90,
          noReutilizarUltimas: 5
        },
        auditoriaCompleta: true
      }
    };
  }
  
  // ========== MÉTODOS AUXILIARES ==========
  getRoleColor(roleName: string): string {
    const colors: { [key: string]: string } = {
      'Administrador': '#ef4444',
      'Supervisor': '#f59e0b',
      'Usuario': '#3b82f6',
      'Editor': '#10b981',
      'Lectura': '#6b7280'
    };
    return colors[roleName] || '#6b7280';
  }
  
  getColorEntries(colores: any): Array<{key: string, value: string}> {
    return Object.entries(colores).map(([key, value]) => ({
      key: key.charAt(0).toUpperCase() + key.slice(1),
      value: value as string
    }));
  }
  
  // ========== MÉTODOS AUXILIARES PARA TEMPLATE ==========
  obtenerIconoTabActiva(): string {
    const tab = this.menuConfiguracion.find(m => m.id === this.tabActiva);
    return tab?.icono || '⚙️';
  }
  
  obtenerTituloTabActiva(): string {
    const tab = this.menuConfiguracion.find(m => m.id === this.tabActiva);
    return tab?.titulo || 'Configuración';
  }
  
  obtenerDescripcionTabActiva(): string {
    const tab = this.menuConfiguracion.find(m => m.id === this.tabActiva);
    return tab?.descripcion || 'Panel de configuración del sistema';
  }
  
}
