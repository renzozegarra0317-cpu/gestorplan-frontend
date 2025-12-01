import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardData {
  kpis: {
    totalTrabajadores: number;
    planillaActual: number;
    contratosCASPorVencer: number;
    vacacionesPendientes: number;
    asistenciaHoy: string;
    tardanzasMes: number;
    ctsDepositado: number;
    nuevosIngresos: number;
  };
  evolucionPlanilla: {
    labels: string[];
    valores: number[];
  };
  distribucionArea: {
    labels: string[];
    valores: number[];
  };
  distribucionContratos: {
    labels: string[];
    valores: number[];
  };
  asistenciaSemanal: {
    labels: string[];
    valores: number[];
  };
  movimientos: any[];
  topTrabajadores: any[];
  alertas: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los datos del dashboard
   */
  obtenerDashboardCompleto(filtros?: any): Observable<any> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.fechaInicio) params = params.set('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) params = params.set('fechaFin', filtros.fechaFin);
      if (filtros.area && filtros.area !== 'todas') params = params.set('area', filtros.area);
      if (filtros.tipoContrato && filtros.tipoContrato !== 'todos') params = params.set('tipoContrato', filtros.tipoContrato);
      if (filtros.estado && filtros.estado !== 'todos') params = params.set('estado', filtros.estado);
    }

    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get<any>(`${this.apiUrl}/completo`, { headers, params });
  }

  /**
   * Obtener solo KPIs
   */
  obtenerEstadisticas(filtros?: any): Observable<any> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.fechaInicio) params = params.set('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) params = params.set('fechaFin', filtros.fechaFin);
      if (filtros.area && filtros.area !== 'todas') params = params.set('area', filtros.area);
      if (filtros.tipoContrato && filtros.tipoContrato !== 'todos') params = params.set('tipoContrato', filtros.tipoContrato);
      if (filtros.estado && filtros.estado !== 'todos') params = params.set('estado', filtros.estado);
    }

    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get<any>(`${this.apiUrl}/estadisticas`, { headers, params });
  }

  /**
   * Obtener evolución de planilla
   */
  obtenerEvolucionPlanilla(): Observable<any> {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get<any>(`${this.apiUrl}/evolucion-planilla`, { headers });
  }

  /**
   * Obtener distribución por área
   */
  obtenerDistribucionArea(): Observable<any> {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get<any>(`${this.apiUrl}/distribucion-area`, { headers });
  }

  /**
   * Obtener distribución de contratos
   */
  obtenerDistribucionContratos(): Observable<any> {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get<any>(`${this.apiUrl}/distribucion-contratos`, { headers });
  }

  /**
   * Obtener asistencia semanal
   */
  obtenerAsistenciaSemanal(): Observable<any> {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get<any>(`${this.apiUrl}/asistencia-semanal`, { headers });
  }

  /**
   * Obtener últimos movimientos
   */
  obtenerMovimientos(): Observable<any> {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get<any>(`${this.apiUrl}/movimientos`, { headers });
  }

  /**
   * Obtener top trabajadores
   */
  obtenerTopTrabajadores(): Observable<any> {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get<any>(`${this.apiUrl}/top-trabajadores`, { headers });
  }

  /**
   * Obtener alertas
   */
  obtenerAlertas(): Observable<any> {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get<any>(`${this.apiUrl}/alertas`, { headers });
  }

  /**
   * Obtener configuración activa del sistema
   */
  obtenerConfiguracion(): Observable<any> {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get<any>(`${environment.apiUrl}/configuracion/activa`, { headers });
  }

  /**
   * Obtener detalle de asistencia de hoy
   */
  obtenerDetalleAsistenciaHoy(): Observable<any> {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get<any>(`${this.apiUrl}/detalle-asistencia-hoy`, { headers });
  }
}



