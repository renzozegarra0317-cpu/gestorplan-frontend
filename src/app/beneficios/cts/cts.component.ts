import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CtsService } from './cts.service';
import { 
  RegistroCTS,
  FiltrosCTS,
  ResumenCTS,
  PeriodoCTS,
  ConfiguracionCTS,
  CONFIGURACION_CTS_DEFAULT,
  PERIODOS_CTS,
  ESTADOS_CTS,
  MESES_CTS,
  AREAS_MUNICIPALES_CTS,
  TIPOS_CUENTA_CTS,
  MONEDAS_CTS
} from './cts.interface';

@Component({
  selector: 'app-cts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cts.component.html',
  styleUrls: ['./cts.component.scss']
})
export class CtsComponent implements OnInit {
  // Datos
  registrosCTS: RegistroCTS[] = [];
  registrosFiltrados: RegistroCTS[] = [];
  registroSeleccionado: RegistroCTS | null = null;
  resumen: ResumenCTS | null = null;
  
  // Configuracion
  config: ConfiguracionCTS = { ...CONFIGURACION_CTS_DEFAULT };
  
  // Filtros
  filtros: FiltrosCTS = {
    anio: new Date().getFullYear(),
    periodo: 'Todos',
    estado: 'Todos',
    area: 'Todas',
    busqueda: ''
  };
  
  // Estado
  cargando: boolean = false;
  mostrarModalDetalle: boolean = false;
  mostrarModalCalculo: boolean = false;
  mostrarModalDeposito: boolean = false;
  modoCalculoMasivo: boolean = false;
  
  // Formulario calculo masivo
  periodoCalculoMasivo: PeriodoCTS = 'Mayo';
  anioCalculoMasivo: number = new Date().getFullYear();
  
  // Trabajadores disponibles
  trabajadoresDisponibles: any[] = [];
  trabajadoresSeleccionados: any[] = [];
  
  // Paginacion
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  
  // Catalogos
  periodosCTS = PERIODOS_CTS;
  estadosCTS = ESTADOS_CTS;
  areas = AREAS_MUNICIPALES_CTS;
  tiposCuenta = TIPOS_CUENTA_CTS;
  monedas = MONEDAS_CTS;
  mesesCTS = MESES_CTS;
  anios: number[] = [];

  constructor(
    private router: Router,
    private ctsService: CtsService
  ) {}

  ngOnInit(): void {
    // Resetear scroll al inicio
    window.scrollTo(0, 0);
    setTimeout(() => {
      const mainContent = document.querySelector('.main-content') as HTMLElement;
      if (mainContent) {
        mainContent.scrollTop = 0;
      }
    }, 100);
    
    this.inicializarAnios();
    this.cargarRegistrosCTS();
    this.cargarTrabajadores();
  }

  inicializarAnios(): void {
    const anioActual = new Date().getFullYear();
    for (let i = anioActual; i >= anioActual - 5; i--) {
      this.anios.push(i);
    }
  }

