import { Directive, ElementRef, Input, OnChanges, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/enviroments';

/**
 * Carga imágenes protegidas por el backend (que exigen Authorization: Bearer)
 * dentro de una etiqueta <img>, algo que un simple [src] no puede hacer porque
 * el navegador no adjunta encabezados personalizados en peticiones de imagen.
 *
 * Uso: <img [appAuthImg]="nombreDeArchivo" alt="...">
 * Si nombreDeArchivo es vacío/null, se usa la imagen de respaldo indicada en
 * [appAuthImgFallback] (o el avatar por defecto si no se especifica ninguna).
 */
@Directive({
  selector: 'img[appAuthImg]',
  standalone: true
})
export class AuthImgDirective implements OnChanges, OnDestroy {
  @Input('appAuthImg') nombreArchivo: string | null | undefined;
  @Input() appAuthImgFallback: string = 'assets/demo/images/login/avatar.png';

  private objectUrl: string | null = null;

  constructor(private el: ElementRef<HTMLImageElement>, private http: HttpClient) {}

  ngOnChanges(): void {
    this.limpiarUrlAnterior();

    if (!this.nombreArchivo) {
      this.el.nativeElement.src = this.appAuthImgFallback;
      return;
    }

    this.http.get(`${environment.baseUrl}/files/${this.nombreArchivo}`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        this.objectUrl = URL.createObjectURL(blob);
        this.el.nativeElement.src = this.objectUrl;
      },
      error: () => {
        this.el.nativeElement.src = this.appAuthImgFallback;
      }
    });
  }

  ngOnDestroy(): void {
    this.limpiarUrlAnterior();
  }

  private limpiarUrlAnterior(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }
}
