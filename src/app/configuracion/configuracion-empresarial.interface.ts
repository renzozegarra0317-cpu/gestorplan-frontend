// =====================================================
// INTERFACES PARA CONFIGURACIÓN EMPRESARIAL PREMIUM
// =====================================================

// ========== CONFIGURACIÓN EMPRESARIAL ==========
export interface ConfiguracionEmpresarial {
  id?: number;
  nombreEmpresa: string;
  razonSocial: string;
  ruc: string;
  direccion: string;
  telefono: string;
  email: string;
  web?: string;
  logo?: string;
  logoUrl?: string;
  colores: ColoresEmpresa;
  configuracionGeneral: ConfiguracionGeneralEmpresa;
  configuracionSistema: ConfiguracionSistema;
  configuracionNotificaciones: ConfiguracionNotificaciones;
  configuracionSeguridad: ConfiguracionSeguridad;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  usuarioCreacion?: string;
  usuarioActualizacion?: string;
}

export interface ColoresEmpresa {
  primario: string;
  secundario: string;
  acento: string;
  fondo: string;
  texto: string;
  exito: string;
  advertencia: string;
  error: string;
  info: string;
}

export interface ConfiguracionGeneralEmpresa {
  moneda: string;
  idioma: string;
  zonaHoraria: string;
  formatoFecha: string;
  formatoHora: string;
  decimales: number;
  separadorDecimal: string;
  separadorMiles: string;
}

export interface ConfiguracionSistema {
  version: string;
  ambiente: 'desarrollo' | 'produccion' | 'pruebas';
  mantenimiento: boolean;
  respaldosAutomaticos: boolean;
  frecuenciaRespaldo: string;
  diasRetencionLogs: number;
  maxIntentosLogin: number;
  tiempoSesion: number;
  validacionesEstrictas: boolean;
}

export interface ConfiguracionNotificaciones {
  emailActivo: boolean;
  smsActivo: boolean;
  notificacionesPush: boolean;
  servidorSMTP: string;
  puertoSMTP: number;
  usuarioSMTP: string;
  passwordSMTP: string;
  sslSMTP: boolean;
  emailRemitente: string;
  nombreRemitente: string;
}

export interface ConfiguracionSeguridad {
  encriptacionDatos: boolean;
  autenticacionDosFactores: boolean;
  sesionesConcurrentes: number;
  ipPermitidas: string[];
  horariosAcceso: HorarioAcceso[];
  politicasPassword: PoliticasPassword;
  auditoriaCompleta: boolean;
}

export interface HorarioAcceso {
  dia: string;
  horaInicio: string;
  horaFin: string;
  activo: boolean;
}

export interface PoliticasPassword {
  longitudMinima: number;
  requiereMayusculas: boolean;
  requiereMinusculas: boolean;
  requiereNumeros: boolean;
  requiereSimbolos: boolean;
  diasExpiracion: number;
  noReutilizarUltimas: number;
}

// ========== GESTIÓN DE USUARIOS ==========
export interface UsuarioSistema {
  id?: number;
  username: string;
  email: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  cargo?: string;
  area?: string;
  rol: RolUsuario;
  activo: boolean;
  ultimoAcceso?: Date;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
  usuarioCreacion?: string;
  permisos: PermisoUsuario[];
  configuracionPersonal: ConfiguracionPersonal;
}

export interface RolUsuario {
  id: number;
  nombre: string;
  descripcion: string;
  nivel: number;
  permisos: string[];
  activo: boolean;
}

export interface PermisoUsuario {
  modulo: string;
  accion: string;
  permitido: boolean;
  restricciones?: string[];
}

export interface ConfiguracionPersonal {
  tema: 'claro' | 'oscuro' | 'auto';
  idioma: string;
  notificacionesEmail: boolean;
  notificacionesPush: boolean;
  dashboardPersonalizado: boolean;
  widgetsActivos: string[];
}

// ========== MONITOREO DEL SISTEMA ==========
export interface LogSistema {
  id?: number;
  timestamp: Date;
  nivel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  modulo: string;
  accion: string;
  usuario?: string;
  ip?: string;
  mensaje: string;
  detalles?: any;
  duracion?: number;
  memoria?: number;
  cpu?: number;
}

