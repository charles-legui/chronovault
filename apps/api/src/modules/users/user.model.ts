import { ObjectId } from 'mongodb';
import { getCollection, COLLECTIONS } from '../../db/mongo/collections.js';
import type { UserDocument, PublicUser, CreateUserInput, UpdateUserInput } from './user.types.js';

function usersCollection() {
  return getCollection<UserDocument>(COLLECTIONS.USERS);
}

export function toPublicUser(doc: UserDocument): PublicUser {
  return {
    id: doc._id.toHexString(),
    email: doc.email,
    displayName: doc.displayName,
    role: doc.role,
    createdAt: doc.createdAt,
  };
}

export async function findUserById(id: string): Promise<UserDocument | null> {
  if (!ObjectId.isValid(id)) return null;
  return usersCollection().findOne({ _id: new ObjectId(id) });
}

export async function findUserByEmail(email: string): Promise<UserDocument | null> {
  return usersCollection().findOne({ email: email.toLowerCase() });
}

export async function insertUser(input: CreateUserInput): Promise<UserDocument> {
  const now = new Date();
  const doc: UserDocument = {
    _id: new ObjectId(),
    email: input.email.toLowerCase(),
    displayName: input.displayName,
    passwordHash: input.passwordHash,
    role: input.role ?? 'user',
    createdAt: now,
    updatedAt: now,
  };

  await usersCollection().insertOne(doc);
  return doc;
}

export async function updateUser(
  id: string,
  input: UpdateUserInput,
): Promise<UserDocument | null> {
  if (!ObjectId.isValid(id)) return null;

  const fields: Partial<Pick<UserDocument, 'displayName' | 'email' | 'updatedAt'>> = {
    updatedAt: new Date(),
  };

  if (input.displayName !== undefined) fields.displayName = input.displayName;
  if (input.email !== undefined) fields.email = input.email.toLowerCase();

  const result = await usersCollection().findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: fields },
    { returnDocument: 'after' },
  );

  return result ?? null;
}

export async function updateUserPasswordHash(
  id: string,
  passwordHash: string,
): Promise<void> {
  if (!ObjectId.isValid(id)) return;

  await usersCollection().updateOne(
    { _id: new ObjectId(id) },
    { $set: { passwordHash, updatedAt: new Date() } },
  );
}
