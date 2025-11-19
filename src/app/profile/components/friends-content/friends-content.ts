import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { FriendRequestService } from '../../../shared/services/friend-request.service';
import { SnackBarService } from '../../../shared/services/snackBar.service';
import { YesNoDialogComponent } from '../../../shared/components/yes-no-dialog/yes-no-dialog.component';
import { FriendInterface } from '../../interfaces/friends.interface';

@Component({
  selector: 'app-friends-content',
  standalone: true,
  imports: [CommonModule, MatIcon],
  templateUrl: './friends-content.html',
  styleUrls: ['./friends-content.scss'],
})
export class FriendsContent implements OnInit {
  friends: FriendInterface[] = [];
  loading = false;
  currentPage = 1;
  pageSize = 10;
  total = 0;
  totalPages = 0;
  hasNext = false;
  hasPrevious = false;

  constructor(
    private friendRequestService: FriendRequestService,
    private dialog: MatDialog,
    private snackBar: SnackBarService
  ) {}

  ngOnInit() {
    this.loadFriends();
  }

  loadFriends() {
    this.loading = true;

    const query = {
      page: this.currentPage,
      size: this.pageSize,
    };

    this.friendRequestService.getFriends(query).subscribe({
      next: (res) => {
        this.friends = res.data || [];
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.hasNext = res.hasNext;
        this.hasPrevious = res.hasPrevious;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener amigos:', err);
        this.snackBar.error('Error al cargar amigos');
        this.loading = false;
      },
    });
  }

  openRemoveFriendDialog(friendId: string, friendName: string) {
    const dialogRef = this.dialog.open(YesNoDialogComponent, {
      data: {
        title: '¿Eliminar amigo?',
        message: `¿Estás seguro de que deseas eliminar a ${friendName} de tu lista de amigos?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirm) => {
      if (confirm) {
        this.removeFriend(friendId);
      }
    });
  }

  removeFriend(friendId: string) {
    this.loading = true;

    this.friendRequestService.removeFriend(friendId).subscribe({
      next: () => {
        this.snackBar.success('Amigo eliminado');
        this.loadFriends();
      },
      error: (err) => {
        console.error(err);
        this.snackBar.error('No se pudo eliminar');
        this.loading = false;
      },
    });
  }

  nextPage() {
    if (this.hasNext) {
      this.currentPage++;
      this.loadFriends();
    }
  }

  previousPage() {
    if (this.hasPrevious) {
      this.currentPage--;
      this.loadFriends();
    }
  }
}
