import { ValidationError } from '../../utils/errors.js';
import {
  validateEmail,
  validatePassword,
  validateDisplayName,
} from '../users/user.validators.js';

// ── Sign up ───────────────────────────────────────────────────────────────────

export interface ValidatedSignUpInput {
  email: string;
  password: string;
  displayName: string;
}

export function validateSignUpInput(input: {
  email?: unknown;
  password?: unknown;
  displayName?: unknown;
}): ValidatedSignUpInput {
  return {
    email: validateEmail(input.email),
    password: validatePassword(input.password),
    displayName: validateDisplayName(input.displayName),
  };
}

// ── Sign in ───────────────────────────────────────────────────────────────────

export interface ValidatedSignInInput {
  email: string;
  password: string;
}

export function validateSignInInput(input: {
  email?: unknown;
  password?: unknown;
}): ValidatedSignInInput {
  // Intentionally lean — no strength checks on sign in, only presence
  if (typeof input.password !== 'string' || input.password === '') {
    throw new ValidationError('Password is required');
  }

  return {
    email: validateEmail(input.email),
    password: input.password,
  };
}

// ── Forgot password ───────────────────────────────────────────────────────────

export interface ValidatedForgotPasswordInput {
  email: string;
}

export function validateForgotPasswordInput(input: {
  email?: unknown;
}): ValidatedForgotPasswordInput {
  return {
    email: validateEmail(input.email),
  };
}

// ── Reset password ────────────────────────────────────────────────────────────

export interface ValidatedResetPasswordInput {
  token: string;
  newPassword: string;
}

export function validateResetPasswordInput(input: {
  token?: unknown;
  newPassword?: unknown;
  confirmPassword?: unknown;
}): ValidatedResetPasswordInput {
  if (typeof input.token !== 'string' || input.token.trim() === '') {
    throw new ValidationError('Reset token is required');
  }

  const newPassword = validatePassword(input.newPassword);

  if (input.confirmPassword !== input.newPassword) {
    throw new ValidationError('Passwords do not match');
  }

  return {
    token: input.token.trim(),
    newPassword,
  };
}

// ── Change password ───────────────────────────────────────────────────────────

export interface ValidatedChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export function validateChangePasswordInput(input: {
  currentPassword?: unknown;
  newPassword?: unknown;
  confirmPassword?: unknown;
}): ValidatedChangePasswordInput {
  if (typeof input.currentPassword !== 'string' || input.currentPassword === '') {
    throw new ValidationError('Current password is required');
  }

  const newPassword = validatePassword(input.newPassword);

  if (input.newPassword === input.currentPassword) {
    throw new ValidationError('New password must differ from current password');
  }

  if (input.confirmPassword !== input.newPassword) {
    throw new ValidationError('Passwords do not match');
  }

  return {
    currentPassword: input.currentPassword,
    newPassword,
  };
}
