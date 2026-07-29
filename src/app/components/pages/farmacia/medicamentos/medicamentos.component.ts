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
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { CategoriaMedicamento, Laboratorio, Medicamento } from '../../../../interface/Farmacia.interface';
import { FarmaciaService } from '../../../../layout/service/Patronato/farmacia.service';

@Component({
  selector: 'app-medicamentos',
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
    InputTextareaModule,
    TagModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './medicamentos.component.html'
})
export class MedicamentosComponent implements OnInit {

  medicamentos: Medicamento[] = [];
  categorias: CategoriaMedicamento[] = [];
  laboratorios: Laboratorio[] = [];

  medicamentoDialog: boolean = false;
  medicamento: Medicamento = {};
  submitted: boolean = false;
  guardando: boolean = false;

  rowsPerPageOptions: number[] = [10, 20, 50];

  constructor(
    private farmaciaService: FarmaciaService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.cargarMedicamentos();
    this.farmaciaService.getCategorias().subscribe({ next: (data) => (this.categorias = data) , error: (err) => console.error('Error al cargar datos de catálogo:', err) });
    this.farmaciaService.getLaboratorios().subscribe({ next: (data) => (this.laboratorios = data) , error: (err) => console.error('Error al cargar datos de catálogo:', err) });
  }

  cargarMedicamentos(): void {
    this.farmaciaService.getMedicamentos().subscribe({
      next: (data) => (this.medicamentos = data),
      error: () => this.mostrarError('No se pudieron cargar los medicamentos.')
    });
  }

  openNew(): void {
    this.medicamento = {};
    this.submitted = false;
    this.medicamentoDialog = true;
  }

  hideDialog(): void {
    this.medicamentoDialog = false;
  }

  guardarMedicamento(): void {
    this.submitted = true;
    if (!this.medicamento.nombre || !this.medicamento.id_categoriamedicamento || !this.medicamento.id_laboratorio) {
      this.mostrarError('Complete nombre, categoría y laboratorio del medicamento.');
      return;
    }

    this.guardando = true;
    this.farmaciaService.crearMedicamento(this.medicamento).subscribe({
      next: () => {
        this.guardando = false;
        this.medicamentoDialog = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Medicamento registrado correctamente.' });
        this.cargarMedicamentos();
      },
      error: () => {
        this.guardando = false;
        this.mostrarError('No se pudo registrar el medicamento.');
      }
    });
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
