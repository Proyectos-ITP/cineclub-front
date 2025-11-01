import { Component, inject, OnInit } from '@angular/core';
import {
  FriendRequestInterface,
  FriendRequestResponse,
} from '../../../shared/interfaces/friend-request.interface';
import { FriendRequestService } from '../../../shared/services/friend-request.service';
import { UserService } from '../../../shared/services/user.service';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { UserMongoComplete } from '../../../auth/interfaces/user.interface';
import { FriendRequestStatusPipe } from '../../../shared/pipes/friend-request-status.pipe';
import { SnackBarService } from '../../../shared/services/snackBar.service';

@Component({
  selector: 'app-friend-requests',
  standalone: true,
  imports: [MatIconModule, FriendRequestStatusPipe],
  templateUrl: './friend-requests.html',
  styleUrl: './friend-requests.scss',
})
export class FriendRequests implements OnInit {
  private readonly _friendRequestService: FriendRequestService = inject(FriendRequestService);
  private readonly _userService: UserService = inject(UserService);
  private readonly _snackBarService: SnackBarService = inject(SnackBarService);

  sentRequests: (FriendRequestInterface & { user?: UserMongoComplete })[] = [];
  receivedRequests: (FriendRequestInterface & { user?: UserMongoComplete })[] = [];

  loadingSent: boolean = false;
  loadingReceived: boolean = false;

  ngOnInit(): void {
    this.loadSentRequests();
    this.loadReceivedRequests();
  }

  loadSentRequests(): void {
    this.loadingSent = true;

    this._friendRequestService.getSendFriendRequests().subscribe({
      next: (res: FriendRequestResponse) => {
        const requests = res.data || [];

        if (requests.length === 0) {
          this.sentRequests = [];
          this.loadingSent = false;
          return;
        }

        const userRequests = requests.map((req) => this._userService.getUserById(req.receiverId));

        forkJoin(userRequests).subscribe({
          next: (users) => {
            this.sentRequests = requests.map((req, i) => ({
              ...req,
              user: users[i],
            }));
            this.loadingSent = false;
          },
          error: (err) => {
            console.error('❌ Error al obtener usuarios enviados:', err);
            this.loadingSent = false;
          },
        });
      },
      error: (err) => {
        console.error('❌ Error al obtener solicitudes enviadas:', err);
        this.loadingSent = false;
      },
    });
  }

  loadReceivedRequests(): void {
    this.loadingReceived = true;

    this._friendRequestService.getReceivedFriendRequests().subscribe({
      next: (res: FriendRequestResponse) => {
        const requests = res.data || [];

        if (requests.length === 0) {
          this.receivedRequests = [];
          this.loadingReceived = false;
          return;
        }

        const userRequests = requests.map((req) => this._userService.getUserById(req.senderId));

        forkJoin(userRequests).subscribe({
          next: (users) => {
            this.receivedRequests = requests.map((req, i) => ({
              ...req,
              user: users[i],
            }));
            this.loadingReceived = false;
          },
          error: (err) => {
            console.error('❌ Error al obtener usuarios recibidos:', err);
            this.loadingReceived = false;
          },
        });
      },
      error: (err) => {
        console.error('❌ Error al obtener solicitudes recibidas:', err);
        this.loadingReceived = false;
      },
    });
  }

  acceptRequest(senderId: string): void {
    this._friendRequestService.acceptFriendRequest(senderId).subscribe({
      next: () => {
        this.loadReceivedRequests();
        this._snackBarService.success('Solicitud aceptada');
      },
      error: (err) => {
        console.error('❌ Error al aceptar solicitud:', err);
      },
    });
  }

  rejectRequest(senderId: string): void {
    this._friendRequestService.rejectFriendRequest(senderId).subscribe({
      next: () => {
        this.loadReceivedRequests();
      },
      error: (err) => {
        console.error('❌ Error al rechazar solicitud:', err);
      },
    });
  }
}
