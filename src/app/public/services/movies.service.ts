/* eslint-disable @typescript-eslint/no-explicit-any */
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

  // 🔥 AHORA CORRECTO → tu lista de guardados NO viene de movies, viene de collections
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

  getMoviesWithPaginationLibrary(query: object): Observable<{
    pagination: PaginationInterface;
    data: MoviesInterface[];
  }> {
    const params = this._httpUtilities.httpParamsFromObject(query);

    return this._httpClient.get<{
      pagination: PaginationInterface;
      data: MoviesInterface[];
    }>(`${environment.backendUrl}collections`, {
      params,
      headers: this.headers,
    });
  }

  saveMovieToCollection(movieId: string): Observable<any> {
    return this._httpClient.post(
      `${environment.backendUrl}collections`,
      { movieId },
      { headers: this.headers },
    );
  }

  removeMovieFromCollection(collectionId: string): Observable<any> {
    return this._httpClient.delete(`${environment.backendUrl}collections/${collectionId}`, {
      headers: this.headers,
    });
  }

  getSavedMovies(): Observable<any> {
    return this._httpClient.get(`${environment.backendUrl}collections`, {
      headers: this.headers,
    });
  }

  getUserSavedMovies(userId: string): Observable<any> {
    return this._httpClient.get(`${environment.backendUrl}collections/user/${userId}`, {
      headers: this.headers,
    });
  }
}
