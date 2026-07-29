import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/enviroments';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Recaudacion } from '../../../interface/Recaudacion.interface';

@Injectable({
  providedIn: 'root'
})
export class RecaudacionService {

  private url: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    console.error('Error occurred:', error);
    return throwError(() => error);
  }

  getRecaudaciones(): Observable<Recaudacion[]> {
    return this.http.get<{ result: Recaudacion[] }>(`${this.url}/recaudaciones`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  crearRecaudacion(recaudacion: Recaudacion): Observable<any> {
    return this.http.post<any>(`${this.url}/recaudaciones`, recaudacion).pipe(catchError(this.handleError));
  }

  eliminarRecaudacion(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/recaudaciones/${id}`).pipe(catchError(this.handleError));
  }
}
