import { create } from 'zustand'

interface AppState {
  theme: 'light' | 'dark'
  setTheme: (t: 'light' | 'dark') => void
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
}))
