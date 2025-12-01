import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  CategoriaReporte,
  ReporteItem,
  FiltrosReporte,
  ConfiguracionReporte,
  HistorialReporte,
  FormatoExportacion,
  CATEGORIAS_REPORTES,
  MESES_REPORTE
} from './reportes.interface';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit {
  // Datos
  categorias: CategoriaReporte[] = CATEGORIAS_REPORTES;
  categoriaSeleccionada: CategoriaReporte | null = null;
  reporteSeleccionado: ReporteItem | null = null;
  historialReportes: HistorialReporte[] = [];
  
  // Filtros
  filtros: FiltrosReporte = {
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear()
  };
  
  // Configuración
  configuracion: ConfiguracionReporte = {
    incluirGraficos: true,
    incluirResumen: true,
    incluirDetalle: true,
    orientacion: 'Portrait'
  };
  
  // Estado
  cargando: boolean = false;
  mostrarModalFiltros: boolean = false;
  mostrarModalHistorial: boolean = false;
  mostrarVistaPrevia: boolean = false;
  
  // Vista
  vistaActual: 'categorias' | 'lista' | 'favoritos' = 'categorias';
  busqueda: string = '';
  
  // Favoritos
  reportesFavoritos: string[] = ['planilla-mensual', 'reporte-cts', 'asistencia-mensual'];
  
  // Catalogos
  meses = MESES_REPORTE;
  anios: number[] = [];
  areas: string[] = [
    'Todas',
    'Gerencia Municipal',
    'Oficina de Recursos Humanos',
    'Oficina de Administracion',
    'Gerencia de Desarrollo Social',
    'Gerencia de Infraestructura',
    'Gerencia de Servicios Publicos',
    'Serenazgo',
    'Registro Civil',
    'Oficina de Planificacion',
    'Oficina de Presupuesto'
  ];
  tiposContrato: string[] = [
    'Todos',
    'Nombrado',
    'CAS',
    'Locador de Servicios',
    'Practicante',
    'Temporal'
  ];
  
  // Estadísticas
  estadisticas = {
    reportesGeneradosHoy: 12,
    reportesGeneradosMes: 145,
    reporteMasGenerado: 'Planilla Mensual',
    ultimaGeneracion: new Date()
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.inicializarAnios();
    this.cargarHistorial();
    this.cargarFavoritosDesdeStorage();
  }

  inicializarAnios(): void {
    const anioActual = new Date().getFullYear();
    for (let i = anioActual; i >= anioActual - 10; i--) {
      this.anios.push(i);
    }
  }

  cargarHistorial(): void {
    // Simulación de historial
    this.historialReportes = [
      {
        id: 1,
        reporteNombre: 'Planilla Mensual - Octubre 2025',
        fechaGeneracion: new Date('2025-10-15T10:30:00'),
        formato: 'Excel',
        generadoPor: 'Admin',
        tamanioArchivo: '2.5 MB',
        urlDescarga: '#'
      },
      {
        id: 2,
        reporteNombre: 'Reporte de CTS - Noviembre 2025',
        fechaGeneracion: new Date('2025-10-14T15:45:00'),
        formato: 'PDF',
        generadoPor: 'Admin',
        tamanioArchivo: '1.8 MB',
        urlDescarga: '#'
      },
      {
        id: 3,
        reporteNombre: 'Asistencia Mensual - Septiembre 2025',
        fechaGeneracion: new Date('2025-10-13T09:20:00'),
        formato: 'Excel',
        generadoPor: 'Admin',
        tamanioArchivo: '3.2 MB',
        urlDescarga: '#'
      },
      {
        id: 4,
        reporteNombre: 'Gratificaciones Julio 2025',
        fechaGeneracion: new Date('2025-10-12T14:15:00'),
        formato: 'PDF',
        generadoPor: 'Admin',
        tamanioArchivo: '1.5 MB',
        urlDescarga: '#'
      },
      {
        id: 5,
        reporteNombre: 'Listado de Trabajadores - Octubre 2025',
        fechaGeneracion: new Date('2025-10-11T11:20:00'),
        formato: 'Excel',
        generadoPor: 'Admin',
        tamanioArchivo: '890 KB',
        urlDescarga: '#'
      },
      {
        id: 6,
        reporteNombre: 'PLAME - Septiembre 2025',
        fechaGeneracion: new Date('2025-10-10T16:45:00'),
        formato: 'TXT',
        generadoPor: 'Admin',
        tamanioArchivo: '125 KB',
        urlDescarga: '#'
      },
      {
        id: 7,
        reporteNombre: 'Reporte de Vacaciones - Tercer Trimestre 2025',
        fechaGeneracion: new Date('2025-10-09T13:30:00'),
        formato: 'PDF',
        generadoPor: 'Admin',
        tamanioArchivo: '2.1 MB',
        urlDescarga: '#'
      },
      {
        id: 8,
        reporteNombre: 'Costo Laboral - Septiembre 2025',
        fechaGeneracion: new Date('2025-10-08T10:15:00'),
        formato: 'Excel',
        generadoPor: 'Admin',
        tamanioArchivo: '1.3 MB',
        urlDescarga: '#'
      }
    ];
  }

  // ==================== NAVEGACIÓN ====================
  seleccionarCategoria(categoria: CategoriaReporte): void {
    this.categoriaSeleccionada = categoria;
    this.vistaActual = 'lista';
    this.anunciarCambio(`Categoría seleccionada: ${categoria.nombre}`);
  }

  volverCategorias(): void {
    this.categoriaSeleccionada = null;
    this.vistaActual = 'categorias';
    this.anunciarCambio('Volviendo a categorías');
  }

  cambiarVista(vista: 'categorias' | 'lista' | 'favoritos'): void {
    this.vistaActual = vista;
    if (vista === 'categorias') {
      this.categoriaSeleccionada = null;
    }
    this.anunciarCambio(`Vista cambiada a: ${vista}`);
  }

  // ==================== REPORTES ====================
  abrirReporte(reporte: ReporteItem): void {
    this.reporteSeleccionado = reporte;
    
    if (reporte.requiereFiltros) {
      this.mostrarModalFiltros = true;
    } else {
      this.generarReporte('Excel');
    }
  }

  generarReporte(formato: FormatoExportacion): void {
    if (!this.validarFiltros()) {
      return;
    }

    this.cargando = true;
    
    console.log('Generando reporte:', {
      reporte: this.reporteSeleccionado?.nombre,
      formato,
      filtros: this.filtros,
      configuracion: this.configuracion
    });
    
    // Simulación de generación
    setTimeout(() => {
      this.cargando = false;
      this.mostrarModalFiltros = false;
      
      // Agregar al historial
      const nuevoReporte: HistorialReporte = {
        id: this.historialReportes.length + 1,
        reporteNombre: `${this.reporteSeleccionado?.nombre} - ${this.obtenerNombreMes(this.filtros.mes || 0)} ${this.filtros.anio}`,
        fechaGeneracion: new Date(),
        formato,
        generadoPor: 'renzozegarra0317-cpu',
        tamanioArchivo: this.generarTamanioAleatorio(),
        urlDescarga: '#'
      };
      
      this.historialReportes.unshift(nuevoReporte);
      
      // Actualizar estadísticas
      this.estadisticas.reportesGeneradosHoy++;
      this.estadisticas.reportesGeneradosMes++;
      this.estadisticas.ultimaGeneracion = new Date();
      
      alert(`✅ Reporte "${this.reporteSeleccionado?.nombre}" generado exitosamente en formato ${formato}`);
    }, 2000);
  }

  validarFiltros(): boolean {
    if (this.filtros.mes && (this.filtros.mes < 1 || this.filtros.mes > 12)) {
      alert('⚠️ Mes inválido. Debe estar entre 1 y 12');
      return false;
    }

    if (this.filtros.anio && this.filtros.anio < 2000) {
      alert('⚠️ Año inválido. Debe ser mayor o igual a 2000');
      return false;
    }

    if (this.filtros.fechaInicio && this.filtros.fechaFin) {
      if (this.filtros.fechaInicio > this.filtros.fechaFin) {
        alert('⚠️ La fecha de inicio no puede ser mayor a la fecha de fin');
        return false;
      }
    }

    return true;
  }

  generarTamanioAleatorio(): string {
    const tamanio = Math.random() * 5 + 0.5; // Entre 0.5 y 5.5 MB
    if (tamanio < 1) {
      return `${(tamanio * 1024).toFixed(0)} KB`;
    }
    return `${tamanio.toFixed(1)} MB`;
  }

  descargarReporte(historial: HistorialReporte): void {
    console.log('Descargando reporte:', historial.reporteNombre);
    alert(`📥 Descargando: ${historial.reporteNombre}\nFormato: ${historial.formato}\nTamaño: ${historial.tamanioArchivo}`);
  }

  eliminarDelHistorial(historial: HistorialReporte): void {
    if (confirm(`¿Está seguro de eliminar "${historial.reporteNombre}" del historial?`)) {
      const index = this.historialReportes.findIndex(h => h.id === historial.id);
      if (index > -1) {
        this.historialReportes.splice(index, 1);
        alert('✅ Reporte eliminado del historial');
      }
    }
  }

  regenerarReporte(historial: HistorialReporte): void {
    if (confirm(`¿Desea regenerar "${historial.reporteNombre}"?`)) {
      this.cargando = true;
      
      setTimeout(() => {
        this.cargando = false;
        alert('✅ Reporte regenerado exitosamente');
      }, 2000);
    }
  }

  // ==================== FAVORITOS ====================
  toggleFavorito(reporteId: string): void {
    const index = this.reportesFavoritos.indexOf(reporteId);
    if (index > -1) {
      this.reportesFavoritos.splice(index, 1);
    } else {
      this.reportesFavoritos.push(reporteId);
    }
    
    // Guardar en localStorage
    localStorage.setItem('reportesFavoritos', JSON.stringify(this.reportesFavoritos));
  }

  esFavorito(reporteId: string): boolean {
    return this.reportesFavoritos.includes(reporteId);
  }

  get reportesFavoritosLista(): ReporteItem[] {
    const favoritos: ReporteItem[] = [];
    this.categorias.forEach(cat => {
      cat.reportes.forEach(rep => {
        if (this.esFavorito(rep.id)) {
          favoritos.push(rep);
        }
      });
    });
    return favoritos;
  }

  cargarFavoritosDesdeStorage(): void {
    const favoritosGuardados = localStorage.getItem('reportesFavoritos');
    if (favoritosGuardados) {
      try {
        this.reportesFavoritos = JSON.parse(favoritosGuardados);
      } catch (error) {
        console.error('Error al cargar favoritos:', error);
        this.reportesFavoritos = ['planilla-mensual', 'reporte-cts', 'asistencia-mensual'];
      }
    }
  }

  limpiarFavoritos(): void {
    if (confirm('¿Está seguro de eliminar todos los favoritos?')) {
      this.reportesFavoritos = [];
      localStorage.removeItem('reportesFavoritos');
      alert('✅ Favoritos eliminados');
    }
  }

  // ==================== BÚSQUEDA ====================
  get reportesFiltrados(): ReporteItem[] {
    if (!this.busqueda) return [];
    
    const busqueda = this.busqueda.toLowerCase();
    const reportes: ReporteItem[] = [];
    
    this.categorias.forEach(cat => {
      cat.reportes.forEach(rep => {
        if (
          rep.nombre.toLowerCase().includes(busqueda) ||
          rep.descripcion.toLowerCase().includes(busqueda) ||
          rep.codigo.toLowerCase().includes(busqueda) ||
          rep.tipo.toLowerCase().includes(busqueda)
        ) {
          reportes.push(rep);
        }
      });
    });
    
    return reportes;
  }

  limpiarBusqueda(): void {
    this.busqueda = '';
  }

  buscarPorCodigo(codigo: string): ReporteItem | undefined {
    let reporteEncontrado: ReporteItem | undefined;
    
    this.categorias.forEach(cat => {
      const reporte = cat.reportes.find(r => r.codigo === codigo);
      if (reporte) {
        reporteEncontrado = reporte;
      }
    });
    
    return reporteEncontrado;
  }

  // ==================== FILTROS AVANZADOS ====================
  aplicarFiltrosAvanzados(): void {
    console.log('Filtros aplicados:', this.filtros);
    this.anunciarCambio('Filtros aplicados');
  }

  resetearFiltrosAvanzados(): void {
    this.filtros = {
      mes: new Date().getMonth() + 1,
      anio: new Date().getFullYear()
    };
    this.anunciarCambio('Filtros reseteados');
  }

  // ==================== CONFIGURACIÓN ====================
  toggleConfiguracion(campo: keyof ConfiguracionReporte): void {
    if (typeof this.configuracion[campo] === 'boolean') {
      (this.configuracion as any)[campo] = !(this.configuracion as any)[campo];
    }
  }

  cambiarOrientacion(orientacion: 'Portrait' | 'Landscape'): void {
    this.configuracion.orientacion = orientacion;
  }

  guardarConfiguracion(): void {
    localStorage.setItem('configuracionReportes', JSON.stringify(this.configuracion));
    alert('✅ Configuración guardada');
  }

  cargarConfiguracion(): void {
    const configGuardada = localStorage.getItem('configuracionReportes');
    if (configGuardada) {
      try {
        this.configuracion = JSON.parse(configGuardada);
      } catch (error) {
        console.error('Error al cargar configuración:', error);
      }
    }
  }

  // ==================== PROGRAMACIÓN ====================
  programarReporte(): void {
    if (!this.reporteSeleccionado) {
      alert('⚠️ Seleccione un reporte primero');
      return;
    }

    const opciones = ['Diario', 'Semanal', 'Quincenal', 'Mensual'];
    const seleccion = prompt(`Seleccione la frecuencia:\n${opciones.map((o, i) => `${i + 1}. ${o}`).join('\n')}`);
    
    if (seleccion && parseInt(seleccion) > 0 && parseInt(seleccion) <= opciones.length) {
      const frecuencia = opciones[parseInt(seleccion) - 1];
      alert(`✅ Reporte "${this.reporteSeleccionado.nombre}" programado para generarse ${frecuencia.toLowerCase()}`);
    }
  }

  verReportesProgramados(): void {
    alert('📅 Funcionalidad de reportes programados próximamente\n\nAquí podrá ver y administrar todos sus reportes programados.');
  }

  // ==================== EXPORTACIÓN MASIVA ====================
  exportarTodosLosReportes(): void {
    if (!this.categoriaSeleccionada) {
      alert('⚠️ Seleccione una categoría primero');
      return;
    }

    if (confirm(`¿Desea exportar todos los reportes de "${this.categoriaSeleccionada.nombre}"?`)) {
      this.cargando = true;
      
      setTimeout(() => {
        this.cargando = false;
        alert(`✅ Exportación masiva completada\n${this.categoriaSeleccionada!.reportes.length} reportes exportados`);
      }, 3000);
    }
  }

  // ==================== COMPARACIÓN ====================
  compararReportes(): void {
    alert('🔄 Funcionalidad de comparación de reportes próximamente\n\nPodrá comparar reportes de diferentes periodos.');
  }

  // ==================== COMPARTIR ====================
  compartirReporte(reporte: ReporteItem): void {
    const url = `${window.location.origin}/reportes/${reporte.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: reporte.nombre,
        text: reporte.descripcion,
        url: url
      }).then(() => {
        console.log('Reporte compartido exitosamente');
      }).catch((error) => {
        console.error('Error al compartir:', error);
        this.copiarAlPortapapeles(url);
      });
    } else {
      this.copiarAlPortapapeles(url);
    }
  }

  copiarAlPortapapeles(texto: string): void {
    navigator.clipboard.writeText(texto).then(() => {
      alert('✅ Enlace copiado al portapapeles');
    }).catch(() => {
      alert('⚠️ No se pudo copiar el enlace');
    });
  }

  // ==================== VISTA PREVIA ====================
  verVistaPrevia(): void {
    if (!this.reporteSeleccionado) {
      alert('⚠️ Seleccione un reporte primero');
      return;
    }
    
    this.mostrarVistaPrevia = true;
    console.log('Mostrando vista previa de:', this.reporteSeleccionado.nombre);
  }

  cerrarVistaPrevia(): void {
    this.mostrarVistaPrevia = false;
  }

  // ==================== HISTORIAL ====================
  abrirHistorial(): void {
    this.mostrarModalHistorial = true;
  }

  cerrarHistorial(): void {
    this.mostrarModalHistorial = false;
  }

  limpiarHistorial(): void {
    if (confirm('¿Está seguro de eliminar todo el historial?')) {
      this.historialReportes = [];
      alert('✅ Historial eliminado');
    }
  }

  filtrarHistorialPorFormato(formato: FormatoExportacion): HistorialReporte[] {
    return this.historialReportes.filter(h => h.formato === formato);
  }

  filtrarHistorialPorFecha(dias: number): HistorialReporte[] {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - dias);
    
    return this.historialReportes.filter(h => 
      new Date(h.fechaGeneracion) >= fechaLimite
    );
  }

  // ==================== UTILIDADES ====================
  obtenerNombreMes(mes: number): string {
    const mesObj = this.meses.find(m => m.valor === mes);
    return mesObj ? mesObj.nombre : '';
  }

  formatearFecha(fecha: Date | string): string {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearFechaCorta(fecha: Date | string): string {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  }

  getFormatoIcon(formato: FormatoExportacion): string {
    const icons: { [key: string]: string } = {
      'Excel': '📊',
      'PDF': '📄',
      'CSV': '📋',
      'TXT': '📝'
    };
    return icons[formato] || '📄';
  }

  getFormatoColor(formato: FormatoExportacion): string {
    const colors: { [key: string]: string } = {
      'Excel': '#10b981',
      'PDF': '#ef4444',
      'CSV': '#3b82f6',
      'TXT': '#6b7280'
    };
    return colors[formato] || '#6b7280';
  }

  getFrecuenciaClass(frecuencia: string): string {
    const classes: { [key: string]: string } = {
      'Alta': 'frecuencia--alta',
      'Media': 'frecuencia--media',
      'Baja': 'frecuencia--baja'
    };
    return classes[frecuencia] || '';
  }

  getFrecuenciaIcon(frecuencia: string): string {
    const icons: { [key: string]: string } = {
      'Alta': '🔥',
      'Media': '⭐',
      'Baja': '📌'
    };
    return icons[frecuencia] || '📌';
  }

  getTipoReporteIcon(tipo: string): string {
    const icons: { [key: string]: string } = {
      'Planillas': '📊',
      'Beneficios': '🎁',
      'Trabajadores': '👥',
      'Asistencia': '📅',
      'Tributario': '🏛️',
      'Gerencial': '📈',
      'Bancario': '🏦',
      'Legal': '📄'
    };
    return icons[tipo] || '📄';
  }

  limpiarFiltros(): void {
    this.filtros = {
      mes: new Date().getMonth() + 1,
      anio: new Date().getFullYear()
    };
  }

  // ==================== ESTADÍSTICAS ====================
  get totalReportes(): number {
    return this.categorias.reduce((total, cat) => total + cat.reportes.length, 0);
  }

  get reportesPorTipo(): { tipo: string; cantidad: number }[] {
    const tipos = new Map<string, number>();
    
    this.categorias.forEach(cat => {
      cat.reportes.forEach(rep => {
        const count = tipos.get(rep.tipo) || 0;
        tipos.set(rep.tipo, count + 1);
      });
    });

    return Array.from(tipos.entries()).map(([tipo, cantidad]) => ({
      tipo,
      cantidad
    }));
  }

  get reportesMasUsados(): ReporteItem[] {
    const reportes: ReporteItem[] = [];
    
    this.categorias.forEach(cat => {
      cat.reportes.forEach(rep => {
        if (rep.frecuenciaUso === 'Alta') {
          reportes.push(rep);
        }
      });
    });

    return reportes.slice(0, 5);
  }

  calcularPorcentajeUso(reporte: ReporteItem): number {
    const totalGenerados = this.estadisticas.reportesGeneradosMes;
    const generadosEsteMes = Math.floor(Math.random() * totalGenerados);
    return (generadosEsteMes / totalGenerados) * 100;
  }

  // ==================== IMPRESIÓN ====================
  imprimirReporte(reporte: HistorialReporte): void {
  console.log('Imprimiendo reporte:', reporte.reporteNombre);
  alert(`🖨️ Preparando impresión: ${reporte.reporteNombre}`);
}

  // ==================== ENVÍO POR EMAIL ====================
  enviarPorEmail(reporte: HistorialReporte): void {
    const email = prompt('Ingrese el correo electrónico:');
    
    if (email) {
      if (this.validarEmail(email)) {
        console.log(`Enviando ${reporte.reporteNombre} a ${email}`);
        alert(`✅ Reporte enviado a ${email}`);
      } else {
        alert('⚠️ Correo electrónico inválido');
      }
    }
  }

  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // ==================== DUPLICAR REPORTE ====================
  duplicarReporte(reporte: ReporteItem): void {
    this.reporteSeleccionado = reporte;
    this.mostrarModalFiltros = true;
  }

  // ==================== AYUDA ====================
  mostrarAyuda(reporte: ReporteItem): void {
    const formatos = reporte.formatosDisponibles.join(', ');
    const mensaje = `
ℹ️ AYUDA: ${reporte.nombre}

📝 Descripción:
${reporte.descripcion}

🔢 Código: ${reporte.codigo}

📊 Tipo: ${reporte.tipo}

💾 Formatos disponibles: ${formatos}

${reporte.tieneGraficos ? '📈 Incluye gráficos' : ''}
${reporte.requiereFiltros ? '🔍 Requiere filtros' : ''}

⭐ Frecuencia de uso: ${reporte.frecuenciaUso}
    `.trim();
    
    alert(mensaje);
  }

  mostrarAyudaGeneral(): void {
    const mensaje = `
📊 CENTRO DE REPORTES - AYUDA

✅ Categorías de Reportes:
- Planillas: Reportes de remuneraciones
- Beneficios: CTS, Gratificaciones, Vacaciones
- Trabajadores: Gestión de personal
- Asistencia: Control de asistencia
- Tributario: PLAME, AFP, SUNAT
- Gerencial: Costos y presupuestos
- Bancario: Archivos bancarios
- Legal: Constancias y certificados

🔍 Búsqueda:
Puede buscar por nombre, código o descripción

⭐ Favoritos:
Marque reportes como favoritos para acceso rápido

📅 Historial:
Vea y descargue reportes generados anteriormente
    `.trim();
    
    alert(mensaje);
  }

  // ==================== NAVEGACIÓN RÁPIDA ====================
  irACategoria(categoriaId: string): void {
    const categoria = this.categorias.find(c => c.id === categoriaId);
    if (categoria) {
      this.seleccionarCategoria(categoria);
    }
  }

  irAReporte(reporteId: string): void {
    let reporteEncontrado: ReporteItem | null = null;
    
    this.categorias.forEach(cat => {
      const reporte = cat.reportes.find(r => r.id === reporteId);
      if (reporte) {
        reporteEncontrado = reporte;
      }
    });
    
    if (reporteEncontrado) {
      this.abrirReporte(reporteEncontrado);
    }
  }

  // ==================== ACCESIBILIDAD ====================
  anunciarCambio(mensaje: string): void {
    console.log('Anuncio de accesibilidad:', mensaje);
    // Aquí se podría integrar con un lector de pantalla
  }

  // ==================== PREFERENCIAS DE USUARIO ====================
  guardarPreferencias(): void {
    const preferencias = {
      vistaPreferida: this.vistaActual,
      configuracion: this.configuracion,
      favoritos: this.reportesFavoritos
    };
    
    localStorage.setItem('preferenciasReportes', JSON.stringify(preferencias));
  }

  cargarPreferencias(): void {
    const preferenciasGuardadas = localStorage.getItem('preferenciasReportes');
    if (preferenciasGuardadas) {
      try {
        const preferencias = JSON.parse(preferenciasGuardadas);
        this.vistaActual = preferencias.vistaPreferida || 'categorias';
        this.configuracion = preferencias.configuracion || this.configuracion;
      } catch (error) {
        console.error('Error al cargar preferencias:', error);
      }
    }
  }

  // ==================== EXPORTACIÓN PERSONALIZADA ====================
  abrirExportacionPersonalizada(): void {
    alert('⚙️ Configuración de exportación personalizada próximamente');
  }

  // ==================== NOTIFICACIONES ====================
  configurarNotificaciones(): void {
    alert('🔔 Configuración de notificaciones próximamente\n\nPodrá recibir alertas cuando se generen reportes programados.');
  }
}