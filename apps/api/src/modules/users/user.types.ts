import { ObjectId } from 'mongodb';

export type UserRole = 'user' | 'admin';

// Persisted shape in MongoDB
export interface UserDocument {
  _id: ObjectId;
  email: string;
  displayName: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Safe public representation returned to GraphQL clients — no password hash
export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Date;
}
