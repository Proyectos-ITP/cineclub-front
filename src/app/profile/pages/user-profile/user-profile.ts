import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardInfoUser } from '../../components/card-info-user/card-info-user';
import { CardTabs } from '../../components/card-tabs/card-tabs';
import { CardStatics } from '../../components/card-statics/card-statics';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, CardInfoUser, CardTabs, CardStatics],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile {}
