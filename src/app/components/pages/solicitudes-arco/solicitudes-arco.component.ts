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
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { SolicitudArco } from '../../../interface/Lopdp.interface';
import { Paciente } from '../../../interface/Paciente.interface';
import { LopdpService } from '../../../layout/service/Patronato/lopdp.service';
import { PacienteService } from '../../../layout/service/Patronato/paciente.service';

@Component({
  selector: 'app-solicitudes-arco',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, PanelModule, ButtonModule, RippleModule,
    InputTextModule, InputTextareaModule, DropdownModule, TagModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './solicitudes-arco.component.html'
})
export class SolicitudesArcoComponent implements OnInit {

  solicitudes: SolicitudArco[] = [];
  solicitud: SolicitudArco = {};
  guardando: boolean = false;

  editando: SolicitudArco | null = null;

  busquedaCedula: string = '';
  pacienteEncontrado: Paciente | null = null;
  buscando: boolean = false;

  tipoOptions = [
    { label: 'Acceso', value: 'Acceso' },
    { label: 'Rectificación', value: 'Rectificación' },
    { label: 'Cancelación', value: 'Cancelación' },
    { label: 'Oposición', value: 'Oposición' },
    { label: 'Portabilidad', value: 'Portabilidad' }
  ];

  estadoOptions = [
    { label: 'Pendiente', value: 'Pendiente' },
    { label: 'En proceso', value: 'En proceso' },
    { label: 'Resuelta', value: 'Resuelta' },
    { label: 'Rechazada', value: 'Rechazada' }
  ];

  rowsPerPageOptions: number[] = [10, 20, 50];

  constructor(
    private lopdpService: LopdpService,
    private pacienteService: PacienteService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.lopdpService.getSolicitudesArco().subscribe({
      next: (data) => (this.solicitudes = data),
      error: () => this.mostrarError('No se pudieron cargar las solicitudes.')
    });
  }

  buscarPaciente(): void {
    if (!this.busquedaCedula) return;
    this.buscando = true;
    this.pacienteService.buscarPorCedula(this.busquedaCedula.trim()).subscribe({
      next: (resultado) => {
        this.buscando = false;
        this.pacienteEncontrado = resultado;
        if (resultado?.id_paciente) {
          this.solicitud.id_paciente = resultado.id_paciente;
        } else {
          this.mostrarError('No existe un paciente con esa cédula.');
        }
      },
      error: () => {
        this.buscando = false;
        this.mostrarError('Error al buscar el paciente.');
      }
    });
  }

  registrarSolicitud(): void {
    if (!this.solicitud.id_paciente || !this.solicitud.tipo_solicitud || !this.solicitud.descripcion || !this.solicitud.fecha_solicitud) {
      this.mostrarError('Busque al paciente y complete tipo, fecha y descripción de la solicitud.');
      return;
    }
    this.guardando = true;
    this.lopdpService.crearSolicitudArco(this.solicitud).subscribe({
      next: () => {
        this.guardando = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Solicitud registrada correctamente.' });
        this.solicitud = {};
        this.pacienteEncontrado = null;
        this.busquedaCedula = '';
        this.cargarSolicitudes();
      },
      error: (err) => {
        this.guardando = false;
        this.mostrarError(err?.error?.mensaje || 'No se pudo registrar la solicitud.');
      }
    });
  }

  abrirResolucion(datos: SolicitudArco): void {
    this.editando = { ...datos, estado: 'Resuelta' };
  }

  guardarResolucion(): void {
    if (!this.editando?.id_solicitud || !this.editando?.resolucion) {
      this.mostrarError('Escriba la resolución antes de guardar.');
      return;
    }
    this.lopdpService.resolverSolicitudArco(this.editando.id_solicitud, {
      estado: this.editando.estado || 'Resuelta',
      resolucion: this.editando.resolucion
    }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Solicitud actualizada.' });
        this.editando = null;
        this.cargarSolicitudes();
      },
      error: () => this.mostrarError('No se pudo actualizar la solicitud.')
    });
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
