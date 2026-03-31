<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { COURTS, OPERATING_HOURS } from '../courts'
import { useTimeSlots, timeToMinutes, minutesToTime } from '../composables/useTimeSlots'
import { useBookingStore } from '../stores/bookings'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const bookingStore = useBookingStore()
const authStore = useAuthStore()
const { slots } = useTimeSlots()

// Steps: 1=date, 2=start time, 3=duration, 4=court, 5=confirm, 6=success
const step = ref(1)
const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedStartSlot = ref(null)
const selectedDuration = ref(null) // in minutes
const selectedCourt = ref(null)
const booking = ref(false)
const bookingError = ref('')

const DURATION_OPTIONS = [30, 60, 90, 120, 150, 180]

const dateOptions = computed(() => {
  const days = []
  const today = new Date()
  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const iso = d.toISOString().split('T')[0]
    days.push({
      date: iso,
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      num: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      isToday: i === 0
    })
  }
  return days
})

watch(selectedDate, (date) => {
  bookingStore.fetchByDate(date)
  selectedStartSlot.value = null
  selectedDuration.value = null
  selectedCourt.value = null
}, { immediate: true })

// Available start times (at least 1 court free)
const availableStartSlots = computed(() => {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  return slots.filter(slot => {
    if (selectedDate.value < today) return false
    if (selectedDate.value === today && timeToMinutes(slot.start) <= now.getHours() * 60 + now.getMinutes()) return false
    const bookedCount = COURTS.filter(c => bookingStore.getSlotBooking(c.id, slot.start)).length
    return bookedCount < COURTS.length
  })
})

// Available durations for selected start time (check if contiguous slots are free on at least 1 court)
const availableDurations = computed(() => {
  if (!selectedStartSlot.value) return []
  const startM = timeToMinutes(selectedStartSlot.value.start)
  const endOfDay = OPERATING_HOURS.end * 60

  return DURATION_OPTIONS.filter(dur => {
    const endM = startM + dur
    if (endM > endOfDay) return false

    // At least one court must be free for ALL 30-min slots in this range
    return COURTS.some(court => {
      for (let m = startM; m < endM; m += 30) {
        const t = minutesToTime(m)
        if (bookingStore.getSlotBooking(court.id, t)) return false
      }
      return true
    })
  })
})

// Available courts for selected start + duration
const availableCourts = computed(() => {
  if (!selectedStartSlot.value || !selectedDuration.value) return []
  const startM = timeToMinutes(selectedStartSlot.value.start)
  const endM = startM + selectedDuration.value

  return COURTS.filter(court => {
    for (let m = startM; m < endM; m += 30) {
      const t = minutesToTime(m)
      if (bookingStore.getSlotBooking(court.id, t)) return false
    }
    return true
  })
})

const endTime = computed(() => {
  if (!selectedStartSlot.value || !selectedDuration.value) return ''
  return minutesToTime(timeToMinutes(selectedStartSlot.value.start) + selectedDuration.value)
})

const durationLabel = computed(() => {
  if (!selectedDuration.value) return ''
  const h = Math.floor(selectedDuration.value / 60)
  const m = selectedDuration.value % 60
  if (h === 0) return `${m}m`
  return m > 0 ? `${h}h ${m}m` : `${h}h`
})

const timeRangeLabel = computed(() => {
  if (!selectedStartSlot.value || !endTime.value) return ''
  return `${selectedStartSlot.value.start} - ${endTime.value}`
})

