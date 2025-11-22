import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SnackBarService } from '../services/snackBar.service';

@Injectable()
export class ResponseInterceptor implements HttpInterceptor {
  private readonly _snackBarService: SnackBarService = inject(SnackBarService);

  private errorMessages: Record<number, string> = {
    400: 'Solicitud incorrecta. Por favor, verifica los datos enviados.',
    401: 'No autorizado. Por favor, inicia sesión de nuevo.',
    403: 'No tienes permiso para realizar esta acción.',
    404: 'El recurso solicitado no fue encontrado.',
    500: 'Error interno del servidor. Por favor, inténtalo de nuevo más tarde.',
    503: 'Servicio no disponible. Por favor, inténtalo de nuevo más tarde.',
    504: 'Tiempo de espera agotado. Por favor, inténtalo de nuevo más tarde.',
  };

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          if (event.status >= 200 && event.status < 300) {
            if (event.body && event.body.message) {
              this._snackBarService.success(event.body.message);
            }
          }
        }
      }),
      catchError((error: HttpErrorResponse) => {
        const message = this.errorMessages[error.status] || 'Ocurrió un error inesperado.';
        this._snackBarService.error(message);
        return throwError(() => error);
      }),
    );
  }
}
