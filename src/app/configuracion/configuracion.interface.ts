// ==================== CONFIGURACIÓN GENERAL ====================
export interface ConfiguracionGeneral {
  empresa: ConfiguracionEmpresa;
  planillas: ConfiguracionPlanillas;
  beneficios: ConfiguracionBeneficios;
  asistencia: ConfiguracionAsistencia;
  rrhh: ConfiguracionRRHH;
  tributario: ConfiguracionTributaria;
  seguridad: ConfiguracionSeguridad;
  notificaciones: ConfiguracionNotificaciones;
  personalizacion: ConfiguracionPersonalizacion;
  backup: ConfiguracionBackup;
  sistema: ConfiguracionSistema;
  integraciones: ConfiguracionIntegraciones;
}

// ==================== EMPRESA ====================
export interface ConfiguracionEmpresa {
  razonSocial: string;
  nombreComercial: string;
  ruc: string;
  direccion: string;
  distrito: string;
  provincia: string;
  departamento: string;
  pais: string;
  telefono: string;
  celular: string;
  email: string;
  web: string;
  logo: string;
  
  // Autoridades
  alcalde: string;
  gerenteMunicipal: string;
  gerenteRRHH: string;
  
  // Periodo
  periodoGestion: string;
  fechaInicioGestion: Date;
  fechaFinGestion: Date;
  
  // Legal
  actividadEconomica: string;
  codigoCIIU: string;
  tipoContribuyente: string;
  regimenTributario: string;
}

// ==================== PLANILLAS ====================
export interface ConfiguracionPlanillas {
  // General
  monedaPorDefecto: 'PEN' | 'USD';
  simboloMoneda: string;
  tipoCambio: number;
  actualizarTipoCambioAuto: boolean;
  
  // Cálculos
  diasDelMes: 30 | 'real';
  horasPorDia: number;
  redondeoDecimales: number;
  redondeoTipo: 'normal' | 'arriba' | 'abajo';
  
  // Conceptos
  conceptosFijos: ConceptoPlanilla[];
  formulas: FormulaPlanilla[];
  
  // Configuración de cálculo
  calcularHorasExtrasAuto: boolean;
  aplicarRetencionAutomatica: boolean;
  generarBoletasAuto: boolean;
  
  // Fechas importantes
  diaCierrePlanilla: number;
  diaPagoPlanilla: number;
  
  // AFP/ONP
  afpPorDefecto: string;
  comisionAFP: { [key: string]: ComisionAFP };
  porcentajeONP: number;
  
  // Asignación Familiar
  montoAsignacionFamiliar: number;
  
  // Otros
  permitirPlanillasCerradas: boolean;
  historicoMesesMaximo: number;
}

export interface ConceptoPlanilla {
  id: string;
  codigo: string;
  nombre: string;
  tipo: 'ingreso' | 'descuento' | 'aporte';
  categoria: string;
  formula?: string;
  activo: boolean;
  orden: number;
}

export interface FormulaPlanilla {
  id: string;
  nombre: string;
  descripcion: string;
  formula: string;
  variables: string[];
}

export interface ComisionAFP {
  nombre: string;
  comisionFlujo: number;
  comisionMixta: number;
  primaSeguro: number;
  aporteObligatorio: number;
}

// ==================== BENEFICIOS ====================
export interface ConfiguracionBeneficios {
  cts: ConfiguracionCTS;
  gratificaciones: ConfiguracionGratificaciones;
  vacaciones: ConfiguracionVacaciones;
  utilidades: ConfiguracionUtilidades;
}

export interface ConfiguracionCTS {
  tasaInteres: number;
  bancoDepositario: string;
  tipoCuenta: string;
  diasPorAnio: number;
  incluirGratificacionesEnCalculo: boolean;
  incluirHorasExtrasEnCalculo: boolean;
  mesesPromedioHorasExtras: number;
  generarDepositosAuto: boolean;
  fechaDepositoMayo: number;
  fechaDepositoNoviembre: number;
}

export interface ConfiguracionGratificaciones {
  porcentajeBonificacionExtraordinaria: number;
  incluirEnPlanillaMensual: boolean;
  mesGratificacionJulio: number;
  mesGratificacionDiciembre: number;
  aplicarRetencionRenta: boolean;
}

