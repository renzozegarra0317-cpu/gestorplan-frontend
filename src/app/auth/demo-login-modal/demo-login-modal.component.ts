// frontend/src/app/auth/demo-login-modal/demo-login-modal.component.ts
import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DemoLoginService, DemoUser } from '../demo-login.service';

@Component({
  selector: 'app-demo-login-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './demo-login-modal.component.html',
  styleUrls: ['./demo-login-modal.component.scss']
})
export class DemoLoginModalComponent implements OnInit, OnChanges {
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<any>();
  @Output() loginError = new EventEmitter<string>();

  demoForm!: FormGroup;
  availableUsers: DemoUser[] = [];
  selectedUser: DemoUser | null = null;
  isLoading: boolean = false;
  cargandoUsuarios: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private demoLoginService: DemoLoginService
  ) { }

  ngOnInit(): void {
    this.crearFormulario();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible'] && changes['isVisible'].currentValue === true) {
      this.cargarUsuariosDemo();
      // Forzar foco en el campo de contraseña para liberar control del navegador
      setTimeout(() => {
        this.liberarControlNavegador();
      }, 100);
    }
  }

  crearFormulario(): void {
    this.demoForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  cargarUsuariosDemo(): void {
    this.cargandoUsuarios = true;
    this.demoLoginService.getAvailableDemoUsers().subscribe({
      next: (usuarios) => {
        this.availableUsers = usuarios;
        this.cargandoUsuarios = false;
        console.log('✅ Usuarios DEMO cargados:', usuarios);
      },
      error: (error) => {
        console.error('❌ Error al cargar usuarios DEMO:', error);
        this.errorMessage = 'Error al cargar usuarios DEMO. Por favor, intente nuevamente.';
        this.cargandoUsuarios = false;
      }
    });
  }

  onUserSelect(): void {
    const username = this.demoForm.get('username')?.value;
    if (username) {
      this.selectedUser = this.availableUsers.find(u => u.Username === username) || null;
      // NO auto-completar contraseña - el usuario debe ingresarla manualmente
      // Limpiar campo de contraseña cuando cambia el usuario
      this.demoForm.patchValue({
        password: ''
      });
      // Liberar control del navegador después de seleccionar usuario
      setTimeout(() => {
        this.liberarControlNavegador();
      }, 100);
    } else {
      this.selectedUser = null;
    }
  }

  onSubmit(): void {
    if (this.demoForm.invalid) {
      this.marcarCamposComoTocados();
      this.errorMessage = 'Por favor, complete todos los campos correctamente.';
      return;
    }

    const { username, password } = this.demoForm.value;

    // Validar que el usuario seleccionado sea un usuario DEMO
    const usuarioDemo = this.availableUsers.find(u => u.Username === username);
    if (!usuarioDemo) {
      this.errorMessage = 'Por favor, seleccione un usuario DEMO válido.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Realizar login DEMO - el backend validará las credenciales
    this.demoLoginService.loginDemo(username, password).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.loginSuccess.emit(response);
          this.cerrarModal();
        } else {
          this.errorMessage = response.message || 'Error al iniciar sesión DEMO.';
          this.loginError.emit(this.errorMessage);
        }
      },
      error: (error) => {
        this.isLoading = false;
        if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.status === 401) {
          this.errorMessage = 'Credenciales incorrectas. Verifique su usuario y contraseña.';
        } else if (error.status === 403) {
          this.errorMessage = 'Cuenta DEMO expirada o inactiva. Contacte al administrador.';
        } else if (error.status === 0) {
          this.errorMessage = 'Error de conexión. Verifique que el servidor esté funcionando.';
        } else {
          this.errorMessage = 'Error inesperado. Intente nuevamente.';
        }
        this.loginError.emit(this.errorMessage);
      }
    });
  }

  marcarCamposComoTocados(): void {
    Object.keys(this.demoForm.controls).forEach(key => {
      this.demoForm.get(key)?.markAsTouched();
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.demoForm.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  getError(controlName: string): string {
    const control = this.demoForm.get(controlName);
    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es obligatorio.';
    }
    if (control.errors['minlength']) {
      return `La contraseña debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`;
    }
    return 'Error en el campo.';
  }

  cerrarModal(): void {
    this.demoForm.reset();
    this.selectedUser = null;
    this.errorMessage = '';
    this.isLoading = false;
    this.close.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.cerrarModal();
    }
  }

  // Método para liberar el control del navegador en el campo de contraseña
  liberarControlNavegador(): void {
    const passwordInput = document.getElementById('demo-password') as HTMLInputElement;
    if (passwordInput) {
      // Forzar foco y luego blur para liberar control del navegador
      passwordInput.focus();
      setTimeout(() => {
        passwordInput.blur();
        setTimeout(() => {
          passwordInput.focus();
        }, 50);
      }, 50);
    }
  }
}
