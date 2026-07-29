import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { FieldsetModule } from 'primeng/fieldset';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputSwitchModule } from 'primeng/inputswitch';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import { Paciente } from '../../../interface/Paciente.interface';
import { Diagnostico, HistoriaClinicaRF, NuevaHistoriaClinicaRF, Tratamiento } from '../../../interface/HistoriaClinicaRF.interface';
import { PacienteService } from '../../../layout/service/Patronato/paciente.service';
import { HistoriaClinicaRFService } from '../../../layout/service/Patronato/historia-clinica-rf.service';
import { ReportesService } from '../../../layout/service/Patronato/reportes.service';
import { ExamenComplementarioService } from '../../../layout/service/Patronato/examen-complementario.service';
import { ExamenComplementario } from '../../../interface/ExamenComplementario.interface';

@Component({
  selector: 'app-historia-clinica-rf',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    FieldsetModule,
    ToolbarModule,
    ButtonModule,
    RippleModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    InputTextareaModule,
    InputSwitchModule,
    CheckboxModule,
    TagModule,
    ToastModule,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './historia-clinica-rf.component.html'
})
export class HistoriaClinicaRFComponent implements OnInit {

  busquedaCedula: string = '';
  buscandoPaciente: boolean = false;
  pacienteActivo: Paciente | null = null;

  consultas: HistoriaClinicaRF[] = [];
  cargandoConsultas: boolean = false;

  diagnosticos: Diagnostico[] = [];

  nuevaConsultaDialog: boolean = false;
  guardando: boolean = false;
  submitted: boolean = false;
  formNueva: Partial<NuevaHistoriaClinicaRF> = {};
  llavePrivadaTexto: string = '';
  nombreArchivoLlave: string = '';

  // Exámenes de laboratorio del paciente, mostrados como contexto en el modal
  examenComplementario: ExamenComplementario | null = null;
  cargandoExamen: boolean = false;

  // Resumen de antecedentes del paciente (solo lectura, para contexto del terapeuta)
  antecedentesDialog: boolean = false;
  cargandoAntecedentes: boolean = false;
  detallePaciente: Paciente | null = null;

  // Checkboxes de tratamiento: true/false en el formulario, se traducen al
  // texto exacto que el backend espera al momento de enviar (ver armarTratamiento()).
  tratamiento = {
    estimulacion_temprana: false,
    magnetoterapia: false,
    electroestimulacion: false,
    ultrasonido: false,
    cqcoh: false,
    masaje: false,
    ejercicios_pasivos_resistidos: false,
    laser: false,
    otros: ''
  };

  detalleDialog: boolean = false;
  detalle: HistoriaClinicaRF | null = null;
  cargandoDetalle: boolean = false;

  // Diálogo posterior al guardado: ofrece imprimir la receta (plan
  // terapéutico) recién escrita, igual que en el sistema original.
  recetaGeneradaDialog: boolean = false;
  datosParaImprimir: { nombre: string; edad: string; fecha: string; receta: string; peso: string; talla: string; ta: string } | null = null;
  pesoReceta: string = '';
  tallaReceta: string = '';
  taReceta: string = '';

