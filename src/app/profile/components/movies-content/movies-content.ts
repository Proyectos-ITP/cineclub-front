import { Component } from '@angular/core';
import { LibraryInterface } from '../../interfaces/library.interface';
import { MOVIES } from '../../constants/library.constants';
import { CardRecomendations } from '../card-recomendations/card-recomendations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-movies-content',
  standalone: true,
  imports: [CardRecomendations, CommonModule],
  templateUrl: './movies-content.html',
  styleUrl: './movies-content.scss',
})
export class MoviesContent {
  movies: LibraryInterface[] = MOVIES;
}
