import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

// Restringe una ruta a la cuenta con rol "Administrador" únicamente.
// Se usa para Cuentas y Roles: un médico autenticado no debe poder
// crear/editar cuentas de usuario ni roles del sistema, solo el admin.
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getRol() === 'Administrador') {
    return true;
  }

  router.navigate(['/']);
  return false;
};
