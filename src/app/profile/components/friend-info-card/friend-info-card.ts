import { Component, Input, Output, EventEmitter, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProfileInterface } from '../../interfaces/profile.interface';
import { SupabaseClient } from '@supabase/supabase-js';

@Component({
  selector: 'app-friend-info-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './friend-info-card.html',
  styleUrls: ['./friend-info-card.scss'],
})
export class FriendInfoCard implements OnInit {
  @Input({ required: true }) friendId!: string;

  private router = inject(Router);

  goBack(): void {
    this.router.navigate(['/profile/my-friends']);
  }

  profile = signal<ProfileInterface | null>(null);
  loading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  showFullBibliography = signal<boolean>(false);

  private readonly _supabaseClient = inject(SupabaseClient);

  ngOnInit(): void {
    this.loadFriendProfile();
  }

  readonly displayedBibliography = computed(() => {
    const bio = this.profile()?.bibliography ?? '';
    if (bio.length <= 500 || this.showFullBibliography()) return bio;
    return bio.slice(0, 500) + '...';
  });

  toggleBibliography(): void {
    this.showFullBibliography.update((v) => !v);
  }

  async loadFriendProfile(): Promise<void> {
    try {
      this.loading.set(true);
      this.errorMessage.set(null);

      const { data: profile, error: profileError } = await this._supabaseClient
        .from('profile')
        .select('*')
        .eq('id', this.friendId)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) throw new Error('No se encontró el perfil del amigo.');

      this.profile.set(profile);
    } catch (err: Error | unknown) {
      console.error('Error cargando perfil del amigo:', err);
      this.errorMessage.set(
        err instanceof Error ? err.message : 'Error desconocido al cargar el perfil.'
      );
    } finally {
      this.loading.set(false);
    }
  }
}
