import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginationInterface } from '../../shared/interfaces/pagination.interface';
import { HttpUtilitiesService } from '../../shared/utilities/http-utilities.service';
import { MoviesInterface } from '../interface/movies.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MoviesService {
  private readonly _httpClient = inject(HttpClient);
  private readonly _httpUtilities = inject(HttpUtilitiesService);

  private get headers(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // 🔹 Obtener películas con paginación
  getMoviesWithPagination(query: object): Observable<{
    pagination: PaginationInterface;
    data: MoviesInterface[];
  }> {
    const params = this._httpUtilities.httpParamsFromObject(query);

    return this._httpClient.get<{
      pagination: PaginationInterface;
      data: MoviesInterface[];
    }>(`${environment.backendUrl}movies`, {
      params,
      headers: this.headers,
    });
  }

  // 🔹 Guardar película en la colección del usuario
  saveMovieToCollection(movieId: string): Observable<any> {
    return this._httpClient.post(`${environment.backendUrl}collections`, { movieId });
  }
  // 🔹 Eliminar una película guardada de la colección
  deleteSavedMovie(movieId: string): Observable<any> {
    return this._httpClient.delete(`${environment.backendUrl}collections/${movieId}`, {
      headers: this.headers,
    });
  }
  // 🔹 Obtener películas guardadas por el usuario
  getSavedMovies(): Observable<any> {
    return this._httpClient.get(`${environment.backendUrl}collections`, {
      headers: this.headers,
    });
  }
}
