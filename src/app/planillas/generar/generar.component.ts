// src/app/planillas/generar/generar.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NotificacionesService } from '../../services/notificaciones.service';
import { environment } from '../../../environments/environment';

interface Trabajador {
  TrabajadorID: number;
  DNI: string;
  NombreCompleto: string;
  Cargo: string;
  Area: string;
  TipoContrato: string;
  RegimenLaboral: string;
  SalarioBase: number;
  SistemaPension: string;
  AFP?: string;
  AsignacionFamiliar: number;
  Banco: string;
  NumeroCuenta: string;
  seleccionado?: boolean;
}

@Component({
  selector: 'app-generar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generar.component.html',
  styleUrls: ['./generar.component.scss']
})
export class GenerarComponent implements OnInit {
  // ==================== WIZARD ====================
  pasoActual: number = 1;
  totalPasos: number = 4;
  
  // ==================== CONFIGURACIÓN ====================
  anios: number[] = [];
  
  configuracion = {
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear(), // Año actual por defecto
    tipoPlanilla: 'Mensual',
    diasTrabajados: 30
  };
  
  meses = [
    { valor: 1, nombre: 'Enero' },
    { valor: 2, nombre: 'Febrero' },
    { valor: 3, nombre: 'Marzo' },
    { valor: 4, nombre: 'Abril' },
    { valor: 5, nombre: 'Mayo' },
    { valor: 6, nombre: 'Junio' },
    { valor: 7, nombre: 'Julio' },
    { valor: 8, nombre: 'Agosto' },
    { valor: 9, nombre: 'Septiembre' },
    { valor: 10, nombre: 'Octubre' },
    { valor: 11, nombre: 'Noviembre' },
    { valor: 12, nombre: 'Diciembre' }
  ];
  
  tiposPlanilla = [
    { id: 'Mensual', nombre: 'Planilla Mensual', icono: '📅', descripcion: 'Planilla regular mensual' },
    { id: 'Quincenal', nombre: 'Planilla Quincenal', icono: '📆', descripcion: 'Planilla quincenal' },
    { id: 'Gratificacion', nombre: 'Gratificación', icono: '🎁', descripcion: 'Julio y Diciembre' },
    { id: 'CTS', nombre: 'CTS', icono: '💰', descripcion: 'Compensación por Tiempo de Servicios' },
    { id: 'Vacaciones', nombre: 'Vacaciones', icono: '🏖️', descripcion: 'Pago de vacaciones' },
    { id: 'Utilidades', nombre: 'Utilidades', icono: '💵', descripcion: 'Reparto de utilidades' }
  ];
  
  // ==================== TRABAJADORES ====================
  trabajadores: Trabajador[] = [];
  trabajadoresFiltrados: Trabajador[] = [];
  trabajadoresSeleccionados: number[] = [];
  todosSeleccionados: boolean = false;
  cargandoTrabajadores: boolean = false;
  
  // Filtros
  filtros = {
    busqueda: '',
    regimenLaboral: '',
    incluirTodos: true
  };
  
  // Estado de filtros opcionales
  filtrosExpandidos: boolean = false;
  
  regimenesLaborales: any[] = [];
  
  // ==================== PROCESAMIENTO ====================
  procesando: boolean = false;
  progresoActual: string = '';
  porcentajeProceso: number = 0;
  
  // ==================== RESULTADO ====================
  planillaGenerada: any = null;
  resumen: any = null;
  
