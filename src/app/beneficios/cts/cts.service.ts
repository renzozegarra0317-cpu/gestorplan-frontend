import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RegistroCTS, FiltrosCTS, ResumenCTS } from './cts.interface';

@Injectable({
  providedIn: 'root'
})
export class CtsService {
  private apiUrl = `${environment.apiUrl}/beneficios/cts`;

  constructor(private http: HttpClient) {}

  // =====================================================
  // LISTAR CTS
  // =====================================================
  listar(filtros: FiltrosCTS): Observable<any> {
    let params = new HttpParams();
    
    if (filtros.anio) {
      params = params.set('anio', filtros.anio.toString());
    }
    if (filtros.periodo && filtros.periodo !== 'Todos') {
      params = params.set('periodo', filtros.periodo);
    }
    if (filtros.estado && filtros.estado !== 'Todos') {
      params = params.set('estado', filtros.estado);
    }
    if (filtros.area && filtros.area !== 'Todas') {
      params = params.set('area', filtros.area);
    }
    if (filtros.busqueda) {
      params = params.set('busqueda', filtros.busqueda);
    }
    
    return this.http.get<any>(this.apiUrl, { params });
  }

  // =====================================================
  // OBTENER POR ID
  // =====================================================
  obtenerPorId(ctsId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${ctsId}`);
  }

  // =====================================================
  // OBTENER RESUMEN
  // =====================================================
  obtenerResumen(anio?: number): Observable<any> {
    let params = new HttpParams();
    if (anio) {
      params = params.set('anio', anio.toString());
    }
    return this.http.get<any>(`${this.apiUrl}/resumen`, { params });
  }

  // =====================================================
  // CALCULAR CTS
  // =====================================================
  calcular(datos: { trabajadorId: number; periodo: string; anio: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/calcular`, datos);
  }

  // =====================================================
  // CALCULAR CTS MASIVO
  // =====================================================
  calcularMasivo(datos: { trabajadorIds: number[]; periodo: string; anio: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/calcular-masivo`, datos);
  }

  // =====================================================
  // APROBAR CTS
  // =====================================================
  aprobar(ctsId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${ctsId}/aprobar`, {});
  }

  // =====================================================
  // DEPOSITAR CTS
  // =====================================================
  depositar(ctsId: number, datos: { numeroComprobante: string; fechaDeposito?: Date }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${ctsId}/depositar`, datos);
  }

  // =====================================================
  // OBTENER TRABAJADORES DISPONIBLES
  // =====================================================
  obtenerTrabajadoresDisponibles(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/trabajadores-disponibles`);
  }
}



