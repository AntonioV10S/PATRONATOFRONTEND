import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabViewModule } from 'primeng/tabview';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { Paciente } from '../../../interface/Paciente.interface';
import {
  AntecedentePatologicoPersonal, AntecedenteGineco, Familiar, Habito, ExamenFisico, ExamenOrganoSistema
} from '../../../interface/Antecedentes.interface';
import { PacienteService } from '../../../layout/service/Patronato/paciente.service';
import { AntecedentesService } from '../../../layout/service/Patronato/antecedentes.service';

@Component({
  selector: 'app-registro-antecedentes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TabViewModule,
    ToolbarModule,
    ButtonModule,
    RippleModule,
    InputTextModule,
    InputTextareaModule,
    InputSwitchModule,
    DropdownModule,
    CheckboxModule,
    TableModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './registro-antecedentes.component.html'
})
export class RegistroAntecedentesComponent {

  busquedaCedula: string = '';
  buscandoPaciente: boolean = false;
  pacienteActivo: Paciente | null = null;
  esFemenino: boolean = false;

  // --- 1. Antecedentes Patológicos Personales ---
  personal: AntecedentePatologicoPersonal = {};
  sinInfancia: boolean = true;
  sinAdolescencia: boolean = true;
  sinAdultez: boolean = true;
  sinQuirurgicos: boolean = true;
  sinAlergias: boolean = true;
  sinTraumas: boolean = true;
  guardandoPersonal: boolean = false;

  // --- 2. Antecedentes Gineco-Obstétricos (solo si es paciente femenina) ---
  gineco: AntecedenteGineco = {};
  guardandoGineco: boolean = false;
  idGinecoCreado: number | null = null;

  // --- 3. Familiares ---
  familiares: Familiar[] = [];
  nuevoFamiliar: Familiar = { vida: true };
  guardandoFamiliar: boolean = false;
  relacionOptions = [
    { label: 'Padre', value: 'Padre' }, { label: 'Madre', value: 'Madre' },
    { label: 'Hermano/a', value: 'Hermano/a' }, { label: 'Abuelo/a', value: 'Abuelo/a' },
    { label: 'Tío/a', value: 'Tío/a' }, { label: 'Hijo/a', value: 'Hijo/a' },
    { label: 'Otro', value: 'Otro' }
  ];

  // --- 4. Hábitos ---
  habito: Habito = {};
  guardandoHabito: boolean = false;

  // --- 5. Examen Físico General ---
  examenFisico: ExamenFisico = {};
  guardandoExamenFisico: boolean = false;

  // --- 6. Examen por Órganos y Sistemas ---
  organoSistema: ExamenOrganoSistema = {};
  sinDigestivo: boolean = true;
  sinRespiratorio: boolean = true;
  sinCardiaco: boolean = true;
  sinGenitourinario: boolean = true;
  sinOsteomuscular: boolean = true;
  sinNervioso: boolean = true;
  guardandoOrganoSistema: boolean = false;

