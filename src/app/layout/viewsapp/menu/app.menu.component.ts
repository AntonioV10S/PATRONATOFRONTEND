import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from '../../service/app.layout.service';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../middleware/auth.service';

// Cada item de menu declara "roles": la lista EXACTA de roles que lo ven.
// Ya no hay inclusion automatica de Administrador en ningun nivel — por
// diseno (separacion de funciones / LOPDP), el Administrador queda
// limitado a configuracion del sistema y auditoria de solo lectura. Si
// una pantalla operativa necesita que el admin la vea, hay que agregarlo
// explicitamente a su lista de roles aqui.
interface ItemMenu {
  label: string;
  icon?: string;
  routerLink?: string[];
  roles?: string[];
  items?: ItemMenu[];
}

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];

    private menuCompleto: ItemMenu[] = [
        {
            label: 'Home',
            items: [
                { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }
            ]
        },
        {
            // Configuracion del sistema y auditoria de solo lectura — el unico
            // bloque donde el Administrador tiene acceso completo.
            label: 'Administración',
            roles: ['Administrador'],
            items: [
                { label: 'Cuentas de Usuario', icon: 'pi pi-fw pi-users', routerLink: ['/cuentas'] },
                { label: 'Roles', icon: 'pi pi-fw pi-id-card', routerLink: ['/roles'] },
                { label: 'Catálogos Clínicos (CIE)', icon: 'pi pi-fw pi-book', routerLink: ['/catalogos-clinicos'] },
                { label: 'Historial Clínico Completo', icon: 'pi pi-fw pi-history', routerLink: ['/historial-completo'] },
                { label: 'Turnos', icon: 'pi pi-fw pi-clock', routerLink: ['/horarios'] },
                { label: 'Parámetros', icon: 'pi pi-fw pi-list', routerLink: ['/parametros'] },
                { label: 'Incidentes de Seguridad', icon: 'pi pi-fw pi-shield', routerLink: ['/incidentes-seguridad'] },
                { label: 'Solicitudes ARCO+', icon: 'pi pi-fw pi-user-edit', routerLink: ['/solicitudes-arco'] },
            ]
        },
        {
            label: 'Atención al Paciente',
            roles: ['Administrador', 'Secretaría'],
            items: [
                // El admin puede VER pacientes (auditoria), pero no crearlos ni
                // editarlos — eso se controla dentro del propio componente.
                { label: 'Pacientes', icon: 'pi pi-fw pi-user', routerLink: ['/pacientes'],
                  roles: ['Secretaría'] },
                { label: 'Agregar Paciente', icon: 'pi pi-fw pi-user-plus', routerLink: ['/agregar-paciente'],
                  roles: ['Secretaría'] },
                { label: 'Registrar Historia Clínica', icon: 'pi pi-fw pi-file-edit', routerLink: ['/registrar-historia-clinica'],
                  roles: ['Secretaría'] },
                { label: 'Agendar Cita', icon: 'pi pi-fw pi-calendar-plus', routerLink: ['/agendar-cita'],
                  roles: ['Secretaría'] },
                { label: 'Mostrar Citas', icon: 'pi pi-fw pi-calendar', routerLink: ['/mostrar-citas'],
                  roles: ['Secretaría'] },
                { label: 'Solicitudes ARCO+', icon: 'pi pi-fw pi-user-edit', routerLink: ['/solicitudes-arco'],
                  roles: ['Secretaría'] },
            ]
        },
        {
            label: 'Medicina General',
            roles: ['Medicina General'],
            items: [
                { label: 'Citas', icon: 'pi pi-fw pi-sitemap', routerLink: ['/citas-medico-mg'] },
                { label: 'Historial de consultas', icon: 'pi pi-fw pi-folder', routerLink: ['/historial-consultas-mg'] },
                { label: 'Pacientes', icon: 'pi pi-fw pi-users', routerLink: ['/pacientes'] },
                { label: 'Generar Reporte', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/reportes-medico-mg'] },
            ]
        },
        {
            label: 'Rehabilitación Física',
            roles: ['Rehabilitación Física'],
            items: [
                { label: 'Citas', icon: 'pi pi-fw pi-sitemap', routerLink: ['/citas-medico-rf'] },
                { label: 'Historial de consultas', icon: 'pi pi-fw pi-folder', routerLink: ['/historial-consultas-rf'] },
                { label: 'Pacientes', icon: 'pi pi-fw pi-users', routerLink: ['/pacientes'] },
                { label: 'Generar Reporte', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/reportes-medico-rf'] },
            ]
        },
        {
            label: 'Farmacia',
            roles: ['Farmacia'],
            items: [
                { label: 'Home', icon: 'pi pi-fw pi-home', routerLink: ['/farmacia/home'] },
                { label: 'Nueva Adquisición', icon: 'pi pi-fw pi-plus-circle', routerLink: ['/farmacia/nueva-adquisicion'] },
                { label: 'Medicamentos', icon: 'pi pi-fw pi-box', routerLink: ['/farmacia/medicamentos'] },
                { label: 'Inventario', icon: 'pi pi-fw pi-warehouse', routerLink: ['/farmacia/inventario'] },
                { label: 'Adquisiciones', icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/farmacia/adquisiciones'] },
                { label: 'Recetas Entregadas', icon: 'pi pi-fw pi-send', routerLink: ['/farmacia/entregas'] },
            ]
        },
        {
            label: 'Administración Financiera',
            roles: ['Secretaría'],
            items: [
                { label: 'Recaudación', icon: 'pi pi-fw pi-dollar', routerLink: ['/recaudacion'] },
                { label: 'Egresos', icon: 'pi pi-fw pi-wallet', routerLink: ['/egresos'] },
            ]
        },
        {
            label: 'Reportes',
            roles: ['Administrador', 'Secretaría'],
            items: [
                // Reportes Estadisticos es de solo lectura (PDFs) — se mantiene
                // para el admin como herramienta de auditoria/supervision.
                { label: 'Reportes Estadísticos', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/reportes'],
                  roles: ['Administrador'] },
                { label: 'Generar Reporte', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/reportes-secretaria'],
                  roles: ['Secretaría'] },
            ]
        }
    ];

    constructor(public layoutService: LayoutService, private authService: AuthService) { }

    ngOnInit() {
        const rolActual = this.authService.getRol();

        // Coincidencia EXACTA con la lista de roles del item — ya no hay
        // ningun caso especial que le abra todo al Administrador aqui.
        const puedeVer = (roles?: string[]): boolean => {
            if (!roles || roles.length === 0) return true; // sin restriccion = visible para todos
            return !!rolActual && roles.includes(rolActual);
        };

        this.model = this.menuCompleto
            .filter((seccion) => puedeVer(seccion.roles))
            .map((seccion) => ({
                ...seccion,
                items: (seccion.items || []).filter((item) => puedeVer(item.roles))
            }))
            .filter((seccion) => seccion.items.length > 0); // oculta secciones que quedaron vacias
    }
}
