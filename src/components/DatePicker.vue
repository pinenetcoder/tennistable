<script setup>
import { computed } from 'vue'
import { useI18n } from '../i18n'

const props = defineProps({
  modelValue: { type: String, required: true }
})
const emit = defineEmits(['update:modelValue'])

const { t, dateLocale } = useI18n()

const displayDate = computed(() => {
  const d = new Date(props.modelValue + 'T00:00:00')
  return d.toLocaleDateString(dateLocale.value, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
})

const isToday = computed(() => {
  return props.modelValue === new Date().toISOString().split('T')[0]
})

function shift(days) {
  const d = new Date(props.modelValue + 'T00:00:00')
  d.setDate(d.getDate() + days)
  emit('update:modelValue', d.toISOString().split('T')[0])
}

function goToday() {
  emit('update:modelValue', new Date().toISOString().split('T')[0])
}
</script>

<template>
  <div class="date-picker">
    <button class="dp-btn" @click="shift(-1)" :aria-label="t('previousDay')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>
    <div class="dp-center">
      <span class="dp-date">{{ displayDate }}</span>
      <button v-if="!isToday" class="dp-today" @click="goToday">{{ t('today') }}</button>
    </div>
    <button class="dp-btn" @click="shift(1)" :aria-label="t('nextDay')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.date-picker {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dp-btn {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border);
  background: var(--glass-bg);
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted-fg);
  transition: all var(--transition-base);
}

.dp-btn:hover {
  color: var(--primary);
  border-color: var(--border-hover);
  background: var(--primary-light);
}

.dp-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.dp-date {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--fg);
}

.dp-today {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: inherit;
  transition: background var(--transition-base);
}

.dp-today:hover {
  background: var(--primary-light);
}

@media (max-width: 640px) {
  .date-picker { gap: 8px; width: 100%; }
  .dp-btn { width: 44px; height: 44px; flex-shrink: 0; }
  .dp-center { flex: 1; min-width: 0; }
  .dp-date { font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
  .dp-today { font-size: 0.7rem; min-height: 28px; padding: 4px 12px; }
}
</style>
