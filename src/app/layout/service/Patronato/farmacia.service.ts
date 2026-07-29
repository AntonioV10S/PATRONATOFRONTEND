import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/enviroments';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { CategoriaMedicamento, Inventario, Laboratorio, Medicamento } from '../../../interface/Farmacia.interface';

@Injectable({
  providedIn: 'root'
})
export class FarmaciaService {

  private url: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    console.error('Error occurred:', error);
    return throwError(() => error);
  }

  // Medicamentos
  getMedicamentos(): Observable<Medicamento[]> {
    return this.http.get<{ result: Medicamento[] }>(`${this.url}/farmacia/medicamentos`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  crearMedicamento(medicamento: Medicamento): Observable<any> {
    return this.http.post<any>(`${this.url}/farmacia/medicamentos`, medicamento).pipe(catchError(this.handleError));
  }

  // Categorías y laboratorios (catálogos de apoyo)
  getCategorias(): Observable<CategoriaMedicamento[]> {
    return this.http.get<{ result: CategoriaMedicamento[] }>(`${this.url}/farmacia/categorias`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  getLaboratorios(): Observable<Laboratorio[]> {
    return this.http.get<{ result: Laboratorio[] }>(`${this.url}/farmacia/laboratorios`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  crearLaboratorio(laboratorio: Laboratorio): Observable<any> {
    return this.http.post<any>(`${this.url}/farmacia/laboratorios`, laboratorio).pipe(catchError(this.handleError));
  }

  // Inventario
  getInventario(): Observable<Inventario[]> {
    return this.http.get<{ result: Inventario[] }>(`${this.url}/inventario`).pipe(
      map((data) => Array.isArray(data.result) ? data.result : []),
      catchError(this.handleError)
    );
  }

  crearInventario(inventario: Inventario): Observable<any> {
    return this.http.post<any>(`${this.url}/inventario`, inventario).pipe(catchError(this.handleError));
  }

  actualizarExistencia(id: number, existencias: number): Observable<any> {
    return this.http.put<any>(`${this.url}/actualizarexistencia/${id}`, { existencias }).pipe(catchError(this.handleError));
  }

  marcarDesechado(id: number): Observable<any> {
    return this.http.put<any>(`${this.url}/medicamentodesechado/${id}`, {}).pipe(catchError(this.handleError));
  }

  eliminarInventario(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/inventario/${id}`).pipe(catchError(this.handleError));
  }
}
