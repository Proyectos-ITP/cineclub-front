import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationsService } from '../services/notifications.service';
import { TokenService } from '../../auth/services/token.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const notificationsService = inject(NotificationsService);
  const router = inject(Router);

  // Solo agregar el token si la petición va al backend
  if (req.url.startsWith(environment.backendUrl)) {
    const token = tokenService.getAccessToken();

    // Si hay token, clonamos la petición y agregamos el header Authorization
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  }

  // Manejamos los errores de autenticación y autorización
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      switch (err.status) {
        case 401:
          // Token inválido o expirado - limpiar y redirigir al login
          tokenService.clearSession();
          router.navigate(['/auth/login']);
          notificationsService.showNotification(
            'error',
            'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
            'Sesión expirada'
          );
          break;
        case 403:
          notificationsService.showNotification(
            'error',
            err?.error?.message || 'No tienes permisos para realizar esta acción',
            'No autorizado'
          );
          break;
      }
      return throwError(() => err);
    })
  );
};
