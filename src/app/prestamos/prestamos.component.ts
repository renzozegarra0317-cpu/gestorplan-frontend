import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { PrestamosService, Prestamo, EntidadFinanciera, Cuota } from './prestamos.service';

@Component({
  selector: 'app-prestamos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './prestamos.component.html',
  styleUrls: ['./prestamos.component.scss']
})
export class PrestamosComponent implements OnInit {
  // Vista actual
  vistaActual: 'lista' | 'nuevo' | 'detalle' | 'liquidar' = 'lista';
  
  // Datos
  prestamos: Prestamo[] = [];
  entidades: EntidadFinanciera[] = [];
  prestamoSeleccionado: Prestamo | null = null;
  cronograma: Cuota[] = [];
  trabajadores: any[] = [];
  
  // Filtros
  filtroEstado: string = '';
  filtroEntidad: string = '';
  filtroBusqueda: string = '';
  
  // Modales
  mostrarFormulario = false;
  mostrarModalLiquidacion = false;
  prestamoALiquidar: Prestamo | null = null;
  prestamoEditando: Prestamo | null = null;
  esModoEdicion = false;
  
  // Nuevo préstamo
  nuevoPrestamo: any = {
    trabajadorID: '',
    entidadID: '',
    numeroContrato: '',
    tipoPrestamo: '',
    montoTotal: 0,
    numeroCuotas: 0,
    montoCuota: 0,
    fechaInicio: '',
    codigoDescuento: '',
    observaciones: '',
    pin: ''
  };
  
  // Modo de cronograma: 'automatico', 'manual', 'importar' o 'verCuotas'
  modoCronograma: 'automatico' | 'manual' | 'importar' | 'verCuotas' = 'automatico';
  
  // Cuotas manuales para el cronograma personalizado
  cuotasManuales: any[] = [];
  
  // Archivo para importar
  archivoImportar: File | null = null;
  nombreArchivoImportar: string = '';
  importando: boolean = false;
  
  tipoEntidadSeleccionada = '';
  montoLiquidacion = 0;
  observacionesLiquidacion = '';
  
  // PIN y protección de campos
  mostrarModalPIN = false;
  pinIngresado = '';
  campoProtegidoEditando: 'montoTotal' | 'cuotas' | null = null;
  pinVerificado = false;
  errorPIN = '';
  intentosPINFallidos = 0;
  mostrarAlertaPIN = false;
  nivelAlertaPIN: 'normal' | 'media' | 'critica' = 'normal';
  
  // Formularios
  prestamoForm!: FormGroup;
  liquidarForm!: FormGroup;
  
  // Loading
  cargando = false;
  
  // Paginación
  paginaActual = 1;
  itemsPorPagina = 10;
  
  // Exponer Math para usar en el template
  Math = Math;
  
  constructor(
    private prestamosService: PrestamosService,
    private http: HttpClient,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.inicializarFormularios();
  }

  ngOnInit() {
    // Resetear scroll al inicio
    window.scrollTo(0, 0);
    setTimeout(() => {
      const mainContent = document.querySelector('.main-content') as HTMLElement;
      if (mainContent) {
        mainContent.scrollTop = 0;
      }
    }, 100);
    
    // Recargar datos
    this.cargarPrestamos();
    this.cargarEntidades();
    this.cargarTrabajadores();
  }

  inicializarFormularios() {
    this.prestamoForm = this.fb.group({
      trabajadorID: ['', Validators.required],
      entidadID: ['', Validators.required],
      numeroContrato: ['', Validators.required],
      tipoPrestamo: ['Personal', Validators.required],
      montoTotal: ['', [Validators.required, Validators.min(1)]],
      tea: ['', [Validators.min(0), Validators.max(100)]],
      tem: ['', [Validators.min(0), Validators.max(10)]],
      numeroCuotas: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      montoCuota: ['', [Validators.required, Validators.min(1)]],
      fechaDesembolso: ['', Validators.required],
      fechaInicioPago: ['', Validators.required],
      descuentoAutomatico: [true],
      observaciones: ['']
    });

    this.liquidarForm = this.fb.group({
      saldoCapitalPendiente: [{ value: '', disabled: true }],
      interesesPendientes: [0],
      moraPendiente: [0],
      otrosCargos: [0],
      montoTotalLiquidado: [{ value: '', disabled: true }],
      tipoLiquidacion: ['Anticipada', Validators.required],
      formaPago: ['Transferencia', Validators.required],
      fechaLiquidacion: [new Date().toISOString().split('T')[0], Validators.required],
      numeroComprobante: [''],
      observaciones: ['']
    });
  }

