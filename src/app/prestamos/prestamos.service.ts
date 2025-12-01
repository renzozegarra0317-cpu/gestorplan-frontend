import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EntidadFinanciera {
  EntidadID: number;
  Codigo: string;
  Nombre: string;
  TipoEntidad: string;
  RUC?: string;
  Telefono?: string;
  Email?: string;
  Activo: boolean;
}

export interface Prestamo {
  PrestamoID: number;
  TrabajadorID: number;
  NombreCompleto?: string;
  NumeroDocumento?: string;
  Cargo?: string;
  EntidadID: number;
  EntidadFinanciera: string;
  TipoEntidad: string;
  NumeroContrato: string;
  TipoPrestamo: string;
  MontoTotal: number;
  MontoDesembolsado: number;
  TEA?: number;
  TEM?: number;
  NumeroCuotas: number;
  MontoCuota: number;
  FrecuenciaPago: string;
  FechaDesembolso: string;
  FechaInicioPago: string;
  FechaFinPago?: string;
  Estado: string;
  MotivoEstado?: string;
  CuotasPagadas: number;
  CuotasPendientes: number;
  SaldoCapital?: number;
  SaldoPendiente: number;
  DescuentoAutomatico: boolean;
  CodigoDescuento: string;
  Observaciones?: string;
  ProximaFechaPago?: string;
  ProximoMontoPago?: number;
}

export interface Cuota {
  CuotaID: number;
  PrestamoID: number;
  NumeroCuota: number;
  FechaVencimiento: string;
  FechaPago?: string;
  MontoCapital: number;
  MontoInteres: number;
  MontoSeguro: number;
  MontoCuota: number;
  Estado: string;
  DiasAtraso: number;
  MoraPagada: number;
  PlanillaID?: number;
  CodigoPlanilla?: string;
  Observaciones?: string;
}

export interface CrearPrestamoDto {
  trabajadorID: number;
  entidadID: number;
  numeroContrato: string;
  tipoPrestamo: string;
  montoTotal: number;
  montoDesembolsado?: number;
  tea?: number;
  tem?: number;
  numeroCuotas: number;
  montoCuota: number;
  frecuenciaPago?: string;
  fechaDesembolso: string;
  fechaInicioPago: string;
  descuentoAutomatico?: boolean;
  observaciones?: string;
}

export interface LiquidarPrestamoDto {
  saldoCapitalPendiente: number;
  interesesPendientes?: number;
  moraPendiente?: number;
  otrosCargos?: number;
  montoTotalLiquidado: number;
  tipoLiquidacion: string;
  formaPago: string;
  fechaLiquidacion: string;
  numeroComprobante?: string;
  observaciones?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PrestamosService {
  private apiUrl = 'http://localhost:5000/api/prestamos';

  constructor(private http: HttpClient) {}

  // ==========================================
  // PRÉSTAMOS
  // ==========================================

  obtenerTodos(filtros?: {
    trabajadorID?: number;
    entidadID?: number;
    estado?: string;
    tipoPrestamo?: string;
  }): Observable<any> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.trabajadorID) params = params.set('trabajadorID', filtros.trabajadorID.toString());
      if (filtros.entidadID) params = params.set('entidadID', filtros.entidadID.toString());
      if (filtros.estado) params = params.set('estado', filtros.estado);
      if (filtros.tipoPrestamo) params = params.set('tipoPrestamo', filtros.tipoPrestamo);
    }

    return this.http.get<any>(this.apiUrl, { params });
  }

  obtenerPorID(prestamoID: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${prestamoID}`);
  }

  obtenerPorTrabajador(trabajadorID: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/trabajador/${trabajadorID}`);
  }

  crear(datos: CrearPrestamoDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, datos);
  }

  verificarPIN(prestamoID: number, pin: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${prestamoID}/verificar-pin`, { pin });
  }

  actualizar(prestamoID: number, datos: Partial<Prestamo>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${prestamoID}`, datos);
  }

  actualizarCuotas(prestamoID: number, cuotas: any[]): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${prestamoID}/cuotas`, { cuotas });
  }

  liquidar(prestamoID: number, datos: LiquidarPrestamoDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${prestamoID}/liquidar`, datos);
  }

  obtenerCronograma(prestamoID: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${prestamoID}/cronograma`);
  }

  obtenerEstadisticas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/estadisticas`);
  }

  // ==========================================
  // ENTIDADES FINANCIERAS
  // ==========================================

  obtenerEntidades(filtros?: { tipo?: string; activo?: boolean }): Observable<any> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.tipo) params = params.set('tipo', filtros.tipo);
      if (filtros.activo !== undefined) params = params.set('activo', filtros.activo.toString());
    }

    return this.http.get<any>(`${this.apiUrl}/entidades`, { params });
  }

  crearEntidad(datos: Partial<EntidadFinanciera>): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/entidades`, datos);
  }

  actualizarEntidad(entidadID: number, datos: Partial<EntidadFinanciera>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/entidades/${entidadID}`, datos);
  }

  obtenerTiposEntidades(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/entidades/tipos`);
  }
}




