import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  username: string;
  email: string;
  nombre: string;
  apellidos: string;
  rol: string;
  ultimoAcceso?: string;
  permisos?: any; // Permisos del rol del usuario
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private permisosSubject = new BehaviorSubject<any>(null);
  public permisos$ = this.permisosSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Verificar si hay sesión activa al inicializar INMEDIATAMENTE
    this.checkAuthStatus();
  }

  // =====================================================
  // VERIFICAR ESTADO DE AUTENTICACIÓN
  // =====================================================
  private checkAuthStatus(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        // Verificar si el token es válido antes de establecer el usuario
        if (this.isTokenValid(token)) {
          const user = JSON.parse(userStr);
          this.currentUserSubject.next(user);
          
          // Cargar permisos del rol después de establecer el usuario
          setTimeout(() => {
            this.cargarPermisosDelRol();
          }, 100);
        } else {
          // Token expirado, limpiar datos
          this.clearAuthData();
        }
      } catch (error) {
        this.clearAuthData();
      }
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('permisos');
    this.currentUserSubject.next(null);
    this.permisosSubject.next(null);
  }

  // =====================================================
  // LOGIN
  // =====================================================
  login(username: string, password: string, rememberMe: boolean = false): Observable<LoginResponse> {
    const loginData = {
      username,
      password,
      rememberMe
    };

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginData);
  }

  // =====================================================
  // LOGOUT
  // =====================================================
  logout(): void {
    // Limpiar datos
    this.clearAuthData();
    
    // Redirigir al login
    this.router.navigate(['/login']);
  }

  // =====================================================
  // VERIFICAR TOKEN
  // =====================================================
  verifyToken(): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify`);
  }

  // =====================================================
  // OBTENER PERFIL
  // =====================================================
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  // =====================================================
  // CAMBIAR CONTRASEÑA
  // =====================================================
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword
    });
  }

  // =====================================================
  // UTILIDADES
  // =====================================================
  
  // Verificar si está autenticado
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    return this.isTokenValid(token);
  }

  // =====================================================
  // GESTIÓN DE PERMISOS
  // =====================================================
  
  // Cargar permisos del rol del usuario actual
  cargarPermisosDelRol(): void {
    const user = this.getCurrentUser();
    if (!user || !user.rol) {
      this.permisosSubject.next(null);
      return;
    }

    // Si es Super Administrador, tiene todos los permisos
    if (this.isSuperAdmin()) {
      const todosPermisos = {
        trabajadores: { ver: true, crear: true, editar: true, eliminar: true },
        planillas: { ver: true, crear: true, editar: true, eliminar: true },
        reportes: { ver: true, exportar: true },
        configuracion: { ver: true, editar: true },
        asistencia: { ver: true, editar: true },
        beneficios: { ver: true, editar: true },
        prestamos: { ver: true, crear: true, editar: true, eliminar: true },
        usuarios: { ver: true, crear: true, editar: true, eliminar: true },
        roles: { ver: true, crear: true, editar: true, eliminar: true }
      };
      this.permisosSubject.next(todosPermisos);
      localStorage.setItem('permisos', JSON.stringify(todosPermisos));
      return;
    }

    // Verificar si hay permisos en localStorage
    const permisosGuardados = localStorage.getItem('permisos');
    if (permisosGuardados) {
      try {
        const permisos = JSON.parse(permisosGuardados);
        this.permisosSubject.next(permisos);
      } catch (error) {
        console.error('Error al parsear permisos guardados:', error);
      }
    }

    // Obtener permisos del rol desde la base de datos
    this.http.get(`${environment.apiUrl}/roles/nombre/${encodeURIComponent(user.rol)}`).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          let permisos = response.data.permisos;
          
          // Si los permisos son ["*"], convertir al objeto completo
          if (Array.isArray(permisos) && permisos.length === 1 && permisos[0] === '*') {
            permisos = {
              trabajadores: { ver: true, crear: true, editar: true, eliminar: true },
              planillas: { ver: true, crear: true, editar: true, eliminar: true },
              reportes: { ver: true, exportar: true },
              configuracion: { ver: true, editar: true },
              asistencia: { ver: true, editar: true },
              beneficios: { ver: true, editar: true },
              prestamos: { ver: true, crear: true, editar: true, eliminar: true },
              usuarios: { ver: true, crear: true, editar: true, eliminar: true },
              roles: { ver: true, crear: true, editar: true, eliminar: true }
            };
          } else if (typeof permisos === 'string') {
            try {
              permisos = JSON.parse(permisos);
            } catch (error) {
              console.error('Error al parsear permisos JSON:', error);
              permisos = {};
            }
          }
          
          // Asegurar que permisos sea un objeto válido
          if (!permisos || typeof permisos !== 'object' || Array.isArray(permisos)) {
            permisos = {};
          }
          
          this.permisosSubject.next(permisos);
          localStorage.setItem('permisos', JSON.stringify(permisos));
          
          // Actualizar permisos en el usuario
          const currentUser = this.getCurrentUser();
          if (currentUser) {
            currentUser.permisos = permisos;
            this.currentUserSubject.next(currentUser);
            localStorage.setItem('user', JSON.stringify(currentUser));
          }
        } else {
          this.permisosSubject.next({});
        }
      },
      error: (error) => {
        console.error('Error al cargar permisos del rol:', error);
        this.permisosSubject.next({});
      }
    });
  }

  // Obtener permisos actuales
  getPermisos(): any {
    return this.permisosSubject.value;
  }

  // Verificar si tiene un permiso específico
  hasPermission(modulo: string, accion: string): boolean {
    // Super Administrador tiene todos los permisos
    if (this.isSuperAdmin()) return true;
    
    const permisos = this.getPermisos();
    if (!permisos || !permisos[modulo]) return false;
    
    return permisos[modulo][accion] === true;
  }

  // Verificar si puede ver un módulo
  canView(modulo: string): boolean {
    return this.hasPermission(modulo, 'ver');
  }

  // Verificar si puede crear en un módulo
  canCreate(modulo: string): boolean {
    return this.hasPermission(modulo, 'crear');
  }

  // Verificar si puede editar en un módulo
  canEdit(modulo: string): boolean {
    return this.hasPermission(modulo, 'editar');
  }

  // Verificar si puede eliminar en un módulo
  canDelete(modulo: string): boolean {
    return this.hasPermission(modulo, 'eliminar');
  }

  // Verificar si puede exportar reportes
  canExport(): boolean {
    return this.hasPermission('reportes', 'exportar');
  }

  // Verificar si el token es válido
  private isTokenValid(token: string): boolean {
    try {
      const payload = this.parseJwt(token);
      const currentTime = Date.now() / 1000;
      return payload.exp && payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  // Obtener token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Obtener usuario actual
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Verificar si tiene rol específico
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.rol === role : false;
  }

  // Verificar si es Super Administrador (acceso completo)
  isSuperAdmin(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    const rol = (user.rol || '').toUpperCase();
    // Solo Super Administrador tiene acceso completo
    return rol === 'SUPER ADMINISTRADOR' ||
           rol === 'SUPER_ADMINISTRADOR' ||
           rol === 'SUPER_ADMIN' ||
           user.rol === 'Super Administrador';
  }

  // Verificar si es administrador (puede ser Administrador normal o Super Administrador)
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    // Si es Super Administrador, retornar true
    if (this.isSuperAdmin()) return true;
    
    // Para otros roles, verificar si el nombre contiene "Administrador" o "ADMIN"
    // pero NO tratarlos como Super Administrador
    const rol = (user.rol || '').toUpperCase();
    return rol === 'ADMINISTRADOR' || 
           rol === 'ADMIN' || 
           rol === 'ADMIN_NORMAL' ||
           user.rol === 'Administrador';
  }

  // Verificar si es RRHH (basado en permisos o nombre de rol)
  isRRHH(): boolean {
    // Si tiene permisos de trabajadores, considerarlo RRHH
    if (this.canView('trabajadores') || this.canCreate('trabajadores')) {
      return true;
    }
    return this.hasRole('RRHH') || this.isAdmin();
  }

  // Verificar si es contabilidad (basado en permisos o nombre de rol)
  isContabilidad(): boolean {
    // Si tiene permisos de planillas, considerarlo Contabilidad
    if (this.canView('planillas') || this.canCreate('planillas')) {
      return true;
    }
    return this.hasRole('Contabilidad') || this.hasRole('CONTABILIDAD') || this.isAdmin();
  }

  // Verificar si es gerencia (basado en permisos o nombre de rol)
  isGerencia(): boolean {
    // Si solo puede ver pero no crear/editar, considerarlo Gerencia
    if (this.canView('trabajadores') && !this.canCreate('trabajadores') && !this.canEdit('trabajadores')) {
      return true;
    }
    return this.hasRole('Gerencia') || this.hasRole('GERENCIA') || this.isAdmin();
  }

  // Verificar si es DEMO
  isDemo(): boolean {
    return this.hasRole('DEMO') || this.hasRole('demo');
  }

  // Parsear JWT
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  }

  // Guardar datos de autenticación
  saveAuthData(token: string, user: User, rememberMe: boolean = false): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
    }
    
    this.currentUserSubject.next(user);
    
    // Cargar permisos del rol después de guardar los datos del usuario
    setTimeout(() => {
      this.cargarPermisosDelRol();
    }, 100);
  }

  // Verificar si debe recordar sesión
  shouldRememberSession(): boolean {
    return localStorage.getItem('rememberMe') === 'true';
  }
}
