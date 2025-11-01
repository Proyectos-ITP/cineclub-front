import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { LibraryMovies } from './pages/library-movies/library-movies';
export const publicRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'home',
        component: Home,
      },
      {
        path: 'movies/library',
        component: LibraryMovies,
      },
    ],
  },
];
