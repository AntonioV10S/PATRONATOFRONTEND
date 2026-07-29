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
import { HistoriaClinicaRFService } from '../../../layout/service/Patronato/historia-clinica-rf.service';

@Component({
  selector: 'app-citas-medico-rf',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PanelModule, ButtonModule, RippleModule, InputTextModule, TableModule, ToastModule, TooltipModule],
  providers: [MessageService],
  templateUrl: './citas-medico-rf.component.html'
})
export class CitasMedicoRfComponent implements OnInit {

  readonly especialidad = 'Rehabilitación Física';

  estadisticas: any = {};
  cargandoStats: boolean = false;
  periodo: 'dia' | 'semana' | 'mes' = 'dia';

  fechaActual: string = new Date().toISOString().split('T')[0];
  citasDelDia: Cita[] = [];
  citasFiltradas: Cita[] = [];
  busquedaApellido: string = '';
  cargandoCitas: boolean = false;

  constructor(
    private citaService: CitaService,
    private historiaService: HistoriaClinicaRFService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
    this.cargarCitasDelDia();
  }

  cambiarPeriodo(p: 'dia' | 'semana' | 'mes'): void {
    this.periodo = p;
    this.cargarEstadisticas();
  }

  private rangoDelPeriodo(): { inicio: string; fin: string } {
    const hoy = new Date();
    const fin = this.fechaActual;
    if (this.periodo === 'dia') return { inicio: fin, fin };
    if (this.periodo === 'semana') {
      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - hoy.getDay());
      return { inicio: inicioSemana.toISOString().split('T')[0], fin };
    }
    const primerDiaMes = fin.slice(0, 8) + '01';
    return { inicio: primerDiaMes, fin };
  }

  cargarEstadisticas(): void {
    this.cargandoStats = true;
    const { inicio, fin } = this.rangoDelPeriodo();
    this.historiaService.getEstadisticas(inicio, fin, this.especialidad).subscribe({
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

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
