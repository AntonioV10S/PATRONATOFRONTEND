import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { Adquisicion, DetalleAdquisicion } from '../../../../interface/Adquisicion.interface';
import { AdquisicionService } from '../../../../layout/service/Patronato/adquisicion.service';
import { environment } from '../../../../../environments/enviroments';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-adquisiciones',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, PanelModule, ButtonModule, RippleModule, DialogModule, InputTextModule, TagModule, ToastModule],
  providers: [MessageService],
  templateUrl: './adquisiciones.component.html'
})
export class AdquisicionesComponent implements OnInit {

  adquisiciones: Adquisicion[] = [];
  todosLosDetalles: DetalleAdquisicion[] = [];
  busqueda: string = '';

  detalleDialog: boolean = false;
  adquisicionActiva: Adquisicion | null = null;
  detallesDeAdquisicion: DetalleAdquisicion[] = [];

  rowsPerPageOptions: number[] = [10, 20, 50];

  constructor(
    private adquisicionService: AdquisicionService,
    private http: HttpClient,
    private messageService: MessageService
  ) {}

  verDocumento(nombreArchivo?: string | null): void {
    if (!nombreArchivo) return;
    this.http.get(`${environment.baseUrl}/files/${nombreArchivo}`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: () => this.mostrarError('No se pudo abrir el documento.')
    });
  }

  ngOnInit(): void {
    this.cargarAdquisiciones();
    this.adquisicionService.getDetallePorAdquisicion().subscribe({ next: (data) => (this.todosLosDetalles = data) , error: (err) => console.error('Error al cargar datos de catálogo:', err) });
  }

  get adquisicionesFiltradas(): Adquisicion[] {
    const termino = this.busqueda.trim().toLowerCase();
    if (!termino) return this.adquisiciones;
    return this.adquisiciones.filter(a => (a.numeroadqui || '').toLowerCase().includes(termino));
  }

  cargarAdquisiciones(): void {
    this.adquisicionService.getAdquisiciones().subscribe({
      next: (data) => (this.adquisiciones = data),
      error: () => this.mostrarError('No se pudieron cargar las adquisiciones.')
    });
  }

  verDetalle(datos: Adquisicion): void {
    this.adquisicionActiva = datos;
    this.detallesDeAdquisicion = this.todosLosDetalles.filter(d => d.id_adquisicion === datos.id_adquisicion);
    this.detalleDialog = true;
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