  // ==================== APIs ====================
  private apiTrabajadores = `${environment.apiUrl}/trabajadores`;
  private apiPlanillas = `${environment.apiUrl}/planillas`;
  private apiRegimenes = `${environment.apiUrl}/regimenes-laborales`;
  
  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private notificacionesService: NotificacionesService
  ) {
    // Inicializar años antes de establecer el valor por defecto
    this.inicializarAños();
  }
  
  ngOnInit(): void {
    // Resetear scroll al inicio
    window.scrollTo(0, 0);
    setTimeout(() => {
      const mainContent = document.querySelector('.main-content') as HTMLElement;
      if (mainContent) {
        mainContent.scrollTop = 0;
      }
    }, 100);
    
    // Asegurar que el año esté en la lista y que el valor esté correcto
    const anioActual = new Date().getFullYear();
    if (!this.anios.includes(anioActual)) {
      this.anios.unshift(anioActual);
      this.anios.sort((a, b) => b - a);
    }
    // Forzar el valor del año (igual que el mes)
    this.configuracion.anio = anioActual;
    this.cdr.detectChanges();
    this.cargarTrabajadores();
  }
  
  inicializarAños(): void {
    const anioActual = new Date().getFullYear();
    this.anios = [];
    // Generar años: desde 2 años atrás hasta 1 año adelante
    for (let i = anioActual - 2; i <= anioActual + 1; i++) {
      this.anios.push(i);
    }
    // Asegurar que el año actual esté en la lista (antes de ordenar)
    if (!this.anios.includes(anioActual)) {
      this.anios.push(anioActual);
    }
    // Ordenar en orden descendente (año más reciente primero)
    this.anios.sort((a, b) => b - a);
  }
  
  // ==================== CARGA DE TRABAJADORES ====================
  cargarTrabajadores(): void {
    this.cargandoTrabajadores = true;
    
    // Verificar que hay token antes de hacer la petición
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ No hay token de autenticación');
      alert('No estás autenticado. Por favor, inicia sesión nuevamente.');
      this.router.navigate(['/login']);
      this.cargandoTrabajadores = false;
      return;
    }
    
    // El interceptor se encarga de agregar el token automáticamente
    this.http.get<any>(this.apiTrabajadores).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.trabajadores = response.data.map((t: any) => ({
            TrabajadorID: t.TrabajadorID,
            DNI: t.NumeroDocumento,
            NombreCompleto: t.NombreCompleto || this.construirNombreCompleto(t),
            Cargo: t.CargoNombre || t.Cargo || 'Sin cargo',
            Area: '', // Áreas ya no se usan
            TipoContrato: t.TipoContrato || 'No especificado',
            RegimenLaboral: t.RegimenLaboralNombre || t.RegimenLaboral || 'No especificado',
            SalarioBase: t.SalarioBase || 0,
            SistemaPension: t.SistemaPension || 'ONP',
            AFP: t.AFP || null,
            AsignacionFamiliar: t.AsignacionFamiliar || 0,
            Banco: t.Banco || 'Banco de la Nación',
            NumeroCuenta: t.NumeroCuenta || '',
            seleccionado: false
          }));
          
          console.log(`✅ ${this.trabajadores.length} trabajadores cargados`);
          this.cargarRegimenesLaborales();
          this.aplicarFiltros();
        } else {
          console.warn('⚠️ Respuesta sin datos:', response);
        }
        this.cargandoTrabajadores = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar trabajadores:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Error message:', error.error?.message || error.message);
        
        if (error.status === 401 || error.status === 403) {
          alert('Tu sesión ha expirado o no tienes permisos. Por favor, inicia sesión nuevamente.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          this.router.navigate(['/login']);
        } else {
          alert(`Error al cargar trabajadores: ${error.error?.message || error.message || 'Error desconocido'}`);
        }
        this.cargandoTrabajadores = false;
      }
    });
  }
  
  cargarRegimenesLaborales(): void {
    this.http.get<any>(this.apiRegimenes).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.regimenesLaborales = response.data;
          console.log(`✅ ${this.regimenesLaborales.length} regímenes laborales cargados`);
        } else {
          // Fallback: extraer regímenes únicos de los trabajadores
          this.regimenesLaborales = [...new Set(this.trabajadores.map(t => t.RegimenLaboral))]
            .filter(Boolean)
            .map(nombre => ({ Nombre: nombre }))
            .sort((a, b) => a.Nombre.localeCompare(b.Nombre));
          console.log(`⚠️ Regímenes extraídos de trabajadores: ${this.regimenesLaborales.length}`);
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar regímenes laborales:', error);
        // Fallback: extraer regímenes únicos de los trabajadores
        this.regimenesLaborales = [...new Set(this.trabajadores.map(t => t.RegimenLaboral))]
          .filter(Boolean)
          .map(nombre => ({ Nombre: nombre }))
          .sort((a, b) => a.Nombre.localeCompare(b.Nombre));
        console.log(`⚠️ Regímenes extraídos de trabajadores (fallback): ${this.regimenesLaborales.length}`);
      }
    });
  }
  
  // ==================== NAVEGACIÓN DEL WIZARD ====================
  siguiente(): void {
    if (!this.validarPasoActual()) return;
    
    if (this.pasoActual < this.totalPasos) {
      this.pasoActual++;
      
      // Si llega al paso 3 (Procesamiento), ejecuta automáticamente
      if (this.pasoActual === 3) {
        setTimeout(() => {
          this.procesarPlanilla();
        }, 500);
      }
    }
  }
  
  anterior(): void {
    if (this.pasoActual > 1) {
      this.pasoActual--;
      
      // Si regresa del paso 4 al 3, resetear
      if (this.pasoActual === 3) {
        this.procesando = false;
        this.planillaGenerada = null;
      }
      
      // Si regresa al paso 2, aplicar filtros según tipo de planilla
      if (this.pasoActual === 2) {
        this.aplicarFiltros();
      }
    }
  }
  
  irAPaso(paso: number): void {
    // Solo permite ir a pasos anteriores o al actual
    if (paso <= this.pasoActual && paso !== 3) {
      this.pasoActual = paso;
    }
  }
  
  validarPasoActual(): boolean {
    switch (this.pasoActual) {
      case 1:
        // Validar configuración
        if (!this.configuracion.mes || !this.configuracion.anio || !this.configuracion.tipoPlanilla) {
          alert('⚠️ Complete todos los campos de configuración');
          return false;
        }
        
        // Validar que el mes/año no sea futuro
        const fechaActual = new Date();
        const mesActual = fechaActual.getMonth() + 1;
        const anioActual = fechaActual.getFullYear();
        
        if (this.configuracion.anio > anioActual || 
           (this.configuracion.anio === anioActual && this.configuracion.mes > mesActual)) {
          alert('⚠️ No puede generar planillas de periodos futuros');
          return false;
        }
        
        return true;
        
      case 2:
        // Validar selección de trabajadores
        if (!this.filtros.incluirTodos && this.trabajadoresSeleccionados.length === 0) {
          alert('⚠️ Debe seleccionar al menos un trabajador');
          return false;
        }
        
        // Preparar trabajadores seleccionados
        if (this.filtros.incluirTodos) {
          this.trabajadoresSeleccionados = this.trabajadoresFiltrados.map(t => t.TrabajadorID);
        }
        
        if (this.trabajadoresSeleccionados.length === 0) {
          alert('⚠️ No hay trabajadores disponibles con los filtros aplicados');
          return false;
        }
        
        return true;
        
      default:
        return true;
    }
  }
  
  // ==================== FILTROS ====================
  aplicarFiltros(): void {
    let resultado = [...this.trabajadores];
    
    // FILTRO ESPECIAL: Para CTS solo mostrar trabajadores del régimen DL 728
    if (this.configuracion.tipoPlanilla === 'CTS') {
      resultado = resultado.filter(t => {
        const regimen = (t.RegimenLaboral || '').toUpperCase();
        // Filtrar solo régimen DL 728 (puede venir como "RÉGIMEN DL 728", "DL 728", "DL-728", etc.)
        return regimen.includes('728') || regimen.includes('DL 728') || regimen.includes('DL-728');
      });
      console.log(`📋 Filtro CTS aplicado: Solo trabajadores del régimen DL 728 (${resultado.length} encontrados)`);
    }
    
    if (this.filtros.busqueda) {
      const busqueda = this.filtros.busqueda.toLowerCase();
      resultado = resultado.filter(t =>
        t.NombreCompleto?.toLowerCase().includes(busqueda) ||
        t.DNI?.includes(busqueda) ||
        t.Cargo?.toLowerCase().includes(busqueda)
      );
    }
    
    // Filtro de área eliminado - áreas ya no se usan
    
    if (this.filtros.regimenLaboral) {
      resultado = resultado.filter(t => t.RegimenLaboral === this.filtros.regimenLaboral);
    }
    
    this.trabajadoresFiltrados = resultado;
    
    // Si estaba "todos seleccionados", actualizar la selección
    if (this.filtros.incluirTodos) {
      this.trabajadoresSeleccionados = resultado.map(t => t.TrabajadorID);
    }
  }
  
  limpiarFiltros(): void {
    this.filtros = {
      busqueda: '',
      regimenLaboral: '',
      incluirTodos: this.filtros.incluirTodos
    };
    this.aplicarFiltros();
  }
  
  // ==================== SELECCIÓN ====================
  toggleTrabajador(id: number): void {
    const index = this.trabajadoresSeleccionados.indexOf(id);
    if (index > -1) {
      this.trabajadoresSeleccionados.splice(index, 1);
    } else {
      this.trabajadoresSeleccionados.push(id);
    }
    this.actualizarTodosSeleccionados();
  }
  
  toggleTodos(): void {
    if (this.todosSeleccionados) {
      this.trabajadoresSeleccionados = [];
    } else {
      this.trabajadoresSeleccionados = this.trabajadoresFiltrados.map(t => t.TrabajadorID);
    }
    this.todosSeleccionados = !this.todosSeleccionados;
  }
  
  actualizarTodosSeleccionados(): void {
    this.todosSeleccionados = this.trabajadoresFiltrados.length > 0 &&
      this.trabajadoresFiltrados.every(t => this.trabajadoresSeleccionados.includes(t.TrabajadorID));
  }
  
  estaSeleccionado(id: number): boolean {
    return this.trabajadoresSeleccionados.includes(id);
  }
  
  toggleIncluirTodos(): void {
    if (this.filtros.incluirTodos) {
      this.trabajadoresSeleccionados = this.trabajadoresFiltrados.map(t => t.TrabajadorID);
      this.todosSeleccionados = true;
    } else {
      this.trabajadoresSeleccionados = [];
      this.todosSeleccionados = false;
    }
  }
  
  seleccionarTipoPlanilla(tipoId: string): void {
    this.configuracion.tipoPlanilla = tipoId;
    // Si se selecciona CTS, aplicar filtro automáticamente
    if (tipoId === 'CTS') {
      // Limpiar selección anterior
      this.trabajadoresSeleccionados = [];
      this.todosSeleccionados = false;
      // Aplicar filtros para mostrar solo régimen 728
      this.aplicarFiltros();
    }
  }
  
  seleccionarTipoPlanillaYAvanzar(tipoId: string): void {
    this.configuracion.tipoPlanilla = tipoId;
    // Si se selecciona CTS, aplicar filtro automáticamente
    if (tipoId === 'CTS') {
      // Limpiar selección anterior
      this.trabajadoresSeleccionados = [];
      this.todosSeleccionados = false;
      // Aplicar filtros para mostrar solo régimen 728
      this.aplicarFiltros();
    }
    // Validar que todos los campos estén completos antes de avanzar
    if (this.configuracion.mes && this.configuracion.anio && this.configuracion.tipoPlanilla) {
      setTimeout(() => {
        this.siguiente();
      }, 100);
    }
  }
  
  toggleFiltrosOpcionales(): void {
    this.filtrosExpandidos = !this.filtrosExpandidos;
  }
  
  // ==================== PROCESAMIENTO ====================
  async procesarPlanilla(): Promise<void> {
    this.procesando = true;
    this.porcentajeProceso = 0;
    
    try {
      // Paso 1: Validar datos (10%)
      this.progresoActual = '✓ Validando datos de trabajadores';
      this.porcentajeProceso = 10;
      await this.delay(500);
      
      // Paso 2: Calculando ingresos (30%)
      this.progresoActual = '💰 Calculando ingresos';
      this.porcentajeProceso = 30;
      await this.delay(800);
      
      // Paso 3: Calculando descuentos (50%)
      this.progresoActual = '➖ Calculando descuentos';
      this.porcentajeProceso = 50;
      await this.delay(800);
      
      // Paso 4: Calculando aportes (70%)
      this.progresoActual = '🏛️ Calculando aportes del empleador';
      this.porcentajeProceso = 70;
      await this.delay(600);
      
      // Paso 5: Generando planilla (85%)
      this.progresoActual = '📊 Generando planilla';
      this.porcentajeProceso = 85;
      await this.delay(400);
      
      // Llamar al backend (el interceptor agrega el token automáticamente)
      const data = {
        año: this.configuracion.anio,
        mes: this.configuracion.mes,
        tipoPlanilla: this.configuracion.tipoPlanilla,
        trabajadores: this.trabajadoresSeleccionados,
        diasTrabajados: this.configuracion.diasTrabajados
      };
      
      console.log('📤 Enviando al backend:', data);
      
      // El interceptor agrega el token automáticamente
      this.http.post<any>(`${this.apiPlanillas}/generar`, data).subscribe({
        next: async (response) => {
          if (response.success) {
            this.porcentajeProceso = 100;
            this.progresoActual = '✅ Planilla generada exitosamente';
            
            await this.delay(500);
            
            this.planillaGenerada = response.data.planilla;
            this.resumen = this.calcularResumen(response.data.planilla);
            this.procesando = false;
            this.pasoActual = 4;
            
            console.log('✅ Planilla generada:', this.planillaGenerada);
            
            // Agregar notificación
            const codigo = response.data.codigo || this.planillaGenerada?.Codigo || 'N/A';
            const periodo = `${this.configuracion.mes}/${this.configuracion.anio}`;
            this.notificacionesService.notificarPlanillaGenerada(codigo, periodo);
          } else {
            throw new Error(response.message || 'Error desconocido');
          }
        },
        error: (error) => {
          console.error('❌ Error del servidor:', error);
          alert(`❌ Error al generar planilla:\n${error.error?.message || error.message || 'Error de conexión'}`);
          this.procesando = false;
          this.pasoActual = 2; // Volver a selección
        }
      });
      
    } catch (error: any) {
      console.error('❌ Error en procesamiento:', error);
      alert(`❌ Error: ${error.message}`);
      this.procesando = false;
      this.pasoActual = 2;
    }
  }
  
  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  calcularResumen(planilla: any): any {
    const detalle = planilla.detalle || [];
    
    // Agrupar por sistema de pensiones
    const porSistema = {
      AFP: detalle.filter((d: any) => d.AFP > 0),
      ONP: detalle.filter((d: any) => d.ONP > 0)
    };
    
    // Agrupar por régimen laboral
    const regimenesLaborales = [...new Set(detalle.map((d: any) => 
      this.trabajadores.find(t => t.DNI === d.DNI)?.RegimenLaboral || 'No especificado'
    ))];
    
    const porRegimen = regimenesLaborales.map(regimen => ({
      regimen,
      cantidad: detalle.filter((d: any) => 
        this.trabajadores.find(t => t.DNI === d.DNI)?.RegimenLaboral === regimen
      ).length,
      total: detalle
        .filter((d: any) => this.trabajadores.find(t => t.DNI === d.DNI)?.RegimenLaboral === regimen)
        .reduce((sum: number, d: any) => sum + (d.NetoPagar || 0), 0)
    }));
    
    // Agrupar por cargo
    const cargos = [...new Set(detalle.map((d: any) => d.Cargo || 'Sin cargo'))].filter(Boolean);
    
    const porCargo = cargos.map(cargo => ({
      cargo,
      cantidad: detalle.filter((d: any) => (d.Cargo || 'Sin cargo') === cargo).length,
      total: detalle
        .filter((d: any) => (d.Cargo || 'Sin cargo') === cargo)
        .reduce((sum: number, d: any) => sum + (d.NetoPagar || 0), 0)
    }));
    
    return {
      totalTrabajadores: detalle.length,
      trabajadoresAFP: porSistema.AFP.length,
      trabajadoresONP: porSistema.ONP.length,
      totalAporteAFP: porSistema.AFP.reduce((sum: number, d: any) => sum + (d.AFP || 0), 0),
      totalAporteONP: porSistema.ONP.reduce((sum: number, d: any) => sum + (d.ONP || 0), 0),
      desglosePorRegimen: porRegimen,
      desglosePorCargo: porCargo
    };
  }
  
  // ==================== ACCIONES FINALES ====================
  aprobarPlanilla(): void {
    if (!this.planillaGenerada) return;
    
    // Redirigir al historial para revisar y aprobar la planilla
    console.log('📋 Redirigiendo al historial para revisar planilla:', this.planillaGenerada.PlanillaID);
    this.router.navigate(['/planillas/historial']);
  }
  
  exportarExcel(): void {
    if (!this.planillaGenerada) return;
    
    const planillaID = this.planillaGenerada.PlanillaID;
    window.open(`${this.apiPlanillas}/${planillaID}/exportar/excel`, '_blank');
  }
  
  exportarPDF(): void {
    alert('📄 Funcionalidad de PDF en desarrollo');
  }
  
  exportarTXT(): void {
    if (!this.planillaGenerada) return;
    
    const planillaID = this.planillaGenerada.PlanillaID;
    window.open(`${this.apiPlanillas}/${planillaID}/exportar/txt-bancos`, '_blank');
  }
  
  verDetallePlanilla(): void {
    if (this.planillaGenerada) {
      // Navegar al historial con query param para abrir el detalle
      this.router.navigate(['/planillas/historial'], {
        queryParams: { planillaId: this.planillaGenerada.PlanillaID }
      });
    }
  }
  
  nuevaPlanilla(): void {
    this.pasoActual = 1;
    this.trabajadoresSeleccionados = [];
    this.todosSeleccionados = false;
    this.planillaGenerada = null;
    this.resumen = null;
    this.configuracion.mes = new Date().getMonth() + 1;
    this.configuracion.anio = new Date().getFullYear();
    this.limpiarFiltros();
  }
  
  volverAEditar(): void {
    this.pasoActual = 2;
  }
  
  // ==================== UTILIDADES ====================
  getNombreMes(mes: number): string {
    const mesObj = this.meses.find(m => m.valor === mes);
    return mesObj ? mesObj.nombre : '';
  }
  
  formatearMoneda(monto: number): string {
    if (!monto) return 'S/. 0.00';
    return `S/. ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  get nombreMesActual(): string {
    return this.getNombreMes(this.configuracion.mes);
  }
  
  // Construir nombre completo si no viene del backend
  construirNombreCompleto(trabajador: any): string {
    const apellidoPaterno = trabajador.ApellidoPaterno || '';
    const apellidoMaterno = trabajador.ApellidoMaterno || '';
    const nombres = trabajador.Nombres || '';
    
    if (apellidoPaterno && nombres) {
      return `${apellidoPaterno} ${apellidoMaterno}, ${nombres}`.trim();
    }
    
    return nombres || apellidoPaterno || 'Sin nombre';
  }
  
  get tipoPlanillaActual(): any {
    return this.tiposPlanilla.find(t => t.id === this.configuracion.tipoPlanilla);
  }
}