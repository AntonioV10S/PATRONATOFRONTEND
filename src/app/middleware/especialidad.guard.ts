import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * Restringe una ruta a una lista de roles permitidos, EXACTAMENTE los que
 * se pasan (ya no se agrega "Administrador" automáticamente). Por diseño,
 * el Administrador queda limitado a configuración del sistema y auditoría
 * de solo lectura (LOPDP) — no tiene acceso operativo a pacientes, historias
 * clínicas, farmacia, citas ni movimientos financieros, salvo que se lo
 * incluya explícitamente en la lista de esa ruta puntual.
 *
 * Uso en app.routes.ts:
 *   canActivate: [especialidadGuard(['Medicina General'])]
 *   canActivate: [especialidadGuard(['Medicina General', 'Administrador'])]  // si el admin sí debe entrar
 */
export function especialidadGuard(rolesPermitidos: string[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const rolActual = authService.getRol();
    if (rolActual && rolesPermitidos.includes(rolActual)) {
      return true;
    }

    router.navigate(['/acceso-denegado']);
    return false;
  };
}
