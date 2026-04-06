import { ValidationError } from '../../utils/errors.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const MIN_DISPLAY_NAME_LENGTH = 2;
const MAX_DISPLAY_NAME_LENGTH = 64;

export function validateEmail(email: unknown): string {
  if (typeof email !== 'string' || email.trim() === '') {
    throw new ValidationError('Email is required');
  }
  const normalized = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalized)) {
    throw new ValidationError('Email is invalid');
  }
  return normalized;
}

export function validatePassword(password: unknown): string {
  if (typeof password !== 'string' || password.trim() === '') {
    throw new ValidationError('Password is required');
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new ValidationError(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    );
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    throw new ValidationError(
      `Password must be at most ${MAX_PASSWORD_LENGTH} characters`,
    );
  }
  return password;
}

export function validateDisplayName(displayName: unknown): string {
  if (typeof displayName !== 'string' || displayName.trim() === '') {
    throw new ValidationError('Display name is required');
  }
  const trimmed = displayName.trim();
  if (trimmed.length < MIN_DISPLAY_NAME_LENGTH) {
    throw new ValidationError(
      `Display name must be at least ${MIN_DISPLAY_NAME_LENGTH} characters`,
    );
  }
  if (trimmed.length > MAX_DISPLAY_NAME_LENGTH) {
    throw new ValidationError(
      `Display name must be at most ${MAX_DISPLAY_NAME_LENGTH} characters`,
    );
  }
  return trimmed;
}

export function validateObjectId(id: unknown, label = 'ID'): string {
  if (typeof id !== 'string' || !/^[a-f\d]{24}$/i.test(id)) {
    throw new ValidationError(`${label} is invalid`);
  }
  return id;
}

export interface ValidatedUpdateProfileInput {
  displayName?: string;
  email?: string;
}

export function validateUpdateProfileInput(input: {
  displayName?: unknown;
  email?: unknown;
}): ValidatedUpdateProfileInput {
  const result: ValidatedUpdateProfileInput = {};

  if (input.displayName !== undefined) {
    result.displayName = validateDisplayName(input.displayName);
  }
  if (input.email !== undefined) {
    result.email = validateEmail(input.email);
  }
  if (Object.keys(result).length === 0) {
    throw new ValidationError('At least one field must be provided for update');
  }

  return result;
}
