export interface SideBarItem {
  icon: string;
  title: string;
  route?: string;
  children?: SideBarItem[];
  requiresAuth?: boolean;
  roles?: string[]; // Array de roles permitidos (ej: ['ADMIN', 'USER']). Si está vacío o undefined, es visible para todos
}
