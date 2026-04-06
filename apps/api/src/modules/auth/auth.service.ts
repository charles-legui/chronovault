import { ObjectId, MongoServerError } from 'mongodb';
import { getCollection, COLLECTIONS } from '../../db/mongo/collections.js';
import {
  findUserByEmail,
  findUserById,
  insertUser,
  toPublicUser,
  updateUserPasswordHash,
} from '../users/user.model.js';
import type { PublicUser } from '../users/user.types.js';
import {
  validateSignUpInput,
  validateSignInInput,
  validateForgotPasswordInput,
  validateResetPasswordInput,
  validateChangePasswordInput,
} from './auth.validators.js';
import { signJwt, hashResetToken } from './auth.utils.js';
import type { AuthResult, PasswordResetTokenDocument } from './auth.types.js';
import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  tokenExpiresAt,
  isTokenExpired,
} from '../../utils/crypto.js';
import { authConfig } from '../../config/auth.js';
import { env } from '../../config/env.js';
import { AppError, AuthError, NotFoundError } from '../../utils/errors.js';
import type { MailService } from './mail.types.js';

function resetTokensCollection() {
  return getCollection<PasswordResetTokenDocument>(COLLECTIONS.PASSWORD_RESET_TOKENS);
}

// ── Sign up ───────────────────────────────────────────────────────────────────

export async function signUp(rawInput: {
  email?: unknown;
  password?: unknown;
  displayName?: unknown;
}): Promise<AuthResult> {
  const input = validateSignUpInput(rawInput);

  const passwordHash = await hashPassword(input.password);

  let user;
  try {
    user = await insertUser({ email: input.email, displayName: input.displayName, passwordHash });
  } catch (error) {
    // MongoDB unique index violation on email — convert to a safe domain error
    if (error instanceof MongoServerError && error.code === 11000) {
      throw new AppError('An account with this email already exists');
    }
    throw error;
  }

  const token = signJwt(user);

  return {
    token,
    user: toPublicUser(user),
  };
}

// ── Sign in ───────────────────────────────────────────────────────────────────

export async function signIn(rawInput: {
  email?: unknown;
  password?: unknown;
}): Promise<AuthResult> {
  const input = validateSignInInput(rawInput);

  const user = await findUserByEmail(input.email);
  if (!user) {
    // Uniform message — do not reveal whether the email exists
    throw new AuthError('Invalid email or password');
  }

  const passwordMatches = await verifyPassword(user.passwordHash, input.password);
  if (!passwordMatches) {
    throw new AuthError('Invalid email or password');
  }

  const token = signJwt(user);

  return {
    token,
    user: toPublicUser(user),
  };
}

// ── Sign out ──────────────────────────────────────────────────────────────────

// JWT is stateless — signOut is a client-side operation (discard the token).
// This method is a no-op server-side. A token revocation list can be added later if needed.
export async function signOut(): Promise<void> {
  return;
}

// ── Get current user ──────────────────────────────────────────────────────────

export async function getCurrentUser(userId: string): Promise<PublicUser> {
  const user = await findUserById(userId);
  if (!user) {
    throw new AuthError('Session is no longer valid');
  }
  return toPublicUser(user);
}

// ── Forgot password ───────────────────────────────────────────────────────────

export async function forgotPassword(
  rawInput: { email?: unknown },
  mailService: MailService,
): Promise<void> {
  const input = validateForgotPasswordInput(rawInput);

  const user = await findUserByEmail(input.email);

  // Always return without error — do not leak whether this email is registered
  if (!user) return;

  const rawToken = generateSecureToken(32);
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = tokenExpiresAt(authConfig.passwordResetTokenTtlMinutes);

  // Remove any previous reset token for this user before inserting a new one.
  // Not transactional (would require a replica set) — acceptable for MVP.
  // If insertOne fails, the user can simply request another reset.
  await resetTokensCollection().deleteMany({ userId: user._id });

  const tokenDoc: PasswordResetTokenDocument = {
    _id: new ObjectId(),
    userId: user._id,
    tokenHash,
    expiresAt,
    createdAt: new Date(),
  };
  await resetTokensCollection().insertOne(tokenDoc);

  const resetLink = `${env.appBaseUrl}/reset-password?token=${rawToken}`;
  await mailService.sendPasswordResetEmail({ to: user.email, resetLink });
}

// ── Reset password ────────────────────────────────────────────────────────────

export async function resetPassword(rawInput: {
  token?: unknown;
  newPassword?: unknown;
  confirmPassword?: unknown;
}): Promise<void> {
  const input = validateResetPasswordInput(rawInput);

  const tokenHash = hashResetToken(input.token);
  const tokenDoc = await resetTokensCollection().findOne({ tokenHash });

  if (!tokenDoc) {
    throw new AppError('Reset token is invalid or has expired');
  }

  // Explicit expiry check — belt-and-suspenders alongside the TTL index
  if (isTokenExpired(tokenDoc.expiresAt)) {
    throw new AppError('Reset token is invalid or has expired');
  }

  const user = await findUserById(tokenDoc.userId.toHexString());
  if (!user) {
    throw new NotFoundError('User');
  }

  const passwordHash = await hashPassword(input.newPassword);
  await updateUserPasswordHash(user._id.toHexString(), passwordHash);

  // Consume the token — one use only
  await resetTokensCollection().deleteOne({ _id: tokenDoc._id });
}

// ── Change password ───────────────────────────────────────────────────────────

export async function changePassword(
  userId: string,
  rawInput: {
    currentPassword?: unknown;
    newPassword?: unknown;
    confirmPassword?: unknown;
  },
): Promise<void> {
  const input = validateChangePasswordInput(rawInput);

  const user = await findUserById(userId);
  if (!user) {
    throw new AuthError('Session is no longer valid');
  }

  const passwordMatches = await verifyPassword(user.passwordHash, input.currentPassword);
  if (!passwordMatches) {
    throw new AuthError('Current password is incorrect');
  }

  const passwordHash = await hashPassword(input.newPassword);
  await updateUserPasswordHash(userId, passwordHash);
}
