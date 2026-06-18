import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user:    null,
  loading: true,   // true tills Supabase svarar

  setUser:    (user)    => set({ user, loading: false }),
  setLoading: (loading) => set({ loading }),
}))
