import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../supabase/config'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)
  let initPromise = null

  const isAuthenticated = computed(() => !!user.value)

  function init() {
    if (!initPromise) {
      initPromise = _doInit()
    }
    return initPromise
  }

  async function _doInit() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      setUser(session.user)
    }
    loading.value = false

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        user.value = null
      }
    })
  }

  function setUser(supaUser) {
    user.value = {
      uid: supaUser.id,
      displayName: supaUser.user_metadata?.full_name || supaUser.email,
      email: supaUser.email,
      photoURL: supaUser.user_metadata?.avatar_url || null
    }
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) throw error
  }

  async function signUpWithEmail(email, password, firstName, lastName) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`,
          first_name: firstName,
          last_name: lastName
        }
      }
    })
    if (error) throw error
  }

  async function signInWithEmail(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function logOut() {
    await supabase.auth.signOut()
    user.value = null
  }

  return { user, loading, isAuthenticated, init, signInWithGoogle, signUpWithEmail, signInWithEmail, logOut }
})
