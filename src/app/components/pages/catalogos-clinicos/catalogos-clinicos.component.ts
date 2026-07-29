import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { Enfermedad } from '../../../interface/HistoriaClinica.interface';
import { Diagnostico } from '../../../interface/HistoriaClinicaRF.interface';
import { CatalogoClinicoService } from '../../../layout/service/Patronato/catalogo-clinico.service';

@Component({
  selector: 'app-catalogos-clinicos',
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
    TabViewModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './catalogos-clinicos.component.html'
})
export class CatalogosClinicosComponent implements OnInit {

  // Enfermedades (Medicina General)
  enfermedades: Enfermedad[] = [];
  enfermedadDialog: boolean = false;
  enfermedad: Enfermedad = {};
  submittedEnfermedad: boolean = false;
  guardandoEnfermedad: boolean = false;

  // Diagnósticos (Rehabilitación Física)
  diagnosticos: Diagnostico[] = [];
  diagnosticoDialog: boolean = false;
  diagnostico: Diagnostico = {};
  submittedDiagnostico: boolean = false;
  guardandoDiagnostico: boolean = false;

  rowsPerPageOptions: number[] = [10, 20, 50];

  constructor(
    private catalogoService: CatalogoClinicoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.cargarEnfermedades();
    this.cargarDiagnosticos();
  }

  // ---------- Enfermedades ----------
  cargarEnfermedades(): void {
    this.catalogoService.getEnfermedades().subscribe({
      next: (data) => (this.enfermedades = data),
      error: () => this.mostrarError('No se pudieron cargar las enfermedades.')
    });
  }

  openNewEnfermedad(): void {
    this.enfermedad = {};
    this.submittedEnfermedad = false;
    this.enfermedadDialog = true;
  }

  editarEnfermedad(datos: Enfermedad): void {
    this.enfermedad = { ...datos };
    this.submittedEnfermedad = false;
    this.enfermedadDialog = true;
  }

  guardarEnfermedad(): void {
    this.submittedEnfermedad = true;
    if (!this.enfermedad.enfermedad) return;

    this.guardandoEnfermedad = true;
    const peticion = this.enfermedad.id_enfermedad
      ? this.catalogoService.actualizarEnfermedad(this.enfermedad)
      : this.catalogoService.crearEnfermedad(this.enfermedad);

    peticion.subscribe({
      next: () => {
        this.guardandoEnfermedad = false;
        this.enfermedadDialog = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Enfermedad guardada correctamente.' });
        this.cargarEnfermedades();
      },
      error: () => {
        this.guardandoEnfermedad = false;
        this.mostrarError('No se pudo guardar la enfermedad.');
      }
    });
  }

  confirmarEliminarEnfermedad(datos: Enfermedad): void {
    this.confirmationService.confirm({
      message: `¿Eliminar "${datos.enfermedad}" del catálogo?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        if (!datos.id_enfermedad) return;
        this.catalogoService.eliminarEnfermedad(datos.id_enfermedad).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Enfermedad eliminada.' });
            this.cargarEnfermedades();
          },
          error: () => this.mostrarError('No se pudo eliminar. Puede estar en uso en alguna historia clínica.')
        });
      }
    });
  }

  // ---------- Diagnósticos ----------
  cargarDiagnosticos(): void {
    this.catalogoService.getDiagnosticos().subscribe({
      next: (data) => (this.diagnosticos = data),
      error: () => this.mostrarError('No se pudieron cargar los diagnósticos.')
    });
  }

  openNewDiagnostico(): void {
    this.diagnostico = {};
    this.submittedDiagnostico = false;
    this.diagnosticoDialog = true;
  }

  editarDiagnostico(datos: Diagnostico): void {
    this.diagnostico = { ...datos };
    this.submittedDiagnostico = false;
    this.diagnosticoDialog = true;
  }

  guardarDiagnostico(): void {
    this.submittedDiagnostico = true;
    if (!this.diagnostico.diagnostico) return;

    this.guardandoDiagnostico = true;
    const peticion = this.diagnostico.id_diagnostico
      ? this.catalogoService.actualizarDiagnostico(this.diagnostico)
      : this.catalogoService.crearDiagnostico(this.diagnostico);

    peticion.subscribe({
      next: () => {
        this.guardandoDiagnostico = false;
        this.diagnosticoDialog = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Diagnóstico guardado correctamente.' });
        this.cargarDiagnosticos();
      },
      error: () => {
        this.guardandoDiagnostico = false;
        this.mostrarError('No se pudo guardar el diagnóstico.');
      }
    });
  }

  confirmarEliminarDiagnostico(datos: Diagnostico): void {
    this.confirmationService.confirm({
      message: `¿Eliminar "${datos.diagnostico}" del catálogo?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        if (!datos.id_diagnostico) return;
        this.catalogoService.eliminarDiagnostico(datos.id_diagnostico).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Diagnóstico eliminado.' });
            this.cargarDiagnosticos();
          },
          error: () => this.mostrarError('No se pudo eliminar. Puede estar en uso en alguna historia clínica.')
        });
      }
    });
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
