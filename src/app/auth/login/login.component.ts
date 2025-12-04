import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { DemoLoginModalComponent } from '../demo-login-modal/demo-login-modal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DemoLoginModalComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @ViewChild('loginContainer', { static: true }) loginContainer!: ElementRef;
  @ViewChild('themePanel', { static: false }) themePanel!: ElementRef;
  
  loginForm!: FormGroup;
  isLoading: boolean = false;
  showPassword: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  // Sistema de temas avanzado
  showThemePanel: boolean = false;
  currentTheme: string = 'red';
  previousTheme: string = 'red'; // Para restaurar si se cancela personalización
  
  // Modal DEMO
  showDemoModal: boolean = false;
  customTheme: any = {
    primary: '#dc2626',
    secondary: '#b91c1c',
    accent: '#991b1b',
    panelBg: '#371f1f',
    border: '#dc2626',
    focus: '#dc2626'
  };
  originalCustomTheme: any = {}; // Para restaurar tema personalizado original
  
  // Temas predefinidos
  predefinedThemes: any = {
    red: {
      primary: '#dc2626',
      secondary: '#b91c1c',
      accent: '#991b1b',
      panelBg: '#371f1f',
      border: '#dc2626',
      focus: '#dc2626'
    },
    blue: {
      primary: '#4338ca',
      secondary: '#3730a3',
      accent: '#312e81',
      panelBg: '#1e1b4b',
      border: '#4338ca',
      focus: '#4338ca'
    },
    green: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#065f46',
      panelBg: '#064e3b',
      border: '#059669',
      focus: '#059669'
    },
    purple: {
      primary: '#7c3aed',
      secondary: '#6d28d9',
      accent: '#5b21b6',
      panelBg: '#4c1d95',
      border: '#7c3aed',
      focus: '#7c3aed'
    },
    orange: {
      primary: '#ea580c',
      secondary: '#dc2626',
      accent: '#b91c1c',
      panelBg: '#431407',
      border: '#ea580c',
      focus: '#ea580c'
    },
    teal: {
      primary: '#0d9488',
      secondary: '#0f766e',
      accent: '#115e59',
      panelBg: '#134e4a',
      border: '#0d9488',
      focus: '#0d9488'
    },
    pink: {
      primary: '#db2777',
      secondary: '#be185d',
      accent: '#9d174d',
      panelBg: '#500724',
      border: '#db2777',
      focus: '#db2777'
    }
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.crearFormulario();
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // Cargar tema guardado o usar rojo por defecto
    const savedTheme = localStorage.getItem('loginTheme');
    const savedCustomTheme = localStorage.getItem('customLoginTheme');
    
    console.log('Inicializando tema - savedTheme:', savedTheme, 'savedCustomTheme:', savedCustomTheme);
    
    if (savedCustomTheme) {
      try {
        // Cargar tema personalizado
        this.customTheme = JSON.parse(savedCustomTheme);
        this.currentTheme = 'custom';
        this.applyCustomTheme();
        console.log('Tema personalizado cargado:', this.customTheme);
      } catch (error) {
        console.error('Error al cargar tema personalizado:', error);
        this.currentTheme = 'red';
        this.applyPredefinedTheme('red');
      }
    } else if (savedTheme && this.predefinedThemes[savedTheme]) {
      // Cargar tema predefinido
      this.currentTheme = savedTheme;
      this.applyPredefinedTheme(savedTheme);
      console.log('Tema predefinido cargado:', savedTheme);
    } else {
      // Usar tema rojo por defecto
      this.currentTheme = 'red';
      localStorage.setItem('loginTheme', 'red');
      this.applyPredefinedTheme('red');
      console.log('Tema por defecto aplicado: rojo');
    }
  }

  crearFormulario(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.marcarCamposComoTocados();
      this.errorMessage = 'Por favor, complete todos los campos correctamente.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { username, password, rememberMe } = this.loginForm.value;

    const loginData = {
      username,
      password,
      rememberMe
    };

    this.authService.login(username, password, rememberMe).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          // Guardar datos de autenticación usando el servicio
          this.authService.saveAuthData(response.token, response.user, rememberMe);

          this.successMessage = '¡Inicio de sesión exitoso!';
          
          // Redirigir después de un breve delay
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        } else {
          this.errorMessage = response.message || 'Error al iniciar sesión.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.status === 401) {
          this.errorMessage = 'Credenciales incorrectas. Verifique su usuario y contraseña.';
        } else if (error.status === 0) {
          this.errorMessage = 'Error de conexión. Verifique que el servidor esté funcionando.';
        } else {
          this.errorMessage = 'Error inesperado. Intente nuevamente.';
        }
      }
    });
  }

  marcarCamposComoTocados(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  // Validaciones para mostrar errores
  isInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  getError(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es obligatorio.';
    }
    if (control.errors['minlength']) {
      const requiredLength = control.errors['minlength'].requiredLength;
      if (controlName === 'username') {
        return `El usuario debe tener al menos ${requiredLength} caracteres.`;
      }
      if (controlName === 'password') {
        return `La contraseña debe tener al menos ${requiredLength} caracteres.`;
      }
    }
    return 'Error en el campo.';
  }

  // Método para demo
  loginDemo(): void {
    this.showDemoModal = true;
  }

  // Manejar cierre del modal DEMO
  onDemoModalClose(): void {
    this.showDemoModal = false;
  }

  // Manejar login exitoso desde modal DEMO
  onDemoLoginSuccess(response: any): void {
    this.showDemoModal = false;
    
    // Guardar datos de autenticación usando el servicio
    this.authService.saveAuthData(response.token, response.user, false);

    // Guardar información de tiempo demo si está disponible
    if (response.user && (response.user.rol === 'DEMO' || response.user.rol === 'demo')) {
      const demoTimeInfo = {
        horasAsignadas: response.user.HorasRestantes || response.HorasRestantes || 1,
        minutosAsignados: response.user.MinutosRestantes || response.MinutosRestantes || 0,
        fechaInicio: new Date().toISOString(),
        fechaFin: response.user.FechaFinDemo || response.FechaFinDemo || null
      };
      localStorage.setItem('demoTimeInfo', JSON.stringify(demoTimeInfo));
    }

    this.successMessage = '¡Acceso DEMO exitoso!';
    
    // Redirigir después de un breve delay
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 1500);
  }

  // Manejar error en login DEMO
  onDemoLoginError(error: string): void {
    this.errorMessage = error;
  }

  // Métodos del sistema de temas avanzado
  toggleThemePanel(): void {
    if (!this.showThemePanel) {
      // Al abrir el panel, guardar el tema actual como anterior
      this.previousTheme = this.currentTheme;
      this.originalCustomTheme = { ...this.customTheme };
    }
    this.showThemePanel = !this.showThemePanel;
  }

  closeThemePanel(): void {
    // Si estamos en modo personalizado y cerramos sin guardar, restaurar tema anterior
    if (this.currentTheme === 'custom') {
      this.restorePreviousTheme();
    }
    this.showThemePanel = false;
  }

  restorePreviousTheme(): void {
    // Restaurar el tema anterior
    this.currentTheme = this.previousTheme;
    this.customTheme = { ...this.originalCustomTheme };
    
    if (this.previousTheme === 'custom') {
      this.applyCustomTheme();
    } else {
      this.applyPredefinedTheme(this.previousTheme);
    }
    console.log('Tema restaurado a:', this.previousTheme);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Si el panel está abierto y el clic fue fuera del panel y del botón
    if (this.showThemePanel && this.themePanel) {
      const target = event.target as HTMLElement;
      const isInsidePanel = this.themePanel.nativeElement.contains(target);
      const isThemeButton = target.closest('.theme-button');
      
      // Si el clic fue fuera del panel y no en el botón de temas, cerrar el panel
      if (!isInsidePanel && !isThemeButton) {
        // Solo cerrar si NO estamos en modo personalizado
        if (this.currentTheme !== 'custom') {
          this.closeThemePanel();
        }
      }
    }
  }

  applyPredefinedTheme(themeName: string): void {
    if (!this.predefinedThemes[themeName]) return;
    
    this.currentTheme = themeName;
    const theme = this.predefinedThemes[themeName];
    
    // Aplicar colores usando CSS custom properties
    this.applyThemeColors(theme);
    
    // Guardar en localStorage
    localStorage.setItem('loginTheme', themeName);
    localStorage.removeItem('customLoginTheme');
    
    // Cerrar el panel automáticamente después de aplicar tema predefinido
    this.closeThemePanel();
    
    console.log(`Aplicando tema predefinido: ${themeName}`);
  }

  applyCustomTheme(): void {
    this.currentTheme = 'custom';
    this.applyThemeColors(this.customTheme);
    console.log('Aplicando tema personalizado');
  }

  saveCustomTheme(): void {
    console.log('Guardando tema personalizado:', this.customTheme);
    
    // Guardar el tema personalizado
    localStorage.setItem('customLoginTheme', JSON.stringify(this.customTheme));
    localStorage.removeItem('loginTheme');
    
    // Aplicar el tema personalizado
    this.currentTheme = 'custom';
    this.applyThemeColors(this.customTheme);
    
    // Actualizar el tema anterior para futuras restauraciones
    this.previousTheme = 'custom';
    this.originalCustomTheme = { ...this.customTheme };
    
    // Verificar que se guardó correctamente
    const savedTheme = localStorage.getItem('customLoginTheme');
    console.log('Tema guardado en localStorage:', savedTheme);
    console.log('Tema actual aplicado:', this.currentTheme);
    
    this.closeThemePanel();
    console.log('Tema personalizado guardado y aplicado permanentemente');
  }

  onCustomColorChange(): void {
    // Se ejecuta cuando cambia cualquier color personalizado
    // Solo aplica temporalmente, NO guarda en localStorage
    this.currentTheme = 'custom';
    this.applyThemeColors(this.customTheme);
    console.log('Aplicando tema personalizado temporalmente (no guardado)');
  }

  resetToDefault(): void {
    this.currentTheme = 'red';
    this.customTheme = { ...this.predefinedThemes.red };
    this.applyPredefinedTheme('red');
    this.closeThemePanel();
    console.log('Tema restaurado al predeterminado');
  }

  private applyThemeColors(theme: any): void {
    if (!this.loginContainer) return;
    
    const element = this.loginContainer.nativeElement;
    const root = document.documentElement;
    
    // Aplicar variables CSS personalizadas
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--primary-light', theme.secondary);
    root.style.setProperty('--primary-dark', theme.accent);
    root.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${theme.primary}, ${theme.secondary}, ${theme.accent})`);
    root.style.setProperty('--secondary-gradient', `linear-gradient(135deg, ${theme.secondary}, ${theme.primary}, ${theme.accent})`);
    root.style.setProperty('--panel-bg', theme.panelBg);
    root.style.setProperty('--border-color', theme.border);
    root.style.setProperty('--focus-color', theme.focus);
    
    // Limpiar clases de tema antiguas
    element.classList.remove('red-theme', 'purple-theme', 'blue-theme', 'green-theme', 'orange-theme', 'teal-theme', 'pink-theme');
    
    // Agregar clase del tema actual
    element.classList.add(`${this.currentTheme}-theme`);
  }
}
