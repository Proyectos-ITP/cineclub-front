/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { map, Observable, startWith, take } from 'rxjs';
import { SupabaseClient } from '@supabase/supabase-js';
import { Country } from '../../../auth/interfaces/country.interface';
import { UserAdminService } from '../../services/userAdmin.service';
import { SnackBarService } from '../../../shared/services/snackBar.service';
import { RoleTypeInterface } from '../../../auth/interfaces/user.interface';

@Component({
  selector: 'app-edit-user-panel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './edit-user-panel.html',
  styleUrl: './edit-user-panel.scss',
})
export class EditUserPanel implements OnInit {
  userForm!: FormGroup;
  loading: boolean = false;
  isEditMode: boolean = false;
  userId: string | null = null;
  countries: string[] = [];
  filteredCountries: Observable<string[]> = new Observable();
  roles: RoleTypeInterface[] = [];

  private readonly _fb = inject(FormBuilder);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _http = inject(HttpClient);
  private readonly _supabaseClient = inject(SupabaseClient);
  private readonly _userAdminService = inject(UserAdminService);
  private readonly _snackBarService = inject(SnackBarService);

  ngOnInit() {
    this.initializeForm();
    this.loadCountries();
    this.loadRoles();
    this.checkMode();
  }

  initializeForm() {
    this.userForm = this._fb.group({
      fullName: ['', [Validators.required]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      country: ['', [Validators.required]],
      roleTypeId: ['', [Validators.required]],
      bibliography: [''],
    });
  }

  async checkMode() {
    this.userId = this._route.snapshot.paramMap.get('id');

    if (this.userId && this.userId !== 'new') {
      this.isEditMode = true;
      await this.loadUserData();
    }
  }

  async loadUserData() {
    if (!this.userId) return;

    try {
      this.loading = true;

      const { data, error } = await this._supabaseClient
        .from('profile')
        .select(
          `
          id,
          fullName,
          username,
          email,
          phone,
          country,
          roleTypeId,
          bibliography
        `
        )
        .eq('id', this.userId)
        .single();

      if (error) throw error;

      if (data) {
        this.userForm.patchValue({
          fullName: data.fullName,
          username: data.username,
          email: data.email,
          phone: data.phone,
          country: data.country,
          roleTypeId: data.roleTypeId,
          bibliography: data.bibliography || '',
        });
      }
    } catch (error: any) {
      console.error('❌ Error al cargar usuario:', error);
      this._snackBarService.error('No se pudo cargar el usuario.');
      this._router.navigate(['/organizational/see-users']);
    } finally {
      this.loading = false;
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
          this.countries = countries;
          this.filteredCountries = this.userForm.get('country')!.valueChanges.pipe(
            startWith(''),
            map((value) => this._filterCountries(value || ''))
          );
        });
    } catch (error) {
      console.error('❌ Error al cargar países:', error);
    }
  }

  async loadRoles() {
    try {
      this.roles = await this._userAdminService.getRoleTypes();
    } catch (error) {
      console.error('❌ Error al cargar roles:', error);
    }
  }

  private _filterCountries(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.countries.filter((option) => option.toLowerCase().includes(filterValue));
  }

  private generateRandomPassword(): string {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    // Asegurar que tenga al menos una mayúscula, una minúscula, un número y un carácter especial
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];

    // Completar el resto de la contraseña
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Mezclar los caracteres
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  async onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this._snackBarService.error('Por favor completa todos los campos requeridos.');
      return;
    }

    this.loading = true;

    try {
      if (this.isEditMode) {
        await this.updateUser();
      } else {
        await this.createUser();
      }
    } catch (error: any) {
      console.error('❌ Error al guardar usuario:', error);
      this._snackBarService.error(error.message || 'Error al guardar el usuario.');
    } finally {
      this.loading = false;
    }
  }

  async createUser() {
    const formData = this.userForm.value;
    const randomPassword = this.generateRandomPassword();

    // 1. Verificar si el email ya existe
    const { data: existingProfile } = await this._supabaseClient
      .from('profile')
      .select('id')
      .eq('email', formData.email)
      .maybeSingle();

    if (existingProfile) {
      throw new Error('Este correo ya está registrado.');
    }

    // 2. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await this._supabaseClient.auth.signUp({
      email: formData.email,
      password: randomPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          fullName: formData.fullName,
          email: formData.email,
          country: formData.country,
          phone: formData.phone,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No se pudo crear el usuario.');

    // 3. Crear perfil en Supabase
    const { error: profileError } = await this._supabaseClient.from('profile').insert({
      id: authData.user.id,
      email: formData.email,
      fullName: formData.fullName,
      username: formData.username,
      country: formData.country,
      phone: formData.phone,
      roleTypeId: formData.roleTypeId,
      created_at: new Date().toISOString(),
    });

    if (profileError) throw profileError;

    this._snackBarService.success(
      `Usuario creado exitosamente. Contraseña temporal: ${randomPassword}`
    );
    this._router.navigate(['/organizational/see-users']);
  }

  async updateUser() {
    if (!this.userId) return;

    const formData = this.userForm.value;

    // Actualizar perfil en Supabase
    const { error } = await this._supabaseClient
      .from('profile')
      .update({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        roleTypeId: formData.roleTypeId,
        bibliography: formData.bibliography,
      })
      .eq('id', this.userId);

    if (error) throw error;

    this._snackBarService.success('Usuario actualizado exitosamente.');
    this._router.navigate(['/organizational/see-users']);
  }

  cancel() {
    this._router.navigate(['/organizational/see-users']);
  }
}
