import { NotFoundError, AuthError } from '../../utils/errors.js';
import {
  validateCreateAlbumInput,
  validateUpdateAlbumInput,
} from './album.validators.js';
import {
  findAlbumById,
  findAlbumsByOwner,
  insertAlbum,
  updateAlbum as updateAlbumInDb,
  deleteAlbum as deleteAlbumFromDb,
  toPublicAlbum,
} from './album.model.js';
import type { PublicAlbum, DeleteAlbumPayload } from './album.types.js';

export async function createAlbum(
  ownerId: string,
  rawInput: {
    title: unknown;
    description?: unknown;
    tags?: unknown;
    coverImageUrl?: unknown;
    eventDate?: unknown;
  },
): Promise<PublicAlbum> {
  const input = validateCreateAlbumInput({ ...rawInput, ownerId });
  const doc = await insertAlbum(input);
  return toPublicAlbum(doc);
}

export async function getAlbum(
  id: string,
  ownerId: string,
): Promise<PublicAlbum | null> {
  const doc = await findAlbumById(id);
  if (!doc) return null;
  if (doc.ownerId.toHexString() !== ownerId) return null;
  return toPublicAlbum(doc);
}

export async function listMyAlbums(ownerId: string): Promise<PublicAlbum[]> {
  const docs = await findAlbumsByOwner(ownerId);
  return docs.map(toPublicAlbum);
}

export async function updateAlbum(
  id: string,
  ownerId: string,
  rawInput: {
    title?: unknown;
    description?: unknown;
    tags?: unknown;
    coverImageUrl?: unknown;
    eventDate?: unknown;
  },
): Promise<PublicAlbum> {
  const existing = await findAlbumById(id);
  if (!existing) throw new NotFoundError('Album');
  if (existing.ownerId.toHexString() !== ownerId) throw new AuthError('Forbidden');

  const input = validateUpdateAlbumInput(rawInput);
  const updated = await updateAlbumInDb(id, input);
  if (!updated) throw new NotFoundError('Album');

  return toPublicAlbum(updated);
}

export async function deleteAlbum(
  id: string,
  ownerId: string,
): Promise<DeleteAlbumPayload> {
  const existing = await findAlbumById(id);
  if (!existing) throw new NotFoundError('Album');
  if (existing.ownerId.toHexString() !== ownerId) throw new AuthError('Forbidden');

  const deleted = await deleteAlbumFromDb(id);
  return { id, deleted };
}