  // ========================================
  // CARGAR DATOS
  // ========================================

  cargarPrestamos() {
    this.cargando = true;
    const filtros: any = {};
    
    if (this.filtroEstado) filtros.estado = this.filtroEstado;
    if (this.filtroEntidad) filtros.entidadID = parseInt(this.filtroEntidad);

    this.prestamosService.obtenerTodos(filtros).subscribe({
      next: (response) => {
        this.prestamos = response.data || [];
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar préstamos:', error);
        this.cargando = false;
        alert('Error al cargar los préstamos');
      }
    });
  }

  cargarEntidades() {
    this.prestamosService.obtenerEntidades().subscribe({
      next: (response) => {
        this.entidades = response.data || [];
        console.log('Entidades cargadas:', this.entidades.length);
        console.log('Tipos de entidades:', [...new Set(this.entidades.map(e => e.TipoEntidad))]);
      },
      error: (error) => {
        console.error('Error al cargar entidades:', error);
      }
    });
  }

  cargarTrabajadores() {
    this.http.get<any>(`${environment.apiUrl}/trabajadores`).subscribe({
      next: (response) => {
        const data = response.data || response || [];
        // Formatear los trabajadores para asegurar que tengan NombreCompleto
        this.trabajadores = data.map((t: any) => ({
          ...t,
          NombreCompleto: t.NombreCompleto || `${t.Nombres || ''} ${t.ApellidoPaterno || ''} ${t.ApellidoMaterno || ''}`.trim()
        }));
        console.log('Trabajadores cargados:', this.trabajadores.length);
      },
      error: (error) => {
        console.error('Error al cargar trabajadores:', error);
      }
    });
  }

  // ========================================
  // NAVEGACIÓN
  // ========================================

  mostrarNuevo() {
    this.esModoEdicion = false;
    this.prestamoEditando = null;
    this.modoCronograma = 'automatico';
    this.cuotasManuales = [];
    this.pinVerificado = false;
    this.nuevoPrestamo = {
      trabajadorID: '',
      entidadID: '',
      numeroContrato: '',
      tipoPrestamo: '',
      montoTotal: 0,
      numeroCuotas: 0,
      montoCuota: 0,
      fechaInicio: new Date().toISOString().split('T')[0],
      codigoDescuento: '',
      observaciones: '',
      pin: ''
    };
    this.tipoEntidadSeleccionada = '';
    this.mostrarFormulario = true;
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.esModoEdicion = false;
    this.prestamoEditando = null;
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.nuevoPrestamo = {
      trabajadorID: '',
      entidadID: '',
      numeroContrato: '',
      tipoPrestamo: '',
      montoTotal: 0,
      numeroCuotas: 0,
      montoCuota: 0,
      fechaInicio: '',
      codigoDescuento: '',
      observaciones: '',
      pin: ''
    };
    this.modoCronograma = 'automatico';
    this.cuotasManuales = [];
    this.archivoImportar = null;
    this.nombreArchivoImportar = '';
    this.tipoEntidadSeleccionada = '';
    this.pinVerificado = false;
  }

  verDetalle(prestamo: Prestamo) {
    this.prestamoSeleccionado = prestamo;
    this.cargarCronograma(prestamo.PrestamoID);
  }

  cerrarDetalle() {
    this.prestamoSeleccionado = null;
    this.cronograma = [];
  }

  liquidarPrestamo(prestamo: Prestamo) {
    this.prestamoALiquidar = prestamo;
    this.montoLiquidacion = prestamo.SaldoPendiente || 0;
    this.observacionesLiquidacion = '';
    this.mostrarModalLiquidacion = true;
  }

