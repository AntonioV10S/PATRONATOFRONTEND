import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-acceso-denegado',
  standalone: true,
  imports: [RouterLink, ButtonModule],
  template: `
    <div class="flex flex-column align-items-center justify-content-center" style="height: 70vh;">
      <i class="pi pi-lock text-6xl text-red-500 mb-4"></i>
      <h3>Acceso denegado</h3>
      <p class="text-500 mb-4">No tiene permisos para ver esta sección.</p>
      <a routerLink="/" pButton pRipple label="Volver al inicio" icon="pi pi-home"></a>
    </div>
  `
})
export class AccesoDenegadoComponent {}
