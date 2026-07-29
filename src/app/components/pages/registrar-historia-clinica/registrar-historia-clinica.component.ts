import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { Paciente } from '../../../interface/Paciente.interface';
import { AntecedentePatologicoPersonal, Familiar, Habito } from '../../../interface/Antecedentes.interface';
import { PacienteService } from '../../../layout/service/Patronato/paciente.service';
import { AntecedentesService } from '../../../layout/service/Patronato/antecedentes.service';

@Component({
  selector: 'app-registrar-historia-clinica',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, RippleModule, InputTextModule,
    InputTextareaModule, DropdownModule, CheckboxModule, TableModule, PanelModule, ToastModule
  ],
  providers: [MessageService],
  templateUrl: './registrar-historia-clinica.component.html'
})
export class RegistrarHistoriaClinicaComponent {

  guardando: boolean = false;
  submitted: boolean = false;

  // --- Datos de Afiliación ---
  paciente: Paciente = { gad: false };

  sexoOptions = [{ label: 'Hombre', value: 'Hombre' }, { label: 'Mujer', value: 'Mujer' }];
  razaOptions = [
    { label: 'Mestizo', value: 'Mestizo' }, { label: 'Blanco', value: 'Blanco' },
    { label: 'Montubio', value: 'Montubio' }, { label: 'Afroecuatoriano', value: 'Afroecuatoriano' },
    { label: 'Indígena', value: 'Indígena' }, { label: 'Otro', value: 'Otro' }
  ];
  religionOptions = [
    { label: 'Cristiana Católica', value: 'Cristiana Católica' }, { label: 'Cristiana Evangélica', value: 'Cristiana Evangélica' },
    { label: 'Testigo de Jehová', value: 'Testigo de Jehová' }, { label: 'Ateo', value: 'Ateo' },
    { label: 'Agnóstico', value: 'Agnóstico' }, { label: 'Otra', value: 'Otra' }, { label: 'Ninguno', value: 'Ninguno' }
  ];
  nivelInstruccionOptions = [
    { label: 'Educación Básica', value: 'Educación Básica' }, { label: 'Bachillerato', value: 'Bachillerato' },
    { label: 'Técnico Superior', value: 'Técnico Superior' }, { label: 'Tercer Nivel', value: 'Tercer Nivel' },
    { label: 'Postgrado', value: 'Postgrado' }, { label: 'Ninguno', value: 'Ninguno' }
  ];
  grupoAtencionOptions = [
    { label: 'Adultos mayores', value: 'Adultos mayores' },
    { label: 'Niñas, niños y adolescentes', value: 'Niñas, niños y adolescentes' },
    { label: 'Mujeres embarazadas', value: 'Mujeres embarazadas' },
    { label: 'Discapacidad', value: 'Discapacidad' },
    { label: 'Privados de libertad', value: 'Privados de libertad' },
    { label: 'Enfermedades Catastroficas', value: 'Enfermedades Catastroficas' },
    { label: 'Ninguno', value: 'Ninguno' }
  ];
  estadoCivilOptions = [
    { label: 'Soltero(a)', value: 'Soltero(a)' }, { label: 'Casado(a)', value: 'Casado(a)' },
    { label: 'Viudo(a)', value: 'Viudo(a)' }, { label: 'Divorciado(a)', value: 'Divorciado(a)' },
    { label: 'Unión de hecho', value: 'Unión de hecho' }
  ];

  // --- Antecedentes Patológicos Personales ---
  personal: AntecedentePatologicoPersonal = {};
  sinNinez: boolean = true;
  sinAdolescencia: boolean = true;
  sinAdultez: boolean = true;
  sinQuirurgicos: boolean = true;
  sinAlergicos: boolean = true;
  sinTraumatologicos: boolean = true;

  // --- Antecedentes Patológicos Familiares ---
  familiaresAgregados: Familiar[] = [];
  nuevoFamiliar: Familiar = { vida: true };
  relacionOptions = [
    { label: 'Padre', value: 'Padre' }, { label: 'Madre', value: 'Madre' },
    { label: 'Hermano(a)', value: 'Hermano(a)' }, { label: 'Hijo(a)', value: 'Hijo(a)' },
    { label: 'Otro', value: 'Otro' }
  ];

  // --- Hábitos Personales ---
  habito: Habito & { alcoholSi?: boolean; tabacoSi?: boolean; drogasSi?: boolean; alimentacionSi?: boolean; diuresisSi?: boolean; somniaSi?: boolean } = {};

  constructor(
    private pacienteService: PacienteService,
    private antecedentesService: AntecedentesService,
    private messageService: MessageService
  ) {}

