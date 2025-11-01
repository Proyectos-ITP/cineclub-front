import { inject, Injectable } from '@angular/core';
import { PaginationInterface } from '../../shared/interfaces/pagination.interface';
import { Observable } from 'rxjs';

import { HttpUtilitiesService } from '../../shared/utilities/http-utilities.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MoviesInterface } from '../interface/movies.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MoviesService {
  private readonly _httpClient: HttpClient = inject(HttpClient);
  private readonly _httpUtilities: HttpUtilitiesService = inject(HttpUtilitiesService);
  getMoviesWithPagination(query: object): Observable<{
    pagination: PaginationInterface;
    data: MoviesInterface[];
  }> {
    const params = this._httpUtilities.httpParamsFromObject(query);
    const token = localStorage.getItem('access_token');

    // ✅ crea instancia de HttpHeaders (nunca undefined)
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this._httpClient.get<{
      pagination: PaginationInterface;
      data: MoviesInterface[];
    }>(`${environment.backendUrl}movies`, {
      params,
      headers,
      responseType: 'json',
    });
  }
}
