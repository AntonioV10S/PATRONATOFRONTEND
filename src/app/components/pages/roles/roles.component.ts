import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { Rol } from '../../../interface/Cuenta.interface';
import { RolService } from '../../../layout/service/Patronato/rol.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, PanelModule, ButtonModule, RippleModule,
    InputTextModule, DropdownModule, TagModule, ToastModule, ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './roles.component.html'
})
export class RolesComponent implements OnInit {

  roles: Rol[] = [];
  busqueda: string = '';

  rol: Rol = {};
  categoriaSeleccionada: string | null = null;
  editando: boolean = false;
  guardando: boolean = false;

  categoriaOptions = [
    { label: 'Médico (atiende y firma historias clínicas)', value: 'medico' },
    { label: 'Atención al público (sin firma clínica)', value: 'atencion' },
    { label: 'Administrativo (sin atención directa)', value: 'administrativo' }
  ];

  estadoOptions = [
    { label: 'Habilitado', value: true },
    { label: 'Inhabilitado', value: false }
  ];

  rowsPerPageOptions: number[] = [5, 10, 20];

  constructor(
    private rolService: RolService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.cargarRoles();
    this.limpiarFormulario();
  }

  get rolesFiltrados(): Rol[] {
    const termino = this.busqueda.trim().toLowerCase();
    if (!termino) return this.roles;
    return this.roles.filter(r => (r.rol || '').toLowerCase().includes(termino));
  }

  cargarRoles(): void {
    this.rolService.getRoles().subscribe({
      next: (data) => (this.roles = data),
      error: () => this.mostrarError('No se pudieron cargar los roles.')
    });
  }

  limpiarFormulario(): void {
    this.rol = { estado: true };
    this.categoriaSeleccionada = null;
    this.editando = false;
  }

  editarRol(datos: Rol): void {
    this.rol = { ...datos };
    this.categoriaSeleccionada = datos.atiende_medico ? 'medico' : (datos.atencion ? 'atencion' : 'administrativo');
    this.editando = true;
  }

  guardarRol(): void {
    if (!this.rol.rol || !this.categoriaSeleccionada || this.rol.estado === undefined) {
      this.mostrarError('Complete el rol, la categoría y el estado.');
      return;
    }

    const payload: Rol = {
      ...this.rol,
      atiende_medico: this.categoriaSeleccionada === 'medico',
      atencion: this.categoriaSeleccionada === 'medico' || this.categoriaSeleccionada === 'atencion'
    };

    this.guardando = true;
    const peticion = this.editando ? this.rolService.actualizarRol(payload) : this.rolService.crearRol(payload);

    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.messageService.add({
          severity: 'success', summary: 'Éxito',
          detail: this.editando ? 'Rol actualizado correctamente.' : 'Rol creado correctamente.'
        });
        this.limpiarFormulario();
        this.cargarRoles();
      },
      error: (err) => {
        this.guardando = false;
        this.mostrarError(err?.error?.mensaje || 'No se pudo guardar el rol.');
      }
    });
  }

  confirmarEliminar(datos: Rol): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el rol "${datos.rol}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => this.eliminarRol(datos)
    });
  }

  private eliminarRol(datos: Rol): void {
    if (!datos.id_rol) return;
    this.rolService.eliminarRol(datos.id_rol).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Rol eliminado.' });
        this.cargarRoles();
      },
      error: () => this.mostrarError('No se pudo eliminar el rol. Puede que existan cuentas asignadas a este rol.')
    });
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
