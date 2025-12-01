// src/app/trabajadores/trabajador.interface.ts

export interface Trabajador {
  id: number;
  dni: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  nombreCompleto?: string;
  fechaNacimiento: string;
  edad?: number;
  sexo: 'M' | 'F';
  estadoCivil: 'Soltero(a)' | 'Casado(a)' | 'Divorciado(a)' | 'Viudo(a)';
  telefono: string;
  celular: string;
  email: string;
  direccion: string;
  distrito: string;
  provincia?: string;                    // ⬅️ AGREGADA
  departamento?: string;                 // ⬅️ AGREGADA
  codigoTrabajador: string;
  cargo: string;
  area: string;
  gerencia: string;
  tipoContrato: 'CAS' | 'CAP' | '276' | '728' | 'Locación' | 'Practicante';
  regimenLaboral: 'DL 276' | 'DL 728' | 'DL 1057 (CAS)' | 'Locación de Servicios';
  fechaIngreso: string;
  antiguedad?: string;
  fechaInicioContrato: string;
  fechaFinContrato: string;
  diasRestantes?: number;
  estado: 'Activo' | 'Inactivo' | 'Suspendido' | 'Vacaciones' | 'Licencia';
  condicion?: string;                    // ⬅️ NUEVO (Empleado de Confianza, Nombrado, etc.)
  Condicion?: string;                    // ⬅️ NUEVO (formato backend)
  nivel?: string;                        // ⬅️ NUEVO (F-8, F-7, etc.)
  Nivel?: string;                        // ⬅️ NUEVO (formato backend)
  tipoPlaza?: string;                    // ⬅️ NUEVO (Plaza de Confianza, etc.)
  TipoPlaza?: string;                    // ⬅️ NUEVO (formato backend)
  grupoOcupacional?: string;             // ⬅️ NUEVO (Funcionario, etc.)
  GrupoOcupacional?: string;             // ⬅️ NUEVO (formato backend)
  nacionalidad?: string;                 // ⬅️ NUEVO
  Nacionalidad?: string;                 // ⬅️ NUEVO (formato backend)
  remuneracionBasica: number;
  salarioBase?: number;
  asignacionFamiliar: number;
  costoVida?: number;                      // ⬅️ NUEVO
  movilidad?: number;                      // ⬅️ NUEVO
  horasExtras?: number;                    // ⬅️ NUEVO
  bonoProductividad?: number;            // ⬅️ AGREGADA (para el cálculo de ingresos)
  pc_2015_2016?: number;                  // ⬅️ NUEVO
  ra_829_2011_mdh?: number;               // ⬅️ NUEVO
  otrasReintegros?: number;               // ⬅️ NUEVO
  convenio_2022_2023?: number;            // ⬅️ NUEVO
  convenio_2023_2024?: number;            // ⬅️ NUEVO
  convenio_2024_2025?: number;            // ⬅️ NUEVO
  homologacion?: number;                   // ⬅️ NUEVO
  otrosIngresos?: number;                // ⬅️ AGREGADA (para el cálculo de ingresos)
  // Propiedades del backend (con mayúsculas)
  CostoVida?: number;                      // ⬅️ NUEVO (formato backend)
  MovilidadLocal?: number;                 // ⬅️ NUEVO (formato backend)
  HorasExtras?: number;                   // ⬅️ NUEVO (formato backend)
  PC_2015_2016?: number;                  // ⬅️ NUEVO (formato backend)
  RA_829_2011_MDH?: number;               // ⬅️ NUEVO (formato backend)
  OtrasReintegros?: number;               // ⬅️ NUEVO (formato backend)
  Convenio_2022_2023?: number;            // ⬅️ NUEVO (formato backend)
  Convenio_2023_2024?: number;            // ⬅️ NUEVO (formato backend)
  Convenio_2024_2025?: number;            // ⬅️ NUEVO (formato backend)
  Homologacion?: number;                   // ⬅️ NUEVO (formato backend)
  totalIngresos: number;
  sistemasPensiones: 'ONP' | 'AFP Integra' | 'AFP Prima' | 'AFP Profuturo' | 'AFP Habitat';
  cuspp?: string;
  CUSPP?: string;                        // ⬅️ NUEVO (formato backend)
  tieneAsignacionFamiliar: boolean;
  numeroHijos?: number;                  // ⬅️ NUEVO
  NumeroHijos?: number;                  // ⬅️ NUEVO (formato backend)
  tipoComisionAFP?: string;              // ⬅️ NUEVO
  TipoComisionAFP?: string;              // ⬅️ NUEVO (formato backend)
  codigoEssalud?: string;                // ⬅️ NUEVO
  CodigoEssalud?: string;                // ⬅️ NUEVO (formato backend)
  esSindicalizado: boolean;
  tieneRimacSeguros?: boolean;
  aporteRimacSeguros?: number;
  TieneRimacSeguros?: boolean;
  AporteRimacSeguros?: number;
  tieneDescuentoJudicial?: boolean;
  montoDescuentoJudicial?: number;
  numeroCuentaDescuento?: string;
  TieneDescuentoJudicial?: boolean;
  MontoDescuentoJudicial?: number;
  NumeroCuentaDescuento?: string;
  banco: string;
  numeroCuenta: string;
  cci: string;
  tieneContratoFirmado: boolean;
  tieneFichaRUC: boolean;
  tieneDeclaracionJurada: boolean;
  documentos?: Documento[];              // ⬅️ AGREGADA (para archivos adjuntos)
  jefeInmediato?: string;                // ⬅️ AGREGADA (para organigrama)
  creadoPor: string;
  fechaCreacion: string;
  modificadoPor?: string;
  fechaModificacion?: string;
}

