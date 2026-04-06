export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
}

export interface AppContext {
  currentUser: AuthenticatedUser | null;
}
