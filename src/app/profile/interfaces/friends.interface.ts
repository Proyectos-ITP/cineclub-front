export interface FriendUserInterface {
  id: string;
  fullName: string;
  email: string;
}

export interface FriendInterface {
  id: string;
  odisIds?: string;
  friend: FriendUserInterface;
  createdAt: string;
}

export interface FriendsResponseInterface {
  data: FriendInterface[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
