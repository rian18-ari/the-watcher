import { BrowserWindow, screen, powerMonitor, app } from 'electron'
import { join } from 'node:path'
import type { WatcherSettings } from '../../shared/types'
import { DEFAULT_SETTINGS } from '../../shared/types'

let koffi: any = null
try {
  koffi = require('koffi')
} catch (err) {
  console.warn('[window] Koffi native addon could not be loaded:', err)
}

export const PANEL_WIDTH = 420
export const HOT_ZONE_WIDTH = 4

let mainWindow: BrowserWindow | null = null
let interactive = false
let cursorPollTimer: ReturnType<typeof setInterval> | null = null
let windowSettings: WatcherSettings = { ...DEFAULT_SETTINGS }

let setWindowLongPtrFn: ((hWnd: number | bigint, nIndex: number, dwNewLong: number | bigint) => number | bigint) | null = null
let getWindowLongPtrFn: ((hWnd: number | bigint, nIndex: number) => number | bigint) | null = null
let SHQueryUserNotificationStateFn: ((pquns: number[]) => number) | null = null
let GetForegroundWindowFn: (() => number | bigint) | null = null
let GetWindowRectFn: ((hWnd: number | bigint, lpRect: any) => boolean) | null = null
let GetShellWindowFn: (() => number | bigint) | null = null

if (process.platform === 'win32' && koffi) {
  try {
    const shell32 = koffi.load('shell32.dll')
    SHQueryUserNotificationStateFn = shell32.func('int SHQueryUserNotificationState(_Out_ int *pquns)')
  } catch (err) {
    console.error('[window] Koffi load shell32 failed:', err)
  }

  try {
    const user32 = koffi.load('user32.dll')
    try {
      setWindowLongPtrFn = user32.func('intptr_t SetWindowLongPtrW(uintptr_t hWnd, int nIndex, intptr_t dwNewLong)')
    } catch {
      setWindowLongPtrFn = user32.func('intptr_t SetWindowLongW(uintptr_t hWnd, int nIndex, intptr_t dwNewLong)')
    }
    try {
      getWindowLongPtrFn = user32.func('intptr_t GetWindowLongPtrW(uintptr_t hWnd, int nIndex)')
    } catch {
      getWindowLongPtrFn = user32.func('intptr_t GetWindowLongW(uintptr_t hWnd, int nIndex)')
    }
    try {
      GetForegroundWindowFn = user32.func('uintptr_t GetForegroundWindow()')
      GetShellWindowFn = user32.func('uintptr_t GetShellWindow()')
      koffi.struct('RECT', { left: 'long', top: 'long', right: 'long', bottom: 'long' })
      GetWindowRectFn = user32.func('bool GetWindowRect(uintptr_t hWnd, _Out_ RECT *lpRect)')
    } catch {
      // Ignore
    }
  } catch (err) {
    console.error('[window] Koffi load user32 failed:', err)
  }
}

const GWL_EXSTYLE = -20
const WS_EX_NOACTIVATE = 0x08000000

function getHwnd(win: BrowserWindow | null): number | bigint {
  if (!win || win.isDestroyed()) return 0
  const buf = win.getNativeWindowHandle()
  return process.arch === 'x64' ? buf.readBigUInt64LE(0) : buf.readUInt32LE(0)
}

export function setWindowSettings(settings: WatcherSettings): void {
  windowSettings = { ...settings }
}

export function isForegroundFullscreen(): boolean {
  if (process.platform !== 'win32') return false

  // 1. Check via Windows Shell Notification State (DirectX, fullscreen games, presentations)
  if (SHQueryUserNotificationStateFn) {
    try {
      const state = [0]
      const hr = SHQueryUserNotificationStateFn(state)
      if (hr === 0) {
        // QUNS_BUSY = 2, QUNS_RUNNING_D3D_FULL_SCREEN = 3, QUNS_PRESENTATION_MODE = 4, QUNS_APP = 7
        if (state[0] === 2 || state[0] === 3 || state[0] === 4 || state[0] === 7) {
          return true
        }
      }
    } catch {
      // Fallback
    }
  }

  // 2. Check via GetForegroundWindow + GetWindowRect
  if (GetForegroundWindowFn && GetWindowRectFn) {
    try {
      const fgHwnd = GetForegroundWindowFn()
      if (!fgHwnd) return false

      const myHwnd = getHwnd(mainWindow)
      if (fgHwnd === myHwnd) return false

      if (GetShellWindowFn) {
        const shellHwnd = GetShellWindowFn()
        if (fgHwnd === shellHwnd) return false
      }

      const rect: any = {}
      if (GetWindowRectFn(fgHwnd, rect)) {
        const primary = screen.getPrimaryDisplay()
        const bounds = primary.bounds
        if (
          rect.left <= bounds.x &&
          rect.top <= bounds.y &&
          rect.right >= bounds.x + bounds.width &&
          rect.bottom >= bounds.y + bounds.height
        ) {
          return true
        }
      }
    } catch {
      // Ignore
    }
  }

  return false
}

