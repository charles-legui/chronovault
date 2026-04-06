function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const env = {
  nodeEnv: optionalEnv('NODE_ENV', 'development'),
  port: parseInt(optionalEnv('PORT', '4000'), 10),

  mongoUri: requireEnv('MONGO_URI'),
  mongoDbName: requireEnv('MONGO_DB_NAME'),

  postgresUrl: process.env['POSTGRES_URL'] ?? null, // optional — only required when relational data is needed

  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: optionalEnv('JWT_EXPIRES_IN', '7d'),

  passwordResetTokenTtlMinutes: parseInt(
    optionalEnv('PASSWORD_RESET_TOKEN_TTL_MINUTES', '30'),
    10,
  ),

  appBaseUrl: optionalEnv('APP_BASE_URL', 'http://localhost:3000'),
  mailFrom: optionalEnv('MAIL_FROM', 'noreply@chronovault.local'),

} as const;

export const isDev = env.nodeEnv === 'development';
