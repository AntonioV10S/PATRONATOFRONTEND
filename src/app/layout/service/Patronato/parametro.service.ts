import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/enviroments';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Parametro } from '../../../interface/Parametro.interface';

@Injectable({
  providedIn: 'root'
})
export class ParametroService {

  private url: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    console.error('Error occurred:', error);
    return throwError(() => error);
  }

  getParametros(): Observable<Parametro[]> {
    return this.http.get<{ result: Parametro[] | string }>(`${this.url}/parametros`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  crearParametro(datos: Parametro): Observable<any> {
    return this.http.post<any>(`${this.url}/parametros`, datos).pipe(catchError(this.handleError));
  }

  actualizarParametro(id: number, datos: Parametro): Observable<any> {
    return this.http.put<any>(`${this.url}/parametros/${id}`, datos).pipe(catchError(this.handleError));
  }

  eliminarParametro(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/parametros/${id}`).pipe(catchError(this.handleError));
  }
}
