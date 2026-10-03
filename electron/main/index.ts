import { app, ipcMain, shell, Notification } from 'electron'
import { join } from 'node:path'
import { createWindow, setInteractive, sendToRenderer } from './window'
import { startPortWatcher, stopPortWatcher, getActivePorts, killPort, setPortsListener } from './portWatcher'
import { createTray, updateTrayPorts, destroyTray, setTrayToggleShelfHandler } from './tray'

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    // When launched again (e.g. from Start Menu / Desktop shortcut), open the shelf!
    sendToRenderer('shelf:toggle', true)
    setInteractive(true)
  })
}

app.whenReady().then(() => {
  const win = createWindow()

  // Initialize System Tray toggle handler
  setTrayToggleShelfHandler((forceOpen) => {
    sendToRenderer('shelf:toggle', forceOpen)
    if (forceOpen) {
      setInteractive(true)
    }
  })

  // Initialize System Tray
  createTray()

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

  // Hook port updates to renderer and system tray
  setPortsListener((ports) => {
    sendToRenderer('ports:update', ports)
    updateTrayPorts(ports.length)
  })

  // Start the background Port Watcher (scans every 2 seconds)
  startPortWatcher(2000)

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
})

app.on('window-all-closed', () => {
  stopPortWatcher()
  destroyTray()
  app.quit()
})
