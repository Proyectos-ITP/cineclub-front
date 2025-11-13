import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../auth/services/token.service';

/**
 * Guard que verifica si el usuario tiene un perfil completo (con rol válido).
 * Si no tiene rol válido, redirige a /profile/register-profile
 */
export const profileCompleteGuard = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const userRole = tokenService.getUserRole();

  if (!userRole || userRole === '') {
    console.log('🚫 profileCompleteGuard: Perfil incompleto, redirigiendo a completar perfil');
    return router.createUrlTree(['/profile/register-profile']);
  }

  return true;
};
