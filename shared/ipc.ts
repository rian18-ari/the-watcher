import type { ActivePort } from './types'

export interface WatcherBridge {
  loadState: () => Promise<{ ports: ActivePort[] }>
  killPort: (pid: number) => Promise<boolean>
  openUrl: (url: string) => Promise<void>
  setInteractive: (interactive: boolean) => Promise<void>
  onPortsUpdate: (callback: (ports: ActivePort[]) => void) => () => void
  onCursorEdge: (callback: (edge: { near: boolean; x: number; y: number }) => void) => () => void
}

export type EdgemonBridge = WatcherBridge

declare global {
  interface Window {
    watcher?: WatcherBridge
    edgemon?: WatcherBridge
  }
}
