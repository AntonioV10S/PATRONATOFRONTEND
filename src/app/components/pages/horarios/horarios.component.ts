import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { Turno } from '../../../interface/Cita.interface';
import { Rol } from '../../../interface/Cuenta.interface';
import { TurnoService } from '../../../layout/service/Patronato/turno.service';
import { RolService } from '../../../layout/service/Patronato/rol.service';

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    PanelModule,
    ToolbarModule,
    ButtonModule,
    RippleModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    InputNumberModule,
    InputSwitchModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './horarios.component.html'
})
export class HorariosComponent implements OnInit {

  turnos: Turno[] = [];
  roles: Rol[] = [];
  busqueda: string = '';

  turno: Turno = {};
  submitted: boolean = false;
  editando: boolean = false;
  guardando: boolean = false;

  rowsPerPageOptions: number[] = [10, 20, 50];

  constructor(
    private turnoService: TurnoService,
    private rolService: RolService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.cargarTurnos();
    this.rolService.getRoles().subscribe({ next: (data) => (this.roles = data) , error: (err) => console.error('Error al cargar datos de catálogo:', err) });
  }

  get turnosFiltrados(): Turno[] {
    const termino = this.busqueda.trim().toLowerCase();
    if (!termino) return this.turnos;
    return this.turnos.filter(t => (t.hora || '').toLowerCase().includes(termino));
  }

  cargarTurnos(): void {
    this.turnoService.getTurnos().subscribe({
      next: (data) => (this.turnos = data),
      error: () => this.mostrarError('No se pudieron cargar los horarios.')
    });
  }

  openNew(): void {
    this.turno = { estado: true, amount: 1 };
    this.submitted = false;
    this.editando = false;
  }

  editarTurno(datos: Turno): void {
    this.turno = { ...datos };
    this.submitted = false;
    this.editando = true;
  }

  guardarTurno(): void {
    this.submitted = true;
    if (!this.turno.hora || !this.turno.id_rol) return;

    this.guardando = true;
    const peticion = this.editando && this.turno.id_turno
      ? this.turnoService.actualizarTurno(this.turno.id_turno, this.turno)
      : this.turnoService.crearTurno(this.turno);

    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.editando ? 'Horario actualizado correctamente.' : 'Horario creado correctamente.'
        });
        this.cargarTurnos();
        this.openNew();
      },
      error: () => {
        this.guardando = false;
        this.mostrarError('No se pudo guardar el horario.');
      }
    });
  }

  confirmarEliminar(datos: Turno): void {
    this.confirmationService.confirm({
      message: `¿Eliminar el horario de las ${datos.hora} (${datos.rol?.rol})?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        if (!datos.id_turno) return;
        this.turnoService.eliminarTurno(datos.id_turno).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Horario eliminado.' });
            this.cargarTurnos();
          },
          error: () => this.mostrarError('No se pudo eliminar el horario. Puede tener citas ya agendadas.')
        });
      }
    });
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
