import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import type { ActivePort } from '../../shared/types'

const execFileAsync = promisify(execFile)

const IGNORED_PORTS = new Set([
  135, 137, 138, 139, 445, 5040, 7680, 5357,
  49664, 49665, 49666, 49667, 49668, 49669, 49670
])

interface CachedProcess {
  processName: string
  executablePath?: string
  commandLine?: string
  projectDirName?: string
  scriptName?: string
  isSystem: boolean
}

const processCache = new Map<number, CachedProcess>()
const portFirstSeen = new Map<number, number>()

let pollTimer: ReturnType<typeof setInterval> | null = null
let currentPorts: ActivePort[] = []
let onPortsUpdated: ((ports: ActivePort[]) => void) | null = null

export function setPortsListener(fn: (ports: ActivePort[]) => void): void {
  onPortsUpdated = fn
}

export function getActivePorts(): ActivePort[] {
  return currentPorts
}

function checkIfSystem(name: string, exePath: string = ''): boolean {
  const lowerName = name.toLowerCase()
  const lowerPath = exePath.toLowerCase()

  // Strictly check for core Windows OS system services or OneDrive
  if (
    lowerPath.includes('\\windows\\') ||
    lowerPath.includes('\\system32\\') ||
    lowerPath.includes('\\syswow64\\') ||
    lowerPath.includes('onedrive') ||
    lowerName.includes('onedrive') ||
    lowerName.includes('svchost') ||
    lowerName.includes('lsass') ||
    lowerName.includes('spoolsv') ||
    lowerName.includes('services.exe') ||
    lowerName.includes('jhi_service') ||
    lowerName.includes('searchhost') ||
    lowerName.includes('explorer.exe')
  ) {
    return true
  }

  // Everything else is user/dev code
  return false
}

