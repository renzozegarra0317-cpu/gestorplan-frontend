// src/app/trabajadores/importar/importar.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';

// ⬇️ IMPORTAR TODAS LAS INTERFACES Y CONSTANTES
import { 
  ArchivoImportacion, 
  ResultadoValidacion,
  ResumenImportacion,       // ⬅️ AGREGAR
  ConfiguracionImportacion, // ⬅️ AGREGAR
  COLUMNAS_REQUERIDAS,      // ⬅️ AGREGAR
  COLUMNAS_OPCIONALES       // ⬅️ AGREGAR
} from './importar.interface';
import { Trabajador } from '../trabajador.interface';

@Component({
  selector: 'app-importar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './importar.component.html',
  styleUrls: ['./importar.component.scss']
})
export class ImportarComponent implements OnInit {
  // Estado
  paso: number = 1;
  totalPasos: number = 4;
  procesando: boolean = false;
  importando: boolean = false;
  
  // Archivo
  archivoSeleccionado: ArchivoImportacion | null = null;
  arrastrando: boolean = false;
  
  // Datos
  datosImportados: any[] = [];
  resultadosValidacion: ResultadoValidacion[] = [];
  resumen: ResumenImportacion | null = null; // ✅ YA ESTÁ IMPORTADO
  
  // Configuracion
  configuracion: ConfiguracionImportacion = { // ✅ YA ESTÁ IMPORTADO
    omitirDuplicados: true,
    actualizarExistentes: false,
    validarReniec: false,
    enviarNotificaciones: true,
    crearUsuarios: false
  };
  
  // Columnas
  columnasRequeridas = COLUMNAS_REQUERIDAS;    // ✅ YA ESTÁ IMPORTADO
  columnasOpcionales = COLUMNAS_OPCIONALES;    // ✅ YA ESTÁ IMPORTADO
  columnasDetectadas: string[] = [];
  columnasFaltantes: string[] = [];
  
