import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-nuevo',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule
  ],
  templateUrl: './nuevo.component.html',
  styleUrls: ['./nuevo.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideInDown', [
      transition(':enter', [
        style({ transform: 'translateY(-50px)', opacity: 0 }),
        animate('400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
                style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', 
                style({ transform: 'translateY(-30px)', opacity: 0 }))
      ])
    ])
  ]
})
export class NuevoComponent implements OnInit {
  trabajadorForm!: FormGroup;
  guardando: boolean = false;
  buscandoRENIEC: boolean = false;
  paso: number = 1;
  totalPasos: number = 5;
  
  // Sistema de Auto-Guardado
  mostrarModalRecuperacion: boolean = false;
  datosGuardados: any = null;
  
  // Modal de trabajador eliminado
  mostrarModalEliminado: boolean = false;
  trabajadorEliminadoInfo: any = null;
  autoSaveInterval: any = null;
  
  // Modal de confirmación para cancelar
  mostrarModalCancelar: boolean = false;
  
  // Modal de RENIEC deshabilitado
  mostrarModalRENIECDeshabilitado: boolean = false;
  
  // Modal de DNI inválido
  mostrarModalDNIInvalido: boolean = false;
  mensajeDNI: string = '';
  
  // Modal de éxito RENIEC
  mostrarModalExitoRENIEC: boolean = false;
  cargandoDatosRENIEC: boolean = false;
  datosRENIECCompletados: boolean = false;
  
  // Modal de éxito al guardar trabajador
  mostrarModalExitoGuardar: boolean = false;
  guardandoTrabajadorProceso: boolean = false;
  trabajadorGuardadoCompletado: boolean = false;

  // Modos de input para campos personalizados
  cargoInputMode: boolean = false;
  areaInputMode: boolean = false;
  gerenciaInputMode: boolean = false;
  subgerenciaInputMode: boolean = false;
  unidadInputMode: boolean = false;
  
  // Modos de input para campos de clasificación
  condicionInputMode: boolean = false;
  nivelInputMode: boolean = false;
  tipoPlazaInputMode: boolean = false;
  grupoOcupacionalInputMode: boolean = false;
  
  // Modos de input para campos de contrato
  tipoContratoInputMode: boolean = false;
  regimenLaboralInputMode: boolean = false;

  // Validación de DNI
  dniValido: boolean = true;
  dniExiste: boolean = false;
  validandoDNI: boolean = false;
  reniecHabilitado: boolean = true; // Por defecto habilitado

  private apiUrl = `${environment.apiUrl}/trabajadores`;
  private apiBaseUrl = environment.apiBaseUrl;

  departamentos: any[] = [];
  provincias: any[] = [];
  distritos: string[] = [];

  // Cargos, subgerencias, unidades, regímenes laborales y tipos de contrato se cargan dinámicamente
  cargos: any[] = [];
  cargosFiltrados: any[] = [];
  cargosPorCategoria: any = {};
  Object = Object; // Para usar Object.keys() en el template
  busquedaCargo: string = '';
  busquedaCargoTexto: string = '';
  mostrarDropdownCargos: boolean = false;
  cargoSeleccionado: any = null;
  subgerencias: any[] = [];
  subgerenciasTodas: any[] = []; // Almacenar todas las subgerencias sin filtrar
  unidades: any[] = [];
  unidadesTodas: any[] = []; // Almacenar todas las unidades sin filtrar
  regimenesLaborales: any[] = [];
  tiposContrato: any[] = [];
  condicionesLaborales: any[] = [];
  
  cargosOriginales = [
    // GERENCIA GENERAL
    { id: 1, nombre: 'Gerente Municipal' },
    { id: 2, nombre: 'Subgerente' },
    { id: 3, nombre: 'Jefe de Área' },
    { id: 4, nombre: 'Coordinador' },
    { id: 5, nombre: 'Asistente Administrativo' },
    
    // RECURSOS HUMANOS
    { id: 6, nombre: 'Jefe de RRHH' },
    { id: 7, nombre: 'Analista de RRHH' },
    { id: 8, nombre: 'Especialista en Planillas' },
    { id: 9, nombre: 'Asistente de RRHH' },
    
    // CONTABILIDAD Y FINANZAS
    { id: 10, nombre: 'Contador General' },
    { id: 11, nombre: 'Contador' },
    { id: 12, nombre: 'Asistente Contable' },
    { id: 13, nombre: 'Tesorero' },
    { id: 14, nombre: 'Cajero' },
    
    // LOGÍSTICA Y ABASTECIMIENTO
    { id: 15, nombre: 'Jefe de Logística' },
    { id: 16, nombre: 'Especialista en Compras' },
    { id: 17, nombre: 'Almacenero' },
    { id: 18, nombre: 'Asistente de Logística' },
    
    // OBRAS PÚBLICAS
    { id: 19, nombre: 'Jefe de Obras' },
    { id: 20, nombre: 'Ingeniero Civil' },
    { id: 21, nombre: 'Ingeniero Residente' },
    { id: 22, nombre: 'Arquitecto' },
    { id: 23, nombre: 'Supervisor de Obra' },
    { id: 24, nombre: 'Maestro de Obra' },
    { id: 25, nombre: 'Topógrafo' },
    
    // SERENAZGO Y SEGURIDAD CIUDADANA
    { id: 26, nombre: 'Jefe de Serenazgo' },
    { id: 27, nombre: 'Supervisor de Serenazgo' },
    { id: 28, nombre: 'Sereno' },
    { id: 29, nombre: 'Coordinador de Seguridad Ciudadana' },
    { id: 30, nombre: 'Inspector de Serenazgo' },
    
    // SERVICIOS PÚBLICOS Y LIMPIEZA
    { id: 31, nombre: 'Jefe de Servicios Municipales' },
    { id: 32, nombre: 'Supervisor de Limpieza' },
    { id: 33, nombre: 'Operario de Limpieza' },
    { id: 34, nombre: 'Chofer de Compactadora' },
    { id: 35, nombre: 'Operador de Maquinaria Pesada' },
    { id: 36, nombre: 'Jardinero' },
    
    // DESARROLLO SOCIAL
    { id: 37, nombre: 'Jefe de Desarrollo Social' },
    { id: 38, nombre: 'Trabajadora Social' },
    { id: 39, nombre: 'Psicólogo' },
    { id: 40, nombre: 'Promotor Social' },
    { id: 41, nombre: 'Coordinador de Programas Sociales' },
    
    // DESARROLLO ECONÓMICO Y TURISMO
    { id: 42, nombre: 'Jefe de Turismo' },
    { id: 43, nombre: 'Promotor Turístico' },
    { id: 44, nombre: 'Guía Turístico' },
    { id: 45, nombre: 'Especialista en Desarrollo Económico' },
    
    // MEDIO AMBIENTE
    { id: 46, nombre: 'Jefe de Medio Ambiente' },
    { id: 47, nombre: 'Ingeniero Ambiental' },
    { id: 48, nombre: 'Especialista Ambiental' },
    { id: 49, nombre: 'Inspector Ambiental' },
    
    // DEFENSA CIVIL
    { id: 50, nombre: 'Jefe de Defensa Civil' },
    { id: 51, nombre: 'Inspector de Defensa Civil' },
    { id: 52, nombre: 'Especialista en Gestión de Riesgos' },
    
    // TECNOLOGÍAS DE LA INFORMACIÓN
    { id: 53, nombre: 'Jefe de TI' },
    { id: 54, nombre: 'Analista de Sistemas' },
    { id: 55, nombre: 'Programador' },
    { id: 56, nombre: 'Soporte Técnico' },
    { id: 57, nombre: 'Administrador de Redes' },
    
    // ASESORÍA LEGAL
    { id: 58, nombre: 'Gerente Legal' },
    { id: 59, nombre: 'Abogado' },
    { id: 60, nombre: 'Asistente Legal' },
    { id: 61, nombre: 'Procurador Público' },
    
    // SECRETARÍA GENERAL
    { id: 62, nombre: 'Secretario General' },
    { id: 63, nombre: 'Secretaria' },
    { id: 64, nombre: 'Asistente de Secretaría' },
    { id: 65, nombre: 'Técnico Administrativo' },
    
    // IMAGEN INSTITUCIONAL Y COMUNICACIONES
    { id: 66, nombre: 'Jefe de Imagen Institucional' },
    { id: 67, nombre: 'Relacionista Público' },
    { id: 68, nombre: 'Community Manager' },
    { id: 69, nombre: 'Fotógrafo' },
    { id: 70, nombre: 'Diseñador Gráfico' },
    
    // REGISTROS CIVILES
    { id: 71, nombre: 'Jefe de Registro Civil' },
    { id: 72, nombre: 'Registrador Civil' },
    { id: 73, nombre: 'Asistente de Registro Civil' },
    
    // PARTICIPACIÓN CIUDADANA
    { id: 74, nombre: 'Jefe de Participación Ciudadana' },
    { id: 75, nombre: 'Facilitador Comunitario' },
    { id: 76, nombre: 'Promotor de Participación Vecinal' },
    
    // FISCALIZACIÓN
    { id: 77, nombre: 'Jefe de Fiscalización' },
    { id: 78, nombre: 'Inspector Municipal' },
    { id: 79, nombre: 'Notificador' },
    
    // PLANIFICACIÓN Y PRESUPUESTO
    { id: 80, nombre: 'Jefe de Planificación' },
    { id: 81, nombre: 'Economista' },
    { id: 82, nombre: 'Analista de Presupuesto' },
    { id: 83, nombre: 'Estadístico' },
    
    // SERVICIOS GENERALES
    { id: 84, nombre: 'Conserje' },
    { id: 85, nombre: 'Vigilante' },
    { id: 86, nombre: 'Mensajero' },
    { id: 87, nombre: 'Chofer' },
    { id: 88, nombre: 'Mecánico' },
    { id: 89, nombre: 'Electricista' },
    { id: 90, nombre: 'Gasfitero' },
    { id: 91, nombre: 'Carpintero' },
    { id: 92, nombre: 'Pintor' },
    
    // CARGOS GENÉRICOS (para flexibilidad)
    { id: 93, nombre: 'Obrero' },
    { id: 94, nombre: 'Operario' },
    { id: 95, nombre: 'Técnico' },
    { id: 96, nombre: 'Auxiliar' },
    { id: 97, nombre: 'Asistente' },
    { id: 98, nombre: 'Especialista' },
    { id: 99, nombre: 'Analista' },
    { id: 100, nombre: 'Practicante' },
    
    // JEFATURAS DE UNIDADES
    { id: 101, nombre: 'Jefe de la Oficina de Secretaría General' },
    { id: 102, nombre: 'Jefe de Unidad' },
    { id: 103, nombre: 'Jefe de Fiscalización Tributaria' },
    { id: 104, nombre: 'Jefe de la Unidad de Gestión' },
    { id: 105, nombre: 'Jefe de la Unidad de Archivo' },
    { id: 106, nombre: 'Jefe de la Unidad de Tesorería' },
    { id: 107, nombre: 'Jefe de la Unidad de Recursos Humanos' },
    { id: 108, nombre: 'Jefe de la Unidad de Contabilidad' },
    { id: 109, nombre: 'Jefe de la Unidad de Abastecimiento' },
    { id: 110, nombre: 'Jefe de la Unidad de Patrimonio' }
  ];

  // Áreas, gerencias, bancos - se cargan en ngOnInit
  areas: any[] = [];
  gerencias: any[] = [];
  bancos: string[] = [];

