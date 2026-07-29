import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { Parametro } from '../../../interface/Parametro.interface';
import { ParametroService } from '../../../layout/service/Patronato/parametro.service';

@Component({
  selector: 'app-parametros',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, PanelModule, ButtonModule, RippleModule,
    InputTextModule, InputNumberModule, DropdownModule, TagModule, ToastModule, ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './parametros.component.html'
})
export class ParametrosComponent implements OnInit {

  parametros: Parametro[] = [];
  busqueda: string = '';

  parametro: Parametro = {};
  editando: boolean = false;
  guardando: boolean = false;

  estadoOptions = [
    { label: 'Habilitado', value: true },
    { label: 'Inhabilitado', value: false }
  ];

  rowsPerPageOptions: number[] = [10, 20, 50];

  constructor(
    private parametroService: ParametroService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.cargarParametros();
    this.openNew();
  }

  get parametrosFiltrados(): Parametro[] {
    const termino = this.busqueda.trim().toLowerCase();
    if (!termino) return this.parametros;
    return this.parametros.filter(p => (p.nombres || '').toLowerCase().includes(termino));
  }

  cargarParametros(): void {
    this.parametroService.getParametros().subscribe({
      next: (data) => (this.parametros = data),
      error: () => this.mostrarError('No se pudieron cargar los parámetros.')
    });
  }

  openNew(): void {
    this.parametro = { estado: true };
    this.editando = false;
  }

  editarParametro(datos: Parametro): void {
    this.parametro = { ...datos };
    this.editando = true;
  }

  guardarParametro(): void {
    if (!this.parametro.nombres) {
      this.mostrarError('Ingrese al menos el nombre del responsable.');
      return;
    }

    this.guardando = true;
    const peticion = this.editando && this.parametro.id_parametros
      ? this.parametroService.actualizarParametro(this.parametro.id_parametros, this.parametro)
      : this.parametroService.crearParametro(this.parametro);

    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.messageService.add({
          severity: 'success', summary: 'Éxito',
          detail: this.editando ? 'Parámetro actualizado correctamente.' : 'Parámetro creado correctamente.'
        });
        this.cargarParametros();
        this.openNew();
      },
      error: (err) => {
        this.guardando = false;
        this.mostrarError(err?.error?.message || 'No se pudo guardar el parámetro.');
      }
    });
  }

  confirmarEliminar(datos: Parametro): void {
    this.confirmationService.confirm({
      message: `¿Eliminar el parámetro de "${datos.nombres}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        if (!datos.id_parametros) return;
        this.parametroService.eliminarParametro(datos.id_parametros).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Parámetro eliminado.' });
            this.cargarParametros();
          },
          error: () => this.mostrarError('No se pudo eliminar el parámetro.')
        });
      }
    });
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
