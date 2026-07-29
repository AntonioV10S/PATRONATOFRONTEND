import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/enviroments';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  private url: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<never> {
    console.error('Error occurred:', error);
    return throwError(() => error);
  }

  // Los endpoints de PDF exigen Authorization: Bearer (igual que todo el resto
  // de la API), y un <a href> o window.open() normal no puede adjuntar ese
  // header. Se descarga como blob (el interceptor sí le agrega el header) y
  // se abre en una pestaña nueva a partir de una URL de objeto local.
  abrirReporte(rutaRelativa: string): Observable<Blob> {
    return this.http.get(`${this.url}${rutaRelativa}`, { responseType: 'blob' }).pipe(
      catchError(this.handleError)
    );
  }

  descargar(blob: Blob, nombreSugerido: string): void {
    const objectUrl = URL.createObjectURL(blob);
    const nuevaVentana = window.open(objectUrl, '_blank');
    // Si el navegador bloquea la ventana emergente, se ofrece como descarga directa.
    if (!nuevaVentana) {
      const enlace = document.createElement('a');
      enlace.href = objectUrl;
      enlace.download = nombreSugerido;
      enlace.click();
    }
    setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
  }
}
