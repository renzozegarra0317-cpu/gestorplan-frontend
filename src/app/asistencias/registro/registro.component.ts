import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { 
  RegistroAsistencia, 
  ConfiguracionHorario, 
  ResumenDiario, 
  FiltrosAsistencia,
  HORARIO_DEFAULT,
  TIPOS_JUSTIFICACION
} from './asistencia.interface';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('0.4s cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('0.3s cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'translateX(100%)' }))
      ])
    ]),
    trigger('scaleInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9) translateY(-20px)' }),
        animate('0.3s cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ]),
      transition(':leave', [
        animate('0.2s cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'scale(0.9) translateY(-20px)' }))
      ])
    ])
  ]
})
export class RegistroComponent implements OnInit {
  // Fecha actual
  fechaSeleccionada: string = '';
  horaActual: string = '';
  horaCompleta: string = '';
  minutos: string = '';
  segundos: string = '';
  ampm: string = '';
  diaSemana: string = '';
  diaMes: string = '';
  mesNombre: string = '';
  anio: string = '';
  fechaCompleta: string = '';
  
  // Datos
  registros: RegistroAsistencia[] = [];
  registrosFiltrados: RegistroAsistencia[] = [];
  resumenDiario: ResumenDiario | null = null;
  
  // Configuración
  horario: ConfiguracionHorario = HORARIO_DEFAULT;
  tiposJustificacion = TIPOS_JUSTIFICACION;
  
  // Filtros
  filtros: FiltrosAsistencia = {
    fecha: '',
    estado: '',
    regimenLaboral: '',
    busqueda: ''
  };
  
  // Regímenes laborales disponibles
  regimenesLaborales: any[] = [];
  
  // Estado
  cargando: boolean = false;
  vistaActual: 'lista' | 'tarjetas' | 'calendario' = 'lista';
  mostrarModalRegistro: boolean = false;
  mostrarModalJustificacion: boolean = false;
  mostrarModalEdicion: boolean = false;
  mostrarModalTardanza: boolean = false;
  mostrarModalPermiso: boolean = false;
  mostrarModalLicencia: boolean = false;
  mostrarModalHorariosMasivos: boolean = false;
  
  // Registro seleccionado
  registroSeleccionado: RegistroAsistencia | null = null;
  
  // Formulario de horarios masivos
  formHorariosMasivos: any = {
    tipoAsignacion: 'todos', // 'todos' | 'regimen'
    regimenLaboralId: null,
    horaEntradaManana: '08:00',
    horaSalidaManana: '13:00',
    horaEntradaTarde: '14:00',
    horaSalidaTarde: '17:00'
  };
  
  // Menú de acciones
  menuAbiertoId: string | number | null = null;
  
  // Sistema de notificaciones
  notificacion: {
    mostrar: boolean;
    tipo: 'success' | 'error' | 'warning' | 'info' | 'loading';
    titulo: string;
    mensaje: string;
    duracion?: number;
  } = {
    mostrar: false,
    tipo: 'info',
    titulo: '',
    mensaje: ''
  };
  
  // Modal de confirmación
  confirmacion: {
    mostrar: boolean;
    titulo: string;
    mensaje: string;
    tipo: 'success' | 'danger' | 'warning' | 'info';
    onConfirm?: () => void;
    onCancel?: () => void;
  } = {
    mostrar: false,
    titulo: '',
    mensaje: '',
    tipo: 'info'
  };
  
  // Estado de carga por acción
  procesandoAccion: {
    tipo: string | null;
    registroId: string | number | null;
  } = {
    tipo: null,
    registroId: null
  };
  
  // Formularios modales
  formTardanza: any = {
    horaEntradaManana: '',
    minutosRetraso: 0,
    observaciones: ''
  };
  
  formPermiso: any = {
    tipoPermiso: 'Medio día',
    horas: '',
    motivo: '',
    observaciones: ''
  };
  
  formLicencia: any = {
    tipoLicencia: 'Con goce de haber',
    dias: 1,
    motivo: '',
    observaciones: ''
  };
  
  // Áreas disponibles
  areas: string[] = [
    'Gerencia Municipal',
    'Oficina de Recursos Humanos',
    'Oficina de Administración',
    'Gerencia de Desarrollo Social',
    'Gerencia de Infraestructura',
    'Serenazgo',
    'Registro Civil'
  ];
  
  // Estados
  estados: string[] = [
    'Presente',
    'Tardanza',
    'Falta',
    'Permiso',
    'Licencia',
    'Vacaciones',
    'Comision'
  ];

  // API URLs
  private apiAsistencias = `${environment.apiUrl}/asistencias`;
  private apiTrabajadores = `${environment.apiUrl}/trabajadores`;
  private apiRegimenesLaborales = `${environment.apiUrl}/regimenes-laborales`;

  // Trabajadores activos
  trabajadoresActivos: any[] = [];

  // Formulario de registro manual
  formularioRegistro = {
    trabajadorId: '',
    fecha: '',
    horaEntradaManana: '',
    horaSalidaManana: '',
    horaEntradaTarde: '',
    horaSalidaTarde: '',
    tipoMarcacion: 'Presente',
    justificacion: '',
    motivoJustificacion: '',
    observaciones: ''
  };

  constructor(
    private router: Router, 
    private http: HttpClient,
    private sanitizer: DomSanitizer
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
    
    this.inicializarFecha();
    this.inicializarReloj();
    this.cargarRegimenesLaborales();
    this.cargarAsistencias();
  }
  
  cargarRegimenesLaborales(): void {
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.http.get(`${this.apiRegimenesLaborales}`, { headers }).subscribe({
      next: (response: any) => {
        console.log('📋 Regímenes laborales cargados:', response.data);
        this.regimenesLaborales = response.data || [];
      },
      error: (error) => {
        console.error('❌ Error al cargar regímenes laborales:', error);
        this.regimenesLaborales = [];
      }
    });
  }

  inicializarFecha(): void {
    const hoy = new Date();
    this.fechaSeleccionada = this.formatearFecha(hoy);
    this.filtros.fecha = this.fechaSeleccionada;
  }

  inicializarReloj(): void {
    this.actualizarHora();
    setInterval(() => {
      this.actualizarHora();
    }, 1000);
  }

  actualizarHora(): void {
    const ahora = new Date();
    
    // Obtener componentes de la hora
    let horas = ahora.getHours();
    const minutosNum = ahora.getMinutes();
    const segundosNum = ahora.getSeconds();
    
    // Formato 12 horas con AM/PM
    this.ampm = horas >= 12 ? 'p. m.' : 'a. m.';
    horas = horas % 12;
    horas = horas ? horas : 12; // 0 debería ser 12
    
    // Formatear con ceros a la izquierda
    this.horaCompleta = String(horas).padStart(2, '0');
    this.minutos = String(minutosNum).padStart(2, '0');
    this.segundos = String(segundosNum).padStart(2, '0');
    
    // Hora completa para mostrar
    this.horaActual = `${this.horaCompleta}:${this.minutos}:${this.segundos} ${this.ampm}`;
    
    // Información de fecha
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    this.diaSemana = diasSemana[ahora.getDay()];
    this.diaMes = String(ahora.getDate()).padStart(2, '0');
    this.mesNombre = meses[ahora.getMonth()];
    this.anio = String(ahora.getFullYear());
    
    // Fecha completa formateada
    this.fechaCompleta = `${this.diaSemana}, ${this.diaMes} de ${this.mesNombre} de ${this.anio}`;
    
    // Mantener compatibilidad con fechaSeleccionada
    if (!this.fechaSeleccionada) {
      this.fechaSeleccionada = this.formatearFecha(ahora);
    }
  }

  formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  cargarAsistencias(): void {
    // Limpiar cache cuando se cargan asistencias (puede haber cambiado la fecha)
    this._esDiaNoHabilCache = null;
    
    this.cargando = true;
    
    console.log('📋 Cargando asistencias para:', this.fechaSeleccionada);
    console.log('🌐 URL del backend:', `${this.apiAsistencias}/fecha/${this.fechaSeleccionada}`);
    
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    // Cargar asistencias del backend
    this.http.get(`${this.apiAsistencias}/fecha/${this.fechaSeleccionada}`, {
      headers,
      params: {
        estado: this.filtros.estado || '',
        regimenLaboral: this.filtros.regimenLaboral || '',
        busqueda: this.filtros.busqueda || ''
      }
    }).subscribe({
      next: (response: any) => {
        console.log('✅ Asistencias cargadas del backend:', response);
        console.log('📊 Datos recibidos:', response.data);
        
        // Mapear y normalizar los datos del backend
        this.registros = (response.data || []).map((item: any) => {
          // Normalizar fecha (desde SQL Server viene como string ISO o Date object)
          let fechaNormalizada = this.fechaSeleccionada;
          if (item.fecha) {
            if (typeof item.fecha === 'string') {
              // Si viene como "2025-10-30T00:00:00.000Z", tomar solo la parte de fecha
              fechaNormalizada = item.fecha.split('T')[0];
            } else if (item.fecha instanceof Date) {
              fechaNormalizada = this.formatearFecha(item.fecha);
            }
          }
          
          // Crear objeto normalizado
          const registro = {
            id: item.id,
            trabajadorId: item.trabajadorId,
            trabajadorDni: item.trabajadorDni,
            trabajadorNombre: item.trabajadorNombre,
            trabajadorArea: item.trabajadorArea,
            trabajadorCargo: item.trabajadorCargo,
            trabajadorRegimenLaboral: item.regimenLaboralNombre || null,
            fecha: fechaNormalizada,
            // Horas registradas del día (pueden ser null si es falta)
            horaEntradaManana: item.horaEntradaManana || null,
            horaSalidaManana: item.horaSalidaManana || null,
            horaEntradaTarde: item.horaEntradaTarde || null,
            horaSalidaTarde: item.horaSalidaTarde || null,
            // Horarios asignados del trabajador (si vienen del backend)
            horarioAsignadoEntradaManana: item.horarioAsignadoEntradaManana || item.horaEntradaManana || null,
            horarioAsignadoSalidaManana: item.horarioAsignadoSalidaManana || item.horaSalidaManana || null,
            horarioAsignadoEntradaTarde: item.horarioAsignadoEntradaTarde || item.horaEntradaTarde || null,
            horarioAsignadoSalidaTarde: item.horarioAsignadoSalidaTarde || item.horaSalidaTarde || null,
            tipoMarcacion: item.tipoMarcacion || null, // Backend devuelve esto
            estado: this.mapearEstado(item.estado, item.tipoMarcacion, item.horaEntradaManana), // Mapear estado correctamente
            minutosRetraso: item.minutosTardanza || 0,
            horasTrabajadas: 0, // Se calculará después si es necesario
            horasExtras: 0,
            tieneJustificacion: !!item.justificacion,
            motivoJustificacion: item.motivoJustificacion || '',
            observaciones: item.observaciones || '',
            registradoPor: item.usuarioRegistro || 'sistema',
            fechaRegistro: item.fechaRegistro ? new Date(item.fechaRegistro) : new Date()
          };
          
          console.log('🔍 Registro normalizado:', registro);
          return registro;
        });
        
        console.log('📋 Total registros mapeados:', this.registros.length);

        // Paso 2: traer todos los trabajadores activos y combinar
        // Obtener trabajadores activos desde el módulo de trabajadores (fuente de verdad)
        this.http.get(`${this.apiTrabajadores}`, { headers }).subscribe({
          next: (respTrab: any) => {
            const lista = respTrab?.data || [];
            // Filtrar activos reales (excluye datos DEMO creados por scripts)
            this.trabajadoresActivos = lista.filter((t: any) => {
              const esActivo = t.Activo === true || t.Activo === 1 || t.Activo === '1' || t.Activo === undefined;
              const creador = (t.UsuarioCreacion || '').toString().toUpperCase();
              const codigo = (t.Codigo || '').toString().toUpperCase();
              const esDemo = creador.includes('DEMO') || codigo.startsWith('DEMO');
              return esActivo && !esDemo;
            });
            console.log('👥 Trabajadores activos (para combinar asistencia):', this.trabajadoresActivos.length);
            
            // Debug: Verificar horarios de los primeros trabajadores
            if (this.trabajadoresActivos.length > 0) {
              console.log('🕐 Verificando horarios asignados en trabajadores activos:');
              this.trabajadoresActivos.slice(0, 3).forEach((t: any, index: number) => {
                console.log(`  Trabajador ${index + 1} (${t.Nombres || t.nombres}):`, {
                  entradaManana: t.HorarioHabitualEntradaManana || t.horarioHabitualEntradaManana,
                  salidaManana: t.HorarioHabitualSalidaManana || t.horarioHabitualSalidaManana,
                  entradaTarde: t.HorarioHabitualEntradaTarde || t.horarioHabitualEntradaTarde,
                  salidaTarde: t.HorarioHabitualSalidaTarde || t.horarioHabitualSalidaTarde
                });
              });
            }

            // Conjuntos de IDs activos y presentes
            const activosIds = new Set(
              this.trabajadoresActivos.map((t: any) => t.TrabajadorID || t.trabajadorId || t.id)
            );
            // Filtrar registros del backend: conservar SOLO los que pertenecen a activos
            this.registros = (this.registros || []).filter(r => activosIds.has(r.trabajadorId));
            
            // Actualizar los registros existentes con los horarios asignados de los trabajadores
            // SIEMPRE actualizar los horarios asignados desde el trabajador (para reflejar cambios masivos)
            this.registros = this.registros.map(registro => {
              const trabajador = this.trabajadoresActivos.find((t: any) => {
                const trabajadorId = t.TrabajadorID || t.trabajadorId || t.id;
                return trabajadorId === registro.trabajadorId;
              });
              
              if (trabajador) {
                // SIEMPRE actualizar los horarios asignados desde el trabajador (sobrescribir)
                // Verificar todas las posibles variaciones de nombres de campos
                const horarioAsignadoEntradaManana = trabajador.HorarioHabitualEntradaManana || 
                                                      trabajador.horarioHabitualEntradaManana || 
                                                      trabajador.HorarioHabitualEntradaManana || 
                                                      null;
                const horarioAsignadoSalidaManana = trabajador.HorarioHabitualSalidaManana || 
                                                     trabajador.horarioHabitualSalidaManana || 
                                                     trabajador.HorarioHabitualSalidaManana || 
                                                     null;
                const horarioAsignadoEntradaTarde = trabajador.HorarioHabitualEntradaTarde || 
                                                     trabajador.horarioHabitualEntradaTarde || 
                                                     trabajador.HorarioHabitualEntradaTarde || 
                                                     null;
                const horarioAsignadoSalidaTarde = trabajador.HorarioHabitualSalidaTarde || 
                                                    trabajador.horarioHabitualSalidaTarde || 
                                                    trabajador.HorarioHabitualSalidaTarde || 
                                                    null;
                
                // SIEMPRE actualizar los horarios asignados (no solo si no existen)
                // Esto asegura que los horarios masivos se reflejen inmediatamente
                registro.horarioAsignadoEntradaManana = horarioAsignadoEntradaManana;
                registro.horarioAsignadoSalidaManana = horarioAsignadoSalidaManana;
                registro.horarioAsignadoEntradaTarde = horarioAsignadoEntradaTarde;
                registro.horarioAsignadoSalidaTarde = horarioAsignadoSalidaTarde;
                
                // Debug solo para los primeros 3 registros
                if (this.registros.indexOf(registro) < 3) {
                  console.log(`🕐 Horarios actualizados para ${registro.trabajadorNombre}:`, {
                    entradaManana: horarioAsignadoEntradaManana,
                    salidaManana: horarioAsignadoSalidaManana,
                    entradaTarde: horarioAsignadoEntradaTarde,
                    salidaTarde: horarioAsignadoSalidaTarde
                  });
                }
              } else {
                // Si no se encuentra el trabajador, log de advertencia
                console.warn(`⚠️ No se encontró trabajador activo para registro ID: ${registro.trabajadorId}`);
              }
              
              return registro;
            });
            
            const presentes = new Set(this.registros.map(r => r.trabajadorId));

            // Añadir faltantes con estado "Falta" y horas en '---'
            const registrosCompletos = [...this.registros];
            for (const t of this.trabajadoresActivos) {
              const trabajadorId = t.TrabajadorID || t.trabajadorId || t.id;
              if (!presentes.has(trabajadorId)) {
                const nombre = `${(t.ApellidoPaterno || t.apellidoPaterno || '').trim()} ${(t.ApellidoMaterno || t.apellidoMaterno || '').trim()}, ${(t.Nombres || t.nombres || '').trim()}`.replace(/\s+/g, ' ').trim();
                
                // Obtener horarios asignados del trabajador (si existen en el objeto t)
                // IMPORTANTE: Verificar todas las posibles variaciones de nombres de campos
                const horarioAsignadoEntradaManana = t.HorarioHabitualEntradaManana || t.horarioHabitualEntradaManana || null;
                const horarioAsignadoSalidaManana = t.HorarioHabitualSalidaManana || t.horarioHabitualSalidaManana || null;
                const horarioAsignadoEntradaTarde = t.HorarioHabitualEntradaTarde || t.horarioHabitualEntradaTarde || null;
                const horarioAsignadoSalidaTarde = t.HorarioHabitualSalidaTarde || t.horarioHabitualSalidaTarde || null;
                
                // Debug para los primeros trabajadores faltantes
                if (registrosCompletos.length < 3) {
                  console.log(`🕐 Creando registro para trabajador faltante ${nombre}:`, {
                    entradaManana: horarioAsignadoEntradaManana,
                    salidaManana: horarioAsignadoSalidaManana,
                    entradaTarde: horarioAsignadoEntradaTarde,
                    salidaTarde: horarioAsignadoSalidaTarde,
                    trabajadorData: {
                      HorarioHabitualEntradaManana: t.HorarioHabitualEntradaManana,
                      horarioHabitualEntradaManana: t.horarioHabitualEntradaManana,
                      todasLasPropiedades: Object.keys(t).filter(k => k.toLowerCase().includes('horario'))
                    }
                  });
                }
                
                registrosCompletos.push({
                  id: 0,
                  fecha: this.fechaSeleccionada,
                  trabajadorId,
                  trabajadorDni: t.NumeroDocumento || t.dni || '',
                  trabajadorNombre: nombre,
                  trabajadorArea: t.AreaNombre || t.areaNombre || t.area || '',
                  trabajadorCargo: (t.CargoNombre || t.cargoNombre || t.cargo || '').toUpperCase(),
                  trabajadorRegimenLaboral: t.RegimenLaboralNombre || t.regimenLaboralNombre || null,
                  // Horas registradas (null porque es falta)
                  horaEntradaManana: null,
                  horaSalidaManana: null,
                  horaEntradaTarde: null,
                  horaSalidaTarde: null,
                  // Horarios asignados del trabajador
                  horarioAsignadoEntradaManana: horarioAsignadoEntradaManana,
                  horarioAsignadoSalidaManana: horarioAsignadoSalidaManana,
                  horarioAsignadoEntradaTarde: horarioAsignadoEntradaTarde,
                  horarioAsignadoSalidaTarde: horarioAsignadoSalidaTarde,
                  estado: 'Falta',
                  tipoMarcacion: 'Sistema',
                  minutosRetraso: 0,
                  horasTrabajadas: 0,
                  horasExtras: 0,
                  tieneJustificacion: false,
                  motivoJustificacion: '',
                  documentoJustificacion: '',
                  observaciones: '',
                  registradoPor: 'sistema',
                  fechaRegistro: new Date()
                });
              }
            }

            // Asignar lista completa y refrescar vistas/resumen
            this.registros = registrosCompletos;
            this.registrosFiltrados = [...this.registros];
            this.cargando = false;
            
            console.log('📋 Registros finales antes de calcular resumen:', this.registros.length);
            console.log('📋 Primer registro final:', this.registros[0]);
            
            // Llamar a actualizarResumenDesdeRegistros directamente (ya no llamar cargarResumenDiario que usa backend)
            this.actualizarResumenDesdeRegistros();
          },
          error: (e) => {
            console.warn('⚠️ No se pudo cargar trabajadores activos, usando solo registros del día:', e);
            this.registrosFiltrados = [...this.registros];
            this.cargando = false;
            this.cargarResumenDiario();
          }
        });
      },
      error: (error) => {
        console.error('❌ Error al cargar asistencias:', error);
        console.error('🔍 Detalles del error:', error);
        // Si falla, intentar al menos listar todos los trabajadores activos para que el total coincida
        this.http.get(`${this.apiTrabajadores}`, { headers }).subscribe({
          next: (respTrab: any) => {
            const lista = respTrab?.data || [];
            this.trabajadoresActivos = lista.filter((t: any) => {
              const esActivo = t.Activo === true || t.Activo === 1 || t.Activo === '1' || t.Activo === undefined;
              const creador = (t.UsuarioCreacion || '').toString().toUpperCase();
              const codigo = (t.Codigo || '').toString().toUpperCase();
              const esDemo = creador.includes('DEMO') || codigo.startsWith('DEMO');
              return esActivo && !esDemo;
            });
            this.registros = (this.trabajadoresActivos || []).map((t: any) => ({
              id: 0,
              fecha: this.fechaSeleccionada,
              trabajadorId: t.TrabajadorID || t.trabajadorId || t.id,
              trabajadorDni: t.NumeroDocumento || t.dni || '',
              trabajadorNombre: `${(t.ApellidoPaterno || '').trim()} ${(t.ApellidoMaterno || '').trim()}, ${(t.Nombres || '').trim()}`.replace(/\s+/g, ' ').trim(),
              trabajadorArea: t.AreaNombre || t.areaNombre || t.area || '',
              trabajadorCargo: (t.CargoNombre || t.cargoNombre || t.cargo || '').toUpperCase(),
              horaEntradaManana: '---',
              horaSalidaManana: '---',
              horaEntradaTarde: '---',
              horaSalidaTarde: '---',
              estado: 'Falta',
              tipoMarcacion: 'Sistema',
              minutosRetraso: 0,
              horasTrabajadas: 0,
              horasExtras: 0,
              tieneJustificacion: false,
              motivoJustificacion: '',
              documentoJustificacion: '',
              observaciones: '',
              registradoPor: 'sistema',
              fechaRegistro: new Date()
            }));
            this.registrosFiltrados = [...this.registros];
            this.cargando = false;
            this.cargarResumenDiario();
          },
          error: () => {
            this.cargando = false;
            console.log('⚠️ Cargando datos de ejemplo debido al error');
            this.cargarDatosEjemplo();
          }
        });
      }
    });
  }

