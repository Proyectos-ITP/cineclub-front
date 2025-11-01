import { SideBarItem } from '../interfaces/layout.interface';
import { USER_ROLES } from '../../shared/constants/roles.constants';

export const SIDEBAR_ITEMS: SideBarItem[] = [
  {
    icon: 'home',
    title: 'Inicio',
    route: '/',
    roles: [USER_ROLES.ADMIN, USER_ROLES.USER],
  },
  {
    icon: 'person',
    title: 'Perfil de usuario',
    route: '/profile',
    roles: [USER_ROLES.ADMIN, USER_ROLES.USER],
    children: [
      {
        icon: 'visibility',
        title: 'Ver perfil',
        route: '/profile/user-profile',
      },
      {
        icon: 'lock',
        title: 'Cambiar contraseña',
        route: '/profile/change-password',
      },
    ],
  },
  {
    icon: 'movie',
    title: 'Películas',
    route: '/movies',
    roles: [USER_ROLES.ADMIN, USER_ROLES.USER],
    children: [
      {
        icon: 'fiber_new',
        title: 'Más recientes',
        route: '/movies/recent',
      },
      {
        icon: 'star_rate',
        title: 'Mejores reseñas',
        route: '/movies/top-rated',
      },
      {
        icon: 'book_ribbon',
        title: 'Biblioteca',
        route: '/movies/library',
      },
    ],
  },
  {
    icon: 'menu_book',
    title: 'Libros',
    route: '/books',
    roles: [USER_ROLES.ADMIN, USER_ROLES.USER],
    children: [
      {
        icon: 'fiber_new',
        title: 'Más recientes',
        route: '/books/recent',
      },
      {
        icon: 'star_rate',
        title: 'Mejores reseñas',
        route: '/books/top-rated',
      },
    ],
  },
  {
    icon: 'settings',
    title: 'Configuración',
    route: '/admin/config',
    roles: [USER_ROLES.ADMIN],
    children: [
      {
        icon: 'people',
        title: 'Ver usuarios',
        route: '/organizational/see-users',
      },
    ],
  },
];
