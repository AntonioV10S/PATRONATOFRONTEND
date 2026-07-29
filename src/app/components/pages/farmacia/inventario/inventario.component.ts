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
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { Inventario, Medicamento } from '../../../../interface/Farmacia.interface';
import { FarmaciaService } from '../../../../layout/service/Patronato/farmacia.service';

@Component({
  selector: 'app-inventario',
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
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './inventario.component.html'
})
export class InventarioComponent implements OnInit {

  inventario: Inventario[] = [];
  medicamentos: Medicamento[] = [];

  inventarioDialog: boolean = false;
  registro: Inventario = {};
  submitted: boolean = false;
  guardando: boolean = false;

  editarExistenciaDialog: boolean = false;
  registroEditar: Inventario | null = null;
  nuevaExistencia: number = 0;

  rowsPerPageOptions: number[] = [10, 20, 50];

  constructor(
    private farmaciaService: FarmaciaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.cargarInventario();
    this.farmaciaService.getMedicamentos().subscribe({ next: (data) => (this.medicamentos = data) , error: (err) => console.error('Error al cargar datos de catálogo:', err) });
  }

  cargarInventario(): void {
    this.farmaciaService.getInventario().subscribe({
      next: (data) => (this.inventario = data),
      error: () => this.mostrarError('No se pudo cargar el inventario.')
    });
  }

  openNew(): void {
    this.registro = {};
    this.submitted = false;
    this.inventarioDialog = true;
  }

  hideDialog(): void {
    this.inventarioDialog = false;
  }

  guardarRegistro(): void {
    this.submitted = true;
    if (!this.registro.id_medicamento || this.registro.existencias == null || !this.registro.fechaexp) {
      this.mostrarError('Complete medicamento, existencias y fecha de expiración.');
      return;
    }

    this.guardando = true;
    this.farmaciaService.crearInventario(this.registro).subscribe({
      next: () => {
        this.guardando = false;
        this.inventarioDialog = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Lote de inventario registrado.' });
        this.cargarInventario();
      },
      error: () => {
        this.guardando = false;
        this.mostrarError('No se pudo registrar el lote de inventario.');
      }
    });
  }

  abrirEditarExistencia(datos: Inventario): void {
    this.registroEditar = datos;
    this.nuevaExistencia = datos.existencias || 0;
    this.editarExistenciaDialog = true;
  }

  guardarExistencia(): void {
    if (!this.registroEditar?.id_inventario) return;
    this.farmaciaService.actualizarExistencia(this.registroEditar.id_inventario, this.nuevaExistencia).subscribe({
      next: () => {
        this.editarExistenciaDialog = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Existencia actualizada.' });
        this.cargarInventario();
      },
      error: () => this.mostrarError('No se pudo actualizar la existencia.')
    });
  }

  confirmarDesechar(datos: Inventario): void {
    this.confirmationService.confirm({
      message: `¿Marcar este lote de "${datos.nombre_medicamento}" como desechado? Dejará de aparecer como stock disponible.`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, desechar',
      rejectLabel: 'Cancelar',
      accept: () => {
        if (!datos.id_inventario) return;
        this.farmaciaService.marcarDesechado(datos.id_inventario).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Lote marcado como desechado.' });
            this.cargarInventario();
          },
          error: () => this.mostrarError('No se pudo desechar el lote.')
        });
      }
    });
  }

  diasParaVencer(fechaexp?: string): number | null {
    if (!fechaexp) return null;
    const hoy = new Date();
    const exp = new Date(fechaexp);
    const diffMs = exp.getTime() - hoy.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