  cargarResumenDiario(): void {
    console.log('📊 Cargando resumen diario para:', this.fechaSeleccionada);
    console.log('🌐 URL del resumen:', `${this.apiAsistencias}/resumen/${this.fechaSeleccionada}`);
    
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    // Intentar cargar del backend (para futuras mejoras), pero SIEMPRE recalcular desde registros locales
    this.http.get(`${this.apiAsistencias}/resumen/${this.fechaSeleccionada}`, { headers }).subscribe({
      next: (response: any) => {
        console.log('📊 Resumen diario cargado exitosamente del backend:', response);
        // IGNORAR completamente el resumen del backend
        // Calcular TODO desde los registros locales que ya están filtrados por fecha
        this.actualizarResumenDesdeRegistros();
      },
      error: (error) => {
        console.error('❌ Error al cargar resumen:', error);
        console.log('⚠️ Calculando resumen desde registros locales');
        this.actualizarResumenDesdeRegistros();
      }
    });
  }

  actualizarResumenDesdeRegistros(): void {
    // Filtrar registros SOLO del día seleccionado (por si acaso)
    const registrosDia = this.registros.filter(r => {
      // Normalizar fecha para comparar (fecha siempre es string en la interfaz)
      let fechaRegistro = r.fecha;
      if (typeof fechaRegistro === 'string') {
        // Si viene como "2025-10-30T00:00:00.000Z", tomar solo la parte de fecha
        if (fechaRegistro.includes('T')) {
          fechaRegistro = fechaRegistro.split('T')[0];
        }
      }
      return fechaRegistro === this.fechaSeleccionada;
    });
    
    console.log('🔍 Fecha seleccionada:', this.fechaSeleccionada);
    console.log('🔍 Registros totales:', this.registros.length);
    console.log('🔍 Registros del día filtrados:', registrosDia.length);
    
    if (registrosDia.length > 0) {
      console.log('🔍 Primer registro del día:', registrosDia[0]);
      console.log('🔍 Primer registro - estado:', registrosDia[0].estado);
      console.log('🔍 Primer registro - tipoMarcacion:', registrosDia[0].tipoMarcacion);
      console.log('🔍 Primer registro - horas:', {
        entradaManana: registrosDia[0].horaEntradaManana,
        entradaTarde: registrosDia[0].horaEntradaTarde
      });
    }
    
    const total = this.trabajadoresActivos?.length || registrosDia.length;
    
    // IMPORTANTE: El backend devuelve:
    // - estado: 'Validado', 'Pendiente', etc. (estado del registro)
    // - tipoMarcacion: 'Presente', 'Tardanza', 'Falta', etc. (tipo de asistencia)
    // Contar por tipoMarcacion PRIMERO, si no existe usar estado como fallback
    
    const presentes = registrosDia.filter(r => {
      // Considerar presente si:
      // 1. tipoMarcacion es 'Presente' O
      // 2. estado es 'Validado' y tiene horas registradas (no es falta)
      const tipoMarc = r.tipoMarcacion;
      const tieneHoras = (r.horaEntradaManana && r.horaEntradaManana !== '---') || 
                        (r.horaEntradaTarde && r.horaEntradaTarde !== '---');
      
      // Si tiene tipoMarcacion, usar eso
      if (tipoMarc === 'Presente') {
        return true;
      }
      
      // Si no tiene tipoMarcacion pero está 'Validado' y tiene horas, es presente
      if (r.estado === 'Validado' && tieneHoras) {
        return true;
      }
      
      // Si el estado directamente es 'Presente' (por compatibilidad)
      if (r.estado === 'Presente') {
        return true;
      }
      
      return false;
    }).length;
    
    const tardanzas = registrosDia.filter(r => {
      return r.tipoMarcacion === 'Tardanza' || r.estado === 'Tardanza';
    }).length;
    
    const faltas = registrosDia.filter(r => {
      const tieneHoras = (r.horaEntradaManana && r.horaEntradaManana !== '---') || 
                        (r.horaEntradaTarde && r.horaEntradaTarde !== '---');
      // Es falta si tipoMarcacion es 'Falta' O estado es 'Falta' O no tiene horas
      return r.tipoMarcacion === 'Falta' || r.estado === 'Falta' || !tieneHoras;
    }).length;
    
    const permisos = registrosDia.filter(r => {
      return r.tipoMarcacion === 'Permiso' || r.estado === 'Permiso';
    }).length;
    
    const licencias = registrosDia.filter(r => {
      return r.tipoMarcacion === 'Licencia' || r.estado === 'Licencia';
    }).length;
    
    const vacaciones = registrosDia.filter(r => {
      return r.tipoMarcacion === 'Vacaciones' || r.estado === 'Vacaciones';
    }).length;
    
    const comisiones = registrosDia.filter(r => {
      return r.tipoMarcacion === 'Comision' || r.estado === 'Comision';
    }).length;
    
    // Calcular porcentaje de asistencia (presentes + tardanzas + comisiones = efectivos)
    const efectivos = presentes + tardanzas + comisiones;
    const porcentaje = total > 0 ? Math.round((efectivos / total) * 100 * 100) / 100 : 0;
    
    this.resumenDiario = {
      fecha: this.fechaSeleccionada,
      totalTrabajadores: total,
      presentes,
      tardanzas,
      faltas,
      permisos,
      licencias,
      vacaciones,
      comisiones,
      porcentajeAsistencia: porcentaje
    };
    
    console.log(`📊 Resumen calculado para ${this.fechaSeleccionada}:`, this.resumenDiario);
    console.log('🔍 Debug - Primer registro:', registrosDia[0]);
    console.log('🔍 Debug - Registros con tipoMarcacion Presente:', registrosDia.filter(r => r.tipoMarcacion === 'Presente').length);
    console.log('🔍 Debug - Registros con estado Validado y horas:', registrosDia.filter(r => {
      const tieneHoras = (r.horaEntradaManana && r.horaEntradaManana !== '---') || 
                         (r.horaEntradaTarde && r.horaEntradaTarde !== '---');
      return r.estado === 'Validado' && tieneHoras;
    }).length);
  }

  cargarTrabajadoresActivos(): void {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.http.get(`${this.apiAsistencias}/trabajadores`, { headers }).subscribe({
      next: (response: any) => {
        console.log('👥 Trabajadores activos cargados:', response.data);
        this.trabajadoresActivos = response.data;
      },
      error: (error) => {
        console.error('❌ Error al cargar trabajadores:', error);
        this.trabajadoresActivos = [];
      }
    });
  }

  cargarDatosEjemplo(): void {
    // Datos de ejemplo para desarrollo
    this.registros = [
      {
        id: 1,
        fecha: this.fechaSeleccionada,
        trabajadorId: 1,
        trabajadorDni: '43256789',
        trabajadorNombre: 'García Rodríguez, Carlos Alberto',
        trabajadorArea: 'Gerencia Municipal',
        trabajadorCargo: 'Gerente Municipal',
        horaEntrada: '07:55',
        horaSalida: '13:05',
        horaEntradaTarde: '14:00',
        horaSalidaTarde: '17:30',
        estado: 'Presente',
        tipoMarcacion: 'Biometrico',
        minutosRetraso: 0,
        horasTrabajadas: 8.5,
        horasExtras: 0,
        tieneJustificacion: false,
        motivoJustificacion: '',
        documentoJustificacion: '',
        observaciones: '',
        ubicacionEntrada: '',
        ubicacionSalida: '',
        registradoPor: 'admin',
        fechaRegistro: new Date(),
        modificadoPor: '',
        fechaModificacion: undefined
      }
    ];
    this.registrosFiltrados = [...this.registros];
    this.cargando = false;
    this.calcularResumen();
  }

  aplicarFiltros(): void {
    // Si se cambia el filtro de régimen laboral, recargar desde el backend
    // porque este filtro afecta qué trabajadores se obtienen
    if (this.filtros.regimenLaboral) {
      this.cargarAsistencias();
      return;
    }
    
    // Para otros filtros (estado, búsqueda), aplicar localmente
    let resultado = [...this.registros];
    
    // Filtro por búsqueda
    if (this.filtros.busqueda) {
      const busqueda = this.filtros.busqueda.toLowerCase();
      resultado = resultado.filter(r =>
        r.trabajadorNombre.toLowerCase().includes(busqueda) ||
        r.trabajadorDni.includes(busqueda) ||
        r.trabajadorArea.toLowerCase().includes(busqueda) ||
        (r.trabajadorRegimenLaboral && r.trabajadorRegimenLaboral.toLowerCase().includes(busqueda))
      );
    }
    
    // Filtro por estado
    if (this.filtros.estado) {
      resultado = resultado.filter(r => r.estado === this.filtros.estado || r.tipoMarcacion === this.filtros.estado);
    }
    
    this.registrosFiltrados = resultado;
  }

  calcularResumen(): void {
    const total = this.registros.length;
    const presentes = this.registros.filter(r => r.estado === 'Presente').length;
    const tardanzas = this.registros.filter(r => r.estado === 'Tardanza').length;
    const faltas = this.registros.filter(r => r.estado === 'Falta').length;
    const permisos = this.registros.filter(r => r.estado === 'Permiso').length;
    const licencias = this.registros.filter(r => r.estado === 'Licencia').length;
    const vacaciones = this.registros.filter(r => r.estado === 'Vacaciones').length;
    const comisiones = this.registros.filter(r => r.estado === 'Comision').length;
    
    const efectivos = presentes + tardanzas + comisiones;
    const porcentaje = total > 0 ? (efectivos / total) * 100 : 0;
    
    this.resumenDiario = {
      fecha: this.fechaSeleccionada,
      totalTrabajadores: total,
      presentes,
      tardanzas,
      faltas,
      permisos,
      licencias,
      vacaciones,
      comisiones,
      porcentajeAsistencia: Math.round(porcentaje * 100) / 100
    };
  }

