import { create } from 'zustand'

interface SettingsState {
  animalhubPath: string | null
  loading: boolean
  fetchAnimalHubPath: () => Promise<void>
  setAnimalHubPath: (path: string) => Promise<void>
  clearAnimalHubPath: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  animalhubPath: null,
  loading: false,

  fetchAnimalHubPath: async () => {
    set({ loading: true })
    const path = await window.api.getSetting('animalhub_path')
    set({ animalhubPath: path, loading: false })
  },

  setAnimalHubPath: async (path: string) => {
    await window.api.setSetting('animalhub_path', path)
    set({ animalhubPath: path })
  },

  clearAnimalHubPath: async () => {
    await window.api.deleteSetting('animalhub_path')
    set({ animalhubPath: null })
  }
}))
