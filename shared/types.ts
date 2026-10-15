export interface ActivePort {
  port: number
  pid: number
  processName: string
  executablePath?: string
  commandLine?: string
  projectDirName?: string
  scriptName?: string
  firstSeen: number
  localAddress: string
  isSystem: boolean
}

export interface WatcherSettings {
  disableOnFullscreen: boolean
  dwellDelay: number
  showSystemProcesses: boolean
  scanInterval: number
  autoStartOnBoot: boolean
  notifyOnNewPort: boolean
}

export const DEFAULT_SETTINGS: WatcherSettings = {
  disableOnFullscreen: true,
  dwellDelay: 90,
  showSystemProcesses: true,
  scanInterval: 2000,
  autoStartOnBoot: false,
  notifyOnNewPort: false
}
