import { Routes } from '@angular/router';
import { profileCompleteGuard } from '../shared/guards/profileComplete.guard';
import { profileIncompleteGuard } from '../shared/guards/profileIncomplete.guard';

export const profileRoutes: Routes = [
  {
    path: 'user-profile',
    loadComponent: () => import('./pages/user-profile/user-profile').then((m) => m.UserProfile),
    canActivate: [profileCompleteGuard],
  },
  {
    path: 'register-profile',
    loadComponent: () =>
      import('./pages/register-profile/register-profile').then((m) => m.RegisterProfile),
    canActivate: [profileIncompleteGuard],
  },
  {
    path: 'my-friends',
    loadComponent: () => import('./pages/my-friends/my-friends').then((m) => m.MyFriends),
    canActivate: [profileCompleteGuard],
  },
];
