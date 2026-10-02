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
    if (window.edgemon) {
      window.edgemon.setInteractive(isOpen)
    }
  },
  killPort: async (pid) => {
    if (window.edgemon) {
      return await window.edgemon.killPort(pid)
    }
    return false
  },
  openUrl: async (url) => {
    if (window.edgemon) {
      await window.edgemon.openUrl(url)
    }
  }
}))
