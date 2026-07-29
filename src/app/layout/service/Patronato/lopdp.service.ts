import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/enviroments';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { IncidenteSeguridad, SolicitudArco } from '../../../interface/Lopdp.interface';

@Injectable({
  providedIn: 'root'
})
export class LopdpService {

  private url: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    console.error('Error occurred:', error);
    return throwError(() => error);
  }

  // ===== Incidentes de seguridad =====
  getIncidentes(): Observable<IncidenteSeguridad[]> {
    return this.http.get<{ result: IncidenteSeguridad[] }>(`${this.url}/incidentes-seguridad`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  crearIncidente(datos: IncidenteSeguridad): Observable<any> {
    return this.http.post<any>(`${this.url}/incidentes-seguridad`, datos).pipe(catchError(this.handleError));
  }

  actualizarIncidente(id: number, datos: IncidenteSeguridad): Observable<any> {
    return this.http.put<any>(`${this.url}/incidentes-seguridad/${id}`, datos).pipe(catchError(this.handleError));
  }

  // ===== Solicitudes ARCO+ =====
  getSolicitudesArco(): Observable<SolicitudArco[]> {
    return this.http.get<{ result: SolicitudArco[] }>(`${this.url}/solicitudes-arco`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  crearSolicitudArco(datos: SolicitudArco): Observable<any> {
    return this.http.post<any>(`${this.url}/solicitudes-arco`, datos).pipe(catchError(this.handleError));
  }

  resolverSolicitudArco(id: number, datos: { estado: string; resolucion: string }): Observable<any> {
    return this.http.put<any>(`${this.url}/solicitudes-arco/${id}`, datos).pipe(catchError(this.handleError));
  }
}
