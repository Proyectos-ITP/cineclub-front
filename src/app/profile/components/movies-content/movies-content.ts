import { Component, OnInit } from '@angular/core';
import { MoviesService } from '../../../public/services/movies.service';
import { MoviesInterface } from '../../../public/interface/movies.interface';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { YesNoDialogComponent } from '../../../shared/components/yes-no-dialog/yes-no-dialog.component';
import { SnackBarService } from '../../../shared/services/snackBar.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-movies-content',
  standalone: true,
  imports: [CommonModule, MatIcon],
  templateUrl: './movies-content.html',
  styleUrls: ['./movies-content.scss'],
})
export class MoviesContent implements OnInit {
  movies: MoviesInterface[] = [];
  loading = false;

  constructor(
    private moviesService: MoviesService,
    private dialog: MatDialog,
    private snackBar: SnackBarService
  ) {}

  ngOnInit() {
    this.loadSavedMovies();
  }

  loadSavedMovies() {
    this.loading = true;

    this.moviesService.getSavedMovies().subscribe({
      next: (res) => {
        this.movies = res.data?.[0]?.movies || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener películas guardadas:', err);
        this.snackBar.error('Error al cargar películas guardadas');
        this.loading = false;
      },
    });
  }

  openDeleteMovieDialog(movieId: string) {
    const dialogRef = this.dialog.open(YesNoDialogComponent, {
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

    this.moviesService.removeMovieFromCollection(movieId).subscribe({
      next: () => {
        this.snackBar.success('Película eliminada');
        this.loadSavedMovies();
      },
      error: (err) => {
        console.error(err);
        this.snackBar.error('No se pudo eliminar');
        this.loading = false;
      },
    });
  }
}
