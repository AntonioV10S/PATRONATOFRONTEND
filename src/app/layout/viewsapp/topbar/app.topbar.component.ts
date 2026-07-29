import { Component, ElementRef, ViewChild } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { LayoutService } from "../../service/app.layout.service";
import { AuthService } from '../../../middleware/auth.service';
import { CuentaService } from '../../service/Patronato/cuenta.service';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent {

    items!: MenuItem[];

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    // Cambio de contraseña propio (self-service)
    miPerfilDialog: boolean = false;
    passwordActual: string = '';
    passwordNueva: string = '';
    passwordConfirmar: string = '';
    guardandoPassword: boolean = false;

    constructor(
        public layoutService: LayoutService,
        private authService: AuthService,
        private cuentaService: CuentaService,
        private messageService: MessageService,
        private router: Router
    ) { }

    get nombreUsuario(): string {
        return this.authService.getUsuario()?.nombres ?? '';
    }

    cerrarSesion(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    abrirMiPerfil(): void {
        this.passwordActual = '';
        this.passwordNueva = '';
        this.passwordConfirmar = '';
        this.miPerfilDialog = true;
    }

    cambiarPassword(): void {
        if (!this.passwordActual || !this.passwordNueva || this.passwordNueva.length < 8) {
            this.messageService.add({ severity: 'warn', summary: 'Datos incompletos', detail: 'Complete su contraseña actual y una nueva de al menos 8 caracteres.' });
            return;
        }
        if (this.passwordNueva !== this.passwordConfirmar) {
            this.messageService.add({ severity: 'warn', summary: 'No coinciden', detail: 'La nueva contraseña y su confirmación no coinciden.' });
            return;
        }

        this.guardandoPassword = true;
        this.cuentaService.cambiarMiPassword(this.passwordActual, this.passwordNueva).subscribe({
            next: (res: any) => {
                this.guardandoPassword = false;
                if (res.code === '201') {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Contraseña actualizada correctamente.' });
                    this.miPerfilDialog = false;
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: res.mensaje || 'No se pudo cambiar la contraseña.' });
                }
            },
            error: (err) => {
                this.guardandoPassword = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.mensaje || 'No se pudo cambiar la contraseña.' });
            }
        });
    }
}
