import { Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { isPlatformBrowser } from '@angular/common';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { WebSocketService } from './shared/services/webSocket.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App implements OnDestroy, OnInit {
  private _iconRegistry = inject(MatIconRegistry);
  private readonly _router = inject(Router);
  private _routerSubscription!: Subscription;
  private webSocketService = inject(WebSocketService);
  private readonly platformId = inject(PLATFORM_ID);
  private destroy$ = new Subject<void>();
  isConnectedWs = false;

  constructor() {
    this._setMaterialOutlinedIconsDefault();
    this._listenRouterChanges();
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const session: any = JSON.parse(localStorage.getItem('app_session') || '{}');
      const userId = session['user']?.['id'];

      console.log(userId);
      if (userId) {
        this.webSocketService.connect(userId, session['access_token']);

        this.webSocketService.connectionStatus$
          .pipe(takeUntil(this.destroy$))
          .subscribe((connected) => {
            this.isConnectedWs = connected;
            console.log('Estado de conexión:', connected ? '🟢 Conectado' : '🔴 Desconectado');
          });

        this.webSocketService.friendRequests$
          .pipe(takeUntil(this.destroy$))
          .subscribe((requests) => {
            if (requests.length > 0) {
              const lastRequest = requests[0];
              console.log(lastRequest);
            }
          });
      }
    }
  }

  /** Usa el set de íconos Material clásicos */
  private _setMaterialOutlinedIconsDefault(): void {
    this._iconRegistry.setDefaultFontSetClass('material-icons');
  }

  /** Escucha los cambios de ruta para resetear el scroll */
  private _listenRouterChanges(): void {
    this._routerSubscription = this._router.events.subscribe((event): void => {
      if (event instanceof NavigationEnd) {
        this._setScrollOnTop();
      }
    });
  }

  /** Mueve el scroll al inicio de la página */
  private _setScrollOnTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  ngOnDestroy(): void {
    this._routerSubscription.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
    this.webSocketService.disconnect();
  }
}
