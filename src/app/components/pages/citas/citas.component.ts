import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { Cita, Turno } from '../../../interface/Cita.interface';
import { Rol } from '../../../interface/Cuenta.interface';
import { Paciente } from '../../../interface/Paciente.interface';
import { CitaService } from '../../../layout/service/Patronato/cita.service';
import { RecaudacionService } from '../../../layout/service/Patronato/recaudacion.service';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ToolbarModule,
    ButtonModule,
    RippleModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    CheckboxModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './citas.component.html'
})
export class CitasComponent implements OnInit {

  citas: Cita[] = [];
  especialidades: Rol[] = [];
  turnosDisponibles: Turno[] = [];

  citaDialog: boolean = false;
  editando: boolean = false;
  submitted: boolean = false;
  guardando: boolean = false;
  buscandoPaciente: boolean = false;
  cargandoTurnos: boolean = false;

  idCitaEditar: number | null = null;
  nombres: string = '';
  cedula: string = '';
  fecha: string = '';
  especialidadSeleccionada: string = '';
  idTurnoSeleccionado: number | null = null;
  abono: boolean = false;
  pacienteEncontrado: Paciente | null = null;

  rowsPerPageOptions: number[] = [10, 20, 50];

  constructor(
    private citaService: CitaService,
    private recaudacionService: RecaudacionService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.cargarCitas();
    this.citaService.getEspecialidades().subscribe({
      next: (data) => (this.especialidades = data),
      error: () => this.mostrarError('No se pudieron cargar las especialidades.')
    });
  }

  cargarCitas(): void {
    this.citaService.getCitas().subscribe({
      next: (data) => (this.citas = data),
      error: () => this.mostrarError('No se pudieron cargar las citas.')
    });
  }

  openNew(): void {
    this.editando = false;
    this.idCitaEditar = null;
    this.nombres = '';
    this.cedula = '';
    this.fecha = new Date().toISOString().split('T')[0];
    this.especialidadSeleccionada = '';
    this.idTurnoSeleccionado = null;
    this.abono = false;
    this.turnosDisponibles = [];
    this.pacienteEncontrado = null;
    this.submitted = false;
    this.citaDialog = true;
  }

  editarCita(datos: Cita): void {
    this.editando = true;
    this.idCitaEditar = datos.id_cita ?? null;
    this.nombres = datos.nombres || '';
    this.cedula = datos.cedula || '';
    this.fecha = datos.fecha || '';
    this.especialidadSeleccionada = datos.turno?.rol?.rol || '';
    this.idTurnoSeleccionado = datos.id_turno ?? null;
    this.abono = !!datos.abono;
    this.turnosDisponibles = datos.turno ? [datos.turno] : [];
    this.submitted = false;
    this.citaDialog = true;
  }

  hideDialog(): void {
    this.citaDialog = false;
  }

  buscarPaciente(): void {
    if (!this.cedula || this.cedula.trim().length === 0) return;
    this.buscandoPaciente = true;
    this.citaService.buscarPacientePorCedula(this.cedula.trim()).subscribe({
      next: (paciente) => {
        this.buscandoPaciente = false;
        this.pacienteEncontrado = paciente;
        if (paciente) {
          this.nombres = `${paciente.nombres || ''} ${paciente.apellidos || ''}`.trim();
          this.messageService.add({ severity: 'success', summary: 'Paciente encontrado', detail: this.nombres });
        } else {
          this.messageService.add({ severity: 'info', summary: 'Paciente nuevo', detail: 'No está registrado aún; ingrese el nombre manualmente.' });
        }
      },
      error: () => {
        this.buscandoPaciente = false;
        this.mostrarError('Error al buscar el paciente.');
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
          this.messageService.add({ severity: 'info', summary: 'Sin turnos', detail: 'No hay horarios disponibles para esa fecha y especialidad.' });
        }
      },
      error: () => {
        this.cargandoTurnos = false;
        this.mostrarError('No se pudieron cargar los turnos disponibles.');
      }
    });
  }

  guardarCita(): void {
    this.submitted = true;

    if (!this.nombres || !this.cedula || !this.fecha || !this.idTurnoSeleccionado) {
      this.mostrarError('Complete nombres, cédula, fecha y hora de la cita.');
      return;
    }

    this.guardando = true;
    const payload = {
      nombres: this.nombres,
      cedula: this.cedula,
      fecha: this.fecha,
      id_turno: this.idTurnoSeleccionado,
      abono: this.abono ? 'DOADBA' : ''
    };

    const peticion = this.editando && this.idCitaEditar
      ? this.citaService.actualizarCita(this.idCitaEditar, payload)
      : this.citaService.crearCita(payload);

    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.citaDialog = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.editando ? 'Cita actualizada correctamente.' : 'Cita registrada correctamente.'
        });
        this.cargarCitas();

        // Igual que en el sistema original: al agendar una cita nueva (no al
        // editar), se genera automáticamente el cobro correspondiente en
        // Recaudación, usando el valor configurado en el horario. Si el
        // paciente pertenece al GAD, se exonera automáticamente.
        if (!this.editando && this.pacienteEncontrado?.id_paciente) {
          const turno = this.turnosDisponibles.find(t => t.id_turno === this.idTurnoSeleccionado);
          if (turno?.id_rol) {
            this.recaudacionService.crearRecaudacion({
              id_paciente: this.pacienteEncontrado.id_paciente,
              id_rol: turno.id_rol,
              fecha: this.fecha,
              valor: turno.amount || 0,
              exonera: !!this.pacienteEncontrado.gad,
              observaciones: 'Generado automáticamente al agendar la cita.'
            }).subscribe({
              error: () => this.mostrarError('La cita se agendó, pero no se pudo generar el cobro en Recaudación. Regístrelo manualmente si corresponde.')
            });
          }
        }
      },
      error: (err) => {
        this.guardando = false;
        this.mostrarError(err?.error?.message || 'No se pudo guardar la cita.');
      }
    });
  }

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
      message: `¿Está seguro de eliminar la cita de "${datos.nombres}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => this.eliminarCita(datos)
    });
  }

  private eliminarCita(datos: Cita): void {
    if (!datos.id_cita) return;
    this.citaService.eliminarCita(datos.id_cita).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cita eliminada.' });
        this.cargarCitas();
      },
      error: () => this.mostrarError('No se pudo eliminar la cita.')
    });
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
