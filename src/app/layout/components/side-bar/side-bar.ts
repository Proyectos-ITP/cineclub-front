import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  computed,
  signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SIDEBAR_ITEMS } from '../../constants/layout.constants';
import { RouterLink } from '@angular/router';
import { SignInService } from '../../../auth/services/signIn.service';
import { SnackBarService } from '../../../shared/services/snackBar.service';
import { TokenService } from '../../../auth/services/token.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink, LoaderComponent],
  templateUrl: './side-bar.html',
  styleUrls: ['./side-bar.scss'],
})
export class SideBar implements OnInit, OnDestroy {
  @Input() closeSideBar: boolean = false;
  @Output() collapsed: EventEmitter<boolean> = new EventEmitter<boolean>();

  isLoggedIn: boolean = false;
  isCollapsed: boolean = true;
  openSubMenu: Record<string, boolean> = {};

  private readonly _singInService: SignInService = inject(SignInService);
  private readonly _snackBarService: SnackBarService = inject(SnackBarService);
  private readonly _tokenService: TokenService = inject(TokenService);
  private _roleSubscription?: Subscription;

  private userRole = signal<string | null>(null);

  isLoading = signal<boolean>(true);

  menuItems = computed(() => {
    const role = this.userRole();

    if (!role || role === '') return [];

    return SIDEBAR_ITEMS.filter((item) => {
      if (!item.roles || item.roles.length === 0) return true;

      return item.roles.includes(role);
    });
  });

  ngOnInit(): void {
    const currentRole = this._tokenService.getUserRole();

    if (currentRole !== null) {
      this.userRole.set(currentRole);
      this.isLoading.set(false);
    }

    this._roleSubscription = this._tokenService.userRole$.subscribe((role) => {
      this.userRole.set(role);

      this.isLoading.set(false);
    });
  }

  ngOnDestroy(): void {
    this._roleSubscription?.unsubscribe();
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) this.closeAllSubMenus();
    this.collapsed.emit(this.isCollapsed);
  }

  toggleSubMenu(title: string): void {
    if (this.isCollapsed) {
      this.isCollapsed = false;
      this.collapsed.emit(this.isCollapsed);
    }

    if (this.openSubMenu[title]) {
      this.openSubMenu[title] = false;
    } else {
      Object.keys(this.openSubMenu).forEach((key) => {
        this.openSubMenu[key] = false;
      });
      this.openSubMenu[title] = true;
    }
  }

  closeAllSubMenus(): void {
    this.openSubMenu = {};
  }

  async signOut() {
    try {
      await this._singInService.signOut();
      this.isLoggedIn = false;
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      this._snackBarService.error('Error al cerrar sesión');
    }
  }
}
