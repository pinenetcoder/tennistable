import { OPERATING_HOURS, SLOT_DURATION_MINUTES } from '../courts'

export function useTimeSlots() {
  const slots = []
  const totalMinutesStart = OPERATING_HOURS.start * 60
  const totalMinutesEnd = OPERATING_HOURS.end * 60

  for (let m = totalMinutesStart; m < totalMinutesEnd; m += SLOT_DURATION_MINUTES) {
    const h = Math.floor(m / 60)
    const min = m % 60
    const endM = m + SLOT_DURATION_MINUTES
    const endH = Math.floor(endM / 60)
    const endMin = endM % 60

    const start = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`
    const end = `${String(endH).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`
    slots.push({ start, end, label: `${start} - ${end}` })
  }
  return { slots }
}

export function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
