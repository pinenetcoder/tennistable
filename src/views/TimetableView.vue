<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { COURTS } from '../courts'
import { useTimeSlots, timeToMinutes } from '../composables/useTimeSlots'
import { useBookingStore } from '../stores/bookings'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const bookingStore = useBookingStore()
const authStore = useAuthStore()
const { slots } = useTimeSlots()

const selectedDate = ref(new Date().toISOString().split('T')[0])

const selection = ref(null)
const hoverIndex = ref(null)
const hoverCourtId = ref(null)
const booking = ref(false)
const bookingError = ref('')
const bookingSuccess = ref(false)

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
      isToday: i === 0
    })
  }
  return days
})

watch(selectedDate, (date) => {
  bookingStore.fetchByDate(date)
  clearSelection()
}, { immediate: true })

function isPastSlot(slotStart) {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  if (selectedDate.value > today) return false
  if (selectedDate.value < today) return true
  return timeToMinutes(slotStart) <= now.getHours() * 60 + now.getMinutes()
}

const visibleSlots = computed(() => {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  if (selectedDate.value !== today) return slots.map((s, i) => ({ ...s, originalIndex: i }))
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  return slots
    .map((s, i) => ({ ...s, originalIndex: i }))
    .filter(s => timeToMinutes(s.start) > currentMinutes)
})

function clearSelection() {
  selection.value = null
  bookingError.value = ''
  bookingSuccess.value = false
}

function handleSlotClick(courtId, slotIndex) {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  const slot = slots[slotIndex]
  if (isPastSlot(slot.start)) return
  if (bookingStore.getSlotBooking(courtId, slot.start)) return

  if (!selection.value || selection.value.courtId !== courtId) {
    selection.value = { courtId, startSlotIndex: slotIndex, endSlotIndex: slotIndex }
  } else {
    const start = Math.min(selection.value.startSlotIndex, slotIndex)
    const end = Math.max(selection.value.startSlotIndex, slotIndex)
    let allFree = true
    for (let i = start; i <= end; i++) {
      if (isPastSlot(slots[i].start) || bookingStore.getSlotBooking(courtId, slots[i].start)) {
        allFree = false
        break
      }
    }
    if (allFree) {
      selection.value = { courtId, startSlotIndex: start, endSlotIndex: end }
    }
  }
}

function handleSlotHover(courtId, slotIndex) {
  hoverCourtId.value = courtId
  hoverIndex.value = slotIndex
}

function handleTableLeave() {
  hoverCourtId.value = null
  hoverIndex.value = null
}

function isPreview(courtId, slotIndex) {
  if (!selection.value || hoverIndex.value === null) return false
  if (selection.value.courtId !== courtId || hoverCourtId.value !== courtId) return false
  // Only show preview when selection is a single slot (first click done, waiting for second)
  if (selection.value.startSlotIndex !== selection.value.endSlotIndex) return false
  const anchor = selection.value.startSlotIndex
  const hover = hoverIndex.value
  if (hover === anchor) return false
  const start = Math.min(anchor, hover)
  const end = Math.max(anchor, hover)
  if (slotIndex < start || slotIndex > end) return false
  // Check all slots in range are free
  for (let i = start; i <= end; i++) {
    if (isPastSlot(slots[i].start) || bookingStore.getSlotBooking(courtId, slots[i].start)) return false
  }
  return true
}

function isSelected(courtId, slotIndex) {
  if (!selection.value) return false
  return selection.value.courtId === courtId && slotIndex >= selection.value.startSlotIndex && slotIndex <= selection.value.endSlotIndex
}

function isSelStart(courtId, slotIndex) {
  return selection.value?.courtId === courtId && selection.value?.startSlotIndex === slotIndex
}

function isSelEnd(courtId, slotIndex) {
  return selection.value?.courtId === courtId && selection.value?.endSlotIndex === slotIndex
}

function isBookingStart(courtId, slotStart) {
  const b = bookingStore.getSlotBooking(courtId, slotStart)
  return b && b.start_time === slotStart
}

function cellClass(courtId, idx, slotStart) {
  const cls = ['cell']
  if (isPastSlot(slotStart)) {
    cls.push('past')
  } else if (isSelected(courtId, idx)) {
    cls.push('selected')
    if (isSelStart(courtId, idx)) cls.push('sel-start')
    if (isSelEnd(courtId, idx)) cls.push('sel-end')
  } else if (isPreview(courtId, idx)) {
    cls.push('preview')
  } else {
    const b = bookingStore.getSlotBooking(courtId, slotStart)
    if (b) {
      cls.push('booked')
      if (b.user_id === authStore.user?.uid) cls.push('mine')
    } else {
      cls.push('free')
    }
  }
  return cls
}

const previewEndIndex = computed(() => {
  if (!selection.value || hoverIndex.value === null || hoverCourtId.value !== selection.value.courtId) return null
  if (selection.value.startSlotIndex !== selection.value.endSlotIndex) return null
  const anchor = selection.value.startSlotIndex
  const hover = hoverIndex.value
  if (hover <= anchor) return null
  const start = anchor
  const end = hover
  for (let i = start; i <= end; i++) {
    if (isPastSlot(slots[i].start) || bookingStore.getSlotBooking(selection.value.courtId, slots[i].start)) return null
  }
  return end
})

