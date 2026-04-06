import { GraphQLScalarType, Kind } from 'graphql';
import type { AppContext } from '../types/context.js';
import { authResolvers } from '../modules/auth/auth.resolver.js';
import { albumResolvers } from '../modules/albums/album.resolver.js';

// DateTime scalar — serializes Date objects to ISO 8601 strings
const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'ISO 8601 date-time string',
  serialize(value) {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string' || typeof value === 'number') {
      return new Date(value).toISOString();
    }
    throw new Error('DateTime scalar: value must be a Date, string, or number');
  },
  parseValue(value) {
    if (typeof value !== 'string') throw new Error('DateTime scalar: input must be a string');
    const date = new Date(value);
    if (isNaN(date.getTime())) throw new Error('DateTime scalar: invalid date string');
    return date;
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) throw new Error('DateTime scalar: literal must be a string');
    const date = new Date(ast.value);
    if (isNaN(date.getTime())) throw new Error('DateTime scalar: invalid date string');
    return date;
  },
});

export const resolvers = {
  DateTime: DateTimeScalar,

  Query: {
    health: (_parent: unknown, _args: unknown, _ctx: AppContext): string => 'ok',
    ...authResolvers.Query,
    ...albumResolvers.Query,
  },

  Mutation: {
    ...authResolvers.Mutation,
    ...albumResolvers.Mutation,
  },
};
