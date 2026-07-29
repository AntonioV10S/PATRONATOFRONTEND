import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ReportesService } from '../../../layout/service/Patronato/reportes.service';

@Component({
  selector: 'app-reportes-medico-mg',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, RippleModule, DropdownModule, InputTextModule, ToastModule],
  providers: [MessageService],
  templateUrl: './reportes-medico-mg.component.html'
})
export class ReportesMedicoMgComponent {

  mes: number = new Date().getMonth() + 1;
  year: number = new Date().getFullYear();
  fecha: string = new Date().toISOString().split('T')[0];
  generando: string | null = null;

  meses = [
    { label: 'Enero', value: 1 }, { label: 'Febrero', value: 2 }, { label: 'Marzo', value: 3 },
    { label: 'Abril', value: 4 }, { label: 'Mayo', value: 5 }, { label: 'Junio', value: 6 },
    { label: 'Julio', value: 7 }, { label: 'Agosto', value: 8 }, { label: 'Septiembre', value: 9 },
    { label: 'Octubre', value: 10 }, { label: 'Noviembre', value: 11 }, { label: 'Diciembre', value: 12 }
  ];

  constructor(private reportesService: ReportesService, private messageService: MessageService) {}

  private generar(clave: string, ruta: string, nombreArchivo: string): void {
    this.generando = clave;
    this.reportesService.abrirReporte(ruta).subscribe({
      next: (blob) => { this.generando = null; this.reportesService.descargar(blob, nombreArchivo); },
      error: () => {
        this.generando = null;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar el reporte para el período seleccionado.' });
      }
    });
  }

  registroDiario(): void {
    this.generar('diario', `/RegistroDiarioMedicina/${this.fecha}`, 'RegistroDiarioMG.pdf');
  }
  consolidadoMensual(): void {
    this.generar('consolidado', `/ConsolidadoMensualMedicinaGeneral/${this.mes}/${this.year}`, 'ConsolidadoMG.pdf');
  }
  morbilidad(): void {
    this.generar('morbilidad', `/MorbilidadMedicinaGeneral/${this.mes}/${this.year}`, 'MorbilidadMG.pdf');
  }
}