const selectionSummary = computed(() => {
  if (!selection.value) return null
  const court = COURTS.find(c => c.id === selection.value.courtId)
  const startSlot = slots[selection.value.startSlotIndex]
  const effectiveEndIndex = previewEndIndex.value ?? selection.value.endSlotIndex
  const endSlot = slots[effectiveEndIndex]
  const count = effectiveEndIndex - selection.value.startSlotIndex + 1
  const mins = count * 30
  const h = Math.floor(mins / 60)
  const m = mins % 60
  const dur = h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`
  return { court, startTime: startSlot.start, endTime: endSlot.end, durationLabel: dur }
})

const displayDate = computed(() => {
  const d = new Date(selectedDate.value + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })
})

async function confirmBooking() {
  if (!selectionSummary.value) return
  booking.value = true
  bookingError.value = ''
  try {
    await bookingStore.createBooking({
      courtId: selection.value.courtId,
      userId: authStore.user.uid,
      userName: authStore.user.displayName,
      date: selectedDate.value,
      startTime: selectionSummary.value.startTime,
      endTime: selectionSummary.value.endTime
    })
    bookingSuccess.value = true
    await bookingStore.fetchByDate(selectedDate.value)
    setTimeout(() => clearSelection(), 2000)
  } catch (e) {
    bookingError.value = e.message || 'Booking failed'
  } finally {
    booking.value = false
  }
}
</script>

<template>
  <div class="timetable">
    <!-- Top bar -->
    <div class="timetable-top">
      <div class="top-left">
        <router-link to="/" class="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Quick Book
        </router-link>
        <h1>Timetable</h1>
      </div>
      <p class="top-hint">Click a slot to start, click another below to extend</p>
    </div>

    <!-- Date strip -->
    <div class="date-strip">
      <button
        v-for="d in dateOptions"
        :key="d.date"
        :class="['date-chip', { active: selectedDate === d.date, today: d.isToday }]"
        @click="selectedDate = d.date"
      >
        <span class="dc-day">{{ d.day }}</span>
        <span class="dc-num">{{ d.num }}</span>
      </button>
    </div>

    <!-- Grid -->
    <div class="grid-scroll">
      <table class="grid-table" v-if="!bookingStore.loading" @mouseleave="handleTableLeave">
        <thead>
          <tr>
            <th class="time-th">Time</th>
            <th v-for="court in COURTS" :key="court.id" class="court-th">
              <div class="court-th-name">{{ court.name }}</div>
              <div class="court-th-surface">{{ court.surface }}</div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="slot in visibleSlots" :key="slot.start" :class="{ 'hour-border': slot.start.endsWith(':00') }">
            <td class="time-td">
              <span v-if="slot.start.endsWith(':00')" class="time-full">{{ slot.start }}</span>
              <span v-else class="time-half">{{ slot.start }}</span>
            </td>
            <td
              v-for="court in COURTS"
              :key="court.id"
              :class="cellClass(court.id, slot.originalIndex, slot.start)"
              @click="handleSlotClick(court.id, slot.originalIndex)"
              @mouseenter="handleSlotHover(court.id, slot.originalIndex)"
            >
              <template v-if="isSelected(court.id, slot.originalIndex)">
                <span class="cell-label sel-label">
                  <template v-if="isSelStart(court.id, slot.originalIndex) && isSelEnd(court.id, slot.originalIndex)">
                    {{ selectionSummary?.durationLabel }}
                  </template>
                  <template v-else-if="isSelStart(court.id, slot.originalIndex)">
                    {{ selectionSummary?.startTime }}
                  </template>
                  <template v-else-if="isSelEnd(court.id, slot.originalIndex)">
                    {{ selectionSummary?.endTime }}
                  </template>
                </span>
              </template>
              <template v-else-if="bookingStore.getSlotBooking(court.id, slot.start)">
                <span :class="['cell-label', bookingStore.getSlotBooking(court.id, slot.start)?.user_id === authStore.user?.uid ? 'mine-label' : 'booked-label']">
                  {{ isBookingStart(court.id, slot.start) ? bookingStore.getSlotBooking(court.id, slot.start).user_name : '' }}
                </span>
              </template>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="grid-skeleton">
        <div v-for="i in 12" :key="i" class="skeleton" style="height:36px"></div>
      </div>
    </div>

    <!-- Selection panel -->
    <Transition name="panel">
      <div v-if="selection && !bookingSuccess" class="booking-panel">
        <div class="panel-info">
          <div class="panel-court">{{ selectionSummary?.court?.name }}</div>
          <div class="panel-time">{{ displayDate }} &middot; {{ selectionSummary?.startTime }} - {{ selectionSummary?.endTime }}</div>
          <span class="panel-duration">{{ selectionSummary?.durationLabel }}</span>
        </div>
        <p v-if="bookingError" class="panel-error">{{ bookingError }}</p>
        <div class="panel-actions">
          <button class="btn btn-outline btn-sm" @click="clearSelection">Cancel</button>
          <button class="btn btn-primary btn-sm" @click="confirmBooking" :disabled="booking">
            <div v-if="booking" class="spinner spinner-sm"></div>
            {{ booking ? 'Booking...' : 'Book Now' }}
          </button>
        </div>
      </div>
    </Transition>

    <Transition name="panel">
      <div v-if="bookingSuccess" class="success-toast">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        Booked!
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.timetable { position: relative; }

.timetable-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.top-left h1 { font-size: 1.5rem; font-weight: 700; margin: 4px 0 0; color: var(--fg); }

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: var(--muted-fg);
  text-decoration: none;
  cursor: pointer;
  transition: color var(--transition-base);
}
.back-link:hover { color: var(--primary); }

.top-hint { font-size: 0.8rem; color: var(--muted-fg); margin: 0; padding-top: 24px; }

/* Date strip */
.date-strip {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 16px;
  scrollbar-width: none;
}
.date-strip::-webkit-scrollbar { display: none; }

.date-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-white);
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  min-width: 52px;
  transition: all var(--transition-base);
}
.date-chip:hover { border-color: var(--primary); background: var(--primary-light); }
.date-chip.active { border-color: var(--primary); background: var(--primary); color: #fff; }
.date-chip.active .dc-day { color: rgba(255,255,255,0.7); }
.date-chip.today:not(.active) { border-color: var(--primary); }
.dc-day { font-size: 0.65rem; font-weight: 600; text-transform: uppercase; color: var(--muted-fg); }
.dc-num { font-size: 1rem; font-weight: 700; line-height: 1; }

/* Grid */
.grid-scroll {
  overflow-x: auto;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  margin-bottom: 80px;
}

.grid-table {
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
  table-layout: fixed;
}

.grid-table th, .grid-table td { border: 1px solid var(--border); padding: 0; }

.time-th {
  width: 64px;
  padding: 10px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--muted-fg);
  text-align: center;
  background: var(--muted);
  position: sticky;
  left: 0;
  z-index: 2;
}

.court-th {
  padding: 10px 8px;
  text-align: center;
  background: var(--muted);
}
.court-th-name { font-size: 0.85rem; font-weight: 700; color: var(--fg); }
.court-th-surface { font-size: 0.6rem; font-weight: 600; color: var(--muted-fg); text-transform: uppercase; letter-spacing: 0.04em; }

.time-td {
  padding: 0 6px;
  text-align: center;
  background: var(--muted);
  position: sticky;
  left: 0;
  z-index: 2;
}
.time-full { font-size: 0.75rem; font-weight: 700; color: var(--fg); }
.time-half { font-size: 0.65rem; font-weight: 500; color: var(--border-hover); }
.hour-border td { border-top: 2px solid var(--border-hover); }

/* Cells */
.cell {
  height: 34px;
  cursor: pointer;
  transition: background var(--transition-fast);
  position: relative;
}
.cell.free:hover { background: var(--primary-light); }
.cell.past { background: var(--muted); cursor: default; }
.cell.booked { background: #FEE2E2; cursor: default; }
.cell.booked.mine { background: #DBEAFE; }
.cell.preview { background: var(--primary); opacity: 0.5; cursor: pointer; }
.cell.selected { background: var(--primary); }

.cell-label {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 0.6rem;
  font-weight: 600;
  padding: 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sel-label { color: #fff; }
.booked-label { color: #991B1B; }
.mine-label { color: #1E40AF; }

/* Skeleton */
.grid-skeleton { display: flex; flex-direction: column; gap: 4px; padding: 16px; }

/* Booking panel */
.booking-panel {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: var(--z-modal);
  max-width: 560px;
  width: calc(100% - 32px);
}
.panel-info { flex: 1; min-width: 0; }
.panel-court { font-weight: 700; font-size: 0.9rem; color: var(--fg); }
.panel-time { font-size: 0.8rem; color: var(--muted-fg); margin-top: 2px; }
.panel-duration {
  display: inline-block;
  margin-top: 4px;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--primary);
  background: var(--primary-light);
  padding: 2px 8px;
  border-radius: 6px;
}
.panel-error { color: var(--destructive); font-size: 0.8rem; margin: 0; }
.panel-actions { display: flex; gap: 8px; flex-shrink: 0; }
.spinner-sm { width: 16px; height: 16px; border-width: 2px; }

/* Success toast */
.success-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary);
  color: #fff;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: var(--shadow-lg);
  z-index: var(--z-modal);
}

/* Panel animation */
.panel-enter-active { transition: opacity 200ms ease, transform 200ms ease; }
.panel-leave-active { transition: opacity 150ms ease, transform 150ms ease; }
.panel-enter-from, .panel-leave-to { opacity: 0; transform: translateX(-50%) translateY(16px); }

@media (max-width: 640px) {
  .booking-panel { flex-direction: column; align-items: stretch; gap: 12px; }
  .panel-actions { justify-content: flex-end; }
}
</style>
