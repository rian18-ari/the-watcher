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
