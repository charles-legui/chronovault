import { GraphQLError } from 'graphql';

export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'AuthError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

// Maps domain errors to GraphQL errors with appropriate extensions
export function toGraphQLError(error: unknown): GraphQLError {
  if (error instanceof AuthError) {
    return new GraphQLError(error.message, {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  if (error instanceof ValidationError) {
    return new GraphQLError(error.message, {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
  if (error instanceof NotFoundError) {
    return new GraphQLError(error.message, {
      extensions: { code: 'NOT_FOUND' },
    });
  }
  if (error instanceof AppError) {
    return new GraphQLError(error.message, {
      extensions: { code: 'APP_ERROR' },
    });
  }
  // Unknown errors — do not leak internals
  console.error('[unhandled error]', error);
  return new GraphQLError('Internal server error', {
    extensions: { code: 'INTERNAL_SERVER_ERROR' },
  });
}
