import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { MOVIES_CARD_CONSTANTS } from '../../constants/movies.constans';

import { BooksContent } from '../../../profile/components/books-content/books-content';
import { MoviesContent } from '../../../profile/components/movies-content/movies-content';

@Component({
  selector: 'app-movies-card-home',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatIconModule, MoviesContent, BooksContent],
  templateUrl: './movies-card-home.html',
  styleUrl: './movies-card-home.scss',
})
export class MoviesCardHomeComponent {
  movies = MOVIES_CARD_CONSTANTS;
}
