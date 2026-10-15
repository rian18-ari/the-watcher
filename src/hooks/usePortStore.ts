import { create } from 'zustand'
import type { ActivePort, WatcherSettings } from '../../shared/types'
import { DEFAULT_SETTINGS } from '../../shared/types'

interface PortStoreState {
  ports: ActivePort[]
  isOpen: boolean
  currentView: 'services' | 'settings'
  settings: WatcherSettings
  setPorts: (ports: ActivePort[]) => void
  setIsOpen: (isOpen: boolean) => void
  setCurrentView: (view: 'services' | 'settings') => void
  killPort: (pid: number) => Promise<boolean>
  openUrl: (url: string) => Promise<void>
  loadSettings: () => Promise<void>
  updateSettings: (partial: Partial<WatcherSettings>) => Promise<void>
}

export const usePortStore = create<PortStoreState>((set) => ({
  ports: [],
  isOpen: false,
  currentView: 'services',
  settings: { ...DEFAULT_SETTINGS },

  setPorts: (ports) => set({ ports }),

  setIsOpen: (isOpen) => {
    set({ isOpen })
    const bridge = window.watcher || window.edgemon
    if (bridge) {
      bridge.setInteractive(isOpen)
    }
  },

  setCurrentView: (view) => set({ currentView: view }),

  killPort: async (pid) => {
    const bridge = window.watcher || window.edgemon
    if (bridge) {
      return await bridge.killPort(pid)
    }
    return false
  },

  openUrl: async (url) => {
    const bridge = window.watcher || window.edgemon
    if (bridge) {
      await bridge.openUrl(url)
    }
  },

  loadSettings: async () => {
    const bridge = window.watcher || window.edgemon
    if (bridge && bridge.getSettings) {
      try {
        const loaded = await bridge.getSettings()
        set({ settings: { ...DEFAULT_SETTINGS, ...loaded } })
      } catch (err) {
        console.error('[store] Failed loading settings:', err)
      }
    }
  },

  updateSettings: async (partial) => {
    set((state) => ({ settings: { ...state.settings, ...partial } }))
    const bridge = window.watcher || window.edgemon
    if (bridge && bridge.saveSettings) {
      try {
        const saved = await bridge.saveSettings(partial)
        set({ settings: { ...DEFAULT_SETTINGS, ...saved } })
      } catch (err) {
        console.error('[store] Failed saving settings:', err)
      }
    }
  }
}))
