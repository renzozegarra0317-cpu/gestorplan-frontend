/**
 * =====================================================
 * INTERCEPTOR PARA MANEJAR ERRORES DE RECURSOS EXTERNOS
 * =====================================================
 * 
 * Este interceptor maneja errores de recursos externos
 * (Google Fonts, extensiones, etc.) sin afectar la
 * funcionalidad de la aplicación.
 * 
 * PRINCIPIOS:
 * - No rompe funcionalidad existente
 * - Escalable y mantenible
 * - Fácil de deshabilitar si es necesario
 */

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class ResourceErrorInterceptor implements HttpInterceptor {
  
  // Recursos externos que pueden fallar sin afectar la app
  private readonly ignoredResources: string[] = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'chrome-extension://'
  ];

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Verificar si es un recurso externo que puede fallar
        if (this.isIgnoredResource(error.url || '')) {
          // En desarrollo, loguear silenciosamente
          if (!environment.production) {
            // No hacer nada, solo ignorar el error
          }
          // Retornar un error silencioso que no rompa la app
          return throwError(() => error);
        }
        
        // Para otros errores, manejarlos normalmente
        return throwError(() => error);
      })
    );
  }

  /**
   * Verifica si un recurso debe ser ignorado
   */
  private isIgnoredResource(url: string): boolean {
    if (!url) return false;
    
    return this.ignoredResources.some(resource => 
      url.includes(resource)
    );
  }

  /**
   * Método público para agregar recursos ignorados (escalable)
   */
  addIgnoredResource(pattern: string): void {
    if (!this.ignoredResources.includes(pattern)) {
      this.ignoredResources.push(pattern);
    }
  }
}

