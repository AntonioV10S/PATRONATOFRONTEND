import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/enviroments';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Adquisicion, DetalleAdquisicion } from '../../../interface/Adquisicion.interface';

@Injectable({
  providedIn: 'root'
})
export class AdquisicionService {

  private url: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    console.error('Error occurred:', error);
    return throwError(() => error);
  }

  getAdquisiciones(): Observable<Adquisicion[]> {
    return this.http.get<{ result: Adquisicion[] }>(`${this.url}/adquisiciones`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  crearAdquisicion(adquisicion: Adquisicion): Observable<any> {
    return this.http.post<any>(`${this.url}/adquisiciones`, adquisicion).pipe(catchError(this.handleError));
  }

  subirDocumento(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.url}/upload`, formData).pipe(catchError(this.handleError));
  }

  getDetallePorAdquisicion(): Observable<DetalleAdquisicion[]> {
    return this.http.get<{ result: DetalleAdquisicion[] }>(`${this.url}/detalle-adquisicion`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  agregarDetalle(detalle: DetalleAdquisicion): Observable<any> {
    return this.http.post<any>(`${this.url}/detalle-adquisicion`, detalle).pipe(catchError(this.handleError));
  }
}
