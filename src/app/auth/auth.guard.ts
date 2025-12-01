import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    
    // Verificar si hay token en localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      // Verificar si el token es válido (no expirado)
      try {
        const payload = this.parseJwt(token);
        const currentTime = Date.now() / 1000;
        
        if (payload.exp && payload.exp > currentTime) {
          // Token válido, permitir acceso
          return true;
        } else {
          // Token expirado, limpiar y redirigir
          this.clearAuthData();
          this.router.navigate(['/login'], { 
            queryParams: { returnUrl: state.url },
            queryParamsHandling: 'merge'
          });
          return false;
        }
      } catch (error) {
        // Token inválido, limpiar y redirigir
        this.clearAuthData();
        this.router.navigate(['/login'], { 
          queryParams: { returnUrl: state.url },
          queryParamsHandling: 'merge'
        });
        return false;
      }
    } else {
      // No hay token, redirigir al login
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url },
        queryParamsHandling: 'merge'
      });
      return false;
    }
  }

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

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
  }
}