export interface ConfiguracionVacaciones {
  diasPorAnio: number;
  diasMinimoContinuo: number;
  diasMaximoFraccionamiento: number;
  permitirFraccionamiento: boolean;
  diasAnticipacionSolicitud: number;
  permitirAcumulacion: boolean;
  aniosMaximosAcumulacion: number;
  generarRecordAutomatico: boolean;
}

export interface ConfiguracionUtilidades {
  porcentajeDistribucionTrabajadores: number;
  porcentajePorDias: number;
  porcentajePorRemuneracion: number;
  diasAnioCompleto: number;
  aplicarRenta5ta: boolean;
}

// ==================== ASISTENCIA ====================
export interface ConfiguracionAsistencia {
  // Horarios
  horariosPorDefecto: HorarioTrabajo[];
  turnos: Turno[];
  
  // Tolerancias
  minutosToleranciaTardanza: number;
  tardanzasMaximasMes: number;
  faltasMaximasMes: number;
  
  // Marcación
  tipoMarcacion: 'biometrico' | 'manual' | 'mixto';
  requiereJustificacionTardanza: boolean;
  requiereJustificacionFalta: boolean;
  
  // Horas Extras
  permitirHorasExtras: boolean;
  requiereAprobacionHE: boolean;
  porcentajeHE25: number;
  porcentajeHE35: number;
  porcentajeHE100: number;
  
  // Días no laborables
  feriados: Feriado[];
  diasNoLaborables: Date[];
  
  // Reportes
  generarReportesDiarios: boolean;
  enviarAlertasTardanzas: boolean;
}

export interface HorarioTrabajo {
  id: string;
  nombre: string;
  horaEntrada: string;
  horaSalida: string;
  horaInicioAlmuerzo?: string;
  horaFinAlmuerzo?: string;
  diasLaborales: number[];
  activo: boolean;
}

export interface Turno {
  id: string;
  nombre: string;
  horaInicio: string;
  horaFin: string;
  tipo: 'diurno' | 'nocturno' | 'rotativo';
}

export interface Feriado {
  id: string;
  fecha: Date;
  nombre: string;
  tipo: 'nacional' | 'regional' | 'local';
  esLaborable: boolean;
}

// ==================== RRHH ====================
export interface ConfiguracionRRHH {
  // Estructuras
  cargos: Cargo[];
  tiposContrato: TipoContrato[];
  nivelesEducativos: string[];
  
  // Documentos
  documentosRequeridos: DocumentoRequerido[];
  
  // Evaluaciones
  periodoEvaluacionDesempeno: 'mensual' | 'trimestral' | 'semestral' | 'anual';
  fechaReunionEvaluacion?: Date | string; // Fecha de la próxima reunión de evaluación
  escalasEvaluacion: EscalaEvaluacion[];
  
  // Capacitaciones
  horasCapacitacionAnual: number;
  presupuestoCapacitacion: number;
  
  // Otros
  permitirAutoevaluacion: boolean;
  notificarCumpleanos: boolean;
  notificarAniversarios: boolean;
}

// Interfaz Area eliminada - Áreas ya no se usan

export interface Cargo {
  id: string;
  codigo: string;
  nombre: string;
  area: string;
  nivel: number;
  sueldoMinimo: number;
  sueldoMaximo: number;
  descripcion: string;
  requisitos: string;
}

export interface TipoContrato {
  id: string;
  nombre: string;
  descripcion: string;
  duracion: 'indefinido' | 'plazo_fijo';
  color: string;
}

export interface DocumentoRequerido {
  id: string;
  nombre: string;
  obligatorio: boolean;
  tipo: string;
}

export interface EscalaEvaluacion {
  id: string;
  nombre: string;
  valorMinimo: number;
  valorMaximo: number;
  descripcion: string;
}

// ==================== TRIBUTARIO ====================
export interface ConfiguracionTributaria {
  // SUNAT
  usuarioSUNAT: string;
  claveSUNAT: string;
  certificadoDigital: string;
  
  // PLAME
  versionPLAME: string;
  rutaPLAME: string;
  generarArchivosPLAMEAuto: boolean;
  
