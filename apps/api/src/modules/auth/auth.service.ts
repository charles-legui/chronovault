import { randomBytes } from 'node:crypto';
import { ObjectId } from 'mongodb';
import argon2 from 'argon2';
import { AuthError, ValidationError } from '../../utils/errors.js';
import { validateSignUpInput, validateSignInInput, validateResetPasswordInput } from './auth.validators.js';
import { signJwt, hashResetToken } from './auth.utils.js';
import { findUserById, findUserByEmail, insertUser, toPublicUser, updateUserPasswordHash } from '../users/user.model.js';
import { getCollection, COLLECTIONS } from '../../db/mongo/collections.js';
import { devMailService } from './mail.service.js';
import { env } from '../../config/env.js';
import type { AuthResult } from './auth.types.js';
import type { PublicUser } from '../users/user.types.js';

// ── Types ────────────────────────────────────────────────────────────────────

interface PasswordResetTokenDocument {
  _id: ObjectId;
  userId: ObjectId;
  tokenHash: string;
  expiresAt: Date;
}

function resetTokensCollection() {
  return getCollection<PasswordResetTokenDocument>(COLLECTIONS.PASSWORD_RESET_TOKENS);
}

// ── Auth operations ──────────────────────────────────────────────────────────

export async function getCurrentUser(userId: string): Promise<PublicUser> {
  const user = await findUserById(userId);
  if (!user) throw new AuthError('User not found');
  return toPublicUser(user);
}

export async function signUp(rawInput: unknown): Promise<AuthResult> {
  const input = validateSignUpInput(rawInput as Record<string, unknown>);

  const existing = await findUserByEmail(input.email);
  if (existing) throw new ValidationError('An account with this email already exists');

  const passwordHash = await argon2.hash(input.password);
  const user = await insertUser({ email: input.email, displayName: input.displayName, passwordHash });

  return { token: signJwt(user), user: toPublicUser(user) };
}

export async function signIn(rawInput: unknown): Promise<AuthResult> {
  const input = validateSignInInput(rawInput as Record<string, unknown>);

  const user = await findUserByEmail(input.email);
  if (!user) {
    // Constant-time response — do not reveal whether the email exists
    await argon2.hash(input.password);
    throw new AuthError('Invalid email or password');
  }

  const valid = await argon2.verify(user.passwordHash, input.password);
  if (!valid) throw new AuthError('Invalid email or password');

  return { token: signJwt(user), user: toPublicUser(user) };
}

export async function signOut(): Promise<void> {
  // JWT is stateless — token is discarded client-side
}

// ── Password reset ────────────────────────────────────────────────────────────

export async function forgotPassword(rawInput: unknown): Promise<void> {
  const input = rawInput as { email?: unknown };
  if (typeof input.email !== 'string' || !input.email.trim()) return;

  const email = input.email.trim().toLowerCase();
  const user = await findUserByEmail(email);

  // Always return silently — never reveal whether an account exists
  if (!user) return;

  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(Date.now() + env.passwordResetTokenTtlMinutes * 60 * 1000);

  // Remove any existing token for this user before inserting a new one
  await resetTokensCollection().deleteMany({ userId: user._id });

  await resetTokensCollection().insertOne({
    _id: new ObjectId(),
    userId: user._id,
    tokenHash,
    expiresAt,
  });

  const resetLink = `${env.appBaseUrl}/reset-password?token=${rawToken}`;
  await devMailService.sendPasswordResetEmail({ to: user.email, resetLink });
}

export async function resetPassword(rawInput: unknown): Promise<void> {
  const input = validateResetPasswordInput(rawInput as Record<string, unknown>);

  const tokenHash = hashResetToken(input.token);
  const tokenDoc = await resetTokensCollection().findOne({ tokenHash });

  if (!tokenDoc) throw new ValidationError('Invalid or expired reset token');
  if (tokenDoc.expiresAt < new Date()) {
    await resetTokensCollection().deleteOne({ _id: tokenDoc._id });
    throw new ValidationError('Reset token has expired');
  }

  const passwordHash = await argon2.hash(input.newPassword);
  await updateUserPasswordHash(tokenDoc.userId.toHexString(), passwordHash);
  await resetTokensCollection().deleteOne({ _id: tokenDoc._id });
}

export async function changePassword(
  _userId: string,
  _rawInput: unknown,
): Promise<never> {
  throw new Error('Not implemented');
}
