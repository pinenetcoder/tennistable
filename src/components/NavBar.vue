<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { useI18n } from '../i18n'
import { useTheme } from '../composables/useTheme'

const authStore = useAuthStore()
const router = useRouter()
const { t, locale, setLocale, locales } = useI18n()
const { theme, toggleTheme } = useTheme()
const menuOpen = ref(false)
const langOpen = ref(false)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
  langOpen.value = false
}

function closeMenu() {
  menuOpen.value = false
}

function toggleLang() {
  langOpen.value = !langOpen.value
  menuOpen.value = false
}

function closeLang() {
  langOpen.value = false
}

function selectLocale(l) {
  setLocale(l)
  langOpen.value = false
}

function goTo(path) {
  router.push(path)
  closeMenu()
}

async function handleSignOut() {
  closeMenu()
  await authStore.logOut()
  router.push('/')
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <router-link to="/" class="navbar-brand">
        <img class="brand-icon" src="/stork-logo.svg" alt="Tennis TimeTable logo" />
        <span class="brand-text">{{ t('brandName') }}</span>
      </router-link>

      <div class="spacer"></div>

      <!-- Theme toggle -->
      <button class="theme-btn" @click="toggleTheme" :aria-label="theme === 'dark' ? t('lightMode') : t('darkMode')">
        <svg v-if="theme === 'dark'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>

      <!-- Language selector -->
      <div class="lang-dropdown" v-click-outside="closeLang">
        <button class="lang-btn" @click="toggleLang" :aria-expanded="langOpen">
          {{ locale.toUpperCase() }}
          <svg :class="['lang-chevron', { open: langOpen }]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <Transition name="dropdown">
          <div v-if="langOpen" class="lang-menu">
            <button
              v-for="l in locales"
              :key="l"
              :class="['lang-option', { active: locale === l }]"
              @click="selectLocale(l)"
            >
              {{ l.toUpperCase() }}
            </button>
          </div>
        </Transition>
      </div>

      <!-- Authenticated: avatar dropdown -->
      <div v-if="authStore.isAuthenticated" class="dropdown" v-click-outside="closeMenu">
        <button class="avatar-btn" @click="toggleMenu" :aria-label="t('userMenu')" :aria-expanded="menuOpen">
          <img
            :src="authStore.user.photoURL"
            :alt="authStore.user.displayName"
            class="avatar"
            referrerpolicy="no-referrer"
          />
          <span class="avatar-name">{{ authStore.user.displayName }}</span>
          <svg :class="['chevron', { open: menuOpen }]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <Transition name="dropdown">
          <div v-if="menuOpen" class="dropdown-menu">
            <div class="dropdown-user">
              <img
                :src="authStore.user.photoURL"
                :alt="authStore.user.displayName"
                class="dropdown-avatar"
                referrerpolicy="no-referrer"
              />
              <div>
                <div class="dropdown-name">{{ authStore.user.displayName }}</div>
                <div class="dropdown-email">{{ authStore.user.email }}</div>
              </div>
            </div>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" @click="goTo('/')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              {{ t('bookACourt') }}
            </button>
            <button class="dropdown-item" @click="goTo('/profile')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {{ t('myBookings') }}
            </button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item danger" @click="handleSignOut">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              {{ t('signOut') }}
            </button>
          </div>
        </Transition>
      </div>

      <!-- Not authenticated -->
      <button v-else class="btn btn-primary btn-sm" @click="router.push('/login')">{{ t('signIn') }}</button>
    </div>
  </nav>
</template>

<script>
// Global click-outside directive
export default {
  directives: {
    'click-outside': {
      mounted(el, binding) {
        el._clickOutside = (e) => {
          if (!el.contains(e.target)) binding.value()
        }
        document.addEventListener('click', el._clickOutside)
      },
      unmounted(el) {
        document.removeEventListener('click', el._clickOutside)
      }
    }
  }
}
</script>

<style scoped>
.theme-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--glass-bg);
  cursor: pointer;
  color: var(--muted-fg);
  transition: all var(--transition-base);
}

.theme-btn:hover {
  border-color: var(--border-hover);
  color: var(--primary);
}

