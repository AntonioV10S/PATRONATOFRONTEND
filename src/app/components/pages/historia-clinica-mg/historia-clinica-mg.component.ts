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
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';

import { Paciente } from '../../../interface/Paciente.interface';
import { Enfermedad, HistoriaClinicaMG, NuevaHistoriaClinicaMG } from '../../../interface/HistoriaClinica.interface';
import { Medicamento } from '../../../interface/Farmacia.interface';
import { PacienteService } from '../../../layout/service/Patronato/paciente.service';
import { HistoriaClinicaMGService } from '../../../layout/service/Patronato/historia-clinica-mg.service';
import { ExamenComplementarioService } from '../../../layout/service/Patronato/examen-complementario.service';
import { ExamenComplementario } from '../../../interface/ExamenComplementario.interface';
import { FarmaciaService } from '../../../layout/service/Patronato/farmacia.service';
import { EntregaService } from '../../../layout/service/Patronato/entrega.service';
import { ReportesService } from '../../../layout/service/Patronato/reportes.service';

@Component({
  selector: 'app-historia-clinica-mg',
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
    InputNumberModule,
    TagModule,
    ToastModule,
    FileUploadModule,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './historia-clinica-mg.component.html'
})
export class HistoriaClinicaMGComponent implements OnInit {

  // Búsqueda de paciente
  busquedaCedula: string = '';
  buscandoPaciente: boolean = false;
  pacienteActivo: Paciente | null = null;

  // Historial del paciente activo
  consultas: HistoriaClinicaMG[] = [];
  cargandoConsultas: boolean = false;

  // Catálogo
  enfermedades: Enfermedad[] = [];

  // Diálogo nueva consulta
  nuevaConsultaDialog: boolean = false;
  guardando: boolean = false;
  submitted: boolean = false;
  formNueva: Partial<NuevaHistoriaClinicaMG> = {};
  llavePrivadaTexto: string = '';
  nombreArchivoLlave: string = '';

  // Exámenes de laboratorio del paciente, mostrados como contexto en el modal
  examenComplementario: ExamenComplementario | null = null;
  cargandoExamen: boolean = false;

  // Resumen de antecedentes del paciente (solo lectura, para contexto del médico)
  antecedentesDialog: boolean = false;
  cargandoAntecedentes: boolean = false;
  detallePaciente: Paciente | null = null;

  // Receta de farmacia, conectada a esta consulta (igual que en el sistema
  // original: al firmar la consulta, se crea una Entrega con los
  // medicamentos recetados aquí mismo).
  medicamentosDisponibles: Medicamento[] = [];
  recetaCarrito: { id_medicamento: number; nombre: string; cantidad: number; indicaciones: string }[] = [];
  pesoReceta: string = '';
  tallaReceta: string = '';
  taReceta: string = '';
  medicamentoSeleccionado: number | null = null;
  cantidadSeleccionada: number = 1;
  indicacionesSeleccionadas: string = '';

  // Diálogo posterior al guardado: ofrece imprimir la receta generada
  recetaGeneradaDialog: boolean = false;
  idEntregaGenerada: number | null = null;

  // Diálogo de detalle (descifrado)
  detalleDialog: boolean = false;
  detalle: HistoriaClinicaMG | null = null;
  cargandoDetalle: boolean = false;

