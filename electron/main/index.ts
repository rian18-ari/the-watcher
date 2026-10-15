import { app, ipcMain, shell, Notification } from 'electron'
import { join } from 'node:path'
import { appendFileSync } from 'node:fs'
import { createWindow, getMainWindow, setInteractive, sendToRenderer, setWindowSettings } from './window'
import { startPortWatcher, stopPortWatcher, restartPortWatcher, getActivePorts, killPort, setPortsListener } from './portWatcher'
import { createTray, updateTrayPorts, destroyTray, setTrayToggleShelfHandler, setTrayNavigateHandler, rebuildMenu } from './tray'
import { initSettings, getSettings, saveSettings, onSettingsChanged } from './settings'

process.on('uncaughtException', (err) => {
  try {
    const logPath = join(app.getPath('userData'), 'crash.log')
    appendFileSync(logPath, `[${new Date().toISOString()}] Uncaught Exception: ${err.stack || err}\n`)
  } catch {}
  console.error('[fatal] Uncaught Exception:', err)
})

process.on('unhandledRejection', (reason) => {
  try {
    const logPath = join(app.getPath('userData'), 'crash.log')
    appendFileSync(logPath, `[${new Date().toISOString()}] Unhandled Rejection: ${reason}\n`)
  } catch {}
  console.error('[fatal] Unhandled Rejection:', reason)
})

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    // When launched again (e.g. from Start Menu / Desktop shortcut), open the shelf!
    const win = getMainWindow()
    if (win && !win.isDestroyed()) {
      if (win.isMinimized()) win.restore()
      if (!win.isVisible()) win.show()
      win.setAlwaysOnTop(true, 'screen-saver')
    }
    sendToRenderer('shelf:toggle', true)
    setInteractive(true)
  })
}

let knownPorts = new Set<number>()

app.whenReady().then(() => {
  // Initialize settings
  const settings = initSettings()
  setWindowSettings(settings)

  const win = createWindow()

  // Initialize System Tray toggle handler
  setTrayToggleShelfHandler((forceOpen) => {
    sendToRenderer('shelf:toggle', forceOpen)
    if (forceOpen) {
      setInteractive(true)
    }
  })

  // Initialize System Tray navigate handler
  setTrayNavigateHandler((view) => {
    sendToRenderer('app:navigate', view)
  })

  // Initialize System Tray
  createTray()

  // Listen for settings change
  onSettingsChanged((updated) => {
    setWindowSettings(updated)
    restartPortWatcher(updated.scanInterval)
    rebuildMenu()
  })

  // Show a helpful desktop notification on first start
  try {
    if (Notification.isSupported()) {
      const notif = new Notification({
        title: 'The Watcher is active 🟢',
        body: 'Running in the background. Move your mouse to the left screen edge to open.'
      })
      notif.on('click', () => {
        sendToRenderer('shelf:toggle', true)
        setInteractive(true)
      })
      notif.show()
    }
  } catch (err) {
    console.error('[notif] Failed to show start notification:', err)
  }

  // Load the renderer UI
  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Hook port updates to renderer, system tray, and optional notification
  setPortsListener((ports) => {
    sendToRenderer('ports:update', ports)
    updateTrayPorts(ports.length)

    const currentSettings = getSettings()
    if (currentSettings.notifyOnNewPort && Notification.isSupported()) {
      for (const p of ports) {
        if (!p.isSystem && !knownPorts.has(p.port)) {
          const notif = new Notification({
            title: `Port :${p.port} Listening 🟢`,
            body: `${p.projectDirName || p.scriptName || p.processName} started on port ${p.port}`
          })
          notif.on('click', () => {
            sendToRenderer('shelf:toggle', true)
            setInteractive(true)
          })
          notif.show()
        }
      }
    }

    knownPorts = new Set(ports.map((p) => p.port))
  })

  // Start the background Port Watcher
  startPortWatcher(settings.scanInterval)

  // Setup IPC Handlers
  ipcMain.handle('state:load', () => {
    return { ports: getActivePorts() }
  })

  ipcMain.handle('port:kill', async (_event, pid: number) => {
    return await killPort(pid)
  })

  ipcMain.handle('url:open', async (_event, url: string) => {
    await shell.openExternal(url)
  })

  ipcMain.handle('window:set-interactive', (_event, interactive: boolean) => {
    setInteractive(interactive)
  })

  ipcMain.handle('settings:get', () => {
    return getSettings()
  })

  ipcMain.handle('settings:save', (_event, partial) => {
    return saveSettings(partial)
  })
})

app.on('window-all-closed', () => {
  stopPortWatcher()
  destroyTray()
  app.quit()
})
