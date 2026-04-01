import { ref, watch } from 'vue'

const STORAGE_KEY = 'app-theme'
const stored = localStorage.getItem(STORAGE_KEY)
const theme = ref(stored || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'))

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t)
}

applyTheme(theme.value)

watch(theme, (val) => {
  localStorage.setItem(STORAGE_KEY, val)
  applyTheme(val)
})

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return { theme, toggleTheme }
}
