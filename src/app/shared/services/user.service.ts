import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserMongoComplete } from '../../auth/interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly _httpClient: HttpClient = inject(HttpClient);

  getUserById(id: string): Observable<UserMongoComplete> {
    return this._httpClient.get<UserMongoComplete>(`${environment.backendUrl}users/${id}`);
  }
}
