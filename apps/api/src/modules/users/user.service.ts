import { findUserById, toPublicUser, updateUser } from './user.model.js';
import { validateUpdateProfileInput } from './user.validators.js';
import type { PublicUser } from './user.types.js';
import { NotFoundError } from '../../utils/errors.js';

export async function updateProfile(
  userId: string,
  rawInput: { displayName?: unknown; email?: unknown },
): Promise<PublicUser> {
  const input = validateUpdateProfileInput(rawInput);

  const updated = await updateUser(userId, input);
  if (!updated) {
    throw new NotFoundError('User');
  }

  return toPublicUser(updated);
}
