import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/enviroments';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import {
  AntecedenteGineco, AntecedentePatologicoPersonal, Familiar, Habito, ExamenFisico, ExamenOrganoSistema
} from '../../../interface/Antecedentes.interface';

@Injectable({
  providedIn: 'root'
})
export class AntecedentesService {

  private url: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    console.error('Error occurred:', error);
    return throwError(() => error);
  }

  // Gineco-Obstétrico
  crearGineco(datos: AntecedenteGineco): Observable<any> {
    return this.http.post<any>(`${this.url}/antecedentes/gineco-obstetrico`, datos).pipe(catchError(this.handleError));
  }
  actualizarGineco(id: number, datos: AntecedenteGineco): Observable<any> {
    return this.http.put<any>(`${this.url}/antecedentes/gineco-obstetrico/${id}`, datos).pipe(catchError(this.handleError));
  }

  // Antecedentes Patológicos Personales
  crearPatologicoPersonal(datos: AntecedentePatologicoPersonal): Observable<any> {
    return this.http.post<any>(`${this.url}/antecedentes/patologico-personal`, datos).pipe(catchError(this.handleError));
  }
  actualizarPatologicoPersonal(id: number, datos: AntecedentePatologicoPersonal): Observable<any> {
    return this.http.put<any>(`${this.url}/antecedentes/patologico-personal/${id}`, datos).pipe(catchError(this.handleError));
  }

  // Familiares
  getFamiliaresPorPaciente(idPaciente: number): Observable<Familiar[]> {
    return this.http.get<{ result: Familiar[] }>(`${this.url}/antecedentes/familiares-paciente/${idPaciente}`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }
  crearFamiliar(datos: Familiar & { id_paciente: number }): Observable<any> {
    return this.http.post<any>(`${this.url}/antecedentes/familiar-nuevo`, datos).pipe(catchError(this.handleError));
  }
  eliminarFamiliar(idFamiliar: number, idPaciente: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/antecedentes/patologico-familiar/${idFamiliar}/${idPaciente}`).pipe(catchError(this.handleError));
  }

  // Hábitos
  crearHabito(datos: Habito): Observable<any> {
    return this.http.post<any>(`${this.url}/pacientes/habito`, datos).pipe(catchError(this.handleError));
  }
  actualizarHabito(id: number, datos: Habito): Observable<any> {
    return this.http.put<any>(`${this.url}/pacientes/habito/${id}`, datos).pipe(catchError(this.handleError));
  }

  // Examen Físico General
  crearExamenFisico(datos: ExamenFisico): Observable<any> {
    return this.http.post<any>(`${this.url}/clinico/examen-fisico`, datos).pipe(catchError(this.handleError));
  }
  actualizarExamenFisico(id: number, datos: ExamenFisico): Observable<any> {
    return this.http.put<any>(`${this.url}/clinico/examen-fisico/${id}`, datos).pipe(catchError(this.handleError));
  }

  // Examen por Órganos y Sistemas
  crearExamenOrganoSistema(datos: ExamenOrganoSistema): Observable<any> {
    return this.http.post<any>(`${this.url}/clinico/examen-organo-sistema`, datos).pipe(catchError(this.handleError));
  }
  actualizarExamenOrganoSistema(id: number, datos: ExamenOrganoSistema): Observable<any> {
    return this.http.put<any>(`${this.url}/clinico/examen-organo-sistema/${id}`, datos).pipe(catchError(this.handleError));
  }
}
