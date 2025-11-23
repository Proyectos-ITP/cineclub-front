/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PaginationInterface } from '../../../shared/interfaces/pagination.interface';
import { UserFriend } from '../../services/userFriend.service';
import { UserMongoComplete } from '../../../auth/interfaces/user.interface';
import { FriendRequestService } from '../../../shared/services/friend-request.service';
import { NotificationsService } from '../../../shared/services/notifications.service';

@Component({
  selector: 'app-friend-card',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './friend-card.html',
  styleUrl: './friend-card.scss',
})
export class FriendCard implements OnInit {
  private readonly _userFriend: UserFriend = inject(UserFriend);
  private readonly _friendRequestService: FriendRequestService = inject(FriendRequestService);
  private readonly _notificationsService: NotificationsService = inject(NotificationsService);

  loading: boolean = false;
  sendingRequest: Record<string, boolean> = {};
  cancelingRequest: Record<string, boolean> = {};
  params: any = {};
  users: UserMongoComplete[] = [];
  paginationParams: PaginationInterface = {
    page: 1,
    perPage: 5,
    total: 0,
    pageCount: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(filter: string = ''): void {
    this.loading = true;

    const query = {
      page: this.paginationParams.page,
      size: this.paginationParams.perPage,
      search: filter,
      ...this.params,
    };

    this._userFriend.getUserWithPagination(query).subscribe({
      next: (res: any) => {
        this.users = res.data || [];

        this.paginationParams = {
          page: res.page || this.paginationParams.page,
          perPage: res.size || this.paginationParams.perPage,
          total: res.total || 0,
          pageCount: res.totalPages || 0,
          hasPreviousPage: res.hasPrevious || false,
          hasNextPage: res.hasNext || false,
        };

        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error en la solicitud:', err);
        this.loading = false;
      },
    });
  }

  nextPage(): void {
    if (this.paginationParams.hasNextPage) {
      this.paginationParams.page++;
      this.loadUsers();
    }
  }

  prevPage(): void {
    if (this.paginationParams.hasPreviousPage) {
      this.paginationParams.page--;
      this.loadUsers();
    }
  }

  sendFriendRequest(userId: string): void {
    if (this.sendingRequest[userId]) return;

    this.sendingRequest[userId] = true;

    this._friendRequestService.sendFriendRequest(userId).subscribe({
      next: (response) => {
        this._notificationsService.success(
          response.message || 'Solicitud de amistad enviada correctamente',
        );
        this.users = this.users.map((user) =>
          user.id === userId ? { ...user, hasPendingRequest: true, isSender: true } : user,
        );
        this.sendingRequest[userId] = false;
      },
      error: (err) => {
        console.error('❌ Error al enviar solicitud de amistad:', err);
        const errorMessage = err?.error?.message || 'No se pudo enviar la solicitud de amistad';
        this._notificationsService.error(errorMessage);
        this.sendingRequest[userId] = false;
      },
    });
  }

  cancelFriendRequest(userId: string): void {
    if (this.cancelingRequest[userId]) return;

    this.cancelingRequest[userId] = true;

    this._friendRequestService.cancelFriendRequest(userId).subscribe({
      next: (response) => {
        this._notificationsService.success(
          response.message || 'Solicitud de amistad cancelada correctamente',
        );

        this.users = this.users.map((user) =>
          user.id === userId ? { ...user, hasPendingRequest: false, isSender: null } : user,
        );
        this.cancelingRequest[userId] = false;
      },
      error: (err) => {
        console.error('❌ Error al cancelar solicitud de amistad:', err);
        const errorMessage = err?.error?.message || 'No se pudo cancelar la solicitud de amistad';
        this._notificationsService.error(errorMessage);
        this.cancelingRequest[userId] = false;
      },
    });
  }
}
