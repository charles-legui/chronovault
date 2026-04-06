import { env } from './env.js';

export const dbConfig = {
  mongo: {
    uri: env.mongoUri,
    dbName: env.mongoDbName,
  },
  postgres: {
    url: env.postgresUrl,
  },
} as const;
