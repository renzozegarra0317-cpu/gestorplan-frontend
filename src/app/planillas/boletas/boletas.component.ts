import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { BoletasService } from './boletas.service';
import { 
  BoletaPago,
  FiltrosBoletas,
  ResumenBoletas,
  ESTADOS_BOLETA,
  MESES_BOLETAS,
  AREAS_MUNICIPALES,
  TIPOS_CONTRATO_BOLETAS
} from './boletas.interface';

@Component({
  selector: 'app-boletas',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './boletas.component.html',
  styleUrls: ['./boletas.component.scss']
})
export class BoletasComponent implements OnInit {
  // Datos
  boletas: BoletaPago[] = [];
  boletasFiltradas: BoletaPago[] = [];
  boletaSeleccionada: BoletaPago | null = null;
  boletasSeleccionadas: BoletaPago[] = [];
  resumen: ResumenBoletas | null = null;
  
  // Filtros
  filtros: FiltrosBoletas = {
    anio: new Date().getFullYear(),
    mes: 0, // 0 = Todos los meses
    estado: 'Todas',
    busqueda: '',
    area: 'Todas',
    tipoContrato: 'Todos'
  };
  
  // Estado
  cargando: boolean = false;
  mostrarModalDetalle: boolean = false;
  mostrarModalEnvio: boolean = false;
  modoSeleccion: boolean = false;
  
  // Vista
  vistaActual: 'lista' | 'tarjetas' = 'lista';
  
  // Paginacion
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  
  // Catalogos
  estadosBoleta = ESTADOS_BOLETA;
  mesesBoletas = MESES_BOLETAS;
  areas = AREAS_MUNICIPALES;
  tiposContrato = TIPOS_CONTRATO_BOLETAS;
  anios: number[] = [];

  constructor(
    private router: Router,
    private boletasService: BoletasService
  ) {}

  ngOnInit(): void {
    this.inicializarAnios();
    this.cargarBoletas();
  }

  inicializarAnios(): void {
    const anioActual = new Date().getFullYear();
    for (let i = anioActual; i >= anioActual - 2; i--) {
      this.anios.push(i);
    }
  }

