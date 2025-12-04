import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BoletaPago, FiltrosBoletas, ResumenBoletas } from './boletas.interface';

@Injectable({
  providedIn: 'root'
})
export class BoletasService {
  private apiUrl = `${environment.apiUrl}/boletas`;

  constructor(private http: HttpClient) {}

  // =====================================================
  // OBTENER TODAS LAS BOLETAS
  // =====================================================
  obtenerTodas(filtros: FiltrosBoletas): Observable<{success: boolean, data: BoletaPago[], total: number}> {
    let params = new HttpParams();
    
    if (filtros.anio) params = params.set('anio', filtros.anio.toString());
    if (filtros.mes && filtros.mes > 0) params = params.set('mes', filtros.mes.toString());
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.busqueda) params = params.set('busqueda', filtros.busqueda);
    if (filtros.area) params = params.set('area', filtros.area);
    if (filtros.tipoContrato) params = params.set('tipoContrato', filtros.tipoContrato);

    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get<{success: boolean, data: BoletaPago[], total: number}>(this.apiUrl, { headers, params });
  }

  // =====================================================
  // OBTENER BOLETA POR ID
  // =====================================================
  obtenerPorId(id: number): Observable<{success: boolean, data: BoletaPago}> {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get<{success: boolean, data: BoletaPago}>(`${this.apiUrl}/${id}`, { headers });
  }

  // =====================================================
  // OBTENER ESTADÍSTICAS
  // =====================================================
  obtenerEstadisticas(filtros: Partial<FiltrosBoletas>): Observable<{success: boolean, data: ResumenBoletas}> {
    let params = new HttpParams();
    
    if (filtros.anio) params = params.set('anio', filtros.anio.toString());
    if (filtros.mes && filtros.mes > 0) params = params.set('mes', filtros.mes.toString());
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.area) params = params.set('area', filtros.area);

    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get<{success: boolean, data: ResumenBoletas}>(`${this.apiUrl}/estadisticas`, { headers, params });
  }

  // =====================================================
  // MARCAR BOLETA COMO ENVIADA
  // =====================================================
  marcarComoEnviada(id: number): Observable<{success: boolean, message: string}> {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.put<{success: boolean, message: string}>(`${this.apiUrl}/${id}/enviar`, {}, { headers });
  }

  // =====================================================
  // MARCAR BOLETA COMO DESCARGADA
  // =====================================================
  marcarComoDescargada(id: number): Observable<{success: boolean, message: string}> {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.put<{success: boolean, message: string}>(`${this.apiUrl}/${id}/descargar`, {}, { headers });
  }

  // =====================================================
  // ENVÍO MASIVO DE BOLETAS
  // =====================================================
  envioMasivo(boletas: number[], metodo: 'email' | 'sistema', asunto?: string, mensaje?: string): Observable<{success: boolean, message: string, data: any}> {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.post<{success: boolean, message: string, data: any}>(`${this.apiUrl}/envio-masivo`, {
      boletas,
      metodo,
      asunto,
      mensaje
    }, { headers });
  }

  // =====================================================
  // EXPORTAR A EXCEL
  // =====================================================
  exportarExcel(filtros: Partial<FiltrosBoletas>): Observable<{success: boolean, message: string, data: any}> {
    let params = new HttpParams();
    
    if (filtros.anio) params = params.set('anio', filtros.anio.toString());
    if (filtros.mes && filtros.mes > 0) params = params.set('mes', filtros.mes.toString());
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.area) params = params.set('area', filtros.area);

    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get<{success: boolean, message: string, data: any}>(`${this.apiUrl}/exportar/excel`, { headers, params });
  }

  // =====================================================
  // GENERAR PDF DE BOLETA
  // =====================================================
  generarPDF(id: number): Observable<{success: boolean, message: string, data: any}> {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    return this.http.get<{success: boolean, message: string, data: any}>(`${this.apiUrl}/${id}/pdf`, { headers });
  }
}
