import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, inject, computed, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SIDEBAR_ITEMS } from '../../constants/layout.constants';
import { RouterLink } from '@angular/router';
import { SignInService } from '../../../auth/services/signIn.service';
import { SnackBarService } from '../../../shared/services/snackBar.service';
import { TokenService } from '../../../auth/services/token.service';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './side-bar.html',
  styleUrls: ['./side-bar.scss'],
})
export class SideBar {
  @Input() closeSideBar: boolean = false;
  @Output() collapsed: EventEmitter<boolean> = new EventEmitter<boolean>();

  isLoggedIn: boolean = false;
  isCollapsed: boolean = true;
  openSubMenu: Record<string, boolean> = {};

  private readonly _singInService: SignInService = inject(SignInService);
  private readonly _snackBarService: SnackBarService = inject(SnackBarService);
  private readonly _tokenService: TokenService = inject(TokenService);

  // Signal que contiene el rol del usuario actual
  private userRole = signal<string | null>(this._tokenService.getUserRole());

  // Computed que filtra los items del menú según el rol del usuario
  menuItems = computed(() => {
    const role = this.userRole();
    if (!role) return [];

    return SIDEBAR_ITEMS.filter((item) => {
      // Si el item no tiene roles definidos, es visible para todos
      if (!item.roles || item.roles.length === 0) return true;

      // Si el item tiene roles definidos, verificar si el usuario tiene uno de esos roles
      return item.roles.includes(role);
    });
  });

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