  cargarTrabajadores(): void {
    this.ctsService.obtenerTrabajadoresDisponibles().subscribe({
      next: (response) => {
        if (response.success) {
          // Filtrar solo trabajadores con régimen 728
          this.trabajadoresDisponibles = response.data.filter((trabajador: any) => {
            const regimen = trabajador.regimenLaboral || trabajador.regimen || '';
            // Verificar si el régimen contiene "728" (puede ser "RÉGIMEN DL 728", "DL 728", etc.)
            return regimen.toUpperCase().includes('728');
          });
          console.log('✅ Trabajadores con régimen 728 cargados:', this.trabajadoresDisponibles.length);
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar trabajadores:', error);
        alert('Error al cargar trabajadores');
      }
    });
  }

  cargarRegistrosCTS(): void {
    this.cargando = true;
    
    this.ctsService.listar(this.filtros).subscribe({
      next: (response) => {
        if (response.success) {
          this.registrosCTS = response.data.map((item: any) => ({
            id: item.CTSID,
            codigo: item.Codigo,
            trabajadorId: item.TrabajadorID,
            trabajadorDni: item.TrabajadorDni,
            trabajadorNombre: item.TrabajadorNombre,
            trabajadorCargo: item.TrabajadorCargo,
            trabajadorArea: item.TrabajadorArea,
            periodo: item.Periodo,
            mes: item.Mes,
            anio: item.Anio,
            fechaInicio: item.FechaInicio,
            fechaFin: item.FechaFin,
            mesesCompletos: item.MesesCompletos,
            diasAdicionales: item.DiasAdicionales,
            totalDias: item.TotalDias,
            remuneracionBasica: item.RemuneracionBasica,
            asignacionFamiliar: item.AsignacionFamiliar,
            promedioHorasExtras: item.PromedioHorasExtras,
            promedioComisiones: item.PromedioComisiones,
            promedioBonificaciones: item.PromedioBonificaciones,
            totalRemuneracionComputable: item.TotalRemuneracionComputable,
            gratificacionJulio: item.GratificacionJulio,
            gratificacionDiciembre: item.GratificacionDiciembre,
            promedioGratificaciones: item.PromedioGratificaciones,
            sextoGratificacion: item.SextoGratificacion,
            baseCalculo: item.BaseCalculo,
            montoCTS: item.MontoCTS,
            banco: item.Banco,
            tipoCuenta: item.TipoCuenta,
            numeroCuenta: item.NumeroCuenta,
            moneda: item.Moneda,
            estado: item.Estado,
            fechaCalculo: item.FechaCalculo ? new Date(item.FechaCalculo) : undefined,
            fechaDeposito: item.FechaDeposito ? new Date(item.FechaDeposito) : undefined,
            numeroComprobante: item.NumeroComprobante,
            calculadoPor: item.CalculadoPor,
            depositadoPor: item.DepositadoPor
          }));
          
          console.log('✅ CTS cargados:', this.registrosCTS.length);
          this.cargarResumen();
          this.aplicarFiltros();
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar CTS:', error);
        this.cargando = false;
        alert('Error al cargar registros CTS');
      }
    });
  }
  
  cargarResumen(): void {
    this.ctsService.obtenerResumen(this.filtros.anio).subscribe({
      next: (response) => {
        if (response.success) {
          const data = response.data;
          this.resumen = {
            totalRegistros: data.TotalRegistros || 0,
            totalTrabajadores: data.TotalTrabajadores || 0,
            totalCTSCalculado: data.TotalCTSCalculado || 0,
            totalCTSDepositado: data.TotalCTSDepositado || 0,
            registrosBorrador: data.RegistrosBorrador || 0,
            registrosCalculados: data.RegistrosCalculados || 0,
            registrosAprobados: data.RegistrosAprobados || 0,
            registrosDepositados: data.RegistrosDepositados || 0,
            registrosObservados: 0,
            distribucionPorArea: [],
            promedioMesesServicio: data.PromedioMesesServicio || 0,
            promedioMontoCTS: data.PromedioMontoCTS || 0
          };
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar resumen:', error);
      }
    });
  }

  calcularResumen(): void {
    const totalRegistros = this.registrosCTS.length;
    const trabajadoresUnicos = new Set(this.registrosCTS.map(r => r.trabajadorId));
    const totalTrabajadores = trabajadoresUnicos.size;
    
    const totalCTSCalculado = this.registrosCTS.reduce((sum, r) => sum + r.montoCTS, 0);
    const totalCTSDepositado = this.registrosCTS
      .filter(r => r.estado === 'Depositado')
      .reduce((sum, r) => sum + r.montoCTS, 0);
    
    const registrosBorrador = this.registrosCTS.filter(r => r.estado === 'Borrador').length;
    const registrosCalculados = this.registrosCTS.filter(r => r.estado === 'Calculado').length;
    const registrosAprobados = this.registrosCTS.filter(r => r.estado === 'Aprobado').length;
    const registrosDepositados = this.registrosCTS.filter(r => r.estado === 'Depositado').length;
    const registrosObservados = this.registrosCTS.filter(r => r.estado === 'Observado').length;
    
    const areasUnicas = [...new Set(this.registrosCTS.map(r => r.trabajadorArea))];
    const distribucionPorArea = areasUnicas.map(area => ({
      area,
      cantidad: this.registrosCTS.filter(r => r.trabajadorArea === area).length,
      total: this.registrosCTS.filter(r => r.trabajadorArea === area).reduce((sum, r) => sum + r.montoCTS, 0)
    }));
    
    const promedioMesesServicio = this.registrosCTS.reduce((sum, r) => sum + r.mesesCompletos, 0) / totalRegistros;
    const promedioMontoCTS = totalCTSCalculado / totalRegistros;
    
    this.resumen = {
      totalRegistros,
      totalTrabajadores,
      totalCTSCalculado,
      totalCTSDepositado,
      registrosBorrador,
      registrosCalculados,
      registrosAprobados,
      registrosDepositados,
      registrosObservados,
      distribucionPorArea,
      promedioMesesServicio,
      promedioMontoCTS
    };
  }

  aplicarFiltros(): void {
    let resultado = [...this.registrosCTS];
    
    if (this.filtros.anio) {
      resultado = resultado.filter(r => r.anio === this.filtros.anio);
    }
    
    if (this.filtros.periodo !== 'Todos') {
      resultado = resultado.filter(r => r.periodo === this.filtros.periodo);
    }
    
    if (this.filtros.estado !== 'Todos') {
      resultado = resultado.filter(r => r.estado === this.filtros.estado);
    }
    
    if (this.filtros.area !== 'Todas') {
      resultado = resultado.filter(r => r.trabajadorArea === this.filtros.area);
    }
    
    if (this.filtros.busqueda) {
      const busqueda = this.filtros.busqueda.toLowerCase();
      resultado = resultado.filter(r =>
        r.codigo.toLowerCase().includes(busqueda) ||
        r.trabajadorNombre.toLowerCase().includes(busqueda) ||
        r.trabajadorDni.includes(busqueda)
      );
    }
    
    resultado.sort((a, b) => new Date(b.fechaCalculo || 0).getTime() - new Date(a.fechaCalculo || 0).getTime());
    
    this.registrosFiltrados = resultado;
    this.paginaActual = 1;
  }

  limpiarFiltros(): void {
    this.filtros = {
      anio: new Date().getFullYear(),
      periodo: 'Todos',
      estado: 'Todos',
      area: 'Todas',
      busqueda: ''
    };
    this.aplicarFiltros();
  }

  // ==================== CALCULO CTS ====================
  abrirCalculoMasivo(): void {
    this.modoCalculoMasivo = true;
    this.mostrarModalCalculo = true;
  }

  calcularCTSTrabajador(trabajador: any): RegistroCTS {
    const periodoInfo = MESES_CTS.find(m => m.periodo === this.periodoCalculoMasivo)!;
    
    // Calcular meses y dias de servicio
    const fechaInicio = new Date(`${this.anioCalculoMasivo}-${periodoInfo.fechaInicio}`);
    const fechaFin = new Date(`${this.anioCalculoMasivo}-${periodoInfo.fechaFin}`);
    
    const mesesCompletos = 6; // Siempre 6 meses por periodo
    const diasAdicionales = 0;
    const totalDias = mesesCompletos * 30;
    
    // Remuneracion computable (ultimo mes)
    const remuneracionBasica = trabajador.remuneracionBasica;
    const asignacionFamiliar = trabajador.asignacionFamiliar || 0;
    const promedioHorasExtras = 150; // Simulado
    const totalRemuneracionComputable = remuneracionBasica + asignacionFamiliar + promedioHorasExtras;
    
    // Gratificaciones (simulado - en produccion viene de registros)
    const gratificacionJulio = this.periodoCalculoMasivo === 'Noviembre' ? (remuneracionBasica + asignacionFamiliar) * 1.09 : 0;
    const gratificacionDiciembre = this.periodoCalculoMasivo === 'Mayo' ? (remuneracionBasica + asignacionFamiliar) * 1.09 : 0;
    const promedioGratificaciones = (gratificacionJulio + gratificacionDiciembre) / 2;
    const sextoGratificacion = promedioGratificaciones * this.config.factorGratificacion;
    
    // Base de calculo
    const baseCalculo = totalRemuneracionComputable + sextoGratificacion;
    
    // Monto CTS
    const montoCTS = (baseCalculo * mesesCompletos) / this.config.mesesPorAnio;
    
    const codigo = this.generarCodigoCTS();
    
    return {
      codigo,
      trabajadorId: trabajador.id,
      trabajadorDni: trabajador.dni,
      trabajadorNombre: trabajador.nombre,
      trabajadorCargo: trabajador.cargo,
      trabajadorArea: trabajador.area,
      periodo: this.periodoCalculoMasivo,
      mes: periodoInfo.mes,
      anio: this.anioCalculoMasivo,
      fechaInicio: fechaInicio.toISOString().split('T')[0],
      fechaFin: fechaFin.toISOString().split('T')[0],
      mesesCompletos,
      diasAdicionales,
      totalDias,
      remuneracionBasica,
      asignacionFamiliar,
      promedioHorasExtras,
      promedioComisiones: 0,
      promedioBonificaciones: 0,
      totalRemuneracionComputable: this.redondear(totalRemuneracionComputable),
      gratificacionJulio: this.redondear(gratificacionJulio),
      gratificacionDiciembre: this.redondear(gratificacionDiciembre),
      promedioGratificaciones: this.redondear(promedioGratificaciones),
      sextoGratificacion: this.redondear(sextoGratificacion),
      baseCalculo: this.redondear(baseCalculo),
      montoCTS: this.redondear(montoCTS),
      banco: trabajador.banco,
      tipoCuenta: trabajador.tipoCuenta,
      numeroCuenta: trabajador.numeroCuenta,
      moneda: 'Soles',
      estado: 'Calculado',
      fechaCalculo: new Date(),
      calculadoPor: 'Admin'
    };
  }

  confirmarCalculoMasivo(): void {
    if (this.trabajadoresSeleccionados.length === 0) {
      alert('Seleccione al menos un trabajador');
      return;
    }
    
    const trabajadorIds = this.trabajadoresSeleccionados.map(t => t.id);
    
    this.cargando = true;
    this.ctsService.calcularMasivo({
      trabajadorIds,
      periodo: this.periodoCalculoMasivo,
      anio: this.anioCalculoMasivo
    }).subscribe({
      next: (response) => {
        this.cargando = false;
        if (response.success) {
          alert(`✅ CTS calculado exitosamente para ${response.data.exitosos} trabajadores`);
          this.mostrarModalCalculo = false;
          this.trabajadoresSeleccionados = [];
          this.cargarRegistrosCTS();
        } else {
          alert('Error al calcular CTS');
        }
      },
      error: (error) => {
        this.cargando = false;
        console.error('❌ Error al calcular CTS masivo:', error);
        alert('Error al calcular CTS masivo');
      }
    });
  }

  generarCodigoCTS(): string {
    const periodo = this.periodoCalculoMasivo.substring(0, 3).toUpperCase();
    const anio = this.anioCalculoMasivo;
    const numero = String(this.registrosCTS.length + 1).padStart(3, '0');
    return `CTS-${anio}-${periodo}-${numero}`;
  }

  redondear(valor: number): number {
    return Math.round(valor * 100) / 100;
  }

  // ==================== ACCIONES ====================
  verDetalle(registro: RegistroCTS): void {
    this.registroSeleccionado = registro;
    this.mostrarModalDetalle = true;
  }

  aprobarRegistro(registro: RegistroCTS): void {
    if (confirm(`¿Aprobar el registro CTS de ${registro.trabajadorNombre}?`)) {
      this.ctsService.aprobar(registro.id!).subscribe({
        next: (response) => {
          if (response.success) {
            alert('✅ CTS aprobado correctamente');
            registro.estado = 'Aprobado';
          }
        },
        error: (error) => {
          console.error('❌ Error al aprobar CTS:', error);
          alert('Error al aprobar CTS');
        }
      });
    }
  }

  abrirDeposito(registro: RegistroCTS): void {
    this.registroSeleccionado = registro;
    this.mostrarModalDeposito = true;
  }

  confirmarDeposito(): void {
    if (!this.registroSeleccionado) return;
    
    const numeroComprobante = prompt('Ingrese el número de comprobante:');
    if (!numeroComprobante) return;
    
    this.ctsService.depositar(this.registroSeleccionado.id!, {
      numeroComprobante,
      fechaDeposito: new Date()
    }).subscribe({
      next: (response) => {
        if (response.success) {
          alert('✅ CTS depositado correctamente');
          if (this.registroSeleccionado) {
            this.registroSeleccionado.estado = 'Depositado';
            this.registroSeleccionado.fechaDeposito = new Date();
            this.registroSeleccionado.numeroComprobante = numeroComprobante;
          }
          this.mostrarModalDeposito = false;
        }
      },
      error: (error) => {
        console.error('❌ Error al depositar CTS:', error);
        alert('Error al depositar CTS');
      }
    });
  }

  descargarConstancia(registro: RegistroCTS): void {
    console.log('Descargar constancia CTS:', registro.codigo);
  }

  exportarExcel(): void {
    console.log('Exportar CTS a Excel');
  }

  toggleSeleccionTrabajador(trabajador: any): void {
    const index = this.trabajadoresSeleccionados.findIndex(t => t.id === trabajador.id);
    if (index > -1) {
      this.trabajadoresSeleccionados.splice(index, 1);
    } else {
      this.trabajadoresSeleccionados.push(trabajador);
    }
  }

  estaTrabajadorSeleccionado(trabajador: any): boolean {
    return this.trabajadoresSeleccionados.some(t => t.id === trabajador.id);
  }

  // ==================== PAGINACION ====================
  get registrosPaginados(): RegistroCTS[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.registrosFiltrados.slice(inicio, fin);
  }

  get totalPaginas(): number {
    return Math.ceil(this.registrosFiltrados.length / this.itemsPorPagina);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  // ==================== UTILIDADES ====================
  getEstadoBadgeClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'Borrador': 'badge--borrador',
      'Calculado': 'badge--calculado',
      'Aprobado': 'badge--aprobado',
      'Depositado': 'badge--depositado',
      'Observado': 'badge--observado'
    };
    return clases[estado] || '';
  }

  formatearFecha(fecha: Date | string | undefined): string {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-PE');
  }
}