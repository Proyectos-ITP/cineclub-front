import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { MOVIES_CARD_CONSTANTS } from '../../constants/movies.constans';

@Component({
  selector: 'app-movies-card-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movies-card-home.html',
  styleUrl: './movies-card-home.scss',
})
export class MoviesCardHomeComponent {
  movies = MOVIES_CARD_CONSTANTS;
}
