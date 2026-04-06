import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from '../schema/typeDefs.js';
import { resolvers } from '../schema/resolvers.js';
import { buildContext } from './context.js';
import type { AppContext } from '../types/context.js';
import { env, isDev } from '../config/env.js';
import { AppError, toGraphQLError } from '../utils/errors.js';

export async function createServer(): Promise<void> {
  const server = new ApolloServer<AppContext>({
    typeDefs,
    resolvers,
    introspection: isDev,
    formatError: (formattedError, error) => {
      // Map domain errors to proper GraphQL errors with correct extension codes.
      // Without this, Apollo treats them as INTERNAL_SERVER_ERROR in production.
      if (error instanceof AppError) {
        const mapped = toGraphQLError(error);
        return {
          message: mapped.message,
          locations: formattedError.locations,
          path: formattedError.path,
          extensions: mapped.extensions ?? {},
        };
      }
      return formattedError;
    },
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: env.port },
    context: buildContext,
  });

  console.log(`[api] GraphQL server ready at ${url}`);
}
