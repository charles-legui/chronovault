import { Collection, Document } from 'mongodb';
import { getDb } from './client.js';

export const COLLECTIONS = {
  USERS: 'users',
  PASSWORD_RESET_TOKENS: 'password_reset_tokens',
  ALBUMS: 'albums',
  MEDIA_ITEMS: 'media_items',
  ACTIVITY_LOGS: 'activity_logs',
} as const;

type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

export function getCollection<T extends Document>(name: CollectionName): Collection<T> {
  return getDb().collection<T>(name);
}