  lugarAtencionOptions = [
    { label: 'Patronato', value: 'Patronato' },
    { label: 'Clínica Móvil', value: 'Clinica movil' },
    { label: 'Domicilio', value: 'Domicilio' }
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
    private historiaService: HistoriaClinicaRFService,
    private examenService: ExamenComplementarioService,
    private reportesService: ReportesService,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {
    this.historiaService.getDiagnosticos().subscribe({
      next: (data) => (this.diagnosticos = data.map(d => ({ ...d, labelConCie: d.codigo_cie ? `${d.codigo_cie} - ${d.diagnostico}` : d.diagnostico }))),
      error: () => this.mostrarError('No se pudieron cargar los diagnósticos disponibles.')
    });
  }

  ngOnInit(): void {
    const cedulaUrl = this.route.snapshot.queryParamMap.get('cedula');
    if (cedulaUrl) {
      this.busquedaCedula = cedulaUrl;
      this.buscarPaciente();
    }
  }

  buscarPaciente(): void {
    if (!this.busquedaCedula || this.busquedaCedula.trim().length === 0) return;

    this.buscandoPaciente = true;
    this.pacienteService.buscarPorCedula(this.busquedaCedula.trim()).subscribe({
      next: (resultado) => {
        this.buscandoPaciente = false;
        this.pacienteActivo = resultado;
        if (!resultado) {
          this.consultas = [];
          this.messageService.add({ severity: 'info', summary: 'Sin resultados', detail: 'No existe un paciente con esa cédula.' });
        } else {
          this.cargarConsultas();
        }
      },
      error: () => {
        this.buscandoPaciente = false;
        this.mostrarError('Error al buscar el paciente.');
      }
    });
  }

  cargarConsultas(): void {
    if (!this.pacienteActivo?.id_paciente) return;
    this.cargandoConsultas = true;
    this.historiaService.getConsultasPorPaciente(this.pacienteActivo.id_paciente).subscribe({
      next: (data) => {
        this.cargandoConsultas = false;
        this.consultas = data;
      },
      error: () => {
        this.cargandoConsultas = false;
        this.mostrarError('No se pudo cargar el historial del paciente.');
      }
    });
  }

  verAntecedentes(): void {
    if (!this.pacienteActivo?.id_paciente) return;
    this.antecedentesDialog = true;
    this.cargandoAntecedentes = true;
    this.pacienteService.getPacientePorId(this.pacienteActivo.id_paciente).subscribe({
      next: (data) => {
        this.cargandoAntecedentes = false;
        this.detallePaciente = data;
      },
      error: () => {
        this.cargandoAntecedentes = false;
        this.mostrarError('No se pudieron cargar los antecedentes del paciente.');
      }
    });
  }

  abrirNuevaConsulta(): void {
    if (!this.pacienteActivo) return;
    this.formNueva = {
      id_paciente: this.pacienteActivo.id_paciente,
      edad: this.pacienteActivo.edad,
      fecha: new Date().toISOString().split('T')[0],
      certificado: false,
      grupo_atencion: this.pacienteActivo.grupo_a_prioritaria || 'Ninguno'
    };
    this.tratamiento = {
      estimulacion_temprana: false, magnetoterapia: false, electroestimulacion: false,
      ultrasonido: false, cqcoh: false, masaje: false,
      ejercicios_pasivos_resistidos: false, laser: false, otros: ''
    };
    this.llavePrivadaTexto = '';
    this.nombreArchivoLlave = '';
    this.pesoReceta = '';
    this.tallaReceta = '';
    this.taReceta = '';
    this.submitted = false;
    this.nuevaConsultaDialog = true;

    // Se cargan los exámenes de laboratorio del paciente (si tiene) para que
    // el terapeuta tenga ese contexto disponible mientras escribe la consulta.
    this.examenComplementario = null;
    if (this.pacienteActivo.id_paciente) {
      this.cargandoExamen = true;
      this.examenService.getPorPaciente(this.pacienteActivo.id_paciente).subscribe({
        next: (data) => {
          this.cargandoExamen = false;
          this.examenComplementario = data;
        },
        error: () => (this.cargandoExamen = false)
      });
    }
  }

  onArchivoLlave(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const archivo = input.files[0];
      this.nombreArchivoLlave = archivo.name;
      const reader = new FileReader();
      reader.onload = () => (this.llavePrivadaTexto = reader.result as string);
      reader.readAsText(archivo);
    }
  }

  hideNuevaConsulta(): void {
    this.nuevaConsultaDialog = false;
  }

  // Traduce los checkboxes al texto exacto que el backend/los reportes esperan
  // (ver RegistroDiarioFisica: compara con estas cadenas literales).
  private armarTratamiento(): Tratamiento {
    return {
      estimulacion_temprana: this.tratamiento.estimulacion_temprana ? 'Estimulación temprana' : null,
      magnetoterapia: this.tratamiento.magnetoterapia ? 'Magnetoterapia' : null,
      electroestimulacion: this.tratamiento.electroestimulacion ? 'Electroestimulación' : null,
      ultrasonido: this.tratamiento.ultrasonido ? 'Ultrasonido' : null,
      C_Q_C_O_H: this.tratamiento.cqcoh ? 'C.Q.C. O H.' : null,
      masaje: this.tratamiento.masaje ? 'Masaje' : null,
      ejercicios_pasivos_resistidos: this.tratamiento.ejercicios_pasivos_resistidos ? 'Ejercicios pasivos y resistidos' : null,
      laser: this.tratamiento.laser ? 'Láser' : null,
      otros: this.tratamiento.otros?.trim() || null
    };
  }

