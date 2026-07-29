import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import { Entrega, DetalleEntrega } from '../../../../interface/Entrega.interface';
import { Paciente } from '../../../../interface/Paciente.interface';
import { Medicamento } from '../../../../interface/Farmacia.interface';
import { EntregaService } from '../../../../layout/service/Patronato/entrega.service';
import { FarmaciaService } from '../../../../layout/service/Patronato/farmacia.service';
import { PacienteService } from '../../../../layout/service/Patronato/paciente.service';

@Component({
  selector: 'app-entregas',
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
    InputNumberModule,
    TabViewModule,
    TagModule,
    ToastModule,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './entregas.component.html'
})
export class EntregasComponent implements OnInit {

  pendientes: Entrega[] = [];
  entregadas: Entrega[] = [];
  medicamentos: Medicamento[] = [];

  // Nueva entrega
  nuevaEntregaDialog: boolean = false;
  busquedaCedula: string = '';
  buscandoPaciente: boolean = false;
  pacienteEncontrado: Paciente | null = null;
  entrega: Entrega = {};
  submitted: boolean = false;
  guardando: boolean = false;

  // Detalle (agregar medicamentos, factura, despacho)
  detalleDialog: boolean = false;
  entregaActiva: Entrega | null = null;
  medicamentosEntrega: any[] = [];
  nuevoDetalle: DetalleEntrega = {};
  medicinaSinRegistro: string = '';
  cantidadSinRegistro: number = 1;
  indicacionesSinRegistro: string = '';
  guardandoDetalle: boolean = false;
  despachando: boolean = false;

  constructor(
    private entregaService: EntregaService,
    private farmaciaService: FarmaciaService,
    private pacienteService: PacienteService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.cargarPendientes();
    this.cargarEntregadas();
    this.farmaciaService.getMedicamentos().subscribe({ next: (data) => (this.medicamentos = data) , error: (err) => console.error('Error al cargar datos de catálogo:', err) });
  }

  cargarPendientes(): void {
    this.entregaService.getPendientes().subscribe({
      next: (data) => (this.pendientes = data),
      error: () => this.mostrarError('No se pudieron cargar las entregas pendientes.')
    });
  }

  cargarEntregadas(): void {
    this.entregaService.getEntregadas().subscribe({
      next: (data) => (this.entregadas = data),
      error: () => this.mostrarError('No se pudieron cargar las entregas despachadas.')
    });
  }

  openNew(): void {
    this.busquedaCedula = '';
    this.pacienteEncontrado = null;
    this.entrega = { Fechaentrega: new Date().toISOString().split('T')[0] };
    this.submitted = false;
    this.nuevaEntregaDialog = true;
  }

  hideDialog(): void {
    this.nuevaEntregaDialog = false;
  }

  buscarPaciente(): void {
    if (!this.busquedaCedula || this.busquedaCedula.trim().length === 0) return;
    this.buscandoPaciente = true;
    this.pacienteService.buscarPorCedula(this.busquedaCedula.trim()).subscribe({
      next: (resultado) => {
        this.buscandoPaciente = false;
        this.pacienteEncontrado = resultado;
        if (resultado) {
          this.entrega.id_paciente = resultado.id_paciente;
        } else {
          this.messageService.add({ severity: 'info', summary: 'Sin resultados', detail: 'No existe un paciente con esa cédula.' });
        }
      },
      error: () => {
        this.buscandoPaciente = false;
        this.mostrarError('Error al buscar el paciente.');
      }
    });
  }

  guardarEntrega(): void {
    this.submitted = true;
    if (!this.entrega.id_paciente) {
      this.mostrarError('Busque y seleccione un paciente antes de guardar.');
      return;
    }

    this.guardando = true;
    this.entregaService.crearEntrega(this.entrega).subscribe({
      next: () => {
        this.guardando = false;
        this.nuevaEntregaDialog = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Entrega registrada como pendiente.' });
        this.cargarPendientes();
      },
      error: () => {
        this.guardando = false;
        this.mostrarError('No se pudo registrar la entrega.');
      }
    });
  }

  abrirDetalle(datos: Entrega): void {
    this.entregaActiva = datos;
    this.nuevoDetalle = { id_entrega: datos.id_entrega };
    this.medicinaSinRegistro = '';
    this.cantidadSinRegistro = 1;
    this.indicacionesSinRegistro = '';
    this.cargarMedicamentosDeEntrega();
    this.detalleDialog = true;
  }

