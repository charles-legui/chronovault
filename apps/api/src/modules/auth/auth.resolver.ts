import * as authService from './auth.service.js';
import { devMailService } from './mail.service.js';
import { AuthError } from '../../utils/errors.js';
import type { AppContext } from '../../types/context.js';
import type { AuthResult } from './auth.types.js';
import type { PublicUser } from '../users/user.types.js';

// ── Resolver argument types ───────────────────────────────────────────────────

interface SignUpArgs {
  input: { email: string; password: string; displayName: string };
}

interface SignInArgs {
  input: { email: string; password: string };
}

interface ForgotPasswordArgs {
  input: { email: string };
}

interface ResetPasswordArgs {
  input: { token: string; newPassword: string; confirmPassword: string };
}

interface ChangePasswordArgs {
  input: { currentPassword: string; newPassword: string; confirmPassword: string };
}

// ── Resolver map ─────────────────────────────────────────────────────────────

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
      args: SignUpArgs,
      _ctx: AppContext,
    ): Promise<AuthResult> => {
      return authService.signUp(args.input);
    },

    signIn: async (
      _parent: unknown,
      args: SignInArgs,
      _ctx: AppContext,
    ): Promise<AuthResult> => {
      return authService.signIn(args.input);
    },

    signOut: async (
      _parent: unknown,
      _args: unknown,
      ctx: AppContext,
    ): Promise<boolean> => {
      if (!ctx.currentUser) {
        throw new AuthError('Not authenticated');
      }
      await authService.signOut();
      return true;
    },

    forgotPassword: async (
      _parent: unknown,
      args: ForgotPasswordArgs,
      _ctx: AppContext,
    ): Promise<boolean> => {
      await authService.forgotPassword(args.input, devMailService);
      return true;
    },

    resetPassword: async (
      _parent: unknown,
      args: ResetPasswordArgs,
      _ctx: AppContext,
    ): Promise<boolean> => {
      await authService.resetPassword(args.input);
      return true;
    },

    changePassword: async (
      _parent: unknown,
      args: ChangePasswordArgs,
      ctx: AppContext,
    ): Promise<boolean> => {
      if (!ctx.currentUser) {
        throw new AuthError('Not authenticated');
      }
      await authService.changePassword(ctx.currentUser.id, args.input);
      return true;
    },
  },
};
