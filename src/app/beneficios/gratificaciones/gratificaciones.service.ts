import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FiltrosGratificaciones } from './gratificaciones.interface';

@Injectable({
  providedIn: 'root'
})
export class GratificacionesService {
  private apiUrl = `${environment.apiUrl}/beneficios/gratificaciones`;

  constructor(private http: HttpClient) {}

  // =====================================================
  // LISTAR GRATIFICACIONES
  // =====================================================
  listar(filtros: FiltrosGratificaciones): Observable<any> {
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
  // OBTENER TRABAJADORES DISPONIBLES
  // =====================================================
  obtenerTrabajadoresDisponibles(periodo: string, anio: number): Observable<any> {
    const params = new HttpParams()
      .set('periodo', periodo)
      .set('anio', anio.toString());

    return this.http.get<any>(`${this.apiUrl}/trabajadores-disponibles`, { params });
  }

  // =====================================================
  // CALCULAR GRATIFICACIÓN MASIVA
  // =====================================================
  calcularMasivo(datos: { trabajadores: number[]; periodo: string; anio: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/calcular-masivo`, datos);
  }

  // =====================================================
  // APROBAR GRATIFICACIÓN
  // =====================================================
  aprobar(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/aprobar`, {});
  }

  // =====================================================
  // OBTENER GRATIFICACIÓN POR ID
  // =====================================================
  obtenerPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // =====================================================
  // MARCAR COMO PAGADA
  // =====================================================
  pagar(id: number, numeroComprobante: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/pagar`, { numeroComprobante });
  }

  // =====================================================
  // ELIMINAR GRATIFICACIÓN
  // =====================================================
  eliminar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}

