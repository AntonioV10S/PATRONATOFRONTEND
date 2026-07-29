import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/enviroments';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Diagnostico, HistoriaClinicaRF, NuevaHistoriaClinicaRF, Tratamiento } from '../../../interface/HistoriaClinicaRF.interface';

@Injectable({
  providedIn: 'root'
})
export class HistoriaClinicaRFService {

  private url: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    console.error('Error occurred:', error);
    return throwError(() => error);
  }

  getDiagnosticos(): Observable<Diagnostico[]> {
    return this.http.get<{ result: Diagnostico[] }>(`${this.url}/clinico/diagnostico`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  crearTratamiento(tratamiento: Tratamiento): Observable<{ id: number }> {
    return this.http.post<any>(`${this.url}/tratamientos`, tratamiento).pipe(catchError(this.handleError));
  }

  getConsultasPorPaciente(idPaciente: number): Observable<HistoriaClinicaRF[]> {
    return this.http.get<{ result: HistoriaClinicaRF[] | string }>(`${this.url}/rf/pacientes/consultas/${idPaciente}`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  verDetalle(id: number): Observable<HistoriaClinicaRF> {
    return this.http.get<{ result: HistoriaClinicaRF }>(`${this.url}/rf/historias/${id}`).pipe(
      map((data) => data.result),
      catchError(this.handleError)
    );
  }

  crearHistoria(datos: NuevaHistoriaClinicaRF): Observable<any> {
    return this.http.post<any>(`${this.url}/rf/historias`, datos).pipe(catchError(this.handleError));
  }

  verificarIntegridad(id: number): Observable<any> {
    return this.http.get<any>(`${this.url}/rf/historias/verificar/${id}`).pipe(catchError(this.handleError));
  }

  verificarTodas(): Observable<any> {
    return this.http.get<any>(`${this.url}/rf/historias/verificar-todas`).pipe(catchError(this.handleError));
  }

  filtrarPorFecha(fechaInicial: string, fechaFinal: string): Observable<HistoriaClinicaRF[]> {
    return this.http.get<{ result: HistoriaClinicaRF[] | string }>(`${this.url}/rf/historias/rango/${fechaInicial}/${fechaFinal}`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  getEstadisticas(fechaInicial: string, fechaFinal: string, especialidad: string): Observable<any> {
    return this.http.get<any>(`${this.url}/rf/estadisticas/${fechaInicial}/${fechaFinal}/${especialidad}`).pipe(catchError(this.handleError));
  }
}