  editarPrestamo(prestamo: Prestamo) {
    this.prestamoEditando = prestamo;
    this.esModoEdicion = true;
    this.pinVerificado = false;
    
    // Cargar datos del préstamo en el formulario
    this.nuevoPrestamo = {
      trabajadorID: prestamo.TrabajadorID.toString(),
      entidadID: prestamo.EntidadID.toString(),
      numeroContrato: prestamo.NumeroContrato,
      tipoPrestamo: prestamo.TipoPrestamo,
      montoTotal: prestamo.MontoTotal,
      numeroCuotas: prestamo.NumeroCuotas,
      montoCuota: prestamo.MontoCuota,
      fechaInicio: prestamo.FechaInicioPago ? prestamo.FechaInicioPago.split('T')[0] : '',
      codigoDescuento: prestamo.CodigoDescuento || '',
      observaciones: prestamo.Observaciones || '',
      pin: ''
    };
    
    // Obtener el tipo de entidad para filtrar
    this.tipoEntidadSeleccionada = prestamo.TipoEntidad;
    
    // Cargar cronograma si existe
    this.cargarCronograma(prestamo.PrestamoID);
    
    // Abrir formulario
    this.mostrarFormulario = true;
    this.modoCronograma = 'verCuotas'; // Modo especial para ver todas las cuotas
  }

  // ========================================
  // GESTIÓN DE PIN
  // ========================================

  solicitarPIN(campo: 'montoTotal' | 'cuotas') {
    this.campoProtegidoEditando = campo;
    this.mostrarModalPIN = true;
    this.pinIngresado = '';
    this.errorPIN = '';
    this.intentosPINFallidos = 0;
    this.mostrarAlertaPIN = false;
    this.nivelAlertaPIN = 'normal';
  }

  cerrarModalPIN() {
    this.mostrarModalPIN = false;
    this.campoProtegidoEditando = null;
    this.pinIngresado = '';
    this.errorPIN = '';
    this.intentosPINFallidos = 0;
    this.mostrarAlertaPIN = false;
    this.nivelAlertaPIN = 'normal';
  }

  verificarPIN() {
    if (!this.prestamoEditando || !this.pinIngresado) {
      this.errorPIN = 'Por favor ingrese el PIN';
      return;
    }

    this.cargando = true;
    this.errorPIN = '';
    this.mostrarAlertaPIN = false;

    this.prestamosService.verificarPIN(this.prestamoEditando.PrestamoID, this.pinIngresado).subscribe({
      next: (response) => {
        if (response.success) {
          // PIN correcto - resetear contador
          this.intentosPINFallidos = 0;
          this.pinVerificado = true;
          this.mostrarModalPIN = false;
          this.campoProtegidoEditando = null;
          this.pinIngresado = '';
          this.cargando = false;
          this.mostrarAlertaPIN = false;
          this.nivelAlertaPIN = 'normal';
        }
      },
      error: (error) => {
        // PIN incorrecto - incrementar contador
        this.intentosPINFallidos++;
        this.cargando = false;
        
        // Determinar nivel de alerta
        if (this.intentosPINFallidos <= 3) {
          this.nivelAlertaPIN = 'normal';
        } else if (this.intentosPINFallidos <= 5) {
          this.nivelAlertaPIN = 'media';
        } else {
          this.nivelAlertaPIN = 'critica';
        }
        
        // Mostrar alerta
        this.mostrarAlertaPIN = true;
        this.errorPIN = error.error?.mensaje || 'PIN incorrecto';
        
        // Resetear campo PIN para nuevo intento
        this.pinIngresado = '';
        
        // Auto-ocultar alerta después de unos segundos (solo para normal y media)
        if (this.nivelAlertaPIN !== 'critica') {
          setTimeout(() => {
            this.mostrarAlertaPIN = false;
          }, 4000);
        }
      }
    });
  }

  cerrarAlertaPIN() {
    this.mostrarAlertaPIN = false;
  }

  habilitarEdicionMontoTotal() {
    if (!this.pinVerificado) {
      this.solicitarPIN('montoTotal');
      return false;
    }
    return true;
  }

  habilitarEdicionCuotas() {
    if (!this.pinVerificado) {
      this.solicitarPIN('cuotas');
      return false;
    }
    return true;
  }

  cerrarModalLiquidacion() {
    this.mostrarModalLiquidacion = false;
    this.prestamoALiquidar = null;
  }

  filtrarEntidadesPorTipo() {
    // Se usa en el HTML
  }

