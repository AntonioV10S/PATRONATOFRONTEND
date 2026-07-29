import { Component, OnInit } from '@angular/core';
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
import { RolService } from '../../../layout/service/Patronato/rol.service';
import { Rol } from '../../../interface/Cuenta.interface';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    RippleModule,
    DropdownModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './reportes.component.html'
})
export class ReportesComponent implements OnInit {

  // Filtro mensual compartido
  mesMensual: number = new Date().getMonth() + 1;
  yearMensual: number = new Date().getFullYear();

  // Filtro diario compartido
  fechaDiaria: string = new Date().toISOString().split('T')[0];

  // Filtro anual
  yearAnual: number = new Date().getFullYear();

  // Filtro por lugar
  lugarSeleccionado: string = 'Patronato';
  desdeLugar: string = new Date().toISOString().split('T')[0];
  hastaLugar: string = new Date().toISOString().split('T')[0];

  // Recaudación diaria por rol
  fechaRecaudacion: string = new Date().toISOString().split('T')[0];
  idRolRecaudacion: number | null = null;
  roles: Rol[] = [];

  // Recetas de farmacia
  idEntregaReceta: number | null = null;

  meses = [
    { label: 'Enero', value: 1 }, { label: 'Febrero', value: 2 }, { label: 'Marzo', value: 3 },
    { label: 'Abril', value: 4 }, { label: 'Mayo', value: 5 }, { label: 'Junio', value: 6 },
    { label: 'Julio', value: 7 }, { label: 'Agosto', value: 8 }, { label: 'Septiembre', value: 9 },
    { label: 'Octubre', value: 10 }, { label: 'Noviembre', value: 11 }, { label: 'Diciembre', value: 12 }
  ];

  lugarOptions = [
    { label: 'Patronato', value: 'Patronato' },
    { label: 'Comunidad', value: 'Comunidad' },
    { label: 'Clínica Móvil', value: 'Clinica movil' },
    { label: 'Domicilio', value: 'Domicilio' }
  ];

  generando: string | null = null;

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

  // --- Mensuales ---
  reportePacientesMensual(): void {
    this.generar('pacientesMensual', `/ReportePacientesMensual/${this.mesMensual}/${this.yearMensual}`, 'ReportePacientesMensual.pdf');
  }
  consolidadoMG(): void {
    this.generar('consolidadoMG', `/ConsolidadoMensualMedicinaGeneral/${this.mesMensual}/${this.yearMensual}`, 'ConsolidadoMG.pdf');
  }
  consolidadoRF(): void {
    this.generar('consolidadoRF', `/ConsolidadoMensualTerapia/${this.mesMensual}/${this.yearMensual}`, 'ConsolidadoRF.pdf');
  }
  morbilidadMG(): void {
    this.generar('morbilidadMG', `/MorbilidadMedicinaGeneral/${this.mesMensual}/${this.yearMensual}`, 'MorbilidadMG.pdf');
  }
  morbilidadRF(): void {
    this.generar('morbilidadRF', `/MorbilidadTerapia/${this.mesMensual}/${this.yearMensual}`, 'MorbilidadRF.pdf');
  }
  recaudacionMensual(): void {
    this.generar('recaudacionMensual', `/RecaudacionMensual/${this.mesMensual}/${this.yearMensual}`, 'RecaudacionMensual.pdf');
  }

  // --- Diarios ---
  registroDiarioMG(): void {
    this.generar('diarioMG', `/RegistroDiarioMedicina/${this.fechaDiaria}`, 'RegistroDiarioMG.pdf');
  }
  registroDiarioRF(): void {
    this.generar('diarioRF', `/RegistroDiarioFisica/${this.fechaDiaria}`, 'RegistroDiarioRF.pdf');
  }

  // --- Anual ---
  reportePacientesAnual(): void {
    this.generar('pacientesAnual', `/ReportePacientesAnual/${this.yearAnual}`, 'ReportePacientesAnual.pdf');
  }

  // --- Por lugar ---
  lugarMG(): void {
    this.generar('lugarMG', `/LugarAtencionMedicinaGeneral/${this.lugarSeleccionado}/${this.desdeLugar}/${this.hastaLugar}`, 'LugarAtencionMG.pdf');
  }
  lugarRF(): void {
    this.generar('lugarRF', `/LugarAtencionRehabilitacionFisica/${this.lugarSeleccionado}/${this.desdeLugar}/${this.hastaLugar}`, 'LugarAtencionRF.pdf');
  }

  // --- Recaudación diaria por rol ---
  recaudacionDiariaMG(): void {
    if (!this.idRolRecaudacion) {
      this.messageService.add({ severity: 'warn', summary: 'Falta información', detail: 'Seleccione el servicio/rol.' });
      return;
    }
    this.generar('recaudDiariaMG', `/RecaudacionDiarioMedicinaGeneral/${this.fechaRecaudacion}/${this.idRolRecaudacion}`, 'RecaudacionDiariaMG.pdf');
  }
  recaudacionDiariaRF(): void {
    if (!this.idRolRecaudacion) {
      this.messageService.add({ severity: 'warn', summary: 'Falta información', detail: 'Seleccione el servicio/rol.' });
      return;
    }
    this.generar('recaudDiariaRF', `/RecaudacionDiarioTerapia/${this.fechaRecaudacion}/${this.idRolRecaudacion}`, 'RecaudacionDiariaRF.pdf');
  }

  // --- Recetas de farmacia (ligadas a una entrega ya registrada) ---
  recetaPendiente(): void {
    if (!this.idEntregaReceta) {
      this.messageService.add({ severity: 'warn', summary: 'Falta información', detail: 'Ingrese el N° de entrega.' });
      return;
    }
    this.generar('recetapdf', `/recetapdf/${this.idEntregaReceta}`, 'Receta.pdf');
  }
  recetaFinal(): void {
    if (!this.idEntregaReceta) {
      this.messageService.add({ severity: 'warn', summary: 'Falta información', detail: 'Ingrese el N° de entrega.' });
      return;
    }
    this.generar('recetafinal', `/recetafinal/${this.idEntregaReceta}`, 'RecetaFinal.pdf');
  }
}
