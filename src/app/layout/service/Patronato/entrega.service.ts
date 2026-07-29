import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/enviroments';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { DetalleEntrega, Entrega } from '../../../interface/Entrega.interface';

@Injectable({
  providedIn: 'root'
})
export class EntregaService {

  private url: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    console.error('Error occurred:', error);
    return throwError(() => error);
  }

  getPendientes(): Observable<Entrega[]> {
    return this.http.get<{ result: Entrega[] }>(`${this.url}/farmacia/entregas`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  getEntregadas(): Observable<Entrega[]> {
    return this.http.get<{ result: Entrega[] }>(`${this.url}/farmacia/entregas/entregadas`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  crearEntrega(entrega: Entrega): Observable<any> {
    return this.http.post<any>(`${this.url}/farmacia/entregas`, entrega).pipe(catchError(this.handleError));
  }

  actualizarFactura(id: number, subtotal: number, descuento: number, total: number): Observable<any> {
    return this.http.put<any>(`${this.url}/farmacia/entregas/factura/${id}`, { subtotal, descuento, total }).pipe(catchError(this.handleError));
  }

  despachar(id: number): Observable<any> {
    return this.http.put<any>(`${this.url}/farmacia/entregas/despachar/${id}`, {}).pipe(catchError(this.handleError));
  }

  getMedicamentosDeEntrega(idEntrega: number): Observable<DetalleEntrega[]> {
    return this.http.get<{ result: DetalleEntrega[] }>(`${this.url}/farmacia/detalle-entrega/medicamentos/${idEntrega}`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  agregarMedicamento(detalle: DetalleEntrega): Observable<any> {
    return this.http.post<any>(`${this.url}/farmacia/detalle-entrega`, detalle).pipe(catchError(this.handleError));
  }

  agregarMedicinaSinRegistro(datos: { id_entrega: number; cantidadmedicamentos: number; indicaciones: string; medicinasinrg: string }): Observable<any> {
    return this.http.post<any>(`${this.url}/farmacia/detalle-entrega/sin-registro`, datos).pipe(catchError(this.handleError));
  }
}
