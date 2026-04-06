import * as authService from './auth.service.js';
import type { AppContext } from '../../types/context.js';
import type { PublicUser } from '../users/user.types.js';
import type { AuthResult } from './auth.types.js';
import { AuthError } from '../../utils/errors.js';

export const authResolvers = {
  Query: {
    me: async (
      _parent: unknown,
      _args: unknown,
      ctx: AppContext,
    ): Promise<PublicUser> => {
      if (!ctx.currentUser) {
        throw new AuthError('Not authenticated');
      }
      return authService.getCurrentUser(ctx.currentUser.id);
    },
  },

  Mutation: {
    signUp: async (
      _parent: unknown,
      args: { input: { email: string; password: string; displayName: string } },
      _ctx: AppContext,
    ): Promise<AuthResult> => {
      return authService.signUp(args.input);
    },

    signIn: async (
      _parent: unknown,
      args: { input: { email: string; password: string } },
      _ctx: AppContext,
    ): Promise<AuthResult> => {
      return authService.signIn(args.input);
    },

    signOut: async (
      _parent: unknown,
      _args: unknown,
      _ctx: AppContext,
    ): Promise<boolean> => {
      await authService.signOut();
      return true;
    },

    forgotPassword: async (
      _parent: unknown,
      args: { input: { email: string } },
      _ctx: AppContext,
    ): Promise<boolean> => {
      await authService.forgotPassword(args.input);
      return true;
    },

    resetPassword: async (
      _parent: unknown,
      args: { input: { token: string; newPassword: string; confirmPassword: string } },
      _ctx: AppContext,
    ): Promise<boolean> => {
      await authService.resetPassword(args.input);
      return true;
    },
  },
};
