<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { ref } from 'vue'
import { useI18n } from '../i18n'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const loading = ref(false)
const error = ref('')
const showEmailForm = ref(false)
const isSignUp = ref(false)
const email = ref('')
const password = ref('')
const firstName = ref('')
const lastName = ref('')
const emailLoading = ref(false)
const emailSuccess = ref('')

async function signIn() {
  loading.value = true
  error.value = ''
  try {
    await authStore.signInWithGoogle()
    router.push(route.query.redirect || '/')
  } catch (err) {
    error.value = t('signInFailed')
    console.error('Sign in failed:', err)
  } finally {
    loading.value = false
  }
}

async function submitEmail() {
  emailLoading.value = true
  error.value = ''
  emailSuccess.value = ''
  try {
    if (isSignUp.value) {
      await authStore.signUpWithEmail(email.value, password.value, firstName.value, lastName.value)
      emailSuccess.value = t('checkEmail')
    } else {
      await authStore.signInWithEmail(email.value, password.value)
      router.push(route.query.redirect || '/')
    }
  } catch (err) {
    error.value = err.message
    console.error('Email auth failed:', err)
  } finally {
    emailLoading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-icon-wrapper">
        <img class="login-icon" src="/stork-logo.svg" alt="Tennis TimeTable logo" />
      </div>
      <h1>{{ t('brandName') }}</h1>
      <p class="login-subtitle">{{ t('loginSubtitle') }}</p>

      <p v-if="error" class="login-error" role="alert">{{ error }}</p>

      <button class="btn-google" @click="signIn" :disabled="loading">
        <svg v-if="!loading" width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        <div v-else class="spinner spinner-sm"></div>
        {{ loading ? t('signingIn') : t('signInWithGoogle') }}
      </button>

      <div class="divider">
        <span>{{ t('or') }}</span>
      </div>

      <button v-if="!showEmailForm" class="btn-email" @click="showEmailForm = true">
        {{ t('signInWithEmail') }}
      </button>

      <form v-else class="email-form" @submit.prevent="submitEmail">
        <template v-if="isSignUp">
          <input
            v-model="firstName"
            type="text"
            :placeholder="t('firstNamePlaceholder')"
            class="input-field"
            required
            autocomplete="given-name"
          />
          <input
            v-model="lastName"
            type="text"
            :placeholder="t('lastNamePlaceholder')"
            class="input-field"
            required
            autocomplete="family-name"
          />
        </template>
        <input
          v-model="email"
          type="email"
          :placeholder="t('emailPlaceholder')"
          class="input-field"
          required
          autocomplete="email"
        />
        <input
          v-model="password"
          type="password"
          :placeholder="t('passwordPlaceholder')"
          class="input-field"
          required
          minlength="6"
          :autocomplete="isSignUp ? 'new-password' : 'current-password'"
        />

        <p v-if="emailSuccess" class="login-success" role="status">{{ emailSuccess }}</p>

        <button type="submit" class="btn-submit" :disabled="emailLoading">
          <div v-if="emailLoading" class="spinner spinner-sm"></div>
          {{ emailLoading ? t('signingIn') : (isSignUp ? t('signUp') : t('signInBtn')) }}
        </button>

        <p class="toggle-mode">
          {{ isSignUp ? t('alreadyHaveAccount') : t('noAccount') }}
          <a href="#" @click.prevent="isSignUp = !isSignUp; error = ''; emailSuccess = ''">
            {{ isSignUp ? t('signInBtn') : t('signUp') }}
          </a>
        </p>
      </form>
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
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 20px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg), var(--shadow-gold);
  max-width: 420px;
  width: 100%;
}

.login-icon-wrapper {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, var(--primary-glow-md), var(--primary-light));
  border: 1px solid var(--primary-glow-lg);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.login-icon {
  width: 36px;
  height: 36px;
  color: var(--primary);
  filter: drop-shadow(0 0 8px var(--primary-glow-xl));
}

.login-card h1 {
  font-size: 2rem;
  font-weight: 600;
  color: var(--fg);
  margin: 0 0 8px;
  line-height: 1.3;
  font-family: var(--font-heading);
  background: var(--primary-gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  color: var(--muted-fg);
  font-size: 0.9rem;
  margin: 0 0 36px;
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
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--fg);
  cursor: pointer;
  transition: all var(--transition-base);
  font-family: inherit;
  min-height: 48px;
  letter-spacing: 0.02em;
}

.btn-google:hover:not(:disabled) {
  border-color: var(--border-hover);
  box-shadow: 0 0 24px var(--primary-glow);
  background: var(--primary-glow-sm);
}

.btn-google:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 24px 0;
  color: var(--muted-fg);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.btn-email {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 28px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--muted-fg);
  cursor: pointer;
  transition: all var(--transition-base);
  font-family: inherit;
  min-height: 48px;
  width: 100%;
}

.btn-email:hover {
  border-color: var(--border-hover);
  color: var(--fg);
  background: rgba(255, 255, 255, 0.03);
}

.email-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-field {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 0.9rem;
  color: var(--fg);
  font-family: inherit;
  outline: none;
  transition: border-color var(--transition-base);
}

.input-field::placeholder {
  color: var(--muted-fg);
}

.input-field:focus {
  border-color: var(--primary);
}

.btn-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 28px;
  background: linear-gradient(135deg, var(--primary-glow-lg), var(--primary-glow));
  border: 1px solid var(--primary-glow-xl);
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--fg);
  cursor: pointer;
  transition: all var(--transition-base);
  font-family: inherit;
  min-height: 48px;
  margin-top: 4px;
}

.btn-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--primary-glow-xl), var(--primary-glow-md));
  box-shadow: 0 0 24px var(--primary-glow);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toggle-mode {
  color: var(--muted-fg);
  font-size: 0.8rem;
  margin: 4px 0 0;
}

.toggle-mode a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
}

.toggle-mode a:hover {
  text-decoration: underline;
}

.login-success {
  color: var(--success, #4ade80);
  font-size: 0.85rem;
  margin: 0;
  padding: 10px 16px;
  background: rgba(74, 222, 128, 0.08);
  border-radius: 8px;
  border: 1px solid rgba(74, 222, 128, 0.2);
}

.spinner-sm {
  width: 18px;
  height: 18px;
  border-width: 2px;
}

@media (max-width: 640px) {
  .login-page {
    min-height: 0;
    height: calc(100vh - 56px - 72px - 32px);
    padding: 0 16px;
  }

  .login-card {
    padding: 32px 20px;
    border-radius: 16px;
  }

  .login-icon-wrapper {
    width: 60px;
    height: 60px;
    margin-bottom: 20px;
    border-radius: 16px;
  }

  .login-icon { width: 32px; height: 32px; }

  .login-card h1 { font-size: 1.6rem; }
  .login-subtitle { font-size: 0.85rem; margin-bottom: 28px; }

  .btn-google {
    width: 100%;
    justify-content: center;
    padding: 14px 20px;
    font-size: 0.95rem;
    min-height: 52px;
  }
}
</style>