  // AFP
  codigosAFP: { [key: string]: string };
  rutaAFPNET: string;
  
  // Renta 5ta
  uitActual: number;
  tramoRenta: TramoRenta[];
  deduccionMinima: number;
  
  // EsSalud
  tasaEsSalud: number;
  tarifaSCTR: number;
  
  // ONP
  tasaONP: number;
  
  // Otros
  generarPDTAuto: boolean;
  declaracionElectronica: boolean;
}

export interface TramoRenta {
  id: string;
  desde: number;
  hasta: number;
  tasa: number;
}

// ==================== SEGURIDAD ====================
export interface ConfiguracionSeguridad {
  // Usuarios
  usuarios: Usuario[];
  roles: Rol[];
  
   // Políticas de contraseñas
  longitudMinimaPassword: number;
  requiereCaracteresEspeciales: boolean;
  requiereNumeros: boolean;
  requiereMayusculas: boolean;
  diasExpiracionPassword: number;
  
  // Sesiones
  tiempoMaximoSesion: number;
  sesionesSimultaneas: number;
  cerrarSesionInactividad: boolean;
  minutosInactividad: number;
  
  // Auditoría
  registrarCambios: boolean;
  nivelAuditoria: 'basico' | 'medio' | 'completo';
  diasRetencionLogs: number;
  
  // Seguridad adicional
  autenticacionDosFactores: boolean;
  permitirRecordarDispositivo: boolean;
  bloquearTrasIntentosFallidos: number;
  
  // IP y acceso
  ipsPermitidas: string[];
  restriccionHoraria: boolean;
  horarioAcceso: RangoHorario[];
}

export interface Usuario {
  id: string;
  username: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  ultimoAcceso?: Date;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: Permiso[];
}

export interface Permiso {
  modulo: string;
  acciones: string[];
}

export interface RangoHorario {
  desde: string;
  hasta: string;
  dias: number[];
}

// ==================== NOTIFICACIONES ====================
export interface ConfiguracionNotificaciones {
  // Email
  servidorSMTP: string;
  puertoSMTP: number;
  usuarioEmail: string;
  passwordEmail: string;
  emailRemitente: string;
  nombreRemitente: string;
  usarSSL: boolean;
  
  // Tipos de notificaciones
  notificarNuevoPlanilla: boolean;
  notificarPagoRealizado: boolean;
  notificarCumpleanos: boolean;
  notificarVencimientos: boolean;
  notificarTardanzas: boolean;
  
  // Destinatarios
  emailsAdministradores: string[];
  emailsRRHH: string[];
  
  // Frecuencia
  resumenDiario: boolean;
  resumenSemanal: boolean;
  resumenMensual: boolean;
  
  // WhatsApp (futuro)
  integrarWhatsApp: boolean;
  numeroWhatsApp: string;
  
  // SMS
  integrarSMS: boolean;
  proveedorSMS: string;
}

// ==================== PERSONALIZACIÓN ====================
export interface ConfiguracionPersonalizacion {
  // Tema
  tema: 'light' | 'dark' | 'auto';
  colorPrimario: string;
  colorSecundario: string;
  colorAccent: string;
  
  // Tipografía
  fuentePrincipal: string;
  tamanioFuente: 'pequeno' | 'mediano' | 'grande';
  
  // Logo y marca
  logoEmpresa: string;
  logoReportes: string;
  colorCorporativo: string;
  
  // Formatos
  formatoFecha: string;
  formatoHora: string;
  separadorDecimal: '.' | ',';
  separadorMiles: ',' | '.' | ' ';
  
  // Idioma
  idioma: 'es' | 'en' | 'qu';
  zonaHoraria: string;
  
  // Reportes
  orientacionReportesPorDefecto: 'portrait' | 'landscape';
  incluirLogoEnReportes: boolean;
  pieReportes: string;
  
  // Dashboard
  widgetsActivos: string[];
  ordenWidgets: string[];
  
  // Otros
  animaciones: boolean;
  sonidos: boolean;
  modoAccesibilidad: boolean;
}

// ==================== BACKUP ====================
export interface ConfiguracionBackup {
  // Configuración general
  backupAutomatico: boolean;
  frecuenciaBackup: 'diario' | 'semanal' | 'mensual';
  horaBackup: string;
  
