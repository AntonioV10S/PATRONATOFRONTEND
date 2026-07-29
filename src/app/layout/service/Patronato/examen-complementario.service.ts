import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/enviroments';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ExamenComplementario } from '../../../interface/ExamenComplementario.interface';

@Injectable({
  providedIn: 'root'
})
export class ExamenComplementarioService {

  private url: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    console.error('Error occurred:', error);
    return throwError(() => error);
  }

  getPorPaciente(idPaciente: number): Observable<ExamenComplementario | null> {
    return this.http.get<{ result: ExamenComplementario | string; code?: string }>(`${this.url}/clinico/examenes-complementarios/paciente/${idPaciente}`).pipe(
      map((data) => (typeof data.result === 'string' ? null : data.result)),
      catchError(this.handleError)
    );
  }

  crear(idPaciente: number, datos: ExamenComplementario): Observable<any> {
    return this.http.post<any>(`${this.url}/clinico/examenes-complementarios`, { ...datos, id_paciente: idPaciente }).pipe(catchError(this.handleError));
  }

  actualizar(id: number, datos: ExamenComplementario): Observable<any> {
    return this.http.put<any>(`${this.url}/clinico/examenes-complementarios/${id}`, datos).pipe(catchError(this.handleError));
  }
}
