import { create } from 'zustand'
import type { ActivePort } from '../../shared/types'

interface PortStoreState {
  ports: ActivePort[]
  isOpen: boolean
  setPorts: (ports: ActivePort[]) => void
  setIsOpen: (isOpen: boolean) => void
  killPort: (pid: number) => Promise<boolean>
  openUrl: (url: string) => Promise<void>
}

export const usePortStore = create<PortStoreState>((set) => ({
  ports: [],
  isOpen: false,
  setPorts: (ports) => set({ ports }),
  setIsOpen: (isOpen) => {
    set({ isOpen })
    const bridge = window.watcher || window.edgemon
    if (bridge) {
      bridge.setInteractive(isOpen)
    }
  },
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
  }
}))
