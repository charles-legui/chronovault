import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from '../schema/typeDefs.js';
import { resolvers } from '../schema/resolvers.js';
import { buildContext } from './context.js';
import type { AppContext } from '../types/context.js';
import { env, isDev } from '../config/env.js';

export async function createServer(): Promise<void> {
  const server = new ApolloServer<AppContext>({
    typeDefs,
    resolvers,
    introspection: isDev,
  });

  const { url } = await startStandaloneServer(server, {
    // host: '0.0.0.0' is required inside Docker — default 127.0.0.1 is unreachable from outside the container
    listen: { port: env.port, host: '0.0.0.0' },
    context: buildContext,
  });

  console.log(`[api] GraphQL server ready at ${url}`);
}
