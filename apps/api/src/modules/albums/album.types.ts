import { ObjectId } from 'mongodb';

// Persisted shape in MongoDB
export interface AlbumDocument {
  _id: ObjectId;
  ownerId: ObjectId;
  title: string;
  description?: string;
  tags: string[];
  coverImageUrl?: string;
  eventDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Safe public representation returned to GraphQL clients
export interface PublicAlbum {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  tags: string[];
  coverImageUrl?: string;
  eventDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAlbumInput {
  ownerId: string;
  title: string;
  description?: string;
  tags?: string[];
  coverImageUrl?: string;
  eventDate?: Date;
}

export interface UpdateAlbumInput {
  title?: string;
  description?: string;
  tags?: string[];
  coverImageUrl?: string;
  eventDate?: Date;
}

// Returned by deleteAlbum — used by both service and resolver
export interface DeleteAlbumPayload {
  id: string;
  deleted: boolean;
}
