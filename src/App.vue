<script setup>
import NavBar from './components/NavBar.vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div class="app" v-if="!authStore.loading">
    <NavBar />
    <main class="main-content">
      <router-view />
    </main>
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
}

@media (max-width: 640px) {
  .main-content {
    padding: 20px 16px;
  }
}
</style>
