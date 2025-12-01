import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { 
  ResumenMensualTrabajador, 
  ResumenGeneralMensual, 
  FiltrosResumen, 
  DetalleDiario,
  GraficoAsistencia,
  MESES 
} from './resumen.interface';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resumen.component.html',
  styleUrls: ['./resumen.component.scss']
})
export class ResumenComponent implements OnInit, OnDestroy, AfterViewInit {
  // API URLs
  private apiAsistencias = 'http://localhost:5000/api/asistencias';
  
  // Datos del backend
  resumenMensual: any = null;
  trabajadoresDestacados: any[] = [];
  trabajadoresAlerta: any[] = [];
  trabajadoresDetalle: any[] = [];
  trabajadoresFiltrados: any[] = [];
  
  // Inicializar arrays vacíos para evitar errores
  ngOnInit(): void {
    // Resetear scroll al inicio
    window.scrollTo(0, 0);
    setTimeout(() => {
      const mainContent = document.querySelector('.main-content') as HTMLElement;
      if (mainContent) {
        mainContent.scrollTop = 0;
      }
    }, 100);
    
    this.trabajadoresDestacados = [];
    this.trabajadoresAlerta = [];
    this.trabajadoresDetalle = [];
    this.trabajadoresFiltrados = [];
    this.inicializarAnios();
    this.cargarResumen();
  }
  
  ngAfterViewInit(): void {
    // Los gráficos se inicializan cuando se cambia a la vista de gráficos
  }
  
  ngOnDestroy(): void {
    // Destruir todos los gráficos al salir del componente
    Object.keys(this.charts).forEach(key => {
      if (this.charts[key]) {
        this.charts[key]?.destroy();
        this.charts[key] = null;
      }
    });
  }
  
  // Filtros
  filtros: FiltrosResumen = {
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear(),
    area: '',
    ordenarPor: 'nombre',
    busqueda: ''
  };
  
  // Estado
  cargando: boolean = false;
  vistaActual: 'resumen' | 'detalle' | 'grafico' = 'resumen';
  trabajadorSeleccionado: any = null;
  trabajadorSeleccionadoIndex: number = -1;
  mostrarModalDetalle: boolean = false;
  
  // Gráficos
  charts: { [key: string]: Chart | null } = {};
  
  // Catálogos
  meses = MESES;
  anios: number[] = [];
  areas: string[] = [
    'Gerencia Municipal',
    'Oficina de Recursos Humanos',
    'Oficina de Administración',
    'Gerencia de Desarrollo Social',
    'Gerencia de Infraestructura',
    'Serenazgo',
    'Registro Civil'
  ];

  constructor(private router: Router, private http: HttpClient) {}

  inicializarAnios(): void {
    const anioActual = new Date().getFullYear();
    for (let i = anioActual; i >= anioActual - 5; i--) {
      this.anios.push(i);
    }
  }

  cargarResumen(): void {
    this.cargando = true;
    
    console.log('📊 Cargando resumen mensual para:', this.filtros.anio, this.filtros.mes);
    
    // Cargar datos del backend
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.http.get(`${this.apiAsistencias}/resumen-mensual/${this.filtros.anio}/${this.filtros.mes}`, { headers }).subscribe({
      next: (response: any) => {
        console.log('✅ Resumen mensual cargado:', response.data);
        // Si estamos en modo DEMO, forzar todo vacío/0
        if (response.demoMode) {
          this.resumenMensual = {
            periodo: { anio: this.filtros.anio, mes: this.filtros.mes, diasHabiles: 0 },
            totales: { totalTrabajadores: 0, presentes: 0, tardanzas: 0, faltas: 0, permisos: 0, licencias: 0, porcentajeAsistencia: 0 },
            trabajadoresDetalle: [],
            trabajadoresDestacados: [],
            trabajadoresAlerta: []
          };
          this.trabajadoresDestacados = [];
          this.trabajadoresAlerta = [];
          this.trabajadoresDetalle = [];
          this.trabajadoresFiltrados = [];
        } else {
          this.resumenMensual = response.data;
          this.trabajadoresDestacados = response.data.trabajadoresDestacados || [];
          this.trabajadoresAlerta = response.data.trabajadoresAlerta || [];
          this.trabajadoresDetalle = response.data.trabajadoresDetalle || [];
          this.trabajadoresFiltrados = [...this.trabajadoresDetalle];
        }
        this.cargando = false;
        console.log('📊 Trabajadores cargados:', this.trabajadoresDetalle.length);
        console.log('🌟 Destacados:', this.trabajadoresDestacados.length);
        console.log('⚠️ Alerta:', this.trabajadoresAlerta.length);
        console.log('📋 Detalle completo:', this.trabajadoresDetalle);
        
        // Actualizar gráficos si estamos en la vista de gráficos
        if (this.vistaActual === 'grafico') {
          setTimeout(() => this.inicializarGraficos(), 100);
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar resumen mensual:', error);
        this.cargando = false;
        // Cargar datos de ejemplo en caso de error
        this.cargarDatosEjemplo();
      }
    });
  }
  
  cargarDatosEjemplo(): void {
    // Datos de ejemplo para desarrollo
    this.resumenMensual = {
      periodo: {
        anio: this.filtros.anio,
        mes: this.filtros.mes,
        diasHabiles: 22
      },
      estadisticas: {
        totalTrabajadores: 5,
        promedioAsistencia: 96.36,
        promedioPuntualidad: 89.09,
        totalTardanzas: 6,
        totalFaltas: 4
      }
    };
    
    this.trabajadoresDestacados = [
      {
        id: 1,
        dni: '43256789',
        nombreCompleto: 'García Rodríguez, Carlos Alberto',
        cargo: 'Gerente Municipal',
        area: 'Gerencia Municipal',
        porcentajeAsistencia: 100,
        porcentajePuntualidad: 90.91,
        promedioHorasTrabajadas: 8.5
      },
      {
        id: 2,
        dni: '12345678',
        nombreCompleto: 'Ramírez López, Juan Carlos',
        cargo: 'Contador',
        area: 'Oficina de Administración',
        porcentajeAsistencia: 100,
        porcentajePuntualidad: 100,
        promedioHorasTrabajadas: 8.0
      },
      {
        id: 3,
        dni: '42345678',
        nombreCompleto: 'Vásquez Ruiz, Roberto Miguel',
        cargo: 'Inspector de Obra',
        area: 'Gerencia de Infraestructura',
        porcentajeAsistencia: 100,
        porcentajePuntualidad: 100,
        promedioHorasTrabajadas: 8.0
      }
    ];
    
    this.trabajadoresAlerta = [
      {
        id: 4,
        dni: '98765432',
        nombreCompleto: 'Fernández Silva, Ana Patricia',
        cargo: 'Asistente Administrativo',
        area: 'Oficina de Recursos Humanos',
        porcentajeAsistencia: 86.36,
        diasFalta: 3,
        diasTardanza: 1,
        promedioHorasTrabajadas: 7.2
      }
    ];
    
    this.trabajadoresDetalle = [
      {
        id: 1,
        dni: '43256789',
        nombreCompleto: 'García Rodríguez, Carlos Alberto',
        cargo: 'Gerente Municipal',
        area: 'Gerencia Municipal',
        diasHabiles: 22,
        diasPresente: 20,
        diasTardanza: 2,
        diasFalta: 0,
        porcentajeAsistencia: 100,
        porcentajePuntualidad: 90.91,
        totalHorasTrabajadas: 176.5
      },
      {
        id: 2,
        dni: '12345678',
        nombreCompleto: 'Ramírez López, Juan Carlos',
        cargo: 'Contador',
        area: 'Oficina de Administración',
        diasHabiles: 22,
        diasPresente: 22,
        diasTardanza: 0,
        diasFalta: 0,
        porcentajeAsistencia: 100,
        porcentajePuntualidad: 100,
        totalHorasTrabajadas: 176
      }
    ];
    
    this.trabajadoresFiltrados = [...this.trabajadoresDetalle];
  }

  // =====================================================
  // MÉTODOS DE NAVEGACIÓN
  // =====================================================
  cambiarPeriodo(): void {
    console.log('📅 Cambiando período a:', this.filtros.anio, this.filtros.mes);
    
    // Guardar referencia del trabajador seleccionado antes de limpiar
    const trabajadorIdTemporal = this.trabajadorSeleccionado?.id || this.trabajadorSeleccionado?.TrabajadorID;
    const trabajadorIndexTemporal = this.trabajadorSeleccionadoIndex;
    
    // Limpiar datos anteriores antes de cargar nuevos
    if (this.trabajadorSeleccionado) {
      this.trabajadorSeleccionado.detallesDiarios = [];
    }
    
    // Cargar resumen del nuevo período
    this.cargarResumen();
    
    // Actualizar gráficos si estamos en la vista de gráficos
    if (this.vistaActual === 'grafico') {
      setTimeout(() => this.inicializarGraficos(), 300);
    }
    
    // Si hay un trabajador seleccionado, recargar sus detalles para el nuevo mes
    // Usar setTimeout para asegurar que cargarResumen haya terminado
    setTimeout(() => {
      // Restaurar la selección del trabajador si existía
      if (trabajadorIdTemporal && trabajadorIndexTemporal >= 0) {
        // Buscar el trabajador en la nueva lista
        const trabajadorEncontrado = this.resumenTrabajadoresFiltrados.find(t => 
          (t.id || t.TrabajadorID) === trabajadorIdTemporal
        );
        
        if (trabajadorEncontrado) {
          this.trabajadorSeleccionado = trabajadorEncontrado;
          // Actualizar el índice
          const nuevoIndex = this.resumenTrabajadoresFiltrados.indexOf(trabajadorEncontrado);
          if (nuevoIndex >= 0) {
            this.trabajadorSeleccionadoIndex = nuevoIndex;
          }
          
          console.log('📅 Recargando detalles del trabajador seleccionado para el nuevo período');
          // Asegurar que los detalles estén limpios
          this.trabajadorSeleccionado.detallesDiarios = [];
          // Recargar los detalles con el nuevo mes
          this.cargarDetallesDiarios();
        }
      }
    }, 500); // Aumentar el tiempo para asegurar que cargarResumen termine
  }
  
  irMesAnterior(): void {
    if (this.filtros.mes > 1) {
      this.filtros.mes--;
    } else {
      this.filtros.mes = 12;
      this.filtros.anio--;
    }
    this.cambiarPeriodo();
  }
  
  irMesSiguiente(): void {
    if (this.filtros.mes < 12) {
      this.filtros.mes++;
    } else {
      this.filtros.mes = 1;
      this.filtros.anio++;
    }
    this.cambiarPeriodo();
  }
  
  irMesActual(): void {
    const hoy = new Date();
    this.filtros.mes = hoy.getMonth() + 1;
    this.filtros.anio = hoy.getFullYear();
    this.cambiarPeriodo();
  }
  
  // =====================================================
  // MÉTODOS DE VISTA
  // =====================================================
  cambiarVista(vista: 'resumen' | 'detalle' | 'grafico'): void {
    this.vistaActual = vista;
    if (vista === 'grafico') {
      // Esperar a que Angular renderice el DOM antes de inicializar los gráficos
      setTimeout(() => {
        console.log('📊 Inicializando gráficos...');
        this.inicializarGraficos();
      }, 300);
    }
  }
  
  // =====================================================
  // MÉTODOS DE TRABAJADORES
  // =====================================================
  verDetalleTrabajador(trabajador: any): void {
    // Normalizar campos del trabajador para el modal
    this.trabajadorSeleccionado = {
      ...trabajador,
      // Normalizar nombres de campos
      trabajadorNombre: trabajador.trabajadorNombre || trabajador.nombreCompleto || 'Sin nombre',
      trabajadorDni: trabajador.trabajadorDni || trabajador.dni || 'N/A',
      trabajadorCargo: trabajador.trabajadorCargo || trabajador.cargo || 'Sin cargo',
      trabajadorArea: trabajador.trabajadorArea || trabajador.area || 'Sin área',
      // Asegurar que tenemos el ID
      id: trabajador.id || trabajador.trabajadorId || trabajador.TrabajadorID,
      // Asegurar estadísticas
      diasPresente: trabajador.diasPresente || 0,
      diasTardanza: trabajador.diasTardanza || 0,
      diasFalta: trabajador.diasFalta || 0,
      porcentajeAsistencia: trabajador.porcentajeAsistencia || 0,
      porcentajePuntualidad: trabajador.porcentajePuntualidad || 0,
      totalHorasTrabajadas: trabajador.totalHorasTrabajadas || 0,
      // Inicializar detalles diarios vacío
      detallesDiarios: trabajador.detallesDiarios || []
    };
    
    console.log('👁️ Trabajador seleccionado para modal:', this.trabajadorSeleccionado);
    this.mostrarModalDetalle = true;
    
    // Cargar detalles diarios del trabajador seleccionado
    setTimeout(() => {
      this.cargarDetallesDiarios();
    }, 100);
  }
  
  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.trabajadorSeleccionado = null;
    
    // CRÍTICO: Restaurar z-index del topbar y sidebar cuando el modal se cierra
    setTimeout(() => {
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      
      const topbar = document.querySelector('app-topbar');
      if (topbar) {
        (topbar as HTMLElement).style.setProperty('z-index', '100000', 'important');
        (topbar as HTMLElement).style.setProperty('pointer-events', 'auto', 'important');
        (topbar as HTMLElement).style.setProperty('visibility', 'visible', 'important');
        
        const topbarElement = topbar.querySelector('.topbar');
        if (topbarElement) {
          (topbarElement as HTMLElement).style.setProperty('z-index', '100000', 'important');
          (topbarElement as HTMLElement).style.setProperty('pointer-events', 'auto', 'important');
          (topbarElement as HTMLElement).style.setProperty('visibility', 'visible', 'important');
        }
      }
      
      const sidebar = document.querySelector('app-sidebar');
      if (sidebar) {
        (sidebar as HTMLElement).style.setProperty('z-index', '1000', 'important');
        (sidebar as HTMLElement).style.setProperty('pointer-events', 'auto', 'important');
        (sidebar as HTMLElement).style.setProperty('visibility', 'visible', 'important');
      }
      
      // Forzar un reflow para asegurar que los cambios se apliquen
      void document.body.offsetHeight;
    }, 150);
  }
  
