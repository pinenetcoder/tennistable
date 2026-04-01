<script setup>
import { computed } from 'vue'
import { useI18n } from '../i18n'

const props = defineProps({
  booking: { type: Object, default: null },
  currentUserId: { type: String, default: null },
  isPast: { type: Boolean, default: false }
})
const emit = defineEmits(['book', 'cancel'])
const { t } = useI18n()

const status = computed(() => {
  if (!props.booking) return 'free'
  if (props.booking.user_id === props.currentUserId) return 'mine'
  return 'booked'
})

const label = computed(() => {
  if (status.value === 'free') return props.isPast ? '' : t('available')
  if (status.value === 'mine') return t('myBooking')
  return props.booking?.user_name || t('booked')
})

const ariaLabel = computed(() => {
  if (props.isPast) return t('pastTimeSlot')
  if (status.value === 'free') return t('availableClickToBook')
  if (status.value === 'mine') return t('yourBookingClickCancel')
  return `${t('bookedBy')} ${props.booking?.user_name || 'someone'}`
})

function handleClick() {
  if (props.isPast) return
  if (status.value === 'free') emit('book')
  if (status.value === 'mine') emit('cancel', props.booking.id)
}
</script>

<template>
  <div
    class="slot-cell"
    :class="[status, { past: isPast }]"
    @click="handleClick"
    :aria-label="ariaLabel"
    :role="(!isPast && status !== 'booked') ? 'button' : undefined"
    :tabindex="(!isPast && status !== 'booked') ? 0 : -1"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <svg v-if="status === 'free' && !isPast" class="slot-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
    <svg v-else-if="status === 'mine'" class="slot-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
    <svg v-else-if="status === 'booked'" class="slot-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
    <span class="slot-label">{{ label }}</span>
  </div>
</template>

<style scoped>
.slot-cell {
  padding: 8px 6px;
  border-radius: 8px;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.slot-cell:not(.past):not(.booked):hover {
  transform: translateY(-1px);
  box-shadow: 0 0 16px var(--primary-glow);
}

.slot-cell.free {
  background: var(--primary-light);
  color: var(--primary);
  border: 1px solid var(--primary-glow-md);
}

.slot-cell.free:hover {
  background: var(--primary-glow-md);
  border-color: var(--primary);
}

.slot-cell.booked {
  background: var(--destructive-light);
  color: var(--destructive);
  border: 1px solid var(--destructive-border);
  cursor: default;
}

.slot-cell.mine {
  background: var(--info-light);
  color: var(--info);
  border: 1px solid var(--info-border);
}

.slot-cell.mine:hover {
  background: rgba(107, 159, 232, 0.15);
  border-color: var(--info);
}

.slot-cell.past {
  background: rgba(255, 255, 255, 0.02);
  color: var(--muted-fg);
  border: 1px solid rgba(255, 255, 255, 0.04);
  cursor: default;
}

.slot-icon {
  flex-shrink: 0;
}

.slot-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
