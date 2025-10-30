/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, NgZone, inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormGroup, FormsModule } from '@angular/forms';
import { UserAdminService } from '../../services/userAdmin.service';
import { UserCompleteInterface } from '../../../auth/interfaces/user.interface';
import { PaginationInterface } from '../../../shared/interfaces/pagination.interface';
import { SearchField } from '../../../shared/interfaces/search.interface';
import { SearchFieldsComponent } from '../../../shared/components/search-fields/search-fields.component';
import { HttpClient } from '@angular/common/http';
import { Country } from '../../../auth/interfaces/country.interface';
import { map, take, firstValueFrom } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { YesNoDialogComponent } from '../../../shared/components/yes-no-dialog/yes-no-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SnackBarService } from '../../../shared/services/snackBar.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    SearchFieldsComponent,
    MatIconModule,
    RouterLink,
    MatTooltipModule,
  ],
  templateUrl: './see-users.html',
  styleUrl: './see-users.scss',
})
export class SeeUsers implements OnInit {
  displayedColumns: string[] = [
    'fullName',
    'email',
    'country',
    'role',
    'username',
    'phone',
    'actions',
  ];

  users: UserCompleteInterface[] = [];
  loading: boolean = false;
  form!: FormGroup;
  params: any = {};
  paginationParams: PaginationInterface = {
    page: 1,
    perPage: 25,
    total: 0,
    pageCount: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  get hasActiveFilters(): boolean {
    return this.hasFilters(this.params);
  }

  searchFields: SearchField[] = [
    {
      name: 'search',
      label: 'Nombres, email o nombre de usuario',
      type: 'text',
      placeholder: 'Buscar...',
    },
    {
      name: 'roleType',
      label: 'Rol',
      type: 'select',
      options: [],
      placeholder: 'Todos los roles',
    },
    {
      name: 'country',
      label: 'Nacionalidad',
      type: 'select',
      options: [],
      placeholder: 'Todos los países',
    },
  ];

  private readonly _ngZone = inject(NgZone);
  private readonly _userAdminService: UserAdminService = inject(UserAdminService);
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly _matDialog: MatDialog = inject(MatDialog);
  private readonly _snackBarService: SnackBarService = inject(SnackBarService);
  private readonly _supabaseClient = inject(SupabaseClient);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(SearchFieldsComponent) searchFieldsComponent!: SearchFieldsComponent;

  async ngOnInit() {
    await this.loadRoles();
    await this.loadCountries();
    this.loadUsers();
  }

  async loadRoles() {
    try {
      const roles = await this._userAdminService.getRoleTypes();
      const roleField = this.searchFields.find((f) => f.name === 'roleType');
      if (roleField) {
        roleField.options = roles.map((role) => ({
          value: role.id,
          label: role.name,
        }));
        this._cdr.detectChanges();
      }
    } catch (error) {
      console.error('❌ Error al cargar roles:', error);
    }
  }

  async loadCountries() {
    try {
      this._http
        .get<Country[]>('https://restcountries.com/v3.1/all?fields=name')
        .pipe(
          map((res) => res.map((c) => c.name.common).sort()),
          take(1)
        )
        .subscribe((countries) => {
          const countryField = this.searchFields.find((f) => f.name === 'country');
          if (countryField) {
            countryField.options = countries.map((country) => ({
              value: country,
              label: country,
            }));
            this._cdr.detectChanges();
          }
        });
    } catch (error) {
      console.error('❌ Error al cargar países:', error);
    }
  }

  onSearchSubmit(values: any): void {
    this.params = values;
    this.paginationParams.page = 1;
    this.loadUsers();
  }

  async loadUsers() {
    this.loading = true;
    try {
      const { data, count } = await this._userAdminService.getUsers(
        this.paginationParams.page,
        this.paginationParams.perPage,
        this.params
      );

      this._ngZone.run(() => {
        this.users = data || [];
        this.paginationParams.total = count || 0;
        this.loading = false;
      });
    } catch (error) {
      console.error('❌ Error al cargar usuarios:', error);
      this.loading = false;
    }
  }

  onSearchChange(event: any): void {
    setTimeout(() => {
      this.params = event.value || {};
      this.loadUsers();
    });
  }

  onFormReady(form: FormGroup): void {
    this.form = form;
  }

  onChangePagination(event: PageEvent): void {
    this.paginationParams.page = event.pageIndex + 1;
    this.paginationParams.perPage = event.pageSize;
    this.loadUsers();
  }

  clearFilters(): void {
    if (this.searchFieldsComponent) {
      this.searchFieldsComponent.reset();
    }
    this.params = {};
    this.paginationParams.page = 1;
  }

  private hasFilters(obj: Record<string, any>): boolean {
    return Object.values(obj || {}).some(
      (value) => value !== null && value !== undefined && value !== ''
    );
  }

  async deleteUser(id: string) {
    this.loading = true;
    try {
      const { error } = await this._supabaseClient.from('profile').delete().eq('id', id);

      if (error) throw error;

      await firstValueFrom(this._userAdminService.deleteUserPanel(id));

      this._snackBarService.success('Usuario eliminado correctamente.');
      await this.loadUsers();
      return true;
    } catch (error: any) {
      console.error('❌ Error al eliminar usuario:', error.message);
      this._snackBarService.error('No se pudo eliminar el usuario.');
      this.loading = false;
      throw error;
    }
  }

  openDeleteUserDialog(id: string): void {
    const dialogRef = this._matDialog.open(YesNoDialogComponent, {
      data: {
        title: '¿Deseas eliminar este usuario?',
        message: 'Esta acción no se puede deshacer.',
      },
    });

    dialogRef.afterClosed().subscribe((confirm) => {
      if (confirm) {
        this.deleteUser(id);
      }
    });
  }
}
