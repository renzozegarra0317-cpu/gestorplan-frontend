import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VacacionesService {
  private apiUrl = `${environment.apiUrl}/beneficios/vacaciones`;

  constructor(private http: HttpClient) {}

  // =====================================================
  // LISTAR VACACIONES
  // =====================================================
  listar(filtros: any = {}): Observable<any> {
    let params = new HttpParams();
    
    if (filtros.anio) {
      params = params.set('anio', filtros.anio.toString());
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
    
    return this.http.get<any>(`${this.apiUrl}`, { params });
  }

  // =====================================================
  // OBTENER VACACIÓN POR ID
  // =====================================================
  obtenerPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // =====================================================
  // OBTENER TRABAJADORES DISPONIBLES
  // =====================================================
  obtenerTrabajadoresDisponibles(anio?: number): Observable<any> {
    let params = new HttpParams();
    if (anio) {
      params = params.set('anio', anio.toString());
    }
    return this.http.get<any>(`${this.apiUrl}/trabajadores-disponibles`, { params });
  }

  // =====================================================
  // PROGRAMAR VACACIONES
  // =====================================================
  programar(datos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/programar`, datos);
  }

  // =====================================================
  // APROBAR VACACIONES
  // =====================================================
  aprobar(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/aprobar`, {});
  }

  // =====================================================
  // INICIAR GOCE
  // =====================================================
  iniciarGoce(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/iniciar-goce`, {});
  }

  // =====================================================
  // FINALIZAR GOCE
  // =====================================================
  finalizarGoce(id: number, datos: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/finalizar-goce`, datos);
  }

  // =====================================================
  // MARCAR COMO PAGADA
  // =====================================================
  pagar(id: number, numeroComprobante?: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/pagar`, { numeroComprobante });
  }

  // =====================================================
  // OBTENER RESUMEN
  // =====================================================
  obtenerResumen(filtros: any = {}): Observable<any> {
    let params = new HttpParams();
    
    if (filtros.anio) {
      params = params.set('anio', filtros.anio.toString());
    }
    if (filtros.estado && filtros.estado !== 'Todos') {
      params = params.set('estado', filtros.estado);
    }
    if (filtros.area && filtros.area !== 'Todas') {
      params = params.set('area', filtros.area);
    }
    
    return this.http.get<any>(`${this.apiUrl}/resumen`, { params });
  }

  // =====================================================
  // ELIMINAR VACACIÓN
  // =====================================================
  eliminar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}







