import { Tray, Menu, app, nativeImage } from 'electron'
import type { NativeImage } from 'electron'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { saveSettings } from './settings'

let tray: Tray | null = null
let lastPortCount = 0
let toggleShelfHandler: ((forceOpen?: boolean) => void) | null = null
let navigateHandler: ((view: 'services' | 'settings') => void) | null = null

export function setTrayToggleShelfHandler(handler: (forceOpen?: boolean) => void): void {
  toggleShelfHandler = handler
}

export function setTrayNavigateHandler(handler: (view: 'services' | 'settings') => void): void {
  navigateHandler = handler
}

function getTrayIcon(): NativeImage {
  const isWin = process.platform === 'win32'
  const candidates = isWin
    ? [
        join(app.getAppPath(), 'resources', 'icon.ico'),
        join(process.resourcesPath, 'resources', 'icon.ico'),
        join(__dirname, '../../resources/icon.ico'),
        join(app.getAppPath(), 'resources', 'icon.png'),
        join(process.resourcesPath, 'resources', 'icon.png'),
        join(__dirname, '../../resources/icon.png'),
        join(app.getAppPath(), 'resources', 'tray.png'),
        join(process.resourcesPath, 'resources', 'tray.png'),
        join(__dirname, '../../resources/tray.png')
      ]
    : [
        join(app.getAppPath(), 'resources', 'tray.png'),
        join(process.resourcesPath, 'resources', 'tray.png'),
        join(__dirname, '../../resources/tray.png'),
        join(app.getAppPath(), 'resources', 'icon.png'),
        join(process.resourcesPath, 'resources', 'icon.png'),
        join(__dirname, '../../resources/icon.png')
      ]

  for (const p of candidates) {
    if (existsSync(p)) {
      const img = nativeImage.createFromPath(p)
      if (!img.isEmpty()) {
        console.log('[tray] Loaded tray icon from:', p)
        return img
      }
    }
  }

  console.warn('[tray] No suitable icon file found, falling back to empty image')
  return nativeImage.createEmpty()
}

export function createTray(): Tray | null {
  if (tray) return tray

  try {
    const icon = getTrayIcon()
    tray = new Tray(icon)
    try {
      tray.setToolTip('The Watcher')
    } catch {
      // Ignore
    }

    tray.on('click', () => {
      if (toggleShelfHandler) toggleShelfHandler()
    })

    tray.on('double-click', () => {
      if (toggleShelfHandler) toggleShelfHandler(true)
    })

    rebuildMenu()
    console.log('[tray] System tray successfully created')
    return tray
  } catch (err) {
    console.error('[tray] Failed to create system tray:', err)
    return null
  }
}

export function updateTrayPorts(count: number): void {
  lastPortCount = count
  if (!tray || tray.isDestroyed()) return

  const tooltip = count > 0 ? `The Watcher: ${count} active port${count > 1 ? 's' : ''}` : 'The Watcher'
  try {
    tray.setToolTip(tooltip)
  } catch {
    // Ignore
  }
  rebuildMenu()
}

export function rebuildMenu(): void {
  if (!tray || tray.isDestroyed()) return

  const loginSettings = app.getLoginItemSettings()
  const isAutoStart = loginSettings.openAtLogin

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'The Watcher • Port Monitor',
      enabled: false
    },
    {
      label: '👉 Open Shelf',
      click: () => {
        if (toggleShelfHandler) toggleShelfHandler(true)
        if (navigateHandler) navigateHandler('services')
      }
    },
    {
      label: '⚙️ Settings',
      click: () => {
        if (toggleShelfHandler) toggleShelfHandler(true)
        if (navigateHandler) navigateHandler('settings')
      }
    },
    {
      label: lastPortCount > 0 ? `🟢 ${lastPortCount} active port${lastPortCount > 1 ? 's' : ''}` : '⚪ No active ports',
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Start on Windows Boot',
      type: 'checkbox',
      checked: isAutoStart,
      click: () => {
        const nextState = !isAutoStart
        saveSettings({ autoStartOnBoot: nextState })
        rebuildMenu()
      }
    },
    { type: 'separator' },
    {
      label: 'Quit The Watcher',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy()
    tray = null
  }
}
