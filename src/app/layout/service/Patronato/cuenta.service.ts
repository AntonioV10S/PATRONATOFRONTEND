import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/enviroments';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Cuenta, Rol } from '../../../interface/Cuenta.interface';

@Injectable({
  providedIn: 'root'
})
export class CuentaService {

  private url: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    console.error('Error occurred:', error);
    return throwError(() => error);
  }

  getCuentas(): Observable<Cuenta[]> {
    return this.http.get<{ result: Cuenta[] }>(`${this.url}/cuentas`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  getCuentaPorId(id: number): Observable<Cuenta> {
    return this.http.get<{ result: Cuenta }>(`${this.url}/cuentas/${id}`).pipe(
      map((data) => data.result),
      catchError(this.handleError)
    );
  }

  crearCuenta(cuenta: Cuenta): Observable<any> {
    return this.http.post<any>(`${this.url}/cuentas`, cuenta).pipe(catchError(this.handleError));
  }

  actualizarCuenta(cuenta: Cuenta): Observable<any> {
    return this.http.put<any>(`${this.url}/cuentas/${cuenta.id_cuenta}`, cuenta).pipe(catchError(this.handleError));
  }

  eliminarCuenta(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/cuentas/${id}`).pipe(catchError(this.handleError));
  }

  regenerarLlave(id: number): Observable<any> {
    return this.http.post<any>(`${this.url}/cuentas/${id}/regenerar-llave`, {}).pipe(catchError(this.handleError));
  }

  cambiarMiPassword(passwordActual: string, passwordNueva: string): Observable<any> {
    return this.http.put<any>(`${this.url}/cuentas/mi-password`, { passwordActual, passwordNueva }).pipe(catchError(this.handleError));
  }

  resetearPassword(id: number, passwordTemporal: string): Observable<any> {
    return this.http.put<any>(`${this.url}/cuentas/${id}/resetear-password`, { passwordTemporal }).pipe(catchError(this.handleError));
  }

  subirImagen(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.url}/upload`, formData).pipe(catchError(this.handleError));
  }

  getRoles(): Observable<Rol[]> {
    return this.http.get<{ result: Rol[] }>(`${this.url}/roles`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }
}
