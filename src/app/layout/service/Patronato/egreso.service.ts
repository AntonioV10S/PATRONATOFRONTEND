import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/enviroments';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Egreso } from '../../../interface/Egreso.interface';

@Injectable({
  providedIn: 'root'
})
export class EgresoService {

  private url: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    console.error('Error occurred:', error);
    return throwError(() => error);
  }

  getEgresos(): Observable<Egreso[]> {
    return this.http.get<{ result: Egreso[] }>(`${this.url}/clinico/egreso`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  crearEgreso(egreso: Egreso): Observable<any> {
    return this.http.post<any>(`${this.url}/clinico/egreso`, egreso).pipe(catchError(this.handleError));
  }

  actualizarEgreso(id: number, egreso: Egreso): Observable<any> {
    return this.http.put<any>(`${this.url}/clinico/egreso/${id}`, egreso).pipe(catchError(this.handleError));
  }

  eliminarEgreso(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/clinico/egreso/${id}`).pipe(catchError(this.handleError));
  }
}
