import { env } from './env.js';

export const authConfig = {
  jwtSecret: env.jwtSecret,
  jwtExpiresIn: env.jwtExpiresIn,
  passwordResetTokenTtlMinutes: env.passwordResetTokenTtlMinutes,
  // argon2 timeCost — number of iterations (3 is argon2's default; increase for stronger hashing)
  passwordHashRounds: 3,
} as const;
