<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuthStore } from '@/stores/authStore'
import type { ResetPasswordForm } from '@/types/auth'

const route = useRoute()
const auth  = useAuthStore()

// Support both ?token= query and :token param
const token = computed<string>(() => {
  const q = route.query.token
  const p = route.params.token
  if (typeof q === 'string' && q) return q
  if (typeof p === 'string' && p) return p
  return ''
})

const form = reactive<ResetPasswordForm>({ newPassword: '', confirmPassword: '' })
const done = ref(false)

onMounted(() => {
  auth.clearError()
  if (!token.value) {
    // Surface missing token immediately — no point letting the user fill the form
    auth.error = 'Reset link is invalid or has expired. Please request a new one.'
  }
})

function validate(): string | null {
  if (form.newPassword.length < 8) return 'Password must be at least 8 characters'
  if (form.newPassword !== form.confirmPassword) return 'Passwords do not match'
  return null
}

async function handleSubmit() {
  const validationError = validate()
  if (validationError) {
    auth.error = validationError
    return
  }

  await auth.resetPassword({ ...form, token: token.value })
  if (!auth.error) {
    done.value = true
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- Header -->
      <div class="auth-header">
        <span class="auth-logo">CV</span>
        <h1 class="auth-title">Choose a new password</h1>
        <p class="auth-subtitle">Must be at least 8 characters</p>
      </div>

      <!-- Success state -->
      <div v-if="done" class="auth-success" role="status">
        <p class="success-title">Password updated</p>
        <p class="success-body">Your password has been changed successfully.</p>
        <RouterLink to="/sign-in" class="auth-link success-cta">Sign in to your account</RouterLink>
      </div>

      <!-- Form -->
      <form v-else class="auth-form" novalidate @submit.prevent="handleSubmit">
        <BaseInput
          v-model="form.newPassword"
          type="password"
          label="New password"
          placeholder="••••••••"
          :disabled="auth.loading || !token"
          required
        />

        <BaseInput
          v-model="form.confirmPassword"
          type="password"
          label="Confirm password"
          placeholder="••••••••"
          :disabled="auth.loading || !token"
          required
        />

        <p v-if="auth.error" class="auth-error" role="alert">{{ auth.error }}</p>

        <BaseButton type="submit" :loading="auth.loading" :disabled="!token" full>
          Set new password
        </BaseButton>
      </form>

      <!-- Footer -->
      <p v-if="!done" class="auth-footer">
        <RouterLink to="/forgot-password" class="auth-link">Request a new link</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  padding: var(--space-6);
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--space-10);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

/* ── Header ──────────────────────────────────────────────── */
.auth-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  text-align: center;
}

.auth-logo {
  width: 48px;
  height: 48px;
  background: var(--color-primary);
  color: white;
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -0.5px;
}

.auth-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--color-text);
  line-height: var(--leading-tight);
}

.auth-subtitle {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

/* ── Form ────────────────────────────────────────────────── */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.auth-error {
  font-size: var(--text-sm);
  color: var(--color-error);
  background: color-mix(in srgb, var(--color-error) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-error) 20%, transparent);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  line-height: var(--leading-normal);
}

/* ── Success ─────────────────────────────────────────────── */
.auth-success {
  background: color-mix(in srgb, var(--color-primary) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.success-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text);
}

.success-body {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);
}

.success-cta {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  margin-top: var(--space-1);
}

/* ── Footer ──────────────────────────────────────────────── */
.auth-footer {
  text-align: center;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.auth-link {
  color: var(--color-primary);
  font-weight: var(--font-medium);
}

.auth-link:hover {
  text-decoration: underline;
}
</style>
