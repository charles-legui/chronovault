import type { PublicUser } from '../users/user.types.js';
import type { UserRole } from '../../types/context.js';

// Returned after successful signUp or signIn
export interface AuthResult {
  token: string;
  user: PublicUser;
}

// Shape of the decoded JWT payload
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
