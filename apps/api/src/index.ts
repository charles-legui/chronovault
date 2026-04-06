import 'dotenv/config';
import { createServer } from './server/createServer.js';

async function main(): Promise<void> {
  await createServer();
}

main().catch((error) => {
  console.error('[startup] fatal error:', error);
  process.exit(1);
});

function shutdown(): void {
  console.log('[api] shutting down...');
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
