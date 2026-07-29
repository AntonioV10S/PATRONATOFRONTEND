import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { Paciente } from '../../../interface/Paciente.interface';
import { PacienteService } from '../../../layout/service/Patronato/paciente.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../middleware/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/enviroments';

@Component({
  selector: 'app-pacientes',
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
    InputSwitchModule,
    TabViewModule,
    TagModule,
    TooltipModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './pacientes.component.html'
})
export class PacientesComponent implements OnInit {

  pacientes: Paciente[] = [];

  pacienteDialog: boolean = false;
  paciente: Paciente = {};
  submitted: boolean = false;
  editando: boolean = false;
  guardando: boolean = false;

  busquedaCedula: string = '';
  buscando: boolean = false;

  rowsPerPageOptions: number[] = [10, 20, 50];

  sexoOptions = [
    { label: 'Hombre', value: 'Hombre' },
    { label: 'Mujer', value: 'Mujer' }
  ];

  estadoCivilOptions = [
    { label: 'Soltero/a', value: 'Soltero/a' },
    { label: 'Casado/a', value: 'Casado/a' },
    { label: 'Divorciado/a', value: 'Divorciado/a' },
    { label: 'Viudo/a', value: 'Viudo/a' },
    { label: 'Unión libre', value: 'Unión libre' }
  ];

  // Categorías oficiales usadas por el INEC/Censo Ecuador para autoidentificación étnica.
  razaOptions = [
    { label: 'Mestizo/a', value: 'Mestizo' },
    { label: 'Indígena', value: 'Indígena' },
    { label: 'Afroecuatoriano/a', value: 'Afroecuatoriano' },
    { label: 'Montubio/a', value: 'Montubio' },
    { label: 'Blanco/a', value: 'Blanco' },
    { label: 'Mulato/a', value: 'Mulato' },
    { label: 'Negro/a', value: 'Negro' },
    { label: 'Otro', value: 'Otro' }
  ];

  nivelInstruccionOptions = [
    { label: 'Ninguno', value: 'Ninguno' },
    { label: 'Centro de alfabetización', value: 'Centro de alfabetización' },
    { label: 'Educación básica', value: 'Educación básica' },
    { label: 'Educación media / Bachillerato', value: 'Educación media / Bachillerato' },
    { label: 'Superior', value: 'Superior' },
    { label: 'Postgrado', value: 'Postgrado' }
  ];

  grupoAtencionOptions = [
    { label: 'Adultos mayores', value: 'Adultos mayores' },
    { label: 'Niñas, niños y adolescentes', value: 'niñas,niños y adolescentes' },
    { label: 'Mujeres embarazadas', value: 'Mujeres embarazadas' },
    { label: 'Discapacidad', value: 'Discapacidad' },
    { label: 'Privados de libertad', value: 'Privados de libertad' },
    { label: 'Enfermedades catastróficas', value: 'Enfermedades catastroficas' },
    { label: 'Ninguno', value: 'Ninguno' }
  ];

  constructor(
    private pacienteService: PacienteService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  // Según el rol del usuario logueado, "Consultas" lleva a la historia
  // Solo Secretaría crea, edita o elimina pacientes (LOPDP: separación de
  // funciones). El resto de roles con acceso a esta pantalla (Admin,
  // médicos) solo pueden ver los datos, nunca modificarlos.
  get puedeEditar(): boolean {
    return this.authService.getRol() === 'Secretaría';
  }

  soloLectura: boolean = false;

  get rutaConsultas(): string | null {
    const rol = this.authService.getRol();
    if (rol === 'Medicina General') return '/historia-clinica-mg';
    if (rol === 'Rehabilitación Física') return '/historia-clinica-rf';
    return null;
  }

  irAConsultas(datos: Paciente): void {
    if (!this.rutaConsultas || !datos.cedula) return;
    this.router.navigate([this.rutaConsultas], { queryParams: { cedula: datos.cedula } });
  }

  imprimirAvisoPrivacidad(datos: Paciente): void {
    if (!datos.id_paciente) return;
    this.http.get(`${environment.baseUrl}/reportes/aviso-privacidad/${datos.id_paciente}`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: () => this.mostrarError('No se pudo generar el aviso de privacidad.')
    });
  }

