import type { ActivePort } from './types'

export interface EdgemonBridge {
  loadState: () => Promise<{ ports: ActivePort[] }>
  killPort: (pid: number) => Promise<boolean>
  openUrl: (url: string) => Promise<void>
  setInteractive: (interactive: boolean) => Promise<void>
  onPortsUpdate: (callback: (ports: ActivePort[]) => void) => () => void
  onCursorEdge: (callback: (edge: { near: boolean; x: number; y: number }) => void) => () => void
}

declare global {
  interface Window {
    edgemon: EdgemonBridge
  }
}
