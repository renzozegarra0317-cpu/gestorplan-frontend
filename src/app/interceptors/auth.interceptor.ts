import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(private router: Router) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    
    // Headers base
    const headers: { [key: string]: string } = {};
    
    // Agregar header para ngrok (evita el banner de advertencia)
    if (req.url.includes('ngrok-free.dev') || req.url.includes('ngrok.io')) {
      headers['ngrok-skip-browser-warning'] = 'true';
    }
    
    // Si hay token, agregarlo a los headers
    if (token) {
      // Verificar si el token está expirado antes de agregarlo
      if (this.isTokenExpired(token)) {
        console.warn('⚠️ Token expirado, limpiando sesión');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
        return throwError(() => new Error('Token expirado'));
      }
      
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Clonar la request con los headers
    const modifiedReq = req.clone({
      setHeaders: headers
    });
    
    return next.handle(modifiedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si el error es 401 o 403, limpiar sesión y redirigir
        // EXCEPCIONES: No redirigir si es un error de:
        // 1. Verificación de PIN (errores esperados)
        // 2. Consulta a RENIEC (errores de integración, no de autenticación)
        const esVerificacionPIN = error.url?.includes('/verificar-pin');
        const esConsultaRENIEC = error.url?.includes('/reniec/') || error.url?.includes('/trabajadores/reniec/');
        
        if ((error.status === 401 || error.status === 403) && !esVerificacionPIN && !esConsultaRENIEC) {
          console.error('❌ Error de autenticación:', error.status);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
  
  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.parseJwt(token);
      if (!payload.exp) return false;
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
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
}
