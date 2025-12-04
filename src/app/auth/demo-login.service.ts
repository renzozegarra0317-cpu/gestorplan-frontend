// frontend/src/app/auth/demo-login.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface DemoUser {
  UsuarioID: number;
  Username: string;
  Email: string;
  Nombre: string;
  Apellidos: string;
  Rol: string;
  EsDemo: boolean;
  FechaInicioDemo: string;
  FechaFinDemo: string;
  HorasRestantes: number;
  MinutosRestantes: number;
}

@Injectable({
  providedIn: 'root'
})
export class DemoLoginService {
  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista de usuarios DEMO disponibles desde el backend
   */
  getAvailableDemoUsers(): Observable<DemoUser[]> {
    return this.http.get<any>(`${environment.apiUrl}/usuarios/demo`).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        return [];
      })
    );
  }

  /**
   * Realiza el login DEMO
   */
  loginDemo(username: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/login`, {
      username,
      password
    });
  }
}
