import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/enviroments';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Enfermedad } from '../../../interface/HistoriaClinica.interface';
import { Diagnostico } from '../../../interface/HistoriaClinicaRF.interface';

@Injectable({
  providedIn: 'root'
})
export class CatalogoClinicoService {

  private url: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    console.error('Error occurred:', error);
    return throwError(() => error);
  }

  // Enfermedades (catálogo usado en Historia Clínica de Medicina General)
  getEnfermedades(): Observable<Enfermedad[]> {
    return this.http.get<{ result: Enfermedad[] }>(`${this.url}/clinico/enfermedad`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  crearEnfermedad(datos: Enfermedad): Observable<any> {
    return this.http.post<any>(`${this.url}/clinico/enfermedad`, datos).pipe(catchError(this.handleError));
  }

  actualizarEnfermedad(datos: Enfermedad): Observable<any> {
    return this.http.put<any>(`${this.url}/clinico/enfermedad/${datos.id_enfermedad}`, datos).pipe(catchError(this.handleError));
  }

  eliminarEnfermedad(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/clinico/enfermedad/${id}`).pipe(catchError(this.handleError));
  }

  // Diagnósticos (catálogo usado en Historia Clínica de Rehabilitación Física)
  getDiagnosticos(): Observable<Diagnostico[]> {
    return this.http.get<{ result: Diagnostico[] }>(`${this.url}/clinico/diagnostico`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  crearDiagnostico(datos: Diagnostico): Observable<any> {
    return this.http.post<any>(`${this.url}/clinico/diagnostico`, datos).pipe(catchError(this.handleError));
  }

  actualizarDiagnostico(datos: Diagnostico): Observable<any> {
    return this.http.put<any>(`${this.url}/clinico/diagnostico/${datos.id_diagnostico}`, datos).pipe(catchError(this.handleError));
  }

  eliminarDiagnostico(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/clinico/diagnostico/${id}`).pipe(catchError(this.handleError));
  }
}