  constructor(
    private pacienteService: PacienteService,
    private antecedentesService: AntecedentesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  buscarPaciente(): void {
    if (!this.busquedaCedula || this.busquedaCedula.trim().length === 0) return;

    this.buscandoPaciente = true;
    this.pacienteService.buscarPorCedula(this.busquedaCedula.trim()).subscribe({
      next: (resultado) => {
        this.buscandoPaciente = false;
        this.pacienteActivo = resultado;
        if (!resultado) {
          this.messageService.add({ severity: 'info', summary: 'Sin resultados', detail: 'No existe un paciente con esa cédula.' });
          return;
        }
        this.esFemenino = (resultado.sexo || '').toLowerCase().startsWith('m') === false; // "Mujer" -> true
        this.reiniciarFormularios();
        this.cargarFamiliares();
      },
      error: () => {
        this.buscandoPaciente = false;
        this.mostrarError('Error al buscar el paciente.');
      }
    });
  }

  private reiniciarFormularios(): void {
    this.personal = {};
    this.sinInfancia = this.sinAdolescencia = this.sinAdultez = this.sinQuirurgicos = this.sinAlergias = this.sinTraumas = true;
    this.gineco = {};
    this.idGinecoCreado = null;
    this.habito = {};
    this.examenFisico = {};
    this.organoSistema = {};
    this.sinDigestivo = this.sinRespiratorio = this.sinCardiaco = this.sinGenitourinario = this.sinOsteomuscular = this.sinNervioso = true;
    this.nuevoFamiliar = { vida: true };
  }

  // --- 1. Antecedentes Patológicos Personales ---
  guardarPersonal(): void {
    if (!this.pacienteActivo?.id_paciente) return;
    this.guardandoPersonal = true;

    const payload: AntecedentePatologicoPersonal & { id_paciente: number } = {
      ...this.personal,
      id_paciente: this.pacienteActivo.id_paciente,
      id_gineco: this.idGinecoCreado,
      infancia: this.sinInfancia ? '1' : (this.personal.infancia || ''),
      adolecencia: this.sinAdolescencia ? '1' : (this.personal.adolecencia || ''),
      adultez: this.sinAdultez ? '1' : (this.personal.adultez || ''),
      quirujircos: this.sinQuirurgicos ? '1' : (this.personal.quirujircos || ''),
      alergias: this.sinAlergias ? '1' : (this.personal.alergias || ''),
      traumas: this.sinTraumas ? '1' : (this.personal.traumas || '')
    };

    this.antecedentesService.crearPatologicoPersonal(payload).subscribe({
      next: () => {
        this.guardandoPersonal = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Antecedentes patológicos personales guardados.' });
      },
      error: () => {
        this.guardandoPersonal = false;
        this.mostrarError('No se pudieron guardar los antecedentes personales.');
      }
    });
  }

  // --- 2. Antecedentes Gineco-Obstétricos ---
  guardarGineco(): void {
    this.guardandoGineco = true;
    this.antecedentesService.crearGineco(this.gineco).subscribe({
      next: (res: any) => {
        this.guardandoGineco = false;
        this.idGinecoCreado = res.id;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Antecedentes gineco-obstétricos guardados. Se vincularán al guardar los antecedentes personales.' });
      },
      error: () => {
        this.guardandoGineco = false;
        this.mostrarError('No se pudieron guardar los antecedentes gineco-obstétricos.');
      }
    });
  }

  // --- 3. Familiares ---
  cargarFamiliares(): void {
    if (!this.pacienteActivo?.id_paciente) return;
    this.antecedentesService.getFamiliaresPorPaciente(this.pacienteActivo.id_paciente).subscribe({
      next: (data) => (this.familiares = data),
      error: () => (this.familiares = [])
    });
  }

  agregarFamiliar(): void {
    if (!this.pacienteActivo?.id_paciente || !this.nuevoFamiliar.nombres || !this.nuevoFamiliar.union) {
      this.mostrarError('Complete nombre y parentesco del familiar.');
      return;
    }
    this.guardandoFamiliar = true;
    const payload: Familiar = {
      ...this.nuevoFamiliar,
      causas: this.nuevoFamiliar.vida ? 'Sin causas' : (this.nuevoFamiliar.causas || 'Sin causas')
    };
    this.antecedentesService.crearFamiliar({ ...payload, id_paciente: this.pacienteActivo.id_paciente }).subscribe({
      next: () => {
        this.guardandoFamiliar = false;
        this.nuevoFamiliar = { vida: true };
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Familiar agregado.' });
        this.cargarFamiliares();
      },
      error: () => {
        this.guardandoFamiliar = false;
        this.mostrarError('No se pudo agregar el familiar.');
      }
    });
  }

  eliminarFamiliar(datos: Familiar): void {
    if (!this.pacienteActivo?.id_paciente || !datos.id_familiar) return;
    this.confirmationService.confirm({
      message: `¿Eliminar a "${datos.nombres}" de los antecedentes familiares?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.antecedentesService.eliminarFamiliar(datos.id_familiar!, this.pacienteActivo!.id_paciente!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Familiar eliminado.' });
            this.cargarFamiliares();
          },
          error: () => this.mostrarError('No se pudo eliminar el familiar.')
        });
      }
    });
  }

  // --- 4. Hábitos ---
  guardarHabito(): void {
    if (!this.pacienteActivo?.id_paciente) return;
    this.guardandoHabito = true;
    this.antecedentesService.crearHabito({ ...this.habito, id_paciente: this.pacienteActivo.id_paciente } as any).subscribe({
      next: () => {
        this.guardandoHabito = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Hábitos guardados.' });
      },
      error: () => {
        this.guardandoHabito = false;
        this.mostrarError('No se pudieron guardar los hábitos.');
      }
    });
  }

  // --- 5. Examen Físico General ---
  guardarExamenFisico(): void {
    if (!this.pacienteActivo?.id_paciente) return;
    this.guardandoExamenFisico = true;
    this.antecedentesService.crearExamenFisico({ ...this.examenFisico, id_paciente: this.pacienteActivo.id_paciente } as any).subscribe({
      next: () => {
        this.guardandoExamenFisico = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Examen físico general guardado.' });
      },
      error: () => {
        this.guardandoExamenFisico = false;
        this.mostrarError('No se pudo guardar el examen físico.');
      }
    });
  }

  // --- 6. Examen por Órganos y Sistemas ---
  guardarOrganoSistema(): void {
    if (!this.pacienteActivo?.id_paciente) return;
    this.guardandoOrganoSistema = true;
    const payload: ExamenOrganoSistema & { id_paciente: number } = {
      id_paciente: this.pacienteActivo.id_paciente,
      sistema_digestivo: this.sinDigestivo ? '1' : (this.organoSistema.sistema_digestivo || ''),
      sistema_respiratorio: this.sinRespiratorio ? '1' : (this.organoSistema.sistema_respiratorio || ''),
      sistema_cardiaco: this.sinCardiaco ? '1' : (this.organoSistema.sistema_cardiaco || ''),
      sistema_genitourinarion: this.sinGenitourinario ? '1' : (this.organoSistema.sistema_genitourinarion || ''),
      sistema_osteomuscular: this.sinOsteomuscular ? '1' : (this.organoSistema.sistema_osteomuscular || ''),
      sistema_nervioso: this.sinNervioso ? '1' : (this.organoSistema.sistema_nervioso || '')
    };
    this.antecedentesService.crearExamenOrganoSistema(payload).subscribe({
      next: () => {
        this.guardandoOrganoSistema = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Examen por órganos y sistemas guardado.' });
      },
      error: () => {
        this.guardandoOrganoSistema = false;
        this.mostrarError('No se pudo guardar el examen por órganos y sistemas.');
      }
    });
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
