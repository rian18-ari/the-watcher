import { contextBridge, ipcRenderer } from 'electron'
import type { IpcRendererEvent } from 'electron'
import type { EdgemonBridge } from '../../shared/ipc'
import type { ActivePort } from '../../shared/types'

const bridge: EdgemonBridge = {
  loadState: () => ipcRenderer.invoke('state:load'),
  killPort: (pid: number) => ipcRenderer.invoke('port:kill', pid),
  openUrl: (url: string) => ipcRenderer.invoke('url:open', url),
  setInteractive: (interactive: boolean) => ipcRenderer.invoke('window:set-interactive', interactive),
  onPortsUpdate: (callback: (ports: ActivePort[]) => void) => {
    const listener = (_event: IpcRendererEvent, ports: ActivePort[]) => callback(ports)
    ipcRenderer.on('ports:update', listener)
    return () => {
      ipcRenderer.off('ports:update', listener)
    }
  },
  onCursorEdge: (callback: (edge: { near: boolean; x: number; y: number }) => void) => {
    const listener = (_event: IpcRendererEvent, edge: { near: boolean; x: number; y: number }) => callback(edge)
    ipcRenderer.on('window:cursor-edge', listener)
    return () => {
      ipcRenderer.off('window:cursor-edge', listener)
    }
  }
}

contextBridge.exposeInMainWorld('edgemon', bridge)
