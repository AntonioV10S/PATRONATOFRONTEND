import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/enviroments';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Rol } from '../../../interface/Cuenta.interface';

@Injectable({
  providedIn: 'root'
})
export class RolService {

  private url: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    console.error('Error occurred:', error);
    return throwError(() => error);
  }

  getRoles(): Observable<Rol[]> {
    return this.http.get<{ result: Rol[] }>(`${this.url}/roles`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  crearRol(rol: Rol): Observable<any> {
    return this.http.post<any>(`${this.url}/roles`, rol).pipe(catchError(this.handleError));
  }

  actualizarRol(rol: Rol): Observable<any> {
    return this.http.put<any>(`${this.url}/roles/${rol.id_rol}`, rol).pipe(catchError(this.handleError));
  }

  eliminarRol(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/roles/${id}`).pipe(catchError(this.handleError));
  }
}
