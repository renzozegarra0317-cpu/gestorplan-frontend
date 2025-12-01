// src/app/trabajadores/importar/importar.interface.ts

export interface ArchivoImportacion {
  nombre: string;
  tamano: number;
  tipo: string;
  ultimaModificacion: Date;
  archivo: File;
}

export interface ResultadoValidacion {
  fila: number;
  dni: string;
  nombreCompleto: string;
  estado: 'Valido' | 'Error' | 'Advertencia';
  errores: string[];
  advertencias: string[];
  datos?: any;
}

export interface ResumenImportacion {
  totalRegistros: number;
  registrosValidos: number;
  registrosConError: number;
  registrosConAdvertencia: number;
  fechaImportacion: Date;
  archivoNombre: string;
}

export interface ConfiguracionImportacion {
  omitirDuplicados: boolean;
  actualizarExistentes: boolean;
  validarReniec: boolean;
  enviarNotificaciones: boolean;
  crearUsuarios: boolean;
}

export const COLUMNAS_REQUERIDAS = [
  'DNI',
  'Apellido Paterno',
  'Apellido Materno',
  'Nombres',
  'Fecha Nacimiento',
  'Sexo',
  'Celular',
  'Email',
  'Cargo',
  'Area',
  'Tipo Contrato',
  'Fecha Ingreso',
  'Remuneracion Basica',
  'Sistema Pensiones',
  'Banco',
  'Numero Cuenta'
];

export const COLUMNAS_OPCIONALES = [
  'Estado Civil',
  'Telefono',
  'Direccion',
  'Distrito',
  'Gerencia',
  'Regimen Laboral',
  'Fecha Inicio Contrato',
  'Fecha Fin Contrato',
  'Asignacion Familiar',
  'Numero Hijos',
  'CUSPP',
  'Sindicalizado',
  'CCI'
];