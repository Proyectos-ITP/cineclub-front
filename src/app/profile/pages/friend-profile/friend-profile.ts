import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FriendInfoCard } from '../../components/friend-info-card/friend-info-card';
import { FriendLibraryTabs } from '../../components/friend-library-tabs/friend-library-tabs';

@Component({
  selector: 'app-friend-profile',
  standalone: true,
  imports: [CommonModule, FriendInfoCard, FriendLibraryTabs],
  templateUrl: './friend-profile.html',
  styleUrls: ['./friend-profile.scss'],
})
export class FriendProfile implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  friendId = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('friendId');
    if (!id) {
      this.router.navigate(['/profile/my-friends']);
      return;
    }
    this.friendId.set(id);
  }
}
