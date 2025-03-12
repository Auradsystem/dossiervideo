export interface User {
  id: string;
  username: string;
  password: string;
  isAdmin: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface UserCredentials {
  username: string;
  password: string;
}