  calcularEdad(): void {
    if (!this.paciente.fecha_nacimiento) return;
    const hoy = new Date();
    const nacimiento = new Date(this.paciente.fecha_nacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    this.paciente.edad = String(edad);
  }

  agregarFamiliar(): void {
    if (!this.nuevoFamiliar.nombres || !this.nuevoFamiliar.union) {
      this.mostrarError('Complete el nombre y la unión (parentesco) del familiar.');
      return;
    }
    this.familiaresAgregados.push({
      ...this.nuevoFamiliar,
      causas: this.nuevoFamiliar.vida ? 'Sin causas' : (this.nuevoFamiliar.causas || 'Sin causas')
    });
    this.nuevoFamiliar = { vida: true };
  }

  quitarFamiliar(index: number): void {
    this.familiaresAgregados.splice(index, 1);
  }

  private siNo(valor?: boolean): string {
    return valor ? 'Si' : 'No';
  }

  generarHistoriaClinica(): void {
    this.submitted = true;

    if (!this.paciente.nombres || !this.paciente.apellidos || !this.paciente.cedula ||
        !this.paciente.sexo || !this.paciente.fecha_nacimiento) {
      this.mostrarError('Complete los datos de afiliación obligatorios (nombres, apellidos, cédula, sexo, fecha de nacimiento).');
      return;
    }
    if (!this.paciente.consentimiento_datos) {
      this.mostrarError('Debe registrar el consentimiento informado del paciente para el tratamiento de sus datos antes de continuar.');
      return;
    }

    this.guardando = true;

    // Paso 1: antecedentes patológicos personales (todavía sin id_paciente propio;
    // esta tabla se vincula desde el lado del paciente, con id_patologico)
    const payloadPersonal: AntecedentePatologicoPersonal = {
      infancia: this.sinNinez ? '1' : (this.personal.infancia || ''),
      adolecencia: this.sinAdolescencia ? '1' : (this.personal.adolecencia || ''),
      adultez: this.sinAdultez ? '1' : (this.personal.adultez || ''),
      DBID: this.personal.DBID,
      DBI: this.personal.DBI,
      HTA: this.personal.HTA,
      TbP: this.personal.TbP,
      quirujircos: this.sinQuirurgicos ? '1' : (this.personal.quirujircos || ''),
      alergias: this.sinAlergicos ? '1' : (this.personal.alergias || ''),
      traumas: this.sinTraumatologicos ? '1' : (this.personal.traumas || '')
    };

    this.antecedentesService.crearPatologicoPersonal(payloadPersonal).subscribe({
      next: (resPatologico: any) => {
        const idPatologico = resPatologico.id;

        // Paso 2: hábitos personales
        const payloadHabito: Habito = {
          alcohol: this.siNo(this.habito.alcoholSi),
          tabaco: this.siNo(this.habito.tabacoSi),
          drogas: this.siNo(this.habito.drogasSi),
          alimentacion: this.siNo(this.habito.alimentacionSi),
          diuresis: this.siNo(this.habito.diuresisSi),
          somnia: this.siNo(this.habito.somniaSi)
        };

        this.antecedentesService.crearHabito(payloadHabito).subscribe({
          next: (resHabito: any) => {
            const idHabito = resHabito.id;

            // Paso 3: crear el paciente, ya vinculado a sus antecedentes y hábitos
            const payloadPaciente: Paciente = {
              ...this.paciente,
              id_patologico: idPatologico,
              id_habito: idHabito
            };

            this.pacienteService.crearPaciente(payloadPaciente).subscribe({
              next: (resPaciente: any) => {
                const idPaciente = resPaciente.id;

                // Paso 4: familiares (si se agregó alguno)
                if (this.familiaresAgregados.length === 0) {
                  this.finalizarExito();
                  return;
                }
                let pendientes = this.familiaresAgregados.length;
                this.familiaresAgregados.forEach((fam) => {
                  this.antecedentesService.crearFamiliar({ ...fam, id_paciente: idPaciente }).subscribe({
                    next: () => { pendientes--; if (pendientes === 0) this.finalizarExito(); },
                    error: () => { pendientes--; if (pendientes === 0) this.finalizarExito(true); }
                  });
                });
              },
              error: (err) => {
                this.guardando = false;
                this.mostrarError(err?.error?.message || 'No se pudo registrar el paciente. Verifique que la cédula no esté ya registrada.');
              }
            });
          },
          error: () => {
            this.guardando = false;
            this.mostrarError('No se pudieron guardar los hábitos personales.');
          }
        });
      },
      error: () => {
        this.guardando = false;
        this.mostrarError('No se pudieron guardar los antecedentes patológicos personales.');
      }
    });
  }

  private finalizarExito(conAdvertencia: boolean = false): void {
    this.guardando = false;
    this.messageService.add({
      severity: conAdvertencia ? 'warn' : 'success',
      summary: conAdvertencia ? 'Guardado con advertencia' : 'Éxito',
      detail: conAdvertencia
        ? 'La historia clínica se generó, pero algún familiar no se pudo guardar.'
        : 'Historia clínica generada correctamente.'
    });
    this.reiniciarFormulario();
  }

  private reiniciarFormulario(): void {
    this.paciente = { gad: false };
    this.personal = {};
    this.sinNinez = this.sinAdolescencia = this.sinAdultez = this.sinQuirurgicos = this.sinAlergicos = this.sinTraumatologicos = true;
    this.familiaresAgregados = [];
    this.nuevoFamiliar = { vida: true };
    this.habito = {};
    this.submitted = false;
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
