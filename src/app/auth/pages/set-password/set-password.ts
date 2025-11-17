import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SupabaseClient } from '@supabase/supabase-js';
import { SnackBarService } from '../../../shared/services/snackBar.service';
import { AuthCard } from '../../components/auth-card/auth-card';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-set-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    AuthCard,
  ],
  templateUrl: './set-password.html',
  styleUrl: './set-password.scss',
})
export class SetPassword implements OnInit {
  form: FormGroup;
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  isLoading: boolean = false;

  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _router: Router = inject(Router);
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _supabaseClient = inject(SupabaseClient);
  private readonly _snackBarService: SnackBarService = inject(SnackBarService);
  private readonly _tokenService: TokenService = inject(TokenService);

  constructor() {
    this.form = this._fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  async ngOnInit() {
    this._tokenService.clearSession();

    const {
      data: { session },
      error,
    } = await this._supabaseClient.auth.getSession();

    if (error || !session) {
      console.error('❌ Error obteniendo sesión:', error);
      this._snackBarService.error('Link inválido o expirado. Por favor solicita un nuevo correo.');
      this._router.navigate(['/auth/login']);
    }
  }

  passwordsMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  async setPassword() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    try {
      const { password } = this.form.value;

      const { error } = await this._supabaseClient.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      await this._supabaseClient.auth.signOut();
      this._tokenService.clearSession();

      this._snackBarService.success(
        '¡Contraseña establecida correctamente! Ahora puedes iniciar sesión.'
      );
      this._router.navigate(['/auth/login']);
    } catch (error: any) {
      this._snackBarService.error(error.message || 'Error al establecer la contraseña.');
    } finally {
      this.isLoading = false;
    }
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }
}
