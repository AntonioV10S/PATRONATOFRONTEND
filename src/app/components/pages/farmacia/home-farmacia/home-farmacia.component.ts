import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { PanelModule } from 'primeng/panel';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { Entrega } from '../../../../interface/Entrega.interface';
import { Inventario } from '../../../../interface/Farmacia.interface';
import { EntregaService } from '../../../../layout/service/Patronato/entrega.service';
import { FarmaciaService } from '../../../../layout/service/Patronato/farmacia.service';
import { ReportesService } from '../../../../layout/service/Patronato/reportes.service';

@Component({
  selector: 'app-home-farmacia',
  standalone: true,
  imports: [CommonModule, ButtonModule, RippleModule, PanelModule, ToastModule],
  providers: [MessageService],
  templateUrl: './home-farmacia.component.html'
})
export class HomeFarmaciaComponent implements OnInit {

  recetasPorEntregar: Entrega[] = [];
  medicamentosEntregados: Entrega[] = [];
  medicamentosPorAcabarse: Inventario[] = [];
  medicamentosPorExpirar: (Inventario & { diasRestantes: number })[] = [];

  constructor(
    private entregaService: EntregaService,
    private farmaciaService: FarmaciaService,
    private reportesService: ReportesService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.entregaService.getPendientes().subscribe({ next: (data) => (this.recetasPorEntregar = data) , error: (err) => console.error('Error al cargar datos de catálogo:', err) });
    this.entregaService.getEntregadas().subscribe({ next: (data) => (this.medicamentosEntregados = data.slice(0, 10)) , error: (err) => console.error('Error al cargar datos de catálogo:', err) });

    this.farmaciaService.getInventario().subscribe({
      next: (data) => {
        this.medicamentosPorAcabarse = data.filter(i => (i.existencias || 0) <= 10);
        this.medicamentosPorExpirar = data
          .map(i => ({ ...i, diasRestantes: this.diasParaVencer(i.fechaexp) }))
          .filter(i => i.diasRestantes <= 30);
      },
      error: (err) => console.error('Error al cargar el inventario:', err)
    });
  }

  private diasParaVencer(fechaexp?: string): number {
    if (!fechaexp) return 9999;
    const hoy = new Date();
    const exp = new Date(fechaexp);
    return Math.ceil((exp.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  }

  imprimirReceta(entrega: Entrega): void {
    if (!entrega.id_entrega) return;
    this.reportesService.abrirReporte(`/recetafinal/${entrega.id_entrega}`).subscribe({
      next: (blob) => this.reportesService.descargar(blob, 'Receta.pdf'),
      error: () => this.mostrarError('No se pudo generar la receta.')
    });
  }

  desechar(datos: Inventario): void {
    if (!datos.id_inventario) return;
    this.farmaciaService.marcarDesechado(datos.id_inventario).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Lote marcado como desechado.' });
        this.medicamentosPorExpirar = this.medicamentosPorExpirar.filter(m => m.id_inventario !== datos.id_inventario);
      },
      error: () => this.mostrarError('No se pudo marcar el lote como desechado.')
    });
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
