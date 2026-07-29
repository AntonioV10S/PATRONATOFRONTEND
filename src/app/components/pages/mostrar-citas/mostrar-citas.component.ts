import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { Cita } from '../../../interface/Cita.interface';
import { CitaService } from '../../../layout/service/Patronato/cita.service';

@Component({
  selector: 'app-mostrar-citas',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, RippleModule, InputTextModule,
    TableModule, PanelModule, TagModule, ToastModule, ConfirmDialogModule, TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './mostrar-citas.component.html'
})
export class MostrarCitasComponent implements OnInit {

  todasLasCitas: Cita[] = [];

  citasMG: Cita[] = [];
  citasRF: Cita[] = [];
  citasTL: Cita[] = [];

  fechaFiltroMG: string = new Date().toISOString().split('T')[0];
  fechaFiltroRF: string = new Date().toISOString().split('T')[0];
  fechaFiltroTL: string = new Date().toISOString().split('T')[0];

  cedulaBusquedaMG: string = '';
  cedulaBusquedaRF: string = '';
  cedulaBusquedaTL: string = '';

  cargando: boolean = false;

  constructor(
    private citaService: CitaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    this.cargando = true;
    this.citaService.getCitas().subscribe({
      next: (data) => {
        this.cargando = false;
        this.todasLasCitas = data;
        this.aplicarFiltros();
      },
      error: () => {
        this.cargando = false;
        this.mostrarError('No se pudieron cargar las citas.');
      }
    });
  }

  private filtrarPor(especialidad: string, fecha: string, cedula: string): Cita[] {
    return this.todasLasCitas.filter(c => {
      const coincideEspecialidad = c.turno?.rol?.rol === especialidad;
      const coincideFecha = !fecha || c.fecha === fecha;
      const coincideCedula = !cedula || (c.cedula || '').includes(cedula.trim());
      return coincideEspecialidad && coincideFecha && coincideCedula;
    });
  }

  aplicarFiltros(): void {
    this.citasMG = this.filtrarPor('Medicina General', this.fechaFiltroMG, this.cedulaBusquedaMG);
    this.citasRF = this.filtrarPor('Rehabilitación Física', this.fechaFiltroRF, this.cedulaBusquedaRF);
    this.citasTL = this.filtrarPor('Terapia de Lenguaje', this.fechaFiltroTL, this.cedulaBusquedaTL);
  }

  buscarMG(): void { this.aplicarFiltros(); }
  buscarRF(): void { this.aplicarFiltros(); }
  buscarTL(): void { this.aplicarFiltros(); }

  marcarAtendida(datos: Cita): void {
    if (!datos.cedula) return;
    this.citaService.marcarAtendida(datos.cedula).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cita marcada como atendida.' });
        this.cargarCitas();
      },
      error: () => this.mostrarError('No se pudo actualizar el estado de la cita.')
    });
  }

  confirmarEliminar(datos: Cita): void {
    this.confirmationService.confirm({
      message: `¿Eliminar la cita de "${datos.nombres}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        if (!datos.id_cita) return;
        this.citaService.eliminarCita(datos.id_cita).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cita eliminada.' });
            this.cargarCitas();
          },
          error: () => this.mostrarError('No se pudo eliminar la cita.')
        });
      }
    });
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
