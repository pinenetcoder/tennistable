<script setup>
import { watch, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useBookingStore } from '../stores/bookings'
import { COURTS } from '../courts'

const authStore = useAuthStore()
const bookingStore = useBookingStore()

watch(() => authStore.user, (u) => {
  if (u) bookingStore.fetchByUser(u.uid)
}, { immediate: true })

const today = new Date().toISOString().split('T')[0]

const upcoming = computed(() =>
  bookingStore.userBookings.filter(b => b.date >= today && b.status === 'active')
)

const past = computed(() =>
  bookingStore.userBookings.filter(b => b.date < today || b.status === 'cancelled')
)

function courtName(id) {
  return COURTS.find(c => c.id === id)?.name || `Court ${id}`
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

async function cancel(bookingId) {
  if (confirm('Cancel this booking?')) {
    await bookingStore.cancelBooking(bookingId)
    await bookingStore.fetchByUser(authStore.user.uid)
  }
}
</script>

<template>
  <div class="profile">
    <!-- User info -->
    <div class="profile-card">
      <img
        :src="authStore.user.photoURL"
        :alt="authStore.user.displayName"
        class="profile-avatar"
        referrerpolicy="no-referrer"
      />
      <div class="profile-info">
        <h1>{{ authStore.user.displayName }}</h1>
        <p class="profile-email">{{ authStore.user.email }}</p>
      </div>
      <div class="profile-stat">
        <span class="stat-number">{{ upcoming.length }}</span>
        <span class="stat-label">Upcoming</span>
      </div>
    </div>

    <!-- Upcoming -->
    <section class="bookings-section">
      <div class="section-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <h2>Upcoming Reservations</h2>
        <span v-if="upcoming.length" class="count">{{ upcoming.length }}</span>
      </div>
      <div v-if="upcoming.length" class="booking-list">
        <div v-for="b in upcoming" :key="b.id" class="booking-card">
          <div class="booking-left">
            <div class="booking-court-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18"/>
              </svg>
            </div>
            <div class="booking-info">
              <span class="booking-court">{{ courtName(b.court_id) }}</span>
              <div class="booking-meta">
                <span class="booking-date">{{ formatDate(b.date) }}</span>
                <span class="booking-divider">|</span>
                <span class="booking-time">{{ b.start_time }} - {{ b.end_time }}</span>
              </div>
            </div>
          </div>
          <button class="btn btn-outline btn-sm" @click="cancel(b.id)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Cancel
          </button>
        </div>
      </div>
      <div v-else class="empty-state">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <p>No upcoming reservations</p>
        <router-link to="/" class="btn btn-primary btn-sm">Book a Court</router-link>
      </div>
    </section>

    <!-- History -->
    <section class="bookings-section">
      <div class="section-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <h2>History</h2>
      </div>
      <div v-if="past.length" class="booking-list">
        <div v-for="b in past" :key="b.id" class="booking-card past">
          <div class="booking-left">
            <div class="booking-court-badge muted">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18"/>
              </svg>
            </div>
            <div class="booking-info">
              <span class="booking-court">{{ courtName(b.court_id) }}</span>
              <div class="booking-meta">
                <span class="booking-date">{{ formatDate(b.date) }}</span>
                <span class="booking-divider">|</span>
                <span class="booking-time">{{ b.start_time }} - {{ b.end_time }}</span>
              </div>
            </div>
          </div>
          <span :class="['status-badge', b.status]">{{ b.status }}</span>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>No past reservations</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.profile-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: var(--card);
  border-radius: 16px;
  border: 1px solid var(--border);
  margin-bottom: 32px;
}

.profile-avatar {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  border: 2px solid var(--border);
}

.profile-info {
  flex: 1;
}

.profile-info h1 {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 2px;
  color: var(--fg);
}

.profile-email {
  color: var(--muted-fg);
  font-size: 0.85rem;
  margin: 0;
}

.profile-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 20px;
  background: var(--primary-light);
  border-radius: 12px;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.bookings-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: var(--muted-fg);
}

.section-header h2 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--fg);
  margin: 0;
}

.count {
  background: var(--primary);
  color: #fff;
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 700;
}

.booking-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.booking-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--card);
  border-radius: 12px;
  border: 1px solid var(--border);
  transition: border-color var(--transition-base);
}

.booking-card:hover {
  border-color: var(--border-hover);
}

.booking-card.past {
  opacity: 0.65;
}

.booking-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.booking-court-badge {
  width: 40px;
  height: 40px;
  background: var(--primary-light);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  flex-shrink: 0;
}

.booking-court-badge.muted {
  background: var(--muted);
  color: var(--muted-fg);
}

.booking-court {
  font-weight: 600;
  color: var(--fg);
  font-size: 0.9rem;
  display: block;
}

.booking-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.booking-date, .booking-time {
  color: var(--muted-fg);
  font-size: 0.8rem;
}

.booking-divider {
  color: var(--border);
  font-size: 0.8rem;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 8px;
  text-transform: capitalize;
}

.status-badge.active {
  background: var(--primary-light);
  color: var(--primary);
}

.status-badge.cancelled {
  background: var(--destructive-light);
  color: var(--destructive);
}

.empty-state {
  color: var(--muted-fg);
  font-size: 0.9rem;
  text-align: center;
  padding: 40px;
  background: var(--card);
  border-radius: 12px;
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-state svg {
  color: var(--border-hover);
}

.empty-state p {
  margin: 0;
}

@media (max-width: 640px) {
  .profile-card { flex-wrap: wrap; padding: 16px; gap: 12px; }
  .profile-stat { flex-direction: row; gap: 8px; }
  .booking-meta { flex-direction: column; gap: 0; }
  .booking-divider { display: none; }
}
</style>
