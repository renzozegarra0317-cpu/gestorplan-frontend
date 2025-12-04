/**
 * =====================================================
 * SERVICIO PARA MANEJO CENTRALIZADO DE ERRORES DE CONSOLA
 * =====================================================
 * 
 * Este servicio maneja errores de consola de forma silenciosa
 * sin afectar la funcionalidad de la aplicación.
 * 
 * PRINCIPIOS:
 * - No rompe funcionalidad existente
 * - Escalable y mantenible
 * - Fácil de deshabilitar si es necesario
 */

import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConsoleErrorHandlerService {
  private readonly ignoredErrors: string[] = [
    'chrome-extension://',
    'Failed to execute \'put\' on \'Cache\'',
    'Failed to convert value to \'Response\'',
    'fonts.googleapis.com',
    'net::ERR_FAILED',
    'The FetchEvent for'
  ];

  private isInitialized = false;

  constructor() {
    if (!this.isInitialized) {
      this.initialize();
    }
  }

  /**
   * Inicializa el manejo de errores de consola
   * Solo se ejecuta una vez
   */
  private initialize(): void {
    if (this.isInitialized) return;
    
    this.isInitialized = true;

    // Interceptar errores de consola (solo en desarrollo para evitar spam)
    if (!environment.production) {
      this.interceptConsoleErrors();
    }
    
    // SIEMPRE eliminar service workers (tanto en desarrollo como producción)
    // Esto es crítico para evitar problemas de cacheo de APIs y congelamiento
    this.handleServiceWorkerErrors();
  }

  /**
   * Intercepta errores de consola y los filtra silenciosamente
   */
  private interceptConsoleErrors(): void {
    const originalError = console.error;
    const originalWarn = console.warn;

    // Interceptar console.error
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      
      // Si es un error ignorado, no mostrarlo
      if (this.shouldIgnoreError(message)) {
        return; // Silenciar el error
      }
      
      // Para otros errores, mostrar normalmente
      originalError.apply(console, args);
    };

    // Interceptar console.warn
    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      
      // Si es un warning ignorado, no mostrarlo
      if (this.shouldIgnoreError(message)) {
        return; // Silenciar el warning
      }
      
      // Para otros warnings, mostrar normalmente
      originalWarn.apply(console, args);
    };
  }

  /**
   * Maneja errores de service workers de forma segura
   * ELIMINA TODOS LOS SERVICE WORKERS (incluyendo PWA/ngsw)
   */
  private handleServiceWorkerErrors(): void {
    if (!('serviceWorker' in navigator)) return;

    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.cleanupServiceWorkers());
    } else {
      this.cleanupServiceWorkers();
    }
  }

  /**
   * Limpia TODOS los service workers de forma segura
   * Esto incluye service workers de PWA, ngsw, y cualquier otro
   */
  private async cleanupServiceWorkers(): Promise<void> {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      // ELIMINAR TODOS LOS SERVICE WORKERS (no solo externos)
      for (const registration of registrations) {
        try {
          await registration.unregister();
          console.log('✅ Service Worker eliminado:', registration.scope);
        } catch (error) {
          // Ignorar errores al desregistrar
        }
      }

      // También limpiar caches relacionados con ngsw
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          for (const cacheName of cacheNames) {
            // Eliminar todos los caches que empiecen con 'ngsw:' o sean de service workers
            if (cacheName.startsWith('ngsw:') || cacheName.includes('service-worker')) {
              await caches.delete(cacheName);
              console.log('✅ Cache eliminado:', cacheName);
            }
          }
        } catch (error) {
          // Ignorar errores al limpiar caches
        }
      }
    } catch (error) {
      // Ignorar errores silenciosamente
    }
  }

  /**
   * Verifica si un error debe ser ignorado
   */
  private shouldIgnoreError(message: string): boolean {
    return this.ignoredErrors.some(ignored => 
      message.includes(ignored)
    );
  }


  /**
   * Método público para agregar errores a ignorar (escalable)
   */
  addIgnoredError(pattern: string): void {
    if (!this.ignoredErrors.includes(pattern)) {
      this.ignoredErrors.push(pattern);
    }
  }

  /**
   * Método público para remover errores ignorados
   */
  removeIgnoredError(pattern: string): void {
    const index = this.ignoredErrors.indexOf(pattern);
    if (index > -1) {
      this.ignoredErrors.splice(index, 1);
    }
  }
}

