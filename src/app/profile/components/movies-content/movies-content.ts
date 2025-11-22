import { Component, inject, OnInit } from '@angular/core';
import { MoviesService } from '../../../public/services/movies.service';
import { MoviesInterface } from '../../../public/interface/movies.interface';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { YesNoDialogComponent } from '../../../shared/components/yes-no-dialog/yes-no-dialog.component';
import { SnackBarService } from '../../../shared/services/snackBar.service';
import { MatIcon } from '@angular/material/icon';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-movies-content',
  standalone: true,
  imports: [CommonModule, MatIcon, LoaderComponent],
  templateUrl: './movies-content.html',
  styleUrls: ['./movies-content.scss'],
})
export class MoviesContent implements OnInit {
  movies: MoviesInterface[] = [];
  loading = false;

  private readonly _moviesService: MoviesService = inject(MoviesService);
  private readonly _dialog: MatDialog = inject(MatDialog);
  private readonly _snackBarService: SnackBarService = inject(SnackBarService);

  ngOnInit() {
    this.loadSavedMovies();
  }

  loadSavedMovies() {
    this.loading = true;

    this._moviesService.getSavedMovies().subscribe({
      next: (res) => {
        this.movies = res.data?.[0]?.movies || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener películas guardadas:', err);
        this._snackBarService.error('Error al cargar películas guardadas');
        this.loading = false;
      },
    });
  }

  openDeleteMovieDialog(movieId: string) {
    const dialogRef = this._dialog.open(YesNoDialogComponent, {
      data: {
        title: '¿Eliminar película?',
        message: 'Esta acción no se puede deshacer.',
      },
    });

    dialogRef.afterClosed().subscribe((confirm) => {
      if (confirm) {
        this.removeMovie(movieId);
      }
    });
  }

  removeMovie(movieId: string) {
    this.loading = true;

    this._moviesService.removeMovieFromCollection(movieId).subscribe({
      next: () => {
        this._snackBarService.success('Película eliminada');
        this.loadSavedMovies();
      },
      error: (err) => {
        console.error(err);
        this._snackBarService.error('No se pudo eliminar');
        this.loading = false;
      },
    });
  }
}
