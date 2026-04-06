import { ObjectId } from 'mongodb';
import { getCollection, COLLECTIONS } from '../../db/mongo/collections.js';
import type {
  AlbumDocument,
  PublicAlbum,
  CreateAlbumInput,
  UpdateAlbumInput,
} from './album.types.js';

function albumsCollection() {
  return getCollection<AlbumDocument>(COLLECTIONS.ALBUMS);
}

export function toPublicAlbum(doc: AlbumDocument): PublicAlbum {
  return {
    id: doc._id.toHexString(),
    ownerId: doc.ownerId.toHexString(),
    title: doc.title,
    description: doc.description,
    tags: doc.tags,
    coverImageUrl: doc.coverImageUrl,
    eventDate: doc.eventDate,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function findAlbumById(id: string): Promise<AlbumDocument | null> {
  if (!ObjectId.isValid(id)) return null;
  return albumsCollection().findOne({ _id: new ObjectId(id) });
}

export async function findAlbumsByOwner(ownerId: string): Promise<AlbumDocument[]> {
  if (!ObjectId.isValid(ownerId)) return [];
  return albumsCollection()
    .find({ ownerId: new ObjectId(ownerId) })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function insertAlbum(input: CreateAlbumInput): Promise<AlbumDocument> {
  const now = new Date();
  const doc: AlbumDocument = {
    _id: new ObjectId(),
    ownerId: new ObjectId(input.ownerId),
    title: input.title,
    description: input.description,
    tags: input.tags ?? [],
    coverImageUrl: input.coverImageUrl,
    eventDate: input.eventDate,
    createdAt: now,
    updatedAt: now,
  };

  await albumsCollection().insertOne(doc);
  return doc;
}

export async function updateAlbum(
  id: string,
  input: UpdateAlbumInput,
): Promise<AlbumDocument | null> {
  if (!ObjectId.isValid(id)) return null;

  const fields: Partial<
    Pick<AlbumDocument, 'title' | 'description' | 'tags' | 'coverImageUrl' | 'eventDate' | 'updatedAt'>
  > = {
    updatedAt: new Date(),
  };

  if (input.title !== undefined) fields.title = input.title;
  if (input.description !== undefined) fields.description = input.description;
  if (input.tags !== undefined) fields.tags = input.tags;
  if (input.coverImageUrl !== undefined) fields.coverImageUrl = input.coverImageUrl;
  if (input.eventDate !== undefined) fields.eventDate = input.eventDate;

  const result = await albumsCollection().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: fields },
    { returnDocument: 'after' },
  );

  return result ?? null;
}

export async function deleteAlbum(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const result = await albumsCollection().deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
