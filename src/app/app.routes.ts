import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app.layout.component';
import { authGuard } from './middleware/auth.guard';
import { adminGuard } from './middleware/admin.guard';
import { especialidadGuard } from './middleware/especialidad.guard';
import { LoginComponent } from './components/auth/login/login.component';
import { HomeComponent } from './components/pages/home/home.component';
import { CuentasComponent } from './components/pages/cuentas/cuentas.component';
import { RolesComponent } from './components/pages/roles/roles.component';
import { PacientesComponent } from './components/pages/pacientes/pacientes.component';
import { HistoriaClinicaMGComponent } from './components/pages/historia-clinica-mg/historia-clinica-mg.component';
import { HistoriaClinicaRFComponent } from './components/pages/historia-clinica-rf/historia-clinica-rf.component';
import { CitasComponent } from './components/pages/citas/citas.component';
import { MedicamentosComponent } from './components/pages/farmacia/medicamentos/medicamentos.component';
import { InventarioComponent } from './components/pages/farmacia/inventario/inventario.component';
import { AdquisicionesComponent } from './components/pages/farmacia/adquisiciones/adquisiciones.component';
import { NuevaAdquisicionComponent } from './components/pages/farmacia/nueva-adquisicion/nueva-adquisicion.component';
import { HomeFarmaciaComponent } from './components/pages/farmacia/home-farmacia/home-farmacia.component';
import { EntregasComponent } from './components/pages/farmacia/entregas/entregas.component';
import { RecaudacionComponent } from './components/pages/recaudacion/recaudacion.component';
import { EgresosComponent } from './components/pages/egresos/egresos.component';
import { ReportesComponent } from './components/pages/reportes/reportes.component';
import { CatalogosClinicosComponent } from './components/pages/catalogos-clinicos/catalogos-clinicos.component';
import { LaboratorioComponent } from './components/pages/laboratorio/laboratorio.component';
import { HistorialCompletoComponent } from './components/pages/historial-completo/historial-completo.component';
import { HorariosComponent } from './components/pages/horarios/horarios.component';
import { ParametrosComponent } from './components/pages/parametros/parametros.component';
import { IncidentesSeguridadComponent } from './components/pages/incidentes-seguridad/incidentes-seguridad.component';
import { SolicitudesArcoComponent } from './components/pages/solicitudes-arco/solicitudes-arco.component';
import { RegistroAntecedentesComponent } from './components/pages/registro-antecedentes/registro-antecedentes.component';
import { RegistrarHistoriaClinicaComponent } from './components/pages/registrar-historia-clinica/registrar-historia-clinica.component';
import { AgregarPacienteComponent } from './components/pages/agregar-paciente/agregar-paciente.component';
import { AgendarCitaComponent } from './components/pages/agendar-cita/agendar-cita.component';
import { MostrarCitasComponent } from './components/pages/mostrar-citas/mostrar-citas.component';
import { ReportesSecretariaComponent } from './components/pages/reportes-secretaria/reportes-secretaria.component';
import { CitasMedicoMgComponent } from './components/pages/citas-medico-mg/citas-medico-mg.component';
import { HistorialConsultasMgComponent } from './components/pages/historial-consultas-mg/historial-consultas-mg.component';
import { ReportesMedicoMgComponent } from './components/pages/reportes-medico-mg/reportes-medico-mg.component';
import { CitasMedicoRfComponent } from './components/pages/citas-medico-rf/citas-medico-rf.component';
import { HistorialConsultasRfComponent } from './components/pages/historial-consultas-rf/historial-consultas-rf.component';
import { ReportesMedicoRfComponent } from './components/pages/reportes-medico-rf/reportes-medico-rf.component';
import { AccesoDenegadoComponent } from './components/pages/acceso-denegado/acceso-denegado.component';