const displayDate = computed(() => {
  const d = new Date(selectedDate.value + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
})

function formatDuration(mins) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m} min`
  return m > 0 ? `${h}h ${m}m` : `${h} hour${h > 1 ? 's' : ''}`
}

function selectDate(date) {
  selectedDate.value = date
  step.value = 2
}

function selectStart(slot) {
  selectedStartSlot.value = slot
  selectedDuration.value = null
  step.value = 3
}

function selectDuration(dur) {
  selectedDuration.value = dur
  step.value = 4
}

function selectCourt(court) {
  selectedCourt.value = court
  step.value = 5
}

function goBack() {
  if (step.value === 2) { step.value = 1 }
  else if (step.value === 3) { selectedStartSlot.value = null; step.value = 2 }
  else if (step.value === 4) { selectedDuration.value = null; step.value = 3 }
  else if (step.value === 5) { selectedCourt.value = null; step.value = 4 }
}

function reset() {
  step.value = 1
  selectedStartSlot.value = null
  selectedDuration.value = null
  selectedCourt.value = null
  bookingError.value = ''
}

async function confirmBooking() {
  if (!authStore.isAuthenticated) { router.push('/login'); return }
  booking.value = true
  bookingError.value = ''
  try {
    await bookingStore.createBooking({
      courtId: selectedCourt.value.id,
      userId: authStore.user.uid,
      userName: authStore.user.displayName,
      date: selectedDate.value,
      startTime: selectedStartSlot.value.start,
      endTime: endTime.value
    })
    step.value = 6
  } catch (e) {
    bookingError.value = e.message || 'Booking failed. Please try again.'
  } finally {
    booking.value = false
  }
}
</script>

<template>
  <div class="stepper-page">
    <router-link to="/timetable" class="timetable-link">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="3" y1="15" x2="21" y2="15"/>
        <line x1="9" y1="3" x2="9" y2="21"/>
        <line x1="15" y1="3" x2="15" y2="21"/>
      </svg>
      View Full Timetable
    </router-link>

    <div class="stepper-card">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${((Math.min(step, 5)) / 5) * 100}%` }"></div>
      </div>

      <div class="step-indicators" v-if="step <= 5">
        <div v-for="s in 5" :key="s" :class="['step-dot', { active: s === step, done: s < step }]">
          <svg v-if="s < step" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          <span v-else>{{ s }}</span>
        </div>
      </div>

      <button v-if="step > 1 && step <= 5" class="back-btn" @click="goBack" aria-label="Go back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Back
      </button>

      <!-- STEP 1: Date -->
      <div v-if="step === 1" class="step-content">
        <div class="step-header">
          <svg class="step-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <h2>Pick a Date</h2>
          <p class="step-desc">When do you want to play?</p>
        </div>
        <div class="date-grid">
          <button v-for="d in dateOptions" :key="d.date" :class="['date-card', { selected: selectedDate === d.date, today: d.isToday }]" @click="selectDate(d.date)">
            <span class="date-weekday">{{ d.day }}</span>
            <span class="date-num">{{ d.num }}</span>
            <span class="date-month">{{ d.month }}</span>
          </button>
        </div>
      </div>

      <!-- STEP 2: Start Time -->
      <div v-if="step === 2" class="step-content">
        <div class="step-header">
          <svg class="step-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <h2>Start Time</h2>
          <p class="step-desc">{{ displayDate }}</p>
        </div>
        <div v-if="bookingStore.loading" class="slots-loading">
          <div v-for="i in 6" :key="i" class="skeleton" style="height:48px"></div>
        </div>
        <div v-else-if="availableStartSlots.length" class="time-grid">
          <button v-for="slot in availableStartSlots" :key="slot.start" class="time-card" @click="selectStart(slot)">
            {{ slot.start }}
          </button>
        </div>
        <div v-else class="empty-step">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <p>No available slots for this date</p>
          <button class="btn btn-outline btn-sm" @click="step = 1">Pick another date</button>
        </div>
      </div>

      <!-- STEP 3: Duration -->
      <div v-if="step === 3" class="step-content">
        <div class="step-header">
          <svg class="step-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <h2>How Long?</h2>
          <p class="step-desc">Starting at {{ selectedStartSlot?.start }}</p>
        </div>
        <div class="duration-grid">
          <button v-for="dur in availableDurations" :key="dur" class="duration-card" @click="selectDuration(dur)">
            <span class="dur-value">{{ formatDuration(dur) }}</span>
            <span class="dur-range">{{ selectedStartSlot?.start }} - {{ minutesToTime(timeToMinutes(selectedStartSlot?.start) + dur) }}</span>
          </button>
        </div>
        <div v-if="!availableDurations.length" class="empty-step">
          <p>No durations available at this time</p>
          <button class="btn btn-outline btn-sm" @click="step = 2">Pick another time</button>
        </div>
      </div>

      <!-- STEP 4: Court -->
      <div v-if="step === 4" class="step-content">
        <div class="step-header">
          <svg class="step-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18"/><path d="M12 3v18"/></svg>
          <h2>Pick a Court</h2>
          <p class="step-desc">{{ timeRangeLabel }} &middot; {{ durationLabel }}</p>
        </div>
        <div class="court-grid">
          <button v-for="court in availableCourts" :key="court.id" class="court-card" @click="selectCourt(court)">
            <div class="court-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18"/><path d="M12 3v18"/></svg>
            </div>
            <span class="court-card-name">{{ court.name }}</span>
            <span class="court-card-surface">{{ court.surface }}</span>
          </button>
        </div>
      </div>

      <!-- STEP 5: Confirm -->
      <div v-if="step === 5" class="step-content">
        <div class="step-header">
          <svg class="step-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          <h2>Confirm Booking</h2>
          <p class="step-desc">Review your reservation</p>
        </div>
        <div class="confirm-details">
          <div class="confirm-row">
            <div class="confirm-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
            <div><span class="confirm-label">Date</span><span class="confirm-value">{{ displayDate }}</span></div>
          </div>
          <div class="confirm-row">
            <div class="confirm-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
            <div><span class="confirm-label">Time</span><span class="confirm-value">{{ timeRangeLabel }} <span class="dur-badge">{{ durationLabel }}</span></span></div>
          </div>
          <div class="confirm-row">
            <div class="confirm-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18"/><path d="M12 3v18"/></svg></div>
            <div><span class="confirm-label">Court</span><span class="confirm-value">{{ selectedCourt?.name }} <span class="surface-sm">{{ selectedCourt?.surface }}</span></span></div>
          </div>
        </div>
        <p v-if="bookingError" class="booking-error" role="alert">{{ bookingError }}</p>
        <button class="btn btn-primary btn-lg" @click="confirmBooking" :disabled="booking">
          <div v-if="booking" class="spinner spinner-sm"></div>
          {{ booking ? 'Booking...' : 'Confirm Booking' }}
        </button>
      </div>

      <!-- STEP 6: Success -->
      <div v-if="step === 6" class="step-content success-step">
        <div class="success-icon-wrapper">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2>Booked!</h2>
        <p class="step-desc">Your court is reserved</p>
        <div class="success-summary">
          <span>{{ displayDate }}</span>
          <span class="success-divider">&middot;</span>
          <span>{{ timeRangeLabel }}</span>
          <span class="success-divider">&middot;</span>
          <span>{{ selectedCourt?.name }}</span>
          <span class="dur-badge">{{ durationLabel }}</span>
        </div>
        <div class="success-actions">
          <button class="btn btn-primary" @click="reset">Book Another</button>
          <router-link to="/profile" class="btn btn-outline">My Bookings</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stepper-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100vh - 160px);
  padding-top: 20px;
}

