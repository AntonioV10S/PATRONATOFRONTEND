import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { HistoriaClinicaMG } from '../../../interface/HistoriaClinica.interface';
import { Paciente } from '../../../interface/Paciente.interface';
import { HistoriaClinicaMGService } from '../../../layout/service/Patronato/historia-clinica-mg.service';
import { PacienteService } from '../../../layout/service/Patronato/paciente.service';

@Component({
  selector: 'app-historial-consultas-mg',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, DialogModule, RippleModule, InputTextModule, TableModule, TagModule, ToastModule],
  providers: [MessageService],
  templateUrl: './historial-consultas-mg.component.html'
})
export class HistorialConsultasMgComponent implements OnInit {

  fechaInicial: string = '';
  fechaFinal: string = '';
  busquedaApellido: string = '';

  consultas: HistoriaClinicaMG[] = [];
  consultasFiltradas: HistoriaClinicaMG[] = [];
  cargando: boolean = false;

  detalleDialog: boolean = false;
  detalle: HistoriaClinicaMG | null = null;
  cargandoDetalle: boolean = false;
  pacienteCompleto: Paciente | null = null;

  constructor(
    private historiaService: HistoriaClinicaMGService,
    private pacienteService: PacienteService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Rango amplio por defecto (últimos ~5 años hasta hoy), así la
    // búsqueda por apellido funciona de inmediato sin obligar a elegir
    // fechas primero. El usuario puede acotar el rango cuando quiera.
    const hoy = new Date();
    this.fechaFinal = hoy.toISOString().split('T')[0];
    const inicio = new Date(hoy);
    inicio.setFullYear(inicio.getFullYear() - 5);
    this.fechaInicial = inicio.toISOString().split('T')[0];
    this.filtrar();
  }

  filtrar(): void {
    if (!this.fechaInicial || !this.fechaFinal) {
      this.mostrarError('Seleccione la fecha inicial y final.');
      return;
    }
    this.cargando = true;
    this.historiaService.filtrarPorFecha(this.fechaInicial, this.fechaFinal).subscribe({
      next: (data) => {
        this.cargando = false;
        this.consultas = data;
        this.aplicarBusqueda();
      },
      error: () => {
        this.cargando = false;
        this.mostrarError('No se pudieron cargar las consultas para ese rango de fechas.');
      }
    });
  }

  aplicarBusqueda(): void {
    const termino = this.busquedaApellido.trim().toLowerCase();
    this.consultasFiltradas = !termino
      ? this.consultas
      : this.consultas.filter(c => {
          const p = c.paciente || {};
          return (p.apellidos || '').toLowerCase().includes(termino) ||
                 (p.nombres || '').toLowerCase().includes(termino) ||
                 (p.cedula || '').includes(termino) ||
                 (c.medico?.nombres || '').toLowerCase().includes(termino);
        });
  }

  verDatosConsulta(fila: HistoriaClinicaMG): void {
    if (!fila.id_historia_mg) return;
    this.cargandoDetalle = true;
    this.detalleDialog = true;
    this.detalle = null;
    this.pacienteCompleto = null;

    this.historiaService.verDetalle(fila.id_historia_mg).subscribe({
      next: (data) => {
        this.cargandoDetalle = false;
        this.detalle = data;
      },
      error: (err) => {
        this.cargandoDetalle = false;
        this.detalleDialog = false;
        this.mostrarError(err?.error?.message || 'No se pudo descifrar el registro.');
      }
    });

    // Datos de afiliación, antecedentes, hábitos y familiares que registró
    // Secretaría — se muestran junto con la consulta para tener el
    // expediente completo en una sola pantalla.
    if (fila.id_paciente) {
      this.pacienteService.getPacientePorId(fila.id_paciente).subscribe({
        next: (data) => (this.pacienteCompleto = data),
        error: () => { /* si falla, el modal igual muestra la consulta */ }
      });
    }
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
