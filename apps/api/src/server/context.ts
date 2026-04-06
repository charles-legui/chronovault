import type { IncomingMessage } from 'node:http';
import type { AppContext } from '../types/context.js';

// Minimal context builder — returns no authenticated user for now.
// JWT resolution will be added here when the auth module is wired in.
export async function buildContext(args: {
  req: IncomingMessage;
}): Promise<AppContext> {
  return {
    currentUser: null,
  };
}
