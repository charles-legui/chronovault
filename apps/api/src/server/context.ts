import type { IncomingMessage } from 'node:http';
import type { AppContext, AuthenticatedUser } from '../types/context.js';
import { extractBearerToken, verifyJwt } from '../modules/auth/auth.utils.js';
import { findUserById } from '../modules/users/user.model.js';

async function resolveCurrentUser(req: IncomingMessage): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers['authorization'];
  const token = extractBearerToken(authHeader);

  if (!token) return null;

  let payload;
  try {
    payload = verifyJwt(token);
  } catch {
    // Invalid or expired token — treat as unauthenticated, not as an error
    return null;
  }

  const user = await findUserById(payload.sub);
  if (!user) return null;

  return {
    id: user._id.toHexString(),
    email: user.email,
    displayName: user.displayName,
    role: user.role,
  };
}

export async function buildContext(args: {
  req: IncomingMessage;
}): Promise<AppContext> {
  return {
    currentUser: await resolveCurrentUser(args.req),
  };
}
