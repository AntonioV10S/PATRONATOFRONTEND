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
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { Recaudacion } from '../../../interface/Recaudacion.interface';
import { Rol } from '../../../interface/Cuenta.interface';
import { Paciente } from '../../../interface/Paciente.interface';
import { RecaudacionService } from '../../../layout/service/Patronato/recaudacion.service';
import { RolService } from '../../../layout/service/Patronato/rol.service';
import { PacienteService } from '../../../layout/service/Patronato/paciente.service';

@Component({
  selector: 'app-recaudacion',
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
    InputNumberModule,
    InputSwitchModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './recaudacion.component.html'
})
export class RecaudacionComponent implements OnInit {

  recaudaciones: Recaudacion[] = [];
  roles: Rol[] = [];

  recaudacionDialog: boolean = false;
  recaudacion: Recaudacion = {};
  submitted: boolean = false;
  guardando: boolean = false;

  busquedaCedula: string = '';
  buscandoPaciente: boolean = false;
  pacienteEncontrado: Paciente | null = null;

  rowsPerPageOptions: number[] = [10, 20, 50];

  get totalRecaudado(): number {
    return this.recaudaciones
      .filter(r => !r.exonera)
      .reduce((acc, r) => acc + (parseFloat(String(r.valor)) || 0), 0);
  }

  constructor(
    private recaudacionService: RecaudacionService,
    private rolService: RolService,
    private pacienteService: PacienteService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  // Los registros de recaudación se generan automáticamente al agendar una
  // cita (ver CitasComponent). Esta pantalla queda de solo consulta —
  // ninguna cuenta crea o elimina un registro manualmente desde aquí.
  readonly permiteCrearManual = false;

  ngOnInit(): void {
    this.cargarRecaudaciones();
    this.rolService.getRoles().subscribe({ next: (data) => (this.roles = data) , error: (err) => console.error('Error al cargar datos de catálogo:', err) });
  }

  cargarRecaudaciones(): void {
    this.recaudacionService.getRecaudaciones().subscribe({
      next: (data) => (this.recaudaciones = data),
      error: () => this.mostrarError('No se pudieron cargar las recaudaciones.')
    });
  }

  openNew(): void {
    this.recaudacion = { fecha: new Date().toISOString().split('T')[0], exonera: false };
    this.busquedaCedula = '';
    this.pacienteEncontrado = null;
    this.submitted = false;
    this.recaudacionDialog = true;
  }

  hideDialog(): void {
    this.recaudacionDialog = false;
  }

  buscarPaciente(): void {
    if (!this.busquedaCedula || this.busquedaCedula.trim().length === 0) return;
    this.buscandoPaciente = true;
    this.pacienteService.buscarPorCedula(this.busquedaCedula.trim()).subscribe({
      next: (resultado) => {
        this.buscandoPaciente = false;
        this.pacienteEncontrado = resultado;
        if (resultado) {
          this.recaudacion.id_paciente = resultado.id_paciente;
        } else {
          this.messageService.add({ severity: 'info', summary: 'Sin resultados', detail: 'No existe un paciente con esa cédula.' });
        }
      },
      error: () => {
        this.buscandoPaciente = false;
        this.mostrarError('Error al buscar el paciente.');
      }
    });
  }

  guardarRecaudacion(): void {
    this.submitted = true;
    if (!this.recaudacion.id_paciente || !this.recaudacion.id_rol || !this.recaudacion.fecha ||
        (!this.recaudacion.exonera && this.recaudacion.valor == null)) {
      this.mostrarError('Complete paciente, servicio, fecha y valor (o marque exonerado).');
      return;
    }

    this.guardando = true;
    this.recaudacionService.crearRecaudacion(this.recaudacion).subscribe({
      next: () => {
        this.guardando = false;
        this.recaudacionDialog = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Recaudación registrada correctamente.' });
        this.cargarRecaudaciones();
      },
      error: () => {
        this.guardando = false;
        this.mostrarError('No se pudo registrar la recaudación.');
      }
    });
  }

  confirmarEliminar(datos: Recaudacion): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar este registro de recaudación?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        if (!datos.id_recaudacion) return;
        this.recaudacionService.eliminarRecaudacion(datos.id_recaudacion).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Registro eliminado.' });
            this.cargarRecaudaciones();
          },
          error: () => this.mostrarError('No se pudo eliminar el registro.')
        });
      }
    });
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
