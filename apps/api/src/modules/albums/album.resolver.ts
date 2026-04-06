import * as albumService from './album.service.js';
import type { AppContext } from '../../types/context.js';
import type { PublicAlbum, DeleteAlbumPayload } from './album.types.js';
import { AuthError } from '../../utils/errors.js';

export const albumResolvers = {
  Query: {
    myAlbums: async (
      _parent: unknown,
      _args: unknown,
      ctx: AppContext,
    ): Promise<PublicAlbum[]> => {
      if (!ctx.currentUser) {
        throw new AuthError();
      }
      return albumService.listMyAlbums(ctx.currentUser.id);
    },

    album: async (
      _parent: unknown,
      args: { id: string },
      ctx: AppContext,
    ): Promise<PublicAlbum | null> => {
      if (!ctx.currentUser) {
        throw new AuthError();
      }
      return albumService.getAlbum(args.id, ctx.currentUser.id);
    },
  },

  Mutation: {
    createAlbum: async (
      _parent: unknown,
      args: {
        input: {
          title: string;
          description?: string;
          tags?: string[];
          coverImageUrl?: string;
          eventDate?: Date;
        };
      },
      ctx: AppContext,
    ): Promise<PublicAlbum> => {
      if (!ctx.currentUser) {
        throw new AuthError();
      }
      return albumService.createAlbum(ctx.currentUser.id, args.input);
    },

    updateAlbum: async (
      _parent: unknown,
      args: {
        id: string;
        input: {
          title?: string;
          description?: string;
          tags?: string[];
          coverImageUrl?: string;
          eventDate?: Date;
        };
      },
      ctx: AppContext,
    ): Promise<PublicAlbum> => {
      if (!ctx.currentUser) {
        throw new AuthError();
      }
      return albumService.updateAlbum(args.id, ctx.currentUser.id, args.input);
    },

    deleteAlbum: async (
      _parent: unknown,
      args: { id: string },
      ctx: AppContext,
    ): Promise<DeleteAlbumPayload> => {
      if (!ctx.currentUser) {
        throw new AuthError();
      }
      return albumService.deleteAlbum(args.id, ctx.currentUser.id);
    },
  },
};
