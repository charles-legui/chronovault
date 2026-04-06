// ── User ──────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string
  displayName: string
  role: 'user' | 'admin'
  createdAt: string
}

// ── Auth payloads ─────────────────────────────────────────────────────────────

export interface AuthPayload {
  token: string
  user: AuthUser
}

// Backend returns Boolean for these mutations; wrap for explicit typing at call sites
export interface GenericSuccessPayload {
  success: boolean
}

// ── Form inputs ───────────────────────────────────────────────────────────────

export interface SignInForm {
  email: string
  password: string
}

export interface SignUpForm {
  displayName: string
  email: string
  password: string
}

export interface ForgotPasswordForm {
  email: string
}

export interface ResetPasswordForm {
  newPassword: string
  confirmPassword: string
}
