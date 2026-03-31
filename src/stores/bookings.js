import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../supabase/config'
import { timeToMinutes } from '../composables/useTimeSlots'

export const useBookingStore = defineStore('bookings', () => {
  const bookings = ref([])
  const userBookings = ref([])
  const loading = ref(false)

  async function fetchByDate(date) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('date', date)
        .eq('status', 'active')
      if (error) throw error
      bookings.value = data || []
    } finally {
      loading.value = false
    }
  }

  async function fetchByCourtAndDate(courtId, date) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('court_id', courtId)
        .eq('date', date)
        .eq('status', 'active')
      if (error) throw error
      bookings.value = data || []
    } finally {
      loading.value = false
    }
  }

  async function fetchByUser(userId) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
      if (error) throw error
      userBookings.value = data || []
    } finally {
      loading.value = false
    }
  }

  async function createBooking({ courtId, userId, userName, date, startTime, endTime }) {
    // Check for overlapping bookings
    const { data: existing } = await supabase
      .from('bookings')
      .select('id, start_time, end_time')
      .eq('court_id', courtId)
      .eq('date', date)
      .eq('status', 'active')

    const newStart = timeToMinutes(startTime)
    const newEnd = timeToMinutes(endTime)

    const overlap = (existing || []).some(b => {
      const bStart = timeToMinutes(b.start_time)
      const bEnd = timeToMinutes(b.end_time)
      return newStart < bEnd && newEnd > bStart
    })

    if (overlap) {
      throw new Error('This slot is already booked')
    }

    const { error } = await supabase
      .from('bookings')
      .insert({
        court_id: courtId,
        user_id: userId,
        user_name: userName,
        date,
        start_time: startTime,
        end_time: endTime,
        status: 'active'
      })
    if (error) throw error
  }

  async function cancelBooking(bookingId) {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
    if (error) throw error
  }

  // Check if a 30-min slot is covered by any booking for a given court
  function getSlotBooking(courtId, slotStart) {
    const slotM = timeToMinutes(slotStart)
    return bookings.value.find(b => {
      if (b.court_id !== courtId) return false
      const bStart = timeToMinutes(b.start_time)
      const bEnd = timeToMinutes(b.end_time)
      return slotM >= bStart && slotM < bEnd
    })
  }

  // Legacy alias
  function isSlotBooked(courtId, time) {
    return getSlotBooking(courtId, time)
  }

  return {
    bookings, userBookings, loading,
    fetchByDate, fetchByCourtAndDate, fetchByUser,
    createBooking, cancelBooking, isSlotBooked, getSlotBooking
  }
})
