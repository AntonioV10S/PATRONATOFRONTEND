import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { HistoriaClinicaRF } from '../../../interface/HistoriaClinicaRF.interface';
import { Paciente } from '../../../interface/Paciente.interface';
import { HistoriaClinicaRFService } from '../../../layout/service/Patronato/historia-clinica-rf.service';
import { PacienteService } from '../../../layout/service/Patronato/paciente.service';

@Component({
  selector: 'app-historial-consultas-rf',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, DialogModule, RippleModule, InputTextModule, TableModule, TagModule, ToastModule],
  providers: [MessageService],
  templateUrl: './historial-consultas-rf.component.html'
})
export class HistorialConsultasRfComponent implements OnInit {

  fechaInicial: string = '';
  fechaFinal: string = '';
  busquedaApellido: string = '';

  consultas: HistoriaClinicaRF[] = [];
  consultasFiltradas: HistoriaClinicaRF[] = [];
  cargando: boolean = false;

  detalleDialog: boolean = false;
  detalle: HistoriaClinicaRF | null = null;
  cargandoDetalle: boolean = false;
  pacienteCompleto: Paciente | null = null;

  constructor(
    private historiaService: HistoriaClinicaRFService,
    private pacienteService: PacienteService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const hoy = new Date();
    this.fechaFinal = hoy.toISOString().split('T')[0];
    const inicio = new Date(hoy);
    inicio.setFullYear(inicio.getFullYear() - 5);
    this.fechaInicial = inicio.toISOString().split('T')[0];
    this.filtrar();
  }

  filtrar(): void {
    if (!this.fechaInicial || !this.fechaFinal) {
      this.mostrarError('Seleccione la fecha inicial y final.');
      return;
    }
    this.cargando = true;
    this.historiaService.filtrarPorFecha(this.fechaInicial, this.fechaFinal).subscribe({
      next: (data) => {
        this.cargando = false;
        this.consultas = data;
        this.aplicarBusqueda();
      },
      error: () => {
        this.cargando = false;
        this.mostrarError('No se pudieron cargar las consultas para ese rango de fechas.');
      }
    });
  }

  aplicarBusqueda(): void {
    const termino = this.busquedaApellido.trim().toLowerCase();
    this.consultasFiltradas = !termino
      ? this.consultas
      : this.consultas.filter(c => {
          const p = c.paciente || {};
          return (p.apellidos || '').toLowerCase().includes(termino) ||
                 (p.nombres || '').toLowerCase().includes(termino) ||
                 (p.cedula || '').includes(termino) ||
                 (c.medico?.nombres || '').toLowerCase().includes(termino);
        });
  }

  verDatosConsulta(fila: HistoriaClinicaRF): void {
    if (!fila.id_rf) return;
    this.cargandoDetalle = true;
    this.detalleDialog = true;
    this.detalle = null;
    this.pacienteCompleto = null;

    this.historiaService.verDetalle(fila.id_rf).subscribe({
      next: (data) => {
        this.cargandoDetalle = false;
        this.detalle = data;
      },
      error: (err) => {
        this.cargandoDetalle = false;
        this.detalleDialog = false;
        this.mostrarError(err?.error?.message || 'No se pudo descifrar el registro.');
      }
    });

    if (fila.id_paciente) {
      this.pacienteService.getPacientePorId(fila.id_paciente).subscribe({
        next: (data) => (this.pacienteCompleto = data),
        error: () => { /* si falla, el modal igual muestra la consulta */ }
      });
    }
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
