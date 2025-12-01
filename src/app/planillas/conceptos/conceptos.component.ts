import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface Concepto {
  conceptoID: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  categoria: string;
  calculo: string;
  valor: number;
  formula: string;
  aplicaA: string;
  periodicidad: string;
  estado: string;
  orden: number;
  usuarioCreacion: string;
  fechaCreacion: Date;
  usuarioModificacion?: string;
  fechaModificacion?: Date;
}

interface FiltrosConceptos {
  tipo: string;
  tipoConcepto: string; // Para compatibilidad con template
  estado: string;
  busqueda: string;
}

interface EstadisticasConceptos {
  totalConceptos: number;
  totalIngresos: number;
  totalDescuentos: number;
  totalAportes: number;
  conceptosActivos: number;
  conceptosInactivos: number;
}

@Component({
  selector: 'app-conceptos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conceptos.component.html',
  styleUrls: ['./conceptos.component.scss']
})
export class ConceptosComponent implements OnInit {
  // APIs
  private apiConceptos = 'http://localhost:5000/api/conceptos';
  private apiCatalogoConceptos = 'http://localhost:5000/api/catalogo-conceptos';
  private apiTasas = 'http://localhost:5000/api/configuracion-tasas';
  
  // Datos
  conceptos: Concepto[] = [];
  conceptosFiltrados: Concepto[] = [];
  estadisticas: EstadisticasConceptos | null = null;
  conceptoSeleccionado: Concepto | null = null;
  
  // Filtros
  filtros: FiltrosConceptos = {
    tipo: 'Todos',
    tipoConcepto: 'Todos', // Para compatibilidad con template
    estado: 'Todos',
    busqueda: ''
  };
  
  // Estado
  cargando: boolean = false;
  mostrarModalCrear: boolean = false;
  mostrarModalEditar: boolean = false;
  mostrarModalEliminar: boolean = false;
  mostrarModalFormulario: boolean = false; // Para compatibilidad con template
  conceptoAEliminar: Concepto | null = null;
  mostrarVistaConfig: boolean = false;
  
  // Tasas Configurables
  tasas: any[] = [];
  tasasDisponibles: any[] = [];
  
  // Formulario
  formularioConcepto = {
    nombre: '',
    descripcion: '',
    tipo: 'Ingreso',
    categoria: '',
    orden: 0,
    estado: 'Activo'
  };
  
