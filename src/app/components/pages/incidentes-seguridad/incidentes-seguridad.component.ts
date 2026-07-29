import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { IncidenteSeguridad } from '../../../interface/Lopdp.interface';
import { LopdpService } from '../../../layout/service/Patronato/lopdp.service';

@Component({
  selector: 'app-incidentes-seguridad',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, PanelModule, ButtonModule, RippleModule,
    InputTextModule, InputTextareaModule, DropdownModule, CheckboxModule, TagModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './incidentes-seguridad.component.html'
})
export class IncidentesSeguridadComponent implements OnInit {

  incidentes: IncidenteSeguridad[] = [];
  incidente: IncidenteSeguridad = { estado: 'Abierto' };
  guardando: boolean = false;

  editando: IncidenteSeguridad | null = null;

  tipoOptions = [
    { label: 'Pérdida de llave criptográfica', value: 'Pérdida de llave criptográfica' },
    { label: 'Acceso no autorizado', value: 'Acceso no autorizado' },
    { label: 'Falla de disponibilidad', value: 'Falla de disponibilidad' },
    { label: 'Error de configuración', value: 'Error de configuración' },
    { label: 'Otro', value: 'Otro' }
  ];

  estadoOptions = [
    { label: 'Abierto', value: 'Abierto' },
    { label: 'En resolución', value: 'En resolución' },
    { label: 'Cerrado', value: 'Cerrado' }
  ];

  rowsPerPageOptions: number[] = [10, 20, 50];

  constructor(private lopdpService: LopdpService, private messageService: MessageService) {}

  ngOnInit(): void {
    this.cargarIncidentes();
  }

  cargarIncidentes(): void {
    this.lopdpService.getIncidentes().subscribe({
      next: (data) => (this.incidentes = data),
      error: () => this.mostrarError('No se pudieron cargar los incidentes.')
    });
  }

  limpiarFormulario(): void {
    this.incidente = { estado: 'Abierto' };
    this.editando = null;
  }

  registrarIncidente(): void {
    if (!this.incidente.fecha_incidente || !this.incidente.tipo || !this.incidente.descripcion) {
      this.mostrarError('Complete fecha, tipo y descripción del incidente.');
      return;
    }
    this.guardando = true;
    this.lopdpService.crearIncidente(this.incidente).subscribe({
      next: () => {
        this.guardando = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Incidente registrado correctamente.' });
        this.limpiarFormulario();
        this.cargarIncidentes();
      },
      error: (err) => {
        this.guardando = false;
        this.mostrarError(err?.error?.mensaje || 'No se pudo registrar el incidente.');
      }
    });
  }

  editarEstado(datos: IncidenteSeguridad): void {
    this.editando = { ...datos };
  }

  guardarSeguimiento(): void {
    if (!this.editando?.id_incidente) return;
    this.lopdpService.actualizarIncidente(this.editando.id_incidente, this.editando).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Incidente actualizado.' });
        this.editando = null;
        this.cargarIncidentes();
      },
      error: () => this.mostrarError('No se pudo actualizar el incidente.')
    });
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