// ==========================================
// DOCUMENTO ADJUNTO
// ==========================================
export interface Documento {
  id?: number;
  nombre: string;
  tipo: string;
  url?: string;
  fecha?: string;
  tamanio?: number;
}

// ==========================================
// ÁREAS
// ==========================================
export interface Area {
  areaID: number;
  codigo?: string;
  nombre: string;
  icono?: string;
  color?: string;
  gerenciaID?: number;                   // ⬅️ AGREGADA (relación con gerencia)
  descripcion?: string;                  // ⬅️ AGREGADA
  activo?: boolean;                      // ⬅️ AGREGADA
}

// ==========================================
// CARGOS
// ==========================================
export interface Cargo {
  cargoID: number;
  codigo?: string;
  nombre: string;
  salarioMinimo?: number;
  salarioMaximo?: number;
  nivelJerarquico?: number;              // ⬅️ AGREGADA (para organigrama)
  descripcion?: string;                  // ⬅️ AGREGADA
  requisitos?: string;                   // ⬅️ AGREGADA
  activo?: boolean;                      // ⬅️ AGREGADA
}

// ==========================================
// GERENCIAS
// ==========================================
export interface Gerencia {
  gerenciaID: number;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  gerenteID?: number;
  activo?: boolean;
}

// ==========================================
// FILTROS DE BÚSQUEDA
// ==========================================
export interface FiltrosTrabajador {
  busqueda?: string;
  area?: string;
  cargo?: string;
  tipoContrato?: string;
  estado?: string;
  gerencia?: string;
  fechaIngresoDesde?: string;            // ⬅️ AGREGADA (para rango de fechas)
  fechaIngresoHasta?: string;            // ⬅️ AGREGADA (para rango de fechas)
  remuneracionMin?: number;              // ⬅️ AGREGADA (para rango de salarios)
  remuneracionMax?: number;              // ⬅️ AGREGADA (para rango de salarios)
}

// ==========================================
// TIPOS DE ORDENAMIENTO
// ==========================================
export type OrdenTrabajador = 
  | 'nombreCompleto' 
  | 'dni' 
  | 'cargo' 
  | 'area' 
  | 'fechaIngreso' 
  | 'remuneracionBasica'
  | 'estado'
  | 'diasRestantes';                     // ⬅️ AGREGADA

// ==========================================
// DTO PARA CREAR/ACTUALIZAR TRABAJADOR
// ==========================================
export interface CrearTrabajadorDTO {
  // Datos personales
  NumeroDocumento: string;
  ApellidoPaterno: string;
  ApellidoMaterno: string;
  Nombres: string;
  FechaNacimiento: string;
  Sexo: 'M' | 'F';
  EstadoCivil: string;
  
