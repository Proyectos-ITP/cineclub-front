export interface UserInterface {
  id: string;
  fullName: string;
  country: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}
export interface UserCompleteInterface {
  id: string;
  fullName: string;
  country: string;
  phone: string;
  email: string;
  bibliography?: string;
  username?: string;
  roleTypeId?: string;
  roleType?: RoleTypeInterface;
  created_at: string;
}

export interface RoleTypeInterface {
  id: string;
  code: string;
  name: string;
}
