/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PaginationInterface } from '../../../shared/interfaces/pagination.interface';
import { UserFriend } from '../../services/userFriend.service';
import { UserMongoComplete } from '../../../auth/interfaces/user.interface';
import { FriendRequestService } from '../../../shared/services/friend-request.service';
import { SnackBarService } from '../../../shared/services/snackBar.service';

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
  private readonly _snackBarService: SnackBarService = inject(SnackBarService);

  loading: boolean = false;
  sendingRequest: { [userId: string]: boolean } = {};
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
      perPage: this.paginationParams.perPage,
      search: filter,
      ...this.params,
    };

    this._userFriend.getUserWithPagination(query).subscribe({
      next: (res) => {
        this.users = res.data || [];
        if (res.pagination) {
          this.paginationParams = {
            ...this.paginationParams,
            ...res.pagination,
          };
        }
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
        this._snackBarService.success(
          response.message || 'Solicitud de amistad enviada correctamente'
        );
        this.users = this.users.filter((user) => user.id !== userId);
        this.sendingRequest[userId] = false;
      },
      error: (err) => {
        console.error('❌ Error al enviar solicitud de amistad:', err);
        const errorMessage = err?.error?.message || 'No se pudo enviar la solicitud de amistad';
        this._snackBarService.error(errorMessage);
        this.sendingRequest[userId] = false;
      },
    });
  }
}
