import { Component, OnInit, ChangeDetectorRef, HostListener, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../auth/auth.service';
import { NotificacionesService, Notification } from '../../services/notificaciones.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit, OnDestroy {
  // Evento para comunicar con el layout sobre el menú móvil
  @Output() mobileMenuToggle = new EventEmitter<void>();
  
  // Tema
  theme: 'dark' | 'light' = 'dark';
  
  // Usuario
  currentUser: User | null = null;
  userName: string = '';
  userEmail: string = '';
  userRole: string = '';
  userAvatar: string = '';
  initials: string = '';
  userStatus: 'online' | 'offline' = 'online';
  
  // Búsqueda
  searchQuery: string = '';
  
  // Notificaciones
  showNotifications: boolean = false;
  notificationCount: number = 0;
  notifications: Notification[] = [];
  private notificationSubscription?: Subscription;
  private timeUpdateInterval?: any;
  
  // Temporizador Demo
  isDemoSession: boolean = false;
  demoTimeRemaining: string = '';
  demoTimeRemainingSeconds: number = 0;
  private demoTimerInterval?: any;
  
  // Menú usuario
  showUserMenu: boolean = false;
  
  // Estado del sidebar
  isSidebarCollapsed: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService,
    private notificacionesService: NotificacionesService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadTheme();
    this.setupNotifications();
    this.checkSidebarState();
    this.checkDemoSession();
    this.cdr.detectChanges();
  }
  
  private checkSidebarState(): void {
    // Verificar estado del sidebar desde localStorage
    const updateState = () => {
      this.isSidebarCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
      this.cdr.detectChanges();
    };
    
    // Estado inicial
    updateState();
    
    // Escuchar eventos personalizados del sidebar
    window.addEventListener('sidebar-toggle', (e: any) => {
      this.isSidebarCollapsed = e.detail?.collapsed ?? (localStorage.getItem('sidebar-collapsed') === 'true');
      this.cdr.detectChanges();
    });
    
    // Verificar periódicamente (por si acaso)
    setInterval(() => {
      const currentState = localStorage.getItem('sidebar-collapsed') === 'true';
      if (currentState !== this.isSidebarCollapsed) {
        this.isSidebarCollapsed = currentState;
        this.cdr.detectChanges();
      }
    }, 500);
  }
  
  toggleSidebar(): void {
    // Disparar evento para que el sidebar se expanda
    window.dispatchEvent(new CustomEvent('expand-sidebar'));
    this.isSidebarCollapsed = false;
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }
    if (this.demoTimerInterval) {
      clearInterval(this.demoTimerInterval);
    }
  }

  private setupNotifications(): void {
    // Suscribirse a cambios en las notificaciones
    this.notificationSubscription = this.notificacionesService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
      this.calculateNotificationCount();
      this.cdr.detectChanges();
    });

    // Actualizar tiempos cada minuto
    this.timeUpdateInterval = setInterval(() => {
      this.cdr.detectChanges();
    }, 60000); // Cada minuto
  }

  private loadUserData(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      // Obtener solo el primer nombre y primer apellido
      const primerNombre = this.currentUser.nombre ? this.currentUser.nombre.split(' ')[0] : '';
      const primerApellido = this.currentUser.apellidos ? this.currentUser.apellidos.split(' ')[0] : '';
      this.userName = `${primerNombre} ${primerApellido}`.trim();
      this.userEmail = this.currentUser.email;
      // Mostrar 'SUPER ADMINISTRADOR' solo cuando realmente sea Super Admin
      const rolUpper = (this.currentUser.rol || '').toUpperCase();
      if (rolUpper === 'SUPER ADMINISTRADOR' || 
          rolUpper === 'SUPER_ADMINISTRADOR' || 
          rolUpper === 'SUPER_ADMIN' ||
          this.currentUser.rol === 'Super Administrador') {
        this.userRole = 'SUPER ADMINISTRADOR';
      } else {
        // Mostrar el rol exacto del usuario
        this.userRole = this.currentUser.rol;
      }
      this.initials = this.getInitialsFromName();
    }
  }

  // ==================== TEMPORIZADOR DEMO ====================
  private checkDemoSession(): void {
    const user = this.authService.getCurrentUser();
    this.isDemoSession = user ? this.authService.isDemo() : false;
    
    if (this.isDemoSession) {
      this.startDemoTimer();
    }
  }

  private startDemoTimer(): void {
    // Actualizar inmediatamente
    this.updateDemoTimer();
    
    // Actualizar cada segundo
    this.demoTimerInterval = setInterval(() => {
      this.updateDemoTimer();
    }, 1000);
  }

  private updateDemoTimer(): void {
    const demoTimeInfoStr = localStorage.getItem('demoTimeInfo');
    if (!demoTimeInfoStr) {
      this.isDemoSession = false;
      if (this.demoTimerInterval) {
        clearInterval(this.demoTimerInterval);
      }
      return;
    }

    try {
      const demoTimeInfo = JSON.parse(demoTimeInfoStr);
      const fechaInicio = new Date(demoTimeInfo.fechaInicio);
      const ahora = new Date();
      
      // Calcular tiempo total asignado en milisegundos
      const horasEnMs = (demoTimeInfo.horasAsignadas || 1) * 60 * 60 * 1000;
      const minutosEnMs = (demoTimeInfo.minutosAsignados || 0) * 60 * 1000;
      const tiempoTotalMs = horasEnMs + minutosEnMs;
      
      // Calcular tiempo transcurrido
      const tiempoTranscurridoMs = ahora.getTime() - fechaInicio.getTime();
      
      // Calcular tiempo restante
      const tiempoRestanteMs = tiempoTotalMs - tiempoTranscurridoMs;
      this.demoTimeRemainingSeconds = Math.max(0, Math.floor(tiempoRestanteMs / 1000));
      
      if (tiempoRestanteMs <= 0) {
        // Tiempo agotado
        this.demoTimeRemaining = '00:00:00';
        this.isDemoSession = false;
        if (this.demoTimerInterval) {
          clearInterval(this.demoTimerInterval);
        }
        // Mostrar alerta y cerrar sesión
        alert('⏰ Tu sesión DEMO ha expirado. Serás redirigido al login.');
        this.authService.logout();
        return;
      }
      
      // Formatear tiempo restante como HH:MM:SS
      const horas = Math.floor(this.demoTimeRemainingSeconds / 3600);
      const minutos = Math.floor((this.demoTimeRemainingSeconds % 3600) / 60);
      const segundos = this.demoTimeRemainingSeconds % 60;
      
      this.demoTimeRemaining = `${this.padZero(horas)}:${this.padZero(minutos)}:${this.padZero(segundos)}`;
      
      // Mostrar advertencia cuando queden menos de 5 minutos
      if (this.demoTimeRemainingSeconds <= 300 && this.demoTimeRemainingSeconds > 0) {
        // Solo mostrar una vez cuando llegue a 5 minutos
        if (this.demoTimeRemainingSeconds === 300) {
          alert('⚠️ Atención: Tu sesión DEMO expirará en 5 minutos.');
        }
      }
      
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error al calcular tiempo demo:', error);
      this.isDemoSession = false;
      if (this.demoTimerInterval) {
        clearInterval(this.demoTimerInterval);
      }
    }
  }

  private padZero(num: number): string {
    return num.toString().padStart(2, '0');
  }

  // ==================== TEMA ====================
  toggleTheme(): void {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    console.log('🎨 Cambiando tema a:', this.theme);
    localStorage.setItem('theme', this.theme);
    this.applyTheme();
    this.cdr.detectChanges();
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme) {
      this.theme = savedTheme;
    }
    this.applyTheme();
  }

  private applyTheme(): void {
    document.documentElement.setAttribute('data-theme', this.theme);
    document.body.classList.toggle('dark-theme', this.theme === 'dark');
    console.log('✅ Tema aplicado:', this.theme, '- data-theme:', document.documentElement.getAttribute('data-theme'));
  }

  // ==================== BÚSQUEDA ====================
  onSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Buscando:', this.searchQuery);
      // Implementar lógica de búsqueda
      this.router.navigate(['/buscar'], { queryParams: { q: this.searchQuery } });
    }
  }

  // ==================== NOTIFICACIONES ====================
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
  }

  calculateNotificationCount(): void {
    this.notificationCount = this.notificacionesService.getUnreadCount();
  }

  markAllAsRead(): void {
    this.notificacionesService.markAllAsRead();
  }

  onNotificationClick(notification: Notification): void {
    if (!notification.read) {
      this.notificacionesService.markAsRead(notification.id);
    }
    
    // Navegar según la URL de acción si existe
    if (notification.actionUrl) {
      this.router.navigate([notification.actionUrl]);
      this.showNotifications = false;
    }
  }

  getTimeAgo(notification: Notification): string {
    return this.notificacionesService.getTimeAgo(notification);
  }

  // ==================== MENÚ USUARIO ====================
  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
  }

  navigateTo(route: string): void {
    this.showUserMenu = false;
    this.router.navigate([route]);
  }

  logout(): void {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout();
    }
  }

  // ==================== MENÚ MÓVIL ====================
  toggleMobileMenu(): void {
    this.mobileMenuToggle.emit();
  }

  // ==================== AYUDA ====================
  showHelp(): void {
    alert('🆘 Centro de Ayuda\n\nPróximamente: Tutoriales y documentación');
  }

  // ==================== UTILIDADES ====================
  private getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  private getInitialsFromName(): string {
    if (!this.currentUser) return 'U';
    
    if (this.currentUser.nombre && this.currentUser.apellidos) {
      // Obtener solo el primer nombre y primer apellido para las iniciales
      const primerNombre = this.currentUser.nombre.split(' ')[0];
      const primerApellido = this.currentUser.apellidos.split(' ')[0];
      return `${primerNombre.charAt(0)}${primerApellido.charAt(0)}`.toUpperCase();
    } else if (this.currentUser.nombre) {
      // Si solo hay nombre, usar las primeras dos letras
      return this.currentUser.nombre.substring(0, 2).toUpperCase();
    } else if (this.currentUser.username) {
      return this.currentUser.username.substring(0, 2).toUpperCase();
    }
    
    return 'U';
  }

  // Cerrar dropdowns al hacer click fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.topbar__notifications') && !target.closest('.topbar__user')) {
      this.showNotifications = false;
      this.showUserMenu = false;
      this.cdr.detectChanges();
    }
  }
}