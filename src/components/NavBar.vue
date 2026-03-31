<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const menuOpen = ref(false)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
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
        <svg class="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M18.09 5.91C14.25 9.75 9.75 14.25 5.91 18.09"/>
          <path d="M5.91 5.91C9.75 9.75 14.25 14.25 18.09 18.09"/>
        </svg>
        <span class="brand-text">Tennis Club</span>
      </router-link>

      <div class="spacer"></div>

      <!-- Authenticated: avatar dropdown -->
      <div v-if="authStore.isAuthenticated" class="dropdown" v-click-outside="closeMenu">
        <button class="avatar-btn" @click="toggleMenu" aria-label="User menu" :aria-expanded="menuOpen">
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
              Book a Court
            </button>
            <button class="dropdown-item" @click="goTo('/profile')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              My Bookings
            </button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item danger" @click="handleSignOut">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign Out
            </button>
          </div>
        </Transition>
      </div>

      <!-- Not authenticated -->
      <button v-else class="btn btn-primary btn-sm" @click="router.push('/login')">Sign In</button>
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
.navbar {
  background: var(--bg-white);
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
}

.navbar-brand:hover {
  color: var(--primary);
}

.brand-icon {
  width: 28px;
  height: 28px;
  color: var(--primary);
}

.spacer {
  flex: 1;
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
  background: var(--bg-white);
  cursor: pointer;
  font-family: inherit;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}

.avatar-btn:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-sm);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
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
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow-lg);
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
  .navbar { padding: 0 16px; }
  .dropdown-menu { width: 240px; }
}
</style>
