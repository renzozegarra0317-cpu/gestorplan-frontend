import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { provideHttpClient, HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { routes } from './app.routes';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ResourceErrorInterceptor } from './interceptors/resource-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules)  // ← PRECARGA TODOS LOS MÓDULOS
    ),
    // Usar HashLocationStrategy para GitHub Pages (rutas con #)
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    // Habilitar HttpClient y que use interceptores registrados vía DI (HTTP_INTERCEPTORS)
    provideHttpClient(withInterceptorsFromDi()),
    // Animaciones para Angular Material y otros componentes
    provideAnimations(),
    // Configuración de Toastr (notificaciones)
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,
      closeButton: true
    }),
    // Interceptores HTTP - Orden importante: primero ResourceError, luego Auth
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ResourceErrorInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};