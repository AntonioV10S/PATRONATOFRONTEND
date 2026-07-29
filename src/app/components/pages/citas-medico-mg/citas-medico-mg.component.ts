import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import { Cita } from '../../../interface/Cita.interface';
import { CitaService } from '../../../layout/service/Patronato/cita.service';
import { HistoriaClinicaMGService } from '../../../layout/service/Patronato/historia-clinica-mg.service';

@Component({
  selector: 'app-citas-medico-mg',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PanelModule, ButtonModule, RippleModule, InputTextModule, TableModule, ToastModule, TooltipModule],
  providers: [MessageService],
  templateUrl: './citas-medico-mg.component.html'
})
export class CitasMedicoMgComponent implements OnInit {

  readonly especialidad = 'Medicina General';

  // Tarjetas de estadísticas (rango: desde el primer día del mes hasta hoy)
  estadisticas: any = {};
  cargandoStats: boolean = false;

  // Cola de espera del día
  fechaActual: string = new Date().toISOString().split('T')[0];
  citasDelDia: Cita[] = [];
  citasFiltradas: Cita[] = [];
  busquedaApellido: string = '';
  cargandoCitas: boolean = false;

  constructor(
    private citaService: CitaService,
    private historiaService: HistoriaClinicaMGService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
    this.cargarCitasDelDia();
  }

  cargarEstadisticas(): void {
    this.cargandoStats = true;
    const primerDiaMes = this.fechaActual.slice(0, 8) + '01';
    this.historiaService.getEstadisticas(primerDiaMes, this.fechaActual, this.especialidad).subscribe({
      next: (data) => {
        this.cargandoStats = false;
        this.estadisticas = data;
      },
      error: () => (this.cargandoStats = false)
    });
  }

  cargarCitasDelDia(): void {
    this.cargandoCitas = true;
    this.citaService.getCitas().subscribe({
      next: (data) => {
        this.cargandoCitas = false;
        this.citasDelDia = data.filter(c =>
          c.turno?.rol?.rol === this.especialidad && c.fecha === this.fechaActual && c.estado != '1'
        );
        this.aplicarBusqueda();
      },
      error: () => {
        this.cargandoCitas = false;
        this.mostrarError('No se pudieron cargar las citas del día.');
      }
    });
  }

  aplicarBusqueda(): void {
    const termino = this.busquedaApellido.trim().toLowerCase();
    this.citasFiltradas = !termino
      ? this.citasDelDia
      : this.citasDelDia.filter(c => (c.nombres || '').toLowerCase().includes(termino));
  }

  // Horas laboradas es un estimado (el sistema no registra fichadas de entrada/salida):
  // se calcula sobre la base de ~20 minutos promedio por consulta atendida.
  get horasEstimadas(): number {
    const minutos = (this.estadisticas.totalP || 0) * 20;
    return Math.floor(minutos / 60);
  }
  get minutosEstimados(): number {
    const minutos = (this.estadisticas.totalP || 0) * 20;
    return minutos % 60;
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
