import { Component, OnInit, ChangeDetectorRef, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { HttpClient } from '@angular/common/http';

interface ExpandedSections {
  trabajadores: boolean;
  asistencia: boolean;
  planillas: boolean;
  beneficios: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  
  isCollapsed: boolean = false; // Estado del sidebar (expandido/colapsado)
  
  expandedSections: ExpandedSections = {
    trabajadores: false,
    asistencia: false,
    planillas: false,
    beneficios: false
  };

  currentRoute: string = '';

  // Propiedades para control de roles
  currentUser: any = null;
  isAdmin: boolean = false;
  isRRHH: boolean = false;
  isGerencia: boolean = false;
  isContabilidad: boolean = false;
  isDemo: boolean = false;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    public authService: AuthService, // Cambiado a public para usar en template
    private elementRef: ElementRef,
    private http: HttpClient
  ) {}
  
  ngOnInit(): void {
    // Cargar información del usuario y roles
    this.loadUserInfo();
    
    // Cargar estado guardado del sidebar
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      this.isCollapsed = savedState === 'true';
    }
    
    // Obtener ruta actual
    this.currentRoute = this.router.url;
    
    // Auto-expandir sección según ruta actual
    this.autoExpandFromRoute(this.currentRoute);
    
    // Escuchar evento para expandir desde el topbar
    window.addEventListener('expand-sidebar', () => {
      if (this.isCollapsed) {
        this.toggleSidebar();
      }
    });
    
    // Escuchar cambios de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.urlAfterRedirects;
      this.autoExpandFromRoute(this.currentRoute);
      this.cdr.detectChanges();
    });
  }

  private loadUserInfo(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.isAdmin = this.authService.isAdmin();
      this.isRRHH = this.authService.isRRHH();
      this.isGerencia = this.authService.isGerencia();
      this.isContabilidad = this.authService.isContabilidad();
      this.isDemo = this.authService.isDemo();
      
      // Cargar información completa del usuario desde la API
      this.loadCompleteUserInfo();
    }
  }

  private loadCompleteUserInfo(): void {
    console.log('🔍 Cargando información completa del usuario:', this.currentUser);
    if (!this.currentUser?.id) {
      console.log('❌ No hay ID de usuario disponible');
      return;
    }
    
    console.log('🔍 Obteniendo datos del usuario ID:', this.currentUser.id);
    this.http.get(`http://localhost:5000/api/usuarios/${this.currentUser.id}`).subscribe({
      next: (response: any) => {
        console.log('🔍 Respuesta del servidor:', response);
        if (response.success && response.data) {
          const userData = response.data;
          this.currentUser = {
            ...this.currentUser,
            nombre: userData.Nombre || userData.nombre || '',
            apellidos: userData.Apellidos || userData.apellidos || '',
            email: userData.Email || userData.email || '',
            username: userData.Username || userData.username || '',
            rol: userData.Rol || userData.rol || ''
          };
          
          // Actualizar roles después de cargar datos completos
          this.isAdmin = this.authService.isAdmin();
          this.isRRHH = this.authService.isRRHH();
          this.isGerencia = this.authService.isGerencia();
          this.isContabilidad = this.authService.isContabilidad();
          this.isDemo = this.authService.isDemo();
          
          console.log('👤 Usuario completo cargado en sidebar:', this.currentUser);
          console.log('👤 Nombre completo:', this.getDisplayName());
          console.log('👤 Roles detectados:', { isAdmin: this.isAdmin, isRRHH: this.isRRHH, isDemo: this.isDemo });
        }
      },
      error: (error) => {
        console.error('Error al cargar información completa del usuario:', error);
      }
    });
  }

  getInitials(username: string): string {
    if (!username) return 'U';
    return username.substring(0, 2).toUpperCase();
  }

  getInitialsFromName(): string {
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

  getDisplayName(): string {
    if (!this.currentUser) return '';
    
    if (this.currentUser.nombre && this.currentUser.apellidos) {
      // Obtener solo el primer nombre y primer apellido
      const primerNombre = this.currentUser.nombre.split(' ')[0];
      const primerApellido = this.currentUser.apellidos.split(' ')[0];
      return `${primerNombre} ${primerApellido}`;
    } else if (this.currentUser.nombre) {
      // Si solo hay nombre, obtener solo el primer nombre
      return this.currentUser.nombre.split(' ')[0];
    } else if (this.currentUser.username) {
      return this.currentUser.username;
    }
    
    return 'Usuario del sistema';
  }

  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      'Administrador': 'SUPER ADMINISTRADOR',
      'ADMINISTRADOR': 'SUPER ADMINISTRADOR',
      'SUPER_ADMIN': 'SUPER ADMINISTRADOR',
      'SUPER_ADMINISTRADOR': 'SUPER ADMINISTRADOR',
      'ADMIN': 'Administrador',
      'ADMIN_NORMAL': 'Administrador',
      'RRHH': 'Recursos Humanos',
      'Gerencia': 'Gerencia',
      'Contabilidad': 'Contabilidad',
      'DEMO': 'Usuario DEMO'
    };
    return roleNames[role] || role;
  }

  private autoExpandFromRoute(route: string): void {
    // Solo auto-expandir en modo expandido (no colapsado)
    if (this.isCollapsed) {
      // CERRAR TODOS los submenus cuando está colapsado
      this.expandedSections = {
        trabajadores: false,
        asistencia: false,
        planillas: false,
        beneficios: false
      };
      return; // No auto-expandir cuando está colapsado
    }
    
    // Primero resetear todos
    this.expandedSections = {
      trabajadores: false,
      asistencia: false,
      planillas: false,
      beneficios: false
    };
    
    // Luego expandir el correcto
    if (route.includes('/trabajadores')) {
      this.expandedSections.trabajadores = true;
    } else if (route.includes('/asistencia')) {
      this.expandedSections.asistencia = true;
    } else if (route.includes('/planillas')) {
      this.expandedSections.planillas = true;
    } else if (route.includes('/beneficios')) {
      this.expandedSections.beneficios = true;
    }
  }

  toggleSection(section: keyof ExpandedSections, event?: Event): void {
    // En modo colapsado, mostrar tooltip flotante
    if (this.isCollapsed) {
      if (event) {
        const target = event.target as HTMLElement;
        const menuGroup = target.closest('.menu-group');
        if (menuGroup) {
          const isOpening = !this.expandedSections[section];
          
          // Si se está abriendo, primero posicionar (con el submenu oculto)
          if (isOpening) {
            // Cerrar otros submenus
            Object.keys(this.expandedSections).forEach(key => {
              if (key !== section) {
                this.expandedSections[key as keyof ExpandedSections] = false;
              }
            });
            
            // Renderizar el submenu pero mantenerlo invisible para posicionarlo
            this.expandedSections[section] = true;
            this.cdr.detectChanges();
            
            // Posicionar inmediatamente en el siguiente frame
            requestAnimationFrame(() => {
              this.posicionarTooltip(menuGroup);
              // Hacer visible después de posicionar (sin animación de movimiento)
              const tooltip = menuGroup.querySelector('.submenu-floating') as HTMLElement;
              if (tooltip) {
                // Aplicar opacidad directamente sin transición visible
                tooltip.style.transition = 'none';
                tooltip.style.opacity = '1';
                tooltip.style.visibility = 'visible';
                tooltip.style.pointerEvents = 'all';
                // Restaurar transición después de un momento
                setTimeout(() => {
                  tooltip.style.transition = '';
                }, 50);
              }
            });
          } else {
            // Si se está cerrando, simplemente cerrar
            this.expandedSections[section] = false;
            this.cdr.detectChanges();
          }
        }
      }
      return;
    }
    
    // Modo expandido normal
    this.expandedSections[section] = !this.expandedSections[section];
    this.cdr.detectChanges();
  }
  
  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    
    // Cerrar todos los submenús cuando se colapsa
    if (this.isCollapsed) {
      this.expandedSections = {
        trabajadores: false,
        asistencia: false,
        planillas: false,
        beneficios: false
      };
    } else {
      // Re-expandir la sección actual cuando se expande
      this.autoExpandFromRoute(this.currentRoute);
    }
    
    // Guardar estado en localStorage
    localStorage.setItem('sidebar-collapsed', this.isCollapsed.toString());
    
    // Disparar evento personalizado para notificar a otros componentes
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { 
      detail: { collapsed: this.isCollapsed } 
    }));
    
    this.cdr.detectChanges();
  }
  
  isActive(route: string): boolean {
    return this.currentRoute === route || this.currentRoute.startsWith(route + '/');
  }

  isParentActive(parentRoute: string): boolean {
    return this.currentRoute.startsWith(parentRoute);
  }

  cerrarSesion(): void {
    console.log('Cerrando sesión desde sidebar...');
    this.authService.logout();
  }
  
  // Método para manejar click en items sin submenu
  onSimpleItemClick(route: string): void {
    if (this.isCollapsed) {
      // Cerrar todos los submenus cuando se hace click en un item simple
      this.expandedSections = {
        trabajadores: false,
        asistencia: false,
        planillas: false,
        beneficios: false
      };
    }
  }
  
  // Verificar si un item simple está activo
  isSimpleItemActive(route: string): boolean {
    // Siempre mostrar verde si la ruta actual coincide
    return this.isActive(route);
  }
  
  // Método para posicionar el tooltip flotante
  posicionarTooltip(menuGroup: Element): void {
    const tooltip = menuGroup.querySelector('.submenu-floating') as HTMLElement;
    const menuItem = menuGroup.querySelector('.menu-item') as HTMLElement;
    
    if (tooltip && menuItem) {
      const rect = menuItem.getBoundingClientRect();
      
      // Forzar cálculo de altura si no está disponible
      if (tooltip.offsetHeight === 0) {
        tooltip.style.visibility = 'hidden';
        tooltip.style.opacity = '0';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.display = 'block';
      }
      
      const tooltipHeight = tooltip.offsetHeight || 200; // Default si no tiene altura aún
      
      // Posicionar al costado derecho del botón
      const leftPosition = rect.right + 8; // 8px de espacio entre botón y submenu
      const topPosition = rect.top + (rect.height / 2) - (tooltipHeight / 2);
      
      // Asegurar que no se salga de la pantalla por arriba
      const minTop = 8;
      const adjustedTop = Math.max(minTop, topPosition);
      
      // Asegurar que no se salga de la pantalla por abajo
      const maxTop = window.innerHeight - tooltipHeight - 8;
      const finalTop = Math.min(maxTop, adjustedTop);
      
      // Calcular la posición de la flecha (centro del botón relativo al submenu)
      const arrowTop = rect.top + (rect.height / 2) - finalTop;
      
      // Aplicar posiciones SIN transición para evitar animación
      tooltip.style.setProperty('--submenu-left', `${leftPosition}px`);
      tooltip.style.setProperty('--submenu-top', `${finalTop}px`);
      tooltip.style.setProperty('--arrow-top', `${arrowTop}px`);
      
      // Asegurar que no haya transformaciones
      tooltip.style.transform = 'none';
      tooltip.style.left = `${leftPosition}px`;
      tooltip.style.top = `${finalTop}px`;
      
      // Restaurar display si se había ocultado
      if (tooltip.style.display === 'block') {
        tooltip.style.display = '';
      }
    }
  }
  
  // Listener para cerrar submenu al hacer clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isCollapsed) return;
    
    const target = event.target as HTMLElement;
    const clickedInsideSidebar = target.closest('.sidebar');
    const clickedInsideSubmenu = target.closest('.submenu-floating');
    const clickedSubmenuLink = target.closest('.submenu-floating__item');
    
    // Si hizo clic en un link del submenu, cerrar el submenu
    if (clickedSubmenuLink) {
      this.expandedSections = {
        trabajadores: false,
        asistencia: false,
        planillas: false,
        beneficios: false
      };
      this.cdr.detectChanges();
      return;
    }
    
    // Si el clic fue fuera del sidebar y del submenu flotante
    if (!clickedInsideSidebar && !clickedInsideSubmenu) {
      // Cerrar todos los submenus
      this.expandedSections = {
        trabajadores: false,
        asistencia: false,
        planillas: false,
        beneficios: false
      };
      this.cdr.detectChanges();
    }
  }
}