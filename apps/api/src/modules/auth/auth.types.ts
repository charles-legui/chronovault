import { ObjectId } from 'mongodb';
import type { UserRole, PublicUser } from '../users/user.types.js';

// Shape stored in MongoDB for password reset tokens
export interface PasswordResetTokenDocument {
  _id: ObjectId;
  userId: ObjectId;
  tokenHash: string; // stored as SHA-256 hash of the raw token
  expiresAt: Date;   // used by MongoDB TTL index for auto-expiry
  createdAt: Date;
}

// JWT payload — keep it minimal, no sensitive fields
export interface JwtPayload {
  sub: string;        // user id
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Returned after successful sign in or sign up
export interface AuthResult {
  token: string;
  user: PublicUser;
}