  seleccionarTrabajador(): void {
    if (this.trabajadorSeleccionadoIndex >= 0 && this.trabajadorSeleccionadoIndex < this.resumenTrabajadoresFiltrados.length) {
      this.trabajadorSeleccionado = this.resumenTrabajadoresFiltrados[this.trabajadorSeleccionadoIndex];
      // Cargar detalles diarios del trabajador seleccionado
      this.cargarDetallesDiarios();
    } else {
      this.trabajadorSeleccionado = null;
    }
  }
  
  cargarDetallesDiarios(): void {
    if (!this.trabajadorSeleccionado) {
      console.warn('⚠️ No hay trabajador seleccionado');
      return;
    }
    
    const trabajadorId = this.trabajadorSeleccionado.id || 
                        this.trabajadorSeleccionado.trabajadorId || 
                        this.trabajadorSeleccionado.TrabajadorID;
    
    if (!trabajadorId) {
      console.warn('⚠️ No se pudo obtener el ID del trabajador. Objeto completo:', this.trabajadorSeleccionado);
      // Intentar usar el DNI como alternativa si no hay ID
      const dni = this.trabajadorSeleccionado.trabajadorDni || this.trabajadorSeleccionado.dni;
      if (!dni) {
        console.error('❌ No se puede cargar detalles: falta ID y DNI');
        return;
      }
      console.log('⚠️ Usando DNI como alternativa:', dni);
    }
    
    const mesSeleccionado = this.filtros.mes;
    const anioSeleccionado = this.filtros.anio;
    
    console.log('🔍 ========== INICIO: cargarDetallesDiarios ==========');
    console.log('🔍 Mes seleccionado:', mesSeleccionado, 'Año:', anioSeleccionado);
    console.log('🔍 Trabajador ID:', trabajadorId);
    
    // Calcular fechas del mes - Asegurar que sea exactamente del día 1 al último día del mes
    // Usar hora local para evitar problemas de zona horaria
    const fechaInicio = new Date(anioSeleccionado, mesSeleccionado - 1, 1, 12, 0, 0);
    const fechaFin = new Date(anioSeleccionado, mesSeleccionado, 0, 12, 0, 0); // Último día del mes
    
    // Formatear fechas sin problemas de zona horaria
    const anioInicio = fechaInicio.getFullYear();
    const mesInicio = String(fechaInicio.getMonth() + 1).padStart(2, '0');
    const diaInicio = String(fechaInicio.getDate()).padStart(2, '0');
    const fechaInicioStr = `${anioInicio}-${mesInicio}-${diaInicio}`;
    
    const anioFin = fechaFin.getFullYear();
    const mesFin = String(fechaFin.getMonth() + 1).padStart(2, '0');
    const diaFin = String(fechaFin.getDate()).padStart(2, '0');
    const fechaFinStr = `${anioFin}-${mesFin}-${diaFin}`;
    
    console.log('🔍 Fecha inicio calculada:', fechaInicio.toLocaleDateString('es-PE'), '->', fechaInicioStr);
    console.log('🔍 Fecha fin calculada:', fechaFin.toLocaleDateString('es-PE'), '->', fechaFinStr);
    console.log('🔍 Verificación: fechaInicio debe ser día 1 del mes', mesSeleccionado);
    console.log('🔍 Verificación: fechaFin debe ser último día del mes', mesSeleccionado);
    
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    // Llamar al endpoint para obtener asistencias del trabajador en el rango de fechas
    this.http.get(`${this.apiAsistencias}/trabajador/${trabajadorId}/rango/${fechaInicioStr}/${fechaFinStr}`, { headers }).subscribe({
      next: (response: any) => {
        console.log('🔍 Respuesta del backend recibida');
        console.log('🔍 Total de registros recibidos:', response.data?.length || 0);
        
        if (response.data && Array.isArray(response.data)) {
          console.log('🔍 Primeros 5 registros recibidos:');
          response.data.slice(0, 5).forEach((item: any, index: number) => {
            console.log(`  ${index + 1}. Fecha: ${item.fecha || item.Fecha}`);
          });
          
          // Filtrar solo los registros del mes seleccionado
          const detallesFiltrados = response.data
            .filter((item: any) => {
              // Parsear fecha sin problemas de zona horaria
              const fechaStr = item.fecha || item.Fecha;
              if (!fechaStr) {
                console.log('❌ Item sin fecha, filtrado');
                return false;
              }
              
              // Parsear manualmente para evitar problemas de zona horaria
              const partes = fechaStr.split('T')[0].split('-');
              if (partes.length !== 3) {
                console.log('❌ Fecha con formato inválido:', fechaStr);
                return false;
              }
              
              const anio = parseInt(partes[0], 10);
              const mes = parseInt(partes[1], 10);
              const dia = parseInt(partes[2], 10);
              
              // Verificar que pertenezca al mes y año seleccionado
              const perteneceAlMes = mes === mesSeleccionado && anio === anioSeleccionado;
              
              if (!perteneceAlMes) {
                console.log(`❌ FECHA FILTRADA: ${fechaStr} (mes: ${mes}, año: ${anio}, día: ${dia}) - NO pertenece a ${mesSeleccionado}/${anioSeleccionado}`);
              } else {
                console.log(`✅ FECHA ACEPTADA: ${fechaStr} (mes: ${mes}, año: ${anio}, día: ${dia})`);
              }
              
              return perteneceAlMes;
            })
            .map((item: any) => {
              // Parsear fecha sin problemas de zona horaria
              const fechaStr = item.fecha || item.Fecha;
              const partes = fechaStr.split('T')[0].split('-');
              const anio = parseInt(partes[0], 10);
              const mes = parseInt(partes[1], 10); // NO restar 1 aquí, ya lo haremos después
              const dia = parseInt(partes[2], 10);
              
              // VERIFICACIÓN FINAL: Asegurar que pertenezca al mes seleccionado
              if (mes !== mesSeleccionado || anio !== anioSeleccionado) {
                console.error(`❌ ERROR CRÍTICO: Fecha ${fechaStr} pasó el filtro pero no pertenece al mes (mes: ${mes}, año: ${anio})`);
                return null; // Retornar null para filtrarlo después
              }
              
              const fecha = new Date(anio, mes - 1, dia, 12, 0, 0); // Los meses en JS son 0-indexed
              const diaSemana = fecha.toLocaleDateString('es-PE', { weekday: 'long' });
              
              // Mapear correctamente el estado
              let estado = item.tipoMarcacion || item.TipoMarcacion || item.estado || item.Estado || 'Sin registro';
              
              // Normalizar estados
              if (estado === 'Validado' || estado === 'Presente') {
                estado = 'Presente';
              } else if (estado === 'Tardanza') {
                estado = 'Tardanza';
              } else if (estado === 'Falta') {
                estado = 'Falta';
              } else if (estado === 'Permiso') {
                estado = 'Permiso';
              } else if (estado === 'Licencia') {
                estado = 'Licencia';
              }
              
              // Formatear horas trabajadas
              let horasTrabajadas = 0;
              if (item.tiempoTrabajado) {
                if (typeof item.tiempoTrabajado === 'string') {
                  horasTrabajadas = parseFloat(item.tiempoTrabajado.replace('h', '').replace('hh', '')) || 0;
                } else {
                  horasTrabajadas = parseFloat(item.tiempoTrabajado) || 0;
                }
              } else if (item.TiempoTrabajado) {
                if (typeof item.TiempoTrabajado === 'string') {
                  horasTrabajadas = parseFloat(item.TiempoTrabajado.replace('h', '').replace('hh', '')) || 0;
                } else {
                  horasTrabajadas = parseFloat(item.TiempoTrabajado) || 0;
                }
              }
              
              // Formatear fecha correctamente para el objeto retornado
              const fechaFormateada = `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
              
              console.log(`✅ Mapeando fecha: ${fechaFormateada} (mes: ${mes}, año: ${anio}, día: ${dia})`);
              
              return {
                fecha: fechaFormateada,
                diaSemana: diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1),
                estado: estado,
                horaEntradaManana: item.horaEntradaManana || item.HoraEntradaManana || null,
                horaSalidaManana: item.horaSalidaManana || item.HoraSalidaManana || null,
                horaEntradaTarde: item.horaEntradaTarde || item.HoraEntradaTarde || null,
                horaSalidaTarde: item.horaSalidaTarde || item.HoraSalidaTarde || null,
                horasTrabajadas: horasTrabajadas,
                horasExtras: parseFloat(item.horasExtras || item.HorasExtras || 0),
                minutosRetraso: item.minutosTardanza || item.MinutosTardanza || 0,
                minutosTardanza: item.minutosTardanza || item.MinutosTardanza || 0,
                observaciones: item.observaciones || item.Observaciones || '',
                justificacion: item.justificacion || item.Justificacion || item.motivoJustificacion || item.MotivoJustificacion || ''
              };
            })
            .filter((item: any) => item !== null); // Eliminar nulls
          
          // FILTRAR UNA VEZ MÁS para asegurar que solo haya días del mes seleccionado
          const detallesFiltradosFinal = detallesFiltrados.filter((detalle: any) => {
            const partesFecha = detalle.fecha.split('-');
            if (partesFecha.length !== 3) {
              console.error('❌ ERROR: Fecha con formato inválido:', detalle.fecha);
              return false;
            }
            
            const anioDetalle = parseInt(partesFecha[0], 10);
            const mesDetalle = parseInt(partesFecha[1], 10);
            
            const perteneceAlMes = mesDetalle === mesSeleccionado && anioDetalle === anioSeleccionado;
            
            if (!perteneceAlMes) {
              console.error(`❌ ERROR CRÍTICO: Detalle con fecha fuera del mes: ${detalle.fecha} (mes: ${mesDetalle}, año: ${anioDetalle}) - ELIMINADO`);
            }
            
            return perteneceAlMes;
          });
          
          // Ordenar por fecha (usar comparación de strings YYYY-MM-DD)
          detallesFiltradosFinal.sort((a: any, b: any) => {
            return a.fecha.localeCompare(b.fecha);
          });
          
          console.log('🔍 Total de detalles después de filtrar:', detallesFiltradosFinal.length);
          if (detallesFiltradosFinal.length > 0) {
            console.log('🔍 Primer fecha:', detallesFiltradosFinal[0].fecha);
            console.log('🔍 Última fecha:', detallesFiltradosFinal[detallesFiltradosFinal.length - 1].fecha);
            
            // Verificar que la primera fecha sea del día 1
            const primeraFecha = detallesFiltradosFinal[0].fecha;
            const partesPrimera = primeraFecha.split('-');
            const diaPrimera = parseInt(partesPrimera[2], 10);
            if (diaPrimera !== 1) {
              console.error(`❌ ERROR CRÍTICO: La primera fecha NO es el día 1: ${primeraFecha} (día: ${diaPrimera})`);
            }
          }
          
          console.log('🔍 Total de detalles después de filtrar:', detallesFiltradosFinal.length);
          
          // Si hay datos pero no están todos los días del mes, completar con faltas automáticas
          if (detallesFiltradosFinal.length > 0) {
            // Generar todos los días del mes
            const ultimoDiaDelMes = new Date(anioSeleccionado, mesSeleccionado, 0).getDate();
            const fechasExistentes = new Set(detallesFiltradosFinal.map(d => d.fecha));
            
            // Agregar días faltantes como faltas automáticas
            for (let dia = 1; dia <= ultimoDiaDelMes; dia++) {
              const fecha = new Date(anioSeleccionado, mesSeleccionado - 1, dia, 12, 0, 0);
              const anio = fecha.getFullYear();
              const mes = String(fecha.getMonth() + 1).padStart(2, '0');
              const diaStr = String(fecha.getDate()).padStart(2, '0');
              const fechaStr = `${anio}-${mes}-${diaStr}`;
              
              if (!fechasExistentes.has(fechaStr)) {
                const diaSemana = fecha.toLocaleDateString('es-PE', { weekday: 'long' });
                const diaSemanaNum = fecha.getDay();
                let estado = 'Sin registro';
                let observaciones = '';
                
                if (diaSemanaNum >= 1 && diaSemanaNum <= 5) {
                  estado = 'Falta';
                  observaciones = 'Falta automática - Sin registro de asistencia';
                } else {
                  estado = 'Sin registro';
                  observaciones = 'Día no hábil';
                }
                
                detallesFiltradosFinal.push({
                  fecha: fechaStr,
                  diaSemana: diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1),
                  estado: estado,
                  horaEntradaManana: null,
                  horaSalidaManana: null,
                  horaEntradaTarde: null,
                  horaSalidaTarde: null,
                  horasTrabajadas: 0,
                  horasExtras: 0,
                  minutosRetraso: 0,
                  minutosTardanza: 0,
                  observaciones: observaciones,
                  justificacion: ''
                });
              }
            }
            
            // Re-ordenar por fecha
            detallesFiltradosFinal.sort((a: any, b: any) => {
              return a.fecha.localeCompare(b.fecha);
            });
            
            console.log('🔍 Total de detalles después de completar días faltantes:', detallesFiltradosFinal.length);
          } else {
            // Si no hay datos del backend, usar método alternativo
            console.log('🔍 No hay datos en la respuesta del método principal, usando método alternativo');
            this.cargarDetallesDiariosAlternativo();
            return; // Salir para no sobrescribir con array vacío
          }
          
          // RECALCULAR ESTADÍSTICAS basándose en los detalles diarios reales
          if (this.trabajadorSeleccionado && detallesFiltradosFinal.length > 0) {
            const diasPresente = detallesFiltradosFinal.filter(d => d.estado === 'Presente').length;
            const diasTardanza = detallesFiltradosFinal.filter(d => d.estado === 'Tardanza').length;
            const diasFalta = detallesFiltradosFinal.filter(d => d.estado === 'Falta').length;
            const diasPermiso = detallesFiltradosFinal.filter(d => d.estado === 'Permiso').length;
            const diasLicencia = detallesFiltradosFinal.filter(d => d.estado === 'Licencia').length;
            
            // Actualizar estadísticas del trabajador seleccionado
            this.trabajadorSeleccionado.diasPresente = diasPresente;
            this.trabajadorSeleccionado.diasTardanza = diasTardanza;
            this.trabajadorSeleccionado.diasFalta = diasFalta;
            this.trabajadorSeleccionado.diasPermiso = diasPermiso;
            this.trabajadorSeleccionado.diasLicencia = diasLicencia;
            
            // Recalcular horas trabajadas
            const totalHorasTrabajadas = detallesFiltradosFinal.reduce((sum, d) => sum + (d.horasTrabajadas || 0), 0);
            this.trabajadorSeleccionado.totalHorasTrabajadas = Math.round(totalHorasTrabajadas * 100) / 100;
            
            // Recalcular porcentajes
            const diasHabiles = detallesFiltradosFinal.filter(d => {
              const partesFecha = d.fecha.split('-');
              if (partesFecha.length !== 3) return false;
              const fecha = new Date(parseInt(partesFecha[0], 10), parseInt(partesFecha[1], 10) - 1, parseInt(partesFecha[2], 10), 12, 0, 0);
              const diaSemanaNum = fecha.getDay();
              return diaSemanaNum >= 1 && diaSemanaNum <= 5; // Solo lunes a viernes
            }).length;
            
            if (diasHabiles > 0) {
              const porcentajeAsistencia = Math.round(((diasPresente + diasTardanza) / diasHabiles) * 10000) / 100;
              const porcentajePuntualidad = Math.round((diasPresente / diasHabiles) * 10000) / 100;
              
              this.trabajadorSeleccionado.porcentajeAsistencia = Math.min(porcentajeAsistencia, 100);
              this.trabajadorSeleccionado.porcentajePuntualidad = Math.min(porcentajePuntualidad, 100);
            }
            
            console.log('🔍 ========== ESTADÍSTICAS RECALCULADAS (método principal) ==========');
            console.log('🔍 Días Presente:', diasPresente);
            console.log('🔍 Días Tardanza:', diasTardanza);
            console.log('🔍 Días Falta:', diasFalta);
            console.log('🔍 Total Horas Trabajadas:', totalHorasTrabajadas);
            console.log('🔍 % Asistencia:', this.trabajadorSeleccionado.porcentajeAsistencia);
            console.log('🔍 % Puntualidad:', this.trabajadorSeleccionado.porcentajePuntualidad);
          }
          
          console.log('🔍 ========== FIN: cargarDetallesDiarios ==========');
          
          this.trabajadorSeleccionado.detallesDiarios = detallesFiltradosFinal;
        } else {
          console.log('🔍 No hay datos en la respuesta');
          // Si no hay datos, usar método alternativo
          this.cargarDetallesDiariosAlternativo();
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar detalles diarios:', error);
        // Solo usar método alternativo si es un 404 (endpoint no existe)
        // Si es otro error, intentar método alternativo de todas formas
        if (error.status === 404) {
          console.log('🔍 Endpoint no existe (404), usando método alternativo');
        }
        this.cargarDetallesDiariosAlternativo();
      }
    });
  }
  
  cargarDetallesDiariosAlternativo(): void {
    // Método alternativo: generar días del mes y buscar asistencias día por día
    if (!this.trabajadorSeleccionado) return;
    
    const trabajadorId = this.trabajadorSeleccionado.id || this.trabajadorSeleccionado.TrabajadorID;
    if (!trabajadorId) return;
    
    const mesSeleccionado = this.filtros.mes;
    const anioSeleccionado = this.filtros.anio;
    
    console.log('🔍 ========== INICIO: cargarDetallesDiariosAlternativo ==========');
    console.log('🔍 Mes seleccionado:', mesSeleccionado, 'Año:', anioSeleccionado);
    console.log('🔍 Trabajador ID:', trabajadorId);
    
    // Asegurar que mesSeleccionado y anioSeleccionado sean números ANTES de usarlos
    const mesSeleccionadoNum = typeof mesSeleccionado === 'string' ? parseInt(mesSeleccionado, 10) : mesSeleccionado;
    const anioSeleccionadoNum = typeof anioSeleccionado === 'string' ? parseInt(anioSeleccionado, 10) : anioSeleccionado;
    
    console.log('🔍 Generando días - mesSeleccionado:', mesSeleccionado, '->', mesSeleccionadoNum, 'anioSeleccionado:', anioSeleccionado, '->', anioSeleccionadoNum);
    
    // Generar SOLO las fechas del mes seleccionado (del día 1 al último día del mes)
    // Obtener el último día del mes usando los valores numéricos
    const ultimoDiaDelMes = new Date(anioSeleccionadoNum, mesSeleccionadoNum, 0).getDate();
    const diasDelMes: Date[] = [];
    
    console.log('🔍 Último día del mes:', ultimoDiaDelMes);
    
    // Generar días del mes SOLO del día 1 al último día del mes seleccionado
    // Simplificar la generación - confiar en que JavaScript crea las fechas correctamente
    for (let dia = 1; dia <= ultimoDiaDelMes; dia++) {
      const fecha = new Date(anioSeleccionadoNum, mesSeleccionadoNum - 1, dia, 12, 0, 0);
      // Verificar que la fecha generada pertenezca al mes correcto (verificación más simple)
      const mesFecha = fecha.getMonth() + 1;
      const anioFecha = fecha.getFullYear();
      
      // Solo verificar mes y año, no el día (porque puede haber problemas de zona horaria)
      if (mesFecha === mesSeleccionadoNum && anioFecha === anioSeleccionadoNum) {
        diasDelMes.push(fecha);
        if (dia <= 3 || dia === ultimoDiaDelMes) {
          console.log(`✅ Día ${dia} generado: ${fecha.toLocaleDateString('es-PE')} (mes: ${mesFecha}, año: ${anioFecha})`);
        }
      } else {
        // Si falla la validación, aún así agregar la fecha (puede ser un problema de zona horaria)
        console.warn(`⚠️ ADVERTENCIA: Día ${dia} - mes generado: ${mesFecha}, esperado: ${mesSeleccionadoNum} - Agregando de todas formas`);
        diasDelMes.push(fecha);
      }
    }
    
    console.log('🔍 Total de días generados:', diasDelMes.length, 'días');
    
    // Si no se generaron días, generarlos de forma más simple sin validaciones estrictas
    if (diasDelMes.length === 0) {
      console.warn('⚠️ No se generaron días con el método normal, generando de forma alternativa');
      diasDelMes.length = 0; // Limpiar array
      for (let dia = 1; dia <= ultimoDiaDelMes; dia++) {
        const fecha = new Date(anioSeleccionado, mesSeleccionado - 1, dia, 12, 0, 0);
        diasDelMes.push(fecha);
      }
      console.log('🔍 Días generados de forma alternativa:', diasDelMes.length);
    }
    
    if (diasDelMes.length > 0) {
      const primerDia = diasDelMes[0];
      const ultimoDia = diasDelMes[diasDelMes.length - 1];
      console.log('🔍 Primer día:', primerDia.toLocaleDateString('es-PE'), '- Debe ser día 1');
      console.log('🔍 Último día:', ultimoDia.toLocaleDateString('es-PE'));
      
      // Verificar que el primer día sea del mes correcto
      const mesPrimerDia = primerDia.getMonth() + 1;
      if (mesPrimerDia !== mesSeleccionadoNum) {
        console.warn(`⚠️ ADVERTENCIA: El primer día pertenece al mes ${mesPrimerDia}, esperado ${mesSeleccionadoNum}`);
      }
    } else {
      console.error('❌ ERROR CRÍTICO: No se pudieron generar días del mes');
    }
    
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    // Cargar asistencias para cada día del mes
    // Usar Promise.allSettled para que no falle si alguna petición falla
    const promesas = diasDelMes.map(fecha => {
      // Formatear fecha sin problemas de zona horaria
      const anio = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const dia = String(fecha.getDate()).padStart(2, '0');
      const fechaStr = `${anio}-${mes}-${dia}`;
      return firstValueFrom(this.http.get(`${this.apiAsistencias}/fecha/${fechaStr}`, { headers }))
        .catch(error => {
          // Si hay error, retornar un objeto vacío en lugar de fallar
          console.warn(`⚠️ Error al cargar asistencia para ${fechaStr}:`, error);
          return { data: [] };
        });
    });
    
      Promise.all(promesas).then((responses: any[]) => {
        console.log('🔍 ========== PROCESANDO RESPUESTAS DEL BACKEND ==========');
        console.log('🔍 Total de respuestas recibidas:', responses.length);
        console.log('🔍 Trabajador ID:', trabajadorId);
        console.log('🔍 Mes seleccionado (raw):', this.filtros.mes, 'Año (raw):', this.filtros.anio);
        
        // Asegurar que mesSeleccionado y anioSeleccionado sean números
        const mesSeleccionado = typeof this.filtros.mes === 'string' ? parseInt(this.filtros.mes, 10) : this.filtros.mes;
        const anioSeleccionado = typeof this.filtros.anio === 'string' ? parseInt(this.filtros.anio, 10) : this.filtros.anio;
        
        console.log('🔍 Mes seleccionado (num):', mesSeleccionado, 'Año (num):', anioSeleccionado);
        
        const detallesDiarios: any[] = [];
        
        let totalRegistrosEncontrados = 0;
        let totalRegistrosNoEncontrados = 0;
        
        responses.forEach((response: any, index: number) => {
          const fecha = diasDelMes[index];
          
          // VERIFICACIÓN CRÍTICA: Asegurar que la fecha pertenezca al mes seleccionado
          // Asegurar que mesSeleccionado y anioSeleccionado sean números para la comparación
          const mesFecha = fecha.getMonth() + 1;
          const anioFecha = fecha.getFullYear();
          const mesSeleccionadoNum = typeof mesSeleccionado === 'string' ? parseInt(mesSeleccionado, 10) : mesSeleccionado;
          const anioSeleccionadoNum = typeof anioSeleccionado === 'string' ? parseInt(anioSeleccionado, 10) : anioSeleccionado;
          
          if (mesFecha !== mesSeleccionadoNum || anioFecha !== anioSeleccionadoNum) {
            console.error(`❌ ERROR: Fecha fuera del mes seleccionado: ${fecha.toLocaleDateString('es-PE')} (mes fecha: ${mesFecha}, mes seleccionado: ${mesSeleccionadoNum}, año fecha: ${anioFecha}, año seleccionado: ${anioSeleccionadoNum}) - NO SE INCLUIRÁ`);
            return; // Saltar esta fecha
          }
          
          // Formatear fecha sin problemas de zona horaria - USAR LA FECHA DEL ARRAY, NO LA DEL BACKEND
          const anio = fecha.getFullYear();
          const mes = String(fecha.getMonth() + 1).padStart(2, '0');
          const dia = String(fecha.getDate()).padStart(2, '0');
          const fechaStr = `${anio}-${mes}-${dia}`;
          const diaSemana = fecha.toLocaleDateString('es-PE', { weekday: 'long' });
          
          // Log para debugging
          if (index < 3 || index === diasDelMes.length - 1) {
            console.log(`🔍 Procesando índice ${index}: fecha del array = ${fechaStr}, fecha objeto = ${fecha.toLocaleDateString('es-PE')}`);
          }
        
          // Buscar el registro del trabajador en la respuesta
          const registro = response?.data?.find((r: any) => {
            const rId = r.trabajadorId || r.TrabajadorID;
            return rId === trabajadorId;
          });
          
          // Log detallado para debugging
          if (index < 5 || index === diasDelMes.length - 1) {
            console.log(`🔍 [Día ${index + 1}/${diasDelMes.length}] Fecha: ${fechaStr}`);
            console.log(`🔍   - Total registros en respuesta: ${response?.data?.length || 0}`);
            console.log(`🔍   - Trabajador ID buscado: ${trabajadorId}`);
            if (registro) {
              console.log(`🔍   - ✅ REGISTRO ENCONTRADO para trabajador ${trabajadorId}`);
              console.log(`🔍   - Fecha del registro: ${registro.fecha || registro.Fecha}`);
              console.log(`🔍   - Estado: ${registro.tipoMarcacion || registro.TipoMarcacion || registro.estado || registro.Estado}`);
              console.log(`🔍   - Hora entrada mañana: ${registro.horaEntradaManana || registro.HoraEntradaManana || '---'}`);
            } else {
              console.log(`🔍   - ❌ NO SE ENCONTRÓ REGISTRO para trabajador ${trabajadorId}`);
              if (response?.data && response.data.length > 0) {
                console.log(`🔍   - IDs de trabajadores en la respuesta:`, response.data.map((r: any) => r.trabajadorId || r.TrabajadorID).slice(0, 5));
              }
            }
          }
        
          if (registro) {
          totalRegistrosEncontrados++;
          
          // Mapear correctamente el estado
          let estado = registro.tipoMarcacion || registro.TipoMarcacion || registro.estado || registro.Estado || 'Sin registro';
          
          // Normalizar estados
          if (estado === 'Validado' || estado === 'Presente') {
            estado = 'Presente';
          } else if (estado === 'Tardanza') {
            estado = 'Tardanza';
          } else if (estado === 'Falta') {
            estado = 'Falta';
          } else if (estado === 'Permiso') {
            estado = 'Permiso';
          } else if (estado === 'Licencia') {
            estado = 'Licencia';
          }
          
          // Formatear horas trabajadas
          let horasTrabajadas = 0;
          if (registro.tiempoTrabajado) {
            // Si viene como string "7.00h" o número
            if (typeof registro.tiempoTrabajado === 'string') {
              horasTrabajadas = parseFloat(registro.tiempoTrabajado.replace('h', '').replace('hh', '')) || 0;
            } else {
              horasTrabajadas = parseFloat(registro.tiempoTrabajado) || 0;
            }
          } else if (registro.TiempoTrabajado) {
            if (typeof registro.TiempoTrabajado === 'string') {
              horasTrabajadas = parseFloat(registro.TiempoTrabajado.replace('h', '').replace('hh', '')) || 0;
            } else {
              horasTrabajadas = parseFloat(registro.TiempoTrabajado) || 0;
            }
          }
          
          detallesDiarios.push({
            fecha: fechaStr,
            diaSemana: diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1),
            estado: estado,
            horaEntradaManana: registro.horaEntradaManana || registro.HoraEntradaManana || null,
            horaSalidaManana: registro.horaSalidaManana || registro.HoraSalidaManana || null,
            horaEntradaTarde: registro.horaEntradaTarde || registro.HoraEntradaTarde || null,
            horaSalidaTarde: registro.horaSalidaTarde || registro.HoraSalidaTarde || null,
            horasTrabajadas: horasTrabajadas,
            horasExtras: parseFloat(registro.horasExtras || registro.HorasExtras || 0),
            minutosRetraso: registro.minutosTardanza || registro.MinutosTardanza || 0,
            minutosTardanza: registro.minutosTardanza || registro.MinutosTardanza || 0,
            observaciones: registro.observaciones || registro.Observaciones || '',
            justificacion: registro.justificacion || registro.Justificacion || registro.motivoJustificacion || registro.MotivoJustificacion || ''
          });
          } else {
            totalRegistrosNoEncontrados++;
            
            // Si no hay registro, generar un registro para ese día
            // Para días hábiles (lunes a viernes), marcar como falta
            // Para sábados y domingos, marcar como "Sin registro" o dejarlos sin estado
            const diaSemanaNum = fecha.getDay();
            let estado = 'Sin registro';
            let observaciones = '';
            
            if (diaSemanaNum >= 1 && diaSemanaNum <= 5) {
              // Día hábil sin registro = Falta
              estado = 'Falta';
              observaciones = 'Falta automática - Sin registro de asistencia';
            } else {
              // Sábado o domingo
              estado = 'Sin registro';
              observaciones = 'Día no hábil';
            }
            
            detallesDiarios.push({
              fecha: fechaStr,
              diaSemana: diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1),
              estado: estado,
              horaEntradaManana: null,
              horaSalidaManana: null,
              horaEntradaTarde: null,
              horaSalidaTarde: null,
              horasTrabajadas: 0,
              horasExtras: 0,
              minutosRetraso: 0,
              minutosTardanza: 0,
              observaciones: observaciones,
              justificacion: ''
            });
          }
        });
        
        console.log('🔍 ========== RESUMEN DE PROCESAMIENTO ==========');
        console.log('🔍 Total registros ENCONTRADOS del backend:', totalRegistrosEncontrados);
        console.log('🔍 Total registros NO ENCONTRADOS (faltas automáticas):', totalRegistrosNoEncontrados);
        console.log('🔍 Total detalles generados:', detallesDiarios.length);
        
        // FILTRAR UNA VEZ MÁS para asegurar que solo haya días del mes seleccionado
        const detallesFiltradosFinal = detallesDiarios.filter(detalle => {
          const partesFecha = detalle.fecha.split('-');
          if (partesFecha.length !== 3) return false;
          
          const anioDetalle = parseInt(partesFecha[0], 10);
          const mesDetalle = parseInt(partesFecha[1], 10);
          
          const perteneceAlMes = mesDetalle === mesSeleccionado && anioDetalle === anioSeleccionado;
          
          if (!perteneceAlMes) {
            console.error(`❌ ERROR: Detalle con fecha fuera del mes: ${detalle.fecha} - ELIMINADO`);
          }
          
          return perteneceAlMes;
        });
        
        // Ordenar por fecha
        detallesFiltradosFinal.sort((a: any, b: any) => {
          return a.fecha.localeCompare(b.fecha);
        });
        
        console.log('🔍 Total de detalles después de filtrar:', detallesFiltradosFinal.length);
        console.log('🔍 Total de días del mes esperados:', diasDelMes.length);
        
        // Asegurar que tengamos todos los días del mes
        // Si faltan días, generarlos
        if (detallesFiltradosFinal.length < diasDelMes.length) {
          console.warn(`⚠️ Faltan días en los detalles. Esperados: ${diasDelMes.length}, Encontrados: ${detallesFiltradosFinal.length}`);
          
          // Crear un mapa de fechas existentes para verificar rápidamente
          const fechasExistentes = new Set(detallesFiltradosFinal.map(d => d.fecha));
          
          // Agregar los días faltantes
          diasDelMes.forEach(fecha => {
            const anio = fecha.getFullYear();
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const dia = String(fecha.getDate()).padStart(2, '0');
            const fechaStr = `${anio}-${mes}-${dia}`;
            
            if (!fechasExistentes.has(fechaStr)) {
              const diaSemana = fecha.toLocaleDateString('es-PE', { weekday: 'long' });
              const diaSemanaNum = fecha.getDay();
              let estado = 'Sin registro';
              let observaciones = '';
              
              if (diaSemanaNum >= 1 && diaSemanaNum <= 5) {
                estado = 'Falta';
                observaciones = 'Falta automática - Sin registro de asistencia';
              } else {
                estado = 'Sin registro';
                observaciones = 'Día no hábil';
              }
              
              detallesFiltradosFinal.push({
                fecha: fechaStr,
                diaSemana: diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1),
                estado: estado,
                horaEntradaManana: null,
                horaSalidaManana: null,
                horaEntradaTarde: null,
                horaSalidaTarde: null,
                horasTrabajadas: 0,
                horasExtras: 0,
                minutosRetraso: 0,
                minutosTardanza: 0,
                observaciones: observaciones,
                justificacion: ''
              });
            }
          });
          
          // Re-ordenar por fecha
          detallesFiltradosFinal.sort((a: any, b: any) => {
            return a.fecha.localeCompare(b.fecha);
          });
          
          console.log('🔍 Total de detalles después de completar días faltantes:', detallesFiltradosFinal.length);
        }
        
        if (detallesFiltradosFinal.length > 0) {
          console.log('🔍 Primer fecha:', detallesFiltradosFinal[0].fecha);
          console.log('🔍 Última fecha:', detallesFiltradosFinal[detallesFiltradosFinal.length - 1].fecha);
          
          // Verificar que la primera fecha sea del día 1
          const primeraFecha = detallesFiltradosFinal[0].fecha;
          const partesPrimera = primeraFecha.split('-');
          const diaPrimera = parseInt(partesPrimera[2], 10);
          if (diaPrimera !== 1) {
            console.error(`❌ ERROR CRÍTICO: La primera fecha NO es el día 1: ${primeraFecha} (día: ${diaPrimera})`);
          } else {
            console.log('✅ Verificación: La primera fecha es el día 1');
          }
        }
        
        // RECALCULAR ESTADÍSTICAS basándose en los detalles diarios reales (DESPUÉS del filtrado)
        if (this.trabajadorSeleccionado && detallesFiltradosFinal.length > 0) {
          const diasPresente = detallesFiltradosFinal.filter(d => d.estado === 'Presente').length;
          const diasTardanza = detallesFiltradosFinal.filter(d => d.estado === 'Tardanza').length;
          const diasFalta = detallesFiltradosFinal.filter(d => d.estado === 'Falta').length;
          const diasPermiso = detallesFiltradosFinal.filter(d => d.estado === 'Permiso').length;
          const diasLicencia = detallesFiltradosFinal.filter(d => d.estado === 'Licencia').length;
          
          // Actualizar estadísticas del trabajador seleccionado
          this.trabajadorSeleccionado.diasPresente = diasPresente;
          this.trabajadorSeleccionado.diasTardanza = diasTardanza;
          this.trabajadorSeleccionado.diasFalta = diasFalta;
          this.trabajadorSeleccionado.diasPermiso = diasPermiso;
          this.trabajadorSeleccionado.diasLicencia = diasLicencia;
          
          // Recalcular horas trabajadas
          const totalHorasTrabajadas = detallesFiltradosFinal.reduce((sum, d) => sum + (d.horasTrabajadas || 0), 0);
          this.trabajadorSeleccionado.totalHorasTrabajadas = Math.round(totalHorasTrabajadas * 100) / 100;
          
          // Recalcular porcentajes
          const diasHabiles = detallesFiltradosFinal.filter(d => {
            const partesFecha = d.fecha.split('-');
            if (partesFecha.length !== 3) return false;
            const fecha = new Date(parseInt(partesFecha[0], 10), parseInt(partesFecha[1], 10) - 1, parseInt(partesFecha[2], 10), 12, 0, 0);
            const diaSemanaNum = fecha.getDay();
            return diaSemanaNum >= 1 && diaSemanaNum <= 5; // Solo lunes a viernes
          }).length;
          
          if (diasHabiles > 0) {
            const porcentajeAsistencia = Math.round(((diasPresente + diasTardanza) / diasHabiles) * 10000) / 100;
            const porcentajePuntualidad = Math.round((diasPresente / diasHabiles) * 10000) / 100;
            
            this.trabajadorSeleccionado.porcentajeAsistencia = Math.min(porcentajeAsistencia, 100);
            this.trabajadorSeleccionado.porcentajePuntualidad = Math.min(porcentajePuntualidad, 100);
          }
          
          console.log('🔍 ========== ESTADÍSTICAS RECALCULADAS (método alternativo) ==========');
          console.log('🔍 Días Presente:', diasPresente);
          console.log('🔍 Días Tardanza:', diasTardanza);
          console.log('🔍 Días Falta:', diasFalta);
          console.log('🔍 Total Horas Trabajadas:', totalHorasTrabajadas);
          console.log('🔍 % Asistencia:', this.trabajadorSeleccionado.porcentajeAsistencia);
          console.log('🔍 % Puntualidad:', this.trabajadorSeleccionado.porcentajePuntualidad);
        }
        
        console.log('🔍 ========== FIN: cargarDetallesDiariosAlternativo ==========');
        
        this.trabajadorSeleccionado.detallesDiarios = detallesFiltradosFinal;
    }).catch((error) => {
      console.error('❌ Error al cargar detalles diarios (método alternativo):', error);
      this.trabajadorSeleccionado.detallesDiarios = [];
    });
  }
  
  formatearFecha(fecha: string | Date): string {
    if (!fecha) return '---';
    
    // Si es string, parsear manualmente para evitar problemas de zona horaria
    if (typeof fecha === 'string') {
      // Formato esperado: YYYY-MM-DD
      const partes = fecha.split('T')[0].split('-');
      if (partes.length === 3) {
        const anio = partes[0];
        const mes = partes[1];
        const dia = partes[2];
        return `${dia}/${mes}/${anio}`;
      }
      
      // Si no es formato YYYY-MM-DD, intentar con Date pero usando mediodía
      const date = new Date(fecha);
      if (isNaN(date.getTime())) return '---';
      
      // Usar mediodía para evitar problemas de zona horaria
      const dateLocal = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
      const dia = String(dateLocal.getDate()).padStart(2, '0');
      const mes = String(dateLocal.getMonth() + 1).padStart(2, '0');
      const anio = dateLocal.getFullYear();
      
      return `${dia}/${mes}/${anio}`;
    }
    
    // Si es Date, usar directamente pero asegurar mediodía
    const date = fecha;
    if (isNaN(date.getTime())) return '---';
    
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();
    
    return `${dia}/${mes}/${anio}`;
  }
  
  // =====================================================
  // MÉTODOS DE GRÁFICOS
  // =====================================================
  inicializarGraficos(): void {
    // Destruir gráficos existentes
    Object.keys(this.charts).forEach(key => {
      if (this.charts[key]) {
        this.charts[key]?.destroy();
        this.charts[key] = null;
      }
    });
    
    // Inicializar el gráfico mensual principal
    this.crearGraficoMensual();
  }
  
  crearGraficoMensual(): void {
    const canvas = document.getElementById('grafico-mensual') as HTMLCanvasElement;
    if (!canvas) {
      console.error('❌ No se encontró el canvas grafico-mensual');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ No se pudo obtener el contexto 2d del canvas');
      return;
    }
    
    // Preparar datos mensuales
    const datos = this.prepararDatosMensuales();
    console.log('📊 Datos mensuales:', datos);
    
    if (this.charts['mensual']) {
      this.charts['mensual']?.destroy();
    }
    
    this.charts['mensual'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: datos.labels,
        datasets: [
          {
            label: 'Presentes',
            data: datos.presentes,
            backgroundColor: '#10b981',
            borderRadius: 6,
            borderSkipped: false
          },
          {
            label: 'Tardanzas',
            data: datos.tardanzas,
            backgroundColor: '#f59e0b',
            borderRadius: 6,
            borderSkipped: false
          },
          {
            label: 'Faltas',
            data: datos.faltas,
            backgroundColor: '#ef4444',
            borderRadius: 6,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#ffffff',
              usePointStyle: true,
              padding: 20,
              font: { size: 14, weight: 'normal' }
            }
          },
          title: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#374151',
            borderWidth: 1,
            padding: 12,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y || 0;
                const total = datos.totales[context.dataIndex] || 0;
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${label}: ${value} días (${percentage}%)`;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            grid: { 
              color: 'rgba(255, 255, 255, 0.1)',
              display: false
            },
            ticks: { 
              color: '#e5e7eb',
              font: { size: 13 }
            }
          },
          y: {
            beginAtZero: true,
            stacked: true,
            grid: { 
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: { 
              color: '#e5e7eb',
              font: { size: 13 },
              stepSize: 1,
              callback: function(value) {
                return value + ' días';
              }
            }
          }
        }
      }
    });
  }
  
  prepararDatosMensuales(): any {
    // Agrupar por trabajador
    const trabajadoresData = this.trabajadoresDetalle.map(t => ({
      nombre: (t.nombreCompleto || t.trabajadorNombre || 'Sin nombre').split(',')[0], // Solo apellido
      presentes: t.diasPresente || 0,
      tardanzas: t.diasTardanza || 0,
      faltas: t.diasFalta || 0
    })).sort((a, b) => {
      // Ordenar por total de días (presentes + tardanzas + faltas) descendente
      const totalA = a.presentes + a.tardanzas + a.faltas;
      const totalB = b.presentes + b.tardanzas + b.faltas;
      return totalB - totalA;
    }).slice(0, 15); // Top 15 trabajadores
    
    const labels = trabajadoresData.map(t => {
      const nombre = t.nombre.length > 20 ? t.nombre.substring(0, 17) + '...' : t.nombre;
      return nombre;
    });
    
    const presentes = trabajadoresData.map(t => t.presentes);
    const tardanzas = trabajadoresData.map(t => t.tardanzas);
    const faltas = trabajadoresData.map(t => t.faltas);
    
    // Calcular totales para porcentajes
    const totales = trabajadoresData.map(t => t.presentes + t.tardanzas + t.faltas);
    
    return { labels, presentes, tardanzas, faltas, totales };
  }
  
  crearGraficoTendenciaDiaria(): void {
    const canvas = document.getElementById('grafico-tendencia') as HTMLCanvasElement;
    if (!canvas) {
      console.error('❌ No se encontró el canvas grafico-tendencia');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ No se pudo obtener el contexto 2d del canvas');
      return;
    }
    
    // Preparar datos de tendencia diaria
    const datos = this.prepararDatosTendenciaDiaria();
    console.log('📊 Datos de tendencia diaria:', datos);
    
    if (this.charts['tendencia']) {
      this.charts['tendencia']?.destroy();
    }
    
    this.charts['tendencia'] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: datos.labels,
        datasets: [
          {
            label: 'Presentes',
            data: datos.presentes,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Tardanzas',
            data: datos.tardanzas,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Faltas',
            data: datos.faltas,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#ffffff',
              usePointStyle: true,
              padding: 15,
              font: { size: 13, weight: 'normal' }
            }
          },
          title: {
            display: true,
            text: 'Tendencia de Asistencia Diaria',
            color: '#ffffff',
            font: { size: 16, weight: 'bold' }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#374151',
            borderWidth: 1,
            padding: 12,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            ticks: { 
              color: '#e5e7eb',
              font: { size: 12 }
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            ticks: { 
              color: '#e5e7eb',
              font: { size: 12 },
              stepSize: 1
            }
          }
        }
      }
    });
  }
  
  crearGraficoDistribucionEstados(): void {
    const canvas = document.getElementById('grafico-distribucion') as HTMLCanvasElement;
    if (!canvas) {
      console.error('❌ No se encontró el canvas grafico-distribucion');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ No se pudo obtener el contexto 2d del canvas');
      return;
    }
    
    const datos = this.prepararDatosDistribucionEstados();
    console.log('📊 Datos de distribución:', datos);
    
    if (this.charts['distribucion']) {
      this.charts['distribucion']?.destroy();
    }
    
    this.charts['distribucion'] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: datos.labels,
        datasets: [{
          data: datos.values,
          backgroundColor: [
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#3b82f6',
            '#8b5cf6'
          ],
          borderWidth: 2,
          borderColor: 'var(--panel)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#ffffff',
              usePointStyle: true,
              padding: 15,
              font: { size: 13, weight: 'normal' }
            }
          },
          title: {
            display: true,
            text: 'Distribución por Estados',
            color: '#ffffff',
            font: { size: 16, weight: 'bold' }
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#374151',
            borderWidth: 1,
            padding: 12,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }
  
  crearGraficoComparativaAreas(): void {
    const canvas = document.getElementById('grafico-areas') as HTMLCanvasElement;
    if (!canvas) {
      console.error('❌ No se encontró el canvas grafico-areas');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ No se pudo obtener el contexto 2d del canvas');
      return;
    }
    
    const datos = this.prepararDatosComparativaAreas();
    console.log('📊 Datos de áreas:', datos);
    
    if (this.charts['areas']) {
      this.charts['areas']?.destroy();
    }
    
    this.charts['areas'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: datos.labels,
        datasets: [
          {
            label: 'Presentes',
            data: datos.presentes,
            backgroundColor: '#10b981',
            borderRadius: 4
          },
          {
            label: 'Tardanzas',
            data: datos.tardanzas,
            backgroundColor: '#f59e0b',
            borderRadius: 4
          },
          {
            label: 'Faltas',
            data: datos.faltas,
            backgroundColor: '#ef4444',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#ffffff',
              usePointStyle: true,
              padding: 15,
              font: { size: 13, weight: 'normal' }
            }
          },
          title: {
            display: true,
            text: 'Comparativa de Asistencia por Área',
            color: '#ffffff',
            font: { size: 16, weight: 'bold' }
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#374151',
            borderWidth: 1,
            padding: 12,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 }
          }
        },
        scales: {
          x: {
            stacked: true,
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            ticks: { 
              color: '#e5e7eb',
              font: { size: 12 }
            }
          },
          y: {
            beginAtZero: true,
            stacked: true,
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            ticks: { 
              color: '#e5e7eb',
              font: { size: 12 },
              stepSize: 1
            }
          }
        }
      }
    });
  }
  
  crearGraficoAnalisisTardanzas(): void {
    const canvas = document.getElementById('grafico-tardanzas') as HTMLCanvasElement;
    if (!canvas) {
      console.error('❌ No se encontró el canvas grafico-tardanzas');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ No se pudo obtener el contexto 2d del canvas');
      return;
    }
    
    const datos = this.prepararDatosAnalisisTardanzas();
    console.log('📊 Datos de tardanzas:', datos);
    
    if (this.charts['tardanzas']) {
      this.charts['tardanzas']?.destroy();
    }
    
    this.charts['tardanzas'] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: datos.labels,
        datasets: [{
          label: 'Tardanzas',
          data: datos.values,
          backgroundColor: datos.colors,
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Análisis de Tardanzas por Trabajador',
            color: '#ffffff',
            font: { size: 16, weight: 'bold' }
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#374151',
            borderWidth: 1,
            padding: 12,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            ticks: { 
              color: '#e5e7eb',
              font: { size: 12 },
              stepSize: 1
            }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            ticks: { 
              color: '#e5e7eb',
              font: { size: 12 }
            }
          }
        }
      }
    });
  }
  
  prepararDatosTendenciaDiaria(): any {
    // Obtener datos diarios del mes actual
    const mesSeleccionado = parseInt(this.filtros.mes.toString(), 10);
    const anioSeleccionado = parseInt(this.filtros.anio.toString(), 10);
    const ultimoDia = new Date(anioSeleccionado, mesSeleccionado, 0).getDate();
    
    const labels: string[] = [];
    const presentes: number[] = [];
    const tardanzas: number[] = [];
    const faltas: number[] = [];
    
    // Si tenemos datos agregados del resumen, usarlos para estimar la distribución diaria
    // Esto es una aproximación basada en los totales mensuales
    const totalPresentes = this.trabajadoresDetalle.reduce((sum, t) => sum + (t.diasPresente || 0), 0);
    const totalTardanzas = this.trabajadoresDetalle.reduce((sum, t) => sum + (t.diasTardanza || 0), 0);
    const totalFaltas = this.trabajadoresDetalle.reduce((sum, t) => sum + (t.diasFalta || 0), 0);
    
    // Contar días hábiles
    let diasHabiles = 0;
    for (let dia = 1; dia <= ultimoDia; dia++) {
      const fecha = new Date(anioSeleccionado, mesSeleccionado - 1, dia);
      const diaSemana = fecha.getDay();
      if (diaSemana >= 1 && diaSemana <= 5) {
        diasHabiles++;
      }
    }
    
    // Distribuir los totales de manera uniforme entre los días hábiles
    const promedioPresentesPorDia = diasHabiles > 0 ? totalPresentes / diasHabiles : 0;
    const promedioTardanzasPorDia = diasHabiles > 0 ? totalTardanzas / diasHabiles : 0;
    const promedioFaltasPorDia = diasHabiles > 0 ? totalFaltas / diasHabiles : 0;
    
    // Agrupar por día
    for (let dia = 1; dia <= ultimoDia; dia++) {
      const fecha = new Date(anioSeleccionado, mesSeleccionado - 1, dia);
      const diaSemana = fecha.getDay();
      
      // Solo contar días hábiles (lunes a viernes)
      if (diaSemana >= 1 && diaSemana <= 5) {
        labels.push(`${dia}/${mesSeleccionado}`);
        
        // Usar promedios redondeados para mostrar una distribución aproximada
        presentes.push(Math.round(promedioPresentesPorDia));
        tardanzas.push(Math.round(promedioTardanzasPorDia));
        faltas.push(Math.round(promedioFaltasPorDia));
      }
    }
    
    return { labels, presentes, tardanzas, faltas };
  }
  
  prepararDatosDistribucionEstados(): any {
    const totalPresentes = this.trabajadoresDetalle.reduce((sum, t) => sum + (t.diasPresente || 0), 0);
    const totalTardanzas = this.trabajadoresDetalle.reduce((sum, t) => sum + (t.diasTardanza || 0), 0);
    const totalFaltas = this.trabajadoresDetalle.reduce((sum, t) => sum + (t.diasFalta || 0), 0);
    const totalPermisos = this.trabajadoresDetalle.reduce((sum, t) => sum + (t.diasPermiso || 0), 0);
    const totalLicencias = this.trabajadoresDetalle.reduce((sum, t) => sum + (t.diasLicencia || 0), 0);
    
    // Si todos los valores son 0, retornar valores por defecto para que se muestre algo
    const total = totalPresentes + totalTardanzas + totalFaltas + totalPermisos + totalLicencias;
    if (total === 0) {
      return {
        labels: ['Sin datos'],
        values: [1]
      };
    }
    
    return {
      labels: ['Presentes', 'Tardanzas', 'Faltas', 'Permisos', 'Licencias'],
      values: [totalPresentes, totalTardanzas, totalFaltas, totalPermisos, totalLicencias]
    };
  }
  
  prepararDatosComparativaAreas(): any {
    const areasMap: { [key: string]: { presentes: number, tardanzas: number, faltas: number } } = {};
    
    this.trabajadoresDetalle.forEach(trabajador => {
      const area = trabajador.area || trabajador.trabajadorArea || 'Sin área';
      if (!areasMap[area]) {
        areasMap[area] = { presentes: 0, tardanzas: 0, faltas: 0 };
      }
      areasMap[area].presentes += trabajador.diasPresente || 0;
      areasMap[area].tardanzas += trabajador.diasTardanza || 0;
      areasMap[area].faltas += trabajador.diasFalta || 0;
    });
    
    const labels = Object.keys(areasMap);
    const presentes = labels.map(area => areasMap[area].presentes);
    const tardanzas = labels.map(area => areasMap[area].tardanzas);
    const faltas = labels.map(area => areasMap[area].faltas);
    
    // Si no hay datos, retornar un área por defecto
    if (labels.length === 0) {
      return {
        labels: ['Sin datos'],
        presentes: [0],
        tardanzas: [0],
        faltas: [0]
      };
    }
    
    return { labels, presentes, tardanzas, faltas };
  }
  
  prepararDatosAnalisisTardanzas(): any {
    // Obtener top 10 trabajadores con más tardanzas
    const trabajadoresConTardanzas = this.trabajadoresDetalle
      .filter(t => (t.diasTardanza || 0) > 0)
      .sort((a, b) => (b.diasTardanza || 0) - (a.diasTardanza || 0))
      .slice(0, 10);
    
    // Si no hay trabajadores con tardanzas, mostrar un mensaje
    if (trabajadoresConTardanzas.length === 0) {
      return {
        labels: ['Sin tardanzas registradas'],
        values: [0],
        colors: ['#10b981']
      };
    }
    
    const labels = trabajadoresConTardanzas.map(t => {
      const nombre = t.nombreCompleto || t.trabajadorNombre || 'Sin nombre';
      return nombre.length > 25 ? nombre.substring(0, 22) + '...' : nombre;
    });
    const values = trabajadoresConTardanzas.map(t => t.diasTardanza || 0);
    const colors = values.map(v => {
      if (v >= 5) return '#ef4444';
      if (v >= 3) return '#f59e0b';
      return '#eab308';
    });
    
    return { labels, values, colors };
  }
  
  // =====================================================
  // MÉTODOS DE EXPORTACIÓN
  // =====================================================
  exportarExcel(): void {
    console.log('📊 Exportando a Excel...');
    // Implementar exportación a Excel
  }
  
  exportarPDF(): void {
    console.log('📄 Exportando a PDF...');
    // Implementar exportación a PDF
  }

  imprimirReporte(): void {
    if (!this.trabajadorSeleccionado) {
      alert('No hay trabajador seleccionado');
      return;
    }

    // Crear contenido HTML para imprimir
    const contenido = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Asistencia - ${this.trabajadorSeleccionado.trabajadorNombre}</title>
        <style>
          @media print {
            @page {
              margin: 1cm;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
            }
          }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .header h2 {
            margin: 10px 0;
            font-size: 18px;
            color: #666;
          }
          .trabajador-info {
            margin-bottom: 20px;
            padding: 15px;
            background: #f5f5f5;
            border-radius: 5px;
          }
          .trabajador-info h3 {
            margin: 0 0 10px 0;
            font-size: 18px;
          }
          .trabajador-info p {
            margin: 5px 0;
            font-size: 14px;
          }
          .estadisticas {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          .stat-box {
            padding: 15px;
            background: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 5px;
            text-align: center;
          }
          .stat-box__label {
            display: block;
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
          }
          .stat-box__value {
            display: block;
            font-size: 24px;
            font-weight: bold;
            color: #333;
          }
          .stat-box__value--success { color: #22c55e; }
          .stat-box__value--warning { color: #f59e0b; }
          .stat-box__value--danger { color: #ef4444; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            font-size: 11px;
          }
          th {
            background: #333;
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background: #f9f9f9;
          }
          .badge {
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
          }
          .badge--presente { background: #d1fae5; color: #065f46; }
          .badge--tardanza { background: #fef3c7; color: #92400e; }
          .badge--falta { background: #fee2e2; color: #991b1b; }
          .badge--permiso { background: #dbeafe; color: #1e40af; }
          .badge--licencia { background: #e9d5ff; color: #6b21a8; }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>REPORTE DE ASISTENCIA MENSUAL</h1>
          <h2>${this.nombreMesActual} ${this.filtros.anio}</h2>
        </div>
        
        <div class="trabajador-info">
          <h3>${this.trabajadorSeleccionado.trabajadorNombre}</h3>
          <p><strong>DNI:</strong> ${this.trabajadorSeleccionado.trabajadorDni || 'N/A'}</p>
          <p><strong>Cargo:</strong> ${this.trabajadorSeleccionado.trabajadorCargo || 'N/A'}</p>
          <p><strong>Área:</strong> ${this.trabajadorSeleccionado.trabajadorArea || 'Sin área'}</p>
        </div>
        
        <div class="estadisticas">
          <div class="stat-box">
            <span class="stat-box__label">Días Presente</span>
            <span class="stat-box__value stat-box__value--success">${this.trabajadorSeleccionado.diasPresente || 0}</span>
          </div>
          <div class="stat-box">
            <span class="stat-box__label">Tardanzas</span>
            <span class="stat-box__value stat-box__value--warning">${this.trabajadorSeleccionado.diasTardanza || 0}</span>
          </div>
          <div class="stat-box">
            <span class="stat-box__label">Faltas</span>
            <span class="stat-box__value stat-box__value--danger">${this.trabajadorSeleccionado.diasFalta || 0}</span>
          </div>
          <div class="stat-box">
            <span class="stat-box__label">% Asistencia</span>
            <span class="stat-box__value">${this.trabajadorSeleccionado.porcentajeAsistencia || 0}%</span>
          </div>
          <div class="stat-box">
            <span class="stat-box__label">% Puntualidad</span>
            <span class="stat-box__value">${this.trabajadorSeleccionado.porcentajePuntualidad || 0}%</span>
          </div>
          <div class="stat-box">
            <span class="stat-box__label">Horas Trabajadas</span>
            <span class="stat-box__value">${this.trabajadorSeleccionado.totalHorasTrabajadas || 0}h</span>
          </div>
        </div>
        
        <h3>Registro Detallado Diario</h3>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Día</th>
              <th>Estado</th>
              <th>Entrada Mañana</th>
              <th>Salida Mañana</th>
              <th>Entrada Tarde</th>
              <th>Salida Tarde</th>
              <th>Horas</th>
              <th>Retraso</th>
            </tr>
          </thead>
          <tbody>
            ${(this.trabajadorSeleccionado.detallesDiarios || []).map((detalle: any) => `
              <tr>
                <td>${this.formatearFecha(detalle.fecha)}</td>
                <td>${detalle.diaSemana || 'N/A'}</td>
                <td><span class="badge badge--${(detalle.estado || 'sin-registro').toLowerCase()}">${detalle.estado || 'Sin registro'}</span></td>
                <td>${detalle.horaEntradaManana || detalle.horaEntrada || '---'}</td>
                <td>${detalle.horaSalidaManana || detalle.horaSalida || '---'}</td>
                <td>${detalle.horaEntradaTarde || '---'}</td>
                <td>${detalle.horaSalidaTarde || '---'}</td>
                <td>${detalle.horasTrabajadas || 0}h${detalle.horasExtras > 0 ? ' +' + detalle.horasExtras + 'h' : ''}</td>
                <td>${(detalle.minutosRetraso || detalle.minutosTardanza || 0) > 0 ? '+' + (detalle.minutosRetraso || detalle.minutosTardanza) + 'min' : '---'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Generado el ${new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          <p>GESTORPLAN - Sistema de Planillas</p>
        </div>
      </body>
      </html>
    `;

    // Abrir ventana de impresión
    const ventanaImpresion = window.open('', '_blank');
    if (ventanaImpresion) {
      ventanaImpresion.document.write(contenido);
      ventanaImpresion.document.close();
      
      // Esperar a que se cargue el contenido y luego imprimir
      ventanaImpresion.onload = () => {
        setTimeout(() => {
          ventanaImpresion.print();
        }, 250);
      };
    }
  }
  
  // =====================================================
  // MÉTODOS DE FILTROS
  // =====================================================
  aplicarFiltros(): void {
    console.log('🔍 Aplicando filtros:', this.filtros);
    
    let resultado = [...this.trabajadoresDetalle];
    
    // Filtro por búsqueda
    if (this.filtros.busqueda) {
      const busqueda = this.filtros.busqueda.toLowerCase();
      resultado = resultado.filter(t =>
        t.nombreCompleto.toLowerCase().includes(busqueda) ||
        t.dni.includes(busqueda) ||
        t.area.toLowerCase().includes(busqueda) ||
        t.cargo.toLowerCase().includes(busqueda)
      );
    }
    
    // Filtro por área
    if (this.filtros.area) {
      resultado = resultado.filter(t => t.area === this.filtros.area);
    }
    
    // Ordenamiento
    resultado.sort((a, b) => {
      switch (this.filtros.ordenarPor) {
        case 'asistencia':
          return b.porcentajeAsistencia - a.porcentajeAsistencia;
        case 'tardanzas':
          return b.diasTardanza - a.diasTardanza;
        case 'faltas':
          return b.diasFalta - a.diasFalta;
        default:
          return a.nombreCompleto.localeCompare(b.nombreCompleto);
      }
    });
    
    this.trabajadoresFiltrados = resultado;
    console.log('📊 Trabajadores filtrados:', this.trabajadoresFiltrados.length);
  }
  
  limpiarFiltros(): void {
    this.filtros = {
      mes: new Date().getMonth() + 1,
      anio: new Date().getFullYear(),
      area: '',
      ordenarPor: 'nombre',
      busqueda: ''
    };
    this.aplicarFiltros();
  }
  
  // =====================================================
  // GETTERS
  // =====================================================
  get nombreMesActual(): string {
    // Asegurar que filtros.mes sea un número para la comparación
    const mesNumero = typeof this.filtros.mes === 'string' ? parseInt(this.filtros.mes, 10) : this.filtros.mes;
    const nombre = this.meses.find(m => m.valor === mesNumero)?.nombre || '';
    
    // Si no se encuentra, intentar buscar por string también
    if (!nombre && this.meses.length > 0) {
      const nombreAlternativo = this.meses.find(m => String(m.valor) === String(this.filtros.mes))?.nombre || '';
      if (nombreAlternativo) {
        console.log('🔍 nombreMesActual - encontrado con conversión de tipo');
        return nombreAlternativo;
      }
    }
    
    console.log('🔍 nombreMesActual getter - mes:', this.filtros.mes, 'mesNumero:', mesNumero, 'nombre:', nombre);
    return nombre || 'Mes desconocido';
  }
  
  get resumenGeneral(): any {
    if (!this.resumenMensual) return null;
    
    return {
      ...this.resumenMensual.estadisticas,
      trabajadoresDestacados: this.trabajadoresDestacados,
      trabajadoresAlerta: this.trabajadoresAlerta,
      diasHabiles: this.resumenMensual.periodo?.diasHabiles || 0
    };
  }
  
  get resumenTrabajadoresFiltrados(): any[] {
    return this.trabajadoresFiltrados;
  }
  
  // =====================================================
  // MÉTODOS DE UTILIDAD
  // =====================================================
  getEstadoBadgeClass(porcentaje: number): string {
    if (porcentaje >= 95) return 'badge--excelente';
    if (porcentaje >= 90) return 'badge--bueno';
    if (porcentaje >= 80) return 'badge--regular';
    return 'badge--malo';
  }
  
  getEstadoCalendarioClass(estado: string): string {
    switch (estado) {
      case 'Presente': return 'calendario-dia--presente';
      case 'Tardanza': return 'calendario-dia--tardanza';
      case 'Falta': return 'calendario-dia--falta';
      case 'Permiso': return 'calendario-dia--permiso';
      case 'Licencia': return 'calendario-dia--licencia';
      case 'Vacaciones': return 'calendario-dia--vacaciones';
      case 'Comision': return 'calendario-dia--comision';
      default: return 'calendario-dia--sin-registro';
    }
  }
}