function parseProcessDetails(name: string, cmd: string = ''): { projectDirName?: string; scriptName?: string } {
  const lowerName = name.toLowerCase()
  if (lowerName.includes('onedrive')) return { scriptName: 'OneDrive Sync' }
  if (lowerName.includes('docker')) return { scriptName: 'Docker' }
  if (lowerName.includes('postgres')) return { scriptName: 'PostgreSQL' }
  if (lowerName.includes('mysql')) return { scriptName: 'MySQL' }
  if (lowerName.includes('redis')) return { scriptName: 'Redis' }
  if (lowerName.includes('svchost')) return { scriptName: 'Windows Service' }

  let projectDirName: string | undefined
  let scriptName: string | undefined

  // Match known frameworks or scripts
  if (cmd.includes('electron-vite')) {
    scriptName = 'electron-vite'
  } else if (cmd.includes('vite')) {
    scriptName = 'Vite'
  } else if (cmd.includes('next')) {
    scriptName = 'Next.js'
  } else if (cmd.includes('astro')) {
    scriptName = 'Astro'
  } else if (cmd.includes('remix')) {
    scriptName = 'Remix'
  } else {
    const scriptMatch = cmd.match(/([^\\/\s"']+\.(?:js|ts|jsx|tsx|py|go|rs|rb|php|java|mjs|cjs))/i)
    if (scriptMatch) {
      scriptName = scriptMatch[1]
    }
  }

  // Find project directory from path in commandLine
  const folderMatches = Array.from(cmd.matchAll(/([a-zA-Z]:\\[^"'\n\r]+)/g))
  for (const m of folderMatches) {
    const rawPath = m[1]
    const parts = rawPath.split(/[\\/]/).filter(Boolean)

    // In Node projects, the folder right before node_modules is the project root
    const nmIdx = parts.indexOf('node_modules')
    if (nmIdx > 0) {
      projectDirName = parts[nmIdx - 1]
      break
    }

    const filtered = parts.filter(
      (p) =>
        !['node_modules', '.bin', 'bin', 'dist', 'out', 'Program Files', 'nodejs', 'AppData', 'Local', 'Roaming', '..', '.'].includes(p)
    )
    if (filtered.length >= 2) {
      let candidate = filtered[filtered.length - 1]
      if (candidate.includes('.')) {
        candidate = filtered[filtered.length - 2]
      }
      if (candidate && candidate.length > 1) {
        projectDirName = candidate
        break
      }
    }
  }

  return { projectDirName, scriptName: scriptName || name }
}

async function resolveProcess(pid: number): Promise<CachedProcess> {
  const cached = processCache.get(pid)
  if (cached) return cached

  try {
    const psScript = `Get-CimInstance Win32_Process -Filter "ProcessId = ${pid}" | Select-Object Name, CommandLine, ExecutablePath | ConvertTo-Json -Compress`
    const { stdout } = await execFileAsync('powershell.exe', ['-NoProfile', '-Command', psScript], {
      windowsHide: true,
      timeout: 3000
    })

    if (stdout.trim()) {
      const data = JSON.parse(stdout.trim())
      const name = data.Name || `PID ${pid}`
      const commandLine = data.CommandLine || ''
      const executablePath = data.ExecutablePath || ''
      const { projectDirName, scriptName } = parseProcessDetails(name, commandLine)
      const isSystem = checkIfSystem(name, executablePath)

      const entry: CachedProcess = {
        processName: name,
        executablePath,
        commandLine,
        projectDirName,
        scriptName,
        isSystem
      }
      processCache.set(pid, entry)
      return entry
    }
  } catch {
    // Process might have exited or permission denied
  }

  // Default fallback is always non-system (user/dev)
  const fallback: CachedProcess = {
    processName: `PID ${pid}`,
    scriptName: `PID ${pid}`,
    isSystem: false
  }
  processCache.set(pid, fallback)
  return fallback
}

export async function scanPorts(): Promise<void> {
  try {
    const { stdout } = await execFileAsync('netstat.exe', ['-ano'], { windowsHide: true })
    const lines = stdout.split('\n')

    const foundPorts: Map<number, { port: number; pid: number; address: string }> = new Map()

    for (const rawLine of lines) {
      const line = rawLine.trim()
      if (!line.includes('LISTENING')) continue

      // Regex matches: TCP   127.0.0.1:3000   ...   LISTENING   1234
      const match = line.match(/^TCP\s+([\[\]a-fA-F0-9.:]+):(\d+)\s+.*\s+LISTENING\s+(\d+)$/i)
      if (!match) continue

      const address = match[1]
      const port = parseInt(match[2], 10)
      const pid = parseInt(match[3], 10)

      if (pid === 0 || pid === 4) continue
      if (IGNORED_PORTS.has(port)) continue
      if (port > 49152) continue

      if (!foundPorts.has(port)) {
        foundPorts.set(port, { port, pid, address })
      }
    }

    // Resolve process details for each active port
    const portList: ActivePort[] = []
    const now = Date.now()

    for (const [port, info] of foundPorts.entries()) {
      if (!portFirstSeen.has(port)) {
        portFirstSeen.set(port, now)
      }
      const firstSeen = portFirstSeen.get(port) || now

      const proc = await resolveProcess(info.pid)

      portList.push({
        port: info.port,
        pid: info.pid,
        localAddress: info.address,
        processName: proc.processName,
        executablePath: proc.executablePath,
        commandLine: proc.commandLine,
        projectDirName: proc.projectDirName,
        scriptName: proc.scriptName,
        isSystem: proc.isSystem,
        firstSeen
      })
    }

    // Clean up firstSeen for disappeared ports
    for (const p of portFirstSeen.keys()) {
      if (!foundPorts.has(p)) {
        portFirstSeen.delete(p)
      }
    }

    // Sort: user/dev ports first, then system ports, then by port ascending
    portList.sort((a, b) => {
      if (a.isSystem !== b.isSystem) {
        return a.isSystem ? 1 : -1
      }
      return a.port - b.port
    })

    currentPorts = portList
    if (onPortsUpdated) {
      onPortsUpdated(currentPorts)
    }
  } catch (err) {
    console.error('[portWatcher] Error scanning ports:', err)
  }
}

export function startPortWatcher(intervalMs = 2000): void {
  if (pollTimer) return

  scanPorts()
  pollTimer = setInterval(scanPorts, intervalMs)
  console.log(`[portWatcher] Background port scanner started (interval ${intervalMs}ms)`)
}

export function stopPortWatcher(): void {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

export async function killPort(pid: number): Promise<boolean> {
  const cached = processCache.get(pid)
  if (cached && cached.isSystem) {
    console.warn(`[portWatcher] Refused to kill system process: ${cached.processName} (PID ${pid})`)
    return false
  }

  try {
    await execFileAsync('taskkill.exe', ['/PID', String(pid), '/F', '/T'], { windowsHide: true })
    processCache.delete(pid)
    await scanPorts()
    return true
  } catch (err) {
    console.error(`[portWatcher] Failed to kill PID ${pid}:`, err)
    return false
  }
}
