import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RrhhGuard implements CanActivate {

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

    // Verificar si es RRHH, Administrador, DEMO, o tiene permisos de trabajadores
    const tienePermisosTrabajadores = this.authService.canView('trabajadores') || 
                                       this.authService.canCreate('trabajadores') ||
                                       this.authService.canEdit('trabajadores');
    
    if (!this.authService.isRRHH() && !this.authService.isDemo() && !tienePermisosTrabajadores) {
      const currentUser = this.authService.getCurrentUser();
      console.warn(`❌ Usuario ${currentUser?.username} (${currentUser?.rol}) no tiene permisos de RRHH para acceder a ${state.url}`);
      
      // Redirigir al dashboard
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}
