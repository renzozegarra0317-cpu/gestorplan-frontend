// src/app/trabajadores/nuevo/nuevo-trabajador.interface.ts

export interface NuevoTrabajador {
  // Datos Personales
  dni: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  fechaNacimiento: string;
  sexo: 'M' | 'F';
  estadoCivil: 'Soltero(a)' | 'Casado(a)' | 'Divorciado(a)' | 'Viudo(a)';
  
  // Contacto
  telefono: string;
  celular: string;
  email: string;
  direccion: string;
  distrito: string;
  departamento: string;
  provincia: string;
  
  // Datos Laborales
  cargoId: number;        // ⬅️ CAMBIAR A ID (número)
  areaId: number;         // ⬅️ CAMBIAR A ID (número)
  gerencia: string;
  tipoContrato: 'CAS' | 'CAP' | '276' | '728' | 'Locación' | 'Practicante';
  regimenLaboral: 'DL 276' | 'DL 728' | 'DL 1057 (CAS)' | 'Locación de Servicios';
  fechaIngreso: string;
  fechaInicioContrato: string;
  fechaFinContrato: string;
  
  // Remuneración
  salarioBase: number;    // ⬅️ CAMBIAR nombre (backend usa salarioBase)
  asignacionFamiliar?: number;
  movilidad?: number;
  bonoProductividad?: number;
  otrosIngresos?: number;
  
  // Sistema de Pensiones
  sistemaPension: 'ONP' | 'AFP';  // ⬅️ SIMPLIFICADO
  afp?: 'Integra' | 'Prima' | 'Profuturo' | 'Habitat';
  cuspp?: string;
  tipoComisionAFP?: 'Flujo' | 'Mixta';
  
  // Beneficios
  tieneAsignacionFamiliar?: boolean;
  numeroHijos?: number;
  esSindicalizado?: boolean;
  
  // Datos Bancarios
  banco?: string;
  tipoCuenta?: 'Ahorros' | 'Corriente';
  numeroCuenta?: string;
  cci?: string;
}

export interface Departamento {
  codigo: string;
  nombre: string;
  provincias: Provincia[];
}

export interface Provincia {
  codigo: string;
  nombre: string;
  distritos: string[];
}