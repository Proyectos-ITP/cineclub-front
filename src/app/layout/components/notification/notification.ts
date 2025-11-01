import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { NotificationRequests } from '../notification-requests/notification-requests';
import { FriendRequests } from '../friend-requests/friend-requests';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [MatTabsModule, MatIconModule, NotificationRequests, FriendRequests],
  templateUrl: './notification.html',
  styleUrl: './notification.scss',
})
export class Notification {}
