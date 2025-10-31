/* eslint-disable @typescript-eslint/no-explicit-any */
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NavBar } from '../../components/nav-bar/nav-bar';
import { SupabaseService } from '../../../auth/services/supabase.service';
import { filter, Subscription } from 'rxjs';
import { MatSpinner } from '@angular/material/progress-spinner';
import { SideBar } from '../../components/side-bar/side-bar';

@Component({
  selector: 'app-default-layout',
  standalone: true,
  imports: [RouterOutlet, NavBar, MatSpinner, SideBar],
  templateUrl: './default-layout.html',
  styleUrl: './default-layout.scss',
})
export class DefaultLayout implements OnInit, OnDestroy {
  private readonly _supabaseService: SupabaseService = inject(SupabaseService);
  private readonly _router: Router = inject(Router);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private sub?: Subscription;
  private initSub?: Subscription;

  showSidebar: boolean = true;
  isReady: boolean = false;
  isLoggedIn: boolean = false;
  isInitializing: boolean = true;

  constructor() {
    this._router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const hideSidebarRoutes = ['/profile/register-profile'];

        this.showSidebar = !hideSidebarRoutes.some((route) =>
          event.urlAfterRedirects.includes(route)
        );
      });
  }

  async ngOnInit() {
    this.initSub = this._supabaseService.isInitialized$.subscribe(async (initialized) => {
      if (initialized) {
        try {
          const session = await this._supabaseService.getSession();
          this.isLoggedIn = !!session.data.session;

          this.sub = this._supabaseService.user$.subscribe((user) => {
            this.isLoggedIn = !!user;
          });

          setTimeout(() => {
            this.isReady = true;
            this.isInitializing = false;
          }, 2000);
        } catch (error) {
          console.error('Error al obtener sesión:', error);
          this.isReady = true;
          this.isInitializing = false;
        }
      }
    });

    setTimeout(() => {
      if (this.isInitializing) {
        this.isReady = true;
        this.isInitializing = false;
      }
    }, 2000);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.initSub?.unsubscribe();
  }
}
