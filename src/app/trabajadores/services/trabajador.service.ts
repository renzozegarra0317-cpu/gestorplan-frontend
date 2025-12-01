// src/app/services/trabajador.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Trabajador, Area, Cargo } from '../trabajador.interface';

@Injectable({
  providedIn: 'root'
})
export class TrabajadorService {
  
  private apiUrl = `${environment.apiUrl}/trabajadores`;

  constructor(private http: HttpClient) { }

  consultarRENIEC(dni: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reniec/${dni}`);
  }

  crearTrabajador(trabajador: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, trabajador);
  }

  obtenerTrabajadores(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  obtenerTrabajadorPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  actualizarTrabajador(id: number, trabajador: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, trabajador);
  }

  eliminarTrabajador(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  obtenerAreas(): Observable<any> {
    const areas: Area[] = [
      { areaID: 1, codigo: 'GM', nombre: 'Gerencia Municipal', icono: '🏛️', color: '#3b82f6' },
      { areaID: 2, codigo: 'RRHH', nombre: 'Recursos Humanos', icono: '👥', color: '#22c55e' },
      { areaID: 3, codigo: 'ADMIN', nombre: 'Administración', icono: '📋', color: '#f59e0b' },
      { areaID: 4, codigo: 'FIN', nombre: 'Finanzas', icono: '💰', color: '#8b5cf6' },
      { areaID: 5, codigo: 'OBRAS', nombre: 'Obras y Desarrollo', icono: '🏗️', color: '#ec4899' },
      { areaID: 6, codigo: 'SERV', nombre: 'Servicios Públicos', icono: '🌳', color: '#14b8a6' },
      { areaID: 7, codigo: 'TI', nombre: 'Tecnología', icono: '💻', color: '#06b6d4' },
      { areaID: 8, codigo: 'LEGAL', nombre: 'Asesoría Legal', icono: '⚖️', color: '#f97316' }
    ];
    return of({ success: true, data: areas });
  }

  obtenerCargos(): Observable<any> {
    const cargos: Cargo[] = [
      { cargoID: 1, codigo: 'GER-001', nombre: 'Gerente Municipal', salarioMinimo: 12000, salarioMaximo: 15000 },
      { cargoID: 2, codigo: 'GER-002', nombre: 'Gerente de RRHH', salarioMinimo: 9000, salarioMaximo: 11000 },
      { cargoID: 3, codigo: 'GER-003', nombre: 'Gerente de Finanzas', salarioMinimo: 9000, salarioMaximo: 11000 },
      { cargoID: 4, codigo: 'JEFE-001', nombre: 'Jefe de Administración', salarioMinimo: 7000, salarioMaximo: 9000 },
      { cargoID: 5, codigo: 'ESP-001', nombre: 'Especialista en Planillas', salarioMinimo: 5000, salarioMaximo: 7000 },
      { cargoID: 6, codigo: 'ESP-002', nombre: 'Especialista Contable', salarioMinimo: 5000, salarioMaximo: 7000 },
      { cargoID: 7, codigo: 'ASI-001', nombre: 'Asistente Administrativo', salarioMinimo: 3000, salarioMaximo: 4500 },
      { cargoID: 8, codigo: 'ASI-002', nombre: 'Asistente de RRHH', salarioMinimo: 3000, salarioMaximo: 4500 }
    ];
    return of({ success: true, data: cargos });
  }
}