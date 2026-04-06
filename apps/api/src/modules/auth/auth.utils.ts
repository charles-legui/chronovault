import { createHash } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { authConfig } from '../../config/auth.js';
import { AuthError } from '../../utils/errors.js';
import type { JwtPayload } from './auth.types.js';
import type { UserDocument } from '../users/user.types.js';

// ── JWT ──────────────────────────────────────────────────────────────────────

export function signJwt(user: UserDocument): string {
  const payload: JwtPayload = {
    sub: user._id.toHexString(),
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, authConfig.jwtSecret, {
    expiresIn: authConfig.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function verifyJwt(token: string): JwtPayload {
  let decoded: unknown;

  try {
    decoded = jwt.verify(token, authConfig.jwtSecret);
  } catch {
    throw new AuthError('Invalid or expired token');
  }

  return assertJwtPayload(decoded);
}

// Runtime shape validation — jwt.verify returns unknown; we must not blindly cast
function assertJwtPayload(value: unknown): JwtPayload {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new AuthError('Invalid token payload');
  }

  const obj = value as Record<string, unknown>;

  if (typeof obj['sub'] !== 'string' || obj['sub'] === '') {
    throw new AuthError('Invalid token payload');
  }
  if (typeof obj['email'] !== 'string' || obj['email'] === '') {
    throw new AuthError('Invalid token payload');
  }
  if (obj['role'] !== 'user' && obj['role'] !== 'admin') {
    throw new AuthError('Invalid token payload');
  }

  return {
    sub: obj['sub'],
    email: obj['email'],
    role: obj['role'],
    iat: typeof obj['iat'] === 'number' ? obj['iat'] : undefined,
    exp: typeof obj['exp'] === 'number' ? obj['exp'] : undefined,
  };
}

export function extractBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

// ── Password reset tokens ────────────────────────────────────────────────────

// Reset tokens are stored hashed — the raw token is only sent by email, never persisted
export function hashResetToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}
