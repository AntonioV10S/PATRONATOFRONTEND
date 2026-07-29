import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/enviroments';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Turno } from '../../../interface/Cita.interface';

@Injectable({
  providedIn: 'root'
})
export class TurnoService {

  private url: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    console.error('Error occurred:', error);
    return throwError(() => error);
  }

  getTurnos(): Observable<Turno[]> {
    return this.http.get<{ result: Turno[] }>(`${this.url}/turnos`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  crearTurno(turno: Turno): Observable<any> {
    return this.http.post<any>(`${this.url}/turnos`, turno).pipe(catchError(this.handleError));
  }

  actualizarTurno(id: number, turno: Turno): Observable<any> {
    return this.http.put<any>(`${this.url}/turnos/${id}`, turno).pipe(catchError(this.handleError));
  }

  eliminarTurno(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/turnos/${id}`).pipe(catchError(this.handleError));
  }
}
