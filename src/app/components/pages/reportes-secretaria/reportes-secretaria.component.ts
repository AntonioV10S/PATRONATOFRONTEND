import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ReportesService } from '../../../layout/service/Patronato/reportes.service';
import { RolService } from '../../../layout/service/Patronato/rol.service';
import { Rol } from '../../../interface/Cuenta.interface';

@Component({
  selector: 'app-reportes-secretaria',
  standalone: true,
  imports: [CommonModule, FormsModule, PanelModule, ButtonModule, RippleModule, DropdownModule, InputTextModule, ToastModule],
  providers: [MessageService],
  templateUrl: './reportes-secretaria.component.html'
})
export class ReportesSecretariaComponent implements OnInit {

  roles: Rol[] = [];
  generando: string | null = null;

  // Control Diario
  fechaControlDiario: string = new Date().toISOString().split('T')[0];
  idRolControlDiario: number | null = null;

  // Consolidado Mensual
  mesConsolidado: number = new Date().getMonth() + 1;
  yearConsolidado: number = new Date().getFullYear();

  meses = [
    { label: 'Enero', value: 1 }, { label: 'Febrero', value: 2 }, { label: 'Marzo', value: 3 },
    { label: 'Abril', value: 4 }, { label: 'Mayo', value: 5 }, { label: 'Junio', value: 6 },
    { label: 'Julio', value: 7 }, { label: 'Agosto', value: 8 }, { label: 'Septiembre', value: 9 },
    { label: 'Octubre', value: 10 }, { label: 'Noviembre', value: 11 }, { label: 'Diciembre', value: 12 }
  ];

  constructor(
    private reportesService: ReportesService,
    private rolService: RolService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.rolService.getRoles().subscribe({ next: (data) => (this.roles = data) , error: (err) => console.error('Error al cargar datos de catálogo:', err) });
  }

  private generar(clave: string, ruta: string, nombreArchivo: string): void {
    this.generando = clave;
    this.reportesService.abrirReporte(ruta).subscribe({
      next: (blob) => {
        this.generando = null;
        this.reportesService.descargar(blob, nombreArchivo);
      },
      error: () => {
        this.generando = null;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar el reporte. Verifique que existan datos para el período seleccionado.' });
      }
    });
  }

  controlDiarioMG(): void {
    if (!this.idRolControlDiario) { this.avisarFalta(); return; }
    this.generar('diarioMG', `/RecaudacionDiarioMedicinaGeneral/${this.fechaControlDiario}/${this.idRolControlDiario}`, 'ControlDiarioMG.pdf');
  }
  controlDiarioRF(): void {
    if (!this.idRolControlDiario) { this.avisarFalta(); return; }
    this.generar('diarioRF', `/RecaudacionDiarioTerapia/${this.fechaControlDiario}/${this.idRolControlDiario}`, 'ControlDiarioRF.pdf');
  }
  consolidadoMensual(): void {
    this.generar('consolidado', `/RecaudacionMensual/${this.mesConsolidado}/${this.yearConsolidado}`, 'ConsolidadoMensualRecaudacion.pdf');
  }

  private avisarFalta(): void {
    this.messageService.add({ severity: 'warn', summary: 'Falta información', detail: 'Seleccione el servicio/rol.' });
  }
}