.timetable-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-white);
  color: var(--muted-fg);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 16px;
  transition: all var(--transition-base);
}
.timetable-link:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
}

.stepper-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: var(--shadow);
  width: 100%;
  max-width: 520px;
  padding: 0;
  overflow: hidden;
}

.progress-bar { height: 4px; background: var(--border); }
.progress-fill { height: 100%; background: var(--primary); border-radius: 0 2px 2px 0; transition: width var(--transition-slow); }

.step-indicators { display: flex; justify-content: center; gap: 10px; padding: 20px 24px 0; }
.step-dot { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; border: 2px solid var(--border); color: var(--muted-fg); transition: all var(--transition-base); }
.step-dot.active { border-color: var(--primary); background: var(--primary); color: #fff; }
.step-dot.done { border-color: var(--primary); background: var(--primary-light); color: var(--primary); }

.back-btn { display: flex; align-items: center; gap: 4px; background: none; border: none; color: var(--muted-fg); font-size: 0.85rem; font-weight: 500; cursor: pointer; padding: 16px 24px 0; font-family: inherit; transition: color var(--transition-base); }
.back-btn:hover { color: var(--primary); }

.step-content { padding: 24px; }
.step-header { text-align: center; margin-bottom: 24px; }
.step-icon { color: var(--primary); margin-bottom: 8px; }
.step-header h2 { font-size: 1.25rem; font-weight: 700; margin: 0 0 4px; color: var(--fg); }
.step-desc { color: var(--muted-fg); font-size: 0.875rem; margin: 0; }

/* Date grid */
.date-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
.date-card { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 10px 4px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-white); cursor: pointer; transition: all var(--transition-base); font-family: inherit; min-height: 44px; }
.date-card:hover { border-color: var(--primary); background: var(--primary-light); }
.date-card.selected { border-color: var(--primary); background: var(--primary); color: #fff; }
.date-card.selected .date-weekday, .date-card.selected .date-month { color: rgba(255,255,255,0.8); }
.date-card.today { border-color: var(--primary); }
.date-weekday { font-size: 0.6rem; font-weight: 600; text-transform: uppercase; color: var(--muted-fg); letter-spacing: 0.03em; }
.date-num { font-size: 1.1rem; font-weight: 700; line-height: 1; }
.date-month { font-size: 0.6rem; font-weight: 500; color: var(--muted-fg); }

/* Time grid (start times) */
.time-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.time-card { padding: 12px 8px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-white); cursor: pointer; font-size: 0.9rem; font-weight: 700; color: var(--fg); font-family: inherit; transition: all var(--transition-base); min-height: 44px; text-align: center; }
.time-card:hover { border-color: var(--primary); background: var(--primary-light); color: var(--primary); }

