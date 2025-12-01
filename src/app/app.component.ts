// src/app/app.component.ts

import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/auth.service';
import { ConsoleErrorHandlerService } from './services/console-error-handler.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'mi-sistema-planillas';
  isAuthenticated: boolean = false;
  isCheckingAuth: boolean = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private consoleErrorHandler: ConsoleErrorHandlerService // Inyectar servicio de manejo de errores
  ) {
    // Cargar tema guardado INMEDIATAMENTE
    this.loadAndApplyTheme();
    
    // Verificar autenticación ANTES de que se inicialice el componente
    this.checkAuthBeforeInit();
    
    // El servicio ConsoleErrorHandlerService se inicializa automáticamente
    // al ser inyectado, manejando errores de consola silenciosamente
  }

  /**
   * Carga y aplica el tema guardado en localStorage
   */
  private loadAndApplyTheme(): void {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const theme = savedTheme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    console.log('🎨 Tema cargado:', theme);
  }

  private checkAuthBeforeInit(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        // Verificar si el token es válido
        if (this.isTokenValid(token)) {
          this.isAuthenticated = true;
        } else {
          // Token expirado
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          this.isAuthenticated = false;
        }
      } catch (error) {
        this.isAuthenticated = false;
      }
    } else {
      this.isAuthenticated = false;
    }
    
    // Siempre marcar como no verificando después de la verificación inicial
    this.isCheckingAuth = false;
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = this.parseJwt(token);
      const currentTime = Date.now() / 1000;
      return payload.exp && payload.exp > currentTime;
    } catch (error) {
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

  ngOnInit(): void {
    // Suscribirse a cambios en el estado de autenticación
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }
}