  limpiarFiltros() {
    this.filtroBusqueda = '';
    this.filtroEstado = '';
    this.filtroEntidad = '';
    this.cargarPrestamos();
  }

  // ========================================
  // CRONOGRAMA
  // ========================================

  cargarCronograma(prestamoID: number) {
    this.prestamosService.obtenerCronograma(prestamoID).subscribe({
      next: (response) => {
        this.cronograma = (response.data || []).map((c: any) => ({
          ...c,
          editada: false,
          montoOriginal: c.MontoCuota,
          // Asegurar que el estado tenga un valor por defecto si está vacío
          Estado: c.Estado || 'Pendiente'
        }));
        console.log('📋 Cronograma cargado:', this.cronograma.length, 'cuotas');
        console.log('📊 Estados encontrados:', [...new Set(this.cronograma.map((c: any) => c.Estado))]);
      },
      error: (error) => {
        console.error('Error al cargar cronograma:', error);
      }
    });
  }

  marcarCuotaComoEditada(cuota: any, nuevoMonto: number) {
    if (!this.habilitarEdicionCuotas()) {
      return;
    }
    cuota.editada = true;
    cuota.MontoCuota = nuevoMonto;
  }

  // ========================================
  // CREAR PRÉSTAMO
  // ========================================

  cambiarModoCronograma(modo: 'automatico' | 'manual' | 'importar' | 'verCuotas') {
    this.modoCronograma = modo;
    
    if (modo === 'manual' && this.nuevoPrestamo.numeroCuotas > 0) {
      this.generarCuotasManuales();
    }
    
    if (modo === 'importar') {
      this.archivoImportar = null;
      this.nombreArchivoImportar = '';
      this.cuotasManuales = [];
    }
  }

