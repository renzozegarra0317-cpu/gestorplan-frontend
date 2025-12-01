import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  RegistroUtilidades,
  FiltrosUtilidades,
  ResumenUtilidades,
  ConfiguracionUtilidades,
  DescuentoUtilidades,
  CONFIGURACION_UTILIDADES_DEFAULT,
  ESTADOS_UTILIDADES,
  AREAS_MUNICIPALES_UTIL,
  PERIODOS_FISCALES_DISPONIBLES
} from './utilidades.interface';

@Component({
  selector: 'app-utilidades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './utilidades.component.html',
  styleUrls: ['./utilidades.component.scss']
})
export class UtilidadesComponent implements OnInit {
  // Datos
  registrosUtilidades: RegistroUtilidades[] = [];
  registrosFiltrados: RegistroUtilidades[] = [];
  registroSeleccionado: RegistroUtilidades | null = null;
  resumen: ResumenUtilidades | null = null;
  
  // Configuracion
  config: ConfiguracionUtilidades = { ...CONFIGURACION_UTILIDADES_DEFAULT };
  
  // Filtros
  filtros: FiltrosUtilidades = {
    periodoFiscal: new Date().getFullYear() - 1,
    estado: 'Todos',
    area: 'Todas',
    busqueda: ''
  };
  
  // Estado
  cargando: boolean = false;
  mostrarModalDetalle: boolean = false;
  mostrarModalCalculo: boolean = false;
  mostrarModalPago: boolean = false;
  modoCalculoMasivo: boolean = false;
  
  // Formulario calculo masivo
  periodoCalculoMasivo: number = new Date().getFullYear() - 1;
  utilidadEmpresa: number = 0;
  
  // Trabajadores disponibles
  trabajadoresDisponibles: any[] = [];
  trabajadoresSeleccionados: any[] = [];
  
  // Paginacion
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  
  // Catalogos
  estadosUtilidades = ESTADOS_UTILIDADES;
  areas = AREAS_MUNICIPALES_UTIL;
  periodosFiscales = PERIODOS_FISCALES_DISPONIBLES;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Resetear scroll al inicio
    window.scrollTo(0, 0);
    setTimeout(() => {
      const mainContent = document.querySelector('.main-content') as HTMLElement;
      if (mainContent) {
        mainContent.scrollTop = 0;
      }
    }, 100);
    
