import { ObjectId } from 'mongodb';

// Roles stay simple — extend only when complexity is explicitly requested
export type UserRole = 'user' | 'admin';

// Shape stored in MongoDB
export interface UserDocument {
  _id: ObjectId;
  email: string;
  displayName: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Safe public representation — no password hash, no internal fields
export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Date;
}

// Input for creating a new user (pre-hashing)
export interface CreateUserInput {
  email: string;
  displayName: string;
  passwordHash: string;
  role?: UserRole;
}

// Input for updating a user profile
export interface UpdateUserInput {
  displayName?: string;
  email?: string;
}
