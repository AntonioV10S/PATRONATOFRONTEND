import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';

import { Paciente } from '../../../interface/Paciente.interface';
import { PacienteService } from '../../../layout/service/Patronato/paciente.service';
import { HistoriaClinicaMGService } from '../../../layout/service/Patronato/historia-clinica-mg.service';
import { HistoriaClinicaRFService } from '../../../layout/service/Patronato/historia-clinica-rf.service';

interface EventoHistorial {
  fecha: string;
  especialidad: 'Medicina General' | 'Rehabilitación Física';
  resumen: string;
  icono: string;
  color: string;
}

@Component({
  selector: 'app-historial-completo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TimelineModule,
    CardModule,
    ButtonModule,
    RippleModule,
    InputTextModule,
    TagModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './historial-completo.component.html'
})
export class HistorialCompletoComponent {

  busquedaCedula: string = '';
  buscandoPaciente: boolean = false;
  pacienteActivo: Paciente | null = null;

  cargandoHistorial: boolean = false;
  eventos: EventoHistorial[] = [];

  constructor(
    private pacienteService: PacienteService,
    private historiaMGService: HistoriaClinicaMGService,
    private historiaRFService: HistoriaClinicaRFService,
    private messageService: MessageService
  ) {}

  buscarPaciente(): void {
    if (!this.busquedaCedula || this.busquedaCedula.trim().length === 0) return;

    this.buscandoPaciente = true;
    this.pacienteService.buscarPorCedula(this.busquedaCedula.trim()).subscribe({
      next: (resultado) => {
        this.buscandoPaciente = false;
        this.pacienteActivo = resultado;
        this.eventos = [];
        if (!resultado) {
          this.messageService.add({ severity: 'info', summary: 'Sin resultados', detail: 'No existe un paciente con esa cédula.' });
        } else {
          this.cargarHistorialCompleto();
        }
      },
      error: () => {
        this.buscandoPaciente = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al buscar el paciente.' });
      }
    });
  }

  cargarHistorialCompleto(): void {
    if (!this.pacienteActivo?.id_paciente) return;
    this.cargandoHistorial = true;

    forkJoin({
      mg: this.historiaMGService.getConsultasPorPaciente(this.pacienteActivo.id_paciente),
      rf: this.historiaRFService.getConsultasPorPaciente(this.pacienteActivo.id_paciente)
    }).subscribe({
      next: ({ mg, rf }) => {
        this.cargandoHistorial = false;

        const eventosMG: EventoHistorial[] = mg.map((h) => ({
          fecha: h.fecha || '',
          especialidad: 'Medicina General',
          resumen: h.enfermedad?.enfermedad || h.tipo_atencion || 'Consulta de Medicina General',
          icono: 'pi pi-heart',
          color: '#2196F3'
        }));

        const eventosRF: EventoHistorial[] = rf.map((h) => ({
          fecha: h.fecha || '',
          especialidad: 'Rehabilitación Física',
          resumen: h.diagnostico?.diagnostico || 'Consulta de Rehabilitación Física',
          icono: 'pi pi-heart-fill',
          color: '#FF9800'
        }));

        this.eventos = [...eventosMG, ...eventosRF].sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));

        if (this.eventos.length === 0) {
          this.messageService.add({ severity: 'info', summary: 'Sin historial', detail: 'Este paciente no tiene consultas registradas en ninguna especialidad.' });
        }
      },
      error: () => {
        this.cargandoHistorial = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el historial completo.' });
      }
    });
  }
}
