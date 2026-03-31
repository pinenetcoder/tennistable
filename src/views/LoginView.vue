<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { ref } from 'vue'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const loading = ref(false)
const error = ref('')

async function signIn() {
  loading.value = true
  error.value = ''
  try {
    await authStore.signInWithGoogle()
    router.push(route.query.redirect || '/')
  } catch (err) {
    error.value = 'Sign in failed. Please try again.'
    console.error('Sign in failed:', err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-icon-wrapper">
        <svg class="login-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M18.09 5.91C14.25 9.75 9.75 14.25 5.91 18.09"/>
          <path d="M5.91 5.91C9.75 9.75 14.25 14.25 18.09 18.09"/>
        </svg>
      </div>
      <h1>Tennis Club</h1>
      <p class="login-subtitle">Sign in to book courts and manage your reservations</p>

      <p v-if="error" class="login-error" role="alert">{{ error }}</p>

      <button class="btn-google" @click="signIn" :disabled="loading">
        <svg v-if="!loading" width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        <div v-else class="spinner spinner-sm"></div>
        {{ loading ? 'Signing in...' : 'Sign in with Google' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 160px);
}

.login-card {
  text-align: center;
  padding: 48px;
  background: var(--card);
  border-radius: 16px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  max-width: 420px;
  width: 100%;
}

.login-icon-wrapper {
  width: 64px;
  height: 64px;
  background: var(--primary-light);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.login-icon {
  width: 36px;
  height: 36px;
  color: var(--primary);
}

.login-card h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--fg);
  margin: 0 0 8px;
  line-height: 1.3;
}

.login-subtitle {
  color: var(--muted-fg);
  font-size: 0.9rem;
  margin: 0 0 32px;
  line-height: 1.5;
}

.login-error {
  color: var(--destructive);
  font-size: 0.85rem;
  margin: 0 0 16px;
  padding: 10px 16px;
  background: var(--destructive-light);
  border-radius: 8px;
  border: 1px solid var(--destructive-border);
}

.btn-google {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 28px;
  background: var(--bg-white);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--fg);
  cursor: pointer;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
  font-family: inherit;
  min-height: 48px;
}

.btn-google:hover:not(:disabled) {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-sm);
}

.btn-google:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-sm {
  width: 18px;
  height: 18px;
  border-width: 2px;
}
</style>