export const routes: Routes = [

  { path: '',
    component: AppLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'cuentas', component: CuentasComponent, canActivate: [adminGuard] },
      { path: 'roles', component: RolesComponent, canActivate: [adminGuard] },
      { path: 'pacientes', component: PacientesComponent },
      { path: 'registro-antecedentes', component: RegistroAntecedentesComponent, canActivate: [especialidadGuard(['Secretaría'])] },
      { path: 'registrar-historia-clinica', component: RegistrarHistoriaClinicaComponent, canActivate: [especialidadGuard(['Secretaría'])] },
      { path: 'agregar-paciente', component: AgregarPacienteComponent, canActivate: [especialidadGuard(['Secretaría'])] },
      { path: 'agendar-cita', component: AgendarCitaComponent, canActivate: [especialidadGuard(['Secretaría', 'Medicina General', 'Rehabilitación Física'])] },
      { path: 'mostrar-citas', component: MostrarCitasComponent, canActivate: [especialidadGuard(['Secretaría', 'Medicina General', 'Rehabilitación Física'])] },
      { path: 'reportes-secretaria', component: ReportesSecretariaComponent, canActivate: [especialidadGuard(['Secretaría'])] },
      { path: 'citas-medico-mg', component: CitasMedicoMgComponent, canActivate: [especialidadGuard(['Medicina General'])] },
      { path: 'historial-consultas-mg', component: HistorialConsultasMgComponent, canActivate: [especialidadGuard(['Medicina General'])] },
      { path: 'reportes-medico-mg', component: ReportesMedicoMgComponent, canActivate: [especialidadGuard(['Medicina General'])] },
      { path: 'citas-medico-rf', component: CitasMedicoRfComponent, canActivate: [especialidadGuard(['Rehabilitación Física'])] },
      { path: 'historial-consultas-rf', component: HistorialConsultasRfComponent, canActivate: [especialidadGuard(['Rehabilitación Física'])] },
      { path: 'reportes-medico-rf', component: ReportesMedicoRfComponent, canActivate: [especialidadGuard(['Rehabilitación Física'])] },
      { path: 'historia-clinica-mg', component: HistoriaClinicaMGComponent, canActivate: [especialidadGuard(['Medicina General'])] },
      { path: 'historia-clinica-rf', component: HistoriaClinicaRFComponent, canActivate: [especialidadGuard(['Rehabilitación Física'])] },
      { path: 'historial-completo', component: HistorialCompletoComponent, canActivate: [adminGuard] },
      { path: 'horarios', component: HorariosComponent, canActivate: [adminGuard] },
      { path: 'parametros', component: ParametrosComponent, canActivate: [adminGuard] },
      { path: 'incidentes-seguridad', component: IncidentesSeguridadComponent, canActivate: [adminGuard] },
      { path: 'solicitudes-arco', component: SolicitudesArcoComponent, canActivate: [especialidadGuard(['Secretaría', 'Administrador'])] },
      { path: 'citas', component: CitasComponent, canActivate: [especialidadGuard(['Secretaría', 'Medicina General', 'Rehabilitación Física'])] },
      { path: 'farmacia/medicamentos', component: MedicamentosComponent, canActivate: [especialidadGuard(['Farmacia'])] },
      { path: 'farmacia/inventario', component: InventarioComponent, canActivate: [especialidadGuard(['Farmacia'])] },
      { path: 'farmacia/home', component: HomeFarmaciaComponent, canActivate: [especialidadGuard(['Farmacia'])] },
      { path: 'farmacia/nueva-adquisicion', component: NuevaAdquisicionComponent, canActivate: [especialidadGuard(['Farmacia'])] },
      { path: 'farmacia/adquisiciones', component: AdquisicionesComponent, canActivate: [especialidadGuard(['Farmacia'])] },
      { path: 'farmacia/entregas', component: EntregasComponent, canActivate: [especialidadGuard(['Farmacia'])] },
      { path: 'recaudacion', component: RecaudacionComponent, canActivate: [especialidadGuard(['Secretaría'])] },
      { path: 'egresos', component: EgresosComponent, canActivate: [especialidadGuard(['Secretaría'])] },
      { path: 'reportes', component: ReportesComponent },
      { path: 'catalogos-clinicos', component: CatalogosClinicosComponent, canActivate: [adminGuard] },
      { path: 'laboratorio', component: LaboratorioComponent, canActivate: [especialidadGuard(['Medicina General', 'Rehabilitación Física'])] },
    ],
    canActivate: [authGuard]
  },
  { path: 'acceso-denegado', component: AccesoDenegadoComponent },
  { path: 'login', component: LoginComponent }
];
