import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { PasswordModule } from 'primeng/password';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { Cuenta, Rol } from '../../../interface/Cuenta.interface';
import { CuentaService } from '../../../layout/service/Patronato/cuenta.service';
import { AuthImgDirective } from '../../../shared/directives/auth-img.directive';

@Component({
  selector: 'app-cuentas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    PanelModule,
    ToolbarModule,
    ButtonModule,
    RippleModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    InputTextareaModule,
    PasswordModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    AuthImgDirective
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './cuentas.component.html'
})
export class CuentasComponent implements OnInit {

  cuentas: Cuenta[] = [];
  roles: Rol[] = [];
  busqueda: string = '';

  // Llave privada ECC generada al crear una cuenta con rol medico/de atencion.
  // El backend solo la entrega UNA vez en la respuesta; nunca se guarda.
  llavePrivadaDialog: boolean = false;
  llavePrivadaGenerada: string = '';
  nombreCuentaGenerada: string = '';

  // Reseteo de contraseña por parte del admin (cuando el usuario la perdió por completo)
  resetPasswordDialog: boolean = false;
  cuentaAResetear: Cuenta | null = null;
  passwordTemporalReset: string = '';
  reseteando: boolean = false;
  cuenta: Cuenta = {};
  submitted: boolean = false;
  editando: boolean = false;
  guardando: boolean = false;

  archivoSeleccionado: File | null = null;
  previewImagen: string | null = null;

  rowsPerPageOptions: number[] = [5, 10, 20];

  estadoOptions = [
    { label: 'Activo', value: true },
    { label: 'Inhabilitado', value: false }
  ];

  constructor(
    private cuentaService: CuentaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.cargarCuentas();
    this.cargarRoles();
  }

  get cuentasFiltradas(): Cuenta[] {
    const termino = this.busqueda.trim().toLowerCase();
    if (!termino) return this.cuentas;
    return this.cuentas.filter(c => (c.nombres || '').toLowerCase().includes(termino));
  }

  cargarCuentas(): void {
    this.cuentaService.getCuentas().subscribe({
      next: (data) => (this.cuentas = data),
      error: () => this.mostrarError('No se pudieron cargar las cuentas.')
    });
  }

  cargarRoles(): void {
    this.cuentaService.getRoles().subscribe({
      next: (data) => (this.roles = data),
      error: () => this.mostrarError('No se pudieron cargar los roles.')
    });
  }

  openNew(): void {
    this.cuenta = { estado: true };
    this.archivoSeleccionado = null;
    this.previewImagen = null;
    this.submitted = false;
    this.editando = false;
  }

