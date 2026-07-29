import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/enviroments';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Enfermedad, HistoriaClinicaMG, NuevaHistoriaClinicaMG } from '../../../interface/HistoriaClinica.interface';

@Injectable({
  providedIn: 'root'
})
export class HistoriaClinicaMGService {

  private url: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    console.error('Error occurred:', error);
    return throwError(() => error);
  }

  getEnfermedades(): Observable<Enfermedad[]> {
    return this.http.get<{ result: Enfermedad[] }>(`${this.url}/clinico/enfermedad`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  getConsultasPorPaciente(idPaciente: number): Observable<HistoriaClinicaMG[]> {
    return this.http.get<{ result: HistoriaClinicaMG[] | string }>(`${this.url}/mg/pacientes/consultas/${idPaciente}`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  // Descifra el contenido sensible en el servidor (llave institucional) y lo
  // devuelve dentro de "datos_sensibles". No requiere ninguna llave del cliente.
  verDetalle(id: number): Observable<HistoriaClinicaMG> {
    return this.http.get<{ result: HistoriaClinicaMG }>(`${this.url}/mg/historias/${id}`).pipe(
      map((data) => data.result),
      catchError(this.handleError)
    );
  }

  verificarIntegridad(id: number): Observable<any> {
    return this.http.get<any>(`${this.url}/mg/historias/verificar/${id}`).pipe(catchError(this.handleError));
  }

  crearHistoria(datos: NuevaHistoriaClinicaMG): Observable<any> {
    return this.http.post<any>(`${this.url}/mg/historias`, datos).pipe(catchError(this.handleError));
  }

  filtrarPorFecha(fechaInicial: string, fechaFinal: string): Observable<HistoriaClinicaMG[]> {
    return this.http.get<{ result: HistoriaClinicaMG[] | string }>(`${this.url}/mg/historias/rango/${fechaInicial}/${fechaFinal}`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  getEstadisticas(fechaInicial: string, fechaFinal: string, especialidad: string): Observable<any> {
    return this.http.get<any>(`${this.url}/mg/estadisticas/${fechaInicial}/${fechaFinal}/${especialidad}`).pipe(catchError(this.handleError));
  }
}
