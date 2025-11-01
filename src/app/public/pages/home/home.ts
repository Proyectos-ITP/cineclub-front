import { MatButtonModule } from '@angular/material/button';
import { Component, inject, OnInit } from '@angular/core';
import { SupabaseService } from '../../../auth/services/supabase.service';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { HomeLogout } from '../../components/home-logout/home-logout';
import { CommonModule } from '@angular/common';
import { MoviesService } from '../../services/movies.service';
import { PaginationInterface } from '../../../shared/interfaces/pagination.interface';
import { MoviesCardHomeComponent } from '../../components/movies-card-home/movies-card-home';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatButtonModule, HomeLogout, CommonModule, MoviesCardHomeComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly _moviesService: MoviesService = inject(MoviesService);
  private readonly _supabaseService: SupabaseService = inject(SupabaseService);
  private sub?: Subscription;
  params: any = {};
  isReady = false;
  isLoggedIn = false;
  paginationParams: PaginationInterface = {
    page: 1,
    perPage: 25,
    total: 0,
    pageCount: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  };
  ngOnInit() {
    // this.loadMovies();
    this.sub = this._supabaseService.user$
      .pipe(distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)))
      .subscribe((user) => {
        this.isReady = true;
        this.isLoggedIn = !!user;
      });
  }

  loadMovies(filter: string = '') {
    const query = {
      page: this.paginationParams.page,
      PerPage: this.paginationParams.perPage,
      search: filter,
      ...this.params,
    };
    this._moviesService.getMoviesWithPagination(query).subscribe((response) => {
      this.paginationParams = response.pagination;
    });
  }
}
