import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { Paciente } from '../../../interface/Paciente.interface';
import { PacienteService } from '../../../layout/service/Patronato/paciente.service';

@Component({
  selector: 'app-agregar-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, RippleModule, InputTextModule, DropdownModule, CheckboxModule, ToastModule],
  providers: [MessageService],
  templateUrl: './agregar-paciente.component.html'
})
export class AgregarPacienteComponent {

  guardando: boolean = false;
  submitted: boolean = false;
  paciente: Paciente = { gad: false };

  sexoOptions = [{ label: 'Hombre', value: 'Hombre' }, { label: 'Mujer', value: 'Mujer' }];

  constructor(private pacienteService: PacienteService, private messageService: MessageService) {}

  calcularEdad(): void {
    if (!this.paciente.fecha_nacimiento) return;
    const hoy = new Date();
    const nacimiento = new Date(this.paciente.fecha_nacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    this.paciente.edad = String(edad);
  }

  guardarPaciente(): void {
    this.submitted = true;
    if (!this.paciente.nombres || !this.paciente.apellidos || !this.paciente.cedula ||
        !this.paciente.sexo || !this.paciente.fecha_nacimiento) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Complete apellidos, nombres, cédula, fecha de nacimiento y género.' });
      return;
    }
    if (!this.paciente.consentimiento_datos) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Debe registrar el consentimiento informado del paciente antes de continuar.' });
      return;
    }
    this.guardando = true;
    this.pacienteService.crearPaciente(this.paciente).subscribe({
      next: () => {
        this.guardando = false;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Paciente registrado correctamente.' });
        this.paciente = { gad: false };
        this.submitted = false;
      },
      error: (err) => {
        this.guardando = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'No se pudo registrar el paciente.' });
      }
    });
  }
}
