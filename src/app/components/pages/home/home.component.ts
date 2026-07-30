import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

import { AuthService } from '../../../middleware/auth.service';
import { CuentaService } from '../../../layout/service/Patronato/cuenta.service';
import { PacienteService } from '../../../layout/service/Patronato/paciente.service';
import { CitaService } from '../../../layout/service/Patronato/cita.service';
import { LopdpService } from '../../../layout/service/Patronato/lopdp.service';
import { HistoriaClinicaMGService } from '../../../layout/service/Patronato/historia-clinica-mg.service';
import { HistoriaClinicaRFService } from '../../../layout/service/Patronato/historia-clinica-rf.service';
import { EntregaService } from '../../../layout/service/Patronato/entrega.service';
import { FarmaciaService } from '../../../layout/service/Patronato/farmacia.service';

@Component({
  selector: 'app-mypage',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, RippleModule],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

  nombre: string = '';
  rol: string | null = null;
  cargando: boolean = true;
  hoy: string = new Date().toISOString().split('T')[0];

  // Métricas por rol (se llenan solo las que aplican, el resto queda en 0)
  totalCuentas = 0;
  incidentesAbiertos = 0;
  solicitudesArcoPendientes = 0;

  citasHoy = 0;
  totalPacientes = 0;

  citasAtendidas = 0;
  citasPendientes = 0;
  pacientesNuevos = 0;
  pacientesSeguimiento = 0;

  recetasPendientes = 0;
  stockBajo = 0;
  porVencer = 0;

  constructor(
    private authService: AuthService,
    private cuentaService: CuentaService,
    private pacienteService: PacienteService,
    private citaService: CitaService,
    private lopdpService: LopdpService,
    private historiaMGService: HistoriaClinicaMGService,
    private historiaRFService: HistoriaClinicaRFService,
    private entregaService: EntregaService,
    private farmaciaService: FarmaciaService
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.getUsuario();
    this.nombre = usuario?.nombres || '';
    this.rol = usuario?.rol || null;
    this.cargarMetricas();
  }

  private cargarMetricas(): void {
    this.cargando = false;

    switch (this.rol) {
      case 'Administrador':
        this.cuentaService.getCuentas().subscribe({
          next: (data) => (this.totalCuentas = data.filter(c => c.estado).length),
          error: () => {}
        });
        this.lopdpService.getIncidentes().subscribe({
          next: (data) => (this.incidentesAbiertos = data.filter(i => i.estado === 'Abierto').length),
          error: () => {}
        });
        this.lopdpService.getSolicitudesArco().subscribe({
          next: (data) => (this.solicitudesArcoPendientes = data.filter(s => s.estado === 'Pendiente').length),
          error: () => {}
        });
        break;

      case 'Secretaría':
        this.citaService.getCitas().subscribe({
          next: (data) => (this.citasHoy = data.filter(c => c.fecha === this.hoy).length),
          error: () => {}
        });
        this.pacienteService.getPacientes().subscribe({
          next: (data) => (this.totalPacientes = data.length),
          error: () => {}
        });
        this.lopdpService.getSolicitudesArco().subscribe({
          next: (data) => (this.solicitudesArcoPendientes = data.filter(s => s.estado === 'Pendiente').length),
          error: () => {}
        });
        break;

      case 'Medicina General':
        this.historiaMGService.getEstadisticas(this.hoy, this.hoy, 'Medicina General').subscribe({
          next: (data) => {
            this.citasAtendidas = data.citasAtendidas || 0;
            this.citasPendientes = data.citasPendientes || 0;
            this.pacientesNuevos = data.pacientesNuevos || 0;
            this.pacientesSeguimiento = data.pacientesSeguimiento || 0;
          },
          error: () => {}
        });
        break;

      case 'Rehabilitación Física':
        this.historiaRFService.getEstadisticas(this.hoy, this.hoy, 'Rehabilitación Física').subscribe({
          next: (data) => {
            this.citasAtendidas = data.citasAtendidas || 0;
            this.citasPendientes = data.citasPendientes || 0;
            this.pacientesNuevos = data.pacientesNuevos || 0;
            this.pacientesSeguimiento = data.pacientesSeguimiento || 0;
          },
          error: () => {}
        });
        break;

      case 'Farmacia':
        this.entregaService.getPendientes().subscribe({
          next: (data) => (this.recetasPendientes = data.length),
          error: () => {}
        });
        this.farmaciaService.getInventario().subscribe({
          next: (data) => {
            this.stockBajo = data.filter(i => (i.existencias || 0) <= 10).length;
            this.porVencer = data.filter(i => {
              if (!i.fechaexp) return false;
              const dias = Math.ceil((new Date(i.fechaexp).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return dias >= 0 && dias <= 30;
            }).length;
          },
          error: () => {}
        });
        break;
    }
  }
}
