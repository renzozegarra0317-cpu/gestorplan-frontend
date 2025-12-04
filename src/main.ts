import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

/**
 * =====================================================
 * INICIALIZACIÓN DE LA APLICACIÓN
 * =====================================================
 * 
 * NOTA: El manejo de errores de consola se hace a través
 * del servicio ConsoleErrorHandlerService que se inicializa
 * automáticamente al inyectarse en AppComponent.
 */

bootstrapApplication(AppComponent, appConfig)
  .catch(err => {
    // Solo loguear errores críticos de inicialización
    // Los errores de consola menores se manejan en ConsoleErrorHandlerService
    if (!err.message?.includes('chrome-extension') && 
        !err.message?.includes('fonts.googleapis.com')) {
      console.error('❌ Error crítico al inicializar la aplicación:', err);
    }
  });