  afps: string[] = ['Integra', 'Prima', 'Profuturo', 'Habitat'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Verificar estado de RENIEC al iniciar
    this.verificarEstadoRENIEC();
    
    // Cargar ubigeo primero
    this.http.get<any[]>('assets/ubigeo-peru.json').subscribe({
      next: (data) => {
        console.log('✅ Ubigeo cargado:', data?.length || 0, 'departamentos');
        this.departamentos = Array.isArray(data) ? data : [];
        console.log('📋 Primeros 3 departamentos:', this.departamentos.slice(0, 3));
        if (this.departamentos.length > 0) {
          console.log('📋 Estructura del primer departamento:', {
            codigo: this.departamentos[0].codigo,
            nombre: this.departamentos[0].nombre,
            tieneProvincias: !!this.departamentos[0].provincias
          });
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar ubigeo:', error);
        this.departamentos = [];
        this.provincias = [];
        this.distritos = [];
      }
    });
    
    this.cargarCargos();
    this.cargarAreas();
    this.cargarSubgerencias();
    this.cargarUnidades();
    this.cargarRegimenesLaborales();
    this.cargarTiposContrato();
    this.cargarCondicionesLaborales();
    this.cargarGerencias();
    this.cargarBancos();
    this.crearFormulario();
    this.iniciarAutoGuardado();
  }

  ngOnDestroy(): void {
    // Limpiar intervalo al destruir componente
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
  }

  // =====================================================
  // SISTEMA DE AUTO-GUARDADO
  // =====================================================

  iniciarAutoGuardado(): void {
    // Auto-guardar cada 30 segundos
    this.autoSaveInterval = setInterval(() => {
      this.autoGuardarBorrador();
    }, 30000); // 30 segundos
  }

  autoGuardarBorrador(): void {
    const dni = this.trabajadorForm.get('dni')?.value;
    
    // Solo guardar si hay DNI válido y datos en el formulario
    if (dni && dni.length === 8 && !this.estaFormularioVacio()) {
      const borrador = {
        ...this.trabajadorForm.value,
        timestamp: new Date().toISOString(),
        porcentajeCompletado: this.calcularPorcentajeCompletado()
      };
      
      localStorage.setItem(`borrador_trabajador_${dni}`, JSON.stringify(borrador));
      console.log('💾 Auto-guardado: Borrador guardado para DNI', dni);
    }
  }

  verificarBorradorExistente(): void {
    const dni = this.trabajadorForm.get('dni')?.value;
    
    if (dni && dni.length === 8) {
      const borradorStr = localStorage.getItem(`borrador_trabajador_${dni}`);
      
      if (borradorStr) {
        try {
          this.datosGuardados = JSON.parse(borradorStr);
          
          // Verificar que no sean los mismos datos actuales
          if (!this.sonDatosIguales(this.datosGuardados, this.trabajadorForm.value)) {
            this.mostrarModalRecuperacion = true;
          }
        } catch (error) {
          console.error('Error al parsear borrador:', error);
        }
      }
    }
  }

  recuperarDatos(): void {
    if (this.datosGuardados) {
      // Cargar todos los datos excepto el timestamp
      const { timestamp, porcentajeCompletado, ...datos } = this.datosGuardados;
      
      // Guardar valores de ubigeo antes de cargar las listas
      const departamentoGuardado = datos.departamento;
      const provinciaGuardada = datos.provincia;
      const distritoGuardado = datos.distrito;
      
      // Primero cargar provincias si hay departamento
      if (departamentoGuardado) {
        this.onDepartamentoChange(departamentoGuardado, false); // false = no resetear valores
      }
      
      // Esperar a que se carguen las provincias antes de continuar
      setTimeout(() => {
        // Establecer todos los valores del formulario
        this.trabajadorForm.patchValue(datos);
        
        // Si hay provincia, cargar distritos
        if (provinciaGuardada) {
          this.onProvinciaChange(provinciaGuardada, false); // false = no resetear valores
        }
        
        // Esperar un poco más para asegurar que los distritos se cargaron
        setTimeout(() => {
          // Re-establecer los valores de ubigeo para asegurar que se muestren correctamente
          if (departamentoGuardado) {
            this.trabajadorForm.patchValue({ departamento: departamentoGuardado });
          }
          if (provinciaGuardada) {
            this.trabajadorForm.patchValue({ provincia: provinciaGuardada });
          }
          if (distritoGuardado) {
            this.trabajadorForm.patchValue({ distrito: distritoGuardado });
          }
          
          console.log('✅ Datos recuperados del borrador');
          console.log('📍 Ubigeo recuperado:', {
            departamento: departamentoGuardado,
            provincia: provinciaGuardada,
            distrito: distritoGuardado
          });
        }, 300);
      }, 200);
      
      this.mostrarModalRecuperacion = false;
    }
  }

  descartarBorrador(): void {
    const dni = this.trabajadorForm.get('dni')?.value;
    
    if (dni) {
      localStorage.removeItem(`borrador_trabajador_${dni}`);
      console.log('🗑️ Borrador descartado para DNI', dni);
    }
    
    this.mostrarModalRecuperacion = false;
    this.datosGuardados = null;
  }

  verDetallesBorrador(): void {
    if (this.datosGuardados) {
      const mensaje = this.formatearDatosBorrador(this.datosGuardados);
      alert(mensaje);
    }
  }

  formatearDatosBorrador(datos: any): string {
    const fecha = new Date(datos.timestamp);
    const fechaFormateada = fecha.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `
📋 DATOS GUARDADOS

👤 Nombre: ${datos.nombres || ''} ${datos.apellidoPaterno || ''} ${datos.apellidoMaterno || ''}
🆔 DNI: ${datos.dni || ''}
📅 Fecha Nacimiento: ${datos.fechaNacimiento || 'No registrada'}
📞 Celular: ${datos.celular || 'No registrado'}
💼 Cargo: ${this.getNombreCargo(datos.cargo) || 'No registrado'}
🏢 Área: ${this.getNombreArea(datos.area) || 'No registrada'}

⏰ Guardado: ${fechaFormateada}
📊 Completado: ${datos.porcentajeCompletado || 0}%
    `.trim();
  }

  getNombreCargo(cargoId: any): string {
    const cargo = this.cargos.find(c => c.CargoID == cargoId || c.Nombre == cargoId);
    return cargo?.Nombre || cargoId || '';
  }

  getNombreArea(areaId: any): string {
    const area = this.areas.find(a => a.id == areaId || a.nombre == areaId);
    return area?.nombre || areaId || '';
  }

  estaFormularioVacio(): boolean {
    const valores = this.trabajadorForm.value;
    const camposLlenos = Object.keys(valores).filter(key => {
      const valor = valores[key];
      return valor !== '' && valor !== null && valor !== undefined && valor !== 0 && valor !== false;
    });
    return camposLlenos.length <= 1; // Solo DNI no cuenta como "lleno"
  }

  sonDatosIguales(datos1: any, datos2: any): boolean {
    const campos = ['nombres', 'apellidoPaterno', 'apellidoMaterno', 'fechaNacimiento', 'celular', 'cargo', 'area'];
    return campos.every(campo => datos1[campo] === datos2[campo]);
  }

  calcularPorcentajeCompletado(): number {
    const valores = this.trabajadorForm.value;
    const camposImportantes = [
      'dni', 'nombres', 'apellidoPaterno', 'apellidoMaterno', 'fechaNacimiento',
      'sexo', 'celular', 'departamento', 'provincia', 'distrito',
      'cargo', 'area', 'remuneracionBasica', 'fechaIngreso'
    ];
    
    const camposLlenos = camposImportantes.filter(campo => {
      const valor = valores[campo];
      return valor !== '' && valor !== null && valor !== undefined;
    });
    
    return Math.round((camposLlenos.length / camposImportantes.length) * 100);
  }

  getTiempoTranscurrido(timestamp: string): string {
    const ahora = new Date();
    const fecha = new Date(timestamp);
    const diferencia = ahora.getTime() - fecha.getTime();
    
    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    
    if (dias > 0) return `hace ${dias} día${dias > 1 ? 's' : ''}`;
    if (horas > 0) return `hace ${horas} hora${horas > 1 ? 's' : ''}`;
    if (minutos > 0) return `hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    return 'hace un momento';
  }

  cargarAreas(): void {
    console.log('📋 Cargando áreas desde el backend...');
    this.http.get<any>(`${this.apiBaseUrl}/api/areas`).subscribe({
      next: (response) => {
        console.log('🔍 Respuesta de áreas:', response);
        const areasData = response.data || response;
        
        if (Array.isArray(areasData) && areasData.length > 0) {
          // ELIMINAR DUPLICADOS por Nombre
          const areasUnicas = new Map();
          areasData.forEach((area: any) => {
            const nombre = area.Nombre || area.nombre;
            const id = area.AreaID || area.id;
            if (nombre && !areasUnicas.has(nombre.trim().toUpperCase())) {
              areasUnicas.set(nombre.trim().toUpperCase(), { id, nombre });
            }
          });
          
          this.areas = Array.from(areasUnicas.values());
          console.log('✅ Áreas cargadas desde el backend (sin duplicados):', this.areas.length);
        } else {
          console.warn('⚠️ No se recibieron áreas válidas, usando fallback');
          this.usarAreasFallback();
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar áreas:', error);
        this.usarAreasFallback();
      }
    });
  }

  usarAreasFallback(): void {
    // Áreas funcionales según organigrama oficial
    this.areas = [
      { id: 1, nombre: 'Administración' },
      { id: 2, nombre: 'Finanzas' },
      { id: 3, nombre: 'Recursos Humanos' },
      { id: 4, nombre: 'Logística' },
      { id: 5, nombre: 'Planeamiento' },
      { id: 6, nombre: 'Presupuesto' },
      { id: 7, nombre: 'Contabilidad' },
      { id: 8, nombre: 'Tesorería' },
      { id: 9, nombre: 'Tecnología' },
      { id: 10, nombre: 'Legal' },
      { id: 11, nombre: 'Tributación' },
      { id: 12, nombre: 'Fiscalización' },
      { id: 13, nombre: 'Recaudación' },
      { id: 14, nombre: 'Obras' },
      { id: 15, nombre: 'Proyectos' },
      { id: 16, nombre: 'Catastro' },
      { id: 17, nombre: 'Licencias' },
      { id: 18, nombre: 'Desarrollo Social' },
      { id: 19, nombre: 'Educación' },
      { id: 20, nombre: 'Salud' },
      { id: 21, nombre: 'Áreas Verdes' },
      { id: 22, nombre: 'Medio Ambiente' },
      { id: 23, nombre: 'Seguridad' },
      { id: 24, nombre: 'Defensa Civil' },
      { id: 25, nombre: 'Registro Civil' },
      { id: 26, nombre: 'Archivo' },
      { id: 27, nombre: 'Turismo' },
      { id: 28, nombre: 'Comercio' },
      { id: 29, nombre: 'Transporte' },
      { id: 30, nombre: 'Limpieza' }
    ];
    console.log('✅ Áreas fallback cargadas:', this.areas.length);
  }

  cargarGerencias(): void {
    console.log('📋 Cargando TODAS las Gerencias desde la base de datos...');
    
    // Intentar primero con /api/gerencias (ruta principal)
    this.http.get<any>(`${this.apiBaseUrl}/api/gerencias`).subscribe({
      next: (response: any) => {
        // La respuesta puede venir como { success: true, data: [...] } o directamente como array
        const gerenciasData = response.data || response;
        const gerenciasArray = Array.isArray(gerenciasData) ? gerenciasData : [];
        
        // Mapear todas las gerencias de la base de datos
        this.gerencias = gerenciasArray.map((gerencia: any) => {
          // Determinar el tipo basado en el nombre
          const nombre = (gerencia.Nombre || gerencia.nombre || '').trim();
          const esOficina = nombre.toLowerCase().includes('oficina de') || nombre.toLowerCase().includes('oficina');
          const tipo = esOficina ? 'Oficina' : 'Gerencia';
          
          return {
            GerenciaID: gerencia.GerenciaID || gerencia.id,
            Nombre: nombre,
            Descripcion: gerencia.Descripcion || gerencia.descripcion || '',
            AreaID: gerencia.AreaID || gerencia.areaId || gerencia.GerenciaID || gerencia.id,
            Tipo: tipo,
            Activa: gerencia.Activa !== undefined ? gerencia.Activa : (gerencia.Activo !== undefined ? gerencia.Activo : true)
          };
        });
        
        // Filtrar solo las gerencias activas
        this.gerencias = this.gerencias.filter(g => g.Activa !== false);
        
        // Ordenar por nombre
        this.gerencias.sort((a, b) => {
          const nombreA = (a.Nombre || '').toLowerCase();
          const nombreB = (b.Nombre || '').toLowerCase();
          return nombreA.localeCompare(nombreB);
        });
        
        console.log(`✅ ${this.gerencias.length} Gerencias/Oficinas cargadas desde la base de datos`);
        console.log('📋 Primeras 5:', this.gerencias.slice(0, 5).map(g => `${g.Nombre} (${g.Tipo})`));
      },
      error: (error) => {
        console.error('❌ Error al cargar gerencias desde /api/gerencias, intentando ruta alternativa:', error);
        
        // Intentar con la ruta alternativa /api/estructura/gerencias
        this.http.get<any>(`${this.apiBaseUrl}/api/estructura/gerencias`).subscribe({
          next: (responseAlt: any) => {
            const gerenciasData = responseAlt.data || responseAlt;
            const gerenciasArray = Array.isArray(gerenciasData) ? gerenciasData : [];
            
            this.gerencias = gerenciasArray.map((gerencia: any) => {
              const nombre = (gerencia.Nombre || gerencia.nombre || '').trim();
              const esOficina = nombre.toLowerCase().includes('oficina de') || nombre.toLowerCase().includes('oficina');
              const tipo = esOficina ? 'Oficina' : 'Gerencia';
              
              return {
                GerenciaID: gerencia.GerenciaID || gerencia.id,
                Nombre: nombre,
                Descripcion: gerencia.Descripcion || gerencia.descripcion || '',
                AreaID: gerencia.AreaID || gerencia.areaId || gerencia.GerenciaID || gerencia.id,
                Tipo: tipo,
                Activa: gerencia.Activa !== undefined ? gerencia.Activa : (gerencia.Activo !== undefined ? gerencia.Activo : true)
              };
            });
            
            this.gerencias = this.gerencias.filter(g => g.Activa !== false);
            this.gerencias.sort((a, b) => {
              const nombreA = (a.Nombre || '').toLowerCase();
              const nombreB = (b.Nombre || '').toLowerCase();
              return nombreA.localeCompare(nombreB);
            });
            
            console.log(`✅ ${this.gerencias.length} Gerencias cargadas desde ruta alternativa /api/estructura/gerencias`);
          },
          error: (errorAlt) => {
            console.error('❌ Error también en ruta alternativa, usando lista fallback:', errorAlt);
            // Fallback: lista mínima
            this.gerencias = [
              { GerenciaID: 1, Nombre: 'Gerencia Municipal', AreaID: 1, Tipo: 'Gerencia', Activa: true }
            ];
            console.log('⚠️ Usando lista fallback mínima');
          }
        });
      }
    });
  }

  cargarBancos(): void {
    console.log('📋 Cargando bancos...');
    this.bancos = [
      'Banco de la Nación',
      'BCP - Banco de Crédito del Perú',
      'BBVA',
      'Scotiabank',
      'Interbank',
      'Banbif',
      'Banco Pichincha',
      'Banco GNB',
      'Banco Falabella',
      'Banco Ripley',
      'Caja Arequipa',
      'Caja Huancayo',
      'Caja Trujillo'
    ];
    console.log('✅ Bancos cargados:', this.bancos.length);
  }

  cargarCargos(): void {
    console.log('📋 Cargando cargos desde el backend...');
    
    // NO cargar cargos por defecto, esperar al backend
    this.cargos = [];
    
    // Cargar SOLO desde el backend
    this.http.get<{ success: boolean; data: any[] }>(`${this.apiBaseUrl}/api/cargos`)
      .subscribe({
        next: (response) => {
          console.log('🔍 Respuesta del backend:', response);
          
          if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
            // ELIMINAR DUPLICADOS por Nombre
            const cargosUnicos = new Map();
            response.data.forEach(cargo => {
              // Soportar tanto Nombre como nombre (PascalCase y camelCase)
              const nombreCargo = cargo.Nombre || cargo.nombre;
              if (cargo && nombreCargo && typeof nombreCargo === 'string') {
                const nombreNormalizado = nombreCargo.trim().toUpperCase();
                if (!cargosUnicos.has(nombreNormalizado)) {
                  // Normalizar el formato del cargo
                  const cargoNormalizado = {
                    CargoID: cargo.CargoID || cargo.cargoID || cargo.id,
                    Nombre: nombreCargo
                  };
                  cargosUnicos.set(nombreNormalizado, cargoNormalizado);
                }
              }
            });
            this.cargos = Array.from(cargosUnicos.values());
            this.cargosFiltrados = this.cargos; // Inicializar filtrados
            console.log('✅ Cargos del backend cargados (sin duplicados):', this.cargos.length);
            console.log('📋 Primeros 10 cargos:', this.cargos.slice(0, 10).map(c => c.Nombre));
          } else {
            console.error('⚠️  Backend no devolvió cargos o está vacío');
            // Como último recurso, usar cargos por defecto
            this.cargos = this.cargosOriginales.map(c => ({
              CargoID: c.id,
              Nombre: c.nombre
            }));
            this.cargosFiltrados = this.cargos; // Inicializar filtrados
            console.log('⚠️  Usando cargos por defecto:', this.cargos.length);
          }
        },
        error: (error) => {
          console.error('❌ Error al cargar cargos del backend:', error);
          console.error('❌ Detalles del error:', error.message);
          // Usar cargos por defecto en caso de error
          this.cargos = this.cargosOriginales.map(c => ({
            CargoID: c.id,
            Nombre: c.nombre
          }));
          this.cargosFiltrados = this.cargos; // Inicializar filtrados
          console.log('⚠️  Usando cargos por defecto debido a error:', this.cargos.length);
        }
      });
  }

  cargarSubgerencias(): void {
    console.log('📋 Cargando subgerencias desde el backend...');
    
    // Cargar desde backend
    this.http.get<any>(`${this.apiBaseUrl}/api/subgerencias`)
      .subscribe({
        next: (response: any) => {
          const subgerenciasData = response.data || [];
          // Normalizar formato para consistencia
          this.subgerenciasTodas = subgerenciasData.map((sub: any) => ({
            SubgerenciaID: sub.SubgerenciaID || sub.id,
            Nombre: sub.Nombre || sub.nombre,
            Descripcion: sub.Descripcion || sub.descripcion,
            GerenciaID: sub.GerenciaID || sub.gerenciaId, // Este apunta a Areas.AreaID
            GerenciaNombre: sub.GerenciaNombre || sub.gerenciaNombre
          }));
          this.subgerencias = this.subgerenciasTodas; // Mostrar todas por defecto
          console.log('✅ Subgerencias cargadas y normalizadas:', this.subgerencias.length);
          console.log('📋 Primeras 3 subgerencias:', this.subgerencias.slice(0, 3).map(s => ({
            id: s.SubgerenciaID,
            nombre: s.Nombre,
            gerenciaId: s.GerenciaID
          })));
        },
        error: (error) => {
          console.error('❌ Error al cargar subgerencias:', error);
          // Fallback a lista hardcodeada
          const fallback = [
            { SubgerenciaID: 1, Nombre: 'Subgerencia de Recursos Humanos', GerenciaID: 6 },
            { SubgerenciaID: 2, Nombre: 'Subgerencia de Contabilidad', GerenciaID: 6 },
            { SubgerenciaID: 3, Nombre: 'Subgerencia de Tesorería', GerenciaID: 6 },
            { SubgerenciaID: 4, Nombre: 'Subgerencia de Logística y Abastecimiento', GerenciaID: 6 },
            { SubgerenciaID: 5, Nombre: 'Subgerencia de Obras Públicas', GerenciaID: 12 },
            { SubgerenciaID: 6, Nombre: 'Subgerencia de Estudios y Proyectos', GerenciaID: 12 },
            { SubgerenciaID: 7, Nombre: 'Subgerencia de Limpieza Pública', GerenciaID: 13 },
            { SubgerenciaID: 8, Nombre: 'Subgerencia de Parques y Jardines', GerenciaID: 13 },
            { SubgerenciaID: 9, Nombre: 'Subgerencia de Serenazgo', GerenciaID: 14 },
            { SubgerenciaID: 10, Nombre: 'Subgerencia de Defensa Civil', GerenciaID: 14 }
          ];
          this.subgerenciasTodas = fallback;
          this.subgerencias = fallback;
          console.log('✅ Subgerencias fallback cargadas:', this.subgerencias.length);
        }
      });
  }

  cargarUnidades(): void {
    console.log('📋 Cargando unidades desde el backend...');
    
    // Cargar desde backend
    this.http.get<any>(`${this.apiBaseUrl}/api/unidades`)
      .subscribe({
        next: (response: any) => {
          console.log('🔍 Respuesta de unidades:', response);
          const unidadesData = response.data || response;
          
          if (Array.isArray(unidadesData) && unidadesData.length > 0) {
            // ELIMINAR DUPLICADOS por Nombre
            const unidadesUnicas = new Map();
            unidadesData.forEach((unidad: any) => {
              const nombre = unidad.Nombre || unidad.nombre;
              const id = unidad.UnidadID || unidad.id;
              const gerenciaId = unidad.GerenciaID || unidad.gerenciaId;
              const subgerenciaId = unidad.SubgerenciaID || unidad.subgerenciaId;
              if (nombre && !unidadesUnicas.has(nombre.trim().toUpperCase())) {
                unidadesUnicas.set(nombre.trim().toUpperCase(), { 
                  UnidadID: id, 
                  Nombre: nombre,
                  GerenciaID: gerenciaId,
                  SubgerenciaID: subgerenciaId
                });
              }
            });
            
            const unidadesArray = Array.from(unidadesUnicas.values());
            this.unidadesTodas = unidadesArray;
            this.unidades = unidadesArray; // Mostrar todas por defecto
            console.log('✅ Unidades cargadas desde el backend (sin duplicados):', this.unidades.length);
          } else {
            console.warn('⚠️ No se recibieron unidades válidas, usando fallback');
            this.usarUnidadesFallback();
          }
        },
        error: (error) => {
          console.error('❌ Error al cargar unidades:', error);
          this.usarUnidadesFallback();
        }
      });
  }

  usarUnidadesFallback(): void {
    // Unidades por defecto según organigrama
    const fallback = [
      { UnidadID: 1, Nombre: 'Unidad de Gestión Documentaria y Archivo Central', GerenciaID: null, SubgerenciaID: null },
      { UnidadID: 2, Nombre: 'Unidad Imagen Institucional y Comunicaciones', GerenciaID: null, SubgerenciaID: null },
      { UnidadID: 3, Nombre: 'Unidad de Recursos Humanos', GerenciaID: null, SubgerenciaID: null },
      { UnidadID: 4, Nombre: 'Unidad de Logística y Control Patrimonial', GerenciaID: null, SubgerenciaID: null },
      { UnidadID: 5, Nombre: 'Unidad de Contabilidad', GerenciaID: null, SubgerenciaID: null },
      { UnidadID: 6, Nombre: 'Unidad de Tecnología de la Información', GerenciaID: null, SubgerenciaID: null },
      { UnidadID: 7, Nombre: 'Unidad de Tesorería', GerenciaID: null, SubgerenciaID: null },
      { UnidadID: 8, Nombre: 'Unidad de Orientación, Recaudación y Control Tributario', GerenciaID: null, SubgerenciaID: null },
      { UnidadID: 9, Nombre: 'Unidad de Fiscalización Tributaria', GerenciaID: null, SubgerenciaID: null },
      { UnidadID: 10, Nombre: 'Unidad de Presupuesto', GerenciaID: null, SubgerenciaID: null },
      { UnidadID: 11, Nombre: 'Unidad de Programación Multianual de Inversiones', GerenciaID: null, SubgerenciaID: null },
      { UnidadID: 12, Nombre: 'Unidad de Planificación y Racionalización', GerenciaID: null, SubgerenciaID: null },
      { UnidadID: 13, Nombre: 'Unidad de Gestión Municipal', GerenciaID: null, SubgerenciaID: null },
      { UnidadID: 14, Nombre: 'Subunidad de limpieza pública y áreas verdes', GerenciaID: null, SubgerenciaID: null },
      { UnidadID: 15, Nombre: 'Subunidad de segregación y recolección de residuos sólidos', GerenciaID: null, SubgerenciaID: null },
      { UnidadID: 16, Nombre: 'Área de operación y mantenimiento', GerenciaID: null, SubgerenciaID: null },
      { UnidadID: 17, Nombre: 'Área comercial', GerenciaID: null, SubgerenciaID: null }
    ];
    this.unidadesTodas = fallback;
    this.unidades = fallback;
    console.log('✅ Unidades fallback cargadas:', this.unidades.length);
  }

  cargarRegimenesLaborales(): void {
    console.log('📋 Cargando regímenes laborales desde el backend...');
    this.http.get<any[]>(`${this.apiBaseUrl}/api/regimenes-laborales`)
      .subscribe({
        next: (response: any) => {
          this.regimenesLaborales = response.data || [];
          console.log('✅ Regímenes laborales cargados:', this.regimenesLaborales.length);
        },
        error: (error) => {
          console.error('❌ Error al cargar regímenes laborales:', error);
        }
      });
  }

  cargarTiposContrato(): void {
    console.log('📋 Cargando tipos de contrato desde el backend...');
    this.http.get<any[]>(`${this.apiBaseUrl}/api/tipos-contrato`)
      .subscribe({
        next: (response: any) => {
          this.tiposContrato = response.data || [];
          console.log('✅ Tipos de contrato cargados:', this.tiposContrato.length);
        },
        error: (error) => {
          console.error('❌ Error al cargar tipos de contrato:', error);
        }
      });
  }

  cargarCondicionesLaborales(): void {
    console.log('📋 Cargando condiciones laborales desde el backend...');
    this.http.get<any>(`${this.apiBaseUrl}/api/condiciones-laborales`)
      .subscribe({
        next: (response: any) => {
          this.condicionesLaborales = response.data || [];
          console.log('✅ Condiciones laborales cargadas:', this.condicionesLaborales.length);
        },
        error: (error) => {
          console.error('❌ Error al cargar condiciones laborales:', error);
          // Usar valores por defecto si falla la carga
          this.condicionesLaborales = [];
        }
      });
  }

  // OPTIMIZADO: Filtrar subgerencias SIN llamar al backend (más rápido)
  onAreaChange(areaId: number): void {
    console.log('📍 Área seleccionada:', areaId);
    
    // Resetear subgerencia y unidad seleccionadas
    this.trabajadorForm.patchValue({
      subgerencia: '',
      unidad: ''
    });
    
    // Si no hay área seleccionada, recargar todas las subgerencias
    if (!areaId) {
      this.cargarSubgerencias();
      return;
    }
    
    // NO hacer llamada al backend, solo filtrar localmente
    console.log('ℹ️  Filtrando subgerencias localmente (sin backend)');
  }

  // Filtrar subgerencias y unidades cuando se selecciona una gerencia
  onGerenciaChange(gerenciaId: string | number): void {
    const gerenciaIdNum = typeof gerenciaId === 'string' ? parseInt(gerenciaId) : gerenciaId;
    
    // Obtener nombre de la gerencia para debugging
    const gerenciaSeleccionada = this.gerencias.find(g => (g.GerenciaID || g.id || g.AreaID) == gerenciaIdNum);
    const nombreGerencia = gerenciaSeleccionada?.Nombre || gerenciaSeleccionada?.nombre || 'Desconocida';
    
    // IMPORTANTE: Las relaciones usan AreaID, no GerenciaID
    // Si la gerencia tiene AreaID, usarlo; si no, usar GerenciaID como AreaID
    const areaIdParaBuscar = gerenciaSeleccionada?.AreaID || gerenciaIdNum;
    
    console.log('🏢 ==========================================');
    console.log(`🏢 Gerencia/Oficina seleccionada: ${nombreGerencia}`);
    console.log(`🏢 GerenciaID recibido: ${gerenciaIdNum}`);
    console.log(`🏢 AreaID para buscar: ${areaIdParaBuscar}`);
    console.log('🏢 ==========================================');
    
    // Resetear subgerencia y unidad seleccionadas
    this.trabajadorForm.patchValue({
      subgerencia: '',
      unidad: ''
    });
    
    // SIEMPRE mostrar TODAS las subgerencias disponibles, sin filtrar por gerencia
    this.subgerencias = this.subgerenciasTodas;
    console.log(`ℹ️  Mostrando todas las subgerencias disponibles: ${this.subgerencias.length}`);
    
    // Si no hay gerencia seleccionada, mostrar todas las unidades también
    if (!gerenciaIdNum || gerenciaIdNum === 0) {
      this.unidades = this.unidadesTodas;
      console.log('ℹ️  Mostrando todas las unidades');
      return;
    }
    
    // Para las unidades, sí filtrar por gerencia si es necesario
    // Pero mantener todas las subgerencias visibles
    this.definirEstructuraGerencia(areaIdParaBuscar);
  }

  // Método auxiliar para definir si es Gerencia de Línea o Oficina
  definirEstructuraGerencia(areaId: number): void {
    console.log(`🔧 Definiendo estructura para AreaID: ${areaId}`);
    console.log(`📊 Subgerencias disponibles: ${this.subgerencias.length} (todas mostradas)`);
    
    // Obtener la gerencia seleccionada para verificar si es Oficina o Gerencia
    const gerenciaSeleccionada = this.gerencias.find(g => (g.AreaID || g.GerenciaID) == areaId);
    const esOficina = gerenciaSeleccionada?.Tipo === 'Oficina' || 
                      (gerenciaSeleccionada?.Nombre || '').toLowerCase().includes('oficina de');
    
    console.log(`📋 Tipo de entidad: ${esOficina ? 'OFICINA' : 'GERENCIA DE LÍNEA'}`);
    
    // MANTENER TODAS LAS SUBGERENCIAS VISIBLES (no limpiar)
    // this.subgerencias ya está configurado con todas las subgerencias en onGerenciaChange
    
    if (esOficina) {
      // Es una OFICINA: mostrar unidades directas
      console.log(`ℹ️  Oficina detectada: mostrar unidades directas`);
      
      // SIEMPRE cargar desde backend para asegurar datos actualizados
      console.log(`📡 Cargando unidades desde backend para Oficina AreaID ${areaId}...`);
      this.cargarUnidadesPorGerencia(areaId);
      
      // También filtrar localmente como respaldo
      this.unidades = this.unidadesTodas.filter(unidad => {
        const unidadAreaId = unidad.GerenciaID || unidad.gerenciaId;
        const unidadSubgerenciaId = unidad.SubgerenciaID || unidad.subgerenciaId;
        const esDirecta = unidadAreaId == areaId && (!unidadSubgerenciaId || unidadSubgerenciaId === 0 || unidadSubgerenciaId === null);
        if (esDirecta) {
          console.log(`  ✓ Unidad directa encontrada localmente: ${unidad.Nombre || unidad.nombre}`);
        }
        return esDirecta;
      });
      
      console.log(`📊 Unidades encontradas localmente: ${this.unidades.length}`);
    } else {
      // Es una GERENCIA DE LÍNEA: las unidades se mostrarán al seleccionar una subgerencia
      this.unidades = [];
      console.log(`ℹ️  Gerencia de Línea detectada. Las unidades se mostrarán al seleccionar una subgerencia.`);
    }
  }

  // Cargar subgerencias desde backend filtradas por AreaID (gerenciaId aquí es realmente AreaID)
  cargarSubgerenciasPorGerencia(areaId: number, callback?: () => void): void {
    console.log(`📋 Cargando subgerencias de AreaID ${areaId} desde backend...`);
    // NOTA: El endpoint usa 'gerencia' pero realmente busca por AreaID
    this.http.get<any>(`${this.apiBaseUrl}/api/subgerencias/gerencia/${areaId}`)
      .subscribe({
        next: (response: any) => {
          const subgerenciasData = response.data || [];
          console.log(`📦 Respuesta del backend: ${subgerenciasData.length} subgerencias recibidas`);
          
          if (subgerenciasData.length > 0) {
            // Normalizar formato
            const subgerenciasNormalizadas = subgerenciasData.map((sub: any) => ({
              SubgerenciaID: sub.SubgerenciaID || sub.id,
              Nombre: sub.Nombre || sub.nombre,
              Descripcion: sub.Descripcion || sub.descripcion,
              GerenciaID: sub.GerenciaID || sub.gerenciaId,
              GerenciaNombre: sub.GerenciaNombre || sub.gerenciaNombre
            }));
            
            // Actualizar la lista completa (sin duplicados)
            subgerenciasNormalizadas.forEach((sub: any) => {
              const subId = sub.SubgerenciaID || sub.id;
              const existe = this.subgerenciasTodas.find(s => (s.SubgerenciaID || s.id) === subId);
              if (!existe) {
                this.subgerenciasTodas.push(sub);
              }
            });
            
            // MANTENER todas las subgerencias visibles (no filtrar)
            this.subgerencias = this.subgerenciasTodas;
            
            console.log(`✅ Subgerencias actualizadas en lista completa. Total disponible: ${this.subgerenciasTodas.length}`);
            console.log(`📋 Subgerencias encontradas para AreaID ${areaId}:`, subgerenciasNormalizadas.map(s => s.Nombre));
          } else {
            console.log(`⚠️  No se encontraron subgerencias para AreaID ${areaId}`);
            // NO limpiar la lista, mantener todas las subgerencias visibles
            this.subgerencias = this.subgerenciasTodas;
          }
          
          // Ejecutar callback si existe
          if (callback) {
            callback();
          }
        },
        error: (error) => {
          console.error(`❌ Error al cargar subgerencias de AreaID ${areaId}:`, error);
          console.error(`Detalles del error:`, error);
          // En caso de error, mantener todas las subgerencias visibles
          this.subgerencias = this.subgerenciasTodas;
          console.log(`ℹ️  Manteniendo todas las subgerencias disponibles: ${this.subgerencias.length}`);
          // Ejecutar callback incluso si hay error para que defina la estructura
          if (callback) {
            callback();
          }
        }
      });
  }

  // Cargar unidades desde backend filtradas por AreaID (solo unidades directas, sin subgerencia)
  cargarUnidadesPorGerencia(areaId: number): void {
    console.log(`📋 Cargando unidades directas de AreaID ${areaId} desde backend...`);
    // NOTA: El endpoint usa 'gerencia' pero realmente busca por AreaID
    this.http.get<any>(`${this.apiBaseUrl}/api/unidades/gerencia/${areaId}`)
      .subscribe({
        next: (response: any) => {
          const unidadesData = response.data || [];
          console.log(`📦 Respuesta del backend: ${unidadesData.length} unidades recibidas`);
          
          // Filtrar solo unidades que NO tienen subgerencia (son directas de la oficina)
          const unidadesDirectas = unidadesData.filter((unidad: any) => {
            const subgerenciaId = unidad.SubgerenciaID || unidad.subgerenciaId;
            const esDirecta = !subgerenciaId || subgerenciaId === 0 || subgerenciaId === null;
            if (esDirecta) {
              console.log(`  ✓ Unidad directa: ${unidad.Nombre || unidad.nombre}`);
            }
            return esDirecta;
          });
          
          if (unidadesDirectas.length > 0) {
            // ACTUALIZAR la lista de unidades mostradas
            this.unidades = unidadesDirectas;
            // Actualizar también la lista completa
            unidadesDirectas.forEach((unidad: any) => {
              const unidadId = unidad.UnidadID || unidad.id;
              const existe = this.unidadesTodas.find(u => (u.UnidadID || u.id) === unidadId);
              if (!existe) {
                this.unidadesTodas.push(unidad);
              }
            });
            console.log(`✅ ${this.unidades.length} unidades directas cargadas desde backend para AreaID ${areaId}`);
            console.log(`📋 Unidades disponibles:`, this.unidades.map(u => u.Nombre || u.nombre));
          } else {
            console.warn(`⚠️ No se encontraron unidades directas para AreaID ${areaId}`);
            // Si no hay unidades directas, limpiar la lista
            this.unidades = [];
            // Si no hay unidades directas, intentar cargar todas las unidades de la gerencia
            // (puede que algunas unidades no tengan el campo SubgerenciaID correctamente configurado)
            if (unidadesData.length > 0) {
              console.log(`ℹ️  Usando todas las unidades de la gerencia (${unidadesData.length} unidades)`);
              this.unidades = unidadesData;
              unidadesData.forEach((unidad: any) => {
                const unidadId = unidad.UnidadID || unidad.id;
                if (!this.unidadesTodas.find(u => (u.UnidadID || u.id) === unidadId)) {
                  this.unidadesTodas.push(unidad);
                }
              });
            }
          }
        },
        error: (error) => {
          console.error(`❌ Error al cargar unidades de AreaID ${areaId}:`, error);
          console.error(`Error completo:`, error);
        }
      });
  }

  // Filtrar unidades cuando se selecciona una subgerencia
  onSubgerenciaChange(subgerenciaId: string | number): void {
    const subgerenciaIdNum = typeof subgerenciaId === 'string' ? parseInt(subgerenciaId) : subgerenciaId;
    console.log('📍 Subgerencia seleccionada:', subgerenciaIdNum);
    
    // Resetear unidad seleccionada
    this.trabajadorForm.patchValue({
      unidad: ''
    });
    
    // Si no hay subgerencia seleccionada, mostrar unidades de la gerencia seleccionada
    if (!subgerenciaIdNum || subgerenciaIdNum === 0) {
      const gerenciaId = this.trabajadorForm.get('gerencia')?.value;
      if (gerenciaId) {
        // Obtener AreaID de la gerencia seleccionada
        const gerenciaSeleccionada = this.gerencias.find(g => (g.GerenciaID || g.id) == gerenciaId);
        const areaId = gerenciaSeleccionada?.AreaID || gerenciaId;
        this.definirEstructuraGerencia(areaId);
      } else {
        this.unidades = this.unidadesTodas;
      }
      return;
    }
    
    // Filtrar unidades por subgerencia
    this.unidades = this.unidadesTodas.filter(unidad => {
      const unidadSubgerenciaId = unidad.SubgerenciaID || unidad.subgerenciaId;
      return unidadSubgerenciaId == subgerenciaIdNum;
    });
    console.log(`✅ Unidades filtradas para subgerencia ${subgerenciaIdNum}:`, this.unidades.length);
    
    // Si no hay resultados, intentar cargar desde backend
    if (this.unidades.length === 0) {
      this.cargarUnidadesPorSubgerencia(subgerenciaIdNum);
    }
  }

  // Cargar unidades desde backend filtradas por subgerencia
  cargarUnidadesPorSubgerencia(subgerenciaId: number): void {
    console.log(`📋 Cargando unidades de subgerencia ${subgerenciaId} desde backend...`);
    this.http.get<any>(`${this.apiBaseUrl}/api/unidades/subgerencia/${subgerenciaId}`)
      .subscribe({
        next: (response: any) => {
          const unidadesData = response.data || [];
          if (unidadesData.length > 0) {
            this.unidades = unidadesData;
            console.log(`✅ Unidades cargadas desde backend para subgerencia ${subgerenciaId}:`, this.unidades.length);
          }
        },
        error: (error) => {
          console.error(`❌ Error al cargar unidades de subgerencia ${subgerenciaId}:`, error);
        }
      });
  }

  crearFormulario(): void {
    console.log('[crearFormulario] Creando formulario de trabajador');
    this.trabajadorForm = this.fb.group({
      // PASO 1: Datos Personales - SOLO DNI, APELLIDOS Y NOMBRES OBLIGATORIOS
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      apellidoPaterno: ['', [Validators.required, Validators.minLength(2)]],
      // Solicitud del usuario: solo DNI, apellido paterno y nombres obligatorios
      apellidoMaterno: [''],
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      fechaNacimiento: [''],  // OPCIONAL
      sexo: [null],  // OPCIONAL - null para mostrar "Seleccione"
      estadoCivil: [''],  // OPCIONAL
      nacionalidad: ['Peruana'],  // OPCIONAL - Por defecto "Peruana"

      // PASO 2: Datos de Contacto - TODOS OPCIONALES (se pueden completar después)
      telefono: [''],  // OPCIONAL
      celular: [''],  // OPCIONAL
      emailPersonal: [''],  // OPCIONAL
      emailCorporativo: [''],  // OPCIONAL
      direccion: [''],  // OPCIONAL
      contactoEmergenciaNombre: [''],  // OPCIONAL
      contactoEmergenciaParentesco: [''],  // OPCIONAL
      contactoEmergenciaTelefono: [''],  // OPCIONAL - Solo números, máximo 9 dígitos
      departamento: [''],  // OPCIONAL
      provincia: [''],  // OPCIONAL
      distrito: [''],  // OPCIONAL

      // PASO 3: Datos Laborales - TODOS OPCIONALES (se completan al editar)
      cargo: [''],  // OPCIONAL
      cargoTexto: [''],  // OPCIONAL - Texto personalizado
      area: [''],  // OPCIONAL
      areaTexto: [''],  // OPCIONAL - Texto personalizado
      subgerencia: [''],  // OPCIONAL
      subgerenciaTexto: [''],  // OPCIONAL - Texto personalizado
      unidad: [''],  // OPCIONAL
      unidadTexto: [''],  // OPCIONAL - Texto personalizado
      gerencia: [''],  // OPCIONAL
      gerenciaTexto: [''],  // OPCIONAL - Texto personalizado
      
      // NUEVOS CAMPOS CRÍTICOS
      estado: ['Activo'],  // OPCIONAL - Estado del trabajador
      condicion: [''],  // OPCIONAL - Condición del cargo
      condicionTexto: [''],  // OPCIONAL - Texto personalizado
      nivel: [''],  // OPCIONAL - Nivel/Categoría
      nivelTexto: [''],  // OPCIONAL - Texto personalizado
      tipoPlaza: [''],  // OPCIONAL - Tipo de plaza
      tipoPlazaTexto: [''],  // OPCIONAL - Texto personalizado
      grupoOcupacional: [''],  // OPCIONAL - Grupo ocupacional
      grupoOcupacionalTexto: [''],  // OPCIONAL - Texto personalizado
      
      tipoContrato: [''],  // OPCIONAL
      tipoContratoTexto: [''],  // OPCIONAL - Texto personalizado
      regimenLaboral: [''],  // OPCIONAL
      regimenLaboralTexto: [''],  // OPCIONAL - Texto personalizado
      fechaIngreso: [''],  // OPCIONAL
      fechaInicioContrato: [''],  // OPCIONAL
      fechaFinContrato: [''],  // OPCIONAL

      // PASO 4: Datos de Remuneración - TODOS OPCIONALES
      remuneracionBasica: [0],  // OPCIONAL
      costoVida: [0],  // OPCIONAL
      tieneAsignacionFamiliar: [false],
      numeroHijos: [''],  // OPCIONAL
      movilidad: [0],  // OPCIONAL
      horasExtras: [0],  // OPCIONAL
      bonoProductividad: [''],  // OPCIONAL
      pc_2015_2016: [0],  // OPCIONAL - P.C (2015-2016)
      ra_829_2011_mdh: [0],  // OPCIONAL - R.A (829-2011-MDH)
      otrasReintegros: [0],  // OPCIONAL - Otras y/o Reintegros
      convenio_2022_2023: [0],  // OPCIONAL - CONVENIO CENTRALIZADO (2022-2023)
      convenio_2023_2024: [0],  // OPCIONAL - CONVENIO CENTRALIZADO (2023-2024)
      convenio_2024_2025: [0],  // OPCIONAL - CONVENIO CENTRALIZADO (2024-2025)
      homologacion: [0],  // OPCIONAL - Homologación
      otrosIngresos: [''],  // OPCIONAL
      sistemasPensiones: [''],  // OPCIONAL
      cuspp: [''],  // OPCIONAL
      tipoComisionAFP: [''],  // OPCIONAL
      codigoEssalud: [''],  // OPCIONAL - Código de afiliación a ESSALUD
      esSindicalizado: [false],
      tieneRimacSeguros: [false],  // OPCIONAL - Tiene seguro Rimac
      aporteRimacSeguros: [0],  // OPCIONAL - Monto que aporta a Rimac Seguros
      tieneDescuentoJudicial: [false],  // OPCIONAL - Tiene descuento judicial
      montoDescuentoJudicial: [0],  // OPCIONAL - Monto del descuento judicial
      numeroCuentaDescuento: [''],  // OPCIONAL - Número de cuenta para descuento judicial

      // PASO 5: Datos Bancarios - TODOS OPCIONALES
      banco: [''],
      tipoCuenta: [''],
      numeroCuenta: [''],
      cci: ['']
    });

    // LISTENER PARA DNI: Verificar borrador existente
    this.trabajadorForm.get('dni')?.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(value => {
        if (value && value.length === 8) {
          this.verificarBorradorExistente();
        }
      });

    // OPTIMIZADO: Usar debounceTime para no ejecutar en cada tecla
    this.trabajadorForm.get('departamento')?.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(value => {
        this.onDepartamentoChange(value);
      });
      
    this.trabajadorForm.get('provincia')?.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(value => {
        this.onProvinciaChange(value);
      });
      
    this.trabajadorForm.get('sistemasPensiones')?.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(value => {
        this.onSistemaPensionesChange(value);
      });

    // Convertir a MAYÚSCULAS los campos de texto (OPTIMIZADO)
    this.convertirAMayusculas();
  }

  /**
   * Convierte automáticamente a MAYÚSCULAS los campos de texto mientras el usuario escribe
   * OPTIMIZADO: Con debounceTime para mejor rendimiento
   */
  convertirAMayusculas(): void {
    const camposTexto = [
      'apellidoPaterno',
      'apellidoMaterno', 
      'nombres',
      'direccion',
      'distrito',
      // 'banco', // Excluido: es un select, no un input de texto
      'numeroCuenta',
      'cci',
      'cuspp'
    ];

    camposTexto.forEach(campo => {
      this.trabajadorForm.get(campo)?.valueChanges
        .pipe(debounceTime(500), distinctUntilChanged()) // Espera 500ms después de escribir
        .subscribe(value => {
          if (value && typeof value === 'string') {
            const valorMayuscula = value.toUpperCase();
            if (value !== valorMayuscula) {
              this.trabajadorForm.get(campo)?.setValue(valorMayuscula, { emitEvent: false });
            }
          }
        });
    });
  }

  /**
   * Filtrar cargos mientras el usuario escribe
   */
  filtrarCargos(): void {
    const busqueda = this.busquedaCargoTexto.toLowerCase().trim();
    
    if (!busqueda) {
      this.cargosFiltrados = this.cargos;
      return;
    }
    
    this.cargosFiltrados = this.cargos.filter(cargo => {
      const nombre = (cargo.Nombre || '').toLowerCase();
      return nombre.includes(busqueda);
    });
    
    this.mostrarDropdownCargos = true;
  }
  
  /**
   * Seleccionar un cargo del dropdown
   */
  seleccionarCargo(cargo: any): void {
    this.cargoSeleccionado = cargo;
    this.busquedaCargoTexto = cargo.Nombre;
    this.trabajadorForm.patchValue({ cargo: cargo.CargoID });
    this.mostrarDropdownCargos = false;
    console.log('✅ Cargo seleccionado:', cargo.Nombre);
  }
  
  /**
   * Limpiar cargo seleccionado
   */
  limpiarCargo(): void {
    this.cargoSeleccionado = null;
    this.busquedaCargoTexto = '';
    this.trabajadorForm.patchValue({ cargo: '' });
    this.cargosFiltrados = this.cargos;
    this.mostrarDropdownCargos = false;
  }
  

  onDepartamentoChange(codigoDep: string, resetearValores: boolean = true): void {
    console.log('[onDepartamentoChange] codigoDep:', codigoDep, 'resetearValores:', resetearValores);
    const dep = this.departamentos.find(d => d.codigo === codigoDep);
    this.provincias = dep?.provincias || [];
    this.distritos = [];
    console.log('[onDepartamentoChange] provincias:', this.provincias);
    
    // Solo resetear valores si se indica explícitamente
    if (resetearValores) {
      this.trabajadorForm.patchValue({ provincia: '', distrito: '' });
    }
  }

  onProvinciaChange(codigoProv: string, resetearValores: boolean = true): void {
    console.log('═══════════════════════════════════════════');
    console.log('🔍 [onProvinciaChange] INICIO');
    console.log('📍 codigoProv recibido:', codigoProv);
    console.log('📋 provincias disponibles:', this.provincias.length);
    console.log('🔄 resetearValores:', resetearValores);
    
    const prov = this.provincias.find(p => p.codigo === codigoProv);
    console.log('🎯 Provincia encontrada:', prov);
    
    this.distritos = prov?.distritos || [];
    console.log('📍 Distritos asignados:', this.distritos.length);
    console.log('📋 Lista de distritos:', this.distritos);
    
    // Solo resetear distrito si se indica explícitamente
    if (resetearValores) {
      this.trabajadorForm.patchValue({ distrito: '' });
      console.log('✅ Valor del form distrito reseteado');
    } else {
      console.log('ℹ️  Manteniendo valor de distrito (recuperación de datos)');
    }
    
    // Verificar qué valor tiene el select después de un momento
    setTimeout(() => {
      const valorActual = this.trabajadorForm.get('distrito')?.value;
      console.log('🔍 Valor distrito después de 100ms:', valorActual);
      console.log('🔍 Distritos en this.distritos:', this.distritos);
    }, 100);
    
    console.log('═══════════════════════════════════════════');
  }

  mostrarDepartamentosDropdown: boolean = false;
  mostrarProvinciasDropdown: boolean = false;
  mostrarDistritosDropdown: boolean = false;

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    // Cerrar dropdowns de ubigeo si se hace click fuera
    if (!target.closest('.custom-select-wrapper') && 
        !target.closest('.custom-dropdown') &&
        !target.closest('.custom-option')) {
      this.mostrarDepartamentosDropdown = false;
      this.mostrarProvinciasDropdown = false;
      this.mostrarDistritosDropdown = false;
    }
    
    // Cerrar dropdown de cargos
    if (!target.closest('.form-group')) {
      this.mostrarDropdownCargos = false;
    }
  }

  // DEPARTAMENTO
  toggleDepartamentoDropdown(): void {
    this.mostrarDepartamentosDropdown = !this.mostrarDepartamentosDropdown;
    this.mostrarProvinciasDropdown = false;
    this.mostrarDistritosDropdown = false;
  }

  seleccionarDepartamento(codigo: string): void {
    this.trabajadorForm.patchValue({ departamento: codigo });
    this.mostrarDepartamentosDropdown = false;
    this.onDepartamentoChange(codigo);
  }

  trackByCodigo(index: number, item: any): any {
    return item?.codigo || index;
  }

  getDepartamentoNombre(codigo: string): string {
    const dep = this.departamentos.find(d => d.codigo === codigo);
    return dep ? dep.nombre.toUpperCase() : '';
  }

  // PROVINCIA
  toggleProvinciaDropdown(): void {
    this.mostrarProvinciasDropdown = !this.mostrarProvinciasDropdown;
    this.mostrarDepartamentosDropdown = false;
    this.mostrarDistritosDropdown = false;
  }

  seleccionarProvincia(codigo: string): void {
    this.trabajadorForm.patchValue({ provincia: codigo });
    this.mostrarProvinciasDropdown = false;
    this.onProvinciaChange(codigo);
  }

  getProvinciaNombre(codigo: string): string {
    const prov = this.provincias.find(p => p.codigo === codigo);
    return prov ? prov.nombre.toUpperCase() : '';
  }

  // DISTRITO
  toggleDistritoDropdown(): void {
    this.mostrarDistritosDropdown = !this.mostrarDistritosDropdown;
    this.mostrarDepartamentosDropdown = false;
    this.mostrarProvinciasDropdown = false;
  }

  seleccionarDistrito(distrito: string): void {
    this.trabajadorForm.patchValue({ distrito: distrito.toUpperCase() });
    this.mostrarDistritosDropdown = false;
  }

  onDistritoChange(distrito: string): void {
    console.log('🏙️  ═════════════════════════════════════');
    console.log('🏙️  [onDistritoChange] CAMBIO DETECTADO');
    console.log('🏙️  Distrito seleccionado:', distrito);
    console.log('🏙️  Tipo:', typeof distrito);
    console.log('🏙️  ═════════════════════════════════════');
  }

  onSistemaPensionesChange(sistema: string): void {
    console.log('[onSistemaPensionesChange] sistema:', sistema);
    const cusppControl = this.trabajadorForm.get('cuspp');
    const tipoComisionAFPControl = this.trabajadorForm.get('tipoComisionAFP');
    if (sistema === 'ONP') {
      cusppControl?.clearValidators();
      cusppControl?.setValue('');
      tipoComisionAFPControl?.clearValidators();
      tipoComisionAFPControl?.setValue('');
    } else {
      cusppControl?.setValidators([Validators.required, Validators.pattern(/^[A-Z0-9]{12}$/)]);
      tipoComisionAFPControl?.setValidators([Validators.required]);
    }
    cusppControl?.updateValueAndValidity();
    tipoComisionAFPControl?.updateValueAndValidity();
  }

  buscarDNI(): void {
    const dni = this.trabajadorForm.get('dni')?.value;
    console.log('[buscarDNI] dni:', dni);
    
    // Verificar si no hay DNI ingresado
    if (!dni || dni.trim() === '') {
      this.mensajeDNI = 'Ingrese un DNI';
      this.mostrarModalDNIInvalido = true;
      return;
    }
    
    // Verificar si el DNI no tiene 8 dígitos
    if (dni.length !== 8) {
      this.mensajeDNI = 'El DNI debe tener exactamente 8 dígitos. Ejemplo: 12345678';
      this.mostrarModalDNIInvalido = true;
      return;
    }
    
    // Si RENIEC está desactivada y el usuario presiona "Buscar RENIEC", mostrar el modal
    if (!this.reniecHabilitado) {
      console.log('[buscarDNI] RENIEC desactivada, mostrando modal informativo');
      this.mostrarModalRENIECDeshabilitado = true;
      return;
    }
    
    // Si RENIEC está habilitada, proceder con la búsqueda
    this.ejecutarBusquedaRENIEC(dni);
  }
  
  verificarEstadoRENIEC(): void {
    // Verificar primero desde localStorage
    const configGuardada = localStorage.getItem('configuracionSistema');
    if (configGuardada) {
      try {
        const config = JSON.parse(configGuardada);
        if (config.integraciones) {
          this.reniecHabilitado = config.integraciones.integrarRENIEC === true;
          console.log('[verificarEstadoRENIEC] RENIEC habilitado (localStorage):', this.reniecHabilitado);
          return;
        }
      } catch (error) {
        console.error('Error al parsear configuración de localStorage:', error);
      }
    }
    
    // Si no está en localStorage, consultar al backend
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.http.get(`${environment.apiUrl}/configuracion/INTEGRACIONES`, { headers }).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.reniecHabilitado = response.data.integrarRENIEC === true;
          console.log('[verificarEstadoRENIEC] RENIEC habilitado (backend):', this.reniecHabilitado);
          
          // Guardar en localStorage para futuras consultas
          if (configGuardada) {
            try {
              const config = JSON.parse(configGuardada);
              if (!config.integraciones) config.integraciones = {};
              config.integraciones.integrarRENIEC = this.reniecHabilitado;
              localStorage.setItem('configuracionSistema', JSON.stringify(config));
            } catch (error) {
              console.error('Error al actualizar configuración en localStorage:', error);
            }
          }
        } else {
          // Si no hay configuración, asumir que está habilitado (comportamiento por defecto)
          this.reniecHabilitado = true;
          console.log('[verificarEstadoRENIEC] Sin configuración, asumiendo RENIEC habilitado');
        }
      },
      error: (error) => {
        console.error('Error al verificar configuración de RENIEC desde backend:', error);
        // En caso de error, asumir que está habilitado (comportamiento por defecto)
        this.reniecHabilitado = true;
      }
    });
  }
  
  ejecutarBusquedaRENIEC(dni: string): void {
    this.buscandoRENIEC = true;
    
    // Llamar a través del backend para evitar problemas de CORS
    console.log('[buscarDNI] Consultando RENIEC a través del backend...');
    
    // Obtener el token del localStorage para autenticación con el backend
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    // Usar el endpoint del backend en lugar de llamar directamente a la API externa
    const backendUrl = `${this.apiUrl}/reniec/${dni}`;
    console.log('[buscarDNI] Llamando a backend:', backendUrl);
    
    this.http.get<any>(backendUrl, { headers }).subscribe({
      next: (response) => {
        this.buscandoRENIEC = false;
        console.log('[buscarDNI] respuesta del backend:', response);
        
        // El backend devuelve: { success: true, data: {...} }
        if (response.success && response.data) {
          const datos = response.data;
          
          console.log('[buscarDNI] Datos recibidos del backend:', datos);
          
          // Mapear datos de RENIEC al formulario
          // El backend ya mapea los datos, pero verificamos todos los campos posibles
          const datosMapeados: any = {};
          
          // El backend ya mapea los datos, pero los normalizamos para asegurar consistencia
          datosMapeados.nombres = (datos.nombres || '').toUpperCase();
          datosMapeados.apellidoPaterno = (datos.apellidoPaterno || '').toUpperCase();
          datosMapeados.apellidoMaterno = (datos.apellidoMaterno || '').toUpperCase();
          datosMapeados.fechaNacimiento = datos.fechaNacimiento || '';
          datosMapeados.sexo = datos.sexo ? (datos.sexo || '').toUpperCase() : null;
          
          console.log('[buscarDNI] Datos mapeados al formulario:', datosMapeados);
          
          // Aplicar los datos al formulario
          this.trabajadorForm.patchValue(datosMapeados);
          
          // Mostrar modal de éxito con animación
          this.mostrarModalExitoRENIEC = true;
          this.cargandoDatosRENIEC = true;
          this.datosRENIECCompletados = false;
          
          // Simular proceso de carga
          setTimeout(() => {
            this.cargandoDatosRENIEC = false;
            this.datosRENIECCompletados = true;
            
            // Cerrar automáticamente después de mostrar el checkmark
            setTimeout(() => {
              this.cerrarModalExitoRENIEC();
            }, 2000);
          }, 1500);
        } else {
          alert('❌ DNI no encontrado en RENIEC');
        }
      },
      error: (error) => {
        this.buscandoRENIEC = false;
        console.error('[buscarDNI] Error RENIEC:', error);
        
        // Manejar diferentes tipos de errores
        if (error.status === 403) {
          // Si es error 403, RENIEC está desactivada
          console.log('[ejecutarBusquedaRENIEC] RENIEC desactivada (403), permitiendo ingreso manual');
          this.reniecHabilitado = false;
          // No mostrar modal, permitir que el usuario ingrese datos manualmente
          this.dniValido = true;
          this.dniExiste = false;
          return;
        } else if (error.status === 404) {
          alert('❌ DNI no encontrado en RENIEC');
        } else if (error.status === 401) {
          const errorMessage = error.error?.message || 'Error de autenticación';
          console.error('[buscarDNI] Detalles del error:', {
            status: error.status,
            message: errorMessage,
            error: error.error
          });
          
          if (errorMessage.includes('Token inválido') || errorMessage.includes('Token invalido')) {
            alert('❌ Token inválido.\n\nEl token configurado en el backend no es válido o ha expirado.\n\nPor favor:\n1. Verifica que el token sea correcto en el backend\n2. Contacta al proveedor de la API para obtener un token válido\n3. Actualiza el token en: backend/controllers/trabajadorController.js');
          } else {
            alert('⚠️ Error de autenticación con la API de RENIEC.\n\nMensaje: ' + errorMessage + '\n\nVerifique que el token esté configurado correctamente en el backend.');
          }
        } else if (error.status === 0) {
          alert('⚠️ No se pudo conectar con la API de RENIEC. Verifique su conexión a internet.');
        } else {
          alert('⚠️ No se pudo conectar con RENIEC. Por favor, ingrese los datos manualmente.');
        }
      }
    });
  }

  get calcularEdad(): number {
    const fechaNac = this.trabajadorForm.get('fechaNacimiento')?.value;
    if (!fechaNac) return 0;
    const hoy = new Date();
    const nacimiento = new Date(fechaNac);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  get totalIngresos(): number {
    const basica = this.trabajadorForm.get('remuneracionBasica')?.value || 0;
    const costoVida = +this.trabajadorForm.get('costoVida')?.value || 0;
    const asignacion = this.trabajadorForm.get('tieneAsignacionFamiliar')?.value ? 102.5 : 0;
    const movilidad = +this.trabajadorForm.get('movilidad')?.value || 0;
    const horasExtras = +this.trabajadorForm.get('horasExtras')?.value || 0;
    const bono = +this.trabajadorForm.get('bonoProductividad')?.value || 0;
    const pc_2015_2016 = +this.trabajadorForm.get('pc_2015_2016')?.value || 0;
    const ra_829_2011_mdh = +this.trabajadorForm.get('ra_829_2011_mdh')?.value || 0;
    const otrasReintegros = +this.trabajadorForm.get('otrasReintegros')?.value || 0;
    const convenio_2022_2023 = +this.trabajadorForm.get('convenio_2022_2023')?.value || 0;
    const convenio_2023_2024 = +this.trabajadorForm.get('convenio_2023_2024')?.value || 0;
    const convenio_2024_2025 = +this.trabajadorForm.get('convenio_2024_2025')?.value || 0;
    const homologacion = +this.trabajadorForm.get('homologacion')?.value || 0;
    const otros = +this.trabajadorForm.get('otrosIngresos')?.value || 0;
    const total = basica + costoVida + asignacion + movilidad + horasExtras + bono + 
                  pc_2015_2016 + ra_829_2011_mdh + otrasReintegros + 
                  convenio_2022_2023 + convenio_2023_2024 + convenio_2024_2025 + 
                  homologacion + otros;
    return total;
  }

  siguientePaso(): void {
    console.log('[siguientePaso] paso actual:', this.paso);
    if (this.validarPasoActual()) {
      this.paso++;
      console.log('[siguientePaso] paso siguiente:', this.paso);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  pasoAnterior(): void {
    this.paso--;
    console.log('[pasoAnterior] paso anterior:', this.paso);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getProgressWidth(): string {
    // Calcular el ancho de la línea de progreso
    // La línea debe llegar hasta el centro del círculo del paso actual
    // Los círculos están distribuidos uniformemente, así que:
    // - Paso 1: 0% (solo el círculo 1, no hay línea visible)
    // - Paso 2: Debe llegar al centro del círculo 2
    // - Paso 3: Debe llegar al centro del círculo 3
    // - Paso 4: Debe llegar al centro del círculo 4
    // - Paso 5: Debe llegar al centro del círculo 5 sin extenderse más allá
    
    if (this.paso === 1) {
      return '0%';
    } else if (this.paso === 2) {
      // Paso 2: Ajustado para llegar exactamente al centro del círculo 2
      // Considerando el espacio entre círculos y el radio del círculo
      return '28%'; // Ajustado para llegar al centro del círculo 2
    } else if (this.paso === 3) {
      // Paso 3: Ajustado para llegar exactamente al centro del círculo 3
      return '52%'; // Ajustado para llegar al centro del círculo 3
    } else if (this.paso === 4) {
      // Paso 4: Ajustado para llegar exactamente al centro del círculo 4 sin pasarse
      return '71%'; // Ajustado para llegar justo al centro del círculo 4 sin extenderse
    } else if (this.paso === this.totalPasos) {
      // Paso 5: Ajustado para que termine en el centro del círculo 5 sin extenderse
      return '92%';
    } else {
      // Fallback: cálculo proporcional
      const percentage = ((this.paso - 1) / (this.totalPasos - 1)) * 100;
      return `${percentage}%`;
    }
  }

  validarPasoActual(): boolean {
    const camposPorPaso: { [key: number]: string[] } = {
      1: ['dni', 'apellidoPaterno', 'apellidoMaterno', 'nombres'],  // SOLO DATOS BÁSICOS
      2: [],  // TODOS OPCIONALES
      3: [],  // TODOS OPCIONALES
      4: [],  // TODOS OPCIONALES
      5: []   // TODOS OPCIONALES
    };
    
    const campos = camposPorPaso[this.paso] || [];
    let valido = true;
    
    campos.forEach(campo => {
      const control = this.trabajadorForm.get(campo);
      console.log('[validarPasoActual] campo:', campo, 'valor:', control?.value, 'invalid:', control?.invalid);
      if (control?.invalid) {
        control.markAsTouched();
        valido = false;
      }
    });
    
    // Validación especial para el paso 1 (Datos Personales)
    if (this.paso === 1) {
      // Verificar si el DNI ya existe
      if (this.dniExiste) {
        alert('⚠️ Este DNI ya existe en el sistema. No puede continuar.');
        valido = false;
      }
      
      // Verificar si está validando el DNI
      if (this.validandoDNI) {
        alert('⚠️ Validando DNI, espere un momento...');
        valido = false;
      }
      
      // Verificar si el DNI no es válido
      if (!this.dniValido) {
        alert('⚠️ DNI inválido o error de conexión');
        valido = false;
      }
    }
    
    if (!valido && this.paso === 1) {
      if (this.dniExiste) {
        // No mostrar alerta adicional si ya se mostró la del DNI
      } else if (this.validandoDNI) {
        // No mostrar alerta adicional si ya se mostró la de validación
      } else {
        alert('⚠️ Complete los campos obligatorios: DNI, Apellidos y Nombres');
      }
    }
    
    return valido;
  }

  async guardarTrabajador(): Promise<void> {
    if (this.trabajadorForm.invalid) {
      Object.keys(this.trabajadorForm.controls).forEach(key => {
        this.trabajadorForm.get(key)?.markAsTouched();
      });
      alert('⚠️ Complete todos los campos obligatorios');
      console.log('[guardarTrabajador] Formulario inválido:', this.trabajadorForm.value);
      return;
    }
    this.guardando = true;
    const form = this.trabajadorForm.value;
    console.log('[guardarTrabajador] Formulario válido, datos:', form);

    // Crear elementos personalizados en la base de datos si es necesario
    try {
      await this.crearElementosPersonalizados(form);
    } catch (error) {
      console.error('Error al crear elementos personalizados:', error);
      this.guardando = false;
      alert('Error al crear elementos personalizados');
      return;
    }

    // Convertir códigos a nombres
    const deptoSeleccionado = this.departamentos.find(d => d.codigo === form.departamento);
    const provSeleccionada = this.provincias.find(p => p.codigo === form.provincia);

    // Mapeo para backend (ajusta los ID según tu lógica real)
    // TODOS LOS CAMPOS DE TEXTO EN MAYÚSCULAS
    const trabajador = {
      numeroDocumento: form.dni,
      apellidoPaterno: (form.apellidoPaterno || '').toUpperCase(),
      apellidoMaterno: (form.apellidoMaterno || '').toUpperCase(),
      nombres: (form.nombres || '').toUpperCase(),
      fechaNacimiento: form.fechaNacimiento,
      sexo: form.sexo || '',
      estadoCivil: form.estadoCivil,
      emailPersonal: form.emailPersonal ? form.emailPersonal.toLowerCase() : '', // Correo personal en minúsculas
      emailCorporativo: form.emailCorporativo ? form.emailCorporativo.toLowerCase() : '', // Correo corporativo en minúsculas
      celular: form.celular,
      telefono: form.telefono,
      direccion: (form.direccion || '').toUpperCase(),
      contactoEmergenciaNombre: (form.contactoEmergenciaNombre || '').toUpperCase(),
      contactoEmergenciaParentesco: form.contactoEmergenciaParentesco || '',
      contactoEmergenciaTelefono: form.contactoEmergenciaTelefono || '',
      distrito: (form.distrito || 'Huanchaco').toUpperCase(),
      provincia: (provSeleccionada?.nombre || form.provincia || 'Trujillo').toUpperCase(),
      departamento: (deptoSeleccionado?.nombre || form.departamento || 'La Libertad').toUpperCase(),
      // Organización - Usar IDs (los elementos personalizados ya se crearon)
      areaId: Number(form.area) ? Number(form.area) : null,
      cargoId: Number(form.cargo) ? Number(form.cargo) : null,
      subgerenciaId: form.subgerencia ? Number(form.subgerencia) : null,
      unidadId: form.unidad ? Number(form.unidad) : null,
      gerencia: String(form.gerencia || '').toUpperCase(),
      // Clasificación - Usar texto personalizado si está en modo input, sino usar valor del select
      estado: form.estado || 'Activo',
      condicion: this.condicionInputMode ? String(form.condicionTexto || '').toUpperCase() : String(form.condicion || '').toUpperCase(),
      nivel: this.nivelInputMode ? String(form.nivelTexto || '').toUpperCase() : String(form.nivel || '').toUpperCase(),
      tipoPlaza: this.tipoPlazaInputMode ? String(form.tipoPlazaTexto || '').toUpperCase() : String(form.tipoPlaza || '').toUpperCase(),
      grupoOcupacional: this.grupoOcupacionalInputMode ? String(form.grupoOcupacionalTexto || '').toUpperCase() : String(form.grupoOcupacional || '').toUpperCase(),
      // Contrato - Usar texto personalizado si está en modo input, sino usar valor del select
      tipoContrato: this.tipoContratoInputMode ? String(form.tipoContratoTexto || '').toUpperCase() : String(form.tipoContrato || ''),
      regimenLaboral: this.regimenLaboralInputMode ? String(form.regimenLaboralTexto || '').toUpperCase() : String(form.regimenLaboral || ''),
      fechaIngreso: form.fechaIngreso,
      fechaInicioContrato: form.fechaInicioContrato || '',
      fechaFinContrato: form.fechaFinContrato || '',
      // Remuneración
      salarioBase: form.remuneracionBasica,
      costoVida: form.costoVida || 0,
      asignacionFamiliar: form.tieneAsignacionFamiliar ? 102.5 : 0,
      numeroHijos: form.numeroHijos || 0,
      movilidad: form.movilidad || 0,
      horasExtras: form.horasExtras || 0,
      bonoProductividad: form.bonoProductividad || 0,
      pc_2015_2016: form.pc_2015_2016 || 0,
      ra_829_2011_mdh: form.ra_829_2011_mdh || 0,
      otrasReintegros: form.otrasReintegros || 0,
      convenio_2022_2023: form.convenio_2022_2023 || 0,
      convenio_2023_2024: form.convenio_2023_2024 || 0,
      convenio_2024_2025: form.convenio_2024_2025 || 0,
      homologacion: form.homologacion || 0,
      otrosIngresos: form.otrosIngresos || 0,
      // Pensiones
      sistemaPension: form.sistemasPensiones || '',
      afp: form.afp || '',
      cuspp: (form.cuspp || '').toUpperCase(),
      tipoComisionAFP: form.tipoComisionAFP || '',
      codigoEssalud: (form.codigoEssalud || '').toUpperCase(),
      esSindicalizado: form.esSindicalizado || false,
      tieneRimacSeguros: form.tieneRimacSeguros || false,
      aporteRimacSeguros: form.aporteRimacSeguros || 0,
      tieneDescuentoJudicial: form.tieneDescuentoJudicial || false,
      montoDescuentoJudicial: form.montoDescuentoJudicial || 0,
      numeroCuentaDescuento: form.numeroCuentaDescuento || '',
      // Bancarios
      banco: (form.banco || '').toUpperCase(),
      tipoCuenta: form.tipoCuenta,
      numeroCuenta: (form.numeroCuenta || '').toUpperCase(),
      cci: form.cci
    };

    console.log('[guardarTrabajador] Enviando trabajador al backend:', trabajador);

    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.http.post<any>(this.apiUrl, trabajador, { headers }).subscribe({
      next: (response) => {
        this.guardando = false;
        console.log('[guardarTrabajador] Respuesta del backend:', response);
        if (response.success) {
          // Limpiar borrador del localStorage al guardar exitosamente
          const dni = this.trabajadorForm.get('dni')?.value;
          if (dni) {
            localStorage.removeItem(`borrador_trabajador_${dni}`);
            console.log('🗑️ Borrador eliminado tras guardar exitosamente');
          }
          
          // Mostrar modal de éxito con animación
          this.mostrarModalExitoGuardar = true;
          this.guardandoTrabajadorProceso = true;
          this.trabajadorGuardadoCompletado = false;
          
          // Notificar al dashboard para que se actualice
          window.dispatchEvent(new CustomEvent('trabajador-creado'));
          
          // Simular proceso de guardado
          setTimeout(() => {
            this.guardandoTrabajadorProceso = false;
            this.trabajadorGuardadoCompletado = true;
            
            // Redirigir después de mostrar el checkmark
            setTimeout(() => {
              this.cerrarModalExitoGuardar();
              this.router.navigate(['/trabajadores/lista']);
            }, 2000);
          }, 1500);
        } else {
          alert('❌ Error: ' + (response.message || 'No se pudo guardar'));
        }
      },
      error: (error) => {
        this.guardando = false;
        console.error('[guardarTrabajador] Error detalle del backend:', error);
        
        // Verificar si es un trabajador inactivo que puede restaurarse
        if (error.status === 409 && error.error?.accion === 'restaurar') {
          this.trabajadorEliminadoInfo = {
            trabajadorId: error.error.trabajadorId,
            nombreCompleto: error.error.nombreCompleto,
            message: error.error.message
          };
          this.mostrarModalEliminado = true;
        } else {
          alert('❌ Error al guardar: ' + (error.error?.message || 'Error de conexión'));
        }
      }
    });
  }

  // Métodos para el modal de trabajador eliminado
  restaurarYEditar(): void {
    if (this.trabajadorEliminadoInfo) {
      this.restaurarTrabajador(this.trabajadorEliminadoInfo.trabajadorId);
      this.mostrarModalEliminado = false;
    }
  }

  continuarConNuevo(): void {
    // Restaurar el trabajador y luego actualizarlo con los nuevos datos
    if (this.trabajadorEliminadoInfo) {
      console.log('🔄 Restaurando trabajador y actualizando con nuevos datos...');
      this.mostrarModalEliminado = false;
      this.guardando = true;

      // Primero restaurar
      this.http.put<any>(`${this.apiUrl}/${this.trabajadorEliminadoInfo.trabajadorId}/restaurar`, {}).subscribe({
        next: (responseRestaurar) => {
          console.log('✅ Trabajador restaurado, ahora actualizando datos...');
          
          // Luego actualizar con los datos del formulario
          const form = this.trabajadorForm.value;
          const trabajadorActualizado = this.prepararDatosParaGuardar(form);
          
          this.http.put<any>(`${this.apiUrl}/${this.trabajadorEliminadoInfo.trabajadorId}`, trabajadorActualizado).subscribe({
            next: (responseActualizar) => {
              this.guardando = false;
              alert('✅ Trabajador restaurado y actualizado exitosamente');
              this.router.navigate(['/trabajadores/lista']);
            },
            error: (error) => {
              this.guardando = false;
              console.error('❌ Error al actualizar:', error);
              alert('❌ Error al actualizar los datos del trabajador');
            }
          });
        },
        error: (error) => {
          this.guardando = false;
          console.error('❌ Error al restaurar:', error);
          alert('❌ Error al restaurar el trabajador');
        }
      });
    }
  }

  cancelarModalEliminado(): void {
    this.mostrarModalEliminado = false;
    this.trabajadorEliminadoInfo = null;
  }

  private prepararDatosParaGuardar(form: any): any {
    return {
      numeroDocumento: form.dni,
      apellidoPaterno: form.apellidoPaterno,
      apellidoMaterno: form.apellidoMaterno,
      nombres: form.nombres,
      fechaNacimiento: form.fechaNacimiento ? form.fechaNacimiento.split('T')[0] : null,
      sexo: form.sexo || '',
      estadoCivil: form.estadoCivil,
      nacionalidad: form.nacionalidad || 'Peruana',
      emailPersonal: form.emailPersonal || '',
      emailCorporativo: form.emailCorporativo || '',
      celular: form.celular || '',
      telefono: form.telefono || '',
      direccion: form.direccion || '',
      contactoEmergenciaNombre: form.contactoEmergenciaNombre || '',
      contactoEmergenciaParentesco: form.contactoEmergenciaParentesco || '',
      contactoEmergenciaTelefono: form.contactoEmergenciaTelefono || '',
      distrito: form.distrito || '',
      provincia: form.provincia || '',
      departamento: form.departamento || '',
      areaId: Number(form.area) ? Number(form.area) : null,
      cargoId: Number(form.cargo) ? Number(form.cargo) : null,
      subgerenciaId: form.subgerencia ? Number(form.subgerencia) : null,
      unidadId: form.unidad ? Number(form.unidad) : null,
      gerencia: form.gerencia || '',
      estado: form.estado || 'Activo',
      condicion: form.condicion || '',
      nivel: form.nivel || '',
      tipoPlaza: form.tipoPlaza || '',
      grupoOcupacional: form.grupoOcupacional || '',
      tipoContrato: form.tipoContrato || '',
      regimenLaboral: form.regimenLaboral || '',
      fechaIngreso: form.fechaIngreso ? form.fechaIngreso.split('T')[0] : null,
      fechaInicioContrato: form.fechaInicioContrato ? form.fechaInicioContrato.split('T')[0] : null,
      fechaFinContrato: form.fechaFinContrato ? form.fechaFinContrato.split('T')[0] : null,
      salarioBase: form.remuneracionBasica,
      costoVida: form.costoVida || 0,
      asignacionFamiliar: form.tieneAsignacionFamiliar ? 102.5 : 0,
      numeroHijos: form.numeroHijos || 0,
      movilidad: form.movilidad || 0,
      horasExtras: form.horasExtras || 0,
      bonoProductividad: form.bonoProductividad || 0,
      pc_2015_2016: form.pc_2015_2016 || 0,
      ra_829_2011_mdh: form.ra_829_2011_mdh || 0,
      otrasReintegros: form.otrasReintegros || 0,
      convenio_2022_2023: form.convenio_2022_2023 || 0,
      convenio_2023_2024: form.convenio_2023_2024 || 0,
      convenio_2024_2025: form.convenio_2024_2025 || 0,
      homologacion: form.homologacion || 0,
      otrosIngresos: form.otrosIngresos || 0,
      esSindicalizado: form.esSindicalizado || false,
      tieneRimacSeguros: form.tieneRimacSeguros || false,
      aporteRimacSeguros: form.aporteRimacSeguros || 0,
      tieneDescuentoJudicial: form.tieneDescuentoJudicial || false,
      montoDescuentoJudicial: form.montoDescuentoJudicial || 0,
      numeroCuentaDescuento: form.numeroCuentaDescuento || '',
      sistemaPension: form.sistemasPensiones || '',
      afp: form.afp || '',
      cuspp: form.cuspp || '',
      tipoComisionAFP: form.tipoComisionAFP || '',
      codigoEssalud: form.codigoEssalud || '',
      banco: form.banco || '',
      tipoCuenta: form.tipoCuenta || 'Ahorros',
      numeroCuenta: form.numeroCuenta || '',
      cci: form.cci || '',
      tieneContratoFirmado: form.tieneContratoFirmado || false,
      tieneFichaRUC: form.tieneFichaRUC || false,
      tieneDeclaracionJurada: form.tieneDeclaracionJurada || false,
      usuarioCreacion: 'admin'
    };
  }

  restaurarTrabajador(trabajadorId: number): void {
    console.log('[restaurarTrabajador] Restaurando trabajador ID:', trabajadorId);
    this.guardando = true;

    this.http.put<any>(`${this.apiUrl}/${trabajadorId}/restaurar`, {}).subscribe({
      next: (response) => {
        this.guardando = false;
        if (response.success) {
          alert('✅ Trabajador restaurado exitosamente');
          this.router.navigate(['/trabajadores/lista']);
        } else {
          alert('❌ Error al restaurar: ' + response.message);
        }
      },
      error: (error) => {
        this.guardando = false;
        console.error('[restaurarTrabajador] Error:', error);
        alert('❌ Error al restaurar el trabajador');
      }
    });
  }

  cancelar(): void {
    console.log('[cancelar] Cancelando registro');
    this.mostrarModalCancelar = true;
  }

  confirmarCancelar(): void {
    this.mostrarModalCancelar = false;
    this.router.navigate(['/trabajadores/lista']);
  }

  cerrarModalCancelar(): void {
    this.mostrarModalCancelar = false;
  }
  
  // Cerrar modal de RENIEC deshabilitado
  cerrarModalRENIECDeshabilitado(): void {
    this.mostrarModalRENIECDeshabilitado = false;
  }
  
  // Ir a configuración de integraciones
  irAConfiguracionIntegraciones(): void {
    this.cerrarModalRENIECDeshabilitado();
    this.router.navigate(['/configuracion'], { queryParams: { tab: 'integraciones' } });
  }
  
  // Cerrar modal de DNI inválido
  cerrarModalDNIInvalido(): void {
    this.mostrarModalDNIInvalido = false;
  }
  
  // Cerrar modal de éxito RENIEC
  cerrarModalExitoRENIEC(): void {
    this.mostrarModalExitoRENIEC = false;
    this.cargandoDatosRENIEC = false;
    this.datosRENIECCompletados = false;
  }
  
  // Cerrar modal de éxito al guardar trabajador
  cerrarModalExitoGuardar(): void {
    this.mostrarModalExitoGuardar = false;
    this.guardandoTrabajadorProceso = false;
    this.trabajadorGuardadoCompletado = false;
  }

  // Métodos helper para regímenes laborales
  getRegimenSeleccionado(): any {
    const codigo = this.trabajadorForm.get('regimenLaboral')?.value;
    if (!codigo || !this.regimenesLaborales) return null;
    return this.regimenesLaborales.find(r => r.codigo == codigo);
  }

  getRegimenDescripcion(): string {
    const regimen = this.getRegimenSeleccionado();
    return regimen?.descripcion || '';
  }

  getRegimenBaseNormativa(): string {
    const regimen = this.getRegimenSeleccionado();
    return regimen?.baseNormativa || '';
  }

  // Método helper para descripción de estado
  getEstadoDescripcion(): string {
    const estado = this.trabajadorForm.get('estado')?.value;
    const descripciones: { [key: string]: string } = {
      'Activo': 'Trabajador en actividad laboral',
      'Licencia': 'Trabajador con licencia (con o sin goce de haber)',
      'Suspendido': 'Trabajador con suspensión temporal',
      'Destacado': 'Trabajador destacado en otra institución',
      'Comisionado': 'Trabajador en comisión de servicios',
      'Cesado': 'Trabajador cesado o retirado'
    };
    return descripciones[estado] || '';
  }

  // Métodos helper para tipos de contrato
  getTipoContratoSeleccionado(): any {
    const codigo = this.trabajadorForm.get('tipoContrato')?.value;
    if (!codigo || !this.tiposContrato) return null;
    return this.tiposContrato.find(t => t.codigo == codigo);
  }

  getTipoContratoDescripcion(): string {
    const tipo = this.getTipoContratoSeleccionado();
    return tipo?.descripcion || '';
  }

  getError(campo: string): string {
    const control = this.trabajadorForm.get(campo);
    if (control?.hasError('required')) return 'Este campo es obligatorio';
    if (control?.hasError('pattern')) {
      const patterns: { [key: string]: string } = {
        dni: 'El DNI debe tener 8 dígitos',
        celular: 'El celular debe empezar con 9 y tener 9 dígitos',
        numeroCuenta: 'Número de cuenta inválido',
        cci: 'El CCI debe tener 20 dígitos',
        cuspp: 'El CUSPP debe tener 12 caracteres (números y letras)'
      };
      return patterns[campo] || 'Formato inválido';
    }
    if (control?.hasError('email')) return 'Email inválido';
    if (control?.hasError('min')) return `Valor mínimo: ${control.errors?.['min'].min}`;
    if (control?.hasError('minlength')) return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
    return '';
  }

  isInvalid(campo: string): boolean {
    const control = this.trabajadorForm.get(campo);
    return !!(control?.invalid && control?.touched);
  }

  // ==========================================
  // MÉTODOS PARA INPUT PERSONALIZADO
  // ==========================================

  // Toggle métodos
  toggleCargoInput(): void {
    this.cargoInputMode = !this.cargoInputMode;
    if (this.cargoInputMode) {
      this.trabajadorForm.get('cargo')?.setValue('');
    } else {
      this.trabajadorForm.get('cargoTexto')?.setValue('');
    }
  }

  toggleAreaInput(): void {
    this.areaInputMode = !this.areaInputMode;
    if (this.areaInputMode) {
      this.trabajadorForm.get('area')?.setValue('');
    } else {
      this.trabajadorForm.get('areaTexto')?.setValue('');
    }
  }

  toggleGerenciaInput(): void {
    this.gerenciaInputMode = !this.gerenciaInputMode;
    if (this.gerenciaInputMode) {
      this.trabajadorForm.get('gerencia')?.setValue('');
    } else {
      this.trabajadorForm.get('gerenciaTexto')?.setValue('');
    }
  }

  toggleSubgerenciaInput(): void {
    this.subgerenciaInputMode = !this.subgerenciaInputMode;
    if (this.subgerenciaInputMode) {
      this.trabajadorForm.get('subgerencia')?.setValue('');
    } else {
      this.trabajadorForm.get('subgerenciaTexto')?.setValue('');
    }
  }

  toggleUnidadInput(): void {
    this.unidadInputMode = !this.unidadInputMode;
    if (this.unidadInputMode) {
      this.trabajadorForm.get('unidad')?.setValue('');
    } else {
      this.trabajadorForm.get('unidadTexto')?.setValue('');
    }
  }

  // Métodos para conversión a mayúsculas
  onCargoTextoChange(event: any): void {
    const value = event.target.value.toUpperCase();
    this.trabajadorForm.get('cargoTexto')?.setValue(value);
  }

  onAreaTextoChange(event: any): void {
    const value = event.target.value.toUpperCase();
    this.trabajadorForm.get('areaTexto')?.setValue(value);
  }

  onGerenciaTextoChange(event: any): void {
    const value = event.target.value.toUpperCase();
    this.trabajadorForm.get('gerenciaTexto')?.setValue(value);
  }

  onSubgerenciaTextoChange(event: any): void {
    const value = event.target.value.toUpperCase();
    this.trabajadorForm.get('subgerenciaTexto')?.setValue(value);
  }

  onUnidadTextoChange(event: any): void {
    const value = event.target.value.toUpperCase();
    this.trabajadorForm.get('unidadTexto')?.setValue(value);
  }

  // ==========================================
  // MÉTODOS PARA CAMPOS DE CLASIFICACIÓN
  // ==========================================

  // Toggle métodos para clasificación
  toggleCondicionInput(): void {
    this.condicionInputMode = !this.condicionInputMode;
    if (this.condicionInputMode) {
      this.trabajadorForm.get('condicion')?.setValue('');
    } else {
      this.trabajadorForm.get('condicionTexto')?.setValue('');
    }
  }

  toggleNivelInput(): void {
    this.nivelInputMode = !this.nivelInputMode;
    if (this.nivelInputMode) {
      this.trabajadorForm.get('nivel')?.setValue('');
    } else {
      this.trabajadorForm.get('nivelTexto')?.setValue('');
    }
  }

  toggleTipoPlazaInput(): void {
    this.tipoPlazaInputMode = !this.tipoPlazaInputMode;
    if (this.tipoPlazaInputMode) {
      this.trabajadorForm.get('tipoPlaza')?.setValue('');
    } else {
      this.trabajadorForm.get('tipoPlazaTexto')?.setValue('');
    }
  }

  toggleGrupoOcupacionalInput(): void {
    this.grupoOcupacionalInputMode = !this.grupoOcupacionalInputMode;
    if (this.grupoOcupacionalInputMode) {
      this.trabajadorForm.get('grupoOcupacional')?.setValue('');
    } else {
      this.trabajadorForm.get('grupoOcupacionalTexto')?.setValue('');
    }
  }

  // Métodos de conversión a mayúsculas para clasificación
  onCondicionTextoChange(event: any): void {
    const value = event.target.value.toUpperCase();
    this.trabajadorForm.get('condicionTexto')?.setValue(value);
  }

  onNivelTextoChange(event: any): void {
    const value = event.target.value.toUpperCase();
    this.trabajadorForm.get('nivelTexto')?.setValue(value);
  }

  onTipoPlazaTextoChange(event: any): void {
    const value = event.target.value.toUpperCase();
    this.trabajadorForm.get('tipoPlazaTexto')?.setValue(value);
  }

  onGrupoOcupacionalTextoChange(event: any): void {
    const value = event.target.value.toUpperCase();
    this.trabajadorForm.get('grupoOcupacionalTexto')?.setValue(value);
  }

  // ==========================================
  // MÉTODOS PARA CAMPOS DE CONTRATO
  // ==========================================

  // Toggle métodos para contrato
  toggleTipoContratoInput(): void {
    this.tipoContratoInputMode = !this.tipoContratoInputMode;
    if (this.tipoContratoInputMode) {
      this.trabajadorForm.get('tipoContrato')?.setValue('');
    } else {
      this.trabajadorForm.get('tipoContratoTexto')?.setValue('');
    }
  }

  toggleRegimenLaboralInput(): void {
    this.regimenLaboralInputMode = !this.regimenLaboralInputMode;
    if (this.regimenLaboralInputMode) {
      this.trabajadorForm.get('regimenLaboral')?.setValue('');
    } else {
      this.trabajadorForm.get('regimenLaboralTexto')?.setValue('');
    }
  }

  // Métodos de conversión a mayúsculas para contrato
  onTipoContratoTextoChange(event: any): void {
    const value = event.target.value.toUpperCase();
    this.trabajadorForm.get('tipoContratoTexto')?.setValue(value);
  }

  onRegimenLaboralTextoChange(event: any): void {
    const value = event.target.value.toUpperCase();
    this.trabajadorForm.get('regimenLaboralTexto')?.setValue(value);
  }

  // ==========================================
  // VALIDACIÓN DE DNI EXISTENTE
  // ==========================================
  async validarDNIExistente(dni: string): Promise<void> {
    if (!dni || dni.length !== 8) {
      this.dniValido = false;
      this.dniExiste = false;
      return;
    }

    // Si RENIEC está desactivada, solo validar formato (8 dígitos) y marcar como válido
    if (!this.reniecHabilitado) {
      console.log('[validarDNIExistente] RENIEC desactivada, validando solo formato');
      this.dniValido = true;
      this.dniExiste = false;
      this.validandoDNI = false;
      return;
    }

    this.validandoDNI = true;
    this.dniValido = true;
    this.dniExiste = false;

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await this.http.get<any>(`${this.apiUrl}/reniec/${dni}`, { headers }).toPromise();
      
      if (response.success) {
        // DNI válido y no existe
        this.dniValido = true;
        this.dniExiste = false;
        console.log('✅ DNI válido y disponible');
      }
    } catch (error: any) {
      console.error('Error al validar DNI:', error);
      
      if (error.status === 400) {
        // DNI ya existe
        this.dniValido = true;
        this.dniExiste = true;
        console.log('⚠️ DNI ya existe en el sistema');
      } else if (error.status === 409) {
        // DNI existe pero está inactivo
        this.dniValido = true;
        this.dniExiste = true;
        console.log('⚠️ DNI existe pero está inactivo');
      } else if (error.status === 403) {
        // RENIEC desactivada - solo validar formato
        console.log('[validarDNIExistente] RENIEC desactivada (403), validando solo formato');
        this.reniecHabilitado = false;
        this.dniValido = true;
        this.dniExiste = false;
      } else {
        // Error de conexión u otro error - si RENIEC está desactivada, solo validar formato
        if (!this.reniecHabilitado) {
          this.dniValido = true;
          this.dniExiste = false;
        } else {
          this.dniValido = false;
          this.dniExiste = false;
          console.log('❌ Error al validar DNI');
        }
      }
    } finally {
      this.validandoDNI = false;
    }
  }

  // Método para manejar el cambio del DNI
  soloNumeros(event: KeyboardEvent): boolean {
    // Solo permitir números (0-9)
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  onDNIChange(event: any): void {
    const dni = event.target.value;
    
    // Filtrar solo números del valor ingresado
    const dniSoloNumeros = dni.replace(/[^0-9]/g, '');
    
    // Actualizar el valor del formulario solo con números
    if (dni !== dniSoloNumeros) {
      this.trabajadorForm.get('dni')?.setValue(dniSoloNumeros, { emitEvent: false });
      event.target.value = dniSoloNumeros;
    }
    
    // Limpiar validación anterior
    this.dniValido = true;
    this.dniExiste = false;
    
    // Si RENIEC está desactivada, solo validar formato (8 dígitos)
    if (!this.reniecHabilitado) {
      if (dniSoloNumeros && dniSoloNumeros.length === 8) {
        this.dniValido = true;
        this.dniExiste = false;
        this.validandoDNI = false;
        console.log('[onDNIChange] RENIEC desactivada, DNI válido (8 dígitos)');
      } else if (dniSoloNumeros && dniSoloNumeros.length > 0 && dniSoloNumeros.length < 8) {
        this.dniValido = true; // No mostrar error mientras se escribe
        this.validandoDNI = false;
      }
      return;
    }
    
    // Si RENIEC está habilitada, validar DNI completo
    if (dniSoloNumeros && dniSoloNumeros.length === 8) {
      this.validarDNIExistente(dniSoloNumeros);
    }
  }

  onContactoEmergenciaChange(event: any): void {
    const nombre = event.target.value;
    const parentescoControl = this.trabajadorForm.get('contactoEmergenciaParentesco');
    const telefonoControl = this.trabajadorForm.get('contactoEmergenciaTelefono');
    
    // Si se borra el nombre, limpiar también el parentesco y teléfono
    if (!nombre || nombre.trim() === '') {
      parentescoControl?.setValue('');
      telefonoControl?.setValue('');
    }
  }

  // Método para verificar si los campos de contacto de emergencia deben estar deshabilitados
  getContactoEmergenciaDisabled(): boolean {
    const nombre = this.trabajadorForm.get('contactoEmergenciaNombre')?.value;
    return !nombre || nombre.trim() === '';
  }

  onContactoEmergenciaTelefonoChange(event: any): void {
    let telefono = event.target.value;
    
    // Filtrar solo números del valor ingresado
    const telefonoSoloNumeros = telefono.replace(/[^0-9]/g, '');
    
    // Limitar a 9 dígitos
    const telefonoLimitado = telefonoSoloNumeros.slice(0, 9);
    
    // Actualizar el valor del formulario solo con números
    if (telefono !== telefonoLimitado) {
      this.trabajadorForm.get('contactoEmergenciaTelefono')?.setValue(telefonoLimitado, { emitEvent: false });
      event.target.value = telefonoLimitado;
    }
  }

  // ==========================================
  // MÉTODO PARA CREAR ELEMENTOS PERSONALIZADOS
  // ==========================================
  async crearElementosPersonalizados(form: any): Promise<void> {
    const elementosACrear = [];

    // Verificar qué elementos personalizados necesitan ser creados
    if (this.areaInputMode && form.areaTexto) {
      elementosACrear.push({ tipo: 'area', nombre: form.areaTexto });
    }
    if (this.cargoInputMode && form.cargoTexto) {
      elementosACrear.push({ tipo: 'cargo', nombre: form.cargoTexto });
    }
    if (this.gerenciaInputMode && form.gerenciaTexto) {
      elementosACrear.push({ tipo: 'gerencia', nombre: form.gerenciaTexto });
    }
    if (this.subgerenciaInputMode && form.subgerenciaTexto) {
      elementosACrear.push({ tipo: 'subgerencia', nombre: form.subgerenciaTexto });
    }
    if (this.unidadInputMode && form.unidadTexto) {
      elementosACrear.push({ tipo: 'unidad', nombre: form.unidadTexto });
    }

    // Mapeo de tipos a rutas API correctas
    const rutasAPI: { [key: string]: string } = {
      'area': 'areas',
      'cargo': 'cargos',
      'gerencia': 'gerencias',
      'subgerencia': 'subgerencias',
      'unidad': 'unidades'
    };

    // Crear cada elemento en la base de datos
    for (const elemento of elementosACrear) {
      try {
        const rutaAPI = rutasAPI[elemento.tipo] || `${elemento.tipo}s`;
        const response = await this.http.post<any>(`${this.apiBaseUrl}/api/${rutaAPI}`, {
          nombre: elemento.nombre
        }).toPromise();

        if (response.success) {
          console.log(`✅ ${elemento.tipo} creado:`, response.data);
          
          // Actualizar el formulario con el ID del elemento creado
          if (elemento.tipo === 'area') {
            this.trabajadorForm.get('area')?.setValue(response.data.id);
            this.trabajadorForm.get('areaTexto')?.setValue('');
          } else if (elemento.tipo === 'cargo') {
            this.trabajadorForm.get('cargo')?.setValue(response.data.CargoID);
            this.trabajadorForm.get('cargoTexto')?.setValue('');
          } else if (elemento.tipo === 'gerencia') {
            this.trabajadorForm.get('gerencia')?.setValue(response.data.id);
            this.trabajadorForm.get('gerenciaTexto')?.setValue('');
          } else if (elemento.tipo === 'subgerencia') {
            this.trabajadorForm.get('subgerencia')?.setValue(response.data.id);
            this.trabajadorForm.get('subgerenciaTexto')?.setValue('');
          } else if (elemento.tipo === 'unidad') {
            this.trabajadorForm.get('unidad')?.setValue(response.data.id);
            this.trabajadorForm.get('unidadTexto')?.setValue('');
          }
        }
      } catch (error) {
        console.error(`Error al crear ${elemento.tipo}:`, error);
        throw error;
      }
    }
  }
}