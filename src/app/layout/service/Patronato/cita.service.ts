import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/enviroments';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Cita, Turno } from '../../../interface/Cita.interface';
import { Rol } from '../../../interface/Cuenta.interface';
import { Paciente } from '../../../interface/Paciente.interface';

@Injectable({
  providedIn: 'root'
})
export class CitaService {

  private url: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    console.error('Error occurred:', error);
    return throwError(() => error);
  }

  getCitas(): Observable<Cita[]> {
    return this.http.get<{ result: Cita[] }>(`${this.url}/citas`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  getEspecialidades(): Observable<Rol[]> {
    return this.http.get<{ result: Rol[] }>(`${this.url}/roles/medicos/atencion`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  getTurnosDisponibles(fecha: string, especialidad: string): Observable<Turno[]> {
    return this.http.get<{ result: Turno[] | string }>(`${this.url}/citas/validar-hora/${fecha}/${especialidad}`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  buscarPacientePorCedula(cedula: string): Observable<Paciente | null> {
    return this.http.get<{ result: Paciente | string }>(`${this.url}/citas/buscar-paciente/${cedula}`).pipe(
      map((data) => (typeof data.result === 'string' ? null : data.result)),
      catchError(this.handleError)
    );
  }

  crearCita(cita: { nombres: string; cedula: string; fecha: string; id_turno: number; abono: string }): Observable<any> {
    return this.http.post<any>(`${this.url}/citas`, cita).pipe(catchError(this.handleError));
  }

  actualizarCita(id: number, cita: { nombres: string; cedula: string; fecha: string; id_turno: number; abono: string }): Observable<any> {
    return this.http.put<any>(`${this.url}/citas/${id}`, cita).pipe(catchError(this.handleError));
  }

  eliminarCita(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/citas/${id}`).pipe(catchError(this.handleError));
  }

  marcarAtendida(cedula: string): Observable<any> {
    return this.http.put<any>(`${this.url}/citas/actualizar-estado/${cedula}`, {}).pipe(catchError(this.handleError));
  }
}