  tipoAtencionOptions = [
    { label: 'Prevención', value: 'Prevención' },
    { label: 'Primera', value: 'Primera' },
    { label: 'Subsecuente', value: 'Subsecuente' }
  ];
  condicionDiagnosticoOptions = [
    { label: 'Presuntivo', value: 'Presuntivo' },
    { label: 'Definitivo', value: 'Definitivo' }
  ];
  lugarAtencionOptions = [
    { label: 'Patronato', value: 'Patronato' },
    { label: 'Comunidad', value: 'Comunidad' },
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
    private historiaService: HistoriaClinicaMGService,
    private examenService: ExamenComplementarioService,
    private farmaciaService: FarmaciaService,
    private entregaService: EntregaService,
    private reportesService: ReportesService,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {
    this.historiaService.getEnfermedades().subscribe({
      next: (data) => (this.enfermedades = data.map(e => ({ ...e, labelConCie: e.codigo_cie ? `${e.codigo_cie} - ${e.enfermedad}` : e.enfermedad }))),
      error: () => this.mostrarError('No se pudieron cargar los diagnósticos disponibles.')
    });
    this.farmaciaService.getMedicamentos().subscribe({
      next: (data) => (this.medicamentosDisponibles = data)
    , error: (err) => console.error('Error al cargar datos de catálogo:', err) });
  }

  ngOnInit(): void {
    // Si se llega aquí desde otra pantalla (ej. "Consultas" en Pacientes),
    // la cédula viene como parámetro de la URL y se busca automáticamente.
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
      certificado: false,
      grupo_atencion: this.pacienteActivo.grupo_a_prioritaria || 'Ninguno'
    };
    this.llavePrivadaTexto = '';
    this.nombreArchivoLlave = '';
    this.submitted = false;
    this.nuevaConsultaDialog = true;
    this.recetaCarrito = [];
    this.pesoReceta = '';
    this.tallaReceta = '';
    this.taReceta = '';
    this.medicamentoSeleccionado = null;
    this.cantidadSeleccionada = 1;
    this.indicacionesSeleccionadas = '';

    // Se cargan los exámenes de laboratorio del paciente (si tiene) para que
    // el médico tenga ese contexto disponible mientras escribe la consulta.
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

  agregarMedicamentoAlCarrito(): void {
    if (!this.medicamentoSeleccionado) {
      this.mostrarError('Seleccione un medicamento.');
      return;
    }
    const medicamento = this.medicamentosDisponibles.find(m => m.id_medicamento === this.medicamentoSeleccionado);
    if (!medicamento) return;

    this.recetaCarrito.push({
      id_medicamento: medicamento.id_medicamento!,
      nombre: medicamento.nombre || '',
      cantidad: this.cantidadSeleccionada,
      indicaciones: this.indicacionesSeleccionadas
    });

    this.medicamentoSeleccionado = null;
    this.cantidadSeleccionada = 1;
    this.indicacionesSeleccionadas = '';
  }

  quitarMedicamentoDelCarrito(index: number): void {
    this.recetaCarrito.splice(index, 1);
  }

  guardarConsulta(): void {
    this.submitted = true;

    if (!this.formNueva.id_enfermedad || !this.formNueva.motivo || !this.formNueva.diagnostico ||
        !this.formNueva.lugar_atencion || !this.formNueva.tipo_atencion || !this.llavePrivadaTexto) {
      this.mostrarError('Complete diagnóstico, motivo, plan, lugar de atención, tipo de atención, y suba su llave privada.');
      return;
    }

    this.guardando = true;

    const payload: NuevaHistoriaClinicaMG = {
      id_paciente: this.formNueva.id_paciente!,
      id_enfermedad: this.formNueva.id_enfermedad!,
      motivo: this.formNueva.motivo!,
      diagnostico: this.formNueva.diagnostico!,
      plan_terapeutico: this.formNueva.plan_terapeutico || '',
      lugar_atencion: this.formNueva.lugar_atencion!,
      certificado: !!this.formNueva.certificado,
      edad: this.formNueva.edad || '',
      tipo_atencion: this.formNueva.tipo_atencion!,
      condicion_diagnostico: this.formNueva.condicion_diagnostico || 'Presuntivo',
      grupo_atencion: this.formNueva.grupo_atencion || 'Ninguno',
      llavePrivadaPem: this.llavePrivadaTexto
    };

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

        // Si el médico recetó medicamentos en esta consulta, se crea la
        // Entrega (farmacia) tal como en el sistema original: la receta
        // queda conectada a la consulta y lista para imprimirse/despachar.
        if (this.recetaCarrito.length > 0) {
          this.crearEntregaConReceta();
        }
      },
      error: (err) => {
        this.guardando = false;
        this.mostrarError(err?.error?.message || 'No se pudo registrar la consulta.');
      }
    });
  }

  verDetalle(fila: HistoriaClinicaMG): void {
    if (!fila.id_historia_mg) return;
    this.cargandoDetalle = true;
    this.detalleDialog = true;
    this.detalle = null;

    this.historiaService.verDetalle(fila.id_historia_mg).subscribe({
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

  verificarIntegridad(fila: HistoriaClinicaMG): void {
    if (!fila.id_historia_mg) return;
    this.historiaService.verificarIntegridad(fila.id_historia_mg).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: res.match ? 'success' : 'error',
          summary: res.match ? 'Íntegro' : 'Alerta de integridad',
          detail: res.result,
          life: 8000
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Alerta de integridad',
          detail: err?.error?.result || 'Los datos podrían haber sido manipulados.',
          life: 8000
        });
      }
    });
  }

  private crearEntregaConReceta(): void {
    if (!this.formNueva.id_paciente) return;

    this.entregaService.crearEntrega({
      id_paciente: this.formNueva.id_paciente,
      Fechaentrega: new Date().toISOString().split('T')[0],
      peso: this.pesoReceta,
      talla: this.tallaReceta,
      ta: this.taReceta,
      subtotal: 0,
      descuento: 0,
      totalapagar: 0
    }).subscribe({
      next: (res: any) => {
        const idEntrega = res.id;
        const llamadas = this.recetaCarrito.map(item =>
          this.entregaService.agregarMedicamento({
            id_entrega: idEntrega,
            id_medicamento: item.id_medicamento,
            cantidadmedicamentos: item.cantidad,
            indicaciones: item.indicaciones
          })
        );

        forkJoin(llamadas).subscribe({
          next: () => {
            this.idEntregaGenerada = idEntrega;
            this.recetaGeneradaDialog = true;
          },
          error: () => this.mostrarError('La consulta se guardó, pero hubo un error al registrar algunos medicamentos de la receta. Revise el módulo de Farmacia > Entregas.')
        });
      },
      error: () => this.mostrarError('La consulta se guardó, pero no se pudo crear la receta de farmacia.')
    });
  }

  imprimirRecetaGenerada(): void {
    if (!this.idEntregaGenerada) return;
    this.reportesService.abrirReporte(`/recetafinal/${this.idEntregaGenerada}`).subscribe({
      next: (blob) => this.reportesService.descargar(blob, `Receta.pdf`),
      error: () => this.mostrarError('No se pudo generar el PDF de la receta.')
    });
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }
}