  // Contacto
  Celular: string;
  Telefono: string;
  Email: string;
  Direccion: string;
  Distrito: string;
  Provincia?: string;
  Departamento?: string;
  
  // Datos laborales
  Codigo: string;
  CargoID: number;
  AreaID: number;
  Gerencia: string;
  TipoContrato: string;
  RegimenLaboral: string;
  FechaIngreso: string;
  Estado: string;
  JefeInmediatoID?: number;
  
  // Contrato
  FechaInicioContrato: string;
  FechaFinContrato: string;
  
  // Remuneración
  SalarioBase: number;
  AsignacionFamiliar?: number;
  CostoVida?: number;                      // ⬅️ NUEVO
  MovilidadLocal?: number;                 // ⬅️ NUEVO
  HorasExtras?: number;                    // ⬅️ NUEVO
  BonoProductividad?: number;
  PC_2015_2016?: number;                  // ⬅️ NUEVO
  RA_829_2011_MDH?: number;               // ⬅️ NUEVO
  OtrasReintegros?: number;               // ⬅️ NUEVO
  Convenio_2022_2023?: number;            // ⬅️ NUEVO
  Convenio_2023_2024?: number;            // ⬅️ NUEVO
  Convenio_2024_2025?: number;            // ⬅️ NUEVO
  Homologacion?: number;                   // ⬅️ NUEVO
  OtrosIngresos?: number;
  
  // Pensiones
  SistemaPension: string;
  CUSPP?: string;
  EsSindicalizado: boolean;
  
  // Datos bancarios
  Banco: string;
  NumeroCuenta: string;
  CCI: string;
  
  // Documentos
  TieneContratoFirmado: boolean;
  TieneFichaRUC: boolean;
  TieneDeclaracionJurada: boolean;
}

// ==========================================
// RESPUESTA DEL API
// ==========================================
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: any[];                        // ⬅️ AGREGADA (para validaciones)
}

// ==========================================
// ESTADÍSTICAS DE TRABAJADORES
// ==========================================
export interface EstadisticasTrabajadores {
  total: number;
  activos: number;
  inactivos: number;
  vacaciones: number;
  licencias: number;
  suspendidos: number;
  porTipoContrato: {
    CAS: number;
    Nombrado: number;
    Locador: number;
    Practicante: number;
  };
  porArea: { [key: string]: number };
  porGerencia: { [key: string]: number };
  promedioRemuneracion: number;
  remuneracionTotal: number;
  contratosPorVencer30: number;
  contratosPorVencer90: number;
  contratosVencidos: number;
}

// ==========================================
// HISTORIAL DE CAMBIOS
// ==========================================
export interface HistorialCambio {
  id: number;
  trabajadorID: number;
  accion: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';
  campo?: string;
  valorAnterior?: string;
  valorNuevo?: string;
  usuarioID: number;
  usuario: string;
  fecha: string;
  descripcion?: string;
}

// ==========================================
// CONTRATO
// ==========================================
export interface Contrato {
  contratoID: number;
  trabajadorID: number;
  numeroContrato: string;
  tipoContrato: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'Vigente' | 'Vencido' | 'Renovado' | 'Terminado';
  salario: number;
  observaciones?: string;
  documentoURL?: string;
}

// ==========================================
// VACACIONES
// ==========================================
export interface Vacacion {
  vacacionID: number;
  trabajadorID: number;
  periodo: string;
  diasCorresponden: number;
  diasTomados: number;
  diasPendientes: number;
  fechaInicio?: string;
  fechaFin?: string;
  estado: 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Completado';
}

// ==========================================
// ASISTENCIA (para referencia futura)
// ==========================================
export interface Asistencia {
  asistenciaID: number;
  trabajadorID: number;
  fecha: string;
  horaEntrada?: string;
  horaSalida?: string;
  estado: 'Presente' | 'Tarde' | 'Falta' | 'Licencia' | 'Vacaciones';
  minutosRetraso?: number;
  observaciones?: string;
}