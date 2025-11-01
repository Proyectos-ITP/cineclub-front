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
  movies: MoviesInterface[] = [];
  savedMovies: any[] = [];
  loading = false;

  constructor(private moviesService: MoviesService) {}

  ngOnInit() {
    this.loadMovies();
    this.loadSavedMovies();
  }

  // 🔹 Cargar películas disponibles
  loadMovies() {
    this.loading = true;
    this.moviesService.getMoviesWithPagination({ page: 1, size: 10 }).subscribe({
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

  // 🔹 Cargar películas guardadas desde la API
  loadSavedMovies() {
    this.moviesService.getSavedMovies().subscribe({
      next: (res) => {
        this.savedMovies = res.data || res; // depende del formato de la API
      },
      error: (err) => {
        console.error('Error al obtener las películas guardadas:', err);
      },
    });
  }

  // 🔹 Guardar película en la API
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

  // 🔹 Verificar si la película ya está guardada
  isSaved(movieId: string): boolean {
    return this.savedMovies.some((m) => m.movieId === movieId);
  }
}
