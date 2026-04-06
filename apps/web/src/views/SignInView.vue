<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuthStore } from '@/stores/authStore'
import type { SignInForm } from '@/types/auth'

const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()

const form = reactive<SignInForm>({ email: '', password: '' })

onMounted(() => auth.clearError())

async function handleSubmit() {
  await auth.signIn(form)
  if (!auth.error) {
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    router.push(redirect)
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- Header -->
      <div class="auth-header">
        <span class="auth-logo">CV</span>
        <h1 class="auth-title">Sign in to ChronoVault</h1>
        <p class="auth-subtitle">Enter your credentials to continue</p>
      </div>

      <!-- Form -->
      <form class="auth-form" novalidate @submit.prevent="handleSubmit">
        <BaseInput
          v-model="form.email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          :disabled="auth.loading"
          required
        />

        <BaseInput
          v-model="form.password"
          type="password"
          label="Password"
          placeholder="••••••••"
          :disabled="auth.loading"
          required
        />

        <p v-if="auth.error" class="auth-error" role="alert">{{ auth.error }}</p>

        <div class="form-meta">
          <RouterLink to="/forgot-password" class="auth-link forgot-link">
            Forgot password?
          </RouterLink>
        </div>

        <BaseButton type="submit" :loading="auth.loading" full>
          Sign in
        </BaseButton>
      </form>

      <!-- Footer -->
      <p class="auth-footer">
        No account?
        <RouterLink to="/sign-up" class="auth-link">Create one</RouterLink>
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

.form-meta {
  display: flex;
  justify-content: flex-end;
}

.forgot-link {
  font-size: var(--text-sm);
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