  cargarBoletas(): void {
    this.cargando = true;
    
    this.boletasService.obtenerTodas(this.filtros).subscribe({
      next: (response) => {
        if (response.success) {
          // Asegurar que si el estado es "Enviada", la propiedad enviada sea true
          this.boletas = response.data.map(boleta => {
            if (boleta.estado === 'Enviada' && !boleta.enviada) {
              boleta.enviada = true;
            }
            return boleta;
          });
          this.aplicarFiltros(); // Aplicar filtros locales
          this.calcularResumen();
          console.log(`✅ Se cargaron ${this.boletas.length} boletas`);
        } else {
          console.error('❌ Error al cargar boletas:', response);
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar boletas:', error);
        this.cargando = false;
      }
    });
  }

  calcularResumen(): void {
    // Cargar estadísticas del backend
    this.boletasService.obtenerEstadisticas(this.filtros).subscribe({
      next: (response) => {
        if (response.success) {
          this.resumen = response.data;
          console.log('✅ Estadísticas cargadas:', this.resumen);
        } else {
          console.error('❌ Error al cargar estadísticas:', response);
          this.calcularResumenLocal();
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar estadísticas:', error);
        this.calcularResumenLocal();
      }
    });
  }

  calcularResumenLocal(): void {
    const totalBoletas = this.boletas.length;
    const boletasGeneradas = this.boletas.filter(b => b.estado === 'Generada').length;
    const boletasEnviadas = this.boletas.filter(b => b.enviada).length;
    const boletasDescargadas = this.boletas.filter(b => b.descargada).length;
    
    const trabajadoresUnicos = new Set(this.boletas.map(b => b.trabajadorId));
    const totalTrabajadores = trabajadoresUnicos.size;
    
    const totalIngresosPagados = this.boletas.reduce((sum, b) => sum + b.totalIngresos, 0);
    const totalDescuentosAplicados = this.boletas.reduce((sum, b) => sum + b.totalDescuentos, 0);
    const totalNetoPagado = this.boletas.reduce((sum, b) => sum + b.netoAPagar, 0);
    
    const areasUnicas = [...new Set(this.boletas.map(b => b.trabajadorArea))];
    const distribucionPorArea = areasUnicas.map(area => ({
      area,
      cantidad: this.boletas.filter(b => b.trabajadorArea === area).length,
      total: this.boletas.filter(b => b.trabajadorArea === area).reduce((sum, b) => sum + b.netoAPagar, 0)
    }));
    
    this.resumen = {
      totalBoletas,
      boletasGeneradas,
      boletasEnviadas,
      boletasDescargadas,
      totalTrabajadores,
      totalIngresosPagados,
      totalDescuentosAplicados,
      totalNetoPagado,
      distribucionPorArea
    };
  }

  aplicarFiltros(): void {
    // Aplicar filtros locales a los datos ya cargados
    let resultado = [...this.boletas];
    
    console.log('🔍 Aplicando filtros:', this.filtros);
    console.log('📊 Datos originales:', this.boletas.length);
    
    if (this.filtros.anio) {
      resultado = resultado.filter(b => b.anio === this.filtros.anio);
      console.log('📅 Filtro por año:', this.filtros.anio, 'Resultado:', resultado.length);
    }
    
    if (this.filtros.mes && this.filtros.mes !== 0) {
      resultado = resultado.filter(b => b.mes === this.filtros.mes);
      console.log('📅 Filtro por mes:', this.filtros.mes, 'Resultado:', resultado.length);
    }
    
    if (this.filtros.estado !== 'Todas') {
      resultado = resultado.filter(b => b.estado === this.filtros.estado);
      console.log('📊 Filtro por estado:', this.filtros.estado, 'Resultado:', resultado.length);
    }
    
    if (this.filtros.area !== 'Todas') {
      resultado = resultado.filter(b => b.trabajadorArea === this.filtros.area);
      console.log('🏢 Filtro por área:', this.filtros.area, 'Resultado:', resultado.length);
    }
    
    if (this.filtros.busqueda) {
      const busqueda = this.filtros.busqueda.toLowerCase();
      resultado = resultado.filter(b =>
        b.codigo.toLowerCase().includes(busqueda) ||
        b.trabajadorNombre.toLowerCase().includes(busqueda) ||
        b.trabajadorDni.includes(busqueda)
      );
      console.log('🔍 Filtro por búsqueda:', this.filtros.busqueda, 'Resultado:', resultado.length);
    }
    
    this.boletasFiltradas = resultado;
    this.paginaActual = 1;
    
    console.log('✅ Filtros aplicados. Resultado final:', this.boletasFiltradas.length);
  }

  limpiarFiltros(): void {
    this.filtros = {
      anio: new Date().getFullYear(),
      mes: 0, // 0 = Todos los meses
      estado: 'Todas',
      busqueda: '',
      area: 'Todas',
      tipoContrato: 'Todos'
    };
    this.cargarBoletas(); // Recargar datos del backend
  }

  // Método para manejar cambios en filtros que requieren recarga del backend
  onFiltroChange(): void {
    this.cargarBoletas();
  }

  // Método para búsqueda local (no recarga el backend)
  onBusquedaChange(): void {
    this.aplicarFiltros();
  }

  // ==================== ACCIONES ====================
  verDetalle(boleta: BoletaPago): void {
    // Cargar datos completos de la boleta desde el backend
    this.boletasService.obtenerPorId(boleta.id!).subscribe({
      next: (response) => {
        if (response.success) {
          this.boletaSeleccionada = response.data;
          this.mostrarModalDetalle = true;
          console.log('✅ Boleta cargada:', this.boletaSeleccionada);
        } else {
          console.error('❌ Error al cargar boleta:', response);
          this.boletaSeleccionada = boleta;
          this.mostrarModalDetalle = true;
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar boleta:', error);
        this.boletaSeleccionada = boleta;
        this.mostrarModalDetalle = true;
      }
    });
  }

  descargarBoleta(boleta: BoletaPago): void {
    this.boletasService.marcarComoDescargada(boleta.id!).subscribe({
      next: (response) => {
        if (response.success) {
          boleta.descargada = true;
          console.log('✅ Boleta marcada como descargada:', boleta.codigo);
        } else {
          console.error('❌ Error al marcar boleta como descargada:', response);
        }
      },
      error: (error) => {
        console.error('❌ Error al marcar boleta como descargada:', error);
      }
    });
  }

  imprimirBoleta(boleta: BoletaPago): void {
    console.log('Imprimir boleta:', boleta.codigo);
    window.print();
  }

  enviarBoleta(boleta: BoletaPago): void {
    this.boletasService.marcarComoEnviada(boleta.id!).subscribe({
      next: (response) => {
        if (response.success) {
          boleta.enviada = true;
          boleta.estado = 'Enviada';
          console.log('✅ Boleta marcada como enviada:', boleta.codigo);
        } else {
          console.error('❌ Error al marcar boleta como enviada:', response);
        }
      },
      error: (error) => {
        console.error('❌ Error al marcar boleta como enviada:', error);
      }
    });
  }

  enviarTodasLasBoletas(): void {
    if (this.boletasFiltradas.length === 0) {
      alert('No hay boletas para enviar');
      return;
    }

    const confirmar = confirm(
      `¿Está seguro de enviar ${this.boletasFiltradas.length} boleta(s) por correo electrónico a todos los trabajadores?`
    );

    if (!confirmar) {
      return;
    }

    const boletasIds = this.boletasFiltradas.map(b => b.id!);
    
    this.cargando = true;
    this.boletasService.envioMasivo(boletasIds, 'email').subscribe({
      next: (response) => {
        if (response.success) {
          // Marcar todas las boletas como enviadas
          this.boletasFiltradas.forEach(boleta => {
            boleta.enviada = true;
            boleta.estado = 'Enviada';
          });
          
          // Actualizar también en el array principal
          this.boletas.forEach(boleta => {
            const boletaFiltrada = this.boletasFiltradas.find(b => b.id === boleta.id);
            if (boletaFiltrada) {
              boleta.enviada = true;
              boleta.estado = 'Enviada';
            }
          });
          
          alert(`✅ Se enviaron ${this.boletasFiltradas.length} boleta(s) por correo electrónico exitosamente`);
          console.log('✅ Envío masivo completado:', response.data);
          
          // Actualizar resumen
          this.calcularResumen();
        } else {
          console.error('❌ Error en envío masivo:', response);
          alert('❌ Error al enviar las boletas. Por favor, intente nuevamente.');
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error en envío masivo:', error);
        alert('❌ Error al enviar las boletas. Por favor, intente nuevamente.');
        this.cargando = false;
      }
    });
  }

  toggleSeleccion(boleta: BoletaPago): void {
    const index = this.boletasSeleccionadas.findIndex(b => b.id === boleta.id);
    if (index > -1) {
      this.boletasSeleccionadas.splice(index, 1);
    } else {
      this.boletasSeleccionadas.push(boleta);
    }
  }

  estaSeleccionada(boleta: BoletaPago): boolean {
    return this.boletasSeleccionadas.some(b => b.id === boleta.id);
  }

  seleccionarTodas(): void {
    this.boletasSeleccionadas = [...this.boletasPaginadas];
  }

  deseleccionarTodas(): void {
    this.boletasSeleccionadas = [];
  }

  abrirEnvioMasivo(): void {
    if (this.boletasSeleccionadas.length === 0) {
      alert('Seleccione al menos una boleta');
      return;
    }
    this.mostrarModalEnvio = true;
  }

  confirmarEnvioMasivo(): void {
    const boletasIds = this.boletasSeleccionadas.map(b => b.id!);
    
    this.boletasService.envioMasivo(boletasIds, 'email').subscribe({
      next: (response) => {
        if (response.success) {
          this.boletasSeleccionadas.forEach(boleta => {
            boleta.enviada = true;
            boleta.estado = 'Enviada';
          });
          console.log('✅ Envío masivo completado:', response.data);
        } else {
          console.error('❌ Error en envío masivo:', response);
        }
        this.mostrarModalEnvio = false;
        this.boletasSeleccionadas = [];
        this.modoSeleccion = false;
      },
      error: (error) => {
        console.error('❌ Error en envío masivo:', error);
        this.mostrarModalEnvio = false;
        this.boletasSeleccionadas = [];
        this.modoSeleccion = false;
      }
    });
  }

  descargarMasivo(): void {
    if (this.boletasSeleccionadas.length === 0) {
      alert('Seleccione al menos una boleta');
      return;
    }
    console.log('Descargar ZIP con boletas:', this.boletasSeleccionadas.length);
  }

  exportarExcel(): void {
    this.boletasService.exportarExcel(this.filtros).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('✅ Exportación iniciada:', response.data);
          // Aquí se descargaría el archivo Excel
        } else {
          console.error('❌ Error al exportar boletas:', response);
        }
      },
      error: (error) => {
        console.error('❌ Error al exportar boletas:', error);
      }
    });
  }

  // ==================== PAGINACION ====================
  get boletasPaginadas(): BoletaPago[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.boletasFiltradas.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.boletasFiltradas.length / this.itemsPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  // ==================== UTILIDADES ====================
  getEstadoBadgeClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'Generada': 'badge--generada',
      'Aprobada': 'badge--aprobada',
      'Pagada': 'badge--pagada',
      'Enviada': 'badge--enviada',
      'Descargada': 'badge--descargada',
      'Observada': 'badge--observada',
      'Anulada': 'badge--anulada'
    };
    return clases[estado] || '';
  }

  formatearFecha(fecha: Date | undefined): string {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-PE');
  }

  get nombreMesFiltro(): string {
    if (!this.filtros.mes || this.filtros.mes === 0) return 'Todos los meses';
    return MESES_BOLETAS.find(m => m.valor === this.filtros.mes)?.nombre || '';
  }
}