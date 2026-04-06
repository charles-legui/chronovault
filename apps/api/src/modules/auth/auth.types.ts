import type { PublicUser } from '../users/user.types.js';

// Returned after successful signUp or signIn
export interface AuthResult {
  token: string;
  user: PublicUser;
}