  guardarConsulta(): void {
    this.submitted = true;

    if (!this.formNueva.id_diagnostico || !this.formNueva.motivo_consulta ||
        !this.formNueva.lugar_atencion || !this.llavePrivadaTexto) {
      this.mostrarError('Complete diagnóstico, motivo de consulta, lugar de atención, y suba su llave privada.');
      return;
    }

    this.guardando = true;

    // Paso 1: crear el registro de tratamiento con las terapias marcadas
    this.historiaService.crearTratamiento(this.armarTratamiento()).subscribe({
      next: (res: any) => {
        const idTratamiento = res.id;

        const payload: NuevaHistoriaClinicaRF = {
          id_paciente: this.formNueva.id_paciente!,
          id_tratamiento: idTratamiento,
          id_diagnostico: this.formNueva.id_diagnostico!,
          lugar_atencion: this.formNueva.lugar_atencion!,
          certificado: !!this.formNueva.certificado,
          motivo_consulta: this.formNueva.motivo_consulta!,
          anamnesis: this.formNueva.anamnesis || '',
          receta: this.formNueva.receta || '',
          fecha: this.formNueva.fecha!,
          edad: this.formNueva.edad || '',
          grupo_atencion: this.formNueva.grupo_atencion || 'Ninguno',
          llavePrivadaPem: this.llavePrivadaTexto
        };

        // Paso 2: crear la historia clínica ya cifrada y firmada, referenciando el tratamiento
        this.historiaService.crearHistoria(payload).subscribe({
          next: () => {
            this.guardando = false;
            this.nuevaConsultaDialog = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Consulta registrada',
              detail: 'La consulta se cifró (ECDH) y firmó (ECDSA) correctamente.'
            });
            this.cargarConsultas();

            // Si se escribió una receta/plan terapéutico, se ofrece imprimirla
            // (igual que en el sistema original: la receta queda ligada a la consulta).
            if (payload.receta && payload.receta.trim().length > 0) {
              this.datosParaImprimir = {
                nombre: `${this.pacienteActivo?.nombres || ''} ${this.pacienteActivo?.apellidos || ''}`.trim(),
                edad: payload.edad,
                fecha: payload.fecha,
                receta: payload.receta,
                peso: this.pesoReceta,
                talla: this.tallaReceta,
                ta: this.taReceta
              };
              this.recetaGeneradaDialog = true;
            }
          },
          error: (err) => {
            this.guardando = false;
            this.mostrarError(err?.error?.message || 'No se pudo registrar la consulta.');
          }
        });
      },
      error: () => {
        this.guardando = false;
        this.mostrarError('No se pudo registrar el tratamiento asociado.');
      }
    });
  }

  imprimirRecetaGenerada(): void {
    if (!this.datosParaImprimir) return;
    // El endpoint original recibe los datos por la URL; se reemplazan los
    // puntos por comas para no romper el separador que usa el backend.
    const color = 1;
    const rp = this.datosParaImprimir.receta.replace(/\./g, ',');
    const pres = 'Plan terapéutico';
    const ruta = `/Receta/${color}/${encodeURIComponent(this.datosParaImprimir.nombre)}/` +
      `${encodeURIComponent(this.datosParaImprimir.peso || '-')}/${encodeURIComponent(this.datosParaImprimir.talla || '-')}/${encodeURIComponent(this.datosParaImprimir.ta || '-')}/` +
      `${encodeURIComponent(this.datosParaImprimir.edad)}/${this.datosParaImprimir.fecha}/${encodeURIComponent(rp)}/${encodeURIComponent(pres)}`;

    this.reportesService.abrirReporte(ruta).subscribe({
      next: (blob) => this.reportesService.descargar(blob, 'Receta.pdf'),
      error: () => this.mostrarError('No se pudo generar el PDF de la receta.')
    });
  }

  verDetalle(fila: HistoriaClinicaRF): void {
    if (!fila.id_rf) return;
    this.cargandoDetalle = true;
    this.detalleDialog = true;
    this.detalle = null;

    this.historiaService.verDetalle(fila.id_rf).subscribe({
      next: (data) => {
        this.cargandoDetalle = false;
        this.detalle = data;
      },
      error: (err) => {
        this.cargandoDetalle = false;
        this.detalleDialog = false;
        this.mostrarError(err?.error?.message || 'No se pudo descifrar el registro (verifique sus permisos de auditoría).');
      }
    });
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