.navbar {
  background: var(--nav-bg);
  backdrop-filter: blur(20px) saturate(1.2);
  -webkit-backdrop-filter: blur(20px) saturate(1.2);
  border-bottom: 1px solid var(--border);
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.navbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  height: 64px;
  gap: 16px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--fg);
  cursor: pointer;
  transition: color var(--transition-base);
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
}

.navbar-brand:hover {
  color: var(--primary);
}

.brand-icon {
  width: 36px;
  height: 36px;
  color: var(--fg);
}

.brand-text {
  background: var(--primary-gradient-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.spacer {
  flex: 1;
}

/* Language dropdown */
.lang-dropdown {
  position: relative;
}

.lang-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--glass-bg);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--muted-fg);
  letter-spacing: 0.05em;
  transition: all var(--transition-base);
  min-height: 32px;
}

.lang-btn:hover {
  border-color: var(--border-hover);
  color: var(--primary);
}

.lang-chevron {
  transition: transform var(--transition-base);
}

.lang-chevron.open {
  transform: rotate(180deg);
}

.lang-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: var(--dropdown-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: var(--shadow-lg), var(--shadow-gold);
  padding: 4px;
  z-index: var(--z-dropdown);
  min-width: 60px;
}

.lang-option {
  display: block;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--fg);
  cursor: pointer;
  font-family: inherit;
  letter-spacing: 0.05em;
  text-align: center;
  transition: background var(--transition-base), color var(--transition-base);
}

.lang-option:hover {
  background: var(--primary-light);
  color: var(--primary);
}

.lang-option.active {
  background: var(--primary-gradient);
  color: var(--primary-on);
}

/* Dropdown */
.dropdown {
  position: relative;
}

.avatar-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px 6px 6px;
  border: 1px solid var(--border);
  border-radius: 50px;
  background: var(--glass-bg);
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition-base);
}

.avatar-btn:hover {
  border-color: var(--border-hover);
  box-shadow: 0 0 20px var(--primary-glow-sm);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1.5px solid var(--avatar-border);
}

.avatar-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--fg);
}

.chevron {
  color: var(--muted-fg);
  transition: transform var(--transition-base);
}

.chevron.open {
  transform: rotate(180deg);
}

/* Dropdown menu */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 260px;
  background: var(--dropdown-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-lg), var(--shadow-gold);
  padding: 6px;
  z-index: var(--z-dropdown);
}

.dropdown-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 10px;
}

.dropdown-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1.5px solid var(--avatar-border);
}

.dropdown-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--fg);
  line-height: 1.3;
}

.dropdown-email {
  font-size: 0.75rem;
  color: var(--muted-fg);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}

.dropdown-divider {
  height: 1px;
  background: var(--border);
  margin: 4px 6px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--fg);
  cursor: pointer;
  font-family: inherit;
  transition: background var(--transition-base), color var(--transition-base);
  text-align: left;
}

.dropdown-item:hover {
  background: var(--primary-light);
  color: var(--primary);
}

.dropdown-item.danger {
  color: var(--destructive);
}

.dropdown-item.danger:hover {
  background: var(--destructive-light);
  color: var(--destructive);
}

/* Dropdown animation */
.dropdown-enter-active {
  transition: opacity 150ms ease, transform 150ms ease;
}

.dropdown-leave-active {
  transition: opacity 100ms ease, transform 100ms ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}

@media (max-width: 640px) {
  .avatar-name { display: none; }
  .navbar { padding: 0 12px; }
  .navbar-inner { height: 56px; gap: 10px; }
  .brand-icon { width: 28px; height: 28px; }
  .navbar-brand { font-size: 0.95rem; gap: 8px; }
  .chevron { display: none; }

  .dropdown-menu {
    position: fixed;
    top: 57px;
    left: 0;
    right: 0;
    width: 100%;
    border-radius: 0 0 16px 16px;
    max-height: calc(100vh - 57px);
    overflow-y: auto;
  }

  .dropdown-item {
    padding: 14px 16px;
    font-size: 0.95rem;
    min-height: 48px;
  }

  .dropdown-user {
    padding: 16px;
  }

  .lang-menu {
    position: fixed;
    top: 57px;
    right: 12px;
  }
}
</style>
