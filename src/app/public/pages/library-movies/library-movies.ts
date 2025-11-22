import { Component, inject, OnInit } from '@angular/core';
import { MoviesService } from '../../services/movies.service';
import { MoviesInterface } from '../../interface/movies.interface';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { PaginationInterface } from '../../../shared/interfaces/pagination.interface';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { SnackBarService } from '../../../shared/services/snackBar.service';

@Component({
  selector: 'app-library-movies',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    LoaderComponent,
  ],
  templateUrl: './library-movies.html',
})
export class LibraryMovies implements OnInit {
  private readonly _moviesService: MoviesService = inject(MoviesService);
  private readonly _snackBarService: SnackBarService = inject(SnackBarService);

  movies: MoviesInterface[] = [];
  loading = true;

  paginationParams: PaginationInterface = {
    page: 1,
    perPage: 10,
    total: 0,
    pageCount: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  ngOnInit(): void {
    this.fetchMovies();
  }

  onChangePagination(event: PageEvent): void {
    this.paginationParams.page = event.pageIndex + 1;
    this.paginationParams.perPage = event.pageSize;
    this.fetchMovies();
  }

  private fetchMovies(): void {
    this.loading = true;
    const params = {
      page: this.paginationParams.page,
      size: this.paginationParams.perPage,
    };

    this._moviesService.getMoviesWithPagination(params).subscribe({
      next: (response) => {
        this.movies = response.data;
        this.loading = false;
        this.paginationParams.total = response.pagination.total || 0;
        this.paginationParams.pageCount = response.pagination.pageCount || 0;
      },
      error: (error) => {
        console.error('Error fetching movies:', error);
        this.loading = false;
      },
    });
  }

  guardarPelicula(movie: MoviesInterface): void {
    this._moviesService.saveMovieToCollection(movie.id!).subscribe({
      next: () => {
        this._snackBarService.success('Película guardada correctamente');
      },
      error: (err) => {
        console.error('Error al guardar la película:', err);
        if (err.status === 409) {
          this._snackBarService.error('Película ya guardada');
        } else {
          this._snackBarService.error('❌ No se pudo guardar la película.');
        }
      },
    });
  }
}