export interface MetricasSistema {
  fecha: Date;
  usuariosActivos: number;
  sesionesActivas: number;
  peticionesTotal: number;
  peticionesExitosas: number;
  peticionesError: number;
  tiempoRespuestaPromedio: number;
  usoMemoria: number;
  usoCPU: number;
  espacioDisco: number;
  erroresCriticos: number;
  advertencias: number;
}

export interface EstadoSistema {
  servidor: 'online' | 'offline' | 'mantenimiento';
  baseDatos: 'conectada' | 'desconectada' | 'error';
  servicios: EstadoServicio[];
  ultimaVerificacion: Date;
  proximoMantenimiento?: Date;
}

export interface EstadoServicio {
  nombre: string;
  estado: 'activo' | 'inactivo' | 'error';
  version: string;
  ultimaVerificacion: Date;
  tiempoRespuesta?: number;
  detalles?: string;
}

// ========== AUDITORÍA E HISTORIAL ==========
export interface Auditoria {
  id?: number;
  timestamp: Date;
  usuario: string;
  accion: string;
  modulo: string;
  entidad: string;
  entidadId: string;
  cambios: CambioAuditoria[];
  ip: string;
  userAgent: string;
  resultado: 'exitoso' | 'fallido' | 'parcial';
  duracion: number;
  detalles?: string;
}

export interface CambioAuditoria {
  campo: string;
  valorAnterior: any;
  valorNuevo: any;
  tipo: 'creacion' | 'actualizacion' | 'eliminacion' | 'lectura';
}

export interface HistorialCambios {
  entidad: string;
  entidadId: string;
  cambios: Auditoria[];
  totalCambios: number;
  primerCambio: Date;
  ultimoCambio: Date;
  usuarioResponsable: string;
}

// ========== CONFIGURACIÓN DE MÓDULOS ==========
export interface ConfiguracionModulo {
  modulo: string;
  nombre: string;
  descripcion: string;
  version: string;
  activo: boolean;
  configuracion: any;
  dependencias: string[];
  ultimaActualizacion: Date;
  responsable: string;
}

export interface ConfiguracionPlanillas {
  calculosAutomaticos: boolean;
  validacionesEstrictas: boolean;
  aprobacionObligatoria: boolean;
  notificacionesGeneracion: boolean;
  respaldoAutomatico: boolean;
  formatoBoletas: string;
  camposObligatorios: string[];
  restriccionesHorarias: boolean;
  horarioInicio: string;
  horarioFin: string;
}

export interface ConfiguracionAsistencias {
  registroAutomatico: boolean;
  toleranciaEntrada: number;
  toleranciaSalida: number;
  horariosFlexibles: boolean;
  validacionBiometrica: boolean;
  notificacionesTardanzas: boolean;
  calculoAutomaticoHoras: boolean;
  descuentosAutomaticos: boolean;
}

export interface ConfiguracionBeneficios {
  calculoAutomaticoCTS: boolean;
  calculoAutomaticoGratificaciones: boolean;
  calculoAutomaticoUtilidades: boolean;
  calculoAutomaticoVacaciones: boolean;
  notificacionesVencimientos: boolean;
  diasAnticipacionNotificacion: number;
  aprobacionManual: boolean;
}

// ========== HERRAMIENTAS AVANZADAS ==========
export interface RespaldoSistema {
  id?: number;
  nombre: string;
  descripcion: string;
  fecha: Date;
  tamano: number;
  tipo: 'completo' | 'incremental' | 'diferencial';
  estado: 'en_progreso' | 'completado' | 'fallido';
  ubicacion: string;
  comprimido: boolean;
  encriptado: boolean;
  usuario: string;
}

export interface ImportacionDatos {
  id?: number;
  tipo: string;
  archivo: string;
  registrosTotal: number;
  registrosProcesados: number;
  registrosExitosos: number;
  registrosError: number;
  fechaInicio: Date;
  fechaFin?: Date;
  estado: 'pendiente' | 'procesando' | 'completado' | 'fallido';
  errores: ErrorImportacion[];
  usuario: string;
}

