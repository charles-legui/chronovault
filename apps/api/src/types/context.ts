export type UserRole = 'user' | 'admin';

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
}

// AppContext is passed to every resolver.
// currentUser is null until JWT auth middleware is wired in.
export interface AppContext {
  currentUser: AuthenticatedUser | null;
}
