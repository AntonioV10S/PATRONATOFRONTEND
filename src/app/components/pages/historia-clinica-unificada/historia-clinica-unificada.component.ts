import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';

import { Paciente } from '../../../interface/Paciente.interface';
import { PacienteService } from '../../../layout/service/Patronato/paciente.service';
import { HistoriaClinicaMGService } from '../../../layout/service/Patronato/historia-clinica-mg.service';
import { HistoriaClinicaRFService } from '../../../layout/service/Patronato/historia-clinica-rf.service';

// Una fila del timeline unificado. "especialidad" es lo que permite filtrar
// qué endpoint de detalle llamar (MG o RF) y, a futuro, agregar más ramas
// sin tocar la estructura: solo se agrega un nuevo "case" en verDetalle().
interface FilaTimeline {
  id: number;
  especialidad: 'Medicina General' | 'Rehabilitación Física';
  fecha: string;
  resumen: string;
  lugar: string;
}

@Component({
  selector: 'app-historia-clinica-unificada',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ToolbarModule,
    ButtonModule,
    RippleModule,
    DialogModule,
    InputTextModule,
    TagModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './historia-clinica-unificada.component.html'
})
export class HistoriaClinicaUnificadaComponent {

  busquedaCedula: string = '';
  buscandoPaciente: boolean = false;
  pacienteActivo: Paciente | null = null;

  timeline: FilaTimeline[] = [];
  cargandoTimeline: boolean = false;

  detalleDialog: boolean = false;
  cargandoDetalle: boolean = false;
  detalle: any = null;
  especialidadDetalle: string = '';
  accesoDenegado: boolean = false;

  constructor(
    private pacienteService: PacienteService,
    private mgService: HistoriaClinicaMGService,
    private rfService: HistoriaClinicaRFService,
    private messageService: MessageService
  ) {}

  buscarPaciente(): void {
    if (!this.busquedaCedula || this.busquedaCedula.trim().length === 0) return;

    this.buscandoPaciente = true;
    this.pacienteService.buscarPorCedula(this.busquedaCedula.trim()).subscribe({
      next: (resultado) => {
        this.buscandoPaciente = false;
        this.pacienteActivo = resultado;
        this.timeline = [];
        if (!resultado) {
          this.messageService.add({ severity: 'info', summary: 'Sin resultados', detail: 'No existe un paciente con esa cédula.' });
        } else {
          this.cargarTimeline();
        }
      },
      error: () => {
        this.buscandoPaciente = false;
        this.mostrarError('Error al buscar el paciente.');
      }
    });
  }

  // Combina el historial de MG y RF en un solo timeline ordenado por fecha.
  // Nota de diseño: esto solo trae metadatos (fecha, diagnóstico/enfermedad,
  // lugar) — NUNCA el contenido clínico descifrado. El contenido solo se pide
  // (y solo se entrega) al presionar "Ver detalle", y el backend decide ahí
  // si esta cuenta tiene autorización real para esa especialidad puntual.
  cargarTimeline(): void {
    if (!this.pacienteActivo?.id_paciente) return;
    this.cargandoTimeline = true;

    forkJoin({
      mg: this.mgService.getConsultasPorPaciente(this.pacienteActivo.id_paciente),
      rf: this.rfService.getConsultasPorPaciente(this.pacienteActivo.id_paciente)
    }).subscribe({
      next: ({ mg, rf }) => {
        this.cargandoTimeline = false;

        const filasMg: FilaTimeline[] = mg.map(h => ({
          id: h.id_historia_mg!,
          especialidad: 'Medicina General',
          fecha: h.fecha || '',
          resumen: h.enfermedad?.enfermedad || '—',
          lugar: h.lugar_atencion || '—'
        }));

        const filasRf: FilaTimeline[] = rf.map(h => ({
          id: h.id_rf!,
          especialidad: 'Rehabilitación Física',
          fecha: h.fecha || '',
          resumen: h.diagnostico?.diagnostico || '—',
          lugar: h.lugar_atencion || '—'
        }));

        this.timeline = [...filasMg, ...filasRf].sort((a, b) => b.fecha.localeCompare(a.fecha));
      },
      error: () => {
        this.cargandoTimeline = false;
        this.mostrarError('No se pudo cargar el historial combinado del paciente.');
      }
    });
  }

  // Al pedir el detalle, el backend vuelve a validar (por especialidad) si
  // esta cuenta es el médico tratante o tiene un reemplazo legal vigente. Si
  // no, responde 403 y aquí se muestra un mensaje claro de acceso denegado
  // en vez de intentar mostrar contenido que nunca llegó.
  verDetalle(fila: FilaTimeline): void {
    this.detalleDialog = true;
    this.cargandoDetalle = true;
    this.detalle = null;
    this.accesoDenegado = false;
    this.especialidadDetalle = fila.especialidad;

    const peticion = fila.especialidad === 'Medicina General'
      ? this.mgService.verDetalle(fila.id)
      : this.rfService.verDetalle(fila.id);

    peticion.subscribe({
      next: (data) => {
        this.cargandoDetalle = false;
        this.detalle = data;
      },
      error: (err) => {
        this.cargandoDetalle = false;
        if (err?.status === 403) {
          this.accesoDenegado = true;
        } else {
          this.detalleDialog = false;
          this.mostrarError(err?.error?.message || 'No se pudo cargar el detalle.');
        }
      }
    });
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
