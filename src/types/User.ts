export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // Optionnel car géré par Supabase
  isAdmin: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface UserCredentials {
  email: string;
  password: string;
}
