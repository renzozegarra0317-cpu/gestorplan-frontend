import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

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

    // Verificar si es administrador, DEMO, o tiene permisos de configuración
    const tienePermisosConfiguracion = this.authService.canView('configuracion') || 
                                       this.authService.canEdit('configuracion');
    
    if (!this.authService.isAdmin() && !this.authService.isDemo() && !tienePermisosConfiguracion) {
      const currentUser = this.authService.getCurrentUser();
      console.warn(`❌ Usuario ${currentUser?.username} (${currentUser?.rol}) no tiene permisos de administrador para acceder a ${state.url}`);
      
      // Redirigir al dashboard
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}