  cargarMedicamentosDeEntrega(): void {
    if (!this.entregaActiva?.id_entrega) return;
    this.entregaService.getMedicamentosDeEntrega(this.entregaActiva.id_entrega).subscribe({
      next: (data) => (this.medicamentosEntrega = data),
      error: () => (this.medicamentosEntrega = [])
    });
  }

  agregarMedicamento(): void {
    if (!this.nuevoDetalle.id_medicamento || !this.nuevoDetalle.cantidadmedicamentos) {
      this.mostrarError('Seleccione un medicamento y una cantidad.');
      return;
    }
    this.guardandoDetalle = true;
    this.entregaService.agregarMedicamento(this.nuevoDetalle).subscribe({
      next: () => {
        this.guardandoDetalle = false;
        this.nuevoDetalle = { id_entrega: this.entregaActiva?.id_entrega };
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Medicamento agregado a la entrega.' });
        this.cargarMedicamentosDeEntrega();
      },
      error: () => {
        this.guardandoDetalle = false;
        this.mostrarError('No se pudo agregar el medicamento.');
      }
    });
  }

  agregarSinRegistro(): void {
    if (!this.medicinaSinRegistro || !this.entregaActiva?.id_entrega) {
      this.mostrarError('Escriba el nombre del medicamento.');
      return;
    }
    this.guardandoDetalle = true;
    this.entregaService.agregarMedicinaSinRegistro({
      id_entrega: this.entregaActiva.id_entrega,
      cantidadmedicamentos: this.cantidadSinRegistro,
      indicaciones: this.indicacionesSinRegistro,
      medicinasinrg: this.medicinaSinRegistro
    }).subscribe({
      next: () => {
        this.guardandoDetalle = false;
        this.medicinaSinRegistro = '';
        this.indicacionesSinRegistro = '';
        this.cantidadSinRegistro = 1;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Medicamento sin registro agregado.' });
        this.cargarMedicamentosDeEntrega();
      },
      error: () => {
        this.guardandoDetalle = false;
        this.mostrarError('No se pudo agregar el medicamento.');
      }
    });
  }

  guardarFactura(): void {
    if (!this.entregaActiva?.id_entrega) return;
    this.entregaService.actualizarFactura(
      this.entregaActiva.id_entrega,
      this.entregaActiva.subtotal || 0,
      this.entregaActiva.descuento || 0,
      this.entregaActiva.totalapagar || 0
    ).subscribe({
      next: () => this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Factura actualizada.' }),
      error: () => this.mostrarError('No se pudo actualizar la factura.')
    });
  }

  despacharEntrega(): void {
    if (!this.entregaActiva?.id_entrega) return;
    this.despachando = true;

    // Igual que en el sistema original: al despachar (no al agregar al
    // carrito), se descuenta del inventario la cantidad realmente entregada
    // de cada medicamento. Antes esto no pasaba y el inventario nunca bajaba.
    this.farmaciaService.getInventario().subscribe({
      next: (inventarioCompleto) => {
        const descuentos = this.medicamentosEntrega
          .filter(item => item.mediid) // los "sin registro" no tienen inventario que descontar
          .map(item => {
            const lote = inventarioCompleto.find(inv => inv.id_medicamento === item.mediid && (inv.existencias || 0) > 0);
            if (!lote || !lote.id_inventario) return null;
            const nuevaExistencia = Math.max(0, (lote.existencias || 0) - (item.cantidadmedicamentos || 0));
            return this.farmaciaService.actualizarExistencia(lote.id_inventario, nuevaExistencia);
          })
          .filter((obs): obs is ReturnType<typeof this.farmaciaService.actualizarExistencia> => obs !== null);

        const continuarDespacho = () => {
          this.entregaService.despachar(this.entregaActiva!.id_entrega!).subscribe({
            next: () => {
              this.despachando = false;
              this.detalleDialog = false;
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Entrega despachada e inventario actualizado correctamente.' });
              this.cargarPendientes();
              this.cargarEntregadas();
            },
            error: () => {
              this.despachando = false;
              this.mostrarError('El inventario se actualizó, pero no se pudo marcar la entrega como despachada.');
            }
          });
        };

        if (descuentos.length === 0) {
          continuarDespacho();
        } else {
          forkJoin(descuentos).subscribe({
            next: () => continuarDespacho(),
            error: () => {
              this.despachando = false;
              this.mostrarError('No se pudo actualizar el inventario. La entrega no se marcó como despachada; verifique el stock manualmente.');
            }
          });
        }
      },
      error: () => {
        this.despachando = false;
        this.mostrarError('No se pudo verificar el inventario antes de despachar.');
      }
    });
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