  cambiarFecha(dias: number): void {
    console.log(`📅 Cambiando fecha: ${this.fechaSeleccionada} ${dias > 0 ? '+' : ''}${dias} días`);
    
    // Parsear la fecha de forma robusta
    const partes = this.fechaSeleccionada.split('-');
    if (partes.length !== 3) {
      console.error('❌ Formato de fecha inválido:', this.fechaSeleccionada);
      return;
    }
    
    // Crear fecha usando componentes (evita problemas de zona horaria)
    const año = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1; // Mes es 0-indexed
    const dia = parseInt(partes[2], 10);
    
    const fecha = new Date(año, mes, dia);
    console.log('📅 Fecha parseada:', fecha);
    
    // Agregar/substraer días
    fecha.setDate(fecha.getDate() + dias);
    console.log('📅 Nueva fecha calculada:', fecha);
    
    // Formatear y actualizar
    this.fechaSeleccionada = this.formatearFecha(fecha);
    this.filtros.fecha = this.fechaSeleccionada;
    // Limpiar cache cuando cambia la fecha
    this._esDiaNoHabilCache = null;
    console.log('📅 Fecha actualizada a:', this.fechaSeleccionada);
    
    this.cargarAsistencias();
  }

  irHoy(): void {
    this.inicializarFecha();
    this.cargarAsistencias();
  }

  registrarAsistenciaManual(): void {
    console.log('📝 Registrando asistencia manual:', this.formularioRegistro);
    
    // Validar formulario
    if (!this.formularioRegistro.trabajadorId || !this.formularioRegistro.fecha) {
      this.mostrarNotificacion('warning', '⚠️ Advertencia', 'Debe seleccionar un trabajador y una fecha', 3000);
      return;
    }
    
    // Preparar datos limpiando campos vacíos
    const datosEnvio = {
      ...this.formularioRegistro,
      horaEntradaManana: this.formularioRegistro.horaEntradaManana && this.formularioRegistro.horaEntradaManana.trim() ? this.formularioRegistro.horaEntradaManana : null,
      horaSalidaManana: this.formularioRegistro.horaSalidaManana && this.formularioRegistro.horaSalidaManana.trim() ? this.formularioRegistro.horaSalidaManana : null,
      horaEntradaTarde: this.formularioRegistro.horaEntradaTarde && this.formularioRegistro.horaEntradaTarde.trim() ? this.formularioRegistro.horaEntradaTarde : null,
      horaSalidaTarde: this.formularioRegistro.horaSalidaTarde && this.formularioRegistro.horaSalidaTarde.trim() ? this.formularioRegistro.horaSalidaTarde : null,
      justificacion: this.formularioRegistro.justificacion && this.formularioRegistro.justificacion.trim() ? this.formularioRegistro.justificacion : null,
      motivoJustificacion: this.formularioRegistro.motivoJustificacion && this.formularioRegistro.motivoJustificacion.trim() ? this.formularioRegistro.motivoJustificacion : null,
      observaciones: this.formularioRegistro.observaciones && this.formularioRegistro.observaciones.trim() ? this.formularioRegistro.observaciones : null
    };
    
    console.log('📤 Datos a enviar:', datosEnvio);
    
    // Enviar al backend
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.http.post(`${this.apiAsistencias}/registrar`, datosEnvio, { headers }).subscribe({
      next: (response: any) => {
        console.log('✅ Asistencia registrada:', response);
        this.mostrarNotificacion('success', '✅ Éxito', 'Asistencia registrada exitosamente', 3000);
        this.mostrarModalRegistro = false;
        this.restaurarTopbarSidebar();
        this.limpiarFormulario();
        this.cargarAsistencias(); // Recargar datos
      },
      error: (error) => {
        console.error('❌ Error al registrar asistencia:', error);
        this.mostrarNotificacion('error', '❌ Error', 'Error al registrar la asistencia: ' + (error.error?.message || error.message), 4000);
      }
    });
  }

  limpiarFormulario(): void {
    this.formularioRegistro = {
      trabajadorId: '',
      fecha: this.fechaSeleccionada,
      horaEntradaManana: '',
      horaSalidaManana: '',
      horaEntradaTarde: '',
      horaSalidaTarde: '',
      tipoMarcacion: 'Presente',
      justificacion: '',
      motivoJustificacion: '',
      observaciones: ''
    };
  }

  abrirModalRegistro(): void {
    this.formularioRegistro.fecha = this.fechaSeleccionada;
    this.cargarTrabajadoresActivos();
    this.mostrarModalRegistro = true;
    
    // CRÍTICO: Reducir z-index del topbar y sidebar cuando el modal está abierto
    setTimeout(() => {
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('modal-open');
      
      const topbar = document.querySelector('app-topbar');
      if (topbar) {
        (topbar as HTMLElement).style.setProperty('z-index', '1', 'important');
        const topbarElement = topbar.querySelector('.topbar');
        if (topbarElement) {
          (topbarElement as HTMLElement).style.setProperty('z-index', '1', 'important');
          (topbarElement as HTMLElement).style.setProperty('pointer-events', 'none', 'important');
        }
      }
      
      const sidebar = document.querySelector('app-sidebar');
      if (sidebar) {
        (sidebar as HTMLElement).style.setProperty('z-index', '1', 'important');
        (sidebar as HTMLElement).style.setProperty('pointer-events', 'none', 'important');
      }
    }, 100);
  }

