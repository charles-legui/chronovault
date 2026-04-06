// Auth service — business logic for authentication flows.
// Methods will be implemented in the next step.

export async function getCurrentUser(_userId: string): Promise<never> {
  throw new Error('Not implemented');
}

export async function signUp(_rawInput: unknown): Promise<never> {
  throw new Error('Not implemented');
}

export async function signIn(_rawInput: unknown): Promise<never> {
  throw new Error('Not implemented');
}

export async function signOut(): Promise<void> {
  throw new Error('Not implemented');
}

export async function forgotPassword(_rawInput: unknown): Promise<never> {
  throw new Error('Not implemented');
}

export async function resetPassword(_rawInput: unknown): Promise<never> {
  throw new Error('Not implemented');
}

export async function changePassword(
  _userId: string,
  _rawInput: unknown,
): Promise<never> {
  throw new Error('Not implemented');
}
