import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { forkJoin, of, Observable } from 'rxjs';

import { Adquisicion } from '../../../../interface/Adquisicion.interface';
import { Medicamento, CategoriaMedicamento, Laboratorio } from '../../../../interface/Farmacia.interface';
import { AdquisicionService } from '../../../../layout/service/Patronato/adquisicion.service';
import { FarmaciaService } from '../../../../layout/service/Patronato/farmacia.service';

interface FilaMedicamento {
  esNuevo: boolean;
  id_medicamento: number | null; // si esNuevo=false, el medicamento ya elegido del catálogo
  nombre: string;
  descripcion: string;
  existencias: number | null;
  fechaElaboracion: string;
  fechaExpiracion: string;
  id_laboratorio: number | null;
  id_categoriamedicamento: number | null;
  codigodebarra: string;
  valoruni: number | null;
}

@Component({
  selector: 'app-nueva-adquisicion',
  standalone: true,
  imports: [
    CommonModule, FormsModule, PanelModule, ButtonModule, RippleModule, InputTextModule,
    InputTextareaModule, InputNumberModule, DropdownModule, RadioButtonModule, CheckboxModule, TableModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './nueva-adquisicion.component.html'
})
export class NuevaAdquisicionComponent implements OnInit {

  numeroadqui: string = '';
  fechaadqui: string = '';
  fecharegadqui: string = new Date().toISOString().split('T')[0];
  tipoadqui: boolean = false;
  descripcionadqui: string = '';
  archivoDocumento: File | null = null;
  nombreArchivo: string = '';

  filas: FilaMedicamento[] = [];

  laboratorios: Laboratorio[] = [];
  categorias: CategoriaMedicamento[] = [];
  medicamentosDisponibles: Medicamento[] = [];

  guardando: boolean = false;

  constructor(
    private adquisicionService: AdquisicionService,
    private farmaciaService: FarmaciaService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.farmaciaService.getLaboratorios().subscribe({ next: (data) => (this.laboratorios = data) , error: (err) => console.error('Error al cargar datos de catálogo:', err) });
    this.farmaciaService.getCategorias().subscribe({ next: (data) => (this.categorias = data) , error: (err) => console.error('Error al cargar datos de catálogo:', err) });
    this.farmaciaService.getMedicamentos().subscribe({ next: (data) => (this.medicamentosDisponibles = data) , error: (err) => console.error('Error al cargar datos de catálogo:', err) });
    this.agregarFila();
  }

  get totalAdquisicion(): number {
    return this.filas.reduce((suma, f) => suma + ((f.existencias || 0) * (f.valoruni || 0)), 0);
  }

  agregarFila(): void {
    this.filas.push({
      esNuevo: true, id_medicamento: null,
      nombre: '', descripcion: '', existencias: null, fechaElaboracion: '', fechaExpiracion: '',
      id_laboratorio: null, id_categoriamedicamento: null, codigodebarra: '', valoruni: null
    });
  }

  eliminarFila(index: number): void {
    this.filas.splice(index, 1);
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoDocumento = input.files[0];
      this.nombreArchivo = this.archivoDocumento.name;
    }
  }

  crearAdquisicion(): void {
    if (!this.numeroadqui || !this.fechaadqui) {
      this.mostrarError('Ingrese el número/código y la fecha de adquisición.');
      return;
    }
    const filasValidas = this.filas.filter(f => f.existencias && (f.esNuevo ? f.nombre : f.id_medicamento));
    if (filasValidas.length === 0) {
      this.mostrarError('Agregue al menos un medicamento con nombre y existencias.');
      return;
    }

    this.guardando = true;

    const continuarConDocumento = (nombreDocumento: string | null) => {
      const adquisicion: Adquisicion = {
        numeroadqui: this.numeroadqui,
        precioadqui: this.totalAdquisicion,
        descripcionadqui: this.descripcionadqui,
        documento: nombreDocumento,
        fechaadqui: this.fechaadqui,
        fecharegadqui: this.fecharegadqui,
        tipoadqui: this.tipoadqui,
        estadoadqui: true
      };

      this.adquisicionService.crearAdquisicion(adquisicion).subscribe({
        next: (res: any) => {
          const idAdquisicion = res.id;
          this.registrarMedicamentos(idAdquisicion, filasValidas);
        },
        error: () => {
          this.guardando = false;
          this.mostrarError('No se pudo crear la adquisición.');
        }
      });
    };

    if (this.archivoDocumento) {
      this.adquisicionService.subirDocumento(this.archivoDocumento).subscribe({
        next: (res: any) => continuarConDocumento(res.fileId || res.filename || null),
        error: () => {
          this.guardando = false;
          this.mostrarError('No se pudo subir el documento.');
        }
      });
    } else {
      continuarConDocumento(null);
    }
  }

  private registrarMedicamentos(idAdquisicion: number, filas: FilaMedicamento[]): void {
    // Por cada fila: si es "nuevo", se crea el medicamento en el catálogo;
    // si ya existe, se usa directamente el id_medicamento elegido.
    const llamadasResolverMedicamento: Observable<{ id: number }>[] = filas.map((fila) =>
      fila.esNuevo
        ? this.farmaciaService.crearMedicamento({
            nombre: fila.nombre,
            descripcion: fila.descripcion,
            id_laboratorio: fila.id_laboratorio || undefined,
            id_categoriamedicamento: fila.id_categoriamedicamento || undefined,
            estado: true
          })
        : of({ id: fila.id_medicamento as number })
    );

    forkJoin(llamadasResolverMedicamento).subscribe({
      next: (resultados: { id: number }[]) => {
        const llamadasDetalle = resultados.map((res, i) => {
          const fila = filas[i];
          return this.adquisicionService.agregarDetalle({
            id_adquisicion: idAdquisicion,
            id_medicamento: res.id,
            cantidadmedicamentos: fila.existencias || 0,
            codigodebarra: fila.codigodebarra,
            valoruni: fila.valoruni || 0,
            fechacre: fila.fechaElaboracion || undefined,
            fechaexp: fila.fechaExpiracion || undefined
          });
        });

        forkJoin(llamadasDetalle).subscribe({
          next: () => {
            const llamadasInventario = resultados.map((res, i) => {
              const fila = filas[i];
              return this.farmaciaService.crearInventario({
                id_medicamento: res.id,
                existencias: fila.existencias || 0,
                fechaexp: fila.fechaExpiracion || undefined,
                valoruni: fila.valoruni || 0,
                codigodebarra: fila.codigodebarra,
                estado: true
              });
            });

            forkJoin(llamadasInventario).subscribe({
              next: () => {
                this.guardando = false;
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Adquisición creada y sumada al inventario correctamente.' });
                this.reiniciar();
              },
              error: () => {
                this.guardando = false;
                this.mostrarError('La adquisición se creó, pero hubo un error al sumar al inventario. Revíselo manualmente.');
              }
            });
          },
          error: () => {
            this.guardando = false;
            this.mostrarError('La adquisición se creó, pero hubo un error al registrar el detalle de medicamentos.');
          }
        });
      },
      error: () => {
        this.guardando = false;
        this.mostrarError('No se pudieron crear los medicamentos de esta adquisición.');
      }
    });
  }

  private reiniciar(): void {
    this.numeroadqui = '';
    this.fechaadqui = '';
    this.tipoadqui = false;
    this.descripcionadqui = '';
    this.archivoDocumento = null;
    this.nombreArchivo = '';
    this.filas = [];
    this.agregarFila();
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
