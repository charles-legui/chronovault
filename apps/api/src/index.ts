import 'dotenv/config';
import { connectMongo } from './db/mongo/client.js';
import { ensureIndexes } from './db/mongo/indexes.js';
import { createServer } from './server/createServer.js';
import { disconnectMongo } from './db/mongo/client.js';

async function main(): Promise<void> {
  const db = await connectMongo();
  await ensureIndexes(db);
  await createServer();
}

main().catch((error) => {
  console.error('[startup] fatal error:', error);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('[api] shutting down...');
  await disconnectMongo();
  process.exit(0);
});
