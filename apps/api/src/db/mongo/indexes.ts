import { Db } from 'mongodb';
import { COLLECTIONS } from './collections.js';

export async function ensureIndexes(db: Db): Promise<void> {
  await Promise.all([
    db.collection(COLLECTIONS.USERS).createIndexes([
      { key: { email: 1 }, unique: true, name: 'email_unique' },
      { key: { createdAt: -1 }, name: 'createdAt_desc' },
    ]),

    db.collection(COLLECTIONS.PASSWORD_RESET_TOKENS).createIndexes([
      { key: { userId: 1 }, name: 'userId' },
      // tokenHash must be indexed — resetPassword queries by it on every call
      { key: { tokenHash: 1 }, unique: true, name: 'tokenHash_unique' },
      // TTL index: MongoDB auto-deletes documents once expiresAt is reached
      { key: { expiresAt: 1 }, expireAfterSeconds: 0, name: 'ttl_expiresAt' },
    ]),

    db.collection(COLLECTIONS.ALBUMS).createIndexes([
      // Primary list query: albums by owner sorted by creation date
      { key: { ownerId: 1, createdAt: -1 }, name: 'ownerId_createdAt_desc' },
      // Supports owner-scoped sort by recently updated
      { key: { ownerId: 1, updatedAt: -1 }, name: 'ownerId_updatedAt_desc' },
      // Supports owner-scoped chronological browsing by event date
      // sparse: true because eventDate is optional — omits documents without the field
      { key: { ownerId: 1, eventDate: -1 }, name: 'ownerId_eventDate_desc', sparse: true },
      // Multikey index for tag-based filtering across the albums collection
      { key: { tags: 1 }, name: 'tags' },
    ]),

    db.collection(COLLECTIONS.MEDIA_ITEMS).createIndexes([
      { key: { albumId: 1 }, name: 'albumId' },
      { key: { ownerId: 1 }, name: 'ownerId' },
      { key: { createdAt: -1 }, name: 'createdAt_desc' },
    ]),
  ]);

  console.log('[mongo] indexes ensured');
}
