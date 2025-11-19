import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FriendsContent } from '../../components/friends-content/friends-content';

@Component({
  selector: 'app-my-friends',
  standalone: true,
  imports: [CommonModule, FriendsContent],
  templateUrl: './my-friends.html',
  styleUrl: './my-friends.scss',
})
export class MyFriends {}
