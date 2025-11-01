import { Component, inject, OnInit } from '@angular/core';
import { MoviesService } from '../../services/movies.service';

@Component({
  selector: 'app-library-movies',
  imports: [],
  templateUrl: './library-movies.html',
  styleUrl: './library-movies.scss',
})
export class LibraryMovies implements OnInit {
  private readonly _moviesService: MoviesService = inject(MoviesService);

  ngOnInit(): void {
    this.fetchMovies();
  }

  private fetchMovies(): void {
    this._moviesService.getMoviesWithPagination({}).subscribe({
      next: (response) => {
        console.log('Movies fetched successfully:', response);
      },
      error: (error) => {
        console.error('Error fetching movies:', error);
      },
    });
  }
}