export function applyNoActivateStyle(win: BrowserWindow | null): void {
  if (process.platform !== 'win32' || !win || win.isDestroyed() || !getWindowLongPtrFn || !setWindowLongPtrFn) return
  try {
    const hwnd = getHwnd(win)
    if (!hwnd) return
    const current = Number(getWindowLongPtrFn(hwnd, GWL_EXSTYLE))
    setWindowLongPtrFn(hwnd, GWL_EXSTYLE, current | WS_EX_NOACTIVATE)
  } catch (err) {
    console.error('[window] Failed applying WS_EX_NOACTIVATE:', err)
  }
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

export function sendToRenderer(channel: string, ...args: unknown[]): void {
  if (!mainWindow || mainWindow.isDestroyed()) return
  const wc = mainWindow.webContents
  if (wc.isDestroyed() || wc.isLoadingMainFrame()) return
  try {
    wc.send(channel, ...args)
  } catch {
    // Window frame may be unloading
  }
}

export function setInteractive(value: boolean): void {
  if (!mainWindow || mainWindow.isDestroyed()) return
  interactive = value

  if (!mainWindow.isVisible()) {
    mainWindow.show()
  }

  if (value) {
    mainWindow.setIgnoreMouseEvents(false)
    mainWindow.setAlwaysOnTop(true, 'screen-saver')
    applyNoActivateStyle(mainWindow)
  } else {
    mainWindow.setIgnoreMouseEvents(true, { forward: false })
    mainWindow.setAlwaysOnTop(true, 'screen-saver')
    applyNoActivateStyle(mainWindow)
  }
}

let lastNearState = false
let pollFast = false
const POLL_FAST_MS = 16
const POLL_SLOW_MS = 90

function pollCursor(): void {
  if (!mainWindow || mainWindow.isDestroyed() || !mainWindow.isVisible()) return

  // If user enabled disableOnFullscreen AND shelf is not currently open/interactive:
  if (windowSettings.disableOnFullscreen && !interactive) {
    if (isForegroundFullscreen()) {
      // Mute the hover trigger! Do not pop open during games or fullscreen videos
      if (lastNearState) {
        lastNearState = false
        sendToRenderer('window:cursor-edge', {
          near: false,
          x: 9999,
          y: 9999
        })
      }
      return
    }
  }

  const pt = screen.getCursorScreenPoint()
  const display = screen.getPrimaryDisplay()
  const wa = display.workArea

  // Check if cursor is on this display vertically
  const inVerticalBounds = pt.y >= wa.y && pt.y <= wa.y + wa.height
  const clientX = pt.x - wa.x
  const clientY = pt.y - wa.y

  // Trigger zone: leftmost HOT_ZONE_WIDTH px
  const isNear = inVerticalBounds && clientX <= HOT_ZONE_WIDTH && clientX >= 0

  if (isNear || interactive || clientX <= PANEL_WIDTH + 40) {
    if (!pollFast) {
      pollFast = true
      restartPollTimer(POLL_FAST_MS)
    }
  } else {
    if (pollFast) {
      pollFast = false
      restartPollTimer(powerMonitor.isOnBatteryPower() ? 120 : POLL_SLOW_MS)
    }
  }

  if (isNear !== lastNearState || interactive) {
    lastNearState = isNear
    sendToRenderer('window:cursor-edge', {
      near: isNear,
      x: clientX,
      y: clientY
    })
  }
}

function restartPollTimer(ms: number): void {
  if (cursorPollTimer) clearInterval(cursorPollTimer)
  cursorPollTimer = setInterval(pollCursor, ms)
}

export function createWindow(): BrowserWindow {
  const display = screen.getPrimaryDisplay()
  const wa = display.workArea

  mainWindow = new BrowserWindow({
    icon: join(app.getAppPath(), 'resources', 'icon.ico'),
    x: wa.x,
    y: wa.y,
    width: PANEL_WIDTH,
    height: wa.height,
    show: false,
    frame: false,
    fullscreenable: false,
    maximizable: false,
    movable: false,
    resizable: false,
    transparent: true,
    hasShadow: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    focusable: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  })

  mainWindow.setIgnoreMouseEvents(true, { forward: false })
  mainWindow.setAlwaysOnTop(true, 'screen-saver')
  applyNoActivateStyle(mainWindow)

  let shown = false
  const showWindow = (): void => {
    if (shown || !mainWindow || mainWindow.isDestroyed()) return
    shown = true
    mainWindow.show()
    restartPollTimer(POLL_FAST_MS)
  }

  mainWindow.once('ready-to-show', showWindow)
  // Ensure polling starts and window is displayed even if ready-to-show was missed
  setTimeout(showWindow, 400)

  return mainWindow
}
