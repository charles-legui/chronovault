import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { apolloClient } from '@/services/apolloClient'
import { SIGN_IN_MUTATION, SIGN_UP_MUTATION, SIGN_OUT_MUTATION, ME_QUERY } from '@/graphql/auth'
import { forgotPassword as forgotPasswordService, resetPassword as resetPasswordService } from '@/services/authService'
import router from '@/router'
import type { AuthUser, SignInForm, SignUpForm, ForgotPasswordForm, ResetPasswordForm } from '@/types/auth'

// ── Token key ────────────────────────────────────────────────────────────────

const TOKEN_KEY = 'chronovault_token'

// ── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = defineStore('auth', () => {
  const user    = ref<AuthUser | null>(null)
  const token   = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const loading = ref(false)
  const error   = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // ── Helpers ───────────────────────────────────────────────────────────────

  function setAuth(payload: { token: string; user: AuthUser }) {
    token.value = payload.token
    user.value  = payload.user
    localStorage.setItem(TOKEN_KEY, payload.token)
    error.value = null
  }

  function clearAuth() {
    token.value = null
    user.value  = null
    localStorage.removeItem(TOKEN_KEY)
  }

  function extractMessage(err: unknown): string {
    if (err instanceof Error) return err.message
    return 'An unexpected error occurred'
  }

  function clearError(): void {
    error.value = null
  }

  // ── Session ───────────────────────────────────────────────────────────────

  async function fetchCurrentUser(): Promise<void> {
    const result = await apolloClient.query<{ me: AuthUser }>({
      query: ME_QUERY,
      fetchPolicy: 'network-only',
    })
    if (!result.data?.me) throw new Error('Failed to fetch current user')
    user.value = result.data.me
  }

  // Called once in main.ts before app.mount() to restore a persisted session.
  async function init(): Promise<void> {
    if (!token.value) return
    try {
      await fetchCurrentUser()
    } catch {
      // Token is expired or invalid — wipe it so the guard redirects to sign-in.
      clearAuth()
    }
  }

  // ── Sign in / Sign up / Sign out ──────────────────────────────────────────

  async function signIn(input: SignInForm): Promise<void> {
    loading.value = true
    error.value   = null
    try {
      const result = await apolloClient.mutate<{ signIn: { token: string; user: AuthUser } }>({
        mutation:  SIGN_IN_MUTATION,
        variables: { input },
      })
      if (!result.data?.signIn) throw new Error('Sign in failed')
      setAuth(result.data.signIn)
    } catch (err) {
      // Store the message for the view to display; do NOT rethrow —
      // the view checks auth.error after awaiting, rethrowing would
      // create an unhandled rejection.
      error.value = extractMessage(err)
    } finally {
      loading.value = false
    }
  }

  async function signUp(input: SignUpForm): Promise<void> {
    loading.value = true
    error.value   = null
    try {
      const result = await apolloClient.mutate<{ signUp: { token: string; user: AuthUser } }>({
        mutation:  SIGN_UP_MUTATION,
        variables: { input },
      })
      if (!result.data?.signUp) throw new Error('Sign up failed')
      setAuth(result.data.signUp)
    } catch (err) {
      error.value = extractMessage(err)
    } finally {
      loading.value = false
    }
  }

  async function signOut(): Promise<void> {
    loading.value = true
    error.value   = null
    try {
      await apolloClient.mutate({ mutation: SIGN_OUT_MUTATION })
    } catch {
      // Sign out locally regardless of server response.
    } finally {
      clearAuth()
      // Clear cached GraphQL data so a subsequent sign-in with a different
      // account never sees stale data from the previous session.
      await apolloClient.clearStore()
      loading.value = false
      router.push('/sign-in')
    }
  }

  // ── Password reset ────────────────────────────────────────────────────────

  async function forgotPassword(input: ForgotPasswordForm): Promise<void> {
    loading.value = true
    error.value   = null
    try {
      await forgotPasswordService(input.email)
    } catch (err) {
      error.value = extractMessage(err)
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(input: ResetPasswordForm & { token: string }): Promise<void> {
    loading.value = true
    error.value   = null
    try {
      await resetPasswordService(input)
    } catch (err) {
      error.value = extractMessage(err)
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    init,
    fetchCurrentUser,
    signIn,
    signUp,
    signOut,
    forgotPassword,
    resetPassword,
    clearError,
  }
})
