<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { COURTS } from '../courts'
import { useTimeSlots, timeToMinutes } from '../composables/useTimeSlots'
import { useBookingStore } from '../stores/bookings'
import { useAuthStore } from '../stores/auth'
import DatePicker from '../components/DatePicker.vue'
import SlotCell from '../components/SlotCell.vue'
import BookingModal from '../components/BookingModal.vue'

const props = defineProps({
  courtId: { type: Number, required: true }
})

const router = useRouter()
const bookingStore = useBookingStore()
const authStore = useAuthStore()
const { slots } = useTimeSlots()

const selectedDate = ref(new Date().toISOString().split('T')[0])
const modal = ref(null)
const viewMode = ref('day')

const court = computed(() => COURTS.find(c => c.id === props.courtId))

const weekDays = computed(() => {
  const days = []
  const start = new Date(selectedDate.value + 'T00:00:00')
  const dayOfWeek = start.getDay()
  const monday = new Date(start)
  monday.setDate(start.getDate() - ((dayOfWeek + 6) % 7))
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    days.push({
      date: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
      isToday: d.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
    })
  }
  return days
})

watch([selectedDate, () => props.courtId], ([date]) => {
  bookingStore.fetchByCourtAndDate(props.courtId, date)
}, { immediate: true })

const visibleSlots = computed(() => {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  if (selectedDate.value !== today) return slots
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  return slots.filter(s => timeToMinutes(s.start) > currentMinutes)
})

function isPastSlot(time, date) {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const checkDate = date || selectedDate.value
  if (checkDate > today) return false
  if (checkDate < today) return true
  return parseInt(time) <= now.getHours()
}

function handleBook(slot) {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  modal.value = { startTime: slot.start, endTime: slot.end }
}

async function confirmBooking() {
  await bookingStore.createBooking({
    courtId: props.courtId,
    userId: authStore.user.uid,
    userName: authStore.user.displayName,
    date: selectedDate.value,
    startTime: modal.value.startTime,
    endTime: modal.value.endTime
  })
  modal.value = null
  await bookingStore.fetchByCourtAndDate(props.courtId, selectedDate.value)
}

async function handleCancel(bookingId) {
  if (confirm('Cancel this booking?')) {
    await bookingStore.cancelBooking(bookingId)
    await bookingStore.fetchByCourtAndDate(props.courtId, selectedDate.value)
  }
}
</script>

<template>
  <div class="court-view">
    <div class="court-header">
      <router-link to="/" class="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        All Courts
      </router-link>
      <div class="court-title-row">
        <h1>{{ court?.name }}</h1>
        <span class="surface-tag">{{ court?.surface }}</span>
      </div>
    </div>

    <div class="court-controls">
      <div class="view-toggle" role="tablist">
        <button
          :class="['toggle-btn', { active: viewMode === 'day' }]"
          @click="viewMode = 'day'"
          role="tab"
          :aria-selected="viewMode === 'day'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Day
        </button>
        <button
          :class="['toggle-btn', { active: viewMode === 'week' }]"
          @click="viewMode = 'week'"
          role="tab"
          :aria-selected="viewMode === 'week'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
            <line x1="9" y1="4" x2="9" y2="22"/>
          </svg>
          Week
        </button>
      </div>
      <DatePicker v-model="selectedDate" />
    </div>

    <!-- Day View -->
    <div v-if="viewMode === 'day'" class="day-grid-card">
      <div v-for="slot in visibleSlots" :key="slot.start" class="day-row">
        <div class="time-label">{{ slot.label }}</div>
        <SlotCell
          :booking="bookingStore.isSlotBooked(courtId, slot.start)"
          :current-user-id="authStore.user?.uid"
          :is-past="isPastSlot(slot.start)"
          @book="handleBook(slot)"
          @cancel="handleCancel"
        />
      </div>
    </div>

    <!-- Week View -->
    <div v-else class="week-grid-card">
      <div class="week-grid">
        <div class="week-header">
          <div class="time-col header-cell">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div
            v-for="day in weekDays"
            :key="day.date"
            :class="['day-col', 'header-cell', { today: day.isToday }]"
          >
            {{ day.label }}
          </div>
        </div>
        <div v-for="slot in slots" :key="slot.start" class="week-row">
          <div class="time-col">{{ slot.start }}</div>
          <div v-for="day in weekDays" :key="day.date" class="day-col">
            <div
              :class="['week-slot', { past: isPastSlot(slot.start, day.date) }]"
              @click="!isPastSlot(slot.start, day.date) && handleBook(slot)"
              role="button"
              :tabindex="isPastSlot(slot.start, day.date) ? -1 : 0"
              :aria-label="isPastSlot(slot.start, day.date) ? 'Past slot' : 'Available — click to book'"
            >
              {{ isPastSlot(slot.start, day.date) ? '' : 'Free' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <BookingModal
      v-if="modal"
      :court-id="courtId"
      :date="selectedDate"
      :start-time="modal.startTime"
      :end-time="modal.endTime"
      @confirm="confirmBooking"
      @close="modal = null"
    />
  </div>
</template>

<style scoped>
.court-header {
  margin-bottom: 20px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  color: var(--muted-fg);
  text-decoration: none;
  cursor: pointer;
  padding: 4px 0;
  transition: color var(--transition-base);
}

.back-link:hover {
  color: var(--primary);
}

.court-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.court-title-row h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--fg);
}

.surface-tag {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--muted-fg);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--muted);
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--border);
}

.court-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.view-toggle {
  display: flex;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  background: var(--bg-white);
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--muted-fg);
  font-family: inherit;
  min-height: 40px;
  transition: color var(--transition-base), background var(--transition-base);
}

.toggle-btn:hover:not(.active) {
  color: var(--fg);
  background: var(--muted);
}

.toggle-btn.active {
  background: var(--primary);
  color: #fff;
}

/* Day view */
.day-grid-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 520px;
  background: var(--card);
  border-radius: 12px;
  border: 1px solid var(--border);
  padding: 16px;
}

.day-row {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 12px;
  align-items: center;
}

.time-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--muted-fg);
  font-variant-numeric: tabular-nums;
}

/* Week view */
.week-grid-card {
  overflow-x: auto;
  background: var(--card);
  border-radius: 12px;
  border: 1px solid var(--border);
  padding: 16px;
}

.week-grid {
  min-width: 600px;
}

.week-header, .week-row {
  display: grid;
  grid-template-columns: 56px repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 4px;
}

.week-header {
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 8px;
}

.header-cell {
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--fg);
  padding: 6px 4px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.header-cell.today {
  color: var(--primary);
  background: var(--primary-light);
  border-radius: 6px;
}

.time-col {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--muted-fg);
  font-variant-numeric: tabular-nums;
}

.week-slot {
  padding: 6px;
  border-radius: 6px;
  text-align: center;
  font-size: 0.7rem;
  font-weight: 600;
  background: var(--primary-light);
  color: var(--primary);
  border: 1px solid #BBF7D0;
  cursor: pointer;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-fast), background var(--transition-base);
}

.week-slot.past {
  background: var(--muted);
  color: var(--border-hover);
  border-color: var(--border);
  cursor: default;
}

.week-slot:not(.past):hover {
  transform: translateY(-1px);
  background: #DCFCE7;
  border-color: var(--primary);
}
</style>
