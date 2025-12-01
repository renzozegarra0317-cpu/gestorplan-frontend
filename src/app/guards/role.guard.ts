import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    
    // Verificar si está autenticado
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url },
        queryParamsHandling: 'merge'
      });
      return false;
    }

    // Obtener roles requeridos de la ruta
    const requiredRoles = route.data['roles'] as string[];
    
    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Obtener usuario actual
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url },
        queryParamsHandling: 'merge'
      });
      return false;
    }

    // Verificar si el usuario tiene alguno de los roles requeridos
    console.log('🔍 RoleGuard - Usuario actual:', currentUser);
    console.log('🔍 RoleGuard - Roles requeridos:', requiredRoles);
    console.log('🔍 RoleGuard - isDemo():', this.authService.isDemo());
    console.log('🔍 RoleGuard - hasRole("DEMO"):', this.authService.hasRole('DEMO'));
    
    const hasRequiredRole = requiredRoles.some(role => {
      switch (role) {
        case 'Administrador':
        case 'ADMINISTRADOR':
          return this.authService.isAdmin();
        case 'RRHH':
          return this.authService.isRRHH();
        case 'Gerencia':
        case 'GERENCIA':
          return this.authService.isGerencia();
        case 'Contabilidad':
        case 'CONTABILIDAD':
          return this.authService.isContabilidad();
        case 'DEMO':
        case 'demo':
          const isDemo = this.authService.isDemo();
          console.log('🔍 RoleGuard - Verificando DEMO:', isDemo);
          return isDemo;
        default:
          return this.authService.hasRole(role);
      }
    });
    
    console.log('🔍 RoleGuard - hasRequiredRole:', hasRequiredRole);

    if (!hasRequiredRole) {
      // Usuario no tiene permisos, redirigir al dashboard
      console.warn(`❌ Usuario ${currentUser.username} (${currentUser.rol}) no tiene permisos para acceder a ${state.url}`);
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}
