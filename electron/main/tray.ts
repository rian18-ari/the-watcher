import { Tray, Menu, app, nativeImage } from 'electron'
import type { NativeImage } from 'electron'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

let tray: Tray | null = null
let lastPortCount = 0
let toggleShelfHandler: ((forceOpen?: boolean) => void) | null = null

export function setTrayToggleShelfHandler(handler: (forceOpen?: boolean) => void): void {
  toggleShelfHandler = handler
}

function getTrayIcon(): NativeImage {
  const candidates = [
    join(app.getAppPath(), 'resources', 'tray.png'),
    join(app.getAppPath(), 'resources', 'icon.ico'),
    join(process.resourcesPath, 'resources', 'tray.png'),
    join(process.resourcesPath, 'resources', 'icon.ico'),
    join(__dirname, '../../resources/tray.png'),
    join(__dirname, '../../resources/icon.ico')
  ]

  for (const p of candidates) {
    if (existsSync(p)) {
      const img = nativeImage.createFromPath(p)
      if (!img.isEmpty()) return img
    }
  }

  return nativeImage.createEmpty()
}

export function createTray(): Tray {
  if (tray) return tray

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

  return tray
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

function rebuildMenu(): void {
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
        app.setLoginItemSettings({
          openAtLogin: nextState,
          path: process.execPath,
          args: ['--hidden']
        })
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
