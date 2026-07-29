import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { Egreso } from '../../../interface/Egreso.interface';
import { EgresoService } from '../../../layout/service/Patronato/egreso.service';

@Component({
  selector: 'app-egresos',
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
    InputTextareaModule,
    InputNumberModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './egresos.component.html'
})
export class EgresosComponent implements OnInit {

  egresos: Egreso[] = [];

  egresoDialog: boolean = false;
  egreso: Egreso = {};
  submitted: boolean = false;
  editando: boolean = false;
  guardando: boolean = false;

  rowsPerPageOptions: number[] = [10, 20, 50];
  busquedaFecha: string = '';

  get totalEgresos(): number {
    return this.egresos.reduce((acc, e) => acc + (parseFloat(String(e.valor)) || 0), 0);
  }

  constructor(
    private egresoService: EgresoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.cargarEgresos();
  }

  cargarEgresos(): void {
    this.egresoService.getEgresos().subscribe({
      next: (data) => (this.egresos = data),
      error: () => this.mostrarError('No se pudieron cargar los egresos.')
    });
  }

  openNew(): void {
    this.egreso = { fecha: new Date().toISOString().split('T')[0] };
    this.submitted = false;
    this.editando = false;
    this.egresoDialog = true;
  }

  editarEgreso(datos: Egreso): void {
    this.egreso = { ...datos };
    this.submitted = false;
    this.editando = true;
    this.egresoDialog = true;
  }

  hideDialog(): void {
    this.egresoDialog = false;
  }

  guardarEgreso(): void {
    this.submitted = true;
    if (!this.egreso.descripcion || !this.egreso.fecha || this.egreso.valor == null) {
      this.mostrarError('Complete fecha, valor y descripción del egreso.');
      return;
    }

    this.guardando = true;
    const peticion = this.editando && this.egreso.id_egreso
      ? this.egresoService.actualizarEgreso(this.egreso.id_egreso, this.egreso)
      : this.egresoService.crearEgreso(this.egreso);

    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.egresoDialog = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.editando ? 'Egreso actualizado correctamente.' : 'Egreso registrado correctamente.'
        });
        this.cargarEgresos();
      },
      error: () => {
        this.guardando = false;
        this.mostrarError('No se pudo guardar el egreso.');
      }
    });
  }

  confirmarEliminar(datos: Egreso): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el egreso "${datos.descripcion}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        if (!datos.id_egreso) return;
        this.egresoService.eliminarEgreso(datos.id_egreso).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Egreso eliminado.' });
            this.cargarEgresos();
          },
          error: () => this.mostrarError('No se pudo eliminar el egreso.')
        });
      }
    });
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
