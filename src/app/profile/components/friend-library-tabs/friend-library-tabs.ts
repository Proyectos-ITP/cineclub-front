import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MoviesService } from '../../../public/services/movies.service';
import { MoviesInterface } from '../../../public/interface/movies.interface';
import { SnackBarService } from '../../../shared/services/snackBar.service';
import { LibraryInterface } from '../../interfaces/library.interface';
import { CardRecomendations } from '../card-recomendations/card-recomendations';
import { BOOKS } from '../../constants/library.constants';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-friend-library-tabs',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTabsModule, CardRecomendations, LoaderComponent],
  templateUrl: './friend-library-tabs.html',
  styleUrls: ['./friend-library-tabs.scss'],
})
export class FriendLibraryTabs implements OnInit {
  @Input({ required: true }) friendId!: string;

  movies: MoviesInterface[] = [];
  books: LibraryInterface[] = BOOKS;
  loadingMovies = false;

  constructor(private moviesService: MoviesService, private snackBar: SnackBarService) {}

  ngOnInit(): void {
    this.loadFriendMovies();
  }

  loadFriendMovies(): void {
    this.loadingMovies = true;

    this.moviesService.getUserSavedMovies(this.friendId).subscribe({
      next: (res) => {
        this.movies = res.data?.[0]?.movies || [];
        this.loadingMovies = false;
      },
      error: (err) => {
        console.error('Error al obtener películas del amigo:', err);
        this.snackBar.error('Error al cargar películas del amigo');
        this.loadingMovies = false;
      },
    });
  }
}
