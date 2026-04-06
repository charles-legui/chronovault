import * as userService from './user.service.js';
import { AuthError } from '../../utils/errors.js';
import type { AppContext } from '../../types/context.js';
import type { PublicUser } from './user.types.js';

interface UpdateProfileArgs {
  input: { displayName?: string; email?: string };
}

export const userResolvers = {
  Mutation: {
    updateProfile: async (
      _parent: unknown,
      args: UpdateProfileArgs,
      ctx: AppContext,
    ): Promise<PublicUser> => {
      if (!ctx.currentUser) {
        throw new AuthError('Not authenticated');
      }
      return userService.updateProfile(ctx.currentUser.id, args.input);
    },
  },
};
