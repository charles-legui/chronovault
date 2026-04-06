import type { IncomingMessage } from 'node:http';
import type { AppContext } from '../types/context.js';
import { extractBearerToken, verifyJwt } from '../modules/auth/auth.utils.js';
import { findUserById } from '../modules/users/user.model.js';

export async function buildContext(args: {
  req: IncomingMessage;
}): Promise<AppContext> {
  const token = extractBearerToken(args.req.headers['authorization']);
  if (!token) {
    return { currentUser: null };
  }

  let userId: string;
  try {
    const payload = verifyJwt(token);
    userId = payload.sub;
  } catch {
    // Invalid or expired token — treat as unauthenticated
    return { currentUser: null };
  }

  const user = await findUserById(userId);
  if (!user) {
    // Token was valid but user no longer exists
    return { currentUser: null };
  }

  return {
    currentUser: {
      id: user._id.toHexString(),
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    },
  };
}