    this.cargarRegistrosUtilidades();
    this.cargarTrabajadores();
  }

  cargarTrabajadores(): void {
    // Simulacion de trabajadores
    this.trabajadoresDisponibles = [
      {
        id: 1,
        dni: '43256789',
        nombre: 'Garcia Rodriguez, Carlos Alberto',
        cargo: 'Gerente Municipal',
        area: 'Gerencia Municipal',
        fechaIngreso: new Date('2020-01-15'),
        diasTrabajados: 360,
        remuneracionPromedio: 8500.00,
        banco: 'Banco de la Nacion',
        numeroCuenta: '04-123-456789'
      },
      {
        id: 2,
        dni: '41234567',
        nombre: 'Mendoza Torres, Maria Elena',
        cargo: 'Especialista en RRHH',
        area: 'Oficina de Recursos Humanos',
        fechaIngreso: new Date('2019-03-10'),
        diasTrabajados: 360,
        remuneracionPromedio: 4500.00,
        banco: 'Banco de la Nacion',
        numeroCuenta: '04-123-456790'
      },
      {
        id: 3,
        dni: '40123456',
        nombre: 'Ramirez Lopez, Juan Carlos',
        cargo: 'Contador',
        area: 'Oficina de Administracion',
        fechaIngreso: new Date('2024-07-01'),
        diasTrabajados: 180,
        remuneracionPromedio: 5200.00,
        banco: 'BCP',
        numeroCuenta: '191-12345678-0-99'
      }
    ];
  }

  cargarRegistrosUtilidades(): void {
    this.cargando = true;
    
    setTimeout(() => {
      this.registrosUtilidades = [
        {
          id: 1,
          codigo: 'UTIL-2024-001',
          trabajadorId: 1,
          trabajadorDni: '43256789',
          trabajadorNombre: 'Garcia Rodriguez, Carlos Alberto',
          trabajadorCargo: 'Gerente Municipal',
          trabajadorArea: 'Gerencia Municipal',
          periodoFiscal: 2024,
          fechaInicio: new Date('2024-01-01'),
          fechaFin: new Date('2024-12-31'),
          diasTrabajados: 360,
          diasHabiles: 360,
          porcentajeDias: 100,
          remuneracionPromedio: 8500.00,
          totalRemuneracionAnual: 102000.00,
          montoPorDias: 2500.00,
          montoPorRemuneracion: 3200.00,
          totalUtilidades: 5700.00,
          utilidadEmpresa: 500000.00,
          porcentajeDistribucion: 10,
          descuentos: [
            { codigo: 'RENTA', nombre: 'Renta 5ta', tipo: 'Renta5ta', monto: 285.00, porcentaje: 5 }
          ],
          totalDescuentos: 285.00,
          netoAPagar: 5415.00,
          banco: 'Banco de la Nacion',
          numeroCuenta: '04-123-456789',
          estado: 'Pagado',
          fechaCalculo: new Date('2025-03-01'),
          fechaAprobacion: new Date('2025-03-05'),
          fechaPago: new Date('2025-03-15'),
          calculadoPor: 'Admin',
          aprobadoPor: 'Gerente RRHH'
        },
        {
          id: 2,
          codigo: 'UTIL-2024-002',
          trabajadorId: 2,
          trabajadorDni: '41234567',
          trabajadorNombre: 'Mendoza Torres, Maria Elena',
          trabajadorCargo: 'Especialista en RRHH',
          trabajadorArea: 'Oficina de Recursos Humanos',
          periodoFiscal: 2024,
          fechaInicio: new Date('2024-01-01'),
          fechaFin: new Date('2024-12-31'),
          diasTrabajados: 360,
          diasHabiles: 360,
          porcentajeDias: 100,
          remuneracionPromedio: 4500.00,
          totalRemuneracionAnual: 54000.00,
          montoPorDias: 2500.00,
          montoPorRemuneracion: 1692.31,
          totalUtilidades: 4192.31,
          utilidadEmpresa: 500000.00,
          porcentajeDistribucion: 10,
          descuentos: [
            { codigo: 'RENTA', nombre: 'Renta 5ta', tipo: 'Renta5ta', monto: 209.62, porcentaje: 5 }
          ],
          totalDescuentos: 209.62,
          netoAPagar: 3982.69,
          banco: 'Banco de la Nacion',
          numeroCuenta: '04-123-456790',
          estado: 'Aprobado',
          fechaCalculo: new Date('2025-03-01'),
          fechaAprobacion: new Date('2025-03-05'),
          calculadoPor: 'Admin',
          aprobadoPor: 'Gerente RRHH'
        },
        {
          id: 3,
          codigo: 'UTIL-2024-003',
          trabajadorId: 3,
          trabajadorDni: '40123456',
          trabajadorNombre: 'Ramirez Lopez, Juan Carlos',
          trabajadorCargo: 'Contador',
          trabajadorArea: 'Oficina de Administracion',
          periodoFiscal: 2024,
          fechaInicio: new Date('2024-07-01'),
          fechaFin: new Date('2024-12-31'),
          diasTrabajados: 180,
          diasHabiles: 180,
          porcentajeDias: 50,
          remuneracionPromedio: 5200.00,
          totalRemuneracionAnual: 31200.00,
          montoPorDias: 1250.00,
          montoPorRemuneracion: 977.78,
          totalUtilidades: 2227.78,
          utilidadEmpresa: 500000.00,
          porcentajeDistribucion: 10,
          descuentos: [
            { codigo: 'RENTA', nombre: 'Renta 5ta', tipo: 'Renta5ta', monto: 111.39, porcentaje: 5 }
          ],
          totalDescuentos: 111.39,
          netoAPagar: 2116.39,
          banco: 'BCP',
          numeroCuenta: '191-12345678-0-99',
          estado: 'Calculado',
          fechaCalculo: new Date('2025-03-01'),
          calculadoPor: 'Admin'
        }
      ];
      
      this.calcularResumen();
      this.aplicarFiltros();
      this.cargando = false;
    }, 800);
  }

  calcularResumen(): void {
    const totalRegistros = this.registrosUtilidades.length;
    const trabajadoresUnicos = new Set(this.registrosUtilidades.map(r => r.trabajadorId));
    const totalTrabajadores = trabajadoresUnicos.size;
    
    const utilidadEmpresaTotal = this.registrosUtilidades.length > 0 ? this.registrosUtilidades[0].utilidadEmpresa : 0;
    const totalUtilidadesCalculadas = this.registrosUtilidades.reduce((sum, r) => sum + r.totalUtilidades, 0);
    const totalDescuentos = this.registrosUtilidades.reduce((sum, r) => sum + r.totalDescuentos, 0);
    const totalNetoPagado = this.registrosUtilidades
      .filter(r => r.estado === 'Pagado')
      .reduce((sum, r) => sum + r.netoAPagar, 0);
    
    const registrosPendientes = this.registrosUtilidades.filter(r => r.estado === 'Pendiente').length;
    const registrosCalculados = this.registrosUtilidades.filter(r => r.estado === 'Calculado').length;
    const registrosAprobados = this.registrosUtilidades.filter(r => r.estado === 'Aprobado').length;
    const registrosPagados = this.registrosUtilidades.filter(r => r.estado === 'Pagado').length;
    const registrosObservados = this.registrosUtilidades.filter(r => r.estado === 'Observado').length;
    
    const areasUnicas = [...new Set(this.registrosUtilidades.map(r => r.trabajadorArea))];
    const distribucionPorArea = areasUnicas.map(area => ({
      area,
      cantidad: this.registrosUtilidades.filter(r => r.trabajadorArea === area).length,
      total: this.registrosUtilidades.filter(r => r.trabajadorArea === area).reduce((sum, r) => sum + r.totalUtilidades, 0)
    }));
    
    const promedioDiasTrabajados = this.registrosUtilidades.reduce((sum, r) => sum + r.diasTrabajados, 0) / totalRegistros;
    const promedioUtilidades = totalUtilidadesCalculadas / totalRegistros;
    
    this.resumen = {
      totalRegistros,
      totalTrabajadores,
      utilidadEmpresaTotal,
      totalUtilidadesCalculadas,
      totalDescuentos,
      totalNetoPagado,
      registrosPendientes,
      registrosCalculados,
      registrosAprobados,
      registrosPagados,
      registrosObservados,
      distribucionPorArea,
      promedioDiasTrabajados,
      promedioUtilidades
    };
  }

  aplicarFiltros(): void {
    let resultado = [...this.registrosUtilidades];
    
    if (this.filtros.periodoFiscal) {
      resultado = resultado.filter(r => r.periodoFiscal === this.filtros.periodoFiscal);
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
      periodoFiscal: new Date().getFullYear() - 1,
      estado: 'Todos',
      area: 'Todas',
      busqueda: ''
    };
    this.aplicarFiltros();
  }

  // ==================== CALCULO UTILIDADES ====================
  abrirCalculoMasivo(): void {
    this.modoCalculoMasivo = true;
    this.mostrarModalCalculo = true;
  }

  calcularUtilidadesTrabajador(trabajador: any): RegistroUtilidades {
    const montoDistribuible = this.utilidadEmpresa * (this.config.porcentajeDistribucionTrabajadores / 100);
    
    // Calcular totales
    const totalDiasTrabajados = this.trabajadoresSeleccionados.reduce((sum, t) => sum + t.diasTrabajados, 0);
    const totalRemuneracionAnual = this.trabajadoresSeleccionados.reduce((sum, t) => sum + (t.remuneracionPromedio * 12), 0);
    
    // Calcular factores
    const factorDias = (trabajador.diasTrabajados / totalDiasTrabajados);
    const factorRemuneracion = ((trabajador.remuneracionPromedio * 12) / totalRemuneracionAnual);
    
    // Monto por días (50%)
    const montoPorDias = this.redondear((montoDistribuible * 0.5) * factorDias);
    
    // Monto por remuneración (50%)
    const montoPorRemuneracion = this.redondear((montoDistribuible * 0.5) * factorRemuneracion);
    
    // Total utilidades
    const totalUtilidades = this.redondear(montoPorDias + montoPorRemuneracion);
    
    // Calcular descuentos
    const descuentos = this.calcularDescuentos(totalUtilidades);
    const totalDescuentos = descuentos.reduce((sum, d) => sum + d.monto, 0);
    
    // Neto a pagar
    const netoAPagar = this.redondear(totalUtilidades - totalDescuentos);
    
    const codigo = this.generarCodigoUtilidades();
    
    return {
      codigo,
      trabajadorId: trabajador.id,
      trabajadorDni: trabajador.dni,
      trabajadorNombre: trabajador.nombre,
      trabajadorCargo: trabajador.cargo,
      trabajadorArea: trabajador.area,
      periodoFiscal: this.periodoCalculoMasivo,
      fechaInicio: new Date(`${this.periodoCalculoMasivo}-01-01`),
      fechaFin: new Date(`${this.periodoCalculoMasivo}-12-31`),
      diasTrabajados: trabajador.diasTrabajados,
      diasHabiles: 360,
      porcentajeDias: this.redondear((trabajador.diasTrabajados / 360) * 100),
      remuneracionPromedio: trabajador.remuneracionPromedio,
      totalRemuneracionAnual: this.redondear(trabajador.remuneracionPromedio * 12),
      montoPorDias,
      montoPorRemuneracion,
      totalUtilidades,
      utilidadEmpresa: this.utilidadEmpresa,
      porcentajeDistribucion: this.config.porcentajeDistribucionTrabajadores,
      descuentos,
      totalDescuentos: this.redondear(totalDescuentos),
      netoAPagar,
      banco: trabajador.banco,
      numeroCuenta: trabajador.numeroCuenta,
      estado: 'Calculado',
      fechaCalculo: new Date(),
      calculadoPor: 'Admin'
    };
  }

  calcularDescuentos(totalUtilidades: number): DescuentoUtilidades[] {
    const descuentos: DescuentoUtilidades[] = [];
    
    if (this.config.aplicarRenta5ta) {
      // Renta 5ta simplificado (5% del total)
      const renta5ta = this.redondear(totalUtilidades * 0.05);
      descuentos.push({
        codigo: 'RENTA',
        nombre: 'Renta 5ta',
        tipo: 'Renta5ta',
        monto: renta5ta,
        porcentaje: 5
      });
    }
    
    return descuentos;
  }

  confirmarCalculoMasivo(): void {
    if (this.trabajadoresSeleccionados.length === 0) {
      alert('Seleccione al menos un trabajador');
      return;
    }
    
    if (!this.utilidadEmpresa || this.utilidadEmpresa <= 0) {
      alert('Ingrese la utilidad de la empresa');
      return;
    }
    
    this.trabajadoresSeleccionados.forEach(trabajador => {
      const registroUtilidades = this.calcularUtilidadesTrabajador(trabajador);
      this.registrosUtilidades.push(registroUtilidades);
    });
    
    this.calcularResumen();
    this.aplicarFiltros();
    this.mostrarModalCalculo = false;
    this.trabajadoresSeleccionados = [];
    this.utilidadEmpresa = 0;
    console.log('Utilidades calculadas para', this.trabajadoresSeleccionados.length, 'trabajadores');
  }

  generarCodigoUtilidades(): string {
    const periodo = this.periodoCalculoMasivo;
    const numero = String(this.registrosUtilidades.length + 1).padStart(3, '0');
    return `UTIL-${periodo}-${numero}`;
  }

  redondear(valor: number): number {
    return Math.round(valor * 100) / 100;
  }

  // ==================== ACCIONES ====================
  verDetalle(registro: RegistroUtilidades): void {
    this.registroSeleccionado = registro;
    this.mostrarModalDetalle = true;
  }

  aprobarRegistro(registro: RegistroUtilidades): void {
    if (confirm(`¿Aprobar las utilidades de ${registro.trabajadorNombre}?`)) {
      registro.estado = 'Aprobado';
      registro.fechaAprobacion = new Date();
      registro.aprobadoPor = 'Admin';
      console.log('Registro aprobado:', registro.codigo);
    }
  }

  abrirPago(registro: RegistroUtilidades): void {
    this.registroSeleccionado = registro;
    this.mostrarModalPago = true;
  }

  confirmarPago(): void {
    if (this.registroSeleccionado) {
      this.registroSeleccionado.estado = 'Pagado';
      this.registroSeleccionado.fechaPago = new Date();
      this.mostrarModalPago = false;
      console.log('Pago confirmado:', this.registroSeleccionado.codigo);
    }
  }

  descargarConstancia(registro: RegistroUtilidades): void {
    console.log('Descargar constancia de utilidades:', registro.codigo);
  }

  exportarExcel(): void {
    console.log('Exportar utilidades a Excel');
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
  get registrosPaginados(): RegistroUtilidades[] {
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
      'Pendiente': 'badge--pendiente',
      'Calculado': 'badge--calculado',
      'Aprobado': 'badge--aprobado',
      'Pagado': 'badge--pagado',
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