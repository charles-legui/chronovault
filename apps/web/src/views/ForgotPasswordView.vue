<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuthStore } from '@/stores/authStore'
import type { ForgotPasswordForm } from '@/types/auth'

const auth = useAuthStore()
const form = reactive<ForgotPasswordForm>({ email: '' })
const sent = ref(false)

onMounted(() => auth.clearError())

async function handleSubmit() {
  await auth.forgotPassword(form)
  if (!auth.error) {
    sent.value = true
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- Header -->
      <div class="auth-header">
        <span class="auth-logo">CV</span>
        <h1 class="auth-title">Reset your password</h1>
        <p class="auth-subtitle">Enter your email and we'll send you a reset link</p>
      </div>

      <!-- Success state -->
      <div v-if="sent" class="auth-success" role="status">
        <p class="success-title">Check your inbox</p>
        <p class="success-body">
          If an account exists for that email address, a reset link has been sent.
          It expires in 30 minutes.
        </p>
      </div>

      <!-- Form -->
      <form v-else class="auth-form" novalidate @submit.prevent="handleSubmit">
        <BaseInput
          v-model="form.email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          :disabled="auth.loading"
          required
        />

        <p v-if="auth.error" class="auth-error" role="alert">{{ auth.error }}</p>

        <BaseButton type="submit" :loading="auth.loading" full>
          Send reset link
        </BaseButton>
      </form>

      <!-- Footer -->
      <p class="auth-footer">
        <RouterLink to="/sign-in" class="auth-link">Back to sign in</RouterLink>
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
