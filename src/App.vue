<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavBar from './components/NavBar.vue'
import { useAuthStore } from './stores/auth'
import { useI18n } from './i18n'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const currentTab = computed(() => {
  if (route.path === '/') return 'home'
  if (route.path === '/timetable') return 'timetable'
  if (route.path === '/profile') return 'profile'
  return 'home'
})

function goTab(tab) {
  if (tab === 'home') router.push('/')
  else if (tab === 'timetable') router.push('/timetable')
  else if (tab === 'profile') {
    if (authStore.isAuthenticated) router.push('/profile')
    else router.push('/login')
  }
}
</script>

<template>
  <div class="app" v-if="!authStore.loading">
    <NavBar />
    <main class="main-content">
      <router-view />
    </main>

    <!-- Mobile bottom tab bar -->
    <nav class="bottom-tabs" :aria-label="t('mainNav')">
      <button :class="['tab-item', { active: currentTab === 'home' }]" @click="goTab('home')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
        <span class="tab-label">{{ t('tabBook') }}</span>
      </button>
      <button :class="['tab-item', { active: currentTab === 'timetable' }]" @click="goTab('timetable')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <line x1="3" y1="9" x2="21" y2="9"/>
          <line x1="3" y1="15" x2="21" y2="15"/>
          <line x1="9" y1="3" x2="9" y2="21"/>
          <line x1="15" y1="3" x2="15" y2="21"/>
        </svg>
        <span class="tab-label">{{ t('tabTimetable') }}</span>
      </button>
      <button :class="['tab-item', { active: currentTab === 'profile' }]" @click="goTab('profile')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span class="tab-label">{{ t('tabProfile') }}</span>
      </button>
    </nav>
  </div>
  <div v-else class="app-loading">
    <div class="loading-brand">
      <svg class="loading-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M18.09 5.91C14.25 9.75 9.75 14.25 5.91 18.09"/>
        <path d="M5.91 5.91C9.75 9.75 14.25 14.25 18.09 18.09"/>
      </svg>
      <div class="spinner"></div>
    </div>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 32px 24px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.app-loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
}

.loading-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.loading-icon {
  width: 48px;
  height: 48px;
  color: var(--primary);
  filter: drop-shadow(0 0 12px var(--primary-glow-active));
}

/* Bottom tab bar — mobile only */
.bottom-tabs {
  display: none;
}

@media (max-width: 640px) {
  .main-content {
    padding: 16px 16px calc(72px + env(safe-area-inset-bottom, 0px));
  }

  .bottom-tabs {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: var(--z-sticky);
    background: var(--nav-bg-solid);
    backdrop-filter: blur(20px) saturate(1.2);
    -webkit-backdrop-filter: blur(20px) saturate(1.2);
    border-top: 1px solid var(--border);
    padding: 6px 8px calc(6px + env(safe-area-inset-bottom, 0px));
    justify-content: space-around;
    align-items: center;
  }

  .tab-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 6px 16px;
    border: none;
    background: none;
    cursor: pointer;
    font-family: inherit;
    color: var(--muted-fg);
    transition: color var(--transition-base);
    border-radius: 10px;
    min-width: 64px;
    min-height: 44px;
    justify-content: center;
  }

  .tab-item.active {
    color: var(--primary);
  }

  .tab-item:active {
    background: var(--primary-glow-sm);
  }

  .tab-label {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.02em;
  }
}
</style>
