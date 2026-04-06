import { randomBytes } from 'node:crypto';
import * as argon2 from 'argon2';
import { authConfig } from '../config/auth.js';

// argon2id is the recommended variant — resistant to both side-channel and GPU attacks
const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  timeCost: authConfig.passwordHashRounds,
  memoryCost: 65536, // 64 MiB
  parallelism: 2,
};

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password);
}

export function generateSecureToken(byteLength = 32): string {
  return randomBytes(byteLength).toString('hex');
}

export function tokenExpiresAt(ttlMinutes: number): Date {
  return new Date(Date.now() + ttlMinutes * 60 * 1000);
}

export function isTokenExpired(expiresAt: Date): boolean {
  return expiresAt < new Date();
}
