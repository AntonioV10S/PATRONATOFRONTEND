import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { HistoriaClinicaMGService } from '../../../layout/service/Patronato/historia-clinica-mg.service';
import { HistoriaClinicaRFService } from '../../../layout/service/Patronato/historia-clinica-rf.service';

interface FilaAuditoria {
  especialidad: string;
  id: number;
  fecha: string;
  paciente: string;
  medico: string;
  estado: string;
  detalle: string;
}

@Component({
  selector: 'app-auditoria-integridad',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, PanelModule, ButtonModule, RippleModule, InputTextModule, DropdownModule, CheckboxModule, TagModule, ToastModule],
  providers: [MessageService],
  templateUrl: './auditoria-integridad.component.html'
})
export class AuditoriaIntegridadComponent implements OnInit {

  cargando: boolean = false;
  filas: FilaAuditoria[] = [];
  filasFiltradas: FilaAuditoria[] = [];

  resumen = { total: 0, integros: 0, alterados: 0, noDescifrables: 0, sinContenido: 0 };

  soloProblemas: boolean = false;
  busqueda: string = '';

  estadoSeveridad: Record<string, 'success' | 'danger' | 'warning' | 'secondary'> = {
    'Íntegro': 'success',
    'Alterado': 'danger',
    'No descifrable': 'warning',
    'Sin contenido': 'secondary'
  };

  rowsPerPageOptions: number[] = [10, 20, 50, 100];

  constructor(
    private historiaMGService: HistoriaClinicaMGService,
    private historiaRFService: HistoriaClinicaRFService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.ejecutarAuditoria();
  }

  ejecutarAuditoria(): void {
    this.cargando = true;
    this.filas = [];

    this.historiaMGService.verificarTodas().subscribe({
      next: (resMG) => {
        const filasMG: FilaAuditoria[] = (resMG.result || []).map((r: any) => ({
          especialidad: 'Medicina General',
          id: r.id_historia_mg,
          fecha: r.fecha,
          paciente: r.paciente,
          medico: r.medico,
          estado: r.estado,
          detalle: r.detalle
        }));

        this.historiaRFService.verificarTodas().subscribe({
          next: (resRF) => {
            const filasRF: FilaAuditoria[] = (resRF.result || []).map((r: any) => ({
              especialidad: 'Rehabilitación Física',
              id: r.id_rf,
              fecha: r.fecha,
              paciente: r.paciente,
              medico: r.medico,
              estado: r.estado,
              detalle: r.detalle
            }));

            this.cargando = false;
            this.filas = [...filasMG, ...filasRF];
            this.resumen = {
              total: (resMG.resumen?.total || 0) + (resRF.resumen?.total || 0),
              integros: (resMG.resumen?.integros || 0) + (resRF.resumen?.integros || 0),
              alterados: (resMG.resumen?.alterados || 0) + (resRF.resumen?.alterados || 0),
              noDescifrables: (resMG.resumen?.noDescifrables || 0) + (resRF.resumen?.noDescifrables || 0),
              sinContenido: (resMG.resumen?.sinContenido || 0) + (resRF.resumen?.sinContenido || 0)
            };
            this.aplicarFiltros();
          },
          error: () => {
            this.cargando = false;
            this.mostrarError('No se pudo auditar Rehabilitación Física.');
          }
        });
      },
      error: () => {
        this.cargando = false;
        this.mostrarError('No se pudo auditar Medicina General.');
      }
    });
  }

  aplicarFiltros(): void {
    const termino = this.busqueda.trim().toLowerCase();
    this.filasFiltradas = this.filas.filter(f => {
      const coincideBusqueda = !termino ||
        f.paciente.toLowerCase().includes(termino) ||
        f.medico.toLowerCase().includes(termino) ||
        String(f.id).includes(termino);
      const coincideProblema = !this.soloProblemas || f.estado !== 'Íntegro';
      return coincideBusqueda && coincideProblema;
    });
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
