import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { Paciente } from '../../../interface/Paciente.interface';
import { ExamenComplementario } from '../../../interface/ExamenComplementario.interface';
import { PacienteService } from '../../../layout/service/Patronato/paciente.service';
import { ExamenComplementarioService } from '../../../layout/service/Patronato/examen-complementario.service';

@Component({
  selector: 'app-laboratorio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToolbarModule,
    ButtonModule,
    RippleModule,
    InputTextModule,
    InputTextareaModule,
    TagModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './laboratorio.component.html'
})
export class LaboratorioComponent {

  busquedaCedula: string = '';
  buscandoPaciente: boolean = false;
  pacienteActivo: Paciente | null = null;

  cargandoExamen: boolean = false;
  examenExistente: ExamenComplementario | null = null;
  examen: ExamenComplementario = {};
  guardando: boolean = false;
  modoEdicion: boolean = false;

  constructor(
    private pacienteService: PacienteService,
    private examenService: ExamenComplementarioService,
    private messageService: MessageService
  ) {}

  buscarPaciente(): void {
    if (!this.busquedaCedula || this.busquedaCedula.trim().length === 0) return;

    this.buscandoPaciente = true;
    this.pacienteService.buscarPorCedula(this.busquedaCedula.trim()).subscribe({
      next: (resultado) => {
        this.buscandoPaciente = false;
        this.pacienteActivo = resultado;
        this.examenExistente = null;
        this.examen = {};
        this.modoEdicion = false;
        if (!resultado) {
          this.messageService.add({ severity: 'info', summary: 'Sin resultados', detail: 'No existe un paciente con esa cédula.' });
        } else {
          this.cargarExamen();
        }
      },
      error: () => {
        this.buscandoPaciente = false;
        this.mostrarError('Error al buscar el paciente.');
      }
    });
  }

  cargarExamen(): void {
    if (!this.pacienteActivo?.id_paciente) return;
    this.cargandoExamen = true;
    this.examenService.getPorPaciente(this.pacienteActivo.id_paciente).subscribe({
      next: (data) => {
        this.cargandoExamen = false;
        this.examenExistente = data;
        this.examen = data ? { ...data } : {};
        this.modoEdicion = !data; // si no tiene, arrancamos directo en modo formulario
      },
      error: () => {
        this.cargandoExamen = false;
        this.mostrarError('No se pudo cargar el examen del paciente.');
      }
    });
  }

  habilitarEdicion(): void {
    this.examen = this.examenExistente ? { ...this.examenExistente } : {};
    this.modoEdicion = true;
  }

  cancelarEdicion(): void {
    this.examen = this.examenExistente ? { ...this.examenExistente } : {};
    this.modoEdicion = false;
  }

  guardarExamen(): void {
    if (!this.pacienteActivo?.id_paciente) return;
    this.guardando = true;

    const peticion = this.examenExistente?.id_e_complementario
      ? this.examenService.actualizar(this.examenExistente.id_e_complementario, this.examen)
      : this.examenService.crear(this.pacienteActivo.id_paciente, this.examen);

    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.modoEdicion = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Examen guardado correctamente (cifrado).' });
        this.cargarExamen();
      },
      error: () => {
        this.guardando = false;
        this.mostrarError('No se pudo guardar el examen.');
      }
    });
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