  editarCuenta(datos: Cuenta): void {
    this.cuenta = { ...datos, password: '' };
    this.archivoSeleccionado = null;
    this.previewImagen = null;
    this.submitted = false;
    this.editando = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
      const reader = new FileReader();
      reader.onload = () => (this.previewImagen = reader.result as string);
      reader.readAsDataURL(this.archivoSeleccionado);
    }
  }

  guardarCuenta(): void {
    this.submitted = true;

    if (!this.cuenta.nombres || !this.cuenta.correo || !this.cuenta.id_rol) {
      this.mostrarError('Complete nombres, correo y rol antes de guardar.');
      return;
    }
    if (!this.editando && (!this.cuenta.password || this.cuenta.password.length < 8)) {
      this.mostrarError('La contraseña es obligatoria y debe tener al menos 8 caracteres.');
      return;
    }
    if (this.editando && this.cuenta.password && this.cuenta.password.length > 0 && this.cuenta.password.length < 8) {
      this.mostrarError('Si va a cambiar la contraseña, debe tener al menos 8 caracteres. Déjela vacía si no quiere cambiarla.');
      return;
    }

    this.guardando = true;

    const continuarGuardado = (nombreImagen: string | null) => {
      const payload: Cuenta = { ...this.cuenta };
      if (nombreImagen) {
        payload.imagen = nombreImagen;
      }
      if (this.editando && !payload.password) {
        delete payload.password;
      }

      const peticion = this.editando
        ? this.cuentaService.actualizarCuenta(payload)
        : this.cuentaService.crearCuenta(payload);

      peticion.subscribe({
        next: (res: any) => {
          this.guardando = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: this.editando ? 'Cuenta actualizada correctamente.' : 'Cuenta creada correctamente.'
          });

          // Si el rol asignado atiende pacientes o firma historias, el backend
          // genera un par de llaves ECC y devuelve la privada UNA sola vez,
          // solo en esta respuesta. Si no se muestra/descarga ahora, se pierde
          // para siempre (nunca se guarda en el servidor).
          if (res?.crypto?.llave_privada_descarga) {
            this.llavePrivadaGenerada = res.crypto.llave_privada_descarga;
            this.nombreCuentaGenerada = payload.nombres || '';
            this.llavePrivadaDialog = true;
          }

          this.cargarCuentas();
          this.openNew();
        },
        error: (err) => {
          this.guardando = false;
          this.mostrarError(err?.error?.mensaje || 'No se pudo guardar la cuenta.');
        }
      });
    };

    if (this.archivoSeleccionado) {
      this.cuentaService.subirImagen(this.archivoSeleccionado).subscribe({
        next: (res) => continuarGuardado(res.fileId),
        error: () => {
          this.guardando = false;
          this.mostrarError('No se pudo subir la imagen.');
        }
      });
    } else {
      continuarGuardado(null);
    }
  }

  confirmarEliminar(datos: Cuenta): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar la cuenta de "${datos.nombres}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => this.eliminarCuenta(datos)
    });
  }

  private eliminarCuenta(datos: Cuenta): void {
    if (!datos.id_cuenta) return;
    this.cuentaService.eliminarCuenta(datos.id_cuenta).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cuenta eliminada.' });
        this.cargarCuentas();
      },
      error: () => this.mostrarError('No se pudo eliminar la cuenta.')
    });
  }

  confirmarRegenerarLlave(datos: Cuenta): void {
    this.confirmationService.confirm({
      message: `¿Regenerar la llave ECC de "${datos.nombres}"? La llave anterior quedará desactivada (los registros ya firmados con ella siguen siendo válidos), pero ${datos.nombres} necesitará la llave nueva para firmar consultas a partir de ahora.`,
      header: 'Confirmar regeneración de llave',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, regenerar',
      rejectLabel: 'Cancelar',
      accept: () => {
        if (!datos.id_cuenta) return;
        this.cuentaService.regenerarLlave(datos.id_cuenta).subscribe({
          next: (res: any) => {
            if (res?.crypto?.llave_privada_descarga) {
              this.llavePrivadaGenerada = res.crypto.llave_privada_descarga;
              this.nombreCuentaGenerada = datos.nombres || '';
              this.llavePrivadaDialog = true;
            }
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Llave regenerada correctamente.' });
          },
          error: (err) => this.mostrarError(err?.error?.mensaje || 'No se pudo regenerar la llave.')
        });
      }
    });
  }

  abrirResetearPassword(datos: Cuenta): void {
    this.cuentaAResetear = datos;
    this.passwordTemporalReset = '';
    this.resetPasswordDialog = true;
  }

  confirmarResetearPassword(): void {
    if (!this.cuentaAResetear?.id_cuenta || !this.passwordTemporalReset || this.passwordTemporalReset.length < 8) {
      this.mostrarError('La contraseña temporal debe tener al menos 8 caracteres.');
      return;
    }
    this.reseteando = true;
    this.cuentaService.resetearPassword(this.cuentaAResetear.id_cuenta, this.passwordTemporalReset).subscribe({
      next: () => {
        this.reseteando = false;
        this.resetPasswordDialog = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Contraseña reseteada. Comuníquesela a ${this.cuentaAResetear?.nombres} por un canal aparte.`
        });
      },
      error: (err) => {
        this.reseteando = false;
        this.mostrarError(err?.error?.mensaje || 'No se pudo resetear la contraseña.');
      }
    });
  }

  private mostrarError(detalle: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
  }

  descargarLlavePrivada(): void {
    const blob = new Blob([this.llavePrivadaGenerada], { type: 'application/x-pem-file' });
    const url = URL.createObjectURL(blob);
    const nombreArchivo = `llave_privada_${this.nombreCuentaGenerada.replace(/\s+/g, '_').toLowerCase()}.pem`;
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.click();
    URL.revokeObjectURL(url);
  }

  copiarLlavePrivada(): void {
    navigator.clipboard.writeText(this.llavePrivadaGenerada).then(() => {
      this.messageService.add({ severity: 'success', summary: 'Copiado', detail: 'Llave privada copiada al portapapeles.' });
    });
  }

  cerrarLlavePrivadaDialog(): void {
    this.llavePrivadaDialog = false;
    this.llavePrivadaGenerada = '';
  }
}
