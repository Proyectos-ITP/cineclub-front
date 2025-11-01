import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MoviesContent } from '../../../profile/components/movies-content/movies-content';
import { BooksContent } from '../../../profile/components/books-content/books-content';

@Component({
  selector: 'app-card-home-tab',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatIconModule, MoviesContent, BooksContent],
  templateUrl: './card-home-tab.html',
  styleUrl: './card-home-tab.scss',
})
export class CardHomeTab {}