  // Filtros
  filtroEstado: 'Todos' | 'Valido' | 'Error' | 'Advertencia' = 'Todos';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Inicializacion
  }

  // ==================== MANEJO DE ARCHIVOS ====================
  
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.arrastrando = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.arrastrando = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.arrastrando = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.procesarArchivo(files[0]);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.procesarArchivo(file);
    }
  }

  procesarArchivo(file: File): void {
    const extensionesPermitidas = ['.xlsx', '.xls', '.csv'];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!extensionesPermitidas.includes(extension)) {
      alert('Formato de archivo no permitido. Use Excel (.xlsx, .xls) o CSV (.csv)');
      return;
    }
    
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. Maximo 10MB');
      return;
    }
    
    this.archivoSeleccionado = {
      nombre: file.name,
      tamano: file.size,
      tipo: extension,
      ultimaModificacion: new Date(file.lastModified),
      archivo: file
    };
    
    this.leerArchivo(file);
  }

  leerArchivo(file: File): void {
    this.procesando = true;
    
    const reader = new FileReader();
    
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        if (jsonData.length < 2) {
          alert('El archivo esta vacio o no tiene datos');
          this.procesando = false;
          return;
        }
        
        this.columnasDetectadas = jsonData[0] as string[];
        this.validarColumnas();
        
        const headers = jsonData[0] as string[];
        this.datosImportados = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row.length === 0 || !row[0]) continue;
          
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          obj._fila = i + 1;
          this.datosImportados.push(obj);
        }
        
        console.log('Datos importados:', this.datosImportados.length, 'registros');
        
        this.procesando = false;
        this.paso = 2;
        
      } catch (error) {
        console.error('Error al leer archivo:', error);
        alert('Error al procesar el archivo. Verifique que el formato sea correcto.');
        this.procesando = false;
      }
    };
    
    reader.readAsArrayBuffer(file);
  }

  validarColumnas(): void {
    this.columnasFaltantes = this.columnasRequeridas.filter(
      col => !this.columnasDetectadas.includes(col)
    );
  }

  eliminarArchivo(): void {
    this.archivoSeleccionado = null;
    this.datosImportados = [];
    this.columnasDetectadas = [];
    this.columnasFaltantes = [];
    this.paso = 1;
  }

  validarDatos(): void {
    this.procesando = true;
    this.resultadosValidacion = [];
    
    setTimeout(() => {
      this.datosImportados.forEach((registro) => {
        const resultado: ResultadoValidacion = {
          fila: registro._fila,
          dni: registro['DNI'] || '',
          nombreCompleto: `${registro['Apellido Paterno']} ${registro['Apellido Materno']}, ${registro['Nombres']}`,
          estado: 'Valido',
          errores: [],
          advertencias: [],
          datos: registro
        };
        
        if (!registro['DNI'] || !/^\d{8}$/.test(registro['DNI'])) {
          resultado.errores.push('DNI invalido (debe tener 8 digitos)');
        }
        
        if (!registro['Apellido Paterno'] || registro['Apellido Paterno'].trim() === '') {
          resultado.errores.push('Apellido Paterno es obligatorio');
        }
        
        if (!registro['Apellido Materno'] || registro['Apellido Materno'].trim() === '') {
          resultado.errores.push('Apellido Materno es obligatorio');
        }
        
        if (!registro['Nombres'] || registro['Nombres'].trim() === '') {
          resultado.errores.push('Nombres es obligatorio');
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!registro['Email'] || !emailRegex.test(registro['Email'])) {
          resultado.errores.push('Email invalido');
        }
        
        if (!registro['Celular'] || !/^9\d{8}$/.test(registro['Celular'])) {
          resultado.errores.push('Celular invalido (debe empezar con 9 y tener 9 digitos)');
        }
        
        const remuneracion = parseFloat(registro['Remuneracion Basica']);
        if (isNaN(remuneracion) || remuneracion < 1025) {
          resultado.errores.push('Remuneracion invalida (minimo S/. 1,025)');
        }
        
        if (!registro['Telefono'] || registro['Telefono'].trim() === '') {
          resultado.advertencias.push('Telefono fijo no proporcionado');
        }
        
        if (!registro['Direccion'] || registro['Direccion'].trim() === '') {
          resultado.advertencias.push('Direccion no proporcionada');
        }
        
        if (resultado.errores.length > 0) {
          resultado.estado = 'Error';
        } else if (resultado.advertencias.length > 0) {
          resultado.estado = 'Advertencia';
        }
        
        this.resultadosValidacion.push(resultado);
      });
      
      this.calcularResumen();
      this.procesando = false;
      this.paso = 3;
      
    }, 1000);
  }

  calcularResumen(): void {
    this.resumen = {
      totalRegistros: this.resultadosValidacion.length,
      registrosValidos: this.resultadosValidacion.filter(r => r.estado === 'Valido').length,
      registrosConError: this.resultadosValidacion.filter(r => r.estado === 'Error').length,
      registrosConAdvertencia: this.resultadosValidacion.filter(r => r.estado === 'Advertencia').length,
      fechaImportacion: new Date(),
      archivoNombre: this.archivoSeleccionado?.nombre || ''
    };
  }

  get resultadosFiltrados(): ResultadoValidacion[] {
    if (this.filtroEstado === 'Todos') {
      return this.resultadosValidacion;
    }
    return this.resultadosValidacion.filter(r => r.estado === this.filtroEstado);
  }

  importarDatos(): void {
    const registrosValidos = this.resultadosValidacion.filter(
      r => r.estado === 'Valido' || (r.estado === 'Advertencia' && this.configuracion.actualizarExistentes)
    );
    
    if (registrosValidos.length === 0) {
      alert('No hay registros validos para importar');
      return;
    }
    
    if (!confirm(`¿Esta seguro de importar ${registrosValidos.length} trabajadores?`)) {
      return;
    }
    
    this.importando = true;
    
    setTimeout(() => {
      console.log('Importando:', registrosValidos.length, 'registros');
      console.log('Configuracion:', this.configuracion);
      
      this.importando = false;
      this.paso = 4;
      
    }, 2000);
  }

  descargarPlantilla(): void {
    const plantilla = [
      this.columnasRequeridas,
      [
        '12345678',
        'GARCIA',
        'PEREZ',
        'JUAN CARLOS',
        '1985-03-15',
        'M',
        '987654321',
        'jgarcia@munilima.gob.pe',
        'Gerente Municipal',
        'Gerencia Municipal',
        'CAS',
        '2025-01-15',
        '8500',
        'AFP Integra',
        'Banco de la Nacion',
        '00123456789'
      ]
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(plantilla);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Trabajadores');
    
    const maxWidth = 20;
    ws['!cols'] = this.columnasRequeridas.map(() => ({ wch: maxWidth }));
    
    XLSX.writeFile(wb, 'Plantilla_Trabajadores_Municipalidad.xlsx');
  }

  descargarReporte(): void {
    const reporte: any[] = [
      ['REPORTE DE VALIDACION - IMPORTACION DE TRABAJADORES'],
      [],
      ['Archivo:', this.resumen?.archivoNombre || ''],
      ['Fecha:', new Date().toLocaleString()],
      [],
      ['RESUMEN'],
      ['Total Registros:', this.resumen?.totalRegistros || 0],
      ['Validos:', this.resumen?.registrosValidos || 0],
      ['Con Errores:', this.resumen?.registrosConError || 0],
      ['Con Advertencias:', this.resumen?.registrosConAdvertencia || 0],
      [],
      ['DETALLE DE VALIDACION'],
      ['Fila', 'DNI', 'Nombre Completo', 'Estado', 'Errores', 'Advertencias']
    ];
    
    this.resultadosValidacion.forEach(r => {
      reporte.push([
        r.fila.toString(),
        r.dni,
        r.nombreCompleto,
        r.estado,
        r.errores.join('; '),
        r.advertencias.join('; ')
      ]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(reporte);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte Validacion');
    
    XLSX.writeFile(wb, `Reporte_Validacion_${new Date().getTime()}.xlsx`);
  }

  siguientePaso(): void {
    if (this.paso === 2) {
      this.validarDatos();
    } else if (this.paso === 3) {
      this.importarDatos();
    } else {
      this.paso++;
    }
  }

  pasoAnterior(): void {
    this.paso--;
  }

  volverInicio(): void {
    this.paso = 1;
    this.eliminarArchivo();
  }

  volverLista(): void {
    this.router.navigate(['/trabajadores/lista']);
  }

  formatearTamano(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  getEstadoBadgeClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'Valido': 'badge--valido',
      'Error': 'badge--error',
      'Advertencia': 'badge--advertencia'
    };
    return clases[estado] || '';
  }
}