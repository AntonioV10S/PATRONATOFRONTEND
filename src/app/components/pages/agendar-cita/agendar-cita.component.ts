import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { Turno } from '../../../interface/Cita.interface';
import { Rol } from '../../../interface/Cuenta.interface';
import { CitaService } from '../../../layout/service/Patronato/cita.service';

@Component({
  selector: 'app-agendar-cita',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, RippleModule, InputTextModule, DropdownModule, ToastModule],
  providers: [MessageService],
  templateUrl: './agendar-cita.component.html'
})
export class AgendarCitaComponent implements OnInit {

  nombres: string = '';
  cedula: string = '';
  especialidadSeleccionada: string = '';
  fecha: string = '';
  idTurnoSeleccionado: number | null = null;

  especialidades: Rol[] = [];
  turnosDisponibles: Turno[] = [];

  buscandoPaciente: boolean = false;
  cargandoTurnos: boolean = false;
  guardando: boolean = false;

  constructor(private citaService: CitaService, private messageService: MessageService) {}

  ngOnInit(): void {
    this.citaService.getEspecialidades().subscribe({ next: (data) => (this.especialidades = data) , error: (err) => console.error('Error al cargar datos de catálogo:', err) });
  }

  consultarPaciente(): void {
    if (!this.cedula || this.cedula.trim().length === 0) return;
    this.buscandoPaciente = true;
    this.citaService.buscarPacientePorCedula(this.cedula.trim()).subscribe({
      next: (paciente) => {
        this.buscandoPaciente = false;
        if (paciente) {
          this.nombres = `${paciente.nombres || ''} ${paciente.apellidos || ''}`.trim();
          this.messageService.add({ severity: 'success', summary: 'Paciente encontrado', detail: this.nombres });
        } else {
          this.messageService.add({ severity: 'info', summary: 'Paciente nuevo', detail: 'No está registrado; ingrese el nombre manualmente.' });
        }
      },
      error: () => {
        this.buscandoPaciente = false;
        this.mostrarError('Error al consultar la cédula.');
      }
    });
  }

  cargarTurnos(): void {
    if (!this.fecha || !this.especialidadSeleccionada) return;
    this.cargandoTurnos = true;
    this.idTurnoSeleccionado = null;
    this.citaService.getTurnosDisponibles(this.fecha, this.especialidadSeleccionada).subscribe({
      next: (data) => {
        this.cargandoTurnos = false;
        this.turnosDisponibles = data;
        if (data.length === 0) {
          this.messageService.add({ severity: 'info', summary: 'Sin horarios', detail: 'No hay horarios disponibles para esa fecha y especialidad.' });
        }
      },
      error: () => {
        this.cargandoTurnos = false;
        this.mostrarError('No se pudieron cargar los horarios disponibles.');
      }
    });
  }

  agendarCita(): void {
    if (!this.nombres || !this.cedula || !this.fecha || !this.idTurnoSeleccionado) {
      this.mostrarError('Complete nombres, cédula, fecha y hora de la cita.');
      return;
    }
    this.guardando = true;
    this.citaService.crearCita({
      nombres: this.nombres, cedula: this.cedula, fecha: this.fecha, id_turno: this.idTurnoSeleccionado, abono: ''
    }).subscribe({
      next: () => {
        this.guardando = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cita agendada correctamente.' });
        this.reiniciar();
      },
      error: (err) => {
        this.guardando = false;
        this.mostrarError(err?.error?.message || 'No se pudo agendar la cita.');
      }
    });
  }

  private reiniciar(): void {
    this.nombres = '';
    this.cedula = '';
    this.especialidadSeleccionada = '';
    this.fecha = '';
    this.idTurnoSeleccionado = null;
    this.turnosDisponibles = [];
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