  // Constantes
  tiposConcepto = ['Todos', 'Ingreso', 'Descuento', 'Aporte'];
  estadosConcepto = ['Todos', 'Activo', 'Inactivo'];

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarConceptos();
    this.cargarTasas();
  }
  
  cargarTasas(): void {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.http.get<any[]>(this.apiTasas, { headers }).subscribe({
      next: (tasas) => {
        this.tasas = tasas.filter(t => t.Activo);
        this.tasasDisponibles = this.tasas;
        console.log('[cargarTasas] Tasas activas cargadas:', this.tasas.length);
      },
      error: (error) => {
        console.error('[cargarTasas] Error al cargar tasas:', error);
      }
    });
  }

  cargarConceptos(): void {
    this.cargando = true;
    
    // Construir parámetros de consulta
    let params = '';
    const queryParams = [];
    
    if (this.filtros.tipo && this.filtros.tipo !== 'Todos') {
      queryParams.push(`tipoConcepto=${this.filtros.tipo}`);
    }
    if (this.filtros.estado && this.filtros.estado !== 'Todos') {
      const activo = this.filtros.estado === 'Activo' ? 'true' : 'false';
      queryParams.push(`activo=${activo}`);
    }
    
    if (queryParams.length > 0) {
      params = '?' + queryParams.join('&');
    }
    
    console.log('🔍 Cargando conceptos desde catálogo:', `${this.apiCatalogoConceptos}${params}`);
    
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.http.get<any>(`${this.apiCatalogoConceptos}${params}`, { headers }).subscribe({
      next: (response) => {
        console.log('✅ Respuesta del catálogo de conceptos:', response);
        
        if (response.success && response.data) {
          this.conceptos = response.data.map((concepto: any) => ({
            conceptoID: concepto.ConceptoID,
            codigo: concepto.Codigo,
            nombre: concepto.Nombre,
            descripcion: concepto.Descripcion || '',
            tipo: concepto.TipoConcepto,
            categoria: concepto.Categoria || '',
            estado: concepto.Activo ? 'Activo' : 'Inactivo',
            orden: concepto.Orden || 0,
            usuarioCreacion: concepto.UsuarioCreacion,
            fechaCreacion: new Date(concepto.FechaCreacion),
            usuarioModificacion: concepto.UsuarioModificacion,
            fechaModificacion: concepto.FechaModificacion ? new Date(concepto.FechaModificacion) : undefined
          }));
          
          console.log('📊 Conceptos cargados:', this.conceptos.length);
        } else {
          console.warn('⚠️ No se recibieron datos del servidor');
          this.conceptos = [];
        }
      
      this.aplicarFiltros();
      this.cargarEstadisticas(); // Calcular estadísticas después de cargar
      this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar conceptos:', error);
        alert('Error al cargar los conceptos. Verifique la conexión con el servidor.');
        this.conceptos = [];
        this.cargando = false;
      }
    });
  }

  cargarEstadisticas(): void {
    // Calcular estadísticas desde los conceptos cargados
    if (this.conceptos.length > 0) {
      const totalIngresos = this.conceptos.filter(c => c.tipo === 'Ingreso').length;
      const totalDescuentos = this.conceptos.filter(c => c.tipo === 'Descuento').length;
      const totalAportes = this.conceptos.filter(c => c.tipo === 'Aporte').length;
      const conceptosActivos = this.conceptos.filter(c => c.estado === 'Activo').length;
      const conceptosInactivos = this.conceptos.filter(c => c.estado === 'Inactivo').length;
      
      this.estadisticas = {
        totalConceptos: this.conceptos.length,
        totalIngresos,
        totalDescuentos,
        totalAportes,
        conceptosActivos,
        conceptosInactivos
      };
      
      console.log('📊 Estadísticas calculadas:', this.estadisticas);
    }
  }

  aplicarFiltros(): void {
    let conceptosFiltrados = [...this.conceptos];
    
    // Filtro por tipo (usar tipoConcepto para compatibilidad)
    const tipoFiltro = this.filtros.tipoConcepto || this.filtros.tipo;
    if (tipoFiltro && tipoFiltro !== 'Todos') {
      conceptosFiltrados = conceptosFiltrados.filter(c => c.tipo === tipoFiltro);
    }
    
    // Filtro por estado
    if (this.filtros.estado && this.filtros.estado !== 'Todos') {
      conceptosFiltrados = conceptosFiltrados.filter(c => c.estado === this.filtros.estado);
    }
    
    // Filtro por búsqueda
    if (this.filtros.busqueda) {
      const busqueda = this.filtros.busqueda.toLowerCase();
      conceptosFiltrados = conceptosFiltrados.filter(c => 
        c.codigo.toLowerCase().includes(busqueda) ||
        c.nombre.toLowerCase().includes(busqueda) ||
        c.descripcion.toLowerCase().includes(busqueda)
      );
    }
    
    this.conceptosFiltrados = conceptosFiltrados;
      }
    
  // Métodos de filtrado
  filtrar(): void {
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.filtros = {
      tipo: 'Todos',
      tipoConcepto: 'Todos',
      estado: 'Todos',
      busqueda: ''
    };
    this.aplicarFiltros();
  }

  // Métodos de modal
  abrirModalCrear(): void {
    this.limpiarFormulario();
    this.mostrarModalCrear = true;
  }

  abrirModalEditar(concepto: Concepto): void {
    this.conceptoSeleccionado = concepto;
    this.formularioConcepto = {
      nombre: concepto.nombre,
      descripcion: concepto.descripcion,
      tipo: concepto.tipo,
      categoria: concepto.categoria,
      orden: concepto.orden,
      estado: concepto.estado
    };
    this.mostrarModalEditar = true;
  }

  abrirModalEliminar(concepto: Concepto): void {
    this.conceptoAEliminar = concepto;
    this.mostrarModalEliminar = true;
  }

  cerrarModales(): void {
    this.mostrarModalCrear = false;
    this.mostrarModalEditar = false;
      this.mostrarModalEliminar = false;
    this.mostrarModalFormulario = false; // Para compatibilidad con template
    this.conceptoSeleccionado = null;
      this.conceptoAEliminar = null;
    this.limpiarFormulario();
  }

  limpiarFormulario(): void {
    this.formularioConcepto = {
      nombre: '',
      descripcion: '',
      tipo: 'Ingreso',
      categoria: '',
      orden: 0,
      estado: 'Activo'
    };
  }

  // Métodos de CRUD
  crearConcepto(): void {
    if (!this.validarFormulario()) return;

    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.http.post(`${this.apiConceptos}`, this.formularioConcepto, { headers }).subscribe({
      next: (response) => {
        console.log('✅ Concepto creado:', response);
        alert('Concepto creado exitosamente');
        this.cerrarModales();
        this.cargarConceptos();
        this.cargarEstadisticas();
      },
      error: (error) => {
        console.error('❌ Error al crear concepto:', error);
        alert('Error al crear el concepto');
      }
    });
  }

  actualizarConcepto(): void {
    if (!this.validarFormulario() || !this.conceptoSeleccionado) return;

    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.http.put(`${this.apiConceptos}/${this.conceptoSeleccionado.conceptoID}`, this.formularioConcepto, { headers }).subscribe({
      next: (response) => {
        console.log('✅ Concepto actualizado:', response);
        alert('Concepto actualizado exitosamente');
        this.cerrarModales();
        this.cargarConceptos();
        this.cargarEstadisticas();
      },
      error: (error) => {
        console.error('❌ Error al actualizar concepto:', error);
        alert('Error al actualizar el concepto');
      }
    });
  }

  eliminarConcepto(): void {
    if (!this.conceptoAEliminar) return;

    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.http.delete(`${this.apiConceptos}/${this.conceptoAEliminar.conceptoID}`, { headers }).subscribe({
      next: (response) => {
        console.log('✅ Concepto eliminado:', response);
        alert('Concepto eliminado exitosamente');
        this.cerrarModales();
        this.cargarConceptos();
        this.cargarEstadisticas();
      },
      error: (error) => {
        console.error('❌ Error al eliminar concepto:', error);
        alert('Error al eliminar el concepto');
      }
    });
  }

  cambiarEstado(concepto: Concepto): void {
    const nuevoEstado = concepto.estado === 'Activo' ? 'Inactivo' : 'Activo';
    
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.http.put(`${this.apiConceptos}/${concepto.conceptoID}/estado`, { estado: nuevoEstado }, { headers }).subscribe({
      next: (response) => {
        console.log('✅ Estado cambiado:', response);
        alert(`Concepto ${nuevoEstado.toLowerCase()} exitosamente`);
        this.cargarConceptos();
        this.cargarEstadisticas();
      },
      error: (error) => {
        console.error('❌ Error al cambiar estado:', error);
        alert('Error al cambiar el estado del concepto');
      }
    });
  }

  editarConcepto(concepto: Concepto): void {
    this.conceptoSeleccionado = concepto;
    this.formularioConcepto = {
      nombre: concepto.nombre,
      descripcion: concepto.descripcion,
      tipo: concepto.tipo,
      categoria: concepto.categoria,
      orden: concepto.orden,
      estado: concepto.estado
    };
    this.mostrarModalFormulario = true;
  }

  duplicarConcepto(concepto: Concepto): void {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.http.post(`${this.apiConceptos}/${concepto.conceptoID}/duplicar`, {}, { headers }).subscribe({
      next: (response) => {
        console.log('✅ Concepto duplicado:', response);
        alert('Concepto duplicado exitosamente');
        this.cargarConceptos();
        this.cargarEstadisticas();
      },
      error: (error) => {
        console.error('❌ Error al duplicar concepto:', error);
        alert('Error al duplicar el concepto');
      }
    });
  }

  // Validaciones
  validarFormulario(): boolean {
    if (!this.formularioConcepto.nombre.trim()) {
      alert('El nombre es requerido');
      return false;
    }
    if (!this.formularioConcepto.categoria.trim()) {
      alert('La categoría es requerida');
      return false;
    }
    if (this.formularioConcepto.orden < 0) {
      alert('El orden debe ser mayor o igual a 0');
      return false;
    }
    return true;
  }

  // Métodos faltantes del template
  importarConceptos(): void {
    console.log('📥 Importando conceptos...');
    alert('Funcionalidad de importación en desarrollo');
  }

  exportarConceptos(): void {
    console.log('📤 Exportando conceptos...');
    alert('Funcionalidad de exportación en desarrollo');
  }

  nuevoFormulario(): void {
    this.abrirModalCrear();
  }

  // Getters para estadísticas
  get totalConceptosActivos(): number {
    return this.estadisticas?.conceptosActivos || 0;
  }

  get totalIngresos(): number {
    return this.estadisticas?.totalIngresos || 0;
  }

  get totalDescuentos(): number {
    return this.estadisticas?.totalDescuentos || 0;
  }

  get totalAportes(): number {
    return this.estadisticas?.totalAportes || 0;
  }

  // Métodos faltantes del template
  getTipoBadgeClass(tipo: string): string {
    return this.obtenerClaseTipo(tipo);
  }

  getEstadoBadgeClass(estado: string): string {
    return this.obtenerClaseEstado(estado);
  }

  // Método para formatear moneda
  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(valor);
  }

  // Métodos de utilidad
  obtenerClaseTipo(tipo: string): string {
    switch (tipo) {
      case 'Ingreso': return 'tipo-ingreso';
      case 'Descuento': return 'tipo-descuento';
      case 'Aporte': return 'tipo-aporte';
      default: return 'tipo-default';
    }
  }

  obtenerClaseEstado(estado: string): string {
    switch (estado) {
      case 'Activo': return 'estado-activo';
      case 'Inactivo': return 'estado-inactivo';
      default: return 'estado-default';
    }
  }

  formatearFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-PE');
  }
  
  // Métodos para gestionar vistas
  toggleVistaConfig(): void {
    this.mostrarVistaConfig = !this.mostrarVistaConfig;
  }
  
  irAConfiguracion(): void {
    this.router.navigate(['/configuracion'], { queryParams: { tab: 'tasas' } });
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
}