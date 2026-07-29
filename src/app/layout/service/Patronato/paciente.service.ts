import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/enviroments';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Paciente } from '../../../interface/Paciente.interface';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {

  private url: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    console.error('Error occurred:', error);
    return throwError(() => error);
  }

  // El backend guarda la columna "grupo_a_prioritaria" pero al crear/actualizar
  // espera el campo "grupo_atencion" en el body (mapeo heredado del sistema
  // original). Se traduce aquí para que el resto del componente use siempre
  // el nombre real de la columna.
  private aBodyBackend(paciente: Paciente): any {
    const { grupo_a_prioritaria, ...resto } = paciente;
    return {
      ...resto,
      grupo_atencion: grupo_a_prioritaria
    };
  }

  getPacientes(): Observable<Paciente[]> {
    return this.http.get<{ result: Paciente[] }>(`${this.url}/pacientes`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  getPacientePorId(id: number): Observable<Paciente> {
    return this.http.get<{ result: Paciente }>(`${this.url}/pacientes/${id}`).pipe(
      map((data) => data.result),
      catchError(this.handleError)
    );
  }

  buscarPorCedula(cedula: string): Observable<Paciente | null> {
    return this.http.get<{ result: Paciente | string }>(`${this.url}/pacientes/cedula/${cedula}`).pipe(
      map((data) => (typeof data.result === 'string' ? null : data.result)),
      catchError(this.handleError)
    );
  }

  crearPaciente(paciente: Paciente): Observable<any> {
    return this.http.post<any>(`${this.url}/pacientes`, this.aBodyBackend(paciente)).pipe(catchError(this.handleError));
  }

  actualizarPaciente(paciente: Paciente): Observable<any> {
    return this.http.put<any>(`${this.url}/pacientes/${paciente.id_paciente}`, this.aBodyBackend(paciente)).pipe(catchError(this.handleError));
  }

  eliminarPaciente(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/pacientes/${id}`).pipe(catchError(this.handleError));
  }
}
