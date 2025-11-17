import { Component, OnInit } from '@angular/core';
import { MoviesService } from '../../../public/services/movies.service';
import { MoviesInterface } from '../../../public/interface/movies.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-movies-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movies-content.html',
  styleUrls: ['./movies-content.scss'],
})
export class MoviesContent implements OnInit {
  movies: MoviesInterface[] = []; // ← las películas a mostrar
  loading = false;

  constructor(private moviesService: MoviesService) {}

  ngOnInit() {
    this.loadSavedMovies(); // Cargar favoritos al iniciar
  }

  /** 🔹 Cargar películas del catálogo (si necesitas esta función) */
  loadMovies() {
    this.loading = true;
    this.moviesService.getMoviesWithPaginationLibrary({ page: 1, size: 10 }).subscribe({
      next: (res) => {
        this.movies = res.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener películas:', err);
        this.loading = false;
      },
    });
  }

  /** 🔹 Cargar películas guardadas (favoritos) */
  loadSavedMovies() {
    this.loading = true;
    this.moviesService.getSavedMovies().subscribe({
      next: (res) => {
        // ❗ AQUÍ ESTABA EL ERROR ❗
        // Tus películas están en la propiedad movies dentro de data[0]
        this.movies = res.data[0]?.movies || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener las películas guardadas:', err);
        this.loading = false;
      },
    });
  }

  /** 🔹 Guardar película en colección */
  saveMovie(movieId: string) {
    this.moviesService.saveMovieToCollection(movieId).subscribe({
      next: () => {
        alert('🎬 Película guardada correctamente');
        this.loadSavedMovies();
      },
      error: (err) => {
        console.error('Error al guardar la película:', err);
        alert('❌ No se pudo guardar la película');
      },
    });
  }

  /** 🔹 Eliminar película guardada */
  removeMovie(movieId: string) {
    this.moviesService.removeMovieFromCollection(movieId).subscribe({
      next: () => {
        alert('🗑 Película eliminada de guardados');
        this.loadSavedMovies();
      },
      error: (err) => {
        console.error('Error al eliminar película:', err);
        alert('❌ No se pudo eliminar la película');
      },
    });
  }
}