.slots-loading { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }

/* Duration grid */
.duration-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.duration-card { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 16px 12px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-white); cursor: pointer; font-family: inherit; transition: all var(--transition-base); min-height: 44px; }
.duration-card:hover { border-color: var(--primary); background: var(--primary-light); }
.dur-value { font-size: 1rem; font-weight: 700; color: var(--fg); }
.duration-card:hover .dur-value { color: var(--primary); }
.dur-range { font-size: 0.75rem; font-weight: 500; color: var(--muted-fg); }

.dur-badge { display: inline-block; font-size: 0.65rem; font-weight: 700; color: var(--primary); background: var(--primary-light); padding: 2px 8px; border-radius: 6px; margin-left: 6px; vertical-align: middle; }

/* Court grid */
.court-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.court-card { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 20px 16px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-white); cursor: pointer; font-family: inherit; transition: all var(--transition-base); min-height: 44px; }
.court-card:hover { border-color: var(--primary); background: var(--primary-light); }
.court-card-icon { width: 44px; height: 44px; border-radius: 12px; background: var(--primary-light); display: flex; align-items: center; justify-content: center; color: var(--primary); }
.court-card-name { font-size: 0.95rem; font-weight: 700; }
.court-card-surface { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted-fg); }

/* Confirm */
.confirm-details { display: flex; flex-direction: column; gap: 16px; padding: 20px; background: var(--muted); border-radius: 14px; margin-bottom: 20px; }
.confirm-row { display: flex; align-items: center; gap: 12px; }
.confirm-icon { width: 38px; height: 38px; background: var(--bg-white); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--primary); flex-shrink: 0; }
.confirm-label { display: block; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted-fg); }
.confirm-value { font-size: 0.95rem; font-weight: 600; color: var(--fg); }
.surface-sm { font-size: 0.7rem; font-weight: 500; color: var(--muted-fg); text-transform: uppercase; }

.booking-error { color: var(--destructive); font-size: 0.85rem; margin: 0 0 16px; padding: 10px 16px; background: var(--destructive-light); border: 1px solid var(--destructive-border); border-radius: 8px; text-align: center; }
.btn-lg { width: 100%; padding: 14px 24px; font-size: 1rem; border-radius: 12px; }
.spinner-sm { width: 18px; height: 18px; border-width: 2px; }

/* Success */
.success-step { text-align: center; }
.success-icon-wrapper { width: 72px; height: 72px; background: var(--primary-light); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--primary); margin: 0 auto 16px; }
.success-summary { display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; padding: 16px; background: var(--muted); border-radius: 12px; margin: 20px 0 24px; font-size: 0.9rem; font-weight: 600; color: var(--fg); }
.success-divider { color: var(--border-hover); }
.success-actions { display: flex; gap: 10px; justify-content: center; }

/* Empty */
.empty-step { text-align: center; padding: 32px 0; display: flex; flex-direction: column; align-items: center; gap: 12px; color: var(--muted-fg); }
.empty-step svg { color: var(--border-hover); }
.empty-step p { margin: 0; font-size: 0.9rem; }

@media (max-width: 540px) {
  .stepper-card { border-radius: 16px; margin: 0 -8px; }
  .step-content { padding: 20px 16px; }
  .date-grid { grid-template-columns: repeat(7, 1fr); gap: 4px; }
  .date-card { padding: 8px 2px; }
  .date-num { font-size: 0.95rem; }
  .time-grid { grid-template-columns: repeat(3, 1fr); }
  .duration-grid { grid-template-columns: 1fr; }
  .court-grid { grid-template-columns: 1fr; }
}
</style>