export interface ErrorImportacion {
  fila: number;
  campo: string;
  valor: string;
  error: string;
  severidad: 'bajo' | 'medio' | 'alto' | 'critico';
}

export interface ExportacionDatos {
  id?: number;
  tipo: string;
  formato: 'excel' | 'csv' | 'pdf' | 'json';
  registros: number;
  fecha: Date;
  estado: 'pendiente' | 'procesando' | 'completado' | 'fallido';
  archivo: string;
  usuario: string;
}

// ========== DASHBOARD DE CONFIGURACIÓN ==========
export interface DashboardConfiguracion {
  estadisticasGenerales: EstadisticasGenerales;
  actividadReciente: ActividadReciente[];
  alertasSistema: AlertaSistema[];
  metricasRendimiento: MetricasRendimiento;
  proximasTareas: TareaProgramada[];
  estadoServicios: EstadoServicio[];
}

export interface EstadisticasGenerales {
  totalUsuarios: number;
  usuariosActivos: number;
  totalRegistros: number;
  registrosHoy: number;
  erroresHoy: number;
  respaldosCompletados: number;
  espacioUtilizado: number;
  uptime: number;
}

export interface ActividadReciente {
  id: number;
  timestamp: Date;
  usuario: string;
  accion: string;
  modulo: string;
  descripcion: string;
  tipo: 'creacion' | 'actualizacion' | 'eliminacion' | 'acceso' | 'error';
  icono: string;
  color: string;
}

export interface AlertaSistema {
  id: number;
  tipo: 'info' | 'warning' | 'error' | 'success';
  titulo: string;
  mensaje: string;
  fecha: Date;
  leida: boolean;
  accion?: string;
  url?: string;
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
}

export interface MetricasRendimiento {
  tiempoRespuesta: number;
  usoMemoria: number;
  usoCPU: number;
  conexionesActivas: number;
  peticionesPorMinuto: number;
  erroresPorHora: number;
  uptime: number;
}

export interface TareaProgramada {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: 'respaldo' | 'limpieza' | 'reporte' | 'notificacion' | 'mantenimiento';
  programacion: string;
  proximaEjecucion: Date;
  estado: 'activa' | 'pausada' | 'completada' | 'fallida';
  ultimaEjecucion?: Date;
  resultado?: string;
}

// ========== NAVEGACIÓN Y UI ==========
export interface MenuConfiguracion {
  id: string;
  titulo: string;
  icono: string;
  ruta: string;
  descripcion: string;
  color: string;
  activo: boolean;
  orden: number;
  submenu?: MenuConfiguracion[];
  permisos?: string[];
  badge?: {
    texto: string;
    color: string;
  };
}

export interface WidgetDashboard {
  id: string;
  titulo: string;
  tipo: 'grafico' | 'tabla' | 'metricas' | 'lista' | 'alerta';
  posicion: { x: number; y: number; w: number; h: number };
  configuracion: any;
  datos: any;
  actualizacion: Date;
  visible: boolean;
}

// ========== CONFIGURACIÓN DE REPORTES ==========
export interface ConfiguracionReporte {
  id?: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  parametros: any;
  formato: 'pdf' | 'excel' | 'csv' | 'html';
  programacion?: string;
  activo: boolean;
  publico: boolean;
  permisos: string[];
  usuario: string;
  fechaCreacion: Date;
}

// ========== INTEGRACIONES ==========
export interface IntegracionSistema {
  id?: number;
  nombre: string;
  tipo: 'api' | 'webhook' | 'base_datos' | 'archivo' | 'email';
  configuracion: any;
  activa: boolean;
  ultimaSincronizacion?: Date;
  proximaSincronizacion?: Date;
  estado: 'activa' | 'inactiva' | 'error' | 'sincronizando';
  logs: LogIntegracion[];
}

export interface LogIntegracion {
  id?: number;
  timestamp: Date;
  tipo: 'info' | 'warning' | 'error' | 'success';
  mensaje: string;
  detalles?: any;
  duracion?: number;
}
