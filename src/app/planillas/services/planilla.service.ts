// src/app/planillas/services/planilla.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GenerarPlanillaDTO {
  año: number;
  mes: number;
  tipoPlanilla: string;
  trabajadores: number[];
  diasTrabajados?: number;
  areas?: string[];
  tiposContrato?: string[];
}

export interface Planilla {
  PlanillaID: number;
  Codigo: string;
  Periodo: string;
  Año: number;
  Mes: number;
  TipoPlanilla: string;
  Estado: string;
  NumeroTrabajadores: number;
  TotalIngresos: number;
  TotalDescuentos: number;
  TotalAportes: number;
  NetoPagar: number;
  FechaGeneracion: string;
  UsuarioCreacion: string;
  detalle?: DetallePlanilla[];
}

export interface DetallePlanilla {
  DetalleID: number;
  TrabajadorID: number;
  DNI: string;
  NombreCompleto: string;
  Cargo: string;
  Area: string;
  DiasLaborados: number;
  HorasExtras: number;
  RemuneracionBasica: number;
  TotalIngresos: number;
  TotalDescuentos: number;
  NetoPagar: number;
  AFP: number;
  ONP: number;
  QuintaCategoria: number;
  AporteEsSalud: number;
  Banco: string;
  NumeroCuenta: string;
  CCI: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlanillaService {
  private apiUrl = `${environment.apiUrl}/planillas`;

  constructor(private http: HttpClient) {}

  /**
   * Generar nueva planilla
   */
  generarPlanilla(data: GenerarPlanillaDTO): Observable<any> {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.post(`${this.apiUrl}/generar`, data, { headers });
  }

  /**
   * Obtener todas las planillas con filtros opcionales
   */
  obtenerTodas(filtros?: {
    año?: number;
    mes?: number;
    tipoPlanilla?: string;
    estado?: string;
  }): Observable<any> {
    let params = new HttpParams();
    
    if (filtros?.año) {
      params = params.set('año', filtros.año.toString());
    }
    if (filtros?.mes) {
      params = params.set('mes', filtros.mes.toString());
    }
    if (filtros?.tipoPlanilla) {
      params = params.set('tipoPlanilla', filtros.tipoPlanilla);
    }
    if (filtros?.estado) {
      params = params.set('estado', filtros.estado);
    }
    
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get(`${this.apiUrl}`, { headers, params });
  }

  /**
   * Obtener planilla por ID con detalle completo
   */
  obtenerPorId(id: number): Observable<any> {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get(`${this.apiUrl}/${id}`, { headers });
  }

  /**
   * Aprobar planilla
   */
  aprobarPlanilla(id: number): Observable<any> {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.put(`${this.apiUrl}/${id}/aprobar`, {}, { headers });
  }

  /**
   * Anular planilla
   */
  anularPlanilla(id: number, motivo: string): Observable<any> {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.put(`${this.apiUrl}/${id}/anular`, { motivo }, { headers });
  }

  /**
   * Obtener estadísticas
   */
  obtenerEstadisticas(año?: number): Observable<any> {
    let params = new HttpParams();
    if (año) {
      params = params.set('año', año.toString());
    }
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get(`${this.apiUrl}/estadisticas/resumen`, { headers, params });
  }

  /**
   * Exportar planilla a Excel
   */
  exportarExcel(id: number): Observable<Blob> {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get(`${this.apiUrl}/${id}/exportar/excel`, {
      headers,
      responseType: 'blob'
    });
  }

  /**
   * Generar TXT para bancos
   */
  generarTxtBancos(id: number): Observable<Blob> {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get(`${this.apiUrl}/${id}/exportar/txt-bancos`, {
      headers,
      responseType: 'blob'
    });
  }
}