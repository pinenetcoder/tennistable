<script setup>
import { ref } from 'vue'
import { COURTS } from '../courts'

const props = defineProps({
  courtId: { type: Number, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true }
})
const emit = defineEmits(['confirm', 'close'])

const loading = ref(false)
const error = ref('')

const courtName = COURTS.find(c => c.id === props.courtId)?.name || `Court ${props.courtId}`

const displayDate = new Date(props.date + 'T00:00:00').toLocaleDateString('en-US', {
  weekday: 'short', month: 'long', day: 'numeric'
})

async function confirm() {
  loading.value = true
  error.value = ''
  try {
    await emit('confirm')
  } catch (e) {
    error.value = e.message || 'Booking failed. Please try again.'
  } finally {
    loading.value = false
  }
}

function handleKeydown(e) {
  if (e.key === 'Escape') emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('close')" @keydown="handleKeydown" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-card">
        <div class="modal-header">
          <h2 id="modal-title">Confirm Booking</h2>
          <button class="modal-close" @click="emit('close')" aria-label="Close dialog">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-details">
          <div class="detail-row">
            <div class="detail-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18"/>
              </svg>
            </div>
            <div>
              <span class="detail-label">Court</span>
              <span class="detail-value">{{ courtName }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <span class="detail-label">Date</span>
              <span class="detail-value">{{ displayDate }}</span>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <span class="detail-label">Time</span>
              <span class="detail-value">{{ startTime }} - {{ endTime }}</span>
            </div>
          </div>
        </div>

        <p v-if="error" class="modal-error" role="alert">{{ error }}</p>

        <div class="modal-actions">
          <button class="btn btn-outline" @click="emit('close')" :disabled="loading">Cancel</button>
          <button class="btn btn-primary" @click="confirm" :disabled="loading">
            <div v-if="loading" class="spinner spinner-sm"></div>
            {{ loading ? 'Booking...' : 'Confirm Booking' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal-backdrop);
  padding: 16px;
}

.modal-card {
  background: var(--card);
  border-radius: 16px;
  padding: 28px;
  max-width: 420px;
  width: 100%;
  box-shadow: var(--shadow-lg);
  z-index: var(--z-modal);
  border: 1px solid var(--border);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.modal-header h2 {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  color: var(--fg);
}

.modal-close {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted-fg);
  transition: color var(--transition-base), background var(--transition-base);
}

.modal-close:hover {
  color: var(--fg);
  background: var(--muted);
}

.modal-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: var(--muted);
  border-radius: 12px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-icon {
  width: 36px;
  height: 36px;
  background: var(--bg-white);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  flex-shrink: 0;
}

.detail-label {
  display: block;
  color: var(--muted-fg);
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.detail-value {
  font-weight: 600;
  color: var(--fg);
  font-size: 0.9rem;
}

.modal-error {
  color: var(--destructive);
  font-size: 0.85rem;
  margin: 0 0 16px;
  padding: 10px 16px;
  background: var(--destructive-light);
  border: 1px solid var(--destructive-border);
  border-radius: 8px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border-width: 2px;
}
</style>