  generarCuotasManuales() {
    const numCuotas = parseInt(this.nuevoPrestamo.numeroCuotas);
    if (!numCuotas || numCuotas <= 0 || numCuotas > 120) {
      alert('Por favor ingrese un número de cuotas válido (1-120)');
      return;
    }

    const montoPorDefecto = this.nuevoPrestamo.montoTotal && numCuotas 
      ? (parseFloat(this.nuevoPrestamo.montoTotal) / numCuotas).toFixed(2) 
      : '0.00';
    
    const fechaInicio = this.nuevoPrestamo.fechaInicio 
      ? new Date(this.nuevoPrestamo.fechaInicio) 
      : new Date();

    this.cuotasManuales = [];
    for (let i = 1; i <= numCuotas; i++) {
      const fechaVencimiento = new Date(fechaInicio);
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);
      
      this.cuotasManuales.push({
        numeroCuota: i,
        montoCuota: montoPorDefecto,
        fechaVencimiento: fechaVencimiento.toISOString().split('T')[0]
      });
    }
  }

  calcularTotalCuotasManuales(): number {
    return this.cuotasManuales.reduce((sum, c) => sum + parseFloat(c.montoCuota || 0), 0);
  }

  validarCuotasManuales(): boolean {
    if (this.cuotasManuales.length === 0) {
      alert('❌ No hay cuotas definidas');
      return false;
    }

    // Validar que todas las cuotas tengan monto y fecha
    for (const cuota of this.cuotasManuales) {
      if (!cuota.montoCuota || parseFloat(cuota.montoCuota) <= 0) {
        alert(`❌ La cuota #${cuota.numeroCuota} debe tener un monto mayor a 0`);
        return false;
      }
      if (!cuota.fechaVencimiento) {
        alert(`❌ La cuota #${cuota.numeroCuota} debe tener una fecha de vencimiento`);
        return false;
      }
    }

    // Advertir si el total de cuotas no coincide con el monto total
    const totalCuotas = this.calcularTotalCuotasManuales();
    const montoTotal = parseFloat(this.nuevoPrestamo.montoTotal);
    const diferencia = Math.abs(totalCuotas - montoTotal);
    
    if (diferencia > 0.50) { // Permitir diferencia de hasta 50 centavos por redondeos
      const confirmar = confirm(
        `⚠️ ADVERTENCIA:\n\n` +
        `Monto total del préstamo: S/. ${montoTotal.toFixed(2)}\n` +
        `Total de cuotas: S/. ${totalCuotas.toFixed(2)}\n` +
        `Diferencia: S/. ${diferencia.toFixed(2)}\n\n` +
        `¿Desea continuar de todas formas?`
      );
      
      if (!confirmar) {
        return false;
      }
    }

    return true;
  }

  // ========================================
  // IMPORTAR CRONOGRAMA
  // ========================================

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const extensionesPermitidas = ['.xlsx', '.xls', '.csv', '.pdf', '.jpg', '.jpeg', '.png'];
      const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!extensionesPermitidas.includes(extension)) {
        alert('❌ Formatos permitidos:\n' +
              '• Excel: .xlsx, .xls\n' +
              '• CSV: .csv\n' +
              '• PDF: .pdf\n' +
              '• Imágenes: .jpg, .jpeg, .png');
        event.target.value = '';
        return;
      }

      // Validar tamaño (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('❌ El archivo no debe superar los 10 MB');
        event.target.value = '';
        return;
      }

      this.archivoImportar = file;
      this.nombreArchivoImportar = file.name;
      
      // Mostrar tipo de archivo detectado
      if (['.jpg', '.jpeg', '.png'].some(ext => file.name.toLowerCase().endsWith(ext))) {
        console.log('📷 Imagen detectada - se usará OCR para extraer texto');
      } else if (file.name.toLowerCase().endsWith('.pdf')) {
        console.log('📄 PDF detectado - se extraerá el texto automáticamente');
      }
    }
  }

  importarCronograma() {
    if (!this.archivoImportar) {
      alert('Por favor seleccione un archivo');
      return;
    }

    this.importando = true;
    const formData = new FormData();
    formData.append('archivo', this.archivoImportar);

    this.http.post<any>(`${environment.apiUrl}/prestamos/importar-cronograma`, formData).subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.cuotas) {
          this.cuotasManuales = response.data.cuotas;
          this.nuevoPrestamo.numeroCuotas = response.data.totalCuotas;
          
          // Actualizar monto total si no está definido
          if (!this.nuevoPrestamo.montoTotal || this.nuevoPrestamo.montoTotal === 0) {
            this.nuevoPrestamo.montoTotal = response.data.montoTotal;
          }

          alert(`✅ ${response.mensaje}\n\nTotal: S/. ${response.data.montoTotal.toFixed(2)}`);
          console.log('Cuotas importadas:', this.cuotasManuales);
        }
        this.importando = false;
      },
      error: (error) => {
        console.error('Error al importar cronograma:', error);
        alert('❌ Error al procesar el archivo: ' + (error.error?.mensaje || error.message));
        this.importando = false;
      }
    });
  }

  limpiarArchivo() {
    this.archivoImportar = null;
    this.nombreArchivoImportar = '';
    this.cuotasManuales = [];
  }

  guardarPrestamo() {
    // Validaciones básicas
    if (!this.nuevoPrestamo.trabajadorID || !this.nuevoPrestamo.entidadID || 
        !this.nuevoPrestamo.numeroContrato || !this.nuevoPrestamo.tipoPrestamo ||
        !this.nuevoPrestamo.montoTotal || !this.nuevoPrestamo.numeroCuotas || 
        !this.nuevoPrestamo.fechaInicio) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    // Validaciones según modo
    if (this.modoCronograma === 'automatico') {
      if (!this.nuevoPrestamo.montoCuota || parseFloat(this.nuevoPrestamo.montoCuota) <= 0) {
        alert('Por favor ingrese el monto de la cuota');
        return;
      }
    } else if (this.modoCronograma === 'manual' || this.modoCronograma === 'importar') {
      if (!this.validarCuotasManuales()) {
        return;
      }
    }

    this.cargando = true;
    const datos: any = {
      trabajadorID: parseInt(this.nuevoPrestamo.trabajadorID),
      entidadID: parseInt(this.nuevoPrestamo.entidadID),
      numeroContrato: this.nuevoPrestamo.numeroContrato,
      tipoPrestamo: this.nuevoPrestamo.tipoPrestamo,
      montoTotal: parseFloat(this.nuevoPrestamo.montoTotal),
      numeroCuotas: parseInt(this.nuevoPrestamo.numeroCuotas),
      fechaDesembolso: this.nuevoPrestamo.fechaInicio,
      fechaInicioPago: this.nuevoPrestamo.fechaInicio,
      codigoDescuento: this.nuevoPrestamo.codigoDescuento,
      observaciones: this.nuevoPrestamo.observaciones,
      pin: this.nuevoPrestamo.pin || ''
    };

    // Agregar datos según el modo
    if (this.modoCronograma === 'automatico') {
      datos.montoCuota = parseFloat(this.nuevoPrestamo.montoCuota);
      datos.modoCronograma = 'automatico';
    } else {
      datos.modoCronograma = 'manual';
      datos.cronogramaManual = this.cuotasManuales.map(c => ({
        numeroCuota: c.numeroCuota,
        montoCuota: parseFloat(c.montoCuota),
        fechaVencimiento: c.fechaVencimiento
      }));
      // Usar el promedio como monto de cuota para referencia
      datos.montoCuota = this.calcularTotalCuotasManuales() / this.cuotasManuales.length;
    }

    if (this.esModoEdicion && this.prestamoEditando) {
      // ACTUALIZAR PRÉSTAMO EXISTENTE
      const datosActualizacion: any = {
        numeroContrato: datos.numeroContrato,
        tipoPrestamo: datos.tipoPrestamo,
        observaciones: datos.observaciones
      };
      
      // Si el monto total fue editado y PIN verificado, actualizarlo
      if (this.pinVerificado && datos.montoTotal !== this.prestamoEditando.MontoTotal) {
        datosActualizacion.montoTotal = datos.montoTotal;
      }
      
      // Verificar si se cambió el monto total
      const montoTotalCambio = datosActualizacion.montoTotal !== undefined && 
                                datosActualizacion.montoTotal !== this.prestamoEditando.MontoTotal;
      
      // Actualizar préstamo
      this.prestamosService.actualizar(this.prestamoEditando.PrestamoID, datosActualizacion).subscribe({
        next: (response) => {
          // Si se cambió el monto total, las cuotas se recalculan automáticamente en el backend
          if (montoTotalCambio) {
            // Recargar el cronograma para mostrar las cuotas recalculadas
            setTimeout(() => {
              this.cargarCronograma(this.prestamoEditando.PrestamoID);
            }, 500);
            alert('✅ Préstamo actualizado exitosamente.\n\n🔄 Las cuotas han sido recalculadas automáticamente.\n\nRevise el cronograma actualizado abajo.');
            this.cargarPrestamos();
            this.cargando = false;
            // Actualizar el monto total en el objeto de edición
            this.prestamoEditando.MontoTotal = datosActualizacion.montoTotal;
            // NO cerrar el formulario para que el usuario pueda ver las cuotas actualizadas
          } 
          // Si hay cuotas editadas manualmente Y NO se cambió el monto total
          else if (this.pinVerificado && this.cronograma.length > 0) {
            const cuotasEditadas = this.cronograma.filter((c: any) => c.editada && c.Estado === 'Pendiente').map((c: any) => ({
              cuotaID: c.CuotaID,
              montoCuota: c.MontoCuota,
              fechaVencimiento: c.FechaVencimiento
            }));
            
            if (cuotasEditadas.length > 0) {
              // Actualizar las cuotas editadas manualmente
              this.prestamosService.actualizarCuotas(this.prestamoEditando.PrestamoID, cuotasEditadas).subscribe({
                next: () => {
                  alert('✅ Préstamo y cuotas actualizados exitosamente');
                  this.cargarCronograma(this.prestamoEditando.PrestamoID);
                  this.cargarPrestamos();
                  this.cargando = false;
                },
                error: (error) => {
                  console.error('Error al actualizar cuotas:', error);
                  alert('✅ Préstamo actualizado, pero hubo un error al actualizar las cuotas');
                  this.cargarPrestamos();
                  this.cargando = false;
                }
              });
            } else {
              alert(response.mensaje || '✅ Préstamo actualizado exitosamente');
              this.cerrarFormulario();
              this.cargarPrestamos();
              this.cargando = false;
            }
          } else {
            alert(response.mensaje || '✅ Préstamo actualizado exitosamente');
            this.cerrarFormulario();
            this.cargarPrestamos();
            this.cargando = false;
          }
        },
        error: (error) => {
          console.error('Error al actualizar préstamo:', error);
          alert('❌ Error al actualizar el préstamo: ' + (error.error?.mensaje || error.message));
          this.cargando = false;
        }
      });
    } else {
      // CREAR NUEVO PRÉSTAMO
      this.prestamosService.crear(datos).subscribe({
        next: (response) => {
          alert('✅ Préstamo creado exitosamente');
          this.cerrarFormulario();
          this.cargarPrestamos();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al crear préstamo:', error);
          alert('❌ Error al crear el préstamo: ' + (error.error?.mensaje || error.message));
          this.cargando = false;
        }
      });
    }
  }

  // ========================================
  // LIQUIDAR PRÉSTAMO
  // ========================================

  confirmarLiquidacion() {
    if (!this.prestamoALiquidar || !this.montoLiquidacion) {
      alert('Por favor ingrese el monto de liquidación');
      return;
    }

    if (!confirm('¿Está seguro de liquidar este préstamo? Esta acción no se puede deshacer.')) {
      return;
    }

    this.cargando = true;
    const datos = {
      saldoCapitalPendiente: this.prestamoALiquidar.SaldoPendiente || 0,
      interesesPendientes: 0,
      moraPendiente: 0,
      otrosCargos: 0,
      montoTotalLiquidado: this.montoLiquidacion,
      tipoLiquidacion: 'Anticipada',
      formaPago: 'Transferencia',
      fechaLiquidacion: new Date().toISOString().split('T')[0],
      numeroComprobante: '',
      observaciones: this.observacionesLiquidacion
    };

    this.prestamosService.liquidar(this.prestamoALiquidar.PrestamoID, datos).subscribe({
      next: (response) => {
        alert('✅ Préstamo liquidado exitosamente');
        this.cerrarModalLiquidacion();
        this.cerrarDetalle();
        this.cargarPrestamos();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al liquidar préstamo:', error);
        alert('❌ Error al liquidar el préstamo: ' + (error.error?.mensaje || error.message));
        this.cargando = false;
      }
    });
  }

  // ========================================
  // UTILIDADES
  // ========================================

  get prestamosFiltrados(): Prestamo[] {
    let resultado = [...this.prestamos];

    if (this.filtroBusqueda) {
      const busqueda = this.filtroBusqueda.toLowerCase();
      resultado = resultado.filter(p =>
        p.NombreCompleto?.toLowerCase().includes(busqueda) ||
        p.NumeroDocumento?.includes(busqueda) ||
        p.NumeroContrato?.toLowerCase().includes(busqueda)
      );
    }

    return resultado;
  }

  get prestamosPaginados(): Prestamo[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.prestamosFiltrados.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.prestamosFiltrados.length / this.itemsPorPagina);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  obtenerNombreTrabajador(trabajadorID: number): string {
    const trabajador = this.trabajadores.find(t => t.TrabajadorID === trabajadorID);
    return trabajador ? `${trabajador.ApellidoPaterno} ${trabajador.ApellidoMaterno}, ${trabajador.Nombres}` : 'Desconocido';
  }

  getEstadoClass(estado: string): string {
    const clases: any = {
      'Activo': 'badge-activo',
      'Cancelado': 'badge-cancelado',
      'Liquidado': 'badge-liquidado',
      'Suspendido': 'badge-suspendido'
    };
    return clases[estado] || '';
  }

  getEstadoCuotaClass(estado: string): string {
    if (!estado) return 'badge-pendiente';
    
    // Normalizar el estado (puede venir como "Pagado" o "Pagada")
    const estadoNormalizado = estado.toLowerCase().trim();
    
    const clases: any = {
      'pagada': 'badge-pagada',
      'pagado': 'badge-pagada',
      'pendiente': 'badge-pendiente',
      'vencida': 'badge-vencida',
      'vencido': 'badge-vencida',
      'condonado': 'badge-cancelado',
      'condonada': 'badge-cancelado'
    };
    
    return clases[estadoNormalizado] || 'badge-pendiente';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-PE');
  }

  formatearMonto(monto: number): string {
    return `S/. ${monto.toFixed(2)}`;
  }

  obtenerEntidadesPorTipo(tipo: string): EntidadFinanciera[] {
    if (!tipo) return [];
    const filtradas = this.entidades.filter(e => e.TipoEntidad === tipo);
    console.log(`Filtrando entidades por tipo "${tipo}":`, filtradas.length, 'encontradas');
    return filtradas;
  }
}