  // Almacenamiento
  rutaBackupLocal: string;
  backupEnNube: boolean;
  proveedorNube: 'google' | 'aws' | 'azure' | 'local';
  
  // Retención
  diasRetencionBackup: number;
  backupsMaximosAlmacenar: number;
  
  // Compresión
  comprimirBackups: boolean;
  encriptarBackups: boolean;
  
  // Notificaciones
  notificarBackupExitoso: boolean;
  notificarBackupFallido: boolean;
  emailsNotificacion: string[];
  
  // Restauración
  permitirRestauracion: boolean;
  crearPuntoRestauracionAntes: boolean;
}

// ==================== SISTEMA ====================
export interface ConfiguracionSistema {
  // Versión
  versionSistema: string;
  fechaActualizacion: Date;
  
  // Mantenimiento
  modoMantenimiento: boolean;
  mensajeMantenimiento: string;
  
  // Performance
  cacheDatos: boolean;
  tiempoCache: number;
  optimizarConsultas: boolean;
  
  // Logs
  nivelLogs: 'error' | 'warning' | 'info' | 'debug';
  guardarLogsEnArchivo: boolean;
  rutaLogs: string;
  
  // Límites
  registrosPorPagina: number;
  tamanioMaximoArchivo: number;
  trabajadoresMaximos: number;
  
  // Actualizaciones
  verificarActualizacionesAuto: boolean;
  notificarActualizaciones: boolean;
  
  // Base de datos
  tiempoLimpiezaAutomatica: number;
  optimizarDBAutomatico: boolean;
  
  // API
  apiHabilitada: boolean;
  apiKey: string;
  rateLimitAPI: number;
}

// ==================== INTEGRACIONES ====================
export interface ConfiguracionIntegraciones {
  // Bancos
  integrarBancoNacion: boolean;
  integrarBCP: boolean;
  integrarInterbank: boolean;
  
  // Gobierno
  integrarSUNAT: boolean;
  integrarEsSalud: boolean;
  integrarRENIEC: boolean;
  
  // AFP
  integrarAFP: boolean;
  afpsIntegradas: string[];
  
  // Biométrico
  integrarBiometrico: boolean;
  modeloBiometrico: string;
  ipBiometrico: string;
  
  // ERP/Contabilidad
  integrarERP: boolean;
  tipoERP: string;
  
  // Otros
  webhooks: Webhook[];
  apis: APIExterna[];
}

export interface Webhook {
  id: string;
  nombre: string;
  url: string;
  evento: string;
  activo: boolean;
}

export interface APIExterna {
  id: string;
  nombre: string;
  url: string;
  apiKey: string;
  activa: boolean;
}

// ==================== CONSTANTES ====================
export const CONFIGURACION_DEFAULT: Partial<ConfiguracionGeneral> = {
  planillas: {
    monedaPorDefecto: 'PEN',
    simboloMoneda: 'S/.',
    tipoCambio: 3.75,
    actualizarTipoCambioAuto: true,
    diasDelMes: 30,
    horasPorDia: 8,
    redondeoDecimales: 2,
    redondeoTipo: 'normal',
    conceptosFijos: [],
    formulas: [],
    calcularHorasExtrasAuto: true,
    aplicarRetencionAutomatica: true,
    generarBoletasAuto: true,
    diaCierrePlanilla: 25,
    diaPagoPlanilla: 30,
    afpPorDefecto: 'PRIMA',
    comisionAFP: {},
    porcentajeONP: 13,
    montoAsignacionFamiliar: 102.50,
    permitirPlanillasCerradas: false,
    historicoMesesMaximo: 12
  }
};

export const AFPS_DISPONIBLES = [
  'PRIMA',
  'INTEGRA',
  'PROFUTURO',
  'HABITAT'
];

export const BANCOS_DISPONIBLES = [
  'Banco de la Nación',
  'BCP',
  'Interbank',
  'BBVA',
  'Scotiabank',
  'Banco Pichincha'
];

export const MONEDAS = [
  { codigo: 'PEN', nombre: 'Soles', simbolo: 'S/.' },
  { codigo: 'USD', nombre: 'Dólares', simbolo: '$' }
];