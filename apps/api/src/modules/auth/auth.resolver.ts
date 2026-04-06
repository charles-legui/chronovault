import * as authService from './auth.service.js';
import type { AppContext } from '../../types/context.js';
import type { PublicUser } from '../users/user.types.js';

export const authResolvers = {
  Query: {
    me: async (
      _parent: unknown,
      _args: unknown,
      ctx: AppContext,
    ): Promise<PublicUser> => {
      if (!ctx.currentUser) {
        throw new Error('Not authenticated');
      }
      return authService.getCurrentUser(ctx.currentUser.id);
    },
  },

  Mutation: {
    // Mutations will be added here as auth service methods are implemented
  },
};
