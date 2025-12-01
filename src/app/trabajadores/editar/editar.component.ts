import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-editar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss']
})
export class EditarComponent implements OnInit {
  trabajadorForm!: FormGroup;
  guardando: boolean = false;
  actualizacionCompletada: boolean = false;
  mostrarModalExitoActualizacion: boolean = false;
  cargando: boolean = true;
  paso: number = 1;
  totalPasos: number = 5;
  trabajadorId: number = 0;

  private apiUrl = 'http://localhost:5000/api/trabajadores';
  
  mostrarModalCancelar: boolean = false;

  departamentos: any[] = [];
  provincias: any[] = [];
  distritos: string[] = [];

  // Listas dinámicas desde el backend
  cargos: any[] = [];
  areas: any[] = [];
  gerencias: any[] = [];
  subgerencias: any[] = [];
  unidades: any[] = [];
  regimenesLaborales: any[] = [];
  tiposContrato: any[] = [];
  condicionesLaborales: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.trabajadorId = Number(this.route.snapshot.paramMap.get('id'));
    this.crearFormulario();
    this.cargarDatosIniciales();
    this.cargarTrabajador();
  }

  cargarDatosIniciales(): void {
    // Cargar cargos, áreas, regímenes, tipos de contrato, etc.
    this.cargarCargos();
    this.cargarAreas();
    this.cargarGerencias();
    this.cargarSubgerencias();
    this.cargarUnidades();
    this.cargarRegimenesLaborales();
    this.cargarTiposContrato();
    this.cargarCondicionesLaborales();
    this.cargarUbigeo();
  }

  cargarCargos(): void {
    this.http.get<any>('http://localhost:5000/api/cargos').subscribe({
      next: (response) => {
        console.log('[cargarCargos] Respuesta recibida:', response);
        // El backend puede devolver { success: true, data: [...] } o directamente [...]
        const cargosData = response.data || response;
        
        if (Array.isArray(cargosData) && cargosData.length > 0) {
          // ELIMINAR DUPLICADOS por Nombre
          const cargosUnicos = new Map();
          cargosData.forEach((cargo: any) => {
            const nombre = cargo.Nombre || cargo.nombre;
            const id = cargo.CargoID || cargo.id;
            if (nombre && !cargosUnicos.has(nombre)) {
              cargosUnicos.set(nombre, { id, nombre });
            }
          });
          
          this.cargos = Array.from(cargosUnicos.values());
          console.log('[cargarCargos] ✅', this.cargos.length, 'cargos únicos cargados');
        } else {
          console.warn('[cargarCargos] ⚠️ No se recibieron cargos válidos');
          this.cargos = [];
        }
      },
      error: (error) => {
        console.error('[cargarCargos] ❌ Error:', error);
        this.cargos = [];
      }
    });
  }

  cargarAreas(): void {
    console.log('[cargarAreas] Cargando áreas desde el backend...');
    this.http.get<any>('http://localhost:5000/api/areas').subscribe({
      next: (response) => {
        console.log('[cargarAreas] Respuesta:', response);
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
          console.log('[cargarAreas] ✅ Áreas cargadas desde el backend (sin duplicados):', this.areas.length);
        } else {
          console.warn('[cargarAreas] ⚠️ No se recibieron áreas válidas, usando fallback');
          this.usarAreasFallback();
        }
      },
      error: (error) => {
        console.error('[cargarAreas] ❌ Error:', error);
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
    console.log('[cargarAreas] ✅ Áreas fallback cargadas:', this.areas.length);
  }

  cargarGerencias(): void {
    this.http.get<any>('http://localhost:5000/api/gerencias').subscribe({
      next: (response) => {
        this.gerencias = Array.isArray(response.data) ? response.data : [];
        console.log('[cargarGerencias] Gerencias cargadas:', this.gerencias.length);
      },
      error: (error) => {
        console.error('[cargarGerencias] Error:', error);
        this.gerencias = [];
      }
    });
  }

  cargarSubgerencias(): void {
    this.http.get<any>('http://localhost:5000/api/subgerencias').subscribe({
      next: (response) => {
        this.subgerencias = response.data || response || [];
        console.log('[cargarSubgerencias] Subgerencias cargadas:', this.subgerencias.length);
      },
      error: (error) => console.error('[cargarSubgerencias] Error:', error)
    });
  }

  cargarUnidades(): void {
    console.log('[cargarUnidades] Cargando unidades desde el backend...');
    this.http.get<any>('http://localhost:5000/api/unidades').subscribe({
      next: (response) => {
        console.log('[cargarUnidades] Respuesta:', response);
        const unidadesData = response.data || response;
        
        if (Array.isArray(unidadesData) && unidadesData.length > 0) {
          // ELIMINAR DUPLICADOS por Nombre
          const unidadesUnicas = new Map();
          unidadesData.forEach((unidad: any) => {
            const nombre = unidad.Nombre || unidad.nombre;
            const id = unidad.UnidadID || unidad.id;
            if (nombre && !unidadesUnicas.has(nombre.trim().toUpperCase())) {
              unidadesUnicas.set(nombre.trim().toUpperCase(), { UnidadID: id, Nombre: nombre });
            }
          });
          
          this.unidades = Array.from(unidadesUnicas.values());
          console.log('[cargarUnidades] ✅ Unidades cargadas desde el backend (sin duplicados):', this.unidades.length);
        } else {
          console.warn('[cargarUnidades] ⚠️ No se recibieron unidades válidas, usando fallback');
          this.usarUnidadesFallback();
        }
      },
      error: (error) => {
        console.error('[cargarUnidades] ❌ Error:', error);
        this.usarUnidadesFallback();
      }
    });
  }

  usarUnidadesFallback(): void {
    // Unidades por defecto según organigrama
    this.unidades = [
      { UnidadID: 1, Nombre: 'Unidad de Gestión Documentaria y Archivo Central' },
      { UnidadID: 2, Nombre: 'Unidad Imagen Institucional y Comunicaciones' },
      { UnidadID: 3, Nombre: 'Unidad de Recursos Humanos' },
      { UnidadID: 4, Nombre: 'Unidad de Logística y Control Patrimonial' },
      { UnidadID: 5, Nombre: 'Unidad de Contabilidad' },
      { UnidadID: 6, Nombre: 'Unidad de Tecnología de la Información' },
      { UnidadID: 7, Nombre: 'Unidad de Tesorería' },
      { UnidadID: 8, Nombre: 'Unidad de Orientación, Recaudación y Control Tributario' },
      { UnidadID: 9, Nombre: 'Unidad de Fiscalización Tributaria' },
      { UnidadID: 10, Nombre: 'Unidad de Presupuesto' },
      { UnidadID: 11, Nombre: 'Unidad de Programación Multianual de Inversiones' },
      { UnidadID: 12, Nombre: 'Unidad de Planificación y Racionalización' },
      { UnidadID: 13, Nombre: 'Unidad de Gestión Municipal' },
      { UnidadID: 14, Nombre: 'Subunidad de limpieza pública y áreas verdes' },
      { UnidadID: 15, Nombre: 'Subunidad de segregación y recolección de residuos sólidos' },
      { UnidadID: 16, Nombre: 'Área de operación y mantenimiento' },
      { UnidadID: 17, Nombre: 'Área comercial' }
    ];
    console.log('[cargarUnidades] ✅ Unidades fallback cargadas:', this.unidades.length);
  }

  cargarRegimenesLaborales(): void {
    this.http.get<any>('http://localhost:5000/api/regimenes-laborales').subscribe({
      next: (response) => {
        this.regimenesLaborales = Array.isArray(response.data) ? response.data : [];
        console.log('[cargarRegimenesLaborales] Regímenes cargados:', this.regimenesLaborales.length);
      },
      error: (error) => {
        console.error('[cargarRegimenesLaborales] Error:', error);
        this.regimenesLaborales = [];
      }
    });
  }

  cargarTiposContrato(): void {
    this.http.get<any>('http://localhost:5000/api/tipos-contrato').subscribe({
      next: (response) => {
        this.tiposContrato = Array.isArray(response.data) ? response.data : [];
        console.log('[cargarTiposContrato] Tipos de contrato cargados:', this.tiposContrato.length);
      },
      error: (error) => {
        console.error('[cargarTiposContrato] Error:', error);
        this.tiposContrato = [];
      }
    });
  }

  cargarCondicionesLaborales(): void {
    this.http.get<any>('http://localhost:5000/api/condiciones-laborales').subscribe({
      next: (response) => {
        this.condicionesLaborales = Array.isArray(response.data) ? response.data : [];
        console.log('[cargarCondicionesLaborales] Condiciones laborales cargadas:', this.condicionesLaborales.length);
      },
      error: (error) => {
        console.error('[cargarCondicionesLaborales] Error:', error);
        this.condicionesLaborales = [];
      }
    });
  }

  cargarUbigeo(): void {
    this.http.get<any[]>('assets/ubigeo-peru.json').subscribe({
      next: (data) => {
        console.log('[cargarUbigeo] Datos recibidos:', data?.length || 0);
        this.departamentos = Array.isArray(data) ? data : [];
        console.log('[cargarUbigeo] Ubigeo cargado:', this.departamentos.length, 'departamentos');
      },
      error: (error) => {
        console.error('[cargarUbigeo] Error:', error);
        this.departamentos = [];
        this.provincias = [];
        this.distritos = [];
      }
    });
  }

  crearFormulario(): void {
    // EN EDITAR: NINGÚN CAMPO ES OBLIGATORIO - Solo se actualizan los campos que se modifiquen
    this.trabajadorForm = this.fb.group({
      // PASO 1: Datos Personales
      dni: [''],
      apellidoPaterno: [''],
      apellidoMaterno: [''],
      nombres: [''],
      fechaNacimiento: [''],
      sexo: [''],
      estadoCivil: [''],
      nacionalidad: ['Peruana'],

      // PASO 2: Datos de Contacto
      telefono: [''],
      celular: [''],
      email: [''],
      direccion: [''],
      departamento: [''],
      provincia: [''],
      distrito: [''],

      // PASO 3: Datos Laborales
      cargo: [''],
      area: [''],
      subgerencia: [''],
      unidad: [''],
      gerencia: [''],
      
      // Clasificación
      estado: ['Activo'],
      condicion: [''],
      nivel: [''],
      tipoPlaza: [''],
      grupoOcupacional: [''],
      
      tipoContrato: [''],
      regimenLaboral: [''],
      fechaIngreso: [''],
      fechaInicioContrato: [''],
      fechaFinContrato: [''],

      // PASO 4: Remuneración
      remuneracionBasica: [0],
      tieneAsignacionFamiliar: [false],
      numeroHijos: [''],
      costoVida: [0],
      movilidad: [0],
      horasExtras: [0],
      bonoProductividad: [''],
      pc_2015_2016: [0],
      ra_829_2011_mdh: [0],
      otrasReintegros: [0],
      convenio_2022_2023: [0],
      convenio_2023_2024: [0],
      convenio_2024_2025: [0],
      homologacion: [0],
      otrosIngresos: [''],
      sistemasPensiones: [''],
      cuspp: [''],
      tipoComisionAFP: [''],
      codigoEssalud: [''],
      esSindicalizado: [false],
      tieneRimacSeguros: [false],
      aporteRimacSeguros: [0],
      tieneDescuentoJudicial: [false],
      montoDescuentoJudicial: [0],
      numeroCuentaDescuento: [''],

      // PASO 5: Datos Bancarios
      banco: [''],
      tipoCuenta: [''],
      numeroCuenta: [''],
      cci: ['']
    });
  }

  cargarTrabajador(): void {
    this.cargando = true;
    this.http.get<any>(`${this.apiUrl}/${this.trabajadorId}`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const trabajador = response.data;
          console.log('[cargarTrabajador] Datos recibidos:', trabajador);
          console.log('[cargarTrabajador] SistemaPension:', trabajador.SistemaPension);
          
          // Buscar código de departamento por nombre
          const depNombre = trabajador.Departamento || '';
          const depEncontrado = this.departamentos.find(d => 
            d.nombre.toUpperCase() === depNombre.toUpperCase()
          );
          const codigoDep = depEncontrado?.codigo || '';
          
          // Si se encontró departamento, cargar sus provincias
          if (depEncontrado) {
            this.provincias = depEncontrado.provincias || [];
            console.log('[cargarTrabajador] Provincias cargadas:', this.provincias.length);
            
            // Buscar código de provincia por nombre
            const provNombre = trabajador.Provincia || '';
            const provEncontrada = this.provincias.find(p => 
              p.nombre.toUpperCase() === provNombre.toUpperCase()
            );
            const codigoProv = provEncontrada?.codigo || '';
            
            // Si se encontró provincia, cargar sus distritos
            if (provEncontrada) {
              this.distritos = provEncontrada.distritos || [];
              console.log('[cargarTrabajador] Distritos cargados:', this.distritos.length);
            }
          }
          
          console.log('🔍 Estado Civil recibido del backend:', trabajador.EstadoCivil);
          console.log('🔍 Trabajador completo:', trabajador);
          
          // Normalizar estado civil para que coincida con las opciones del select
          let estadoCivilNormalizado = trabajador.EstadoCivil || trabajador.estadoCivil || '';
          if (estadoCivilNormalizado) {
            // Si el valor no coincide exactamente, intentar mapearlo
            const estadoCivilLower = estadoCivilNormalizado.toLowerCase();
            if (estadoCivilLower.includes('soltero')) {
              estadoCivilNormalizado = 'Soltero(a)';
            } else if (estadoCivilLower.includes('casado')) {
              estadoCivilNormalizado = 'Casado(a)';
            } else if (estadoCivilLower.includes('divorciado')) {
              estadoCivilNormalizado = 'Divorciado(a)';
            } else if (estadoCivilLower.includes('viudo')) {
              estadoCivilNormalizado = 'Viudo(a)';
            }
          }
          console.log('✅ Estado Civil normalizado:', estadoCivilNormalizado);
          
          // Buscar distrito por nombre (los distritos son strings, no objetos)
          const distritoNombre = trabajador.Distrito || '';
          const codigoProv = this.provincias.find(p => p.nombre.toUpperCase() === (trabajador.Provincia || '').toUpperCase())?.codigo || '';
          let distritoSeleccionado = '';
          
          // Si tenemos distritos cargados, buscar el distrito por nombre
          if (this.distritos.length > 0 && distritoNombre) {
            const distritoEncontrado = this.distritos.find(d => 
              d && d.toUpperCase() === distritoNombre.toUpperCase()
            );
            distritoSeleccionado = distritoEncontrado || distritoNombre;
            console.log('[cargarTrabajador] Distrito encontrado:', distritoNombre, '-> seleccionado:', distritoSeleccionado);
          } else if (distritoNombre) {
            // Si no hay distritos cargados pero hay nombre, usar el nombre directamente
            distritoSeleccionado = distritoNombre;
            console.log('[cargarTrabajador] Usando nombre de distrito directamente:', distritoNombre);
          }
          
          this.trabajadorForm.patchValue({
            dni: trabajador.NumeroDocumento,
            apellidoPaterno: trabajador.ApellidoPaterno,
            apellidoMaterno: trabajador.ApellidoMaterno,
            nombres: trabajador.Nombres,
            fechaNacimiento: trabajador.FechaNacimiento ? trabajador.FechaNacimiento.split('T')[0] : '',
            sexo: trabajador.Sexo,
            estadoCivil: estadoCivilNormalizado,
            nacionalidad: trabajador.Nacionalidad || trabajador.nacionalidad || 'Peruana',
            telefono: trabajador.Telefono || '',
            celular: trabajador.Celular,
            email: trabajador.Email,
            direccion: trabajador.Direccion || '',
            departamento: codigoDep,
            provincia: codigoProv,
            distrito: distritoSeleccionado,
            cargo: trabajador.CargoID,
            area: trabajador.AreaID,
            subgerencia: trabajador.SubgerenciaID || '',
            unidad: trabajador.UnidadID || '',
            gerencia: trabajador.Gerencia || '',
            // NUEVOS CAMPOS CRÍTICOS
            estado: trabajador.Estado || 'Activo',
            condicion: trabajador.Condicion || '',
            nivel: trabajador.Nivel || '',
            tipoPlaza: trabajador.TipoPlaza || '',
            grupoOcupacional: trabajador.GrupoOcupacional || '',
            tipoContrato: trabajador.TipoContratoID || trabajador.TipoContrato || '',
            regimenLaboral: trabajador.RegimenLaboralID || trabajador.RegimenLaboral || '',
            fechaIngreso: trabajador.FechaIngreso ? trabajador.FechaIngreso.split('T')[0] : '',
            fechaInicioContrato: trabajador.FechaInicioContrato ? trabajador.FechaInicioContrato.split('T')[0] : '',
            fechaFinContrato: trabajador.FechaFinContrato ? trabajador.FechaFinContrato.split('T')[0] : '',
            remuneracionBasica: trabajador.SalarioBase || 0,
            tieneAsignacionFamiliar: trabajador.AsignacionFamiliar > 0,
            numeroHijos: trabajador.NumeroHijos || 0,
            costoVida: (trabajador.CostoVida != null && trabajador.CostoVida !== undefined && trabajador.CostoVida !== '' && !isNaN(Number(trabajador.CostoVida))) ? Number(trabajador.CostoVida) : 0,
            movilidad: (() => {
              const valor = trabajador.MovilidadLocal;
              console.log('[cargarTrabajador] MovilidadLocal raw:', valor, 'tipo:', typeof valor);
              if (valor == null || valor === undefined || valor === '') {
                console.log('[cargarTrabajador] MovilidadLocal es null/undefined/vacío, usando 0');
                return 0;
              }
              const numValor = Number(valor);
              if (isNaN(numValor)) {
                console.log('[cargarTrabajador] MovilidadLocal no es un número válido, usando 0');
                return 0;
              }
              console.log('[cargarTrabajador] MovilidadLocal válida:', numValor);
              return numValor;
            })(),
            horasExtras: (trabajador.HorasExtras != null && trabajador.HorasExtras !== undefined && trabajador.HorasExtras !== '' && !isNaN(Number(trabajador.HorasExtras))) ? Number(trabajador.HorasExtras) : 0,
            bonoProductividad: trabajador.BonoProductividad || 0,
            pc_2015_2016: trabajador.PC_2015_2016 || 0,
            ra_829_2011_mdh: trabajador.RA_829_2011_MDH || 0,
            otrasReintegros: trabajador.OtrasReintegros || 0,
            convenio_2022_2023: trabajador.Convenio_2022_2023 || 0,
            convenio_2023_2024: trabajador.Convenio_2023_2024 || 0,
            convenio_2024_2025: trabajador.Convenio_2024_2025 || 0,
            homologacion: trabajador.Homologacion || 0,
            otrosIngresos: trabajador.OtrosIngresos || 0,
            sistemasPensiones: trabajador.SistemaPension || '',
            cuspp: trabajador.CUSPP || '',
            tipoComisionAFP: trabajador.TipoComisionAFP || '',
            codigoEssalud: trabajador.CodigoEssalud || '',
            esSindicalizado: trabajador.EsSindicalizado || false,
            tieneRimacSeguros: trabajador.TieneRimacSeguros || false,
            aporteRimacSeguros: trabajador.AporteRimacSeguros || 0,
            tieneDescuentoJudicial: trabajador.TieneDescuentoJudicial || false,
            montoDescuentoJudicial: trabajador.MontoDescuentoJudicial || 0,
            numeroCuentaDescuento: trabajador.NumeroCuentaDescuento || '',
            banco: (() => {
              const bancoBackend = trabajador.Banco || trabajador.banco || '';
              console.log('[cargarTrabajador] Banco recibido del backend:', bancoBackend);
              const bancoNormalizado = this.normalizarBanco(bancoBackend);
              console.log('[cargarTrabajador] Banco normalizado:', bancoNormalizado);
              return bancoNormalizado;
            })(),
            tipoCuenta: trabajador.TipoCuenta || trabajador.tipoCuenta || '',
            numeroCuenta: trabajador.NumeroCuenta || trabajador.numeroCuenta || '',
            cci: trabajador.CCI || trabajador.cci || ''
          });

          console.log('[cargarTrabajador] Formulario actualizado:', this.trabajadorForm.value);
          console.log('[cargarTrabajador] MovilidadLocal del backend:', trabajador.MovilidadLocal, 'tipo:', typeof trabajador.MovilidadLocal);
          console.log('[cargarTrabajador] Movilidad en formulario después de patchValue:', this.trabajadorForm.get('movilidad')?.value);
          
          // Verificar que el valor se haya asignado correctamente
          setTimeout(() => {
            console.log('[cargarTrabajador] Movilidad después de timeout:', this.trabajadorForm.get('movilidad')?.value);
          }, 100);
          
          // LOGS TEMPORALES PARA DEBUGGING
          console.log('[DEBUG CARGA] trabajador completo:', trabajador);
          console.log('[DEBUG CARGA] trabajador.TipoContratoID:', trabajador.TipoContratoID);
          console.log('[DEBUG CARGA] trabajador.TipoContrato:', trabajador.TipoContrato);
          console.log('[DEBUG CARGA] trabajador.RegimenLaboralID:', trabajador.RegimenLaboralID);
          console.log('[DEBUG CARGA] trabajador.RegimenLaboral:', trabajador.RegimenLaboral);
          console.log('[DEBUG CARGA] Valor final tipoContrato:', trabajador.TipoContratoID || trabajador.TipoContrato || '');
          console.log('[DEBUG CARGA] Valor final regimenLaboral:', trabajador.RegimenLaboralID || trabajador.RegimenLaboral || '');
          console.log('[DEBUG CARGA] Formulario después de actualizar:', this.trabajadorForm.get('tipoContrato')?.value, this.trabajadorForm.get('regimenLaboral')?.value);
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('[cargarTrabajador] Error:', error);
        alert('❌ Error al cargar los datos del trabajador');
        this.cargando = false;
      }
    });
  }

  siguientePaso(): void {
    if (this.validarPasoActual()) {
      this.paso = Math.min(this.paso + 1, this.totalPasos);
    }
  }

  pasoAnterior(): void {
    this.paso = Math.max(this.paso - 1, 1);
  }

  validarPasoActual(): boolean {
    // EN EDITAR: No hay validaciones, todos los campos son opcionales
    return true;
  }

  actualizarTrabajador(): void {
    // EN EDITAR: No hay validaciones, se actualizan los campos modificados
    this.guardando = true;
    const form = this.trabajadorForm.value;

    console.log('📝 Datos del formulario:', form);
    console.log('📝 Movilidad del formulario (raw):', form.movilidad, 'tipo:', typeof form.movilidad);

    // Convertir códigos de ubigeo a nombres
    const depSeleccionado = this.departamentos.find(d => d.codigo === form.departamento);
    const provSeleccionada = this.provincias.find(p => p.codigo === form.provincia);
    
    const trabajador = {
      numeroDocumento: form.dni,
      apellidoPaterno: form.apellidoPaterno,
      apellidoMaterno: form.apellidoMaterno,
      nombres: form.nombres,
      fechaNacimiento: (form.fechaNacimiento && typeof form.fechaNacimiento === 'string' && form.fechaNacimiento.trim() !== '') ? form.fechaNacimiento.split('T')[0] : null,
      sexo: form.sexo,
      estadoCivil: form.estadoCivil || '',
      nacionalidad: form.nacionalidad || 'Peruana',
      email: form.email,
      celular: form.celular,
      telefono: form.telefono || '',
      direccion: form.direccion || '',
      distrito: form.distrito || 'Huanchaco',
      provincia: provSeleccionada?.nombre || form.provincia || 'Trujillo',
      departamento: depSeleccionado?.nombre || form.departamento || 'La Libertad',
      areaId: (form.area && Number(form.area) > 0) ? Number(form.area) : null,
      cargoId: (form.cargo && Number(form.cargo) > 0) ? Number(form.cargo) : null,
      subgerenciaId: (form.subgerencia && Number(form.subgerencia) > 0) ? Number(form.subgerencia) : null,
      unidadId: (form.unidad && Number(form.unidad) > 0) ? Number(form.unidad) : null,
      gerencia: form.gerencia || '',
      // NUEVOS CAMPOS CRÍTICOS
      estado: form.estado || 'Activo',
      condicion: form.condicion || '',
      nivel: form.nivel || '',
      tipoPlaza: form.tipoPlaza || '',
      grupoOcupacional: form.grupoOcupacional || '',
      // Enviar solo los IDs numéricos válidos, o null si no hay selección
      tipoContratoID: (form.tipoContrato && Number(form.tipoContrato) > 0) ? Number(form.tipoContrato) : null,
      regimenLaboralID: (form.regimenLaboral && Number(form.regimenLaboral) > 0) ? Number(form.regimenLaboral) : null,
      fechaIngreso: (form.fechaIngreso && typeof form.fechaIngreso === 'string' && form.fechaIngreso.trim() !== '') ? form.fechaIngreso.split('T')[0] : null,
      fechaInicioContrato: (form.fechaInicioContrato && typeof form.fechaInicioContrato === 'string' && form.fechaInicioContrato.trim() !== '') ? form.fechaInicioContrato.split('T')[0] : null,
      fechaFinContrato: (form.fechaFinContrato && typeof form.fechaFinContrato === 'string' && form.fechaFinContrato.trim() !== '') ? form.fechaFinContrato.split('T')[0] : null,
      salarioBase: form.remuneracionBasica,
      asignacionFamiliar: form.tieneAsignacionFamiliar ? 102.5 : 0,
      costoVida: form.costoVida != null && form.costoVida !== '' ? Number(form.costoVida) : 0,
      movilidad: (() => {
        // Obtener el valor directamente del FormControl para asegurar que tenemos el valor más reciente
        const controlMovilidad = this.trabajadorForm.get('movilidad');
        const valor = controlMovilidad ? controlMovilidad.value : form.movilidad;
        console.log('📤 [ENVIAR] Movilidad del FormControl:', controlMovilidad?.value);
        console.log('📤 [ENVIAR] Movilidad del form.value:', form.movilidad);
        console.log('📤 [ENVIAR] Movilidad final usada:', valor, 'tipo:', typeof valor);
        
        // Si el valor es null, undefined o string vacío, usar 0
        if (valor == null || valor === undefined || valor === '') {
          console.log('📤 [ENVIAR] Movilidad es null/undefined/vacío, enviando 0');
          return 0;
        }
        
        // Convertir a número
        const numValor = Number(valor);
        
        // Si no es un número válido o es negativo, usar 0
        if (isNaN(numValor) || numValor < 0) {
          console.log('📤 [ENVIAR] Movilidad no es un número válido o es negativo, enviando 0');
          return 0;
        }
        
        // Si es 0, aceptarlo (puede ser un 0 válido)
        console.log('📤 [ENVIAR] Movilidad válida, enviando:', numValor);
        return numValor;
      })(),
      horasExtras: form.horasExtras != null && form.horasExtras !== '' ? Number(form.horasExtras) : 0,
      bonoProductividad: form.bonoProductividad || 0,
      pc_2015_2016: form.pc_2015_2016 || 0,
      ra_829_2011_mdh: form.ra_829_2011_mdh || 0,
      otrasReintegros: form.otrasReintegros || 0,
      convenio_2022_2023: form.convenio_2022_2023 || 0,
      convenio_2023_2024: form.convenio_2023_2024 || 0,
      convenio_2024_2025: form.convenio_2024_2025 || 0,
      homologacion: form.homologacion || 0,
      otrosIngresos: form.otrosIngresos || 0,
      numeroHijos: form.numeroHijos || 0,
      esSindicalizado: form.esSindicalizado || false,
      tieneRimacSeguros: form.tieneRimacSeguros || false,
      aporteRimacSeguros: form.aporteRimacSeguros || 0,
      tieneDescuentoJudicial: form.tieneDescuentoJudicial || false,
      montoDescuentoJudicial: form.montoDescuentoJudicial || 0,
      numeroCuentaDescuento: form.numeroCuentaDescuento || '',
      sistemaPension: form.sistemasPensiones || '',
      afp: form.afp || '',
      cuspp: form.cuspp || '',
      tipoComisionAFP: form.tipoComisionAFP || 'Flujo',
      codigoEssalud: form.codigoEssalud || '',
      banco: form.banco || '',
      tipoCuenta: form.tipoCuenta || '',
      numeroCuenta: form.numeroCuenta || '',
      cci: form.cci || '',
      usuarioActualizacion: 'admin'
    };

    console.log('📤 Datos a enviar al backend:', trabajador);
    console.log('📤 Movilidad específica:', form.movilidad, '->', trabajador.movilidad);
    console.log('📤 Valor de movilidad en el objeto trabajador:', trabajador.movilidad);
    console.log('📤 SistemaPension:', form.sistemasPensiones);
    console.log('🔗 URL:', `${this.apiUrl}/${this.trabajadorId}`);
    console.log('🔍 TipoContrato del formulario:', form.tipoContrato, 'convertido a:', Number(form.tipoContrato));
    console.log('🔍 RegimenLaboral del formulario:', form.regimenLaboral, 'convertido a:', Number(form.regimenLaboral));
    

    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    this.http.put<any>(`${this.apiUrl}/${this.trabajadorId}`, trabajador, { headers }).subscribe({
      next: (response) => {
        console.log('✅ Respuesta del backend:', response);
        if (response.success) {
          // Mostrar estado de carga
          this.guardando = true;
          this.actualizacionCompletada = false;
          this.mostrarModalExitoActualizacion = true;
          this.cdr.detectChanges();
          
          // Simular un pequeño delay para mostrar la animación de carga
          setTimeout(() => {
            this.guardando = false;
            this.actualizacionCompletada = true;
            this.cdr.detectChanges();
            
            // Cerrar el modal y navegar después de 2.5 segundos
            setTimeout(() => {
              this.mostrarModalExitoActualizacion = false;
              this.actualizacionCompletada = false;
              this.router.navigate(['/trabajadores/lista']);
              this.cdr.detectChanges();
            }, 2500);
          }, 800);
        } else {
          this.guardando = false;
          alert('❌ Error al actualizar trabajador: ' + response.message);
        }
      },
      error: (error) => {
        this.guardando = false;
        this.actualizacionCompletada = false;
        this.mostrarModalExitoActualizacion = false;
        this.cdr.detectChanges();
        console.error('❌ Error completo:', error);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error error:', error.error);
        alert(`❌ Error al actualizar trabajador: ${error.error?.message || error.message || 'Error desconocido'}`);
      }
    });
  }

  onDepartamentoChange(event: any): void {
    const codigoDep = event.target.value;
    console.log('[onDepartamentoChange] Código seleccionado:', codigoDep);
    
    if (codigoDep) {
      const dep = this.departamentos.find(d => d.codigo === codigoDep);
      this.provincias = dep?.provincias || [];
      console.log('[onDepartamentoChange] Provincias cargadas:', this.provincias.length);
    } else {
      this.provincias = [];
    }
    
    this.distritos = [];
    this.trabajadorForm.patchValue({ provincia: '', distrito: '' });
  }

  onProvinciaChange(event: any): void {
    const codigoProv = event.target.value;
    console.log('[onProvinciaChange] Código seleccionado:', codigoProv);
    
    if (codigoProv) {
      const prov = this.provincias.find(p => p.codigo === codigoProv);
      this.distritos = prov?.distritos || [];
      console.log('[onProvinciaChange] Distritos cargados:', this.distritos.length);
    } else {
      this.distritos = [];
    }
    
    this.trabajadorForm.patchValue({ distrito: '' });
  }

  /**
   * Normaliza el nombre del banco para que coincida con las opciones del select
   */
  normalizarBanco(banco: string): string {
    if (!banco) return '';
    
    const bancoUpper = banco.toUpperCase().trim();
    console.log('[normalizarBanco] Banco recibido:', banco, '-> normalizado:', bancoUpper);
    
    // Mapear variaciones comunes del nombre del banco
    const mapeoBancos: { [key: string]: string } = {
      'BANCO DE LA NACION': 'BANCO DE LA NACION',
      'BANCO DE LA NACIÓN': 'BANCO DE LA NACION',
      'BANCO DE CREDITO DEL PERU': 'BCP',
      'BANCO DE CRÉDITO DEL PERÚ': 'BCP',
      'BCP': 'BCP',
      'BBVA': 'BBVA',
      'BANCO CONTINENTAL': 'BBVA',
      'INTERBANK': 'Interbank',
      'SCOTIABANK': 'Scotiabank',
      'BANCO SCOTIABANK': 'Scotiabank',
      'BANBIF': 'BanBif',
      'BANCO BANBIF': 'BanBif',
      'PICHINCHA': 'Pichincha',
      'BANCO PICHINCHA': 'Pichincha'
    };
    
    // Buscar coincidencia exacta o parcial
    for (const [key, value] of Object.entries(mapeoBancos)) {
      if (bancoUpper.includes(key) || key.includes(bancoUpper)) {
        console.log('[normalizarBanco] Coincidencia encontrada:', key, '->', value);
        return value;
      }
    }
    
    // Si no hay coincidencia, devolver el valor original
    console.log('[normalizarBanco] No se encontró coincidencia, usando valor original:', banco);
    return banco;
  }

  cancelar(): void {
    this.mostrarModalCancelar = true;
  }

  confirmarCancelar(): void {
    this.mostrarModalCancelar = false;
    this.router.navigate(['/trabajadores/lista']);
  }

  cerrarModalCancelar(): void {
    this.mostrarModalCancelar = false;
  }

  calcularEdad(): number {
    const fechaNacimiento = this.trabajadorForm.get('fechaNacimiento')?.value;
    if (!fechaNacimiento) return 0;
    
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }

  isInvalid(campo: string): boolean {
    const control = this.trabajadorForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getError(campo: string): string {
    const control = this.trabajadorForm.get(campo);
    if (control && control.errors) {
      if (control.errors['required']) return 'Este campo es obligatorio';
      if (control.errors['email']) return 'Ingrese un email válido';
      if (control.errors['pattern']) return 'Formato inválido';
      if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['min']) return `Mínimo ${control.errors['min'].min}`;
    }
    return '';
  }
}