  restaurarTopbarSidebar(): void {
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

  marcarEntrada(trabajadorId: number): void {
    const ahora = new Date();
    const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
    
    console.log(`Marcar entrada: Trabajador ${trabajadorId} a las ${horaActual}`);
    // Implementar lógica de marcación
  }

  marcarSalida(trabajadorId: number): void {
    const ahora = new Date();
    const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
    
    console.log(`Marcar salida: Trabajador ${trabajadorId} a las ${horaActual}`);
    // Implementar lógica de marcación
  }

  abrirModalJustificacion(registro: RegistroAsistencia): void {
    this.registroSeleccionado = registro;
    this.mostrarModalJustificacion = true;
  }

  guardarJustificacion(): void {
    console.log('Guardar justificación:', this.registroSeleccionado);
    this.mostrarModalJustificacion = false;
    // Implementar lógica de guardado
  }

  // ========================================
  // TARDANZA
  // ========================================
  
  abrirModalTardanza(registro: RegistroAsistencia): void {
    this.registroSeleccionado = registro;
    const ahora = new Date();
    const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
    
    this.formTardanza = {
      horaEntradaManana: registro.horaEntradaManana && registro.horaEntradaManana !== '---' 
        ? registro.horaEntradaManana 
        : horaActual,
      minutosRetraso: registro.minutosTardanza || registro.minutosRetraso || 0,
      observaciones: registro.observaciones || ''
    };
    this.mostrarModalTardanza = true;
  }
  
  guardarTardanza(): void {
    if (!this.registroSeleccionado || !this.formTardanza.horaEntradaManana) {
      this.mostrarNotificacion('warning', '⚠️ Advertencia', 'Por favor complete la hora de entrada', 3000);
      return;
    }
    
    const datos = {
      trabajadorId: this.registroSeleccionado.trabajadorId,
      fecha: this.fechaSeleccionada,
      horaEntradaManana: this.formTardanza.horaEntradaManana,
      horaSalidaManana: this.registroSeleccionado.horaSalidaManana && this.registroSeleccionado.horaSalidaManana !== '---' 
        ? this.registroSeleccionado.horaSalidaManana 
        : null,
      horaEntradaTarde: this.registroSeleccionado.horaEntradaTarde && this.registroSeleccionado.horaEntradaTarde !== '---' 
        ? this.registroSeleccionado.horaEntradaTarde 
        : null,
      horaSalidaTarde: this.registroSeleccionado.horaSalidaTarde && this.registroSeleccionado.horaSalidaTarde !== '---' 
        ? this.registroSeleccionado.horaSalidaTarde 
        : null,
      tipoMarcacion: 'Tardanza',
      minutosTardanza: parseInt(this.formTardanza.minutosRetraso) || 0, // IMPORTANTE: Enviar minutos como número
      observaciones: this.formTardanza.observaciones || 'Marcado como tardanza'
    };
    
    console.log('📤 [Frontend] Enviando datos de tardanza:', {
      trabajadorId: datos.trabajadorId,
      fecha: datos.fecha,
      horaEntradaManana: datos.horaEntradaManana,
      minutosTardanza: datos.minutosTardanza,
      minutosTardanza_TIPO: typeof datos.minutosTardanza,
      formTardanza_minutosRetraso: this.formTardanza.minutosRetraso,
      tipoMarcacion: datos.tipoMarcacion
    });
    
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.iniciarProcesamiento('marcar-tardanza', this.obtenerIdRegistro(this.registroSeleccionado));
    this.mostrarNotificacion('loading', 'Procesando...', `Registrando tardanza para ${this.registroSeleccionado?.trabajadorNombre}`, 0);
    
    this.http.post(`${this.apiAsistencias}/marcar-tardanza`, datos, { headers }).subscribe({
      next: (response: any) => {
        this.finalizarProcesamiento();
        this.cerrarNotificacion();
        this.mostrarNotificacion('success', '✅ Éxito', `${this.registroSeleccionado?.trabajadorNombre} marcado con TARDANZA`, 3000);
        this.mostrarModalTardanza = false;
        this.cargarAsistencias();
      },
      error: (error) => {
        console.error('❌ Error al marcar tardanza:', error);
        this.finalizarProcesamiento();
        this.cerrarNotificacion();
        this.mostrarNotificacion('error', '❌ Error', 'Error al marcar tardanza: ' + (error.error?.message || error.message), 4000);
      }
    });
  }
  
  // ========================================
  // PERMISO
  // ========================================
  
  abrirModalPermiso(registro: RegistroAsistencia): void {
    this.registroSeleccionado = registro;
    this.formPermiso = {
      tipoPermiso: 'Medio día',
      horas: '',
      motivo: '',
      observaciones: ''
    };
    this.mostrarModalPermiso = true;
  }
  
  guardarPermiso(): void {
    if (!this.registroSeleccionado || !this.formPermiso.motivo) {
      this.mostrarNotificacion('warning', '⚠️ Advertencia', 'Por favor complete el motivo del permiso', 3000);
      return;
    }
    
    const datos = {
      trabajadorId: this.registroSeleccionado.trabajadorId,
      fecha: this.fechaSeleccionada,
      tipoPermiso: this.formPermiso.tipoPermiso,
      horas: this.formPermiso.horas || null,
      motivo: this.formPermiso.motivo,
      horaEntradaManana: this.formPermiso.tipoPermiso === 'Todo el día' ? null : 
        (this.registroSeleccionado.horaEntradaManana && this.registroSeleccionado.horaEntradaManana !== '---' 
          ? this.registroSeleccionado.horaEntradaManana 
          : null),
      horaSalidaManana: this.formPermiso.tipoPermiso === 'Todo el día' ? null : 
        (this.registroSeleccionado.horaSalidaManana && this.registroSeleccionado.horaSalidaManana !== '---' 
          ? this.registroSeleccionado.horaSalidaManana 
          : null),
      horaEntradaTarde: this.formPermiso.tipoPermiso === 'Todo el día' ? null : 
        (this.registroSeleccionado.horaEntradaTarde && this.registroSeleccionado.horaEntradaTarde !== '---' 
          ? this.registroSeleccionado.horaEntradaTarde 
          : null),
      horaSalidaTarde: this.formPermiso.tipoPermiso === 'Todo el día' ? null : 
        (this.registroSeleccionado.horaSalidaTarde && this.registroSeleccionado.horaSalidaTarde !== '---' 
          ? this.registroSeleccionado.horaSalidaTarde 
          : null),
      tipoMarcacion: 'Permiso',
      observaciones: this.formPermiso.observaciones || `Permiso: ${this.formPermiso.motivo}`
    };
    
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.iniciarProcesamiento('marcar-permiso', this.obtenerIdRegistro(this.registroSeleccionado));
    this.mostrarNotificacion('loading', 'Procesando...', `Registrando permiso para ${this.registroSeleccionado?.trabajadorNombre}`, 0);
    
    this.http.post(`${this.apiAsistencias}/marcar-permiso`, datos, { headers }).subscribe({
      next: (response: any) => {
        this.finalizarProcesamiento();
        this.cerrarNotificacion();
        this.mostrarNotificacion('success', '✅ Éxito', `${this.registroSeleccionado?.trabajadorNombre} marcado con PERMISO`, 3000);
        this.mostrarModalPermiso = false;
        this.cargarAsistencias();
      },
      error: (error) => {
        console.error('❌ Error al marcar permiso:', error);
        this.finalizarProcesamiento();
        this.cerrarNotificacion();
        this.mostrarNotificacion('error', '❌ Error', 'Error al marcar permiso: ' + (error.error?.message || error.message), 4000);
      }
    });
  }
  
  // ========================================
  // LICENCIA
  // ========================================
  
  abrirModalLicencia(registro: RegistroAsistencia): void {
    this.registroSeleccionado = registro;
    this.formLicencia = {
      tipoLicencia: 'Con goce de haber',
      dias: 1,
      motivo: '',
      observaciones: ''
    };
    this.mostrarModalLicencia = true;
  }
  
  guardarLicencia(): void {
    if (!this.registroSeleccionado || !this.formLicencia.motivo) {
      this.mostrarNotificacion('warning', '⚠️ Advertencia', 'Por favor complete el motivo de la licencia', 3000);
      return;
    }
    
    const datos = {
      trabajadorId: this.registroSeleccionado.trabajadorId,
      fecha: this.fechaSeleccionada,
      tipoLicencia: this.formLicencia.tipoLicencia,
      dias: this.formLicencia.dias,
      motivo: this.formLicencia.motivo,
      horaEntradaManana: null,
      horaSalidaManana: null,
      horaEntradaTarde: null,
      horaSalidaTarde: null,
      tipoMarcacion: 'Licencia',
      observaciones: this.formLicencia.observaciones || `Licencia ${this.formLicencia.tipoLicencia}: ${this.formLicencia.motivo}`
    };
    
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.iniciarProcesamiento('marcar-licencia', this.obtenerIdRegistro(this.registroSeleccionado));
    this.mostrarNotificacion('loading', 'Procesando...', `Registrando licencia para ${this.registroSeleccionado?.trabajadorNombre}`, 0);
    
    this.http.post(`${this.apiAsistencias}/marcar-licencia`, datos, { headers }).subscribe({
      next: (response: any) => {
        this.finalizarProcesamiento();
        this.cerrarNotificacion();
        this.mostrarNotificacion('success', '✅ Éxito', `${this.registroSeleccionado?.trabajadorNombre} marcado con LICENCIA`, 3000);
        this.mostrarModalLicencia = false;
        this.cargarAsistencias();
      },
      error: (error) => {
        console.error('❌ Error al marcar licencia:', error);
        this.finalizarProcesamiento();
        this.cerrarNotificacion();
        this.mostrarNotificacion('error', '❌ Error', 'Error al marcar licencia: ' + (error.error?.message || error.message), 4000);
      }
    });
  }

  exportarExcel(): void {
    console.log('Exportar a Excel:', this.registrosFiltrados.length, 'registros');
    // Implementar exportación
  }

  exportarPDF(): void {
    console.log('Exportar a PDF:', this.registrosFiltrados.length, 'registros');
    // Implementar exportación
  }

  limpiarFiltros(): void {
    this.filtros = {
      fecha: this.fechaSeleccionada,
      estado: '',
      regimenLaboral: '',
      busqueda: ''
    };
    this.aplicarFiltros();
  }

  // Mapear el estado del backend al estado que se muestra en el frontend
  mapearEstado(estadoBackend: string | null, tipoMarcacion: string | null, horaEntrada: string | null): string {
    // Si tiene tipoMarcacion, usar ese
    if (tipoMarcacion) {
      return tipoMarcacion;
    }
    
    // Si no tiene horas de entrada, es falta
    if (!horaEntrada || horaEntrada === '---' || horaEntrada === '--:--') {
      return 'Falta';
    }
    
    // Si el estado del backend es 'Validado' y tiene horas, es Presente
    if (estadoBackend === 'Validado' && horaEntrada) {
      return 'Presente';
    }
    
    // Si el estado del backend es 'Falta', mantenerlo
    if (estadoBackend === 'Falta') {
      return 'Falta';
    }
    
    // Por defecto, usar el estado del backend o 'Falta'
    return estadoBackend || 'Falta';
  }

  getEstadoBadgeClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'Presente': 'badge--presente',
      'Tardanza': 'badge--tardanza',
      'Falta': 'badge--falta',
      'Permiso': 'badge--permiso',
      'Licencia': 'badge--licencia',
      'Vacaciones': 'badge--vacaciones',
      'Comision': 'badge--comision',
      'Validado': '' // Sin color para "Validado" (solo para presentes)
    };
    return clases[estado] || '';
  }

  formatearHora(hora?: string): string {
    return hora || '--:--';
  }

  calcularTiempoTrabajado(entrada?: string, salida?: string): string {
    if (!entrada || !salida) return '--';
    
    const [hE, mE] = entrada.split(':').map(Number);
    const [hS, mS] = salida.split(':').map(Number);
    
    const minutosEntrada = hE * 60 + mE;
    const minutosSalida = hS * 60 + mS;
    const minutosTrabajados = minutosSalida - minutosEntrada;
    
    const horas = Math.floor(minutosTrabajados / 60);
    const minutos = minutosTrabajados % 60;
    
    return `${horas}h ${minutos}m`;
  }

  // ========================================
  // MARCAR / DESMARCAR ASISTENCIA
  // ========================================

  marcarPresente(registro: RegistroAsistencia): void {
    console.log('🔵 marcarPresente llamado para:', registro.trabajadorNombre);
    
    // Verificar si el trabajador tiene horarios asignados (solo advertencia, no bloqueo)
    const tieneHorariosAsignados = registro.horarioAsignadoEntradaManana && registro.horarioAsignadoSalidaManana;
    
    if (!tieneHorariosAsignados) {
      // Mostrar advertencia pero permitir continuar
      this.mostrarNotificacion('info', 'ℹ️ Información', `El trabajador ${registro.trabajadorNombre} no tiene horarios asignados. Puede marcar como presente, pero se recomienda asignar horarios para calcular tardanzas automáticamente.`, 3000);
    }
    
    this.mostrarConfirmacion(
      'Marcar como Presente',
      `¿Deseas marcar a <strong>${registro.trabajadorNombre}</strong> como PRESENTE?`,
      'success',
      () => {
        console.log('✅ Confirmación aceptada para marcar presente');
        
        // SOLO usar los horarios asignados del trabajador (NO usar predeterminados)
        const horarioEntradaManana = registro.horarioAsignadoEntradaManana || null;
        const horarioSalidaManana = registro.horarioAsignadoSalidaManana || null;
        const horarioEntradaTarde = registro.horarioAsignadoEntradaTarde || null;
        const horarioSalidaTarde = registro.horarioAsignadoSalidaTarde || null;

        const datos = {
          trabajadorId: registro.trabajadorId,
          fecha: this.fechaSeleccionada,
          // Usar SOLO los horarios asignados del trabajador (sin predeterminados)
          horaEntradaManana: horarioEntradaManana && horarioEntradaManana !== '---' && horarioEntradaManana !== '--:--' ? horarioEntradaManana : null,
          horaSalidaManana: horarioSalidaManana && horarioSalidaManana !== '---' && horarioSalidaManana !== '--:--' ? horarioSalidaManana : null,
          horaEntradaTarde: horarioEntradaTarde && horarioEntradaTarde !== '---' && horarioEntradaTarde !== '--:--' ? horarioEntradaTarde : null,
          horaSalidaTarde: horarioSalidaTarde && horarioSalidaTarde !== '---' && horarioSalidaTarde !== '--:--' ? horarioSalidaTarde : null,
          tipoMarcacion: 'Presente',
          estado: 'Presente',
          observaciones: 'Marcado manualmente como presente'
        };

        console.log('✅ Marcando presente:', datos);
        this.iniciarProcesamiento('marcar-presente', this.obtenerIdRegistro(registro));
        this.mostrarNotificacion('loading', 'Procesando...', `Marcando a ${registro.trabajadorNombre} como presente`, 0);

        // Obtener el token del localStorage
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        this.http.post(`${this.apiAsistencias}/marcar-presente`, datos, { headers }).subscribe({
          next: (response: any) => {
            console.log('✅ Marcado como presente:', response);
            // Notificar al dashboard para que se actualice (si está abierto)
            if (window.parent) {
              window.parent.postMessage({ type: 'asistencia-actualizada' }, '*');
            }
            // También emitir evento local para actualizar si el dashboard está en la misma ventana
            window.dispatchEvent(new CustomEvent('asistencia-actualizada'));
            this.finalizarProcesamiento();
            this.cerrarNotificacion();
            this.mostrarNotificacion('success', '✅ Éxito', `${registro.trabajadorNombre} marcado como PRESENTE`, 3000);
            this.cargarAsistencias(); // Recargar datos
          },
          error: (error) => {
            console.error('❌ Error al marcar presente:', error);
            this.finalizarProcesamiento();
            this.cerrarNotificacion();
            this.mostrarNotificacion('error', '❌ Error', 'Error al marcar presente: ' + (error.error?.message || error.message), 4000);
          }
        });
      }
    );
  }

  todosEstanPresentes(): boolean {
    if (this.registrosFiltrados.length === 0) {
      return false;
    }
    
    // Verificar si todos los registros están marcados como Presente o Tardanza
    const todosPresentes = this.registrosFiltrados.every(registro => {
      const estado = registro.estado || registro.tipoMarcacion || '';
      return estado === 'Presente' || estado === 'Tardanza';
    });
    
    return todosPresentes;
  }

  marcarTodosPresentes(): void {
    // Filtrar solo los registros que no están ya marcados como Presente
    const registrosAMarcar = this.registrosFiltrados.filter(registro => {
      const estado = registro.estado || registro.tipoMarcacion || '';
      return estado !== 'Presente' && estado !== 'Tardanza';
    });

    if (registrosAMarcar.length === 0) {
      this.mostrarNotificacion('info', 'ℹ️ Información', 'Todos los trabajadores ya están marcados como presentes', 3000);
      return;
    }

    // Verificar cuántos tienen horarios asignados
    const registrosConHorarios = registrosAMarcar.filter(registro => {
      return registro.horarioAsignadoEntradaManana && registro.horarioAsignadoSalidaManana;
    });

    if (registrosConHorarios.length === 0) {
      this.mostrarNotificacion('warning', '⚠️ Advertencia', 'Ningún trabajador tiene horarios asignados. Por favor, asigne horarios primero usando la opción "Asignar Horarios".', 4000);
      return;
    }

    const total = registrosConHorarios.length;
    const sinHorarios = registrosAMarcar.length - registrosConHorarios.length;

    let mensaje = `¿Deseas marcar a <strong>${total} trabajador(es)</strong> como PRESENTE?`;
    if (sinHorarios > 0) {
      mensaje += `<br><small style="color: #fbbf24;">⚠️ ${sinHorarios} trabajador(es) sin horarios asignados serán omitidos.</small>`;
    }

    this.mostrarConfirmacion(
      'Marcar Todos como Presentes',
      mensaje,
      'success',
      () => {
        console.log(`✅ Marcando ${total} trabajadores como presentes...`);
        
        this.iniciarProcesamiento('marcar-todos-presentes', 'masivo');
        this.mostrarNotificacion('loading', 'Procesando...', `Marcando ${total} trabajador(es) como presentes...`, 0);

        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        // Procesar todos los registros
        const promesas = registrosConHorarios.map((registro, index) => {
          const horarioEntradaManana = registro.horarioAsignadoEntradaManana || null;
          const horarioSalidaManana = registro.horarioAsignadoSalidaManana || null;
          const horarioEntradaTarde = registro.horarioAsignadoEntradaTarde || null;
          const horarioSalidaTarde = registro.horarioAsignadoSalidaTarde || null;

          const datos = {
            trabajadorId: registro.trabajadorId,
            fecha: this.fechaSeleccionada,
            horaEntradaManana: horarioEntradaManana && horarioEntradaManana !== '---' && horarioEntradaManana !== '--:--' ? horarioEntradaManana : null,
            horaSalidaManana: horarioSalidaManana && horarioSalidaManana !== '---' && horarioSalidaManana !== '--:--' ? horarioSalidaManana : null,
            horaEntradaTarde: horarioEntradaTarde && horarioEntradaTarde !== '---' && horarioEntradaTarde !== '--:--' ? horarioEntradaTarde : null,
            horaSalidaTarde: horarioSalidaTarde && horarioSalidaTarde !== '---' && horarioSalidaTarde !== '--:--' ? horarioSalidaTarde : null,
            tipoMarcacion: 'Presente',
            estado: 'Presente',
            observaciones: 'Marcado masivamente como presente'
          };

          return this.http.post(`${this.apiAsistencias}/marcar-presente`, datos, { headers }).toPromise();
        });

        // Ejecutar todas las peticiones
        Promise.all(promesas)
          .then((results) => {
            console.log(`✅ ${results.length} trabajadores marcados como presentes`);
            this.finalizarProcesamiento();
            this.cerrarNotificacion();
            this.mostrarNotificacion('success', '✅ Éxito', `${total} trabajador(es) marcado(s) como PRESENTE`, 4000);
            // Recargar asistencias después de un breve delay
            setTimeout(() => {
              this.cargarAsistencias();
            }, 500);
          })
          .catch((error) => {
            console.error('❌ Error al marcar todos como presentes:', error);
            this.finalizarProcesamiento();
            this.cerrarNotificacion();
            this.mostrarNotificacion('error', '❌ Error', 'Error al marcar trabajadores: ' + (error.error?.message || error.message), 4000);
          });
      }
    );
  }

  marcarTodosFalta(): void {
    // Filtrar solo los registros que están marcados como Presente o Tardanza
    const registrosAMarcar = this.registrosFiltrados.filter(registro => {
      const estado = registro.estado || registro.tipoMarcacion || '';
      return estado === 'Presente' || estado === 'Tardanza';
    });

    if (registrosAMarcar.length === 0) {
      this.mostrarNotificacion('info', 'ℹ️ Información', 'No hay trabajadores marcados como presentes para cambiar a falta', 3000);
      return;
    }

    const total = registrosAMarcar.length;

    this.mostrarConfirmacion(
      'Marcar Todos como Falta',
      `¿Deseas marcar a <strong>${total} trabajador(es)</strong> como FALTA?`,
      'danger',
      () => {
        console.log(`❌ Marcando ${total} trabajadores como falta...`);
        
        this.iniciarProcesamiento('marcar-todos-falta', 'masivo');
        this.mostrarNotificacion('loading', 'Procesando...', `Marcando ${total} trabajador(es) como falta...`, 0);

        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        // Procesar todos los registros
        const promesas = registrosAMarcar.map((registro) => {
          // Mantener los horarios asignados del trabajador
          const horarioEntradaManana = registro.horarioAsignadoEntradaManana || 
                                     (registro.horaEntradaManana && registro.horaEntradaManana !== '---' ? registro.horaEntradaManana : null);
          const horarioSalidaManana = registro.horarioAsignadoSalidaManana || 
                                    (registro.horaSalidaManana && registro.horaSalidaManana !== '---' ? registro.horaSalidaManana : null);
          const horarioEntradaTarde = registro.horarioAsignadoEntradaTarde || 
                                    (registro.horaEntradaTarde && registro.horaEntradaTarde !== '---' ? registro.horaEntradaTarde : null);
          const horarioSalidaTarde = registro.horarioAsignadoSalidaTarde || 
                                   (registro.horaSalidaTarde && registro.horaSalidaTarde !== '---' ? registro.horaSalidaTarde : null);

          const datos = {
            trabajadorId: registro.trabajadorId,
            fecha: this.fechaSeleccionada,
            // Mantener los horarios asignados siempre, incluso cuando es falta
            horaEntradaManana: horarioEntradaManana,
            horaSalidaManana: horarioSalidaManana,
            horaEntradaTarde: horarioEntradaTarde,
            horaSalidaTarde: horarioSalidaTarde,
            tipoMarcacion: 'Falta',
            estado: 'Falta',
            observaciones: 'Marcado masivamente como falta'
          };

          return this.http.post(`${this.apiAsistencias}/marcar-falta`, datos, { headers }).toPromise();
        });

        // Ejecutar todas las peticiones
        Promise.all(promesas)
          .then((results) => {
            console.log(`❌ ${results.length} trabajadores marcados como falta`);
            this.finalizarProcesamiento();
            this.cerrarNotificacion();
            this.mostrarNotificacion('success', '✅ Éxito', `${total} trabajador(es) marcado(s) como FALTA`, 4000);
            // Recargar asistencias después de un breve delay
            setTimeout(() => {
              this.cargarAsistencias();
            }, 500);
          })
          .catch((error) => {
            console.error('❌ Error al marcar todos como falta:', error);
            this.finalizarProcesamiento();
            this.cerrarNotificacion();
            this.mostrarNotificacion('error', '❌ Error', 'Error al marcar trabajadores: ' + (error.error?.message || error.message), 4000);
          });
      }
    );
  }

  marcarFalta(registro: RegistroAsistencia): void {
    this.mostrarConfirmacion(
      'Marcar como Falta',
      `¿Deseas marcar a <strong>${registro.trabajadorNombre}</strong> como FALTA?`,
      'danger',
      () => {
        // SIEMPRE mantener los horarios asignados del trabajador, incluso cuando se marca como falta
        // Prioridad: horarioAsignado > horaEntradaManana (si existe) > null
        const horarioEntradaManana = registro.horarioAsignadoEntradaManana || 
                                     (registro.horaEntradaManana && registro.horaEntradaManana !== '---' ? registro.horaEntradaManana : null);
        const horarioSalidaManana = registro.horarioAsignadoSalidaManana || 
                                    (registro.horaSalidaManana && registro.horaSalidaManana !== '---' ? registro.horaSalidaManana : null);
        const horarioEntradaTarde = registro.horarioAsignadoEntradaTarde || 
                                    (registro.horaEntradaTarde && registro.horaEntradaTarde !== '---' ? registro.horaEntradaTarde : null);
        const horarioSalidaTarde = registro.horarioAsignadoSalidaTarde || 
                                   (registro.horaSalidaTarde && registro.horaSalidaTarde !== '---' ? registro.horaSalidaTarde : null);
        
        const datos = {
          trabajadorId: registro.trabajadorId,
          fecha: this.fechaSeleccionada,
          // Mantener los horarios asignados siempre, incluso cuando es falta
          horaEntradaManana: horarioEntradaManana,
          horaSalidaManana: horarioSalidaManana,
          horaEntradaTarde: horarioEntradaTarde,
          horaSalidaTarde: horarioSalidaTarde,
          tipoMarcacion: 'Falta', // Cambiar a 'Falta' para que el badge muestre el color rojo
          estado: 'Falta',
          observaciones: 'Marcado manualmente como falta'
        };

        console.log('❌ Marcando falta:', datos);
        this.iniciarProcesamiento('marcar-falta', this.obtenerIdRegistro(registro));
        this.mostrarNotificacion('loading', 'Procesando...', `Marcando a ${registro.trabajadorNombre} como falta`, 0);

        // Obtener el token del localStorage
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        this.http.post(`${this.apiAsistencias}/marcar-falta`, datos, { headers }).subscribe({
          next: (response: any) => {
            console.log('❌ Marcado como falta:', response);
            this.finalizarProcesamiento();
            this.cerrarNotificacion();
            this.mostrarNotificacion('success', '✅ Éxito', `${registro.trabajadorNombre} marcado como FALTA`, 3000);
            this.cargarAsistencias(); // Recargar datos
          },
          error: (error) => {
            console.error('❌ Error al marcar falta:', error);
            this.finalizarProcesamiento();
            this.cerrarNotificacion();
            this.mostrarNotificacion('error', '❌ Error', 'Error al marcar falta: ' + (error.error?.message || error.message), 4000);
          }
        });
      }
    );
  }

  // ========================================
  // EDITAR HORARIOS
  // ========================================

  abrirModalEdicion(registro: RegistroAsistencia): void {
    // Clonar y convertir '---' o null a cadenas vacías para los inputs type="time"
    // Si no hay hora registrada, usar el horario asignado como valor por defecto
    this.registroSeleccionado = { 
      ...registro,
      horaEntradaManana: registro.horaEntradaManana && registro.horaEntradaManana !== '---' 
        ? registro.horaEntradaManana 
        : (registro.horarioAsignadoEntradaManana || ''),
      horaSalidaManana: registro.horaSalidaManana && registro.horaSalidaManana !== '---'
        ? registro.horaSalidaManana
        : (registro.horarioAsignadoSalidaManana || ''),
      horaEntradaTarde: registro.horaEntradaTarde && registro.horaEntradaTarde !== '---'
        ? registro.horaEntradaTarde
        : (registro.horarioAsignadoEntradaTarde || ''),
      horaSalidaTarde: registro.horaSalidaTarde && registro.horaSalidaTarde !== '---'
        ? registro.horaSalidaTarde
        : (registro.horarioAsignadoSalidaTarde || '')
    };
    this.mostrarModalEdicion = true;
    console.log('📝 Modal abierto con datos:', this.registroSeleccionado);
  }

  guardarEdicion(): void {
    if (!this.registroSeleccionado) {
      return;
    }

    console.log('💾 Guardando edición:', this.registroSeleccionado);

    // Mantener el tipoMarcacion original si existe, para no cambiar el estado automáticamente
    // Solo si no hay tipoMarcacion y se agregan horarios, entonces podría ser "Presente"
    const tieneHorarios = !!(this.registroSeleccionado.horaEntradaManana?.trim() || 
                              this.registroSeleccionado.horaEntradaTarde?.trim());
    
    // Si el registro original tenía un tipoMarcacion (Falta, Permiso, Licencia, etc.), mantenerlo
    // Solo si no tenía tipoMarcacion y se agregan horarios, entonces podría ser "Presente"
    const tipoMarcacionOriginal = this.registroSeleccionado.tipoMarcacion;
    let tipoMarcacionFinal = tipoMarcacionOriginal;
    let estadoFinal = this.registroSeleccionado.estado;
    
    // Si no tenía tipoMarcacion y se agregan horarios, entonces es "Presente"
    if (!tipoMarcacionOriginal && tieneHorarios) {
      tipoMarcacionFinal = 'Presente';
      estadoFinal = 'Presente';
    } else if (tipoMarcacionOriginal) {
      // Mantener el tipoMarcacion y estado originales
      tipoMarcacionFinal = tipoMarcacionOriginal;
      estadoFinal = this.registroSeleccionado.estado;
    }

    // Obtener horarios asignados del registro original para mantenerlos
    const horarioAsignadoEntradaManana = this.registroSeleccionado.horarioAsignadoEntradaManana || this.registroSeleccionado.horaEntradaManana || null;
    const horarioAsignadoSalidaManana = this.registroSeleccionado.horarioAsignadoSalidaManana || this.registroSeleccionado.horaSalidaManana || null;
    const horarioAsignadoEntradaTarde = this.registroSeleccionado.horarioAsignadoEntradaTarde || this.registroSeleccionado.horaEntradaTarde || null;
    const horarioAsignadoSalidaTarde = this.registroSeleccionado.horarioAsignadoSalidaTarde || this.registroSeleccionado.horaSalidaTarde || null;
    
    // Convertir cadenas vacías a null para el backend
    // Si se ingresaron horarios, usarlos; si no, mantener los horarios asignados
    const horaEntradaMananaFinal = this.registroSeleccionado.horaEntradaManana?.trim() || horarioAsignadoEntradaManana || null;
    const horaSalidaMananaFinal = this.registroSeleccionado.horaSalidaManana?.trim() || horarioAsignadoSalidaManana || null;
    const horaEntradaTardeFinal = this.registroSeleccionado.horaEntradaTarde?.trim() || horarioAsignadoEntradaTarde || null;
    const horaSalidaTardeFinal = this.registroSeleccionado.horaSalidaTarde?.trim() || horarioAsignadoSalidaTarde || null;
    
    const datos = {
      trabajadorId: this.registroSeleccionado.trabajadorId,
      fecha: this.fechaSeleccionada,
      horaEntradaManana: horaEntradaMananaFinal && horaEntradaMananaFinal !== '---' ? horaEntradaMananaFinal : null,
      horaSalidaManana: horaSalidaMananaFinal && horaSalidaMananaFinal !== '---' ? horaSalidaMananaFinal : null,
      horaEntradaTarde: horaEntradaTardeFinal && horaEntradaTardeFinal !== '---' ? horaEntradaTardeFinal : null,
      horaSalidaTarde: horaSalidaTardeFinal && horaSalidaTardeFinal !== '---' ? horaSalidaTardeFinal : null,
      estado: estadoFinal,
      tipoMarcacion: tipoMarcacionFinal || 'Manual',
      observaciones: this.registroSeleccionado.observaciones?.trim() || null
    };

    console.log('📤 Datos a enviar:', datos);

    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.iniciarProcesamiento('editar-horarios', this.obtenerIdRegistro(this.registroSeleccionado));
    this.mostrarNotificacion('loading', 'Procesando...', `Actualizando horarios de ${this.registroSeleccionado?.trabajadorNombre}`, 0);
    
    // Primero guardar la asistencia del día
    this.http.post(`${this.apiAsistencias}/actualizar`, datos, { headers }).subscribe({
      next: (response: any) => {
        console.log('✅ Asistencia actualizada:', response);
        
        // Ahora actualizar el horario habitual del trabajador para que sea permanente
        // Solo si se ingresaron horarios válidos
        if (horaEntradaMananaFinal && horaEntradaMananaFinal !== '---' && 
            horaSalidaMananaFinal && horaSalidaMananaFinal !== '---') {
          
          const datosHorarioTrabajador = {
            horarioHabitualEntradaManana: horaEntradaMananaFinal,
            horarioHabitualSalidaManana: horaSalidaMananaFinal,
            horarioHabitualEntradaTarde: horaEntradaTardeFinal && horaEntradaTardeFinal !== '---' ? horaEntradaTardeFinal : null,
            horarioHabitualSalidaTarde: horaSalidaTardeFinal && horaSalidaTardeFinal !== '---' ? horaSalidaTardeFinal : null
          };
          
          console.log('💾 Actualizando horario habitual del trabajador:', datosHorarioTrabajador);
          
          this.http.put(`${this.apiTrabajadores}/${this.registroSeleccionado.trabajadorId}`, datosHorarioTrabajador, { headers }).subscribe({
            next: (respTrab: any) => {
              console.log('✅ Horario habitual actualizado:', respTrab);
              this.finalizarProcesamiento();
              this.cerrarNotificacion();
              this.mostrarNotificacion('success', '✅ Éxito', 'Horarios guardados permanentemente', 3000);
              this.mostrarModalEdicion = false;
              this.registroSeleccionado = null;
              this.cargarAsistencias(); // Recargar datos
            },
            error: (errorTrab) => {
              console.error('⚠️ Error al actualizar horario habitual (pero asistencia guardada):', errorTrab);
              // Aún así, la asistencia se guardó correctamente
              this.finalizarProcesamiento();
              this.cerrarNotificacion();
              this.mostrarNotificacion('success', '✅ Éxito', 'Asistencia actualizada (horario habitual no se pudo actualizar)', 3000);
              this.mostrarModalEdicion = false;
              this.registroSeleccionado = null;
              this.cargarAsistencias(); // Recargar datos
            }
          });
        } else {
          // No hay horarios válidos, solo cerrar
          this.finalizarProcesamiento();
          this.cerrarNotificacion();
          this.mostrarNotificacion('success', '✅ Éxito', 'Asistencia actualizada exitosamente', 3000);
          this.mostrarModalEdicion = false;
          this.registroSeleccionado = null;
          this.cargarAsistencias(); // Recargar datos
        }
      },
      error: (error) => {
        console.error('❌ Error al actualizar asistencia:', error);
        this.finalizarProcesamiento();
        this.cerrarNotificacion();
        this.mostrarNotificacion('error', '❌ Error', 'Error al actualizar: ' + (error.error?.message || error.message), 4000);
      }
    });
  }

  // ==================== HORARIOS MASIVOS ====================
  abrirModalHorariosMasivos(): void {
    // Resetear formulario
    this.formHorariosMasivos = {
      tipoAsignacion: 'todos',
      regimenLaboralId: null,
      horaEntradaManana: '08:00',
      horaSalidaManana: '13:00',
      horaEntradaTarde: '14:00',
      horaSalidaTarde: '17:00'
    };
    this.mostrarModalHorariosMasivos = true;
  }

  guardarHorariosMasivos(): void {
    if (!this.formHorariosMasivos.horaEntradaManana || !this.formHorariosMasivos.horaSalidaManana) {
      this.mostrarNotificacion('error', '❌ Error', 'Debe completar al menos los horarios de mañana', 3000);
      return;
    }

    if (this.formHorariosMasivos.tipoAsignacion === 'regimen' && !this.formHorariosMasivos.regimenLaboralId) {
      this.mostrarNotificacion('error', '❌ Error', 'Debe seleccionar un régimen laboral', 3000);
      return;
    }

    const mensaje = this.formHorariosMasivos.tipoAsignacion === 'todos'
      ? `¿Deseas asignar este horario a <strong>TODOS</strong> los trabajadores activos?`
      : `¿Deseas asignar este horario a todos los trabajadores del régimen laboral seleccionado?`;

    this.mostrarConfirmacion(
      'Asignar Horarios Masivamente',
      mensaje,
      'warning',
      () => {
        const datos = {
          tipoAsignacion: this.formHorariosMasivos.tipoAsignacion,
          regimenLaboralId: this.formHorariosMasivos.regimenLaboralId || null,
          horarioHabitualEntradaManana: this.formHorariosMasivos.horaEntradaManana,
          horarioHabitualSalidaManana: this.formHorariosMasivos.horaSalidaManana,
          horarioHabitualEntradaTarde: this.formHorariosMasivos.horaEntradaTarde || null,
          horarioHabitualSalidaTarde: this.formHorariosMasivos.horaSalidaTarde || null
        };

        console.log('💾 Asignando horarios masivamente:', datos);
        this.iniciarProcesamiento('horarios-masivos', 'masivo');
        this.mostrarNotificacion('loading', 'Procesando...', 'Asignando horarios a los trabajadores...', 0);

        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        this.http.post(`${this.apiTrabajadores}/asignar-horarios-masivo`, datos, { headers }).subscribe({
          next: (response: any) => {
            console.log('✅ Horarios asignados masivamente:', response);
            this.finalizarProcesamiento();
            this.cerrarNotificacion();
            const trabajadoresAfectados = response.data?.trabajadoresAfectados || 0;
            this.mostrarNotificacion('success', '✅ Éxito', `Horarios asignados a ${trabajadoresAfectados} trabajador(es)`, 4000);
            this.mostrarModalHorariosMasivos = false;
            // Limpiar la lista de trabajadores activos para forzar recarga completa
            this.trabajadoresActivos = [];
            // Esperar un momento para asegurar que el backend haya guardado los cambios
            setTimeout(() => {
              console.log('🔄 Recargando asistencias después de asignación masiva...');
              // Recargar asistencias para que se actualicen los horarios asignados
              this.cargarAsistencias();
            }, 500);
          },
          error: (error) => {
            console.error('❌ Error al asignar horarios masivamente:', error);
            this.finalizarProcesamiento();
            this.cerrarNotificacion();
            this.mostrarNotificacion('error', '❌ Error', 'Error al asignar horarios: ' + (error.error?.message || error.message), 4000);
          }
        });
      }
    );
  }

  // ==================== MENÚ DE ACCIONES ====================
  obtenerIdRegistro(registro: RegistroAsistencia): string | number {
    // Usar id si existe, sino usar trabajadorDni como identificador único
    return registro.id || registro.trabajadorDni || '';
  }

  toggleMenuAcciones(registroId: string | number, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    if (this.menuAbiertoId === registroId) {
      this.cerrarMenuAcciones();
    } else {
      this.menuAbiertoId = registroId;
      // Ajustar posición del dropdown después de abrirlo
      setTimeout(() => {
        this.ajustarPosicionDropdown();
      }, 10);
    }
  }

  cerrarMenuAcciones(): void {
    this.menuAbiertoId = null;
  }

  ajustarPosicionDropdown(): void {
    const dropdown = document.querySelector('.actions-dropdown--open .dropdown-menu') as HTMLElement;
    if (!dropdown) return;
    
    const button = document.querySelector('.actions-dropdown--open') as HTMLElement;
    if (!button) return;
    
    const buttonRect = button.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calcular posición fija basada en la posición del botón
    // Posicionar justo debajo del botón, alineado a la derecha
    const top = buttonRect.bottom + 8;
    const right = viewportWidth - buttonRect.right;
    
    dropdown.style.position = 'fixed';
    dropdown.style.top = `${top}px`;
    dropdown.style.right = `${right}px`;
    dropdown.style.left = 'auto';
    dropdown.style.bottom = 'auto';
    dropdown.style.zIndex = '999999';
    
    // Si se sale por la derecha, mostrar a la izquierda del botón
    setTimeout(() => {
      const dropdownRect = dropdown.getBoundingClientRect();
      if (dropdownRect.right > viewportWidth) {
        dropdown.style.right = 'auto';
        dropdown.style.left = `${buttonRect.left}px`;
      }
      
      // Si se sale por abajo, ajustar hacia arriba
      if (dropdownRect.bottom > viewportHeight) {
        dropdown.style.top = 'auto';
        dropdown.style.bottom = `${viewportHeight - buttonRect.top + 8}px`;
      }
    }, 0);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    // No cerrar si el clic es dentro del dropdown, del menú, o de cualquier elemento relacionado
    if (target.closest('.actions-dropdown') || 
        target.closest('.dropdown-menu') || 
        target.closest('.dropdown-item') ||
        target.closest('.btn-icon--primary') ||
        target.classList.contains('dropdown-item') ||
        target.classList.contains('dropdown-menu') ||
        target.closest('button.dropdown-item')) {
      return;
    }
    
    // Usar setTimeout para permitir que los eventos de clic en los items se procesen primero
    setTimeout(() => {
      this.cerrarMenuAcciones();
    }, 150);
  }

  // ==================== SISTEMA DE NOTIFICACIONES ====================
  mostrarNotificacion(tipo: 'success' | 'error' | 'warning' | 'info' | 'loading', titulo: string, mensaje: string, duracion: number = 3000): void {
    this.notificacion = {
      mostrar: true,
      tipo,
      titulo,
      mensaje,
      duracion
    };
    
    if (tipo !== 'loading' && duracion > 0) {
      setTimeout(() => {
        this.cerrarNotificacion();
      }, duracion);
    }
  }

  cerrarNotificacion(): void {
    this.notificacion.mostrar = false;
  }

  mostrarConfirmacion(titulo: string, mensaje: string, tipo: 'success' | 'danger' | 'warning' | 'info', onConfirm: () => void, onCancel?: () => void): void {
    console.log('🔵 mostrarConfirmacion llamado:', titulo);
    this.confirmacion = {
      mostrar: true,
      titulo,
      mensaje,
      tipo,
      onConfirm,
      onCancel
    };
    console.log('🔵 confirmacion.mostrar:', this.confirmacion.mostrar);
  }

  confirmarAccion(): void {
    console.log('🔵 confirmarAccion llamado');
    const onConfirm = this.confirmacion.onConfirm;
    this.confirmacion.mostrar = false;
    if (onConfirm) {
      console.log('🔵 Ejecutando onConfirm');
      onConfirm();
    }
  }

  cancelarAccion(): void {
    console.log('🔵 cancelarAccion llamado');
    const onCancel = this.confirmacion.onCancel;
    this.confirmacion.mostrar = false;
    if (onCancel) {
      onCancel();
    }
  }

  iniciarProcesamiento(tipo: string, registroId: string | number): void {
    this.procesandoAccion = {
      tipo,
      registroId
    };
  }

  finalizarProcesamiento(): void {
    this.procesandoAccion = {
      tipo: null,
      registroId: null
    };
  }

  // Formatear mensaje de notificación para destacar palabras clave
  formatearMensajeNotificacion(mensaje: string): SafeHtml {
    if (!mensaje) return this.sanitizer.bypassSecurityTrustHtml('');
    
    // Destacar la palabra "FALTA" en rojo
    const mensajeFormateado = mensaje.replace(/\bFALTA\b/gi, '<span class="notificacion__palabra-destacada notificacion__palabra-destacada--rojo">FALTA</span>');
    return this.sanitizer.bypassSecurityTrustHtml(mensajeFormateado);
  }

  // =====================================================
  // DETECCIÓN DE DÍAS NO HÁBILES (SÁBADOS, DOMINGOS, FERIADOS)
  // =====================================================
  
  // Obtener feriados nacionales de Perú para un año
  obtenerFeriadosPeru(anio: number): Date[] {
    const feriados: Date[] = [];
    
    // Feriados fijos
    feriados.push(new Date(anio, 0, 1));   // 1 de enero - Año Nuevo
    feriados.push(new Date(anio, 4, 1));   // 1 de mayo - Día del Trabajo
    feriados.push(new Date(anio, 6, 28));  // 28 de julio - Día de la Independencia
    feriados.push(new Date(anio, 6, 29));  // 29 de julio - Día de la Independencia
    feriados.push(new Date(anio, 7, 30));  // 30 de agosto - Santa Rosa de Lima
    feriados.push(new Date(anio, 9, 8));   // 8 de octubre - Combate de Angamos
    feriados.push(new Date(anio, 10, 1));  // 1 de noviembre - Todos los Santos
    feriados.push(new Date(anio, 11, 8));  // 8 de diciembre - Inmaculada Concepción
    feriados.push(new Date(anio, 11, 25)); // 25 de diciembre - Navidad
    
    // Feriados variables (Jueves y Viernes Santo - se calculan según la Pascua)
    // Algoritmo de Meeus para calcular la Pascua
    const a = anio % 19;
    const b = Math.floor(anio / 100);
    const c = anio % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mes = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const dia = ((h + l - 7 * m + 114) % 31) + 1;
    
    const pascua = new Date(anio, mes, dia);
    pascua.setHours(0, 0, 0, 0);
    
    // Jueves Santo (3 días antes de Pascua)
    const juevesSanto = new Date(pascua);
    juevesSanto.setDate(pascua.getDate() - 3);
    feriados.push(juevesSanto);
    
    // Viernes Santo (2 días antes de Pascua)
    const viernesSanto = new Date(pascua);
    viernesSanto.setDate(pascua.getDate() - 2);
    feriados.push(viernesSanto);
    
    // Normalizar todas las fechas a inicio del día
    return feriados.map(f => {
      const fecha = new Date(f);
      fecha.setHours(0, 0, 0, 0);
      return fecha;
    });
  }
  
  // Verificar si una fecha es feriado
  esFeriado(fecha: Date, feriados: Date[]): boolean {
    // Normalizar la fecha a inicio del día (sin hora)
    const fechaNormalizada = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    
    return feriados.some(feriado => {
      // Normalizar el feriado a inicio del día (sin hora)
      const feriadoNormalizado = new Date(feriado.getFullYear(), feriado.getMonth(), feriado.getDate());
      
      // Comparar solo año, mes y día
      return feriadoNormalizado.getTime() === fechaNormalizada.getTime();
    });
  }
  
  // Parsear fecha desde formato YYYY-MM-DD sin problemas de zona horaria
  parsearFecha(fechaString: string): Date {
    if (!fechaString) return new Date();
    
    // Parsear formato YYYY-MM-DD manualmente para evitar problemas de zona horaria
    const partes = fechaString.split('-');
    if (partes.length === 3) {
      const anio = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1; // Los meses en JS son 0-indexed
      const dia = parseInt(partes[2], 10);
      
      // Validar que los valores sean números válidos
      if (isNaN(anio) || isNaN(mes) || isNaN(dia)) {
        console.error('❌ Error al parsear fecha:', fechaString);
        return new Date();
      }
      
      // Crear fecha en hora local (no UTC) para evitar cambios de día
      const fecha = new Date(anio, mes, dia, 12, 0, 0); // Usar mediodía para evitar problemas de zona horaria
      return fecha;
    }
    
    // Fallback: intentar parsear normalmente
    const fechaFallback = new Date(fechaString);
    if (isNaN(fechaFallback.getTime())) {
      console.error('❌ Error al parsear fecha:', fechaString);
      return new Date();
    }
    return fechaFallback;
  }
  
  // Cache para el resultado de esDiaNoHabil
  private _esDiaNoHabilCache: { fecha: string, resultado: boolean } | null = null;
  
  // Verificar si la fecha seleccionada es un día no hábil (sábado, domingo o feriado)
  esDiaNoHabil(): boolean {
    if (!this.fechaSeleccionada) return false;
    
    // Usar cache si la fecha no ha cambiado
    if (this._esDiaNoHabilCache && this._esDiaNoHabilCache.fecha === this.fechaSeleccionada) {
      return this._esDiaNoHabilCache.resultado;
    }
    
    // Parsear la fecha correctamente
    const fecha = this.parsearFecha(this.fechaSeleccionada);
    
    // Verificar que la fecha sea válida
    if (isNaN(fecha.getTime())) {
      console.error('❌ Fecha inválida:', this.fechaSeleccionada);
      this._esDiaNoHabilCache = { fecha: this.fechaSeleccionada, resultado: false };
      return false;
    }
    
    const diaSemana = fecha.getDay();
    const nombreDia = fecha.toLocaleDateString('es-PE', { weekday: 'long' });
    const fechaFormateada = fecha.toLocaleDateString('es-PE');
    
    let resultado = false;
    
    // Verificar si es sábado (6) o domingo (0)
    if (diaSemana === 0 || diaSemana === 6) {
      // Solo loguear una vez, no en cada llamada
      if (!this._esDiaNoHabilCache || this._esDiaNoHabilCache.fecha !== this.fechaSeleccionada) {
        console.log(`📅 ${fechaFormateada} (${nombreDia}) es día NO HÁBIL (fin de semana)`);
      }
      resultado = true;
    } else {
      // Verificar si es feriado
      const anio = fecha.getFullYear();
      const feriados = this.obtenerFeriadosPeru(anio);
      const esFeriado = this.esFeriado(fecha, feriados);
      
      if (esFeriado) {
        // Solo loguear una vez
        if (!this._esDiaNoHabilCache || this._esDiaNoHabilCache.fecha !== this.fechaSeleccionada) {
          console.log(`📅 ${fechaFormateada} (${nombreDia}) es día NO HÁBIL (feriado)`);
        }
        resultado = true;
      } else {
        // Solo loguear una vez
        if (!this._esDiaNoHabilCache || this._esDiaNoHabilCache.fecha !== this.fechaSeleccionada) {
          console.log(`📅 ${fechaFormateada} (${nombreDia}) es día HÁBIL`);
        }
        resultado = false;
      }
    }
    
    // Guardar en cache
    this._esDiaNoHabilCache = { fecha: this.fechaSeleccionada, resultado };
    
    return resultado;
  }
}