  verDatos(datos: Paciente): void {
    this.paciente = { ...datos };
    this.submitted = false;
    this.editando = true;
    this.soloLectura = true;
    this.pacienteDialog = true;
  }

  ngOnInit(): void {
    this.cargarPacientes();
  }

  cargarPacientes(): void {
    this.pacienteService.getPacientes().subscribe({
      next: (data) => (this.pacientes = data),
      error: () => this.mostrarError('No se pudieron cargar los pacientes.')
    });
  }

  buscarPorCedula(): void {
    if (!this.busquedaCedula || this.busquedaCedula.trim().length === 0) {
      this.cargarPacientes();
      return;
    }
    this.buscando = true;
    this.pacienteService.buscarPorCedula(this.busquedaCedula.trim()).subscribe({
      next: (resultado) => {
        this.buscando = false;
        this.pacientes = resultado ? [resultado] : [];
        if (!resultado) {
          this.messageService.add({ severity: 'info', summary: 'Sin resultados', detail: 'No existe un paciente con esa cédula.' });
        }
      },
      error: () => {
        this.buscando = false;
        this.mostrarError('Error al buscar por cédula.');
      }
    });
  }

  limpiarBusqueda(): void {
    this.busquedaCedula = '';
    this.cargarPacientes();
  }

  openNew(): void {
    this.paciente = { gad: false };
    this.submitted = false;
    this.editando = false;
    this.soloLectura = false;
    this.pacienteDialog = true;
  }

  editarPaciente(datos: Paciente): void {
    this.paciente = { ...datos };
    this.submitted = false;
    this.editando = true;
    this.soloLectura = false;
    this.pacienteDialog = true;
  }

  hideDialog(): void {
    this.pacienteDialog = false;
    this.submitted = false;
  }

  // Calcula la edad en años cumplidos a partir de la fecha de nacimiento.
  // Se llama cada vez que el usuario cambia el campo de fecha en el formulario.
  calcularEdad(): void {
    if (!this.paciente.fecha_nacimiento) return;
    const nacimiento = new Date(this.paciente.fecha_nacimiento);
    if (isNaN(nacimiento.getTime())) return;

    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const noHaCumplidoAunEsteAnio =
      hoy.getMonth() < nacimiento.getMonth() ||
      (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
    if (noHaCumplidoAunEsteAnio) edad--;

    this.paciente.edad = String(Math.max(edad, 0));
  }

  guardarPaciente(): void {
    this.submitted = true;

    if (!this.paciente.nombres || !this.paciente.apellidos || !this.paciente.cedula ||
        !this.paciente.sexo || !this.paciente.fecha_nacimiento) {
      this.mostrarError('Complete nombres, apellidos, cédula, sexo y fecha de nacimiento.');
      return;
    }

    this.guardando = true;
    const peticion = this.editando
      ? this.pacienteService.actualizarPaciente(this.paciente)
      : this.pacienteService.crearPaciente(this.paciente);

    peticion.subscribe({
      next: () => {
        this.guardando = false;
        this.pacienteDialog = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.editando ? 'Paciente actualizado correctamente.' : 'Paciente registrado correctamente.'
        });
        this.cargarPacientes();
      },
      error: (err) => {
        this.guardando = false;
        this.mostrarError(err?.error?.message || 'No se pudo guardar el paciente.');
      }
    });
  }

  confirmarEliminar(datos: Paciente): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar al paciente "${datos.nombres} ${datos.apellidos}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => this.eliminarPaciente(datos)
    });
  }

  private eliminarPaciente(datos: Paciente): void {
    if (!datos.id_paciente) return;
    this.pacienteService.eliminarPaciente(datos.id_paciente).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Paciente eliminado.' });
        this.cargarPacientes();
      },
      error: () => this.mostrarError('No se pudo eliminar el paciente.')
    });
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
