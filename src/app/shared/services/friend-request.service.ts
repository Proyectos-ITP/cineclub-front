import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FriendRequestResponse } from '../interfaces/friend-request.interface';
import { FriendsResponseInterface } from '../../profile/interfaces/friends.interface';
import { HttpUtilitiesService } from '../utilities/http-utilities.service';

@Injectable({
  providedIn: 'root',
})
export class FriendRequestService {
  private readonly _httpClient: HttpClient = inject(HttpClient);
  private readonly _httpUtilities: HttpUtilitiesService = inject(HttpUtilitiesService);

  sendFriendRequest(friendId: string): Observable<FriendRequestResponse> {
    const body = { friendId };
    return this._httpClient.post<FriendRequestResponse>(
      `${environment.backendUrl}social/friend-requests`,
      body
    );
  }

  getSendFriendRequests(): Observable<FriendRequestResponse> {
    return this._httpClient.get<FriendRequestResponse>(
      `${environment.backendUrl}social/friend-requests/sent`
    );
  }

  getReceivedFriendRequests(): Observable<FriendRequestResponse> {
    return this._httpClient.get<FriendRequestResponse>(
      `${environment.backendUrl}social/friend-requests/received`
    );
  }

  acceptFriendRequest(senderId: string): Observable<FriendRequestResponse> {
    return this._httpClient.put<FriendRequestResponse>(
      `${environment.backendUrl}social/friend-requests/accept/${senderId}`,
      {}
    );
  }

  rejectFriendRequest(senderId: string): Observable<FriendRequestResponse> {
    return this._httpClient.put<FriendRequestResponse>(
      `${environment.backendUrl}social/friend-requests/reject/${senderId}`,
      {}
    );
  }

  getFriends(query: object = {}): Observable<FriendsResponseInterface> {
    const params = this._httpUtilities.httpParamsFromObject(query);
    return this._httpClient.get<FriendsResponseInterface>(
      `${environment.backendUrl}social/friends`,
      { params }
    );
  }

  removeFriend(friendId: string): Observable<FriendRequestResponse> {
    return this._httpClient.delete<FriendRequestResponse>(
      `${environment.backendUrl}social/friends/${friendId}`
    );
  